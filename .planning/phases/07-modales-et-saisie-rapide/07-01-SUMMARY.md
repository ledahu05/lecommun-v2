---
phase: 07-modales-et-saisie-rapide
plan: 01
subsystem: ui
tags: [dialog, modal, shadcn, react, forms, mobile-first]

requires:
  - phase: 04-depenses-ajustements
    provides: DepenseForm and AjustementForm inline Card components
provides:
  - Dialog modal wrappers for DepenseForm and AjustementForm
  - Subcategory button grid selection pattern
  - Error handling with useTransition in modal forms
affects: [07-02]

tech-stack:
  added: ["@radix-ui/react-dialog (via shadcn Dialog)"]
  patterns: [Dialog modal form with useTransition error handling, subcategory button grid]

key-files:
  created:
    - components/ui/dialog.tsx
  modified:
    - components/depenses/DepenseForm.tsx
    - components/ajustements/AjustementForm.tsx
    - app/(app)/depenses/page.tsx
    - app/(app)/ajustements/page.tsx
    - app/(app)/depenses/actions.ts
    - app/(app)/ajustements/actions.ts
    - tests/depenses.spec.ts
    - tests/ajustements.spec.ts

key-decisions:
  - "useTransition + async onSubmit for error capture instead of form action binding"
  - "Subcategories as 3-col button grid instead of native select for faster mobile selection"
  - "Cross-page revalidation added (depenses revalidates /ajustements and vice versa)"

patterns-established:
  - "Dialog modal form: Dialog wrapper with controlled open state, useTransition for pending, inline error display, router.refresh() on success"
  - "Button grid selection: grid of outline/default variant buttons with hidden input for form value"

requirements-completed: [MOD-01, MOD-02, MOD-03, MOD-04, UX-01, UX-02]

duration: 6min
completed: 2026-03-08
---

# Phase 7 Plan 1: Modales et saisie rapide Summary

**Dialog modals for depense/ajustement forms with subcategory button grid, useTransition error handling, and cross-page revalidation**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-08T13:12:13Z
- **Completed:** 2026-03-08T13:18:30Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Replaced inline Card forms with Dialog modal wrappers on both /depenses and /ajustements pages
- Subcategories displayed as 3-column button grid instead of native select for faster mobile selection
- Error handling via useTransition captures server action errors inline without closing modal
- All 38 E2E tests pass with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Dialog shadcn and refactor DepenseForm to modal** - `beec780` (feat)
2. **Task 2: Refactor AjustementForm to Dialog modal** - `8436b07` (feat)
3. **Task 3: Update E2E tests for modal workflow** - `a4d5884` (test)

## Files Created/Modified
- `components/ui/dialog.tsx` - shadcn Dialog primitive (new)
- `components/depenses/DepenseForm.tsx` - Refactored from Card to Dialog modal with button grid subcategories
- `components/ajustements/AjustementForm.tsx` - Refactored from Card to Dialog modal
- `app/(app)/depenses/page.tsx` - Removed inline form, placed modal trigger next to title
- `app/(app)/ajustements/page.tsx` - Removed inline form, placed modal trigger next to title
- `app/(app)/depenses/actions.ts` - Added cross-page revalidation for /ajustements
- `app/(app)/ajustements/actions.ts` - Added cross-page revalidation for /depenses
- `tests/depenses.spec.ts` - Added dialog open/close steps for modal workflow
- `tests/ajustements.spec.ts` - Added dialog open/close steps for modal workflow

## Decisions Made
- Used useTransition + async onSubmit handler instead of form action binding to capture server action error returns and control modal close behavior
- Subcategories rendered as 3-col button grid (min-h-[44px]) for faster mobile touch selection than native select
- Added cross-page revalidation (depenses actions revalidate /ajustements and vice versa) for data coherence

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed accent in AjustementForm label**
- **Found during:** Task 3 (E2E test verification)
- **Issue:** Label text "Libelle" missing accent caused `getByLabel(/libellé/i)` selector mismatch in E2E tests
- **Fix:** Restored proper French accent "Libellé" in label and placeholder
- **Files modified:** components/ajustements/AjustementForm.tsx
- **Verification:** All 4 ajustement E2E tests pass
- **Committed in:** a4d5884 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor text fix for test compatibility. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Dialog modal pattern established and tested, ready for plan 07-02
- All existing E2E tests verified passing

---
*Phase: 07-modales-et-saisie-rapide*
*Completed: 2026-03-08*
