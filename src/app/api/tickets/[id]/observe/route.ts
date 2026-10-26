import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      comment,
      photoUrl,
      authorName = 'Neighboring Resident',
      authorRole = 'NEIGHBOR',
      observationType = 'STATUS_UPDATE',
      isUpvoteOnly = false,
    } = body;

    const ticket = await prisma.ticket.findFirst({
      where: { OR: [{ id }, { caseId: id }] },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Civic ticket not found' }, { status: 404 });
    }

    if (isUpvoteOnly) {
      const updated = await prisma.ticket.update({
        where: { id: ticket.id },
        data: { upvoteCount: { increment: 1 } },
      });
      return NextResponse.json({ success: true, upvoteCount: updated.upvoteCount });
    }

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json({ error: 'Observation comment cannot be empty' }, { status: 400 });
    }

    // Create the community observation
    const observation = await prisma.observation.create({
      data: {
        ticketId: ticket.id,
        authorName,
        authorRole,
        comment: comment.trim(),
        photoUrl,
        observationType,
      },
    });

    // Increment upvote count for community engagement
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { upvoteCount: { increment: 1 } },
    });

    // Record in Provenance Audit Trail
    await prisma.auditLog.create({
      data: {
        ticketId: ticket.id,
        sourceLabel: 'Resident Input',
        action: 'NEIGHBOR_OBSERVATION_ADDED',
        actorName: authorName,
        actorRole: 'Community Observer',
        details: `Neighbor added an observation (${observationType}): "${comment.slice(0, 80)}${
          comment.length > 80 ? '...' : ''
        }"`,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      observation,
    });
  } catch (error) {
    console.error('Error adding observation:', error);
    return NextResponse.json({ error: 'Failed to record neighbor observation' }, { status: 500 });
  }
}
