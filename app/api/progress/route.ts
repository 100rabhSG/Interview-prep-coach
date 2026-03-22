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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          isGuest: true,
          message: 'Sign in to view saved progress.',
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const daysRaw = searchParams.get('days');
    const limitRaw = searchParams.get('limit');
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');
    const status = searchParams.get('status');

    const days = daysRaw ? Math.max(parseInt(daysRaw, 10), 1) : 30;
    const limit = limitRaw ? Math.min(Math.max(parseInt(limitRaw, 10), 1), 200) : 100;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const baseFilter: Record<string, unknown> = {
      userId: session.user.id,
      createdAt: { $gte: sinceDate },
    };

    if (topic && VALID_TOPICS.includes(topic as Topic)) {
      baseFilter.topic = topic;
    }
    if (difficulty && VALID_DIFFICULTIES.includes(difficulty as Difficulty)) {
      baseFilter.difficulty = difficulty;
    }
    if (status && VALID_STATUS.includes(status as SessionStatus)) {
      baseFilter.status = status;
    }

    await connectDB();

    const sessions = await PracticeSession.find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('topic difficulty language status hintsUsed createdAt updatedAt aiReview.score problem.title')
      .lean();

    const [topicAgg, difficultyAgg, timeAgg] = await Promise.all([
      PracticeSession.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: '$topic',
            count: { $sum: 1 },
            solved: {
              $sum: {
                $cond: [{ $eq: ['$status', 'solved'] }, 1, 0],
              },
            },
            avgScore: { $avg: '$aiReview.score' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      PracticeSession.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: '$difficulty',
            count: { $sum: 1 },
            solved: {
              $sum: {
                $cond: [{ $eq: ['$status', 'solved'] }, 1, 0],
              },
            },
            avgScore: { $avg: '$aiReview.score' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      PracticeSession.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            count: { $sum: 1 },
            solved: {
              $sum: {
                $cond: [{ $eq: ['$status', 'solved'] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalSolved = sessions.filter((s) => s.status === 'solved').length;
    const scores = sessions
      .map((s) => s.aiReview?.score)
      .filter((score): score is number => typeof score === 'number');
    const averageScore = scores.length > 0
      ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2))
      : null;

    return NextResponse.json({
      sessions,
      filters: {
        days,
        limit,
        topic: topic || null,
        difficulty: difficulty || null,
        status: status || null,
      },
      summary: {
        total: sessions.length,
        solved: totalSolved,
        averageScore,
      },
      aggregates: {
        byTopic: topicAgg.map((row) => ({
          topic: row._id,
          count: row.count,
          solved: row.solved,
          avgScore: row.avgScore !== null ? Number(row.avgScore.toFixed(2)) : null,
        })),
        byDifficulty: difficultyAgg.map((row) => ({
          difficulty: row._id,
          count: row.count,
          solved: row.solved,
          avgScore: row.avgScore !== null ? Number(row.avgScore.toFixed(2)) : null,
        })),
        byDate: timeAgg.map((row) => ({
          date: row._id,
          count: row.count,
          solved: row.solved,
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get progress error:', message);
    return NextResponse.json(
      { error: 'Failed to fetch progress. Please try again later.' },
      { status: 500 }
    );
  }
}