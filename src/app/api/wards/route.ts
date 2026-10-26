import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const wards = await prisma.ward.findMany({
      include: {
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    const enrichedWards = await Promise.all(
      wards.map(async (ward) => {
        const openCount = await prisma.ticket.count({
          where: {
            wardId: ward.id,
            status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
          },
        });

        const resolvedCount = await prisma.ticket.count({
          where: {
            wardId: ward.id,
            status: { in: ['RESOLVED', 'CLOSED'] },
          },
        });

        return {
          ...ward,
          boundaries: JSON.parse(ward.boundariesGeoJson),
          stats: {
            total: ward._count.tickets,
            open: openCount,
            resolved: resolvedCount,
          },
        };
      })
    );

    return NextResponse.json({ success: true, wards: enrichedWards });
  } catch (error) {
    console.error('Error fetching wards:', error);
    return NextResponse.json({ error: 'Failed to fetch wards' }, { status: 500 });
  }
}
