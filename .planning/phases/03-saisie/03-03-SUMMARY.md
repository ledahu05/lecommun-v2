---
phase: 03-saisie
plan: "03"
subsystem: ajustements
tags: [server-actions, rsc, playwright, zod, drizzle]
dependency_graph:
  requires: [03-01]
  provides: [AJU-01, AJU-02, AJU-03, AJU-04]
  affects: [dashboard-balance]
tech_stack:
  added: []
  patterns: [server-actions, rsc, segmented-buttons, revalidatePath]
key_files:
  created:
    - app/(app)/ajustements/actions.ts
    - components/ajustements/AjustementForm.tsx
    - components/ajustements/AjustementItem.tsx
    - components/ajustements/AjustementsList.tsx
  modified:
    - lib/db/queries/ajustements.ts
    - app/(app)/ajustements/page.tsx
    - tests/ajustements.spec.ts
decisions:
  - "AjustementForm uses implicit vers derivation from de (user picks de, vers is auto-opposite) — eliminates de === vers UX error"
  - "handleCreateAjustement wrapper function satisfies React void | Promise<void> form action signature (same pattern as depenses)"
metrics:
  duration: "4 min"
  completed_date: "2026-03-05"
  tasks_completed: 3
  files_modified: 7
---

# Phase 3 Plan 03: Ajustements Feature Summary

**One-liner:** Full ajustements CRUD with Zod-validated Server Actions, RSC list/form components, and 4 E2E tests green.

## What Was Built

The complete ajustements data-entry feature for tracking virements and ponctual debts between Chris and Alex. Adjustments are the second pillar of the balance algorithm — without them, `balance_finale` cannot be correct.

### DB Layer (`lib/db/queries/ajustements.ts`)
- `insertAjustement`: inserts with typed data object, `date_ajustement` as Date
- `deleteAjustement`: deletes by id
- `getAjustementsByMois`: updated with `ORDER BY date_ajustement DESC`

### Server Actions (`app/(app)/ajustements/actions.ts`)
- `actionCreateAjustement`: Zod schema with `de !== vers` refine, `label` required (min 1), converts date string to Date, calls `getOrCreateCurrentMois()` then `insertAjustement`, revalidates `/ajustements` and `/`
- `actionDeleteAjustement`: id validation, calls `deleteAjustement`, revalidates both paths
- Returns `{ error: string }` on validation failure

### UI Components
- `AjustementForm.tsx` (Client Component): segmented Chris/Alex buttons for `de`, `vers` auto-derived as opposite, all touch targets min-h-[48px], label required
- `AjustementItem.tsx` (Server Component): label + direction + amount display, inline delete form, `data-testid="ajustement-item"`
- `AjustementsList.tsx` (Server Component): empty state (`data-testid="ajustements-vides"`) or list (`data-testid="ajustements-list"`)
- `page.tsx`: RSC with `force-dynamic`, fetches current month data, renders form + list

### Tests
All 4 AJU tests green:
- AJU-01: form submission creates ajustement in list
- AJU-02: existing ajustements displayed on page load
- AJU-03: delete button removes ajustement, shows empty state
- AJU-04: ajustement changes dashboard balance_finale (50 → 20 after alex→chris 30€)

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Implicit `vers` derivation from `de` in AjustementForm | User picks debtor; receiver is automatic, eliminating de === vers UX error class |
| `handleCreateAjustement` async wrapper | Satisfies React `void \| Promise<void>` form action type signature (same pattern as DepenseForm) |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files created:
- `/home/chris/workspace/lecommun/app/(app)/ajustements/actions.ts` — FOUND
- `/home/chris/workspace/lecommun/components/ajustements/AjustementForm.tsx` — FOUND
- `/home/chris/workspace/lecommun/components/ajustements/AjustementItem.tsx` — FOUND
- `/home/chris/workspace/lecommun/components/ajustements/AjustementsList.tsx` — FOUND

Commits:
- 61b7114: feat(03-03): add DB queries and Server Actions for ajustements
- bf739ff: feat(03-03): build ajustements page — RSC + form + list components
- f96bfea: test(03-03): make AJU-01..AJU-04 Playwright tests green

All 4 AJU Playwright tests: PASSED
