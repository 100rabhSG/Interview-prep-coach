# Technical Specification

## Interview Prep Coach

**Version:** 1.0  
**Date:** March 20, 2026  
**Status:** Draft

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                    │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Next.js  │  │ Monaco Editor│  │  Chart.js Charts  │  │
│  │  App UI  │  │  (Code Input)│  │  (Dashboard)      │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘  │
│       └───────────────┼────────────────────┘             │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │ HTTPS
┌───────────────────────┼──────────────────────────────────┐
│              Next.js API Routes (Vercel)                  │
│  ┌────────────┐ ┌──────────┐ ┌─────────┐ ┌───────────┐  │
│  │ /api/auth  │ │/api/prob │ │/api/code│ │/api/review│  │
│  │ (NextAuth) │ │(generate)│ │(execute)│ │ (feedback)│  │
│  └─────┬──────┘ └────┬─────┘ └────┬────┘ └─────┬─────┘  │
│        │             │            │             │        │
└────────┼─────────────┼────────────┼─────────────┼────────┘
         │             │            │             │
    ┌────▼────┐   ┌────▼────┐  ┌───▼─────┐  ┌───▼─────┐
    │ Google  │   │ Gemini  │  │ Judge0  │  │ Gemini  │
    │ OAuth   │   │   API   │  │   API   │  │   API   │
    └─────────┘   └─────────┘  └─────────┘  └─────────┘
         │
    ┌────▼─────────────────────────────────────────────┐
    │              MongoDB Atlas                        │
    │  ┌──────────┐  ┌────────────────────────┐        │
    │  │  Users   │  │  PracticeSessions      │        │
    │  └──────────┘  └────────────────────────┘        │
    └──────────────────────────────────────────────────┘
```

### 1.2 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | latest |
| Code Editor | @monaco-editor/react | 4.x |
| Database | MongoDB (Mongoose ODM) | 8.x |
| Auth | NextAuth.js | 4.x |
| AI | @google/generative-ai (Gemini) | latest |
| Code Execution | Judge0 API (RapidAPI) | v1 |
| Charts | Chart.js + react-chartjs-2 | 4.x / 5.x |
| Deployment | Vercel | — |

---

## 2. Project Structure

```
interview-prep-coach/
├── app/
│   ├── layout.tsx                          # Root layout (navbar, providers, fonts)
│   ├── page.tsx                            # Landing page (topic/difficulty selection)
│   ├── globals.css                         # Tailwind base + custom styles
│   ├── practice/
│   │   └── page.tsx                        # Practice page (split-screen editor)
│   ├── dashboard/
│   │   └── page.tsx                        # Analytics dashboard (auth-protected)
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts                # NextAuth handler
│       ├── problems/
│       │   ├── generate/
│       │   │   └── route.ts                # POST: Generate problem via Gemini
│       │   └── hint/
│       │       └── route.ts                # POST: Progressive hints via Gemini
│       ├── code/
│       │   └── execute/
│       │       └── route.ts                # POST: Execute code via Judge0
│       ├── review/
│       │   └── route.ts                    # POST: AI review via Gemini
│       └── progress/
│           └── route.ts                    # GET/POST: Practice session CRUD
├── components/
│   ├── Navbar.tsx                          # Top navigation bar
│   ├── TopicGrid.tsx                       # Topic selection cards
│   ├── DifficultySelector.tsx              # Easy/Medium/Hard pills
│   ├── ProblemPanel.tsx                    # Problem description panel
│   ├── CodeEditor.tsx                      # Monaco Editor wrapper
│   ├── TestResults.tsx                     # Test case results display
│   ├── ReviewPanel.tsx                     # AI review slide-in sheet
│   ├── HintDialog.tsx                      # Progressive hint modal
│   ├── AuthButton.tsx                      # Sign-in / avatar dropdown
│   ├── providers/
│   │   ├── SessionProvider.tsx             # NextAuth session provider
│   │   └── ThemeProvider.tsx               # Theme context (if light/dark toggle)
│   └── dashboard/
│       ├── SummaryCards.tsx                 # Stat overview cards
│       ├── TopicChart.tsx                  # Radar chart by topic
│       ├── DifficultyChart.tsx             # Doughnut chart by difficulty
│       ├── ProgressChart.tsx               # Line chart over time
│       └── RecentSessions.tsx              # Session history table
├── hooks/
│   ├── useLocalProgress.ts                 # Guest localStorage progress
│   └── useTimer.ts                         # Practice session timer
├── lib/
│   ├── mongodb.ts                          # MongoDB connection singleton
│   ├── gemini.ts                           # Gemini API client + helpers
│   ├── judge0.ts                           # Judge0 API client + helpers
│   └── auth.ts                             # NextAuth config (providers, callbacks)
├── models/
│   ├── User.ts                             # Mongoose User schema
│   └── PracticeSession.ts                  # Mongoose PracticeSession schema
├── types/
│   └── index.ts                            # Shared TypeScript types/interfaces
├── .env.local.example                      # Environment variable template
├── next.config.js                          # Next.js config
├── tailwind.config.ts                      # Tailwind config
├── tsconfig.json                           # TypeScript config
├── package.json
└── README.md
```

---

## 3. Data Models

### 3.1 User

```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;              // unique, indexed
  image?: string;             // Google profile picture URL
  googleId: string;           // unique, indexed
  createdAt: Date;
  updatedAt: Date;
}
```

**Mongoose Schema:**

```typescript
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  googleId: { type: String, required: true, unique: true },
}, { timestamps: true });
```

### 3.2 PracticeSession

```typescript
interface IPracticeSession {
  _id: ObjectId;
  userId: ObjectId;           // ref: User, indexed
  topic: Topic;               // enum
  difficulty: Difficulty;     // enum
  language: Language;         // enum
  problem: {
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
      time: string;           // e.g., "O(n)"
      space: string;          // e.g., "O(1)"
    };
  };
  userSolution: string;       // user's submitted code
  testResults: Array<{
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    executionTime?: number;   // ms
    memoryUsed?: number;      // KB
  }>;
  aiReview: {
    correctness: string;
    timeComplexity: string;
    spaceComplexity: string;
    issues: string[];
    optimizations: string[];
    score: number;            // 1-10
    optimalSolution: string;
  } | null;
  hintsUsed: number;          // 0-3
  status: 'in-progress' | 'attempted' | 'solved' | 'skipped';
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.3 Enums

