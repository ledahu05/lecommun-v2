---
phase: 02-balance
plan: 02
subsystem: database
tags: [drizzle-orm, typescript, balance-algorithm, sqlite, turso, vitest]

# Dependency graph
requires:
  - phase: 01-fondation
    provides: DB schema (mois, depenses, ajustements tables), Drizzle client, auth
  - phase: 02-01
    provides: Unique index on mois(annee, mois), seed/auth test helpers
provides:
  - types/index.ts: Drizzle-inferred types Mois, Depense, Ajustement
  - lib/balance.ts: calculerBalance() — verified balance algorithm
  - lib/db/queries/depenses.ts: getDepensesByMois()
  - lib/db/queries/ajustements.ts: getAjustementsByMois()
  - lib/db/queries/mois.ts: getOrCreateCurrentMois() with automatic report carryover
affects: [02-03, 02-04, dashboard, historique, depenses, ajustements]

# Tech tracking
tech-stack:
  added: [vitest ^4.0.18]
  patterns:
    - TDD with vitest for pure business logic functions
    - Drizzle InferSelectModel for type inference (no manual interfaces)
    - onConflictDoUpdate for race-condition-safe month creation
    - computeBalanceReportee: recursive balance carryover from previous month

key-files:
  created:
    - types/index.ts
    - lib/balance.ts
    - lib/db/queries/depenses.ts
    - lib/db/queries/ajustements.ts
    - lib/db/queries/mois.ts
    - tests/unit/balance.test.ts
    - vitest.config.ts
  modified: []

key-decisions:
  - "Algorithm correction: total_chris_vers_alex includes balance_mensuelle (CLAUDE.md documentation was wrong — verified against fixtures_e2e.json mars 2026)"
  - "vitest added for unit testing pure business logic — Playwright only for E2E"
  - "onConflictDoUpdate on (annee, mois) columns for idempotent month creation"
  - "computeBalanceReportee is private (not exported) — only getOrCreateCurrentMois is public API"

patterns-established:
  - "Pure functions in lib/ tested with vitest; DB functions in lib/db/queries/ tested via E2E only"
  - "Query files export single named function per file"
  - "InferSelectModel used throughout — no manual type duplication"

requirements-completed: [DASH-01, DASH-02, DASH-03, DASH-04, RPT-01, RPT-02]

# Metrics
duration: 4min
completed: 2026-03-05
---

# Phase 2 Plan 02: Business Logic & DB Queries Summary

**Pure balance algorithm (calculerBalance) with Drizzle-inferred types and automatic month-report carryover via getOrCreateCurrentMois**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-05T08:11:42Z
- **Completed:** 2026-03-05T08:14:57Z
- **Tasks:** 2
- **Files modified:** 7 created

## Accomplishments
- Correct `calculerBalance()` algorithm verified against fixtures: mars 2026 = -518.5
- Drizzle-inferred types (Mois, Depense, Ajustement) — no manual interfaces
- `getOrCreateCurrentMois()` automatically creates new month and carries over previous balance_finale as balance_reportee
- TDD approach: 5 unit tests covering empty state, single-user, both users, balance carryover, mars 2026 fixture

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing balance tests** - `5c5c65e` (test)
2. **Task 1 GREEN: types/index.ts + lib/balance.ts** - `0e67a02` (feat)
3. **Task 2: DB queries — mois, depenses, ajustements** - `d300403` (feat)

## Files Created/Modified
- `types/index.ts` - Drizzle-inferred types: Mois, Depense, Ajustement
- `lib/balance.ts` - calculerBalance() + BalanceResult interface
- `lib/db/queries/depenses.ts` - getDepensesByMois(moisId)
- `lib/db/queries/ajustements.ts` - getAjustementsByMois(moisId)
- `lib/db/queries/mois.ts` - getOrCreateCurrentMois() with computeBalanceReportee
- `tests/unit/balance.test.ts` - 5 vitest unit tests for balance algorithm
- `vitest.config.ts` - vitest config with @/ path alias

## Decisions Made
- **Algorithm corrected:** CLAUDE.md documentation was incorrect. The formula `total_chris_vers_alex = balance_reportee + adj(chris→alex)` is missing `balance_mensuelle`. Correct formula (verified against fixtures): `total_chris_vers_alex = balance_mensuelle + balance_reportee + adj(chris→alex)`. Mars 2026 proof: 56.5 + (-290) + 115 = -118.5, then -118.5 - 400 = -518.5.
- **vitest installed:** No unit test framework existed in the project. Added vitest for testing the pure `calculerBalance` function. Playwright is E2E only.
- **onConflictDoUpdate:** Used instead of naive INSERT to handle rare concurrent month creation race conditions. Target: `[mois.annee, mois.mois]` (unique index from migration 0001).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed vitest (no unit test framework existed)**
- **Found during:** Task 1 (TDD RED phase)
- **Issue:** Plan specified `tdd="true"` but no unit test runner was installed. Playwright is E2E only.
- **Fix:** Installed vitest ^4.0.18, created vitest.config.ts with @/ alias resolution
- **Files modified:** package.json, package-lock.json, vitest.config.ts
- **Verification:** `npx vitest run` executes correctly
- **Committed in:** 5c5c65e (TDD RED commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — missing test infrastructure)
**Impact on plan:** vitest installation required to fulfil TDD requirement. No scope creep.

## Issues Encountered

- Pre-existing `test.todo` TS errors in untracked `tests/balance.spec.ts` (Playwright v1.58.2 does not have `test.todo` in types). Logged to `deferred-items.md`. Not caused by this plan's changes.

## Next Phase Readiness
- All types, algorithm, and DB queries ready for Plan 03 (dashboard)
- `calculerBalance()` verified correct with mars 2026 fixture data
- `getOrCreateCurrentMois()` handles month creation + report carryover automatically
- Plan 03 can import: `{ calculerBalance }` from `@/lib/balance`, `{ getOrCreateCurrentMois }` from `@/lib/db/queries/mois`, `{ getDepensesByMois }` from `@/lib/db/queries/depenses`, `{ getAjustementsByMois }` from `@/lib/db/queries/ajustements`

---
*Phase: 02-balance*
*Completed: 2026-03-05*
