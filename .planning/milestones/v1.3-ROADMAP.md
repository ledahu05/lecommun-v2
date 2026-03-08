# Roadmap: Le Commun

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-05)
- ✅ **v1.1 Import & Gestion des Mois** — Phase 5 (shipped 2026-03-08)
- ✅ **v1.2 Balance Initiale** — Phase 6 (shipped 2026-03-08)
- 🚧 **v1.3 Modales d'ajout** — Phase 7 (in progress)

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

### 🚧 v1.3 Modales d'ajout (In Progress)

**Milestone Goal:** Remplacer les formulaires Card inline par des modales Dialog et ajouter la saisie rapide depuis le dashboard.

- [x] **Phase 7: Modales et saisie rapide** — Formulaires en modales Dialog avec sous-categories en boutons et saisie rapide depuis le dashboard (completed 2026-03-08)

## Phase Details

### Phase 7: Modales et saisie rapide
**Goal**: L'utilisateur saisit depenses et ajustements via des modales Dialog depuis n'importe quelle page, avec sous-categories selectionnees par boutons
**Depends on**: Phase 6 (v1.2 shipped)
**Requirements**: MOD-01, MOD-02, MOD-03, MOD-04, DASH-01, DASH-02, UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. L'utilisateur clique un bouton sur la page depenses ou ajustements et une modale s'ouvre avec le formulaire correspondant — aucun formulaire inline n'est visible sur les pages liste
  2. L'utilisateur clique un bouton quick-add sur le dashboard (BalanceCard) et peut saisir une depense ou un ajustement sans quitter la page
  3. Les sous-categories sont presentees comme une grille de boutons cliquables (plus de menu deroulant select)
  4. Apres soumission reussie, la modale se ferme automatiquement et les donnees affichees se rafraichissent
  5. En cas d'erreur de validation, la modale reste ouverte avec un message d'erreur visible
**Plans:** 2/2 plans complete

Plans:
- [x] 07-01-PLAN.md — Refactorer formulaires depense/ajustement en modales Dialog avec sous-categories boutons
- [ ] 07-02-PLAN.md — Ajouter boutons quick-add depense/ajustement sur le dashboard

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
| 7. Modales et saisie rapide | 2/2 | Complete   | 2026-03-08 | - |
