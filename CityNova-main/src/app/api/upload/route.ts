import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile } from '@/lib/storage';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    if (!(await getAuthSession(req))) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const publicUrl = await saveUploadedFile(file);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload media file' }, { status: 500 });
  }
}
