---
phase: 09-report-automatique
plan: 01
subsystem: database
tags: [drizzle, sqlite, recurrent, auto-copy, month-creation]

# Dependency graph
requires:
  - phase: 08-flag-recurrent
    provides: recurrent column on depenses and ajustements tables
provides:
  - getRecurrentDepensesByMois query
  - getRecurrentAjustementsByMois query
  - copyRecurrentItems helper integrated into getOrCreateCurrentMois
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [recurrent-item-copy-on-month-creation]

key-files:
  created: []
  modified:
    - lib/db/queries/depenses.ts
    - lib/db/queries/ajustements.ts
    - lib/db/queries/mois.ts

key-decisions:
  - "Recurrent items copied with date set to 1st of new month"
  - "Copy only runs on creation path (after early return for existing month)"

patterns-established:
  - "Recurrent copy pattern: query recurrent items from prev month, insert as independent rows in new month"

requirements-completed: [RPT-01, RPT-02, RPT-03, RPT-04]

# Metrics
duration: 1min
completed: 2026-03-08
---

# Phase 09 Plan 01: Report Automatique Summary

**Auto-copy recurrent depenses and ajustements into new month via getOrCreateCurrentMois with independent rows retaining recurrent=1**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-08T17:08:10Z
- **Completed:** 2026-03-08T17:09:40Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added query functions to fetch recurrent depenses and ajustements by mois_id
- Integrated copyRecurrentItems into getOrCreateCurrentMois so new months automatically get recurrent items from previous month
- Copied items are independent DB rows (new IDs) with recurrent=1 for cascading to future months

## Task Commits

Each task was committed atomically:

1. **Task 1: Add recurrent item query functions** - `426534e` (feat)
2. **Task 2: Integrate recurrent copy into getOrCreateCurrentMois** - `6a72f79` (feat)

## Files Created/Modified
- `lib/db/queries/depenses.ts` - Added getRecurrentDepensesByMois query, imported `and` from drizzle-orm
- `lib/db/queries/ajustements.ts` - Added getRecurrentAjustementsByMois query, imported `and` from drizzle-orm
- `lib/db/queries/mois.ts` - Added copyRecurrentItems helper, integrated call after new month insert, imported depense/ajustement query+insert functions

## Decisions Made
- Recurrent items get date set to 1st of the new month (simple, predictable)
- Copy logic reuses existing insertDepense/insertAjustement functions ensuring consistent behavior
- Previous month lookup uses same calendar math pattern as computeBalanceReportee

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Recurrent copy logic is complete and integrated into month creation flow
- No further plans in phase 09

---
*Phase: 09-report-automatique*
*Completed: 2026-03-08*
