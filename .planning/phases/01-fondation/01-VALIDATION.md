---
phase: 1
slug: fondation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (E2E) |
| **Config file** | `playwright.config.ts` — Wave 0 creates it |
| **Quick run command** | `npx playwright test --project=chromium tests/auth.spec.ts` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test --project=chromium tests/auth.spec.ts`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | INF-01, INF-02, INF-03 | setup | `npx playwright test --project=chromium tests/auth.spec.ts` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | INF-02 | manual | `npx drizzle-kit studio` | N/A | ⬜ pending |
| 1-01-03 | 01 | 1 | AUTH-01 | E2E | `npx playwright test tests/auth.spec.ts --grep "chris login"` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | AUTH-01 | E2E | `npx playwright test tests/auth.spec.ts --grep "alex login"` | ❌ W0 | ⬜ pending |
| 1-01-05 | 01 | 1 | AUTH-01 | E2E | `npx playwright test tests/auth.spec.ts --grep "wrong password"` | ❌ W0 | ⬜ pending |
| 1-01-06 | 01 | 1 | AUTH-02 | E2E | `npx playwright test tests/auth.spec.ts --grep "session persists"` | ❌ W0 | ⬜ pending |
| 1-01-07 | 01 | 1 | AUTH-03 | E2E | `npx playwright test tests/auth.spec.ts --grep "redirect unauthenticated"` | ❌ W0 | ⬜ pending |
| 1-01-08 | 01 | 1 | AUTH-03 | E2E | `npx playwright test tests/auth.spec.ts --grep "redirect authenticated"` | ❌ W0 | ⬜ pending |
| 1-01-09 | 01 | 2 | INF-01 | manual | Visit Vercel URL post-deploy | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — base config with webServer pointing to `http://localhost:3000`
- [ ] `tests/auth.spec.ts` — stubs for AUTH-01, AUTH-02, AUTH-03 (chris login, alex login, wrong password, session persists, redirect unauthenticated, redirect authenticated)
- [ ] Playwright install: `npm init playwright@latest` — no existing config detected

*All Wave 0 files must exist before Wave 1 execution begins.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App responds to HTTP at production URL | INF-01 | Requires live Vercel deployment | Visit Vercel URL in browser, verify 200 OK |
| DB tables exist with correct schema | INF-02 | Schema inspection requires visual check | Run `npx drizzle-kit studio`, verify tables: mois, depenses, ajustements with correct columns |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
