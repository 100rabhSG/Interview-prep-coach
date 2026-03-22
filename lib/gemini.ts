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
- For test cases: input and expectedOutput must be strings. Each test case's "input" is what will be passed to the program on stdin (one value per line if multiple inputs). "expectedOutput" is what the program should print to stdout.

CRITICAL — starterCode rules:
The starterCode MUST be a COMPLETE, COMPILABLE, RUNNABLE program (not just a function signature). It must include:
1. All necessary imports/includes(must use bits/stdc++.h for C++)/headers
2. A solution function with an empty body marked with a TODO comment for the student to implement
3. A main() function (or equivalent entry point) that:
   - Reads input from stdin (parsing the format used in testCases)
   - Calls the solution function
   - Prints the result to stdout (matching expectedOutput format exactly)

Example for C++ if the problem takes an array and returns an int:
\`\`\`
#include <bits/stdc++.h>
using namespace std;

int solve(vector<int>& nums) {
    // TODO: Implement your solution here
    return 0;
}

int main() {
    string line;
    getline(cin, line);
    // parse "[1,2,3]" into vector
    line = line.substr(1, line.size() - 2);
    vector<int> nums;
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {
        nums.push_back(stoi(token));
    }
    cout << solve(nums) << endl;
    return 0;
}
\`\`\`

Example for Python if the problem takes an array and returns an int:
\`\`\`
import json, sys

def solve(nums):
    # TODO: Implement your solution here
    return 0

if __name__ == "__main__":
    nums = json.loads(input())
    print(solve(nums))
\`\`\`

The student should ONLY need to fill in the solution function body. The I/O is already handled.

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
    "${language}": "// Complete runnable program with main() and I/O handling. Solution function body left as TODO."
  }
}`;
}

/**
 * Build the prompt for generating all 3 progressive hints in a single call.
 */
export function buildAllHintsPrompt(
  problemTitle: string,
  problemDescription: string,
): string {
  return `You are a helpful coding interview coach. The student is working on this problem and needs hints.

**Problem:** ${problemTitle}
**Description:** ${problemDescription}

Generate 3 progressive hints, each more revealing than the last:
- Hint 1 (Approach): A gentle nudge about the approach direction. Do NOT mention specific data structures or algorithms. Just hint at what to think about. (2-4 sentences)
- Hint 2 (Algorithm): Suggest the specific data structure or algorithm to use. Explain why it fits this problem, but do NOT give implementation details. (2-4 sentences)
- Hint 3 (Pseudocode): Provide a pseudocode outline of the solution. Show the step-by-step logic without writing actual code.

Use markdown formatting.

Respond with ONLY valid JSON:
{
  "hints": [
    "Hint 1 text",
    "Hint 2 text",
    "Hint 3 text"
  ]
}`;
}

/**
 * Build the prompt for AI code review.
 */
export function buildReviewPrompt(
  problemTitle: string,
  problemDescription: string,
  userSolution: string,
  language: Language,
  testResults: Array<{ input: string; expectedOutput: string; actualOutput: string; passed: boolean }>,
): string {
  const passedCount = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;

  const testSummary = testResults
    .map(
      (t, i) =>
        `Test ${i + 1}: ${t.passed ? 'PASSED' : 'FAILED'} | Input: ${t.input} | Expected: ${t.expectedOutput} | Got: ${t.actualOutput}`
    )
    .join('\n');

  return `You are an expert coding interview reviewer. Analyze the student's solution and provide detailed feedback.

**Problem:** ${problemTitle}
**Description:** ${problemDescription}

**Language:** ${language}
**Student's Solution:**
\`\`\`${language}
${userSolution}
\`\`\`

**Test Results:** ${passedCount}/${totalCount} passed
${testSummary}

Provide a thorough review covering:
1. **Correctness** — Does the solution correctly solve the problem? If tests failed, explain why.
2. **Time Complexity** — What is the time complexity? Is it optimal?
3. **Space Complexity** — What is the space complexity? Can it be improved?
4. **Issues** — List specific bugs, edge cases missed, or logical errors (empty array if none).
5. **Optimizations** — Suggest concrete improvements (empty array if already optimal).
6. **Score** — Rate 1-10 (10 = perfect, optimal solution passing all tests).
7. **Optimal Solution** — Provide the optimal solution code in ${language}.

Respond with ONLY valid JSON:
{
  "correctness": "Assessment of correctness...",
  "timeComplexity": "O(n) — explanation...",
  "spaceComplexity": "O(1) — explanation...",
  "issues": ["Issue 1", "Issue 2"],
  "optimizations": ["Optimization 1"],
  "score": 7,
  "optimalSolution": "// optimal code here"
}`;
}

export { model };