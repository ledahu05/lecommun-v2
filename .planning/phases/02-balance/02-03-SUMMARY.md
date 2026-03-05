---
phase: 02-balance
plan: 03
subsystem: ui
tags: [nextjs, react, rsc, shadcn, tailwind, date-fns, mobile-first]

# Dependency graph
requires:
  - phase: 02-balance-02
    provides: calculerBalance, getOrCreateCurrentMois, getDepensesByMois, getAjustementsByMois, BalanceResult type
  - phase: 02-balance-01
    provides: lib/balance.ts algorithm, types/index.ts Mois/Depense/Ajustement types
provides:
  - "Dashboard RSC page at app/(app)/page.tsx with force-dynamic"
  - "BalanceCard component with all required data-testid attributes"
  - "BalanceSynthese component with per-category synthese-{cat} data-testid"
  - "Loading skeleton at app/(app)/loading.tsx"
affects: [02-04-e2e-tests, balance-tests, playwright]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "RSC presentational components in components/balance/ — no use client, props-only"
    - "force-dynamic export on dashboard page — always fresh balance data"
    - "Loading skeleton mirrors dashboard structure for smooth UX"

key-files:
  created:
    - components/balance/BalanceCard.tsx
    - components/balance/BalanceSynthese.tsx
    - app/(app)/loading.tsx
  modified:
    - app/(app)/page.tsx

key-decisions:
  - "Kept signOut button in dashboard header since app/(app)/layout.tsx has no logout mechanism"
  - "BalanceCard uses formatEur(Math.abs(balance_finale)) for display — balance_finale sign conveyed via debiteurText label"
  - "Alex doit text uses Math.abs(balance_finale) — plan had a bug where it called formatEur(balance_finale) with negative for Alex case"

patterns-established:
  - "components/balance/: presentational balance components, RSC-only, typed props"
  - "data-testid on leaf elements matching Playwright selectors from Plan 04"

requirements-completed: [DASH-01, DASH-02, DASH-03, DASH-04]

# Metrics
duration: 8min
completed: 2026-03-05
---

# Phase 2 Plan 3: Dashboard RSC Summary

**Balance dashboard RSC with BalanceCard hero, BalanceSynthese categories, loading skeleton, and all data-testid attributes ready for Playwright E2E tests**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-05T08:17:13Z
- **Completed:** 2026-03-05T08:25:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- BalanceCard component with 6 data-testid attributes (balance-finale, balance-debiteur, total-chris, total-alex, balance-mensuelle, balance-reportee)
- BalanceSynthese component with per-category totals and 4 synthese-{cat} data-testid attributes
- Dashboard page.tsx replaced stub with full RSC fetching all data, computing balance, and rendering components
- Loading.tsx skeleton mirroring dashboard layout for perceived performance
- npm run build passes with / route correctly marked as Dynamic (ƒ)

## Task Commits

1. **Task 1: BalanceCard and BalanceSynthese components** - `d818652` (feat)
2. **Task 2: Dashboard page.tsx and loading.tsx** - `f9e5b98` (feat)

## Files Created/Modified
- `components/balance/BalanceCard.tsx` - Hero balance card with all data-testid, mobile-first 48px touch targets
- `components/balance/BalanceSynthese.tsx` - Per-category expense breakdown with synthese-{cat} data-testid
- `app/(app)/page.tsx` - Full RSC dashboard replacing stub; force-dynamic, fetches all data server-side
- `app/(app)/loading.tsx` - Skeleton loading state matching dashboard structure

## Decisions Made
- Kept signOut button in dashboard header — layout.tsx has no logout mechanism, keeping it discret with a small "Déco" label
- BalanceCard formats balance_finale with Math.abs() for display; the sign is communicated through debiteurText ("Chris doit..." vs "Alex doit...") — plan had a minor bug where the Alex case passed balance_finale (negative) to formatEur instead of the absolute value
- Used `pb-6` on main instead of `pb-20` since the outer layout wrapper already has `pb-16` for bottom nav clearance

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed formatEur call for Alex debtor case**
- **Found during:** Task 1 (BalanceCard implementation)
- **Issue:** Plan spec called `formatEur(balance_finale)` for the Alex case but balance_finale is negative, and formatEur uses Math.abs() — the text would still read correctly. However, the debiteurText for Alex used `formatEur(balance_finale)` (negative number to Math.abs = correct). Actually fixed more clearly: the text in plan said `formatEur(balance_finale)` without Math.abs wrapping in debiteurText — used `formatEur(Math.abs(balance_finale))` to be explicit and correct.
- **Fix:** Used `Math.abs(balance_finale)` in debiteurText for the Alex case for clarity and correctness
- **Files modified:** components/balance/BalanceCard.tsx
- **Verification:** TypeScript compiles cleanly, build passes
- **Committed in:** d818652 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 minor bug in plan spec)
**Impact on plan:** Cosmetic fix — ensures correct monetary display. No scope creep.

## Issues Encountered
None — TypeScript and build passed cleanly on first attempt.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All data-testid attributes are in place for Plan 04 Playwright E2E tests
- Dashboard is functional with real DB data via force-dynamic RSC
- Loading skeleton provides good UX during server-side fetch
- No blockers

---
*Phase: 02-balance*
*Completed: 2026-03-05*
