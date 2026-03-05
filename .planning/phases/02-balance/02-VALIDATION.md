---
phase: 2
slug: balance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.x |
| **Config file** | playwright.config.ts (exists at root) |
| **Quick run command** | `npx playwright test tests/balance.spec.ts` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/balance.spec.ts`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | DASH-01 | E2E stub | `npx playwright test tests/balance.spec.ts --grep "DASH-01"` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 0 | DASH-02 | E2E stub | `npx playwright test tests/balance.spec.ts --grep "DASH-02"` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 0 | DASH-03 | E2E stub | `npx playwright test tests/balance.spec.ts --grep "DASH-03"` | ❌ W0 | ⬜ pending |
| 2-01-04 | 01 | 0 | DASH-04 | E2E stub | `npx playwright test tests/balance.spec.ts --grep "DASH-04"` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 1 | DASH-01 | E2E | `npx playwright test tests/balance.spec.ts --grep "DASH-01"` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | DASH-02 | E2E | `npx playwright test tests/balance.spec.ts --grep "DASH-02"` | ❌ W0 | ⬜ pending |
| 2-02-03 | 02 | 1 | DASH-03 | E2E | `npx playwright test tests/balance.spec.ts --grep "DASH-03"` | ❌ W0 | ⬜ pending |
| 2-02-04 | 02 | 1 | DASH-04 | E2E | `npx playwright test tests/balance.spec.ts --grep "DASH-04"` | ❌ W0 | ⬜ pending |
| 2-03-01 | 03 | 1 | RPT-01 | E2E | `npx playwright test tests/balance.spec.ts --grep "RPT-01"` | ❌ W0 | ⬜ pending |
| 2-03-02 | 03 | 1 | RPT-02 | Manual | N/A — no UI for balance_reportee | Manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/balance.spec.ts` — stubs for DASH-01, DASH-02, DASH-03, DASH-04, RPT-01 (E2E test stubs with todo())
- [ ] `tests/helpers/seed.ts` — seedDatabase helper for Playwright (insert mois/depenses/ajustements)
- [ ] `tests/helpers/auth.ts` — login helper (reusable across test files)
- [ ] shadcn components: `npx shadcn@latest add badge separator skeleton`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| balance_reportee never writable via UI | RPT-02 | No UI element exists for it — absence is the feature | Inspect rendered dashboard HTML: confirm no input/form for balance_reportee exists. Check all Server Actions created in this phase: confirm none accept balance_reportee as parameter. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
