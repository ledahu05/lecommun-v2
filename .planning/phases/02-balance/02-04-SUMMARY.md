---
phase: 02-balance
plan: 04
subsystem: testing
tags: [playwright, e2e, balance, seed, dashboard]

# Dependency graph
requires:
  - phase: 02-balance
    provides: Dashboard RSC with data-testid attributes (BalanceCard, BalanceSynthese), seedDatabase helper, balance algorithm
provides:
  - Complete E2E test suite for DASH-01 through RPT-01 (5 tests green)
  - Validated dashboard balance display end-to-end
  - Validated automatic balance_reportee carryover (RPT-01)
affects: [03-depenses, 04-ajustements]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SCENARIO_SIMPLE pattern: minimal predictable seed data for deterministic assertions
    - Dynamic prev-month calculation in RPT-01 for date-independent test robustness
    - playwright.config.ts testIgnore to exclude vitest unit tests from Playwright runner

key-files:
  created: []
  modified:
    - tests/balance.spec.ts
    - playwright.config.ts

key-decisions:
  - "RPT-01 uses dynamic prev-month calculation (new Date()) rather than hardcoded 2026-02 for date-robustness"
  - "playwright.config.ts testIgnore: ['**/unit/**'] to prevent vitest files from breaking Playwright runner"

patterns-established:
  - "SCENARIO_SIMPLE: minimal 2-depense seed producing integer balance (50) for easy assertions"
  - "seedDatabase(scenario) then loginAs then page.goto('/') — standard E2E flow per test"

requirements-completed: [DASH-01, DASH-02, DASH-03, DASH-04, RPT-01]

# Metrics
duration: 5min
completed: 2026-03-05
---

# Phase 2 Plan 04: E2E Balance Tests Summary

**Playwright E2E suite fully implemented: 11 tests pass (6 auth + 5 balance), validating dashboard display and auto-balance-reportee carryover from previous month**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-05T08:21:29Z
- **Completed:** 2026-03-05T08:26:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced all 5 test.fixme() stubs with concrete Playwright assertions using SCENARIO_SIMPLE
- DASH-01 to DASH-04: dashboard balance display, detail, category breakdown, and no-cache validated
- RPT-01: automatic balance_reportee carryover verified end-to-end with dynamic date calculation
- Fixed pre-existing blocking issue: playwright config excluding vitest unit tests from Playwright runner

## Task Commits

Each task was committed atomically:

1. **Task 1: DASH-01 to DASH-04 E2E tests** - `737096a` (feat)
2. **Task 2: RPT-01 + playwright config fix** - `f9fc1fa` (feat)

**Plan metadata:** *(docs commit follows)*

## Files Created/Modified
- `tests/balance.spec.ts` - Complete E2E tests: DASH-01 through RPT-01, all green
- `playwright.config.ts` - Added testIgnore: ['**/unit/**'] to exclude vitest files

## Decisions Made
- RPT-01 uses `new Date()` for current month detection rather than hardcoding 2026-03, making the test pass on any date
- testIgnore pattern was needed because Playwright 1.58.2 cannot load vitest files (CommonJS require error)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Playwright config to exclude vitest unit tests**
- **Found during:** Task 2 (running full suite `npx playwright test`)
- **Issue:** `tests/unit/balance.test.ts` uses vitest imports; Playwright tried to load it and crashed with "Vitest cannot be imported in a CommonJS module"
- **Fix:** Added `testIgnore: ['**/unit/**']` to playwright.config.ts
- **Files modified:** playwright.config.ts
- **Verification:** Full suite runs 11 tests, 0 failures
- **Committed in:** f9fc1fa (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Essential fix — without it the full suite command failed entirely.

## Issues Encountered
None beyond the auto-fixed playwright config issue.

## Next Phase Readiness
- Phase 2 complete: algorithm, DB queries, dashboard RSC, and E2E validation all done
- Ready for Phase 3 (depenses) or /gsd:verify-work
- All 5 DASH/RPT requirements satisfied and committed

---
*Phase: 02-balance*
*Completed: 2026-03-05*
