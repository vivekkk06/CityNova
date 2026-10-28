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
    const { action, disputeReason, disputePhotoUrl } = body;

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
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'RESOLVED',
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
          disputeReason: disputeReason.trim(),
          disputePhotoUrl: disputePhotoUrl || null,
        },
      });

      return NextResponse.json({
        success: true,
        ticket: updatedTicket,
        message: 'Your concern has been added to the complaint record.',
      });
    }

    return NextResponse.json({ error: 'Invalid verification action. Use VERIFY or DISPUTE.' }, { status: 400 });
  } catch (error) {
    console.error('Error verifying ticket:', error);
    return NextResponse.json({ error: 'Failed to process citizen verification' }, { status: 500 });
  }
}
