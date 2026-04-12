# Plan: CI/CD Pipeline for Interview Prep Coach

## TL;DR
Add a CI/CD pipeline to the Interview Prep Coach project using GitHub Actions for CI (lint, type-check, build, tests, security audit) and Vercel for CD (auto-deploy on merge to `main`, preview URLs on PRs). Currently there are zero automated checks — any push goes straight to production. This plan adds 4 phases of safety nets: static checks, unit tests, E2E tests, and dependency security scanning.

## Tools
- **CI Runner:** GitHub Actions (free for public repos, 2000 min/month for private)
- **Unit Tests:** Vitest (fast, native TypeScript/ESM, Next.js compatible)
- **Component Tests:** `@testing-library/react` + `happy-dom`
- **E2E Tests:** Playwright (Chromium)
- **CD:** Vercel (already configured — auto-deploys on push to `main`)
- **Dependency Scanning:** Dependabot + `npm audit`

## Pipeline Overview

```
Push / PR to main
      │
      ▼
  npm ci (cached) → Lint → Type-check → Build
      │
      ├─────────────┐
      ▼              ▼
  Unit Tests    E2E Tests     (parallel, after build)
  (Vitest)      (Playwright)
      │              │
      └──────┬───────┘
             ▼
       Security Audit (npm audit)
             │
             ▼
       ✅ Pass → merge allowed
       ❌ Fail → merge blocked
             │
             ▼ (on merge to main)
       Vercel auto-deploys to production
```

## Steps

