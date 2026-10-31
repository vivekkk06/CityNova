import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(req);
    if (!session?.user.cityId || !session.user.city) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { action, disputeReason } = body;

    const ticket = await prisma.ticket.findFirst({
      where: {
        AND: [
          { OR: [{ id }, { caseId: id }] },
          session.user.city.normalizedKey === 'ponda,goa,india'
            ? { OR: [{ cityId: session.user.cityId }, { cityId: null }] }
            : { cityId: session.user.cityId },
        ],
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Civic ticket not found' }, { status: 404 });
    }

    if (ticket.reporterId !== session.user.id) {
      return NextResponse.json({ error: 'Only the account that reported this complaint can update its resolution review.' }, { status: 403 });
    }

    if (action === 'VERIFY') {
      if (ticket.status !== 'PROVISIONALLY_RESOLVED') {
        return NextResponse.json({ error: 'Only complaints awaiting citizen sign-off can be closed.' }, { status: 409 });
      }
      const [updatedTicket] = await prisma.$transaction([
        prisma.ticket.update({ where: { id: ticket.id }, data: { status: 'CLOSED' } }),
        prisma.ticketStatusHistory.create({
          data: {
            ticketId: ticket.id,
            actorId: session.user.id,
            actorRole: session.user.role,
            actorName: session.user.username ? `@${session.user.username}` : 'Citizen',
            status: 'CLOSED',
            comment: 'Citizen signed off after reviewing the repair proof.',
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        ticket: updatedTicket,
        message: 'Resolution signed off. Complaint closed.',
      });
    }

    if (action === 'DISPUTE') {
      if (ticket.status !== 'PROVISIONALLY_RESOLVED') {
        return NextResponse.json({ error: 'Only complaints awaiting citizen sign-off can be escalated.' }, { status: 409 });
      }
      if (!disputeReason || disputeReason.trim().length === 0) {
        return NextResponse.json(
          { error: 'A clear explanation is required to dispute a resolution.' },
          { status: 400 }
        );
      }

      const previousResolutionPhoto = ticket.resolutionPhotoUrl;
      const [updatedTicket] = await prisma.$transaction([
        prisma.ticket.update({
          where: { id: ticket.id },
          data: {
          status: 'IN_PROGRESS',
          disputeReason: disputeReason.trim(),
          disputePhotoUrl: null,
          resolutionPhotoUrl: null,
          resolutionGpsLat: null,
          resolutionGpsLng: null,
          resolutionTimestamp: null,
          resolutionNotes: null,
          },
        }),
        prisma.ticketStatusHistory.create({
          data: {
            ticketId: ticket.id,
            actorId: session.user.id,
            actorRole: session.user.role,
            actorName: session.user.username ? `@${session.user.username}` : 'Citizen',
            status: 'IN_PROGRESS',
            comment: disputeReason.trim(),
          },
        }),
      ]);

      if (previousResolutionPhoto?.startsWith('/uploads/')) {
        const { deleteUploadedFile } = await import('@/lib/storage');
        await deleteUploadedFile(previousResolutionPhoto).catch((error) => {
          console.error('Could not remove rejected after-repair image:', error);
        });
      }

      return NextResponse.json({
        success: true,
        ticket: updatedTicket,
        message: 'Complaint returned to In Progress and the after-repair proof was removed.',
      });
    }

    return NextResponse.json({ error: 'Invalid verification action. Use VERIFY or DISPUTE.' }, { status: 400 });
  } catch (error) {
    console.error('Error verifying ticket:', error);
    return NextResponse.json({ error: 'Failed to process citizen verification' }, { status: 500 });
  }
}
