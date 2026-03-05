---
phase: 3
slug: saisie
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.2 (E2E) |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npx playwright test tests/depenses.spec.ts --project=chromium` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/depenses.spec.ts --project=chromium` (depenses tasks) or `npx playwright test tests/ajustements.spec.ts --project=chromium` (ajustements tasks)
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| DEP-01 | 01 | 1 | DEP-01 | E2E | `npx playwright test tests/depenses.spec.ts -g "DEP-01"` | ❌ W0 | ⬜ pending |
| DEP-02 | 01 | 1 | DEP-02 | E2E | `npx playwright test tests/depenses.spec.ts -g "DEP-02"` | ❌ W0 | ⬜ pending |
| DEP-03 | 01 | 1 | DEP-03 | E2E | `npx playwright test tests/depenses.spec.ts -g "DEP-03"` | ❌ W0 | ⬜ pending |
| DEP-04 | 01 | 1 | DEP-04 | E2E | `npx playwright test tests/depenses.spec.ts -g "DEP-04"` | ❌ W0 | ⬜ pending |
| DEP-05 | 01 | 1 | DEP-05 | E2E | `npx playwright test tests/depenses.spec.ts -g "DEP-05"` | ❌ W0 | ⬜ pending |
| AJU-01 | 02 | 2 | AJU-01 | E2E | `npx playwright test tests/ajustements.spec.ts -g "AJU-01"` | ❌ W0 | ⬜ pending |
| AJU-02 | 02 | 2 | AJU-02 | E2E | `npx playwright test tests/ajustements.spec.ts -g "AJU-02"` | ❌ W0 | ⬜ pending |
| AJU-03 | 02 | 2 | AJU-03 | E2E | `npx playwright test tests/ajustements.spec.ts -g "AJU-03"` | ❌ W0 | ⬜ pending |
| AJU-04 | 02 | 2 | AJU-04 | E2E | `npx playwright test tests/ajustements.spec.ts -g "AJU-04"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/depenses.spec.ts` — stubs for DEP-01, DEP-02, DEP-03, DEP-04, DEP-05
- [ ] `tests/ajustements.spec.ts` — stubs for AJU-01, AJU-02, AJU-03, AJU-04
- [ ] No new framework install needed — Playwright already configured and `seedDatabase` helper exists

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Segmented buttons for paye_par render correctly on iOS Safari | DEP-01 | iOS-specific rendering cannot be tested in Playwright chromium | Test in Safari on iPhone 14 viewport (390×844), verify Chris/Alex buttons toggle correctly and submit correct value |
| Delete confirmation dialog is accessible | DEP-03, AJU-03 | Full accessibility audit requires manual inspection | Open dialog with keyboard (Tab + Enter), verify focus trap, Escape closes without deleting |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
