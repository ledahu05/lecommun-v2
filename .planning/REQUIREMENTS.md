# Requirements: v1.1 Import & Gestion des Mois

## IMPORT Category

### IMPORT-01
**User can upload a JSON fixture file from the history page to import a month's data**

- An upload button is visible on the `/historique` page
- Clicking the button opens a file picker (accepts `.json` files)
- On file selection, the import is triggered automatically
- On success, a toast confirms the import and the new month appears in the list

### IMPORT-02
**Import validates JSON structure before inserting**

- Required top-level fields: `mois[]`, `depenses[]`, `ajustements[]`
- Each `mois` entry must have: `annee`, `mois` (1–12), `balance_reportee`
- Each `depense` entry must have: `mois_id` (relative), `categorie`, `sous_categorie`, `paye_par`, `montant`, `date_depense`
- Each `ajustement` entry must have: `mois_id` (relative), `de`, `vers`, `montant`, `label`, `date_ajustement`
- Invalid JSON or missing required fields return an error toast — no partial insert

### IMPORT-03
**Import uses `balance_reportee` from the JSON file as-is**

- The `balance_reportee` value from the fixture is preserved exactly
- No recalculation from DB state — historical values from original source are trusted
- Rationale: Preserves 55 months of Google Sheets history

### IMPORT-04
**If the month already exists (same annee/mois), import fails with a clear error**

- Duplicate detection uses the unique constraint on `(annee, mois)`
- Error message: "Ce mois existe déjà (YYYY-MM). Supprimez-le d'abord si vous souhaitez le remplacer."
- No silent overwrite — no data is modified on conflict

### IMPORT-05
**Depense/ajustement IDs from fixture are ignored; DB auto-assigns IDs with mois_id remapped**

- The `id` field in fixture `depenses` and `ajustements` is ignored
- The `mois_id` in fixture rows refers to the fixture's internal mois index, not a DB ID
- After inserting `mois`, the real DB `mois.id` is used for all depenses/ajustements FK

---

## DELETE Category

### DELETE-01
**User can delete a month from the history list page via a trash button on each MoisCard**

- Each month card on `/historique` displays a trash icon button
- Button has minimum 48px touch target (mobile-first)
- Button is clearly destructive (red icon or destructive variant)

### DELETE-02
**Deletion requires a confirmation dialog before proceeding**

- Clicking trash opens a confirmation dialog (shadcn/ui AlertDialog)
- Dialog shows the month name and warns about permanent deletion
- User must click a confirm button to proceed; cancel aborts with no change

### DELETE-03
**Deleting a month cascades to all depenses and ajustements for that month**

- DB schema already has cascade delete on `depenses.mois_id` and `ajustements.mois_id`
- After deletion, the month disappears from the history list
- A success toast confirms deletion

---

## Future Requirements (v2)

- Multi-month JSON import (currently: one month per file)
- Import with recalculated balance_reportee from actual DB state

## Out of Scope

| Feature | Reason |
|---------|--------|
| Overwrite existing month on import | Risk of silent data corruption — reject and let user delete first |
| Update balance_reportee of subsequent months after delete | Complex cascade; out of scope for v1.1 |
| Import from fixtures_e2e.json (multi-month) | Format different; single-month files only for now |