```typescript
type Topic =
  | 'arrays'
  | 'strings'
  | 'linked-lists'
  | 'trees'
  | 'graphs'
  | 'dynamic-programming'
  | 'sorting-searching'
  | 'system-design';

type Difficulty = 'easy' | 'medium' | 'hard';

type Language = 'python' | 'javascript' | 'java' | 'cpp';
```

### 3.4 Indexes

| Collection | Index | Type | Purpose |
|------------|-------|------|---------|
| users | `email` | Unique | Lookup by email |
| users | `googleId` | Unique | OAuth identification |
| practice_sessions | `userId` | Standard | Fetch user's sessions |
| practice_sessions | `userId, topic` | Compound | Dashboard topic aggregation |
| practice_sessions | `userId, createdAt` | Compound | Recent sessions, time-series |

---

## 4. API Specification

### 4.1 Authentication

Handled entirely by NextAuth.js. No custom auth endpoints.

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler (signin, signout, session, callback) |

**NextAuth Config:**
- Provider: Google OAuth 2.0
- Callbacks: `signIn` (upsert user in MongoDB), `session` (attach userId to session)
- Session strategy: JWT (no database sessions — faster, stateless)

---

### 4.2 POST `/api/problems/generate`

Generate a coding problem using Gemini.

**Request:**
```json
{
  "topic": "arrays",
  "difficulty": "medium",
  "language": "python"
}
```

