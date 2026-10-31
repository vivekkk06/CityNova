import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user.cityId || !session.user.city) {
      return NextResponse.json({ error: 'Please sign in to view complaint history.' }, { status: 401 });
    }

    const { id } = await params;
    const cityScope: Prisma.TicketWhereInput = session.user.city.normalizedKey === 'ponda,goa,india'
      ? { OR: [{ cityId: session.user.cityId }, { cityId: null }] }
      : { cityId: session.user.cityId };
    const ticket = await prisma.ticket.findFirst({
      where: { AND: [{ OR: [{ id }, { caseId: id }] }, cityScope] },
      select: { id: true },
    });
    if (!ticket) return NextResponse.json({ error: 'Complaint not found in your city.' }, { status: 404 });

    const history = await prisma.ticketStatusHistory.findMany({
      where: { ticketId: ticket.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, status: true, actorRole: true, actorName: true, comment: true, createdAt: true },
    });
    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching complaint history:', error);
    return NextResponse.json({ error: 'Could not load complaint history.' }, { status: 500 });
  }
}
