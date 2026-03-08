# Roadmap: Le Commun

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-05)
- ✅ **v1.1 Import & Gestion des Mois** — Phase 5 (shipped 2026-03-08)
- ✅ **v1.2 Balance Initiale** — Phase 6 (shipped 2026-03-08)
- ✅ **v1.3 Modales d'ajout** — Phase 7 (shipped 2026-03-08)
- 🚧 **v1.4 Récurrences** — Phases 8-9 (in progress)

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

Full archive: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 Balance Initiale (Phase 6) — SHIPPED 2026-03-08</summary>

- [x] Phase 6: Balance Initiale — Saisie manuelle de la balance reportée quand aucun mois précédent n'existe en base (completed 2026-03-08)

Full archive: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>✅ v1.3 Modales d'ajout (Phase 7) — SHIPPED 2026-03-08</summary>

- [x] Phase 7: Modales et saisie rapide — Modales Dialog pour dépenses/ajustements, grille boutons sous-catégories, quick-add dashboard (completed 2026-03-08)

Full archive: `.planning/milestones/v1.3-ROADMAP.md`

</details>

### 🚧 v1.4 Récurrences (In Progress)

**Milestone Goal:** Permettre de marquer des dépenses et ajustements comme récurrents pour qu'ils soient automatiquement reportés à chaque nouveau mois.

- [ ] **Phase 8: Flag récurrent** - Schema DB, toggle dans les formulaires, indicateur visuel dans les listes
- [ ] **Phase 9: Report automatique** - Copie automatique des items récurrents lors de la création d'un nouveau mois

## Phase Details

### Phase 8: Flag récurrent
**Goal**: L'utilisateur peut marquer n'importe quelle dépense ou ajustement comme récurrent, et voir d'un coup d'oeil quels items le sont
**Depends on**: Phase 7 (formulaires modaux existants)
**Requirements**: REC-01, REC-02, REC-03, REC-04, REC-05
**Success Criteria** (what must be TRUE):
  1. User peut activer le toggle "récurrent" en creant une nouvelle dépense, et l'item est sauvegardé avec ce flag
  2. User peut activer le toggle "récurrent" en creant un nouvel ajustement, et l'item est sauvegardé avec ce flag
  3. User peut désactiver la récurrence sur une dépense ou un ajustement existant depuis la liste
  4. Les items récurrents affichent un indicateur visuel distinct dans les listes dépenses et ajustements
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

### Phase 9: Report automatique
**Goal**: Les items récurrents sont automatiquement copiés dans le nouveau mois, sans aucune action manuelle
**Depends on**: Phase 8
**Requirements**: RPT-01, RPT-02, RPT-03, RPT-04
**Success Criteria** (what must be TRUE):
  1. Quand un nouveau mois est créé, les dépenses marquées récurrentes du mois précédent apparaissent automatiquement dans le nouveau mois
  2. Quand un nouveau mois est créé, les ajustements marqués récurrents du mois précédent apparaissent automatiquement dans le nouveau mois
  3. User peut modifier ou supprimer un item reporté sans affecter l'original du mois précédent
  4. Les items reportés conservent le flag récurrent (ils seront à nouveau reportés au mois suivant)
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

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
| 7. Modales et saisie rapide | v1.3 | 2/2 | Complete | 2026-03-08 |
| 8. Flag récurrent | v1.4 | 0/? | Not started | - |
| 9. Report automatique | v1.4 | 0/? | Not started | - |