**Response (200):**
```json
{
  "problem": {
    "title": "Two Sum Sorted",
    "description": "Given a sorted array of integers and a target sum, find two numbers that add up to the target. Return their indices (1-indexed).",
    "constraints": [
      "2 ≤ nums.length ≤ 10^4",
      "-10^9 ≤ nums[i] ≤ 10^9",
      "Exactly one solution exists",
      "Array is sorted in non-decreasing order"
    ],
    "examples": [
      {
        "input": "nums = [2, 7, 11, 15], target = 9",
        "output": "[1, 2]",
        "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
      }
    ],
    "testCases": [
      { "input": "[2, 7, 11, 15]\n9", "expectedOutput": "[1, 2]" },
      { "input": "[1, 3, 4, 5, 7, 11]\n9", "expectedOutput": "[3, 4]" },
      { "input": "[-3, -1, 0, 1, 5]\n-4", "expectedOutput": "[1, 2]" },
      { "input": "[1, 2]\n3", "expectedOutput": "[1, 2]" }
    ],
    "optimalComplexity": {
      "time": "O(n)",
      "space": "O(1)"
    },
    "starterCode": {
      "python": "def two_sum_sorted(nums: list[int], target: int) -> list[int]:\n    pass",
      "javascript": "function twoSumSorted(nums, target) {\n  \n}",
      "java": "class Solution {\n    public int[] twoSumSorted(int[] nums, int target) {\n        \n    }\n}",
      "cpp": "class Solution {\npublic:\n    vector<int> twoSumSorted(vector<int>& nums, int target) {\n        \n    }\n};"
    }
  }
}
```

**Error (500):**
```json
{
  "error": "Failed to generate problem. Please try again."
}
```

**Gemini Prompt Template:**
```
You are an expert coding interview problem designer. Generate a {difficulty} 
difficulty coding problem about {topic}.

Return a JSON object with exactly these fields:
- title: string (concise problem name)
- description: string (clear problem statement, 2-4 paragraphs)
- constraints: string[] (4-6 constraints with ranges)
- examples: array of {input, output, explanation}  (2-3 examples)
- testCases: array of {input, expectedOutput} (4-5 test cases including edge cases)
- optimalComplexity: {time: string, space: string}
- starterCode: {python, javascript, java, cpp} (function signatures only)

Requirements:
- Problem should be realistic for a {difficulty} technical interview
- Test cases must include: normal case, edge case (empty/single element), large input boundary
- Input format for test cases: one value per line, arrays as JSON
- Output format: single value or JSON array
- Do NOT include the solution
- Return ONLY valid JSON, no markdown or code blocks
```

---

### 4.3 POST `/api/problems/hint`

Return a progressive hint for the current problem.

**Request:**
```json
{
  "problem": { "title": "...", "description": "...", "constraints": [...] },
  "hintLevel": 1,
  "topic": "arrays"
}
```

**Response (200):**
```json
{
  "hint": "Think about how you can exploit the fact that the array is already sorted. What technique works well with sorted data?",
  "level": 1,
  "hasMore": true
}
```

**Hint levels:**
| Level | Content | Example |
|-------|---------|---------|
| 1 | General approach direction | "Consider a two-pointer technique" |
| 2 | Specific algorithm/data structure | "Use left and right pointers, moving based on sum comparison" |
| 3 | Pseudocode outline | Step-by-step pseudocode with logic |

---

### 4.4 POST `/api/code/execute`

Execute user code against test cases via Judge0.

**Request:**
```json
{
  "code": "def two_sum_sorted(nums, target):\n    l, r = 0, len(nums)-1\n    while l < r:\n        s = nums[l] + nums[r]\n        if s == target: return [l+1, r+1]\n        elif s < target: l += 1\n        else: r -= 1",
  "language": "python",
  "testCases": [
    { "input": "[2, 7, 11, 15]\n9", "expectedOutput": "[1, 2]" }
  ]
}
```

**Response (200):**
```json
{
  "results": [
    {
      "testCase": 1,
      "input": "[2, 7, 11, 15]\n9",
      "expectedOutput": "[1, 2]",
      "actualOutput": "[1, 2]",
      "passed": true,
      "executionTime": 42,
      "memoryUsed": 9216,
      "status": "Accepted"
    }
  ],
  "summary": {
    "total": 4,
    "passed": 4,
    "failed": 0,
    "allPassed": true
  }
}
```

**Judge0 Integration Details:**

