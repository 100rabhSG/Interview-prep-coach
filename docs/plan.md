# Plan: Interview Prep Coach Web App

## TL;DR
Build a full-stack Next.js 14 (App Router) web app that serves as a personal interview prep coach. Users select a topic/difficulty, receive AI-generated coding problems, write solutions in Monaco Editor, get code executed via Judge0, and receive AI-powered feedback from Gemini. A dashboard tracks progress over time.

## Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** MongoDB via Mongoose
- **Auth:** NextAuth.js with Google OAuth provider
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)
- **Code Execution:** Judge0 API (hosted: judge0.com or RapidAPI)
- **AI:** Google Gemini API (`@google/generative-ai`)
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Chart.js (`react-chartjs-2`)
- **Deployment:** Vercel
- **Languages supported:** Python, JavaScript, Java, C++

## Architecture Overview

```
Pages (App Router)
├── / (Landing + Topic Selection)
├── /practice (Split-screen: Problem + Editor)
├── /dashboard (Progress Analytics)
├── /api/auth/[...nextauth] (Google OAuth)
├── /api/problems/generate (Gemini → generate problem)
├── /api/problems/hint (Gemini → progressive hints)
├── /api/code/execute (Judge0 → run code)
├── /api/review (Gemini → analyze solution)
└── /api/progress/* (CRUD user progress)
```

## Steps

### Phase 1: Project Scaffolding & Core Setup
1. Initialize Next.js 14 project with TypeScript, Tailwind CSS, ESLint
2. Install and configure shadcn/ui (init + add components: Button, Card, Select, Dialog, Tabs, Badge, Progress, Sheet, Separator, Avatar, DropdownMenu, Skeleton)
3. Set up environment variables file (`.env.local.example`) for: `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GEMINI_API_KEY`, `JUDGE0_API_URL`, `JUDGE0_API_KEY`
4. Set up MongoDB connection utility (`lib/mongodb.ts`) with connection caching for serverless
5. Define Mongoose models:
   - `User` — name, email, image, googleId, createdAt
   - `PracticeSession` — userId, topic, difficulty, problem (title, description, constraints, examples, testCases), userSolution, language, aiReview, hints used, status (solved/attempted/skipped), score, createdAt
6. Set up NextAuth.js with Google OAuth provider + MongoDB adapter (`next-auth/mongodb-adapter` or custom callbacks to store user in MongoDB)

### Phase 2: Landing Page & Topic Selection
7. Build layout (`app/layout.tsx`) — navbar with logo, nav links (Practice, Dashboard), auth button (Google sign-in / avatar dropdown), responsive
8. Build landing page (`app/page.tsx`) — hero section with tagline, topic selection grid (Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, Sorting/Searching, System Design), difficulty selector (Easy/Medium/Hard), "Start Practice" CTA
9. Implement guest mode — if not signed in, allow practice but store progress in localStorage; show prompt to sign in to save progress

### Phase 3: Problem Generation (Gemini API)
10. Create Gemini API utility (`lib/gemini.ts`) — initialize client, helper for structured prompts
11. Build POST `/api/problems/generate` — accepts `{ topic, difficulty, language }`, sends structured prompt to Gemini requesting: title, description, constraints, examples (input/output), test cases (input, expectedOutput), optimal time/space complexity, solution approach. Parse and validate JSON response
12. Design the prompt template for problem generation — instruct Gemini to return valid JSON with specific fields, include 3-5 test cases with edge cases, ensure problems are interview-caliber

### Phase 4: Practice Page (Split-Screen Editor)
13. Build practice page layout (`app/practice/page.tsx`) — split-screen: left panel (problem description), right panel (Monaco Editor + controls)
14. Left panel: problem title, difficulty badge, description, constraints list, example I/O in formatted blocks, hint button (progressive), timer (optional)
15. Right panel: language selector dropdown (Python/JS/Java/C++), Monaco Editor configured with language-appropriate syntax highlighting and settings, Run button, Submit for Review button
16. Integrate `@monaco-editor/react` with proper TypeScript types, theme (vs-dark), language switching, editor value state management
17. Build hint system — POST `/api/problems/hint` — accepts problem context + current hint level (1-3), returns progressively more revealing hints. Level 1: approach direction, Level 2: algorithm/data structure, Level 3: pseudocode outline

