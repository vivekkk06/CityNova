import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/storage';

const ALLOWED_STATUSES = new Set(['IN_PROGRESS', 'PROVISIONALLY_RESOLVED']);
const MAX_PHOTO_SIZE = 8 * 1024 * 1024;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession(req);
    if (!session?.user.cityId || !session.user.city) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }
    if (session.user.role !== 'AUTHORITY') {
      return NextResponse.json({ error: 'Only Authority Employee accounts can update complaint status.' }, { status: 403 });
    }

    const { id } = await params;
    const form = await req.formData();
    const status = form.get('status');
    if (typeof status !== 'string' || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Choose a valid complaint status.' }, { status: 400 });
    }
    const rawComment = form.get('comment');
    const comment = typeof rawComment === 'string' ? rawComment.trim() : '';
    if (comment.length > 1000) return NextResponse.json({ error: 'Comments must be 1,000 characters or fewer.' }, { status: 400 });

    const cityScope = session.user.city.normalizedKey === 'ponda,goa,india'
      ? { OR: [{ cityId: session.user.cityId }, { cityId: null }] }
      : { cityId: session.user.cityId };
    const ticket = await prisma.ticket.findFirst({
      where: { AND: [{ OR: [{ id }, { caseId: id }] }, cityScope] },
    });
    if (!ticket) return NextResponse.json({ error: 'Complaint not found in your city.' }, { status: 404 });

    const update: {
      status: string;
      resolutionPhotoUrl?: string | null;
      resolutionTimestamp?: Date | null;
      resolutionNotes?: string | null;
    } = { status };

    if (status === 'PROVISIONALLY_RESOLVED') {
      const photo = form.get('afterRepairPhoto');
      if (!(photo instanceof File) || photo.size === 0) {
        return NextResponse.json({ error: 'Upload the required Stage 2: After Repair image.' }, { status: 400 });
      }
      if (!photo.type.startsWith('image/') || photo.size > MAX_PHOTO_SIZE) {
        return NextResponse.json({ error: 'The after-repair proof must be an image no larger than 8 MB.' }, { status: 400 });
      }
      update.resolutionPhotoUrl = await saveUploadedFile(photo);
      update.resolutionTimestamp = new Date();
      update.resolutionNotes = 'After-repair photo proof submitted by an Authority Employee.';
    } else {
      update.resolutionPhotoUrl = null;
      update.resolutionTimestamp = null;
      update.resolutionNotes = null;
    }

    const [updated] = await prisma.$transaction([
      prisma.ticket.update({ where: { id: ticket.id }, data: update }),
      prisma.ticketStatusHistory.create({
        data: {
          ticketId: ticket.id,
          actorId: session.user.id,
          actorRole: session.user.role,
          actorName: session.user.username ? `@${session.user.username}` : 'Authority Employee',
          status,
          comment: comment || (status === 'PROVISIONALLY_RESOLVED' ? 'After-repair photo proof uploaded.' : null),
        },
      }),
    ]);
    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error('Authority complaint status update failed:', error);
    return NextResponse.json({ error: 'Could not update complaint status.' }, { status: 500 });
  }
}
