import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { syncUserCivicScore } from '@/lib/civic-score';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session || session.user.role !== 'AUTHORITY') {
      return NextResponse.json({ error: 'Only Municipal Authority accounts can manage citizen reporting access.' }, { status: 403 });
    }

    const body = await req.json();
    const { citizenId, action = 'BAN', reason } = body;

    if (!citizenId || typeof citizenId !== 'string') {
      return NextResponse.json({ error: 'Valid citizenId is required.' }, { status: 400 });
    }

    const citizen = await prisma.user.findUnique({
      where: { id: citizenId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isBanned: true,
        civicScore: true,
      },
    });

    if (!citizen) {
      return NextResponse.json({ error: 'Citizen account not found.' }, { status: 404 });
    }

    if (citizen.role !== 'CITIZEN') {
      return NextResponse.json({ error: 'Cannot apply reporting ban to non-citizen accounts.' }, { status: 400 });
    }

    if (action === 'UNBAN') {
      const updated = await prisma.user.update({
        where: { id: citizenId },
        data: {
          isBanned: false,
          banReason: null,
          bannedAt: null,
          bannedBy: null,
        },
        select: {
          id: true,
          name: true,
          username: true,
          isBanned: true,
          civicScore: true,
        },
      });

      const restoredScore = await syncUserCivicScore(citizenId);

      return NextResponse.json({
        success: true,
        action: 'UNBAN',
        message: `Citizen @${citizen.username || citizen.name} has been unbanned. Civic score restored to ${restoredScore}.`,
        user: { ...updated, civicScore: restoredScore },
      });
    }

    // Default: BAN
    const banReasonText = (typeof reason === 'string' && reason.trim())
      ? reason.trim()
      : 'Flagged and restricted by Municipal Authority for fake or duplicate complaints.';

    const updated = await prisma.user.update({
      where: { id: citizenId },
      data: {
        isBanned: true,
        civicScore: 0,
        banReason: banReasonText,
        bannedAt: new Date(),
        bannedBy: session.user.name,
      },
      select: {
        id: true,
        name: true,
        username: true,
        isBanned: true,
        civicScore: true,
        banReason: true,
        bannedAt: true,
        bannedBy: true,
      },
    });

    return NextResponse.json({
      success: true,
      action: 'BAN',
      message: `Citizen @${citizen.username || citizen.name} has been banned from reporting and commenting. Civic score set to 0.`,
      user: updated,
    });
  } catch (error) {
    console.error('Error handling authority ban action:', error);
    return NextResponse.json({ error: 'Failed to update citizen restriction status.' }, { status: 500 });
  }
}

