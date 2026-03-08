---
phase: 6
slug: balance-initiale
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (E2E) |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npx playwright test tests/balance-initiale.spec.ts` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/balance-initiale.spec.ts`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | INIT-01 | E2E | `npx playwright test tests/balance-initiale.spec.ts -g "INIT-01"` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | INIT-02 | E2E | `npx playwright test tests/balance-initiale.spec.ts -g "INIT-02"` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | INIT-03 | E2E | `npx playwright test tests/balance-initiale.spec.ts -g "INIT-03"` | ❌ W0 | ⬜ pending |
| 06-01-04 | 01 | 1 | INIT-04 | E2E | `npx playwright test tests/balance-initiale.spec.ts -g "INIT-04"` | ❌ W0 | ⬜ pending |
| 06-01-05 | 01 | 1 | INIT-05 | E2E | `npx playwright test tests/balance-initiale.spec.ts -g "INIT-05"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/balance-initiale.spec.ts` — E2E tests for INIT-01 through INIT-05
- [ ] Seed scenarios: one with no previous month (isolated current month), one with previous month present

*Existing test infrastructure (seed helper, auth helper, Playwright config) is already in place.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Negative number input on iOS keyboard | INIT-02 | Mobile browser keyboard behavior | Open on iPhone, tap balance field, verify minus sign is accessible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