### Phase 1: CI Foundation — Lint, Type-Check, Build + Branch Protection
1. Create `.github/workflows/ci.yml` — GitHub Actions workflow triggered on push to `main` and PRs targeting `main`. Uses Node.js 20 with npm cache. Runs: `npm ci` → `npm run lint` → `npm run type-check` → `npm run build`. Uses `concurrency` to cancel stale runs on the same branch.
2. Add `"type-check": "tsc --noEmit"` script to `package.json` — currently missing, needed for CI
3. Add mock environment variables to workflow — build needs env vars to exist at compile time (not real keys, just placeholders so `process.env.X` references don't fail). Values: `MONGODB_URI=mongodb://localhost:27017/test`, `NEXTAUTH_SECRET=ci-test-secret`, `GOOGLE_CLIENT_ID=ci-test-id`, etc.
4. Configure branch protection rules on GitHub (manual, one-time setup) — this is the key step that makes CI actually useful. Without it, anyone can push directly to `main` and skip all checks. Go to GitHub → repo Settings → Branches → Add rule for `main`:
   - **Require a pull request before merging** — blocks direct pushes to `main`. All code changes must go through a PR.
   - **Require status checks to pass before merging** — select the `ci` job from the workflow. PRs can't merge until lint, type-check, and build all pass green.
   - **Require branches to be up to date before merging** — forces PR branch to be rebased on latest `main`, so CI runs against the actual merge result.
   - **Do not allow bypassing the above settings** — applies to admins too, no exceptions.
   - **Restrict deletions** — prevent accidental deletion of `main`.
   - **Block force pushes** — prevent rewriting `main` history.

### Phase 2: Unit Tests (Vitest)
5. Install Vitest as a devDependency
6. Create `vitest.config.ts` — configure path aliases (`@/*` → `./*` to match `tsconfig.json`)
7. Add scripts to `package.json`: `"test": "vitest run"`
8. Write unit tests for `lib/utils.ts` — verify `cn()` merges classes and resolves Tailwind conflicts
9. Write unit tests for `lib/rateLimit.ts` — verify allow/deny within window, window reset after expiry, different IPs/endpoints tracked separately
10. Uncomment `unit-tests` job in `.github/workflows/ci.yml`, set `needs: ci` so it runs after build passes

### Phase 3: E2E Tests (Playwright)
11. Install Playwright, run `npx playwright install chromium`
12. Create `playwright.config.ts` — run against `npm run build && npm start` on `localhost:3000`, Chromium only
13. Write `e2e/landing.spec.ts` — verify the landing page loads with 8 topic cards and difficulty selector
14. Write `e2e/navigation.spec.ts` — verify navbar links and logo navigation
15. Uncomment `e2e-tests` job in `.github/workflows/ci.yml`, set `needs: ci`

### Phase 4: Security & Quality
16. Uncomment `security` job in `.github/workflows/ci.yml` — runs `npm audit --audit-level=high`, fails build on high/critical vulnerabilities
17. Update branch protection to require `unit-tests` and `e2e-tests` status checks in addition to `ci` — as new CI jobs are added, they should also be required before merge

## Relevant Files (to be created)

### CI/CD Config
- `.github/workflows/ci.yml` — GitHub Actions CI workflow (Phase 1, extended in 2-4)

### Test Config
- `vitest.config.ts` — Vitest configuration with path aliases (Phase 2)
- `playwright.config.ts` — Playwright config with webServer (Phase 3)

### Tests (minimal smoke tests)
- `__tests__/lib/utils.test.ts` — `cn()` utility tests (Phase 2)
- `__tests__/lib/rateLimit.test.ts` — Rate limiter logic tests (Phase 2)
- `e2e/landing.spec.ts` — Landing page test (Phase 3)
- `e2e/navigation.spec.ts` — Navbar navigation test (Phase 3)

### Modified Files
- `package.json` — add `type-check`, `test` scripts + Vitest devDependency

## Verification
1. **Phase 1 (CI):** Push a commit to a feature branch → open PR to `main` → verify GitHub Actions runs lint, type-check, build → all pass green. Introduce a TS error → push to the PR → verify CI fails and the merge button is blocked.
2. **Phase 1 (Branch protection):** Try pushing directly to `main` → verify it is rejected. Try merging a PR with failing CI → verify GitHub blocks the merge. Verify only PRs can update `main`.
3. **Phase 2:** Run `npm test` locally → unit tests pass. Push → verify `unit-tests` job runs in CI and passes.
4. **Phase 3:** Run `npx playwright test` locally → E2E tests pass. Push → verify `e2e-tests` job runs in CI.
5. **Phase 4:** Introduce a vulnerable dependency → push → verify `security` job fails.
6. **CD:** Merge a PR to `main` → verify Vercel auto-deploys to production. Open a PR → verify Vercel creates a preview URL.

## Decisions
- **Vitest over Jest** — faster startup, native ESM/TypeScript, no Babel config needed, better DX with watch mode
- **Playwright over Cypress** — lighter, built-in browser management, faster CI execution, better at intercepting API routes
- **Branch protection in Phase 1** — this is the most important step. Without it, CI is just informational (people can ignore failures and push directly). Branch protection makes CI enforceable: no PR merge until checks pass, no direct pushes to `main`.
- **PR-only workflow** — all changes go through PRs, even for a single developer. This builds good habits, creates a history of reviewed changes, and ensures every change is validated by CI before reaching production.
- **Mock env vars in workflow file** — safe because they're fake values; real keys stay in Vercel dashboard only. Never use GitHub Secrets for dummy CI build vars (unnecessary complexity)
- **`needs: ci` for test jobs** — no point running tests if lint/type-check/build fail. Saves CI minutes.
- **No Docker** — Vercel handles deployment; Docker adds complexity with no benefit for this project right now
- **No staging environment** — single developer, preview URLs on PRs serve as staging. Add a real staging env when team grows.
- **No Dependabot** — adds PR noise for a learning project. Can run `npm audit` manually or in CI. Add Dependabot later if maintaining long-term.
- **In-memory rate limiting stays** — good enough for current scale. Move to Redis when needed, not preemptively.

## Further Considerations
1. **Performance budgets:** Use `@next/bundle-analyzer` to track bundle size. Could add a CI step that fails if bundle grows past a threshold. Defer until feature set stabilizes.
2. **Visual regression testing:** Tools like Percy or Chromatic catch unintended UI changes via screenshot diffing. Useful once the UI is stable and changes are incremental.
3. **Monitoring:** Sentry for error tracking, Vercel Analytics for performance. Recommend adding post-launch.
4. **Load testing:** k6 or Artillery to simulate concurrent users hitting Gemini/Judge0 routes. Relevant before any marketing push.
5. **Database migrations:** No formal migration tool currently (Mongoose handles schema loosely). If schema evolves significantly, consider `migrate-mongo` for versioned changes.
