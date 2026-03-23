# Prep Coach

Prep Coach is an AI-assisted coding interview practice platform built with Next.js. It lets a user pick a topic and difficulty, generate a fresh problem, write code in-browser, run it against test cases, and get structured AI feedback on the solution.

## At a Glance

- Fresh interview-style problems generated on demand
- In-browser coding environment with execution support
- Structured AI review after submission
- Hint system that guides without immediately revealing the answer
- Progress tracking for repeated practice over time

## Why I Built This

I built Prep Coach because I wanted a practice workflow that goes beyond solving a problem and checking whether it passes. I was looking for something that could add structured feedback after submission, highlight complexity tradeoffs, and point out optimization opportunities in a more guided way.

I also wanted a practice tool that felt closer to an actual interview session:

- generate a problem on demand instead of relying on a fixed question set
- solve it in a proper editor with language support
- run code against concrete test cases
- get feedback on correctness, complexity, and code quality
- track progress over time instead of treating each practice session as isolated

This project was also a way to combine product thinking with full-stack implementation across AI APIs, authentication, external execution services, persistence, analytics, and responsive UI.

## What The App Does

- Generates interview-style coding problems using Gemini
- Supports Python, JavaScript, Java, and C++ in Monaco Editor
- Executes user code through Judge0 and shows per-test-case results
- Reveals progressive hints in 3 levels instead of dumping full solutions immediately
- Reviews submissions with AI and scores them on a 1 to 10 scale
- Saves authenticated user progress to MongoDB
- Supports guest mode with local progress storage
- Visualizes performance with a dashboard for topics, difficulty, and trend over time

## What Makes It Different

Prep Coach is not just a problem generator or just a code runner. The value comes from combining the full loop:

- **Problem generation + execution + review** in one place
- **Progressive hints** that guide instead of spoil
- **Post-submission review** covering complexity, issues, and optimizations
- **Guest mode first** so the app is usable before sign-in
- **Analytics dashboard** so repeated practice turns into measurable progress

The biggest product differentiator is that it focuses on fresh, repeatable practice rather than a static set of prompts. The app can generate a new problem each time, which makes repeated practice feel less predictable and better suited to iterative preparation.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Authentication | NextAuth.js + Google OAuth |
| AI | Google Gemini API |
| Code Execution | Judge0 API |
| Editor | Monaco Editor |
| UI | Tailwind CSS + shadcn/ui |
| Charts | Chart.js + react-chartjs-2 |
| Notifications | Sonner |

## Key Engineering Decisions

- **Structured Gemini prompts** so the app receives machine-friendly JSON rather than loose prose.
- **Judge0 integration** for language-agnostic execution without managing compilers locally.
- **MongoDB + NextAuth callbacks** to persist user accounts and practice history.
- **Guest mode fallback** to reduce friction for first-time users.
- **Per-route rate limits** to control external API usage and prevent abuse.

## Challenges I Worked Through

- Integrating different Gemini and Judge0 workflows into a single smooth practice flow.
- Designing prompts that reliably produce structured, usable outputs instead of inconsistent free-form AI responses.
- Handling the difference between Mongoose `find()` casting and `aggregate()` casting for `ObjectId` values.
- Designing loading states for problem generation, execution, and review so the app feels responsive.
- Keeping the practice page usable on mobile without losing the split-screen workflow on larger screens.
- Adding route-specific rate limits based on the cost profile of Gemini and Judge0 calls.

## What I Learned

- How to build a full-stack application around AI-assisted workflows instead of treating AI as just a chat add-on.
- How to coordinate multiple external APIs with different response patterns, failure cases, and cost implications.
- How to make prompt design, validation, and rate limiting part of the actual application architecture.
- How to review and shape AI-assisted implementation into a working product with cleaner UX and safer backend behavior.

## Run Locally

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster or local MongoDB instance
- Google Cloud OAuth credentials
- Gemini API key
- Judge0 API key

### Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```powershell
Copy-Item .env.local.example .env.local
```

3. Fill in `.env.local` with your credentials.

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXTAUTH_SECRET` | NextAuth session secret |
| `NEXTAUTH_URL` | Base URL of the app |
| `GEMINI_API_KEY` | Gemini API access |
| `JUDGE0_API_URL` | Judge0 base URL |
| `JUDGE0_API_KEY` | Judge0 API key |

4. Start the dev server:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Operational Notes

The app currently enforces route-specific in-memory rate limits:

| Endpoint | Limit |
| --- | --- |
| `/api/problems/generate` | 5 requests/minute |
| `/api/problems/hint` | 2 requests/minute |
| `/api/code/execute` | 2 requests/minute |
| `/api/review` | 1 request/minute |

These are lightweight limits intended for local development and small-scale deployment. A production-scale version would move this to a shared store such as Redis.


## Additional Docs

- `docs/PRD.md` - product scope and requirements
- `docs/SPEC.md` - technical design notes
- `docs/plan.md` - build checklist and implementation plan