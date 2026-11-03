import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { syncUserCivicScore } from '@/lib/civic-score';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(req);
    if (!session?.user.cityId || !session.user.city) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const { action, disputeReason, comment } = body;

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

    const isCitizen = session.user.role === 'CITIZEN';
    const isReporter = ticket.reporterId === session.user.id;
    const isAuthority = session.user.role === 'AUTHORITY';

    if (!isCitizen && !isReporter && !isAuthority) {
      return NextResponse.json({ error: 'Please sign in to update or dispute the resolution review.' }, { status: 403 });
    }

    const actorDisplayName = session.user.username
      ? `@${session.user.username}`
      : session.user.name || (isAuthority ? 'Authority Official' : 'Citizen');

    if (action === 'VERIFY') {
      if (ticket.status !== 'PROVISIONALLY_RESOLVED') {
        return NextResponse.json({ error: 'Only complaints awaiting citizen sign-off can be closed.' }, { status: 409 });
      }
      const verifiedComment = comment?.trim()
        ? `Citizen Inspected & Signed Off: "${comment.trim()}"`
        : 'Citizen signed off after reviewing the repair proof.';

      const [updatedTicket] = await prisma.$transaction([
        prisma.ticket.update({ where: { id: ticket.id }, data: { status: 'CLOSED' } }),
        prisma.ticketStatusHistory.create({
          data: {
            ticketId: ticket.id,
            actorId: session.user.id,
            actorRole: session.user.role,
            actorName: actorDisplayName,
            status: 'CLOSED',
            comment: verifiedComment,
          },
        }),
      ]);

      if (ticket.reporterId) {
        await syncUserCivicScore(ticket.reporterId);
      }

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
      const disputeComment = `Citizen Dispute Raised: "${disputeReason.trim()}"`;

      const [updatedTicket] = await prisma.$transaction([
        prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: 'IN_PROGRESS',
            hadDispute: true,
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
            actorName: actorDisplayName,
            status: 'IN_PROGRESS',
            comment: disputeComment,
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
