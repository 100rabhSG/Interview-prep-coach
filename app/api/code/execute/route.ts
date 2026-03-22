import { NextRequest, NextResponse } from 'next/server';
import { submitBatch, pollResults } from '@/lib/judge0';
import { Language } from '@/types';

const VALID_LANGUAGES: Language[] = ['python', 'javascript', 'java', 'cpp'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, testCases } = body;

    // Validate inputs
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'code is required' }, { status: 400 });
    }
    if (!language || !VALID_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be one of: ' + VALID_LANGUAGES.join(', ') },
        { status: 400 }
      );
    }
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json({ error: 'testCases array is required' }, { status: 400 });
    }

    // Submit to Judge0
    const tokens = await submitBatch(code, language, testCases);

    // Poll for results
    const results = await pollResults(tokens);

    // Map Judge0 results to our TestResult format
    const testResults = results.map((result, i) => ({
      input: testCases[i].input,
      expectedOutput: testCases[i].expectedOutput,
      actualOutput: (result.stdout || result.stderr || '').trim(),
      passed: result.status.id === 3, // 3 = Accepted
      executionTime: result.time ? parseFloat(result.time) : undefined,
      memoryUsed: result.memory || undefined,
      status: result.status.description,
    }));

    return NextResponse.json({ testResults });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Code execution error:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
