import { NextRequest, NextResponse } from 'next/server';
import { model, buildReviewPrompt } from '@/lib/gemini';
import { Language, AIReview } from '@/types';
import { rateLimit } from '@/lib/rateLimit';

const RATE_LIMIT = { maxRequests: 1, windowMs: 60_000 };

const VALID_LANGUAGES: Language[] = ['python', 'javascript', 'java', 'cpp'];

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, RATE_LIMIT);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { problemTitle, problemDescription, userSolution, language, testResults } = body;

    // Validate inputs
    if (!problemTitle || typeof problemTitle !== 'string') {
      return NextResponse.json({ error: 'problemTitle is required' }, { status: 400 });
    }
    if (!problemDescription || typeof problemDescription !== 'string') {
      return NextResponse.json({ error: 'problemDescription is required' }, { status: 400 });
    }
    if (!userSolution || typeof userSolution !== 'string') {
      return NextResponse.json({ error: 'userSolution is required' }, { status: 400 });
    }
    if (!language || !VALID_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be one of: ' + VALID_LANGUAGES.join(', ') },
        { status: 400 }
      );
    }
    if (!Array.isArray(testResults) || testResults.length === 0) {
      return NextResponse.json({ error: 'testResults array is required' }, { status: 400 });
    }

    // Generate review via Gemini
    const prompt = buildReviewPrompt(
      problemTitle,
      problemDescription,
      userSolution,
      language,
      testResults,
    );
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse and validate
    let review: AIReview;
    try {
      const parsed = JSON.parse(responseText);
      if (
        typeof parsed.correctness !== 'string' ||
        typeof parsed.score !== 'number' ||
        !Array.isArray(parsed.issues)
      ) {
        return NextResponse.json(
          { error: 'AI returned an invalid review structure. Please try again.' },
          { status: 502 }
        );
      }
      review = parsed as AIReview;
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Review error:', message);
    return NextResponse.json(
      { error: 'Failed to generate review. Please try again later.' },
      { status: 500 }
    );
  }
}
