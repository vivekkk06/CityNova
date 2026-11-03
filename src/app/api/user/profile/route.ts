import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession, publicUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Please sign in to view your profile.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { city: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Please sign in to update your profile.' }, { status: 401 });
    }

    const body = await req.json();
    const updateData: Record<string, any> = {};

    if (typeof body.email === 'string') {
      const email = body.email.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
      }
      updateData.email = email || null;
    }

    if (typeof body.dob === 'string') {
      updateData.dob = body.dob.trim() || null;
    }

    if (typeof body.bio === 'string') {
      const bio = body.bio.trim();
      if (bio.length > 500) {
        return NextResponse.json({ error: 'Bio must be within 500 characters.' }, { status: 400 });
      }
      updateData.bio = bio || null;
    }

    if (session.user.role === 'AUTHORITY' && typeof body.designation === 'string') {
      const validDesignations = [
        'District Magistrate (DM)',
        'Sub-divisional Magistrate (SDM)',
        'Mayor',
        'Commissioner of Police (CP)',
      ];
      const designation = body.designation.trim();
      if (designation && !validDesignations.includes(designation)) {
        return NextResponse.json({ error: 'Please choose a valid authority designation.' }, { status: 400 });
      }
      updateData.designation = designation || null;
    }

    if (typeof body.avatarUrl === 'string' || body.avatarUrl === null) {
      updateData.avatarUrl = body.avatarUrl ? body.avatarUrl.trim() : null;
    }

    if (typeof body.coverUrl === 'string' || body.coverUrl === null) {
      updateData.coverUrl = body.coverUrl ? body.coverUrl.trim() : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      include: { city: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully updated profile.',
      user: publicUser(updatedUser),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update profile.',
    }, { status: 500 });
  }
}

