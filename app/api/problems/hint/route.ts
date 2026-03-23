import { NextRequest, NextResponse } from 'next/server';
import { model, buildAllHintsPrompt } from '@/lib/gemini';
import { rateLimit } from '@/lib/rateLimit';

const RATE_LIMIT = { maxRequests: 2, windowMs: 60_000 };

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, RATE_LIMIT);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { problemTitle, problemDescription } = body;

    // Validate inputs
    if (!problemTitle || typeof problemTitle !== 'string') {
      return NextResponse.json({ error: 'problemTitle is required' }, { status: 400 });
    }
    if (!problemDescription || typeof problemDescription !== 'string') {
      return NextResponse.json({ error: 'problemDescription is required' }, { status: 400 });
    }

    // Generate all 3 hints in a single Gemini call
    const prompt = buildAllHintsPrompt(problemTitle, problemDescription);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse response
    let parsed: { hints: string[] };
    try {
      parsed = JSON.parse(responseText);
      if (!Array.isArray(parsed.hints) || parsed.hints.length < 3) {
        return NextResponse.json(
          { error: 'AI returned invalid hints. Please try again.' },
          { status: 502 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ hints: parsed.hints.slice(0, 3) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Hint generation error:', message);
    return NextResponse.json(
      { error: 'Failed to generate hints. Please try again later.' },
      { status: 500 }
    );
  }
}