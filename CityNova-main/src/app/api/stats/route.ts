import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user.cityId || !session.user.city) return NextResponse.json({ error: 'Please sign in to view city statistics.' }, { status: 401 });

    const cityFilter = session.user.city.normalizedKey === 'ponda,goa,india'
      ? { OR: [{ cityId: session.user.cityId }, { cityId: null }] }
      : { cityId: session.user.cityId };
    const where = (status?: string | { in: string[] }) => ({ ...cityFilter, ...(status ? { status } : {}) });

    const [total, open, inProgress, resolved, disputed, completed] = await Promise.all([
      prisma.ticket.count({ where: where() }),
      prisma.ticket.count({ where: where('OPEN') }),
      prisma.ticket.count({ where: where({ in: ['IN_PROGRESS', 'ASSIGNED'] }) }),
      prisma.ticket.count({ where: where({ in: ['RESOLVED', 'CLOSED'] }) }),
      prisma.ticket.count({ where: where('DISPUTED') }),
      prisma.ticket.findMany({ where: where({ in: ['RESOLVED', 'CLOSED'] }), select: { createdAt: true, updatedAt: true, slaDeadline: true } }),
    ]);

    const onTime = completed.filter((ticket) => ticket.updatedAt <= ticket.slaDeadline);
    const avgResolutionHours = completed.length
      ? Number((completed.reduce((sum, ticket) => sum + (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) / 3600000, 0) / completed.length).toFixed(1))
      : null;

    return NextResponse.json({
      success: true,
      stats: {
        city: session.user.city.name,
        total,
        open,
        inProgress,
        resolved,
        disputed,
        slaComplianceRate: completed.length ? Math.round(onTime.length / completed.length * 100) : null,
        avgResolutionHours,
      },
    });
  } catch (error) {
    console.error('Error fetching city statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch city statistics.' }, { status: 500 });
  }
}