### Phase 5: Code Execution (Judge0)
18. Create Judge0 utility (`lib/judge0.ts`) — language ID mapping (Python=71, JS=63, Java=62, C++=54), submission helper, result polling
19. Build POST `/api/code/execute` — accepts `{ code, language, testCases }`, submits to Judge0 batch endpoint, polls for results, returns per-test-case pass/fail with actual vs expected output
20. Display execution results in the practice page — test case results panel below editor showing pass/fail for each case, stdout, stderr, execution time, memory

### Phase 6: AI Review (Gemini)
21. Build POST `/api/review` — accepts `{ problem, userSolution, language, testResults }`, sends to Gemini with structured prompt requesting: correctness assessment, time/space complexity analysis, code quality feedback, specific issues found, optimization suggestions, overall score (1-10)
22. Design review prompt template — include problem description, user code, test results, ask for structured JSON feedback
23. Build review slide-in panel (Sheet component) on practice page — shows AI feedback sections: Correctness, Complexity Analysis, Issues Found, Optimizations, Score. Include "Show Optimal Solution" button that reveals Gemini-generated optimal solution side-by-side

### Phase 7: Progress Tracking & Dashboard
24. Build POST `/api/progress` — save practice session to MongoDB (linked to userId if authenticated, skip if guest)
25. Build GET `/api/progress` — fetch user's practice history with aggregations (by topic, difficulty, time range)
26. Build dashboard page (`app/dashboard/page.tsx`) — requires auth (redirect to sign-in if not authenticated)
27. Dashboard components:
   - Summary cards: Total problems solved, current streak, average score, strongest/weakest topic
   - Topic breakdown chart (radar/polar chart via Chart.js) — performance by topic
   - Difficulty distribution (doughnut chart) — Easy/Medium/Hard solved counts
   - Progress over time (line chart) — problems solved per week
   - Recent sessions table — topic, difficulty, score, date, link to review
   - Weak areas section — topics with lowest scores, suggested practice

### Phase 8: Polish & Edge Cases
28. Add loading states (Skeleton components) for problem generation, code execution, AI review
29. Add error handling and toast notifications for API failures
30. Responsive design — mobile layout stacks problem/editor vertically, collapsible panels
31. Add metadata, favicon, OG tags for SEO
32. Rate limiting on API routes (especially Gemini and Judge0 calls)

### Phase 9: Deployment
33. Configure Vercel project — environment variables, build settings
34. Set up MongoDB Atlas free tier cluster
35. Configure Google OAuth redirect URIs for production domain
36. Test end-to-end flow on deployed version

## Relevant Files (to be created)

### Config & Setup
- `app/layout.tsx` — root layout with navbar, auth provider, font setup
- `app/globals.css` — Tailwind base styles
- `lib/mongodb.ts` — MongoDB connection singleton with caching
- `lib/gemini.ts` — Gemini API client initialization and helpers
- `lib/judge0.ts` — Judge0 API helpers (submit, poll, language mapping)
- `lib/auth.ts` — NextAuth configuration (Google provider, MongoDB adapter, callbacks)
- `models/User.ts` — Mongoose User schema
- `models/PracticeSession.ts` — Mongoose PracticeSession schema
- `.env.local.example` — template for env vars

### Pages
- `app/page.tsx` — landing page with topic/difficulty selection
- `app/practice/page.tsx` — main practice page (split-screen)
- `app/dashboard/page.tsx` — analytics dashboard (protected)
- `app/api/auth/[...nextauth]/route.ts` — NextAuth API route

### API Routes
- `app/api/problems/generate/route.ts` — Gemini problem generation
- `app/api/problems/hint/route.ts` — progressive hints
- `app/api/code/execute/route.ts` — Judge0 code execution
- `app/api/review/route.ts` — AI solution review
- `app/api/progress/route.ts` — save/fetch practice sessions

