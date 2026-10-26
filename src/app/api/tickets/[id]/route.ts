import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeTicketForPublic } from '@/lib/privacy';
import { findCivicMemoryNearby } from '@/lib/gis';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const isPublic = searchParams.get('isPublic') !== 'false';

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id }, { caseId: id }],
      },
      include: {
        ward: true,
        department: true,
        observations: {
          orderBy: { createdAt: 'desc' },
        },
        auditLogs: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Civic ticket not found' }, { status: 404 });
    }

    // Civic Memory: find past fixes within 150m
    const civicMemory = await findCivicMemoryNearby(ticket.latitude, ticket.longitude, 150);
    // Filter out current ticket if it matches
    const pastNearbyFixes = civicMemory.filter((m) => m.id !== ticket.id);

    const processedTicket = isPublic ? sanitizeTicketForPublic(ticket) : ticket;

    return NextResponse.json({
      success: true,
      ticket: processedTicket,
      civicMemory: pastNearbyFixes.map((m) => sanitizeTicketForPublic(m)),
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, assignedOfficerName, assignedOfficerId, adminNotes, actorName = 'Municipal Officer' } = body;

    const ticket = await prisma.ticket.findFirst({
      where: { OR: [{ id }, { caseId: id }] },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Civic ticket not found' }, { status: 404 });
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (status) dataToUpdate.status = status;
    if (assignedOfficerName) dataToUpdate.assignedOfficerName = assignedOfficerName;
    if (assignedOfficerId) dataToUpdate.assignedOfficerId = assignedOfficerId;

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: dataToUpdate,
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        ticketId: ticket.id,
        sourceLabel: 'Official Update',
        action: status === 'IN_PROGRESS' ? 'WORK_STARTED' : 'OFFICIAL_STATUS_UPDATE',
        actorName,
        actorRole: 'Municipal Administrator',
        details: adminNotes || `Status updated to ${status || ticket.status}. Officer assigned: ${assignedOfficerName || ticket.assignedOfficerName || 'Not assigned'}.`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

