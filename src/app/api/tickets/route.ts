import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  detectWardForCoordinates,
  findDuplicateTicketsNearby,
  generateCaseId,
  generateLegacyGrievanceNumber,
} from '@/lib/gis';
import { calculateSlaDeadline } from '@/lib/sla';
import { sanitizeTicketForPublic } from '@/lib/privacy';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wardId = searchParams.get('wardId');
    const departmentId = searchParams.get('departmentId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const isPublic = searchParams.get('isPublic') !== 'false';

    const whereClause: Record<string, unknown> = {};
    if (wardId && wardId !== 'all') whereClause.wardId = wardId;
    if (departmentId && departmentId !== 'all') whereClause.departmentId = departmentId;
    if (category && category !== 'all') whereClause.category = category;
    if (status && status !== 'all') whereClause.status = status;

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        ward: true,
        department: true,
        _count: {
          select: {
            observations: true,
            auditLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const processedTickets = isPublic
      ? tickets.map((t) => sanitizeTicketForPublic(t))
      : tickets;

    return NextResponse.json({ success: true, tickets: processedTickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      category,
      urgency = 'MEDIUM',
      plainLanguageRights,
      latitude,
      longitude,
      addressDescription,
      citizenName,
      citizenPhone,
      initialPhotoUrl,
      initialAudioUrl,
      bypassDuplicates = false,
      checkDuplicatesOnly = false,
    } = body;

    if (!title || !category || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Title, category, and valid geographic coordinates are required.' },
        { status: 400 }
      );
    }

    // 1. Spatial Deduplication Check (within 50 meters)
    const nearbyDuplicates = await findDuplicateTicketsNearby(latitude, longitude, category, 50);

    if (checkDuplicatesOnly) {
      return NextResponse.json({
        success: true,
        duplicatesFound: nearbyDuplicates.length > 0,
        duplicates: nearbyDuplicates.map((d) => sanitizeTicketForPublic(d)),
      });
    }

    if (nearbyDuplicates.length > 0 && !bypassDuplicates) {
      return NextResponse.json({
        success: false,
        duplicateWarning: true,
        message: `A similar active civic issue was discovered within 50 meters of this location.`,
        duplicates: nearbyDuplicates.map((d) => sanitizeTicketForPublic(d)),
      });
    }

    // 2. Automated GIS Municipal Routing (Ward & Department Detection)
    const ward = await detectWardForCoordinates(latitude, longitude);

    let department = await prisma.department.findFirst({
      where: {
        OR: [
          { name: { contains: category } },
          { description: { contains: category } },
        ],
      },
    });

    if (!department) {
      // Map category to department
      let deptCode = 'PUBLIC_WORKS';
      if (category.includes('Garbage') || category.includes('Waste')) deptCode = 'SANITATION';
      if (category.includes('Water') || category.includes('Pipe')) deptCode = 'WATER_SUPPLY';
      if (category.includes('Streetlight') || category.includes('Light')) deptCode = 'STREET_LIGHTING';

      department = await prisma.department.findUnique({
        where: { code: deptCode },
      });
    }

    if (!department) {
      department = (await prisma.department.findFirst())!;
    }

    // 3. Generate Unique Identifiers & SLA Deadlines
    const caseId = generateCaseId(ward.code);
    const legacyGrievanceNumber = generateLegacyGrievanceNumber(department.code);
    const now = new Date();
    const slaDeadline = calculateSlaDeadline(
      now,
      department.slaHoursNormal,
      department.slaHoursUrgent,
      urgency
    );

    // 4. Create Ticket Record
    const newTicket = await prisma.ticket.create({
      data: {
        caseId,
        legacyGrievanceNumber,
        title,
        description: description || title,
        category,
        urgency,
        plainLanguageRights:
          plainLanguageRights ||
          'Under the Municipal Citizen Charter, all grievances are logged with an immutable public SLA commitment.',
        status: 'OPEN',
        latitude: parseFloat(latitude.toString()),
        longitude: parseFloat(longitude.toString()),
        addressDescription: addressDescription || `${ward.name}, ${ward.zone}`,
        wardId: ward.id,
        departmentId: department.id,
        citizenName: citizenName || 'Civic Citizen',
        citizenPhone: citizenPhone || '+91-98000-00000',
        publicCommitmentDate: now,
        slaDeadline,
        initialPhotoUrl,
        initialAudioUrl,
        upvoteCount: 1,
      },
      include: {
        ward: true,
        department: true,
      },
    });

    // 5. Append Immutable Provenance Audit Trail (The Promise-to-Proof Ledger)
    await prisma.auditLog.createMany({
      data: [
        {
          ticketId: newTicket.id,
          sourceLabel: 'Resident Input',
          action: 'TICKET_CREATED',
          actorName: citizenName || 'Resident',
          actorRole: 'Citizen Resident',
          details: `Grievance registered at [Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}]. Initial media assets secured.`,
          timestamp: now,
        },
        {
          ticketId: newTicket.id,
          sourceLabel: 'AI Structured',
          action: 'AI_ANALYSIS_COMPLETED',
          actorName: 'CityNova AI Vision & NLP',
          actorRole: 'Governance Engine',
          details: `Structured as ${category} (${urgency} urgency). Statutory citizen charter entitlement attached.`,
          timestamp: new Date(now.getTime() + 1000),
        },
        {
          ticketId: newTicket.id,
          sourceLabel: 'Official Update',
          action: 'WARD_ROUTED',
          actorName: 'Central GIS Dispatch',
          actorRole: 'Automated Routing',
          details: `Geofenced to ${ward.name} (${ward.zone}). Assigned to ${department.name} with SLA deadline set to ${slaDeadline.toLocaleDateString()} ${slaDeadline.toLocaleTimeString()}.`,
          timestamp: new Date(now.getTime() + 2000),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      ticket: sanitizeTicketForPublic(newTicket),
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
