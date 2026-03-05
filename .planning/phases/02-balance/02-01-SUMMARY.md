---
phase: 02-balance
plan: 01
subsystem: testing
tags: [playwright, drizzle, shadcn, sqlite, turso, e2e]

# Dependency graph
requires:
  - phase: 01-fondation
    provides: DB schema (mois/depenses/ajustements), auth middleware, NextAuth config
provides:
  - E2E test stubs for DASH-01, DASH-02, DASH-03, DASH-04, RPT-01
  - seedDatabase helper — clears and re-seeds DB via libsql client directly
  - loginAs helper — authenticates a user via /login page
  - shadcn badge, separator, skeleton components
  - Unique constraint (annee, mois) on mois table with Drizzle migration applied
affects: [02-balance-02, 02-balance-03, 02-balance-04]

# Tech tracking
tech-stack:
  added: [shadcn badge, shadcn separator, shadcn skeleton]
  patterns:
    - seedDatabase uses (annee, mois) key to resolve mois_id after INSERT — avoids AUTOINCREMENT gaps
    - test.fixme() used for pending stubs (test.todo() absent in Playwright 1.58)
    - Direct @libsql/client in test helpers — avoids Next.js server import issues

key-files:
  created:
    - tests/helpers/auth.ts
    - tests/helpers/seed.ts
    - tests/balance.spec.ts
    - components/ui/badge.tsx
    - components/ui/separator.tsx
    - components/ui/skeleton.tsx
    - drizzle/0001_modern_tattoo.sql
  modified:
    - lib/db/schema.ts

key-decisions:
  - "uniqueIndex defined inside sqliteTable second arg callback — not as standalone export (Drizzle ORM requirement)"
  - "SeedDepense/SeedAjustement use (annee, mois) instead of mois_id — resolved internally in seedDatabase after INSERT"
  - "test.fixme(true, ...) instead of test.todo() — test.todo is not available in Playwright 1.58.2"

patterns-established:
  - "Seed helpers use libsql client directly, not Drizzle ORM, to avoid Next.js server-only module issues in Playwright context"
  - "Balance spec tests are fixme stubs — Wave 2 (Plan 04) will implement them"

requirements-completed: [DASH-01, DASH-02, DASH-03, DASH-04, RPT-01]

# Metrics
duration: 18min
completed: 2026-03-05
---

# Phase 2 Plan 01: Test Infrastructure Summary

**E2E foundation with seedDatabase/loginAs helpers, 5 balance test stubs, shadcn components, and unique constraint migration applied to Turso DB**

## Performance

- **Duration:** 18 min
- **Started:** 2026-03-05T08:11:37Z
- **Completed:** 2026-03-05T08:29:00Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Unique index on mois(annee, mois) schema change with Drizzle migration generated and applied to Turso cloud DB
- seedDatabase helper with ID resolution via (annee, mois) key to handle non-sequential SQLite AUTOINCREMENT
- loginAs helper reusing same UI pattern as auth.spec.ts (click user button, fill password, wait for redirect)
- 5 E2E test stubs (DASH-01..04, RPT-01) as test.fixme — 0 failures, ready for Wave 2 implementation
- shadcn badge, separator, skeleton installed in components/ui/

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema unique constraint + shadcn components** - `72df44d` (chore)
2. **Task 2: Test helpers seedDatabase and loginAs** - `d1d510e` (feat)
3. **Task 3: E2E stubs tests/balance.spec.ts** - `bd5d771` (test)

**Plan metadata:** `[pending]` (docs: complete plan)

## Files Created/Modified
- `lib/db/schema.ts` - Added uniqueIndex('mois_annee_mois_unique') in sqliteTable second arg
- `drizzle/0001_modern_tattoo.sql` - Migration adding unique index on mois(annee, mois)
- `drizzle/meta/0001_snapshot.json` - Drizzle migration snapshot
- `tests/helpers/auth.ts` - loginAs(page, 'chris' | 'alex') helper
- `tests/helpers/seed.ts` - seedDatabase(data: SeedData) helper with ID resolution
- `tests/balance.spec.ts` - 5 DASH/RPT test stubs using test.fixme
- `components/ui/badge.tsx` - shadcn badge component
- `components/ui/separator.tsx` - shadcn separator component
- `components/ui/skeleton.tsx` - shadcn skeleton component

## Decisions Made
- Used uniqueIndex inside sqliteTable second arg callback — Drizzle only generates migration when index is table-level, not standalone export
- SeedDepense/SeedAjustement interfaces use { annee, mois } instead of mois_id — resolved internally after INSERT to avoid AUTOINCREMENT ID gaps
- test.fixme(true, reason) instead of test.todo() — test.todo is undefined in Playwright 1.58.2

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] uniqueIndex as standalone export doesn't generate migration**
- **Found during:** Task 1 (schema unique constraint)
- **Issue:** Plan showed `export const moisUniqueIdx = uniqueIndex(...).on(...)` as standalone — Drizzle-kit showed "0 indexes" and generated no migration
- **Fix:** Moved uniqueIndex into sqliteTable second arg callback: `(table) => ({ moisUniqueIdx: uniqueIndex(...).on(table.annee, table.mois) })`
- **Files modified:** lib/db/schema.ts
- **Verification:** `npx drizzle-kit generate` output showed "mois 5 columns 1 indexes" and created 0001_modern_tattoo.sql
- **Committed in:** 72df44d (Task 1 commit)

**2. [Rule 1 - Bug] test.todo() not available in Playwright 1.58**
- **Found during:** Task 3 (balance spec stubs)
- **Issue:** `node -e "const {test} = require('@playwright/test'); console.log(typeof test.todo)"` returned `undefined`
- **Fix:** Used `test.fixme(true, 'Stub — sera implémenté en Wave 2')` inside a regular test callback
- **Files modified:** tests/balance.spec.ts
- **Verification:** `npx playwright test tests/balance.spec.ts` exits 0 with 5 skipped
- **Committed in:** bd5d771 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both required for correct functioning. No scope creep.

## Issues Encountered
- `npx drizzle-kit migrate` requires TURSO_DATABASE_URL in environment — `.env.local` not auto-loaded by drizzle-kit CLI. Ran with explicit env vars: `TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx drizzle-kit migrate`

## Next Phase Readiness
- Test stubs ready for Wave 2 implementation (Plan 04)
- seedDatabase and loginAs helpers tested syntactically; runtime tested when Plan 04 fills in the stubs
- shadcn components available for dashboard UI (Plans 02, 03)
- DB unique constraint active — no duplicate (annee, mois) rows possible

---
*Phase: 02-balance*
*Completed: 2026-03-05*
