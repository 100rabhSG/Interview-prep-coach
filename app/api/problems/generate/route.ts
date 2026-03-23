import { NextRequest, NextResponse } from 'next/server';
import { model, buildProblemPrompt } from '@/lib/gemini';
import { Topic, Difficulty, Language, Problem } from '@/types';
import { rateLimit } from '@/lib/rateLimit';

const RATE_LIMIT = { maxRequests: 5, windowMs: 60_000 };

const VALID_TOPICS: Topic[] = [
  'arrays', 'strings', 'linked-lists', 'trees', 'graphs',
  'dynamic-programming', 'sorting-searching', 'system-design',
];
const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const VALID_LANGUAGES: Language[] = ['python', 'javascript', 'java', 'cpp'];

function validateProblem(data: unknown): data is Problem {
  if (!data || typeof data !== 'object') return false;
  const p = data as Record<string, unknown>;

  return (
    typeof p.title === 'string' && p.title.length > 0 &&
    typeof p.description === 'string' && p.description.length > 0 &&
    Array.isArray(p.constraints) && p.constraints.length > 0 &&
    Array.isArray(p.examples) && p.examples.length > 0 &&
    Array.isArray(p.testCases) && p.testCases.length >= 3 &&
    typeof p.optimalComplexity === 'object' && p.optimalComplexity !== null &&
    typeof (p.optimalComplexity as Record<string, unknown>).time === 'string' &&
    typeof (p.optimalComplexity as Record<string, unknown>).space === 'string'
  );
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, RATE_LIMIT);
  if (limited) return limited;
  try {
    const body = await request.json();
    const { topic, difficulty, language } = body;

    // Validate inputs
    if (!topic || !VALID_TOPICS.includes(topic)) {
      return NextResponse.json(
        { error: 'Invalid topic. Must be one of: ' + VALID_TOPICS.join(', ') },
        { status: 400 }
      );
    }
    if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be one of: ' + VALID_DIFFICULTIES.join(', ') },
        { status: 400 }
      );
    }
    if (!language || !VALID_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be one of: ' + VALID_LANGUAGES.join(', ') },
        { status: 400 }
      );
    }

    // Generate problem via Gemini
    const prompt = buildProblemPrompt(topic, difficulty, language);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse and validate the JSON response
    let problem: Problem;
    try {
      const parsed = JSON.parse(responseText);
      if (!validateProblem(parsed)) {
        return NextResponse.json(
          { error: 'AI returned an invalid problem structure. Please try again.' },
          { status: 502 }
        );
      }
      problem = parsed as Problem;
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ problem });
  } catch (error) {
    console.error('Problem generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate problem. Please try again later.' },
      { status: 500 }
    );
  }
}
