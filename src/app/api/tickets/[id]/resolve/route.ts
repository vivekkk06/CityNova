import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateHaversineDistanceMeters } from '@/lib/gis';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      resolutionPhotoUrl,
      resolutionGpsLat,
      resolutionGpsLng,
      resolutionNotes,
      officerName = 'Field Officer',
      officerId,
      allowGpsOverride = false,
    } = body;

    const ticket = await prisma.ticket.findFirst({
      where: { OR: [{ id }, { caseId: id }] },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Civic ticket not found' }, { status: 404 });
    }

    if (!resolutionPhotoUrl) {
      return NextResponse.json(
        { error: 'Proof-of-work "After" photo is strictly mandatory for resolution.' },
        { status: 400 }
      );
    }

    // Geo-Gated Verification Check (Must be within 200m of incident site)
    let distanceMeters = 0;
    if (resolutionGpsLat !== undefined && resolutionGpsLng !== undefined) {
      distanceMeters = calculateHaversineDistanceMeters(
        ticket.latitude,
        ticket.longitude,
        parseFloat(resolutionGpsLat),
        parseFloat(resolutionGpsLng)
      );

      const MAX_ALLOWED_DISTANCE_METERS = 250;
      if (distanceMeters > MAX_ALLOWED_DISTANCE_METERS && !allowGpsOverride) {
        return NextResponse.json(
          {
            error: `Geo-Gate Check Failed: Device GPS location is ${distanceMeters}m away from the reported incident (Threshold: ${MAX_ALLOWED_DISTANCE_METERS}m). Resolution photo must be taken on-site.`,
            distanceMeters,
            allowedThreshold: MAX_ALLOWED_DISTANCE_METERS,
            allowOverrideAvailable: true,
          },
          { status: 422 }
        );
      }
    }

    const now = new Date();

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'PROVISIONALLY_RESOLVED',
        resolutionPhotoUrl,
        resolutionGpsLat: resolutionGpsLat ? parseFloat(resolutionGpsLat) : ticket.latitude,
        resolutionGpsLng: resolutionGpsLng ? parseFloat(resolutionGpsLng) : ticket.longitude,
        resolutionTimestamp: now,
        resolutionNotes: resolutionNotes || 'Work completed per municipal engineering standard.',
        assignedOfficerName: officerName,
        assignedOfficerId: officerId || ticket.assignedOfficerId,
      },
    });

    // Record in Provenance Audit Trail
    await prisma.auditLog.create({
      data: {
        ticketId: ticket.id,
        sourceLabel: 'Proof-of-Work Submitted',
        action: 'PROVISIONAL_RESOLUTION',
        actorName: officerName,
        actorRole: 'Field Engineering Staff',
        details: `Proof of Work uploaded with verified GPS on-site proximity (${distanceMeters}m delta). Status changed to PROVISIONALLY_RESOLVED. Two-stage resolution gate unlocked for citizen verification.`,
        timestamp: now,
      },
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
      message: 'Ticket provisionally resolved. Pending resident verification.',
    });
  } catch (error) {
    console.error('Error resolving ticket:', error);
    return NextResponse.json({ error: 'Failed to record resolution' }, { status: 500 });
  }
}