| Language | Judge0 ID | Wrapper Approach |
|----------|-----------|-----------------|
| Python 3 | 71 | Wrap user function + test harness reading stdin |
| JavaScript (Node.js) | 63 | Same pattern with `process.stdin` |
| Java | 62 | Wrap in `Main` class with `Scanner` |
| C++ | 54 | Wrap with `#include` and `cin` |

**Code wrapping strategy:** The API wraps the user's function code with a test harness that:
1. Reads the test input from stdin
2. Parses it into the appropriate types
3. Calls the user's function
4. Prints the result to stdout
5. Judge0 compares stdout to expected output

---

### 4.5 POST `/api/review`

Submit solution for AI review.

**Request:**
```json
{
  "problem": { "title": "...", "description": "...", "constraints": [...] },
  "userSolution": "def two_sum_sorted(nums, target): ...",
  "language": "python",
  "testResults": {
    "total": 4,
    "passed": 3,
    "failed": 1
  }
}
```

**Response (200):**
```json
{
  "review": {
    "correctness": "Your solution handles most cases correctly but fails on negative numbers. The comparison logic doesn't account for...",
    "timeComplexity": "O(n) — You use a two-pointer approach that scans the array once.",
    "spaceComplexity": "O(1) — Only constant extra space is used.",
    "issues": [
      "Edge case: negative numbers cause incorrect pointer movement on line 5",
      "Variable naming: 's' is unclear, consider 'current_sum'"
    ],
    "optimizations": [
      "Early termination: if nums[l] + nums[l+1] > target, no solution exists with current left pointer",
      "Consider adding input validation for production code"
    ],
    "score": 7,
    "optimalSolution": "def two_sum_sorted(nums, target):\n    left, right = 0, len(nums) - 1\n    while left < right:\n        current_sum = nums[left] + nums[right]\n        if current_sum == target:\n            return [left + 1, right + 1]\n        elif current_sum < target:\n            left += 1\n        else:\n            right -= 1\n    return []"
  }
}
```

**Gemini Review Prompt Template:**
```
You are an expert code reviewer for technical interviews. Analyze the following 
solution and provide structured feedback.

**Problem:** {problem.title}
{problem.description}

**Constraints:** {problem.constraints}

**User's Solution ({language}):**
```{language}
{userSolution}
```

**Test Results:** {testResults.passed}/{testResults.total} passed

Provide feedback as a JSON object with these fields:
- correctness: string (2-3 sentence assessment of solution correctness)
- timeComplexity: string (Big-O analysis with explanation)
- spaceComplexity: string (Big-O analysis with explanation)
- issues: string[] (specific issues found, reference line numbers if applicable)
- optimizations: string[] (concrete improvement suggestions)
- score: number (1-10 overall score)
- optimalSolution: string (complete optimal solution in {language})

Be constructive and educational. Explain *why* something is an issue, not just *what*.
Return ONLY valid JSON.
```

---

### 4.6 GET `/api/progress`

Fetch authenticated user's practice history.

**Headers:** Session cookie (NextAuth)

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Max sessions to return |
| `topic` | string | all | Filter by topic |
| `offset` | number | 0 | Pagination offset |

**Response (200):**
```json
{
  "sessions": [
    {
      "_id": "...",
      "topic": "arrays",
      "difficulty": "medium",
      "problem": { "title": "Two Sum Sorted" },
      "language": "python",
      "status": "solved",
      "score": 7,
      "hintsUsed": 1,
      "createdAt": "2026-03-20T10:30:00Z"
    }
  ],
  "stats": {
    "totalSolved": 42,
    "totalAttempted": 55,
    "averageScore": 7.2,
    "currentStreak": 5,
    "topicBreakdown": {
      "arrays": { "solved": 12, "avgScore": 8.1 },
      "trees": { "solved": 3, "avgScore": 5.5 }
    },
    "difficultyBreakdown": {
      "easy": 20,
      "medium": 18,
      "hard": 4
    },
    "weeklyProgress": [
      { "week": "2026-W11", "count": 8 },
      { "week": "2026-W12", "count": 12 }
    ]
  },
  "total": 55
}
```

### 4.7 POST `/api/progress`

Save a completed practice session.

