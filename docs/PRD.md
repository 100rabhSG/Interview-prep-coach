# Product Requirements Document (PRD)

## Interview Prep Coach

**Version:** 1.0  
**Date:** March 20, 2026  
**Status:** Draft

---

## 1. Overview

### 1.1 Product Summary

Interview Prep Coach is a web application that acts as a personal coding interview coach. It generates interview-style coding problems using AI, provides an in-browser code editor for writing solutions, executes code against test cases, and delivers structured AI-powered feedback — all within a clean, focused interface.

### 1.2 Problem Statement

Preparing for technical interviews is time-consuming and often lacks personalized feedback. Existing platforms like LeetCode offer vast problem sets but limited guidance on *why* a solution is suboptimal. Hiring a coach is expensive and hard to schedule. Candidates need an accessible, on-demand tool that adapts to their skill level and gives actionable, personalized feedback.

### 1.3 Target Users

| Segment | Description |
|---------|-------------|
| **Job seekers** | Software engineers preparing for FAANG/startup technical interviews |
| **CS students** | University students building data structures & algorithms proficiency |
| **Career switchers** | Bootcamp graduates or self-taught developers targeting their first SWE role |
| **Refreshers** | Experienced engineers brushing up before an interview cycle |

### 1.4 Value Proposition

- **AI-generated problems** — infinite variety, no memorized answer keys
- **Real code execution** — actually run solutions against test cases, not just LLM simulation
- **Personalized AI review** — line-by-line feedback on correctness, complexity, and code quality
- **Progressive hints** — learn at your own pace without immediately seeing the answer
- **Progress tracking** — identify weak areas and track improvement over time

---

## 2. Goals & Success Metrics

### 2.1 Product Goals

| Priority | Goal |
|----------|------|
| P0 | Users can generate, solve, execute, and get AI feedback on coding problems end-to-end |
| P0 | Users can sign in with Google to persist their progress |
| P1 | Dashboard provides meaningful analytics on practice history and weak areas |
| P1 | Guest mode allows immediate practice without signup friction |
| P2 | Responsive design supports tablet and mobile usage |

### 2.2 Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Problem generation success rate | >95% valid structured problems from Gemini |
| Code execution success rate | >99% (Judge0 availability) |
| AI review quality | Users rate feedback as helpful ≥4/5 |
| Time to first problem | <30 seconds from landing page to generated problem |
| Session completion rate | >60% of started sessions result in a submission |

---

## 3. User Stories & Requirements

### 3.1 Authentication

| ID | Story | Priority |
|----|-------|----------|
| AUTH-1 | As a user, I can sign in with my Google account so my progress is saved | P0 |
| AUTH-2 | As a guest, I can start practicing immediately without creating an account | P0 |
| AUTH-3 | As a signed-in user, I can see my avatar and sign out from the navbar | P1 |
| AUTH-4 | As a guest, I see a prompt encouraging me to sign in to save my progress | P1 |

### 3.2 Topic & Difficulty Selection

| ID | Story | Priority |
|----|-------|----------|
| SEL-1 | As a user, I can choose from 8 topics: Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, Sorting/Searching, System Design | P0 |
| SEL-2 | As a user, I can select a difficulty level: Easy, Medium, or Hard | P0 |
| SEL-3 | As a user, I can click "Start Practice" to generate a problem matching my selections | P0 |
| SEL-4 | As a user, the landing page clearly explains what the app does and how to get started | P1 |

### 3.3 Problem Generation

| ID | Story | Priority |
|----|-------|----------|
| PROB-1 | As a user, I receive an AI-generated coding problem with a title, description, constraints, and examples | P0 |
| PROB-2 | As a user, each problem includes 3-5 test cases (including edge cases) with input/output pairs | P0 |
| PROB-3 | As a user, the problem is appropriate for the selected topic and difficulty | P0 |
| PROB-4 | As a user, I see a loading state while the problem is being generated | P1 |
| PROB-5 | As a user, I can generate a new problem if I want to skip the current one | P1 |

### 3.4 Code Editor

| ID | Story | Priority |
|----|-------|----------|
| EDIT-1 | As a user, I can write code in an in-browser editor with syntax highlighting | P0 |
| EDIT-2 | As a user, I can switch between Python, JavaScript, Java, and C++ | P0 |
| EDIT-3 | As a user, the editor uses a dark theme and supports standard keyboard shortcuts | P0 |
| EDIT-4 | As a user, my code is preserved when I switch languages within the same session | P1 |
| EDIT-5 | As a user, I see a starter code template when a problem loads | P2 |

### 3.5 Code Execution

