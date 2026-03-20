import mongoose, { Schema, Document } from 'mongoose';
import { Topic, Difficulty, Language, SessionStatus, Problem, TestResult, AIReview } from '@/types';

export interface IPracticeSession extends Document {
  userId: mongoose.Types.ObjectId;
  topic: Topic;
  difficulty: Difficulty;
  language: Language;
  problem: Omit<Problem, 'starterCode'>;
  userSolution: string;
  testResults: TestResult[];
  aiReview: AIReview | null;
  hintsUsed: number;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PracticeSessionSchema = new Schema<IPracticeSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic: {
      type: String,
      required: true,
      enum: ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'sorting-searching', 'system-design'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'],
    },
    language: {
      type: String,
      required: true,
      enum: ['python', 'javascript', 'java', 'cpp'],
    },
    problem: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      constraints: [String],
      examples: [
        {
          input: String,
          output: String,
          explanation: String,
        },
      ],
      testCases: [
        {
          input: String,
          expectedOutput: String,
        },
      ],
      optimalComplexity: {
        time: String,
        space: String,
      },
    },
    userSolution: { type: String, default: '' },
    testResults: [
      {
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
        executionTime: Number,
        memoryUsed: Number,
      },
    ],
    aiReview: {
      type: {
        correctness: String,
        timeComplexity: String,
        spaceComplexity: String,
        issues: [String],
        optimizations: [String],
        score: Number,
        optimalSolution: String,
      },
      default: null,
    },
    hintsUsed: { type: Number, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ['in-progress', 'attempted', 'solved', 'skipped'],
      default: 'in-progress',
    },
  },
  { timestamps: true }
);

// Compound indexes for dashboard queries
PracticeSessionSchema.index({ userId: 1, topic: 1 });
PracticeSessionSchema.index({ userId: 1, createdAt: -1 });

const PracticeSession =
  mongoose.models.PracticeSession ||
  mongoose.model<IPracticeSession>('PracticeSession', PracticeSessionSchema);

export default PracticeSession;
