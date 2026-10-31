import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user.cityId || !session.user.city) {
      return NextResponse.json({ error: 'Please sign in to react to a post.' }, { status: 401 });
    }
    if (session.user.role !== 'CITIZEN') {
      return NextResponse.json({ error: 'Authority Employee accounts can view +1 totals but cannot react.' }, { status: 403 });
    }

    const { id } = await params;
    const cityFilter = session.user.city.normalizedKey === 'ponda,goa,india'
      ? { OR: [{ cityId: session.user.cityId }, { cityId: null }] }
      : { cityId: session.user.cityId };
    const ticket = await prisma.ticket.findFirst({ where: { AND: [{ id }, cityFilter] }, select: { id: true } });
    if (!ticket) return NextResponse.json({ error: 'Post not found in your city.' }, { status: 404 });

    const uniqueKey = { ticketId_userId: { ticketId: ticket.id, userId: session.user.id } };
    const currentReaction = await prisma.ticketReaction.findUnique({ where: uniqueKey });
    if (currentReaction) {
      await prisma.ticketReaction.delete({ where: uniqueKey });
    } else {
      await prisma.ticketReaction.create({ data: { ticketId: ticket.id, userId: session.user.id } });
    }

    const [plusOneCount, reaction] = await Promise.all([
      prisma.ticketReaction.count({ where: { ticketId: ticket.id } }),
      prisma.ticketReaction.findUnique({ where: uniqueKey }),
    ]);
    return NextResponse.json({ success: true, plusOneCount, reactedByMe: Boolean(reaction) });
  } catch (error) {
    console.error('Error updating post reaction:', error);
    return NextResponse.json({ error: 'Could not update your +1.' }, { status: 500 });
  }
}
