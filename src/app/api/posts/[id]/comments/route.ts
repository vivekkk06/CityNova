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
      return NextResponse.json({ error: 'Please sign in to comment on a post.' }, { status: 401 });
    }
    if (session.user.role !== 'CITIZEN') {
      return NextResponse.json({ error: 'Authority Employee accounts can view comments but cannot post them.' }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Enter a comment before posting.' }, { status: 400 });
    }
    const commentText = typeof body === 'object' && body !== null && 'body' in body && typeof body.body === 'string'
      ? body.body.trim()
      : '';
    if (!commentText || commentText.length > 1000) {
      return NextResponse.json({ error: 'Comments must be between 1 and 1000 characters.' }, { status: 400 });
    }

    const { id } = await params;
    const cityFilter = session.user.city.normalizedKey === 'ponda,goa,india'
      ? { OR: [{ cityId: session.user.cityId }, { cityId: null }] }
      : { cityId: session.user.cityId };
    const ticket = await prisma.ticket.findFirst({ where: { AND: [{ id }, cityFilter] }, select: { id: true } });
    if (!ticket) return NextResponse.json({ error: 'Post not found in your city.' }, { status: 404 });

    const comment = await prisma.ticketComment.create({
      data: { ticketId: ticket.id, userId: session.user.id, body: commentText },
      select: { id: true, body: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      comment: { ...comment, authorUsername: session.user.username || 'citizen' },
    });
  } catch (error) {
    console.error('Error creating post comment:', error);
    return NextResponse.json({ error: 'Could not post your comment.' }, { status: 500 });
  }
}
