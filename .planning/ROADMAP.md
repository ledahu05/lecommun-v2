# Roadmap: Le Commun

## Overview

Four phases deliver the full v1 app. Phase 1 establishes infrastructure and authentication — the app exists and both users can log in. Phase 2 delivers the core value: the balance is always visible and always correct, including automatic month-to-month carry-forward. Phase 3 enables daily usage — entering expenses and adjustments. Phase 4 closes the loop with month history browsing. After Phase 4, the app fully replaces the Google Sheets.

## Phases

- [x] **Phase 1: Fondation** - Infrastructure Vercel + Turso provisionnée, authentification Chris/Alex opérationnelle (completed 2026-03-04)
- [x] **Phase 2: Balance** - Dashboard avec balance du mois courant et report automatique entre mois (completed 2026-03-05)
- [ ] **Phase 3: Saisie** - Formulaires de saisie et suppression des dépenses et ajustements
- [ ] **Phase 4: Historique** - Consultation des mois archivés avec détail complet

## Phase Details

### Phase 1: Fondation
**Goal**: L'application est déployée, la base de données est prête, et Chris et Alex peuvent se connecter
**Depends on**: Nothing (first phase)
**Requirements**: INF-01, INF-02, INF-03, AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. Chris et Alex peuvent se connecter avec leurs identifiants et rester connectés 30 jours
  2. Toute URL de l'app redirige vers /login si la session est absente ou expirée
  3. L'application est accessible via Vercel en production avec CD automatique sur push main
  4. La base de données Turso contient les tables mois, depenses, ajustements avec le schéma correct
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Bootstrap Next.js 15, schéma DB Drizzle, config auth NextAuth v5 Edge-safe, infrastructure Playwright
- [ ] 01-02-PLAN.md — Page de connexion Chris/Alex, middleware protection des routes, layout app et bottom nav
- [ ] 01-03-PLAN.md — Provisionnement Turso + Vercel, migration DB, variables d'environnement, validation E2E

### Phase 2: Balance
**Goal**: La balance du mois courant est toujours visible, juste, et se reporte automatiquement d'un mois à l'autre
**Depends on**: Phase 1
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, RPT-01, RPT-02
**Success Criteria** (what must be TRUE):
  1. Dès la connexion, l'utilisateur voit qui doit combien à qui pour le mois courant
  2. Le dashboard affiche le détail complet : total Chris, total Alex, balance mensuelle, report du mois précédent, et ventilation par catégorie
  3. La balance reflète immédiatement les données brutes à chaque chargement de page, sans cache
  4. Quand un nouveau mois commence, la balance_reportee est automatiquement la balance_finale du mois précédent — sans aucune saisie manuelle
**Plans**: 4 plans

Plans:
- [ ] 02-01-PLAN.md — Fondations test : stubs E2E, helpers seed/auth, shadcn badge/separator/skeleton, unique index (annee, mois)
- [ ] 02-02-PLAN.md — Logique métier : types/index.ts, lib/balance.ts (algorithme corrigé), lib/db/queries/
- [ ] 02-03-PLAN.md — Dashboard UI : BalanceCard, BalanceSynthese, page.tsx RSC complet, loading.tsx skeleton
- [ ] 02-04-PLAN.md — Tests E2E complets : DASH-01 à RPT-01 verts, suite Playwright complète

### Phase 3: Saisie
**Goal**: Chris et Alex peuvent saisir et supprimer des dépenses et des ajustements au quotidien
**Depends on**: Phase 2
**Requirements**: DEP-01, DEP-02, DEP-03, DEP-04, DEP-05, AJU-01, AJU-02, AJU-03, AJU-04
**Success Criteria** (what must be TRUE):
  1. L'utilisateur peut saisir une dépense (catégorie, sous-catégorie, montant, payeur, date, libellé optionnel) et la voir apparaître dans la liste du mois courant
  2. Une dépense avec montant ≤ 0 est refusée immédiatement côté client et côté serveur
  3. L'utilisateur peut supprimer une dépense ou un ajustement, et la balance se recalcule aussitôt
  4. L'utilisateur peut saisir un ajustement (direction chris→alex ou alex→chris, montant, libellé obligatoire, date) et le voir intégré dans la balance finale
  5. Les catégories et sous-catégories disponibles sont fixes et conformes à lib/categories.ts
**Plans**: 4 plans

Plans:
- [ ] 03-01-PLAN.md — Stubs Playwright : tests/depenses.spec.ts (DEP-01..05) et tests/ajustements.spec.ts (AJU-01..04)
- [ ] 03-02-PLAN.md — Feature dépenses : queries DB, Server Actions Zod, page RSC, DepenseForm/List/Item, tests verts
- [ ] 03-03-PLAN.md — Feature ajustements : queries DB, Server Actions Zod, page RSC, AjustementForm/List/Item, tests verts
- [ ] 03-04-PLAN.md — Suite complète verte + validation mobile humaine

### Phase 4: Historique
**Goal**: Chris et Alex peuvent consulter les mois archivés avec leur détail complet
**Depends on**: Phase 3
**Requirements**: HIS-01, HIS-02
**Success Criteria** (what must be TRUE):
  1. L'utilisateur voit la liste de tous les mois passés avec leur balance finale
  2. L'utilisateur peut ouvrir un mois archivé et consulter ses dépenses, ajustements et balance détaillée
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fondation | 3/3 | Complete   | 2026-03-04 |
| 2. Balance | 4/4 | Complete   | 2026-03-05 |
| 3. Saisie | 0/4 | Not started | - |
| 4. Historique | 0/TBD | Not started | - |
