# Roadmap: Le Commun

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-05)
- ✅ **v1.1 Import & Gestion des Mois** — Phase 5 (shipped 2026-03-08)
- ✅ **v1.2 Balance Initiale** — Phase 6 (shipped 2026-03-08)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-05</summary>

- [x] Phase 1: Fondation — Infrastructure Vercel + Turso + NextAuth v5, auth Chris/Alex (completed 2026-03-04)
- [x] Phase 2: Balance — Dashboard balance du mois courant, algorithme corrigé, report automatique (completed 2026-03-05)
- [x] Phase 3: Saisie — Dépenses + ajustements CRUD, Server Actions Zod, mobile-first (completed 2026-03-05)
- [x] Phase 4: Historique — Mois archivés liste + détail, lecture seule (completed 2026-03-05)

Full archive: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 Import & Gestion des Mois (Phase 5) — SHIPPED 2026-03-08</summary>

- [x] Phase 5: Import & Gestion des Mois — Upload JSON fixture + suppression de mois avec cascade (completed 2026-03-08)

</details>

### v1.2 Balance Initiale

- [x] **Phase 6: Balance Initiale** - Saisie manuelle de la balance reportée quand aucun mois précédent n'existe en base (completed 2026-03-08)

## Phase Details

### Phase 6: Balance Initiale
**Goal**: Users can initialize the carried-forward balance when the app starts with no prior month data
**Depends on**: Phase 5 (existing dashboard and balance infrastructure)
**Requirements**: INIT-01, INIT-02, INIT-03, INIT-04, INIT-05
**Success Criteria** (what must be TRUE):
  1. When the current month has no previous month in the database, the dashboard displays an editable balance field
  2. User enters a signed amount (positive = Chris owes Alex, negative = Alex owes Chris) and submits — the balance recalculates immediately on the page
  3. User can re-edit the initial balance as many times as needed while no previous month exists
  4. When a previous month exists in the database, the balance reportee is computed automatically and no edit field appears (existing behavior unchanged)
**Plans**: 1 plan

Plans:
- [x] 06-01-PLAN.md — Backend queries, InitialBalanceForm component, dashboard wiring, E2E tests (completed 2026-03-08)

## Progress

**Execution Order:**
Phases execute in numeric order.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Fondation | v1.0 | 3/3 | Complete | 2026-03-04 |
| 2. Balance | v1.0 | 4/4 | Complete | 2026-03-05 |
| 3. Saisie | v1.0 | 4/4 | Complete | 2026-03-05 |
| 4. Historique | v1.0 | 2/2 | Complete | 2026-03-05 |
| 5. Import & Gestion | v1.1 | 1/1 | Complete | 2026-03-08 |
| 6. Balance Initiale | v1.2 | 1/1 | Complete | 2026-03-08 |