| ID | Story | Priority |
|----|-------|----------|
| EXEC-1 | As a user, I can run my code against the problem's test cases | P0 |
| EXEC-2 | As a user, I see pass/fail results for each test case with actual vs expected output | P0 |
| EXEC-3 | As a user, I see stdout, stderr, execution time, and memory usage per test case | P1 |
| EXEC-4 | As a user, I see a loading state while code is being executed | P1 |
| EXEC-5 | As a user, I'm notified if my code times out or has a runtime error | P0 |

### 3.6 AI Review & Feedback

| ID | Story | Priority |
|----|-------|----------|
| REV-1 | As a user, I can submit my solution for AI review after running it | P0 |
| REV-2 | As a user, I receive structured feedback: correctness, time/space complexity analysis, issues found, optimization suggestions, and an overall score (1-10) | P0 |
| REV-3 | As a user, the review panel slides in from the right as a side sheet | P1 |
| REV-4 | As a user, I can view the optimal solution side-by-side with mine after review | P0 |
| REV-5 | As a user, I can close the review panel and continue editing | P1 |

### 3.7 Progressive Hints

| ID | Story | Priority |
|----|-------|----------|
| HINT-1 | As a user, I can request a hint when I'm stuck | P0 |
| HINT-2 | As a user, hints reveal progressively: Level 1 (approach direction), Level 2 (algorithm/data structure), Level 3 (pseudocode outline) | P0 |
| HINT-3 | As a user, I see which hint level I'm on and how many remain | P1 |
| HINT-4 | As a user, hints appear in a dialog/modal without leaving the practice view | P1 |

### 3.8 Progress Tracking & Dashboard

| ID | Story | Priority |
|----|-------|----------|
| DASH-1 | As a signed-in user, I can view a dashboard with my practice analytics | P0 |
| DASH-2 | As a user, I see summary cards: total problems solved, current streak, average score, strongest/weakest topic | P0 |
| DASH-3 | As a user, I see a radar chart showing my performance across topics | P1 |
| DASH-4 | As a user, I see a chart of problems solved over time | P1 |
| DASH-5 | As a user, I see a table of recent practice sessions with scores | P0 |
| DASH-6 | As a user, I see my weak areas highlighted with suggestions to practice them | P1 |
| DASH-7 | As a guest, my progress is tracked in localStorage and visible during my session | P1 |
| DASH-8 | As a guest, I'm redirected to sign in when visiting the dashboard page | P1 |

---

## 4. User Flows

### 4.1 Primary Flow: Practice a Problem

```
Landing Page
  → Select topic (e.g., "Arrays")
  → Select difficulty (e.g., "Medium")
  → Click "Start Practice"
  → [Loading] Problem generates via Gemini API
  → Practice Page loads (split-screen)
  → Left: Problem description, constraints, examples
  → Right: Code editor (default: Python)
  → User writes solution
  → Clicks "Run" → code executes via Judge0
  → Test results appear (pass/fail per case)
  → User iterates on solution
  → Clicks "Submit for Review"
  → [Loading] Gemini analyzes solution
  → Review panel slides in with feedback
  → User reads feedback, optionally views optimal solution
  → Session saved to MongoDB (if authenticated)
```

### 4.2 Hint Flow

```
Practice Page (stuck on problem)
  → Clicks "Hint" button
  → Hint dialog shows Level 1: "Consider using a hash map approach"
  → Still stuck → clicks "Next Hint"
  → Level 2: "Use a two-pointer technique with a hash map for O(n) time"
  → Still stuck → clicks "Next Hint"
  → Level 3: Pseudocode outline of the solution
  → No more hints available
```

### 4.3 Guest → Authenticated Flow

```
Landing Page (not signed in)
  → Practices as guest (progress in localStorage)
  → Sees "Sign in to save your progress" prompt
  → Clicks "Sign in with Google"
  → Redirected to Google OAuth → grants permissions
  → Returned to app as authenticated user
  → Future sessions saved to MongoDB
  → Can access Dashboard page
```

---

## 5. Scope & Boundaries

### 5.1 In Scope (MVP)

- AI-generated coding problems across 8 topics and 3 difficulty levels
- In-browser code editor (Monaco) with 4 languages
- Real code execution via Judge0 with test case validation
- AI-powered solution review with structured feedback
- Progressive hint system (3 levels)
- Optimal solution comparison (side-by-side)
- Google OAuth authentication
- Guest mode with localStorage progress
- Dashboard with analytics charts and session history
- Responsive web design

### 5.2 Out of Scope (Post-MVP)

| Feature | Rationale |
|---------|-----------|
| Problem database / caching | All problems generated on-the-fly for MVP; caching adds complexity |
| Multiple OAuth providers (GitHub, etc.) | Google covers the primary use case; others can be added later |
| Real-time collaboration / pair programming | Single-user tool; collaboration is a separate feature set |
| Leaderboards / social features | Focus is personal improvement, not competition |
| Mobile native apps | Web-first approach; responsive design suffices |
| System design diagramming tools | System design uses text-based Q&A; visual tools are complex |
| Custom problem creation | Users solve AI-generated problems; custom problems are a teacher feature |
| Code execution history / replay | Session review shows final code; step-by-step replay is P2 |
| Timed mock interview mode | Timer exists but a structured mock interview flow is post-MVP |
| Subscription / payment | Free product for MVP; monetization is a separate initiative |

