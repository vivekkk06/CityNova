import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Please sign in to view saved posts.' }, { status: 401 });
    }

    const body = await req.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];

    if (ids.length === 0) {
      return NextResponse.json({ success: true, posts: [] });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { id: { in: ids } },
          { caseId: { in: ids } },
        ],
      },
      select: {
        id: true,
        caseId: true,
        title: true,
        description: true,
        category: true,
        status: true,
        addressDescription: true,
        createdAt: true,
        initialPhotoUrl: true,
        reporter: { select: { username: true } },
        city: { select: { name: true, state: true } },
        _count: { select: { reactions: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const posts = tickets.map((t) => ({
      id: t.id,
      caseId: t.caseId,
      title: t.title,
      description: t.description,
      category: t.category,
      status: t.status,
      addressDescription: t.addressDescription.replace(/\s*\(Ward\s+\d+\)/gi, ''),
      createdAt: t.createdAt,
      initialPhotoUrl: t.initialPhotoUrl,
      authorUsername: t.reporter?.username || 'citizen',
      cityName: t.city?.name || 'Local City',
      stateName: t.city?.state || '',
      plusOneCount: t._count.reactions,
      commentsCount: t._count.comments,
    }));

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json({ error: 'Failed to fetch saved posts' }, { status: 500 });
  }
}