**Request:**
```json
{
  "topic": "arrays",
  "difficulty": "medium",
  "language": "python",
  "problem": { ... },
  "userSolution": "...",
  "testResults": [ ... ],
  "aiReview": { ... },
  "hintsUsed": 1,
  "status": "solved"
}
```

**Response (201):**
```json
{
  "sessionId": "...",
  "message": "Session saved successfully"
}
```

**Auth required:** Yes (401 if not authenticated)

---

## 5. External API Integration

### 5.1 Google Gemini API

**SDK:** `@google/generative-ai`

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateContent(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export function parseJsonResponse<T>(text: string): T {
  // Strip markdown code blocks if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
```

**Rate Limits (Free Tier):**
- 15 requests/minute
- 1,500 requests/day
- 1 million tokens/minute

### 5.2 Judge0 API

**Host:** RapidAPI (`judge0-ce.p.rapidapi.com`) or self-hosted

```typescript
// lib/judge0.ts
const LANGUAGE_MAP: Record<Language, number> = {
  python: 71,      // Python 3.8.1
  javascript: 63,  // Node.js 12.14.0
  java: 62,        // Java OpenJDK 13.0.1
  cpp: 54,         // C++ GCC 9.2.0
};

interface Judge0Submission {
  source_code: string;  // base64 encoded
  language_id: number;
  stdin: string;        // base64 encoded
  expected_output: string; // base64 encoded
  cpu_time_limit: number;  // seconds
  memory_limit: number;    // KB
}
```

**Execution Flow:**
1. Wrap user code with test harness for the selected language
2. Base64-encode source code, stdin, and expected output
3. POST to `/submissions/batch` with `wait=false`
4. Poll GET `/submissions/batch?tokens=...` every 1 second (max 15 attempts)
5. Parse results: status ID 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit, etc.

**Rate Limits (RapidAPI Free):**
- ~100 submissions/day
- 50 submissions/batch

### 5.3 Google OAuth 2.0

**NextAuth Configuration:**

```typescript
// lib/auth.ts
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      // Upsert user in MongoDB
      await connectDB();
      await UserModel.findOneAndUpdate(
        { email: user.email },
        { name: user.name, email: user.email, image: user.image, googleId: account?.providerAccountId },
        { upsert: true, new: true }
      );
      return true;
    },
    async session({ session, token }) {
      // Attach MongoDB userId to session
      const dbUser = await UserModel.findOne({ email: session.user?.email });
      if (dbUser) session.user.id = dbUser._id.toString();
      return session;
    },
  },
};
```

---

## 6. Frontend Components

### 6.1 Component Tree

```
RootLayout
├── SessionProvider (NextAuth)
├── Navbar
│   ├── Logo
│   ├── NavLinks (Practice, Dashboard)
│   └── AuthButton (sign-in / avatar dropdown)
│
├── LandingPage (/)
│   ├── HeroSection
│   ├── TopicGrid (8 topic cards)
│   ├── DifficultySelector (Easy/Medium/Hard)
│   └── StartButton
│
├── PracticePage (/practice)
│   ├── ProblemPanel (left)
│   │   ├── ProblemTitle + DifficultyBadge
│   │   ├── ProblemDescription
│   │   ├── ConstraintsList
│   │   ├── ExamplesBlock
│   │   ├── HintButton → HintDialog
│   │   └── Timer
│   ├── EditorPanel (right)
│   │   ├── LanguageSelector
│   │   ├── CodeEditor (Monaco)
│   │   ├── ActionButtons (Run, Submit)
│   │   └── TestResults
│   └── ReviewPanel (Sheet, slides from right)
│       ├── CorrectnessSection
│       ├── ComplexitySection
│       ├── IssuesSection
│       ├── OptimizationsSection
│       ├── ScoreBadge
│       └── OptimalSolutionToggle
│
└── DashboardPage (/dashboard)
    ├── SummaryCards (4 stat cards)
    ├── TopicChart (Radar)
    ├── DifficultyChart (Doughnut)
    ├── ProgressChart (Line)
    ├── WeakAreas
    └── RecentSessions (Table)
```

### 6.2 Key Component Specifications

#### CodeEditor

```typescript
interface CodeEditorProps {
  language: Language;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}
