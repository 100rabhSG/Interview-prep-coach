import { NextRequest, NextResponse } from 'next/server';
import { model, buildHintPrompt } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemTitle, problemDescription, hintLevel } = body;

    // Validate inputs
    if (!problemTitle || typeof problemTitle !== 'string') {
      return NextResponse.json({ error: 'problemTitle is required' }, { status: 400 });
    }
    if (!problemDescription || typeof problemDescription !== 'string') {
      return NextResponse.json({ error: 'problemDescription is required' }, { status: 400 });
    }
    if (![1, 2, 3].includes(hintLevel)) {
      return NextResponse.json({ error: 'hintLevel must be 1, 2, or 3' }, { status: 400 });
    }

    // Generate hint via Gemini
    const prompt = buildHintPrompt(problemTitle, problemDescription, hintLevel as 1 | 2 | 3);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse response
    let parsed: { hint: string; level: number };
    try {
      parsed = JSON.parse(responseText);
      if (!parsed.hint || typeof parsed.hint !== 'string') {
        return NextResponse.json(
          { error: 'AI returned an invalid hint. Please try again.' },
          { status: 502 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ hint: parsed.hint, level: parsed.level });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Hint generation error:', message);
    return NextResponse.json(
      { error: 'Failed to generate hint. Please try again later.' },
      { status: 500 }
    );
  }
}
