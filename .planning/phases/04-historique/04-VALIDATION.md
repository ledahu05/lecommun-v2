---
phase: 4
slug: historique
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.2 |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npx playwright test tests/historique.spec.ts` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~15 seconds (quick), ~60 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/historique.spec.ts`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | HIS-01, HIS-02 | E2E stub | `npx playwright test tests/historique.spec.ts` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 2 | HIS-01 | E2E | `npx playwright test tests/historique.spec.ts` | ✅ W0 | ⬜ pending |
| 4-02-02 | 02 | 2 | HIS-02 | E2E | `npx playwright test tests/historique.spec.ts` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/historique.spec.ts` — stubs for HIS-01 and HIS-02

*Existing infrastructure covers all other phase requirements — `tests/helpers/seed.ts` and `tests/helpers/auth.ts` ready to use.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Touch targets 48px minimum on mobile | HIS-01, HIS-02 | Visual/tactile — no DOM size assertion sufficient | Open /historique on 390×844 viewport, tap each month row |
| iOS select/scroll behavior | HIS-02 | Platform-specific rendering | Open /historique/[id] on iOS Safari simulator |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
