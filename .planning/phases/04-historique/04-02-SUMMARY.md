---
phase: 04-historique
plan: 02
subsystem: ui
tags: [nextjs, drizzle, playwright, react-server-components, mobile-first]

# Dependency graph
requires:
  - phase: 04-01
    provides: HIS-01 and HIS-02 test stubs (fixme) to implement against
  - phase: 02-balance
    provides: calculerBalance() business logic used in getAllMois() and detail page
  - phase: 03-saisie
    provides: getDepensesByMois(), getAjustementsByMois() queries reused in detail page
provides:
  - getAllMois() DB query — all months ordered by recency with computed balance_finale
  - /historique list page — RSC showing all archived months with clickable MoisCard rows
  - /historique/[id] detail page — RSC showing read-only depenses, ajustements, and BalanceCard
  - MoisCard, HistoriqueDepenseItem, HistoriqueAjustementItem read-only components
  - HIS-01 and HIS-02 E2E tests green
affects: [future phases, v1.0 release gate]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - RSC detail page with async params (Next.js 15 — params: Promise<{ id: string }>)
    - Read-only archive components without delete buttons (separate from interactive components)
    - getAllMois() computes balance_finale inline via Promise.all for list display

key-files:
  created:
    - lib/db/queries/mois.ts (getAllMois added)
    - app/(app)/historique/page.tsx
    - app/(app)/historique/[id]/page.tsx
    - components/historique/MoisCard.tsx
    - components/historique/HistoriqueDepenseItem.tsx
    - components/historique/HistoriqueAjustementItem.tsx
    - tests/historique.spec.ts
  modified: []

key-decisions:
  - "getAllMois() computes balance_finale at query time via Promise.all — no cache, no stored value, consistent with project pattern"
  - "Separate HistoriqueDepenseItem/HistoriqueAjustementItem components (no delete button) vs interactive depense/ajustement items — explicit read-only archive pattern"
  - "MoisCard uses capitalize CSS class on date-fns formatted month label — avoids manual string manipulation"

patterns-established:
  - "Archive pages: RSC with force-dynamic, reuse BalanceCard/BalanceSynthese, separate read-only item components"
  - "Next.js 15 dynamic route: params typed as Promise<{ id: string }>, awaited at top of page component"

requirements-completed: [HIS-01, HIS-02]

# Metrics
duration: 35min
completed: 2026-03-05
---

# Phase 4 Plan 02: Historique Summary

**Read-only historique feature with RSC list and detail pages, getAllMois() DB query, and 22/22 E2E tests green at mobile 390x844 viewport**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-03-05T09:41:27Z
- **Completed:** 2026-03-05
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 7

## Accomplishments

- Implemented getAllMois() query computing balance_finale inline for every archived month
- Built /historique list page (RSC) with MoisCard components — empty state, clickable rows linking to detail
- Built /historique/[id] detail page (RSC) — read-only HistoriqueDepenseItem and HistoriqueAjustementItem, reusing BalanceCard and BalanceSynthese
- HIS-01 and HIS-02 E2E tests implemented and green; full 22-test suite passing with 0 regressions
- Mobile UX approved by human at 390x844 viewport — 48px tap targets, correct navigation, no delete buttons in archive

## Task Commits

Each task was committed atomically:

1. **Task 1: Add getAllMois DB query and build list + detail pages** - `5ea702c` (feat)
2. **Task 2: Make HIS-01 and HIS-02 E2E tests green** - `68ee9a5` (feat)
3. **Task 3: Mobile UX sign-off and full suite green** - human-verify checkpoint, approved by user

## Files Created/Modified

- `lib/db/queries/mois.ts` - getAllMois() added; fetches all months ordered desc, computes balance_finale via calculerBalance
- `app/(app)/historique/page.tsx` - RSC list page replacing stub; empty state + MoisCard list with data-testid="historique-list"
- `app/(app)/historique/[id]/page.tsx` - RSC detail page; async params (Next.js 15), notFound() guard, BalanceCard + BalanceSynthese + read-only item lists
- `components/historique/MoisCard.tsx` - Clickable Link card, min-h-[48px], date-fns month label, balance_finale display with debiteur text
- `components/historique/HistoriqueDepenseItem.tsx` - Read-only depense row, no delete button, data-testid="historique-depense-item"
- `components/historique/HistoriqueAjustementItem.tsx` - Read-only ajustement row, no delete button, data-testid="historique-ajustement-item"
- `tests/historique.spec.ts` - HIS-01 (list page assertions) and HIS-02 (detail page assertions, no delete buttons) implemented

## Decisions Made

- getAllMois() computes balance_finale at query time via Promise.all — no cached/stored value, consistent with the project's "recalculate every request" pattern from Phase 2
- Created separate HistoriqueDepenseItem and HistoriqueAjustementItem components (without delete button) rather than reusing interactive depense/ajustement components — explicit read-only archive pattern, prevents accidental mutation in archive view

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 4 (historique) is complete. All 4 phases of v1.0 are now done.
- The app fully replaces the Google Sheets: balance dashboard, depenses CRUD, ajustements CRUD, and historique read-only archive all functional and E2E-tested.
- Full 22-test Playwright suite passes with 0 failures.
- No blockers.

---
*Phase: 04-historique*
*Completed: 2026-03-05*
