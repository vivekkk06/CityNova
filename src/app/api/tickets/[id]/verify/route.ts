import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, disputeReason, disputePhotoUrl, citizenName } = body;

    const ticket = await prisma.ticket.findFirst({
      where: { OR: [{ id }, { caseId: id }] },
      include: { ward: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Civic ticket not found' }, { status: 404 });
    }

    const now = new Date();
    const actor = citizenName || ticket.citizenName || 'Resident Citizen';

    if (action === 'VERIFY') {
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'RESOLVED',
          escalatedToSupervisor: false,
        },
      });

      await prisma.auditLog.create({
        data: {
          ticketId: ticket.id,
          sourceLabel: 'Citizen Verified',
          action: 'CLOSED',
          actorName: actor,
          actorRole: 'Citizen Resident',
          details: 'Citizen inspected the location, verified resolution quality, and signed off. Permanently closed into the transparency ledger.',
          timestamp: now,
        },
      });

      return NextResponse.json({
        success: true,
        ticket: updatedTicket,
        message: 'Resolution confirmed and verified. Ticket permanently closed.',
      });
    }

    if (action === 'DISPUTE') {
      if (!disputeReason || disputeReason.trim().length === 0) {
        return NextResponse.json(
          { error: 'A clear explanation is required to dispute a resolution.' },
          { status: 400 }
        );
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'DISPUTED',
          escalatedToSupervisor: true,
          disputeReason: disputeReason.trim(),
          disputePhotoUrl: disputePhotoUrl || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          ticketId: ticket.id,
          sourceLabel: 'Citizen Disputed',
          action: 'DISPUTED',
          actorName: actor,
          actorRole: 'Citizen Resident',
          details: `Resolution rejected by citizen: "${disputeReason.trim()}". High-priority escalation dispatched to Zonal Supervisor (${ticket.ward.officerName}).`,
          timestamp: now,
        },
      });

      return NextResponse.json({
        success: true,
        ticket: updatedTicket,
        message: 'Dispute recorded. Case has been escalated to Zonal Supervisor.',
      });
    }

    return NextResponse.json({ error: 'Invalid verification action. Use VERIFY or DISPUTE.' }, { status: 400 });
  } catch (error) {
    console.error('Error verifying ticket:', error);
    return NextResponse.json({ error: 'Failed to process citizen verification' }, { status: 500 });
  }
}
