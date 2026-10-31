import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user.cityId || !session.user.city) {
      return NextResponse.json({ error: 'Please sign in to view city posts.' }, { status: 401 });
    }

    const cityFilter: Prisma.TicketWhereInput = session.user.city.normalizedKey === 'ponda,goa,india'
      ? { OR: [{ cityId: session.user.cityId }, { cityId: null }] }
      : { cityId: session.user.cityId };

    const tickets = await prisma.ticket.findMany({
      where: cityFilter,
      select: {
        id: true,
        caseId: true,
        title: true,
        description: true,
        category: true,
        status: true,
        addressDescription: true,
        createdAt: true,
        reporter: { select: { username: true } },
        reactions: {
          where: { userId: session.user.id },
          select: { id: true },
        },
        _count: { select: { reactions: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            body: true,
            createdAt: true,
            user: { select: { username: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const posts = tickets.map((ticket) => ({
      id: ticket.id,
      caseId: ticket.caseId,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      status: ticket.status,
      addressDescription: ticket.addressDescription.replace(/\s*\(Ward\s+\d+\)/gi, ''),
      createdAt: ticket.createdAt,
      authorUsername: ticket.reporter?.username || 'citizen',
      plusOneCount: ticket._count.reactions,
      reactedByMe: ticket.reactions.length > 0,
      comments: ticket.comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        authorUsername: comment.user.username || 'citizen',
      })),
    }));

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('Error fetching city posts:', error);
    return NextResponse.json({ error: 'Could not load city posts.' }, { status: 500 });
  }
}
