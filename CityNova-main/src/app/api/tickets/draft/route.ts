import { NextRequest, NextResponse } from 'next/server';
import { parseCivicIntakeDraft } from '@/lib/ai';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    if (!(await getAuthSession(req))) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description or voice transcript is required to generate a civic draft.' },
        { status: 400 }
      );
    }

    const structuredDraft = await parseCivicIntakeDraft(text);

    return NextResponse.json({
      success: true,
      draft: structuredDraft,
      source: process.env.OPENAI_API_KEY ? 'OpenAI GPT-4o-mini' : 'CityNova Civic Classifier',
    });
  } catch (error) {
    console.error('Error generating AI draft:', error);
    return NextResponse.json(
      { error: 'Failed to process AI civic draft.' },
      { status: 500 }
    );
  }
}
