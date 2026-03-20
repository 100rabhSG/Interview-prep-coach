export type Topic =
  | 'arrays'
  | 'strings'
  | 'linked-lists'
  | 'trees'
  | 'graphs'
  | 'dynamic-programming'
  | 'sorting-searching'
  | 'system-design';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Language = 'python' | 'javascript' | 'java' | 'cpp';

export interface Problem {
  title: string;
  description: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
  optimalComplexity: {
    time: string;
    space: string;
  };
  starterCode?: Record<Language, string>;
}

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime?: number;
  memoryUsed?: number;
  status?: string;
}

export interface AIReview {
  correctness: string;
  timeComplexity: string;
  spaceComplexity: string;
  issues: string[];
  optimizations: string[];
  score: number;
  optimalSolution: string;
}

export type SessionStatus = 'in-progress' | 'attempted' | 'solved' | 'skipped';
