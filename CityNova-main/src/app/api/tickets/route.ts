import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { findDuplicateTicketsNearby, generateCaseId } from '@/lib/gis';
import { calculateSlaDeadline } from '@/lib/sla';
import { sanitizeTicketForPublic } from '@/lib/privacy';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session?.user.cityId || !session.user.city) return NextResponse.json({ error: 'Please sign in to view city reports.' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const whereClause: Prisma.TicketWhereInput = session.user.city.normalizedKey === 'ponda,goa,india'
      ? { OR: [{ cityId: session.user.cityId }, { cityId: null }] }
      : { cityId: session.user.cityId };
    if (category && category !== 'all') whereClause.category = category;
    if (status && status !== 'all') whereClause.status = status;

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        city: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const processedTickets = tickets.map((t) => sanitizeTicketForPublic(t));

    return NextResponse.json({ success: true, tickets: processedTickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session?.user.cityId || !session.user.city) return NextResponse.json({ error: 'Please sign in to submit a report.' }, { status: 401 });
    const body = await req.json();
    const {
      title,
      description,
      category,
      urgency = 'MEDIUM',
      latitude,
      longitude,
      addressDescription,
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
    const nearbyDuplicates = await findDuplicateTicketsNearby(latitude, longitude, category, 50, session.user.cityId);

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

    // Generate a city-independent case ID and generic estimate; no city authority data is assumed.
    const caseId = generateCaseId();
    const now = new Date();
    const slaDeadline = calculateSlaDeadline(now, 72, 24, urgency);

    // 4. Create Ticket Record
    const newTicket = await prisma.ticket.create({
      data: {
        caseId,
        title,
        description: description || title,
        category,
        urgency,
        plainLanguageRights: 'Status updates are provided by the CityNova reporting workflow.',
        status: 'OPEN',
        latitude: parseFloat(latitude.toString()),
        longitude: parseFloat(longitude.toString()),
        addressDescription: addressDescription || session.user.city.name,
        cityId: session.user.cityId,
        reporterId: session.user.id,
        citizenName: session.user.name,
        citizenPhone: session.user.phone || '',
        publicCommitmentDate: now,
        slaDeadline,
        initialPhotoUrl,
        initialAudioUrl,
      },
      include: {
        city: true,
      },
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