---

## 6. Design Guidelines

### 6.1 Visual Design

- **Theme:** Dark-mode primary (matching Monaco Editor), with light-mode option
- **Color palette:** Neutral grays with accent colors for difficulty badges (Green=Easy, Orange=Medium, Red=Hard) and status indicators (Green=Pass, Red=Fail)
- **Typography:** Clean monospace for code, sans-serif (Inter/Geist) for UI text
- **Layout:** Split-screen with resizable panels, slide-in sheets for review

### 6.2 Key UI Components

| Component | Description |
|-----------|-------------|
| **Navbar** | Logo, Practice/Dashboard links, sign-in button or avatar dropdown |
| **Topic Grid** | 8 cards with icons, hover effects, selection state |
| **Difficulty Selector** | Three pill buttons (Easy/Medium/Hard) with color coding |
| **Problem Panel** | Scrollable left panel with formatted problem description |
| **Code Editor** | Monaco Editor with language dropdown, dark theme, full-height |
| **Test Results** | Collapsible panel below editor showing per-test-case results |
| **Review Sheet** | Slide-in panel from right with tabbed feedback sections |
| **Dashboard Cards** | Summary stat cards with icons and trend indicators |
| **Charts** | Radar (topics), Doughnut (difficulty), Line (progress over time) |

### 6.3 Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Desktop (≥1024px) | Side-by-side split-screen layout |
| Tablet (768-1023px) | Stacked layout with collapsible problem panel |
| Mobile (<768px) | Full-width stacked, swipe between problem and editor |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Problem generation <10s, code execution results <15s, page load <3s |
| **Availability** | 99.5% uptime (dependent on Vercel, MongoDB Atlas, Judge0) |
| **Security** | OAuth 2.0 auth, API route rate limiting, input sanitization, no raw code eval on server |
| **Scalability** | Serverless architecture (Vercel) handles traffic spikes; MongoDB Atlas auto-scales |
| **Accessibility** | Keyboard navigation, proper ARIA labels, sufficient color contrast |
| **Browser support** | Chrome, Firefox, Safari, Edge (latest 2 versions) |

---

## 8. Dependencies & Risks

### 8.1 External Dependencies

| Dependency | Risk | Mitigation |
|------------|------|------------|
| Gemini API | Rate limits, downtime, response quality | Retry logic, structured prompts with validation, fallback error messages |
| Judge0 API (RapidAPI) | ~100 submissions/day on free tier | Monitor usage; plan self-hosted Judge0 for scale |
| MongoDB Atlas | Free tier has 512MB storage limit | Monitor storage; upgrade tier as user base grows |
| Google OAuth | Requires Google Cloud Console setup | Clear setup documentation in README |

### 8.2 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini generates invalid/unparseable JSON | Medium | High | Strict prompt engineering, JSON validation, retry on parse failure |
| Judge0 free tier rate limit hit during demos | Medium | Medium | Cache execution results, batch test cases, monitor daily usage |
| AI review gives incorrect complexity analysis | Medium | Low | Disclaimer that AI feedback is approximate; users can flag issues |
| Cold start latency on serverless | Low | Medium | Vercel Edge Functions for critical paths; loading state UX |

---

## 9. Release Plan

### Phase 1 — Foundation (Week 1-2)
- Project scaffolding, auth, database models
- Landing page with topic/difficulty selection

### Phase 2 — Core Loop (Week 3-4)
- Problem generation via Gemini
- Practice page with Monaco Editor
- Code execution via Judge0
- AI review and feedback

### Phase 3 — Polish & Analytics (Week 5-6)
- Progressive hints
- Dashboard with charts and analytics
- Guest mode
- Responsive design, loading states, error handling

### Phase 4 — Launch (Week 7)
- Vercel deployment
- MongoDB Atlas production setup
- End-to-end testing
- README and setup documentation

---

## 10. Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Should we cache generated problems in MongoDB for reuse? | Deferred to post-MVP |
| 2 | Should guests be able to see a limited dashboard from localStorage data? | Guests redirected to sign-in for dashboard |
| 3 | How should System Design problems differ from algorithm problems in the editor? | Text-based Q&A approach, Monaco for notes |
| 4 | Should we add a "Report Problem" button for low-quality AI-generated problems? | Consider for post-MVP |
| 5 | What happens when Judge0 rate limit is exhausted for the day? | Show user-friendly error with retry-tomorrow message |
