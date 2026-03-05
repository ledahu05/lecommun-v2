---
phase: 03-saisie
plan: 02
subsystem: depenses
tags: [server-actions, zod, rsc, playwright, forms, mobile]

# Dependency graph
requires: [03-01]
provides:
  - lib/db/queries/depenses.ts with insertDepense, deleteDepense, getDepensesByMois (ORDER BY DESC)
  - app/(app)/depenses/actions.ts with actionCreateDepense (Zod validated) and actionDeleteDepense
  - /depenses RSC page with force-dynamic, DepenseForm + DepensesList
  - components/depenses/DepenseForm.tsx Client Component with segmented paye_par buttons
  - components/depenses/DepenseItem.tsx RSC with inline delete form
  - components/depenses/DepensesList.tsx RSC with empty state
  - All 5 DEP-01..DEP-05 Playwright tests green
affects: [03-03, 03-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Actions with Zod validation returning {error: string} on failure (no throw)
    - Zod v4 uses .issues instead of .errors on ZodError
    - Cross-field Zod refine for sous_categorie membership in parent category
    - Wrapper async function to satisfy form action type (void | Promise<void>)
    - Grid of 4 Button variants for category selection (avoids iOS select issues)
    - key={categorie} on sous_categorie select forces reset on category change

key-files:
  created:
    - app/(app)/depenses/actions.ts
    - components/depenses/DepenseForm.tsx
    - components/depenses/DepenseItem.tsx
    - components/depenses/DepensesList.tsx
  modified:
    - lib/db/queries/depenses.ts
    - app/(app)/depenses/page.tsx
    - tests/depenses.spec.ts

key-decisions:
  - "Zod v4: use parsed.error.issues instead of parsed.error.errors — .errors property does not exist in Zod v4"
  - "Wrapper handleCreateDepense function in DepenseForm to satisfy React form action type (must return void | Promise<void>)"

# Metrics
duration: 3min
completed: 2026-03-05
---

# Phase 3 Plan 02: Dépenses Data Entry Summary

**Full depenses CRUD feature: Zod-validated Server Actions, RSC page with force-dynamic, mobile-first Client Component form with segmented buttons, all 5 DEP tests green in 3 minutes**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-05T08:54:18Z
- **Completed:** 2026-03-05T08:56:56Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Updated `lib/db/queries/depenses.ts`: added `insertDepense`, `deleteDepense`, updated `getDepensesByMois` with `ORDER BY date_depense DESC`
- Created `app/(app)/depenses/actions.ts`: `actionCreateDepense` with Zod DepenseSchema (cross-field refine for sous_categorie), `actionDeleteDepense`, both call `revalidatePath`
- Updated `app/(app)/depenses/page.tsx`: RSC with `export const dynamic = 'force-dynamic'`, fetches current month + depenses, renders DepenseForm + DepensesList
- Created `components/depenses/DepenseForm.tsx`: Client Component with 4-button category grid, keyed sous_categorie select, segmented Chris/Alex payeur buttons, 48px touch targets throughout
- Created `components/depenses/DepenseItem.tsx`: RSC row with `data-testid="depense-item"`, inline delete form, `aria-label="Supprimer"`
- Created `components/depenses/DepensesList.tsx`: RSC list with `data-testid="depenses-list"` or `data-testid="depenses-vides"` empty state
- Implemented all 5 DEP-xx Playwright tests — 5 passed, 0 failed

## Task Commits

1. **Task 1: DB queries + Server Actions** — `fe91bcb`
2. **Task 2: RSC page + components** — `2f7bd9d`
3. **Task 3: DEP-01..DEP-05 tests green** — `7ebef88`

## Files Created/Modified

- `lib/db/queries/depenses.ts` — added insertDepense, deleteDepense, ORDER BY
- `app/(app)/depenses/actions.ts` — new file: Server Actions with Zod
- `app/(app)/depenses/page.tsx` — RSC with force-dynamic
- `components/depenses/DepenseForm.tsx` — new Client Component form
- `components/depenses/DepenseItem.tsx` — new RSC row with delete
- `components/depenses/DepensesList.tsx` — new RSC list
- `tests/depenses.spec.ts` — 5 tests implemented (DEP-01..DEP-05), all green

## Decisions Made

- **Zod v4 API:** `parsed.error.issues` instead of `parsed.error.errors` — `.errors` property does not exist in Zod v4 (^4.3.6)
- **Form action type:** Wrapper `handleCreateDepense` function needed to satisfy React's form action type signature `(formData: FormData) => void | Promise<void>` — Server Action returning `{error: string} | void` is not directly assignable

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Zod v4 API — .errors does not exist, use .issues**
- **Found during:** Task 1 TypeScript compile
- **Issue:** `parsed.error.errors` causes TS2339 in Zod v4 (^4.3.6 installed)
- **Fix:** Changed to `parsed.error.issues[0]?.message`
- **Files modified:** `app/(app)/depenses/actions.ts`
- **Commit:** fe91bcb

**2. [Rule 1 - Bug] Form action return type incompatibility**
- **Found during:** Task 2 TypeScript compile
- **Issue:** `actionCreateDepense` returns `Promise<void | {error: string}>` which is not assignable to React form action type `(formData: FormData) => void | Promise<void>`
- **Fix:** Added wrapper `handleCreateDepense` function inside DepenseForm that calls `actionCreateDepense` and discards the return value
- **Files modified:** `components/depenses/DepenseForm.tsx`
- **Commit:** 2f7bd9d

## Self-Check

- [x] lib/db/queries/depenses.ts exports insertDepense, deleteDepense, getDepensesByMois
- [x] app/(app)/depenses/actions.ts exports actionCreateDepense, actionDeleteDepense
- [x] /depenses route listed as dynamic in build output
- [x] DepenseForm has segmented Chris/Alex buttons, 48px touch targets
- [x] All 5 DEP-01..DEP-05 tests pass
- [x] Commits fe91bcb, 2f7bd9d, 7ebef88 exist

## Self-Check: PASSED
