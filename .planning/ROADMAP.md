# Roadmap: Le Commun

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-05)
- 🚧 **v1.1 Import & Gestion des Mois** — Phase 5 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-05</summary>

- [x] Phase 1: Fondation — Infrastructure Vercel + Turso + NextAuth v5, auth Chris/Alex (completed 2026-03-04)
- [x] Phase 2: Balance — Dashboard balance du mois courant, algorithme corrigé, report automatique (completed 2026-03-05)
- [x] Phase 3: Saisie — Dépenses + ajustements CRUD, Server Actions Zod, mobile-first (completed 2026-03-05)
- [x] Phase 4: Historique — Mois archivés liste + détail, lecture seule (completed 2026-03-05)

Full archive: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### v1.1 Import & Gestion des Mois

**Phase 5: Import & Gestion des Mois**
- Goal: Add upload and delete capabilities to the historique page
- Requirements: IMPORT-01..05, DELETE-01..03
- Success criteria:
  1. User uploads `fixtures_janvier_2026.json` → month appears in history with correct data
  2. Uploading an already-existing month shows an error (no duplicate created)
  3. User clicks trash on a month → confirmation dialog appears
  4. User confirms deletion → month disappears from history, depenses/ajustements gone
  5. E2E tests pass for all 8 requirements (IMPORT-01..05, DELETE-01..03)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Fondation | v1.0 | 3/3 | Complete | 2026-03-04 |
| 2. Balance | v1.0 | 4/4 | Complete | 2026-03-05 |
| 3. Saisie | v1.0 | 4/4 | Complete | 2026-03-05 |
| 4. Historique | v1.0 | 2/2 | Complete | 2026-03-05 |
| 5. Import & Gestion des Mois | v1.1 | 0/1 | In progress | — |
