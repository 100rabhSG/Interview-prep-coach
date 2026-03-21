import { GoogleGenerativeAI } from '@google/generative-ai';
import { Topic, Difficulty, Language } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

if (!GEMINI_API_KEY) {
  throw new Error('Please define the GEMINI_API_KEY environment variable in .env.local');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-3-flash-preview',
  generationConfig: {
    temperature: 0.8,
    topP: 0.95,
    responseMimeType: 'application/json',
  },
});

/**
 * Build the prompt for generating a coding problem.
 */
export function buildProblemPrompt(topic: Topic, difficulty: Difficulty, language: Language): string {
  const topicLabels: Record<Topic, string> = {
    'arrays': 'Arrays & Hashing',
    'strings': 'String Manipulation',
    'linked-lists': 'Linked Lists',
    'trees': 'Trees & Binary Search Trees',
    'graphs': 'Graphs & Traversals',
    'dynamic-programming': 'Dynamic Programming',
    'sorting-searching': 'Sorting & Searching Algorithms',
    'system-design': 'System Design',
  };

  const difficultyGuide: Record<Difficulty, string> = {
    easy: 'Simple and straightforward. Solvable with basic concepts. Similar to LeetCode Easy.',
    medium: 'Requires combining multiple concepts. May need optimization. Similar to LeetCode Medium.',
    hard: 'Complex problem requiring advanced techniques. Multiple edge cases. Similar to LeetCode Hard.',
  };

  return `You are an expert coding interview problem designer. Generate a unique, original coding interview problem.

**Topic:** ${topicLabels[topic]}
**Difficulty:** ${difficulty} — ${difficultyGuide[difficulty]}
**Language:** ${language}

Requirements:
- The problem must be original (not a direct copy of well-known problems, but can be inspired by common patterns)
- Include a clear, well-written description with context/story
- Include 2-3 constraints (e.g., input size bounds, value ranges)
- Include 2 examples with input, output, and explanation
- Include 3-5 test cases covering: basic case, edge case (empty/single element/boundary), and a larger case
- Provide the optimal time and space complexity
- For test cases: input and expectedOutput must be strings that can be parsed (e.g., "[1,2,3]" for arrays, "5" for numbers, "\\"hello\\"" for strings)

Respond with ONLY valid JSON in this exact format:
{
  "title": "Problem Title",
  "description": "Full problem description with context. Use markdown formatting for clarity.",
  "constraints": ["1 <= nums.length <= 10^4", "..."],
  "examples": [
    {
      "input": "nums = [1, 2, 3], target = 5",
      "output": "[1, 2]",
      "explanation": "Because nums[1] + nums[2] = 2 + 3 = 5"
    }
  ],
  "testCases": [
    {
      "input": "[1,2,3]\\n5",
      "expectedOutput": "[1, 2]"
    }
  ],
  "optimalComplexity": {
    "time": "O(n)",
    "space": "O(n)"
  },
  "starterCode": {
    "${language}": "// function signature with parameters and return type"
  }
}`;
}

/**
 * Build the prompt for generating a progressive hint.
 */
export function buildHintPrompt(
  problemTitle: string,
  problemDescription: string,
  hintLevel: 1 | 2 | 3
): string {
  const levelGuide: Record<1 | 2 | 3, string> = {
    1: 'Give a gentle nudge about the APPROACH direction. Do NOT mention specific data structures or algorithms. Just hint at what to think about.',
    2: 'Suggest the specific DATA STRUCTURE or ALGORITHM to use. Explain why it fits this problem, but do NOT give implementation details.',
    3: 'Provide a PSEUDOCODE outline of the solution. Show the step-by-step logic without writing actual code.',
  };

  return `You are a helpful coding interview coach. The student is working on this problem and needs a hint.

**Problem:** ${problemTitle}
**Description:** ${problemDescription}

**Hint Level:** ${hintLevel}/3
**Instructions:** ${levelGuide[hintLevel]}

Keep the hint concise (2-4 sentences for levels 1-2, pseudocode block for level 3). Use markdown formatting.

Respond with ONLY valid JSON:
{
  "hint": "Your hint text here with markdown formatting",
  "level": ${hintLevel}
}`;
}

export { model };