```

- Uses `@monaco-editor/react` with `vs-dark` theme
- Height: fills available space (flex-grow)
- Font: 14px, `JetBrains Mono` or `Fira Code`
- Language mapping: `python` → `python`, `javascript` → `javascript`, `java` → `java`, `cpp` → `cpp`
- minimap disabled, word wrap on, line numbers on

#### TopicGrid

```typescript
const TOPICS = [
  { id: 'arrays', label: 'Arrays', icon: '📊', description: 'Array manipulation, searching, sorting' },
  { id: 'strings', label: 'Strings', icon: '🔤', description: 'String processing, pattern matching' },
  { id: 'linked-lists', label: 'Linked Lists', icon: '🔗', description: 'Singly/doubly linked lists' },
  { id: 'trees', label: 'Trees', icon: '🌳', description: 'BST, binary trees, traversals' },
  { id: 'graphs', label: 'Graphs', icon: '🕸️', description: 'BFS, DFS, shortest paths' },
  { id: 'dynamic-programming', label: 'Dynamic Programming', icon: '🧩', description: 'Memoization, tabulation' },
  { id: 'sorting-searching', label: 'Sorting & Searching', icon: '🔍', description: 'Binary search, merge sort, etc.' },
  { id: 'system-design', label: 'System Design', icon: '🏗️', description: 'Architecture, scalability, design patterns' },
];
```

#### ReviewPanel

- shadcn `Sheet` component (side = "right", width = 480px)
- Sections separated by `Separator` components
- Score displayed as large circular badge with color coding (1-3 red, 4-6 orange, 7-10 green)
- "Show Optimal Solution" toggles a code block with syntax highlighting

---

## 7. State Management

### 7.1 Client-Side State (React useState/useReducer)

| State | Location | Type |
|-------|----------|------|
| Selected topic | Landing page | `Topic \| null` |
| Selected difficulty | Landing page | `Difficulty` |
| Current problem | Practice page | `Problem \| null` |
| Editor code | Practice page | `Record<Language, string>` (per-language) |
| Selected language | Practice page | `Language` |
| Test results | Practice page | `TestResult[]` |
| AI review | Practice page | `Review \| null` |
| Current hint level | Practice page | `number` (0-3) |
| Review panel open | Practice page | `boolean` |
| Loading states | Practice page | `{ generating, executing, reviewing }` |

### 7.2 Server State

- **Auth session:** Managed by NextAuth (JWT in cookie)
- **User progress:** Fetched via `GET /api/progress`, cached by React Query or SWR (optional; simple `fetch` + `useEffect` for MVP)
- **No global state library needed** — page-scoped `useState` is sufficient

### 7.3 Guest Mode (localStorage)

```typescript
// hooks/useLocalProgress.ts
interface LocalSession {
  topic: Topic;
  difficulty: Difficulty;
  problemTitle: string;
  score: number | null;
  status: string;
  timestamp: number;
}

const STORAGE_KEY = 'interview-prep-guest-progress';

