import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeTicketForPublic } from '@/lib/privacy';
import { findCivicMemoryNearby } from '@/lib/gis';
import { getAuthSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(req);
    if (!session?.user.cityId || !session.user.city) return NextResponse.json({ error: 'Please sign in to view complaint dockets.' }, { status: 401 });
    const { id } = await params;

    const ticket = await prisma.ticket.findFirst({
      where: {
        AND: [
          { OR: [{ id }, { caseId: id }] },
          session.user.city.normalizedKey === 'ponda,goa,india'
            ? { OR: [{ cityId: session.user.cityId }, { cityId: null }] }
            : { cityId: session.user.cityId },
        ],
      },
      include: {
        city: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Civic ticket not found' }, { status: 404 });
    }

    // Civic Memory: find past fixes within 150m
    const civicMemory = await findCivicMemoryNearby(ticket.latitude, ticket.longitude, 150, session.user.cityId);
    // Filter out current ticket if it matches
    const pastNearbyFixes = civicMemory.filter((m) => m.id !== ticket.id);

    const processedTicket = sanitizeTicketForPublic(ticket);

    return NextResponse.json({
      success: true,
      ticket: processedTicket,
      canUpdateResolution: ticket.reporterId === session.user.id,
      civicMemory: pastNearbyFixes.map((m) => sanitizeTicketForPublic(m)),
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
  return NextResponse.json({ error: 'Citizen accounts cannot update official complaint status.' }, { status: 403 });
}