### Components
- `components/Navbar.tsx` — top navigation bar
- `components/TopicGrid.tsx` — topic selection cards
- `components/DifficultySelector.tsx` — Easy/Medium/Hard selector
- `components/ProblemPanel.tsx` — left panel problem display
- `components/CodeEditor.tsx` — Monaco Editor wrapper
- `components/TestResults.tsx` — execution results display
- `components/ReviewPanel.tsx` — AI review slide-in sheet
- `components/HintDialog.tsx` — progressive hint dialog
- `components/dashboard/SummaryCards.tsx` — stat cards
- `components/dashboard/TopicChart.tsx` — radar chart
- `components/dashboard/ProgressChart.tsx` — line chart over time
- `components/dashboard/RecentSessions.tsx` — history table

### Hooks
- `hooks/useLocalProgress.ts` — guest mode localStorage progress tracking
- `hooks/useTimer.ts` — practice session timer

## Verification
1. **Auth flow:** Sign in with Google → verify user created in MongoDB → sign out → sign back in → verify session persists
2. **Problem generation:** Select each topic + difficulty combo → verify Gemini returns valid structured problem with test cases → verify problem renders correctly
3. **Code editor:** Switch languages → verify syntax highlighting changes → type code → verify state preserved on language switch
4. **Code execution:** Write correct solution → run → verify all test cases pass. Write incorrect solution → verify failures shown with actual vs expected
5. **AI review:** Submit solution → verify review panel shows structured feedback with score, complexity analysis, issues, optimizations
6. **Hints:** Request hints 1→2→3 → verify progressive revelation (direction → algorithm → pseudocode)
7. **Optimal solution:** After review, click "Show Optimal Solution" → verify side-by-side display
8. **Dashboard (auth'd):** Solve 3+ problems across topics → verify charts update, summary cards accurate, recent sessions show
9. **Guest mode:** Practice without signing in → verify localStorage tracks progress → sign in → verify dashboard shows only DB-stored sessions
10. **Responsive:** Test on mobile viewport → verify stacked layout, all panels accessible
11. **Error handling:** Disconnect network → verify graceful error messages. Send malformed requests → verify 400 responses
12. **Vercel deploy:** Push to GitHub → verify Vercel auto-deploys → test production flow end-to-end

## Decisions
- **App Router** (not Pages Router) — aligns with Next.js 14 best practices and server components
- **Guest mode is localStorage-only** — no server-side anonymous sessions, simplifies backend
- **Judge0 hosted API** — avoids self-hosting complexity; free tier (RapidAPI) is sufficient for MVP
- **Gemini free tier** — sufficient for development and moderate usage
- **No real-time collaboration** — single-user practice tool, out of scope
- **No problem database** — all problems generated on-the-fly by Gemini (no caching/seeding for MVP)
- **System Design topic** — MVP: text-based Q&A using Monaco Editor (same flow as DSA but "Run" button disabled, no code execution). Post-MVP: upgrade to structured form with sections (Requirements, API Design, Data Model, Scaling) — purely additive change, no refactoring needed

## Further Considerations
1. **Problem caching:** Should generated problems be cached in MongoDB to avoid re-generating similar problems and allow sharing? Recommend deferring to post-MVP.
2. **Judge0 rate limits:** The free RapidAPI tier has ~100 submissions/day. For heavier usage, consider self-hosting Judge0 via Docker. Recommend starting with hosted and monitoring usage.
3. **Code execution timeout:** Judge0 default is 5s. For DP/graph problems, may need 10s. Configurable per request.

### Post-MVP Enhancements
1. **Structured System Design form** — replace text-based Q&A with `SystemDesignForm.tsx` component containing sectioned text areas (Requirements, API Design, Data Model, Scaling). Conditional rendering in practice page: if `topic === 'system-design'`, show form instead of Monaco Editor. Tweak AI review prompt to evaluate each section separately.