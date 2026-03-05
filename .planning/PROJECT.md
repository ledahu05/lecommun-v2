# Le Commun

## What This Is

Application web mobile-first de comptabilité partagée entre Chris et Alex. Elle remplace un Google Sheets de 55 mois (juillet 2021 → mars 2026) qui gérait une balance glissante de dépenses communes. Deux utilisateurs, données partagées, saisie rapide depuis le téléphone.

v1.0 MVP livré le 2026-03-05 — l'app est production-ready et remplace le Google Sheets.

## Core Value

La balance nette entre Chris et Alex est toujours visible et juste — report automatique chaque mois, zéro saisie manuelle, zéro risque d'erreur de copie.

## Current Milestone: v1.1 Import & Gestion des Mois

**Goal:** Permettre l'import de données historiques par fichier JSON et la suppression de mois depuis la page historique.

**Target features:**
- Upload d'un fichier JSON fixture pour importer un mois (mois + dépenses + ajustements)
- Suppression d'un mois avec confirmation (cascade sur dépenses et ajustements)

## Requirements

### Validated

- ✓ Saisir une dépense avec catégorie, sous-catégorie, montant et payeur — v1.0
- ✓ Voir la balance en temps réel (qui doit combien à qui) — v1.0
- ✓ Report automatique de la balance du mois précédent (plus jamais manuel) — v1.0
- ✓ Ajouter un ajustement libre (virement, avance ponctuelle) avec libellé, montant et direction — v1.0
- ✓ Consulter l'historique des balances mois par mois — v1.0
- ✓ Supprimer une dépense ou un ajustement — v1.0
- ✓ Authentification simple (Chris / Alex, credentials en env vars) — v1.0

### Active

- Import d'un mois depuis un fichier JSON fixture (upload depuis la page historique) — v1.1
- Suppression d'un mois avec confirmation (cascade sur dépenses et ajustements) — v1.1

### Out of Scope

- Mode offline / PWA avec sync — complexité élevée, v2
- Export PDF mensuel — v2
- Module immobilier (crédit, parts Chris/Alex) — hors périmètre v1
- Graphiques d'évolution — v2
- Charges fixes auto-injectées chaque mois — v2
- Notifications push — v2
- Import des 55 mois historiques — post-launch si besoin

## Context

**Current state (post v1.0):**
- 2,535 LOC TypeScript — Next.js 15 App Router + Turso (SQLite cloud) + Drizzle ORM + NextAuth v5 + shadcn/ui
- 22/22 Playwright E2E tests green
- Deployed on Vercel with CD on push to main
- Remplace intégralement le Google Sheets de 55 mois

**Background:**
- Remplace un Google Sheets avec 55 onglets (1 par mois), utilisé depuis juillet 2021
- Le principal point de friction était le report manuel de la balance d'un mois sur l'autre (risque d'erreur silencieuse) — résolu avec `getOrCreateCurrentMois()` + `computeBalanceReportee()`
- Les deux users voient toutes les données — c'est volontaire, app partagée
- Saisie principale sur mobile (courses, restaurant) → mobile-first non négociable

## Constraints

- **Stack**: Next.js 15 + Turso + Drizzle ORM + NextAuth v5 + shadcn/ui + Tailwind 3 — décidé, pas de changement
- **Utilisateurs**: Exactement 2 (Chris et Alex) — pas de système d'inscription
- **Mobile**: Touch targets ≥ 48px, police ≥ 16px, bottom nav fixe uniquement
- **Performance**: Balance recalculée à chaque requête depuis les données brutes, jamais en cache (`force-dynamic`)
- **Déploiement**: Vercel (CD automatique sur push main)
- **DB**: Turso cloud via @libsql/client, SQLite

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Server Actions pour les mutations | Évite le fetch côté client, plus simple avec App Router | ✓ Good — Server Actions + revalidatePath() pattern clean |
| Pages = RSC uniquement | Zéro JS superflu côté client, fetch DB direct | ✓ Good — 2,535 LOC, minimal bundle |
| Credentials en variables d'env | 2 users privés, pas de table users, acceptable | ✓ Good — NextAuth v5 credentials provider simple |
| Balance recalculée à chaque requête | Pas de désynchronisation possible, données toujours fraîches | ✓ Good — force-dynamic confirmed working |
| 3 tables : mois, depenses, ajustements | Modèle minimal qui couvre tous les cas du Sheets | ✓ Good — covers all scenarios, cascade delete clean |
| NextAuth split config (authConfig / index.ts) | Edge-safe middleware sans import DB | ✓ Good — middleware.ts clean, no import cycle |
| uniqueIndex sur (annee, mois) dans sqliteTable callback | drizzle-kit generate ne voit pas les exports standalone | ✓ Good — idempotent month creation with onConflictDoUpdate |
| Algorithme corrigé : total_chris_vers_alex inclut balance_mensuelle | CLAUDE.md documentation était erronée — vérifiée contre fixtures mars 2026 | ✓ Good — validé avec fixtures_e2e.json |
| vitest pour tests unitaires, Playwright E2E uniquement | Playwright a un bug CJS import avec testIgnore | ✓ Good — testIgnore: ['**/unit/**'] en config |
| AjustementForm : vers implicitement dérivé de de | Élimine la classe d'erreur de === vers | ✓ Good — UX simplifiée |
| HistoriqueDepenseItem/AjustementItem séparés (sans bouton supprimer) | Patron lecture-seule explicite pour l'archive | ✓ Good — HIS-02 E2E vérifie l'absence de delete buttons |

---
*Last updated: 2026-03-05 after v1.1 milestone start*
