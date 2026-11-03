import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Please sign in to transcribe audio.' }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI transcription service is not configured (missing GEMINI_API_KEY).' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Audio file is empty.' }, { status: 400 });
    }

    const base64Audio = buffer.toString('base64');
    let mimeType = audioFile.type || 'audio/webm';
    if (mimeType.includes(';')) {
      mimeType = mimeType.split(';')[0].trim();
    }

    // Models to attempt in order of availability
    const configuredModel = process.env.GEMINI_MODEL;
    const candidateModels = Array.from(
      new Set(
        [
          configuredModel,
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-1.5-flash',
        ].filter(Boolean) as string[]
      )
    );

    let transcript = '';
    let lastError = '';

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            model
          )}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: "You are CityNova's civic voice transcriber. Listen carefully to the recorded audio note from a citizen reporting a civic problem (e.g. pothole, broken streetlight, garbage dump, water leak, drainage issue). Transcribe exactly what the citizen spoke into clean, natural text in the language spoken (English, Hindi, Konkani, or mixed Indian dialect). Output ONLY the transcribed words. Do NOT add introductory phrases, quotes, notes, conversational filler, or commentary. If the audio is silent or contains no speech, respond with an empty string.",
                    },
                    {
                      inlineData: {
                        mimeType,
                        data: base64Audio,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 800,
              },
            }),
            signal: AbortSignal.timeout(25000),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Model ${model} returned error ${response.status}:`, errText);
          lastError = `Model ${model} error: ${response.status}`;
          continue;
        }

        const data = await response.json();
        const candidateText =
          data.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text || '')
            .join('')
            .trim() || '';

        transcript = candidateText;
        break;
      } catch (err: any) {
        console.warn(`Error trying model ${model}:`, err?.message || err);
        lastError = err?.message || 'Network error';
      }
    }

    if (!transcript && lastError && candidateModels.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: lastError,
          transcript: '',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      transcript,
    });
  } catch (error: any) {
    console.error('Audio transcribe error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process audio transcription.' },
      { status: 500 }
    );
  }
}

