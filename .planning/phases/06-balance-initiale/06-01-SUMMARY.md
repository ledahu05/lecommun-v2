---
phase: 06-balance-initiale
plan: 01
subsystem: ui
tags: [react, server-actions, zod, drizzle, playwright, mobile-first]

requires:
  - phase: 02-balance
    provides: calculerBalance algorithm, BalanceCard component, balance_reportee column
  - phase: 05-import-delete
    provides: router.refresh() pattern for server action feedback
provides:
  - hasPreviousMois query for checking calendar-previous month existence
  - updateBalanceReportee mutation for editing balance_reportee
  - actionUpdateBalanceReportee server action with Zod validation
  - InitialBalanceForm client component with mobile-first touch targets
  - Conditional editable/static balance_reportee in BalanceCard
affects: []

tech-stack:
  added: []
  patterns: [key-prop-reset for uncontrolled input remount after server data change]

key-files:
  created:
    - app/(app)/actions.ts
    - components/balance/InitialBalanceForm.tsx
    - tests/balance-initiale.spec.ts
  modified:
    - lib/db/queries/mois.ts
    - components/balance/BalanceCard.tsx
    - app/(app)/page.tsx
    - tests/balance.spec.ts

key-decisions:
  - "key={currentValue} on Input to force React remount when server data changes after submission"
  - "page.reload() in INIT-04 test instead of relying on router.refresh() timing for re-edit verification"

patterns-established:
  - "Key-prop reset: use key={serverValue} on uncontrolled inputs to sync with server state after mutations"

requirements-completed: [INIT-01, INIT-02, INIT-03, INIT-04, INIT-05]

duration: 8min
completed: 2026-03-08
---

# Phase 6 Plan 1: Balance Initiale Summary

**Editable initial balance field on dashboard with signed amount input, Zod-validated server action, and conditional display based on previous month existence**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-08T12:25:46Z
- **Completed:** 2026-03-08T12:33:53Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Dashboard shows editable balance field when no previous month exists in DB, allowing users to set the carried-forward balance from the Google Sheets migration
- Server action with Zod validation accepts signed amounts (positive and negative) and persists to DB
- Field remains editable for corrections and auto-hides when a previous month is created
- All 5 INIT requirement E2E tests pass, full 38-test suite green with no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Add backend queries and server action** - `be6fa27` (feat)
2. **Task 2: Create InitialBalanceForm and wire into dashboard** - `84b99c4` (feat)
3. **Task 3: Write E2E tests for all 5 INIT requirements** - `bc41a86` (test)

## Files Created/Modified
- `lib/db/queries/mois.ts` - Added hasPreviousMois() and updateBalanceReportee() exports
- `app/(app)/actions.ts` - Server action with Zod validation for balance_reportee updates
- `components/balance/InitialBalanceForm.tsx` - Client component with 48px touch targets, signed number input
- `components/balance/BalanceCard.tsx` - Conditional rendering via editableBalanceReportee prop
- `app/(app)/page.tsx` - Queries hasPreviousMois and passes flag to BalanceCard
- `tests/balance-initiale.spec.ts` - 5 E2E tests covering all INIT requirements
- `tests/balance.spec.ts` - Updated DASH-02 to account for editable form when no previous month

## Decisions Made
- Used `key={currentValue}` on the Input component to force React remount when server data changes after form submission -- standard React pattern for resetting uncontrolled inputs
- Used `page.reload()` in INIT-04 test for re-edit verification instead of relying on router.refresh() timing within startTransition

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated DASH-02 test for new conditional rendering**
- **Found during:** Task 3 (E2E test verification)
- **Issue:** DASH-02 expected static `data-testid="balance-reportee"` but the scenario seeds only current month (no prev), so the editable form is now shown instead
- **Fix:** Changed DASH-02 to check `initial-balance-input` value instead of static text
- **Files modified:** tests/balance.spec.ts
- **Verification:** Full 38-test suite passes
- **Committed in:** bc41a86 (Task 3 commit)

**2. [Rule 1 - Bug] Added key prop for uncontrolled input sync**
- **Found during:** Task 3 (INIT-04 test failing)
- **Issue:** React `defaultValue` doesn't update an already-mounted uncontrolled input when props change via router.refresh()
- **Fix:** Added `key={currentValue}` to force remount when server value changes
- **Files modified:** components/balance/InitialBalanceForm.tsx
- **Verification:** INIT-04 re-edit test passes
- **Committed in:** bc41a86 (Task 3 commit)

**3. [Rule 3 - Blocking] Installed Playwright browsers**
- **Found during:** Task 3 (first test run)
- **Issue:** Chromium headless shell not installed after package update
- **Fix:** Ran `npx playwright install chromium`
- **Files modified:** None (browser binary)
- **Verification:** All tests run successfully
- **Committed in:** N/A (no file changes)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Balance initiale feature complete -- milestone v1.2 core feature delivered
- All 5 INIT requirements verified via E2E tests
- No blockers or concerns

---
*Phase: 06-balance-initiale*
*Completed: 2026-03-08*
