# Milestones

## v1.2 Balance Initiale (Shipped: 2026-03-08)

**Phases completed:** 1 phase, 1 plan, 3 tasks
**Timeline:** 2026-03-08 (1 day)
**Requirements:** 5/5 satisfied (INIT-01..05)

**Key accomplishments:**
- Champ balance initiale éditable sur le dashboard quand aucun mois précédent n'existe en base — permet d'initialiser le report depuis le Google Sheets
- Server action Zod-validée pour montants signés (positif = Chris doit à Alex, négatif = inverse)
- Affichage conditionnel — le champ s'efface automatiquement quand un mois précédent est créé
- 5 nouveaux tests E2E (38 total green, zéro régressions)

---

## v1.1 Import & Gestion des Mois (Shipped: 2026-03-08)

**Phases completed:** 1 phase, 1 plan
**Timeline:** 2026-03-05 → 2026-03-08
**Requirements:** 8/8 satisfied (IMPORT-01..05, DELETE-01..03)

**Key accomplishments:**
- Import de mois depuis fichier JSON fixture avec validation Zod, remapping mois_id, balance_reportee préservée
- Suppression de mois avec AlertDialog confirmation et cascade sur dépenses/ajustements
- 11 nouveaux tests E2E (7 import + 4 delete), 33/33 total green

---

## v1.0 MVP (Shipped: 2026-03-05)

**Phases completed:** 4 phases, 13 plans
**Timeline:** 2026-03-04 → 2026-03-05 (2 days)
**Codebase:** 125 files, 2,535 LOC TypeScript, 22/22 Playwright tests green
**Requirements:** 23/23 v1 requirements satisfied

**Key accomplishments:**
- Déploiement Next.js 15 + Turso + Drizzle ORM sur Vercel avec CD automatique — NextAuth v5 Edge-safe split config, sessions JWT 30 jours
- Algorithme de balance corrigé avec report automatique mensuel (`balance_reportee = balance_finale` du mois précédent) — jamais de saisie manuelle
- Dashboard RSC avec ventilation par catégorie, recalcul à chaque requête (`force-dynamic`), 5 tests E2E DASH-01..RPT-01 verts
- Saisie des dépenses et ajustements avec Server Actions Zod, formulaires mobile-first (48px touch targets, 16px minimum), 9 tests E2E verts, validation UX 390px approuvée
- Consultation de l'historique des mois archivés en lecture seule — liste + détail complet, remplace intégralement le Google Sheets de 55 mois

**Tech debt carried forward:**
- Nyquist VALIDATION.md files stuck at `draft` — never updated post-execution (process only)
- Phase 1 production Vercel checks deferred (local Playwright 6/6 green, mobile sign-off approved)

---
