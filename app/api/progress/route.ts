import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import PracticeSession from '@/models/PracticeSession';
import { Topic, Difficulty, Language, SessionStatus, Problem, TestResult, AIReview } from '@/types';

const VALID_TOPICS: Topic[] = [
  'arrays', 'strings', 'linked-lists', 'trees', 'graphs',
  'dynamic-programming', 'sorting-searching', 'system-design',
];
const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const VALID_LANGUAGES: Language[] = ['python', 'javascript', 'java', 'cpp'];
const VALID_STATUS: SessionStatus[] = ['in-progress', 'attempted', 'solved', 'skipped'];

interface SaveProgressBody {
  topic: Topic;
  difficulty: Difficulty;
  language: Language;
  problem: Problem;
  userSolution?: string;
  testResults?: TestResult[];
  aiReview?: AIReview | null;
  hintsUsed?: number;
  status?: SessionStatus;
}

function isValidProblem(problem: unknown): problem is Problem {
  if (!problem || typeof problem !== 'object') return false;
  const p = problem as Record<string, unknown>;

  return (
    typeof p.title === 'string' && p.title.length > 0 &&
    typeof p.description === 'string' && p.description.length > 0 &&
    Array.isArray(p.constraints) &&
    Array.isArray(p.examples) &&
    Array.isArray(p.testCases) &&
    typeof p.optimalComplexity === 'object' &&
    p.optimalComplexity !== null
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Guest mode: do not persist to DB
    if (!session?.user?.id) {
      return NextResponse.json({
        saved: false,
        isGuest: true,
        message: 'Guest session: progress was not saved to database.',
      });
    }

    const body = (await request.json()) as SaveProgressBody;
    const {
      topic,
      difficulty,
      language,
      problem,
      userSolution = '',
      testResults = [],
      aiReview = null,
      hintsUsed = 0,
      status,
    } = body;

    // Validate required fields
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
    if (!isValidProblem(problem)) {
      return NextResponse.json(
        { error: 'Invalid problem payload.' },
        { status: 400 }
      );
    }
    if (!Array.isArray(testResults)) {
      return NextResponse.json(
        { error: 'testResults must be an array.' },
        { status: 400 }
      );
    }

    const resolvedStatus: SessionStatus = status && VALID_STATUS.includes(status)
      ? status
      : testResults.length > 0 && testResults.every((t) => t.passed)
        ? 'solved'
        : 'attempted';

    await connectDB();

    // Remove starterCode before persisting problem payload.
    const { starterCode, ...problemWithoutStarter } = problem;
    void starterCode;

    const saved = await PracticeSession.create({
      userId: session.user.id,
      topic,
      difficulty,
      language,
      problem: problemWithoutStarter,
      userSolution,
      testResults,
      aiReview,
      hintsUsed,
      status: resolvedStatus,
    });

    return NextResponse.json({
      saved: true,
      isGuest: false,
      sessionId: saved._id,
      status: saved.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Save progress error:', message);
    return NextResponse.json(
      { error: 'Failed to save progress. Please try again later.' },
      { status: 500 }
    );
  }
}