function saveLocalSession(session: LocalSession): void { ... }
function getLocalSessions(): LocalSession[] { ... }
function getLocalStats(): GuestStats { ... }
```

---

## 8. Security Considerations

| Concern | Mitigation |
|---------|------------|
| **API key exposure** | All API keys server-side only (env vars), never sent to client |
| **Code injection** | User code runs in Judge0 sandbox (isolated containers), never on our server |
| **XSS** | React's default escaping, no `dangerouslySetInnerHTML` for user content |
| **CSRF** | NextAuth includes CSRF protection by default |
| **Rate limiting** | Implement per-IP rate limiting on API routes (10 req/min for generate/review) |
| **Input validation** | Validate request body schemas (topic must be valid enum, code length capped at 10KB) |
| **MongoDB injection** | Mongoose ODM provides query sanitization; no raw queries |
| **Auth bypass** | All `/api/progress` routes check `getServerSession()`, return 401 if unauthenticated |

### Rate Limiting Implementation

```typescript
// Simple in-memory rate limiter for serverless (per-instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}
```

---

## 9. Error Handling Strategy

### 9.1 API Error Responses

All API routes return consistent error shapes:

```typescript
interface ApiError {
  error: string;       // Human-readable message
  code?: string;       // Machine-readable error code
  details?: unknown;   // Additional context (dev only)
}
```

### 9.2 Error Scenarios

| Scenario | Status | Message | Recovery |
|----------|--------|---------|----------|
| Gemini API timeout | 504 | "Problem generation timed out. Please try again." | Retry button |
| Gemini returns invalid JSON | 500 | "Failed to generate problem. Please try again." | Auto-retry once, then show error |
| Judge0 API down | 503 | "Code execution service is temporarily unavailable." | Retry after 30s |
| Judge0 rate limit | 429 | "Daily execution limit reached. Please try again tomorrow." | Show limit info |
| Code execution timeout | 408 | "Your code exceeded the time limit (10s)." | Show in test results |
| Runtime error | 200 | N/A | Show stderr in test results |
| Unauthenticated dashboard access | 401 | Redirect to sign-in page | Auto-redirect |
| Invalid request body | 400 | "Invalid request: {details}" | Show form validation |

### 9.3 Client-Side Error Display

- **Toast notifications** (shadcn `Sonner` or custom) for transient errors
- **Inline error states** for form validation
- **Full-page error boundaries** for unexpected crashes

---

## 10. Performance Considerations

| Area | Optimization |
|------|-------------|
| **Cold starts** | Vercel serverless functions warm up in ~200ms; Gemini/Judge0 latency dominates |
| **MongoDB connection** | Connection caching via global promise (standard Next.js pattern) |
| **Monaco Editor** | Lazy-loaded with `next/dynamic` + `ssr: false` (large bundle) |
| **Chart.js** | Lazy-loaded on dashboard page only |
| **Problem generation** | Show skeleton UI during 5-10s Gemini response |
| **Code execution** | Polling with exponential backoff (1s, 2s, 4s) max 15 attempts |
| **Bundle size** | Tree-shake shadcn components (imported individually, not bundled) |

---

## 11. Environment Variables

```env
# .env.local.example

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/interview-prep-coach

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Judge0 (RapidAPI)
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-rapidapi-key
```

---

## 12. Deployment Configuration

### 12.1 Vercel

- **Build command:** `next build`
- **Output directory:** `.next`
- **Node.js version:** 20.x
- **Environment variables:** Set via Vercel dashboard (all from `.env.local.example`)
- **Regions:** Auto (edge-optimized)

### 12.2 MongoDB Atlas

- **Tier:** M0 Free (512 MB storage, shared RAM)
- **Region:** Same as Vercel deployment region (e.g., US East)
- **Network access:** Allow Vercel IP ranges (or `0.0.0.0/0` for serverless)
- **Collections:** `users`, `practicesessions`

### 12.3 Google Cloud Console

- **OAuth consent screen:** External, testing mode initially
- **Authorized redirect URIs:**
  - `http://localhost:3000/api/auth/callback/google` (dev)
  - `https://your-domain.vercel.app/api/auth/callback/google` (prod)

---

## 13. Testing Strategy

| Type | Tool | Scope |
|------|------|-------|
| **Unit tests** | Jest + React Testing Library | Utility functions, JSON parsing, rate limiter |
| **API route tests** | Jest + supertest (or Next.js test utils) | Each API endpoint with mocked external APIs |
| **Component tests** | React Testing Library | Form interactions, state changes, conditional rendering |
| **E2E tests** | Playwright (post-MVP) | Full user flows: sign in → practice → review → dashboard |
| **Manual testing** | Browser DevTools | Responsive design, loading states, error scenarios |

### Key Test Cases

| Test | Expected Result |
|------|----------------|
| Generate problem with valid topic/difficulty | Returns valid JSON with all required fields |
| Generate problem with invalid topic | Returns 400 error |
| Execute correct Python solution | All test cases pass |
| Execute solution with runtime error | Status shows error with stderr |
| Execute solution exceeding time limit | Returns TLE status |
| Submit review for solved problem | Returns structured review with score 1-10 |
| Fetch progress as unauthenticated user | Returns 401 |
| Fetch progress as authenticated user | Returns sessions and stats |
| Rate limit exceeded | Returns 429 with retry info |
