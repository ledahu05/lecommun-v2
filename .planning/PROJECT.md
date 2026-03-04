# Le Commun

## What This Is

Application web mobile-first de comptabilité partagée entre Chris et Alex. Elle remplace un Google Sheets de 55 mois (juillet 2021 → mars 2026) qui gérait une balance glissante de dépenses communes. Deux utilisateurs, données partagées, saisie rapide depuis le téléphone.

## Core Value

La balance nette entre Chris et Alex est toujours visible et juste — report automatique chaque mois, zéro saisie manuelle, zéro risque d'erreur de copie.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Saisir une dépense avec catégorie, sous-catégorie, montant et payeur
- [ ] Voir la balance en temps réel (qui doit combien à qui)
- [ ] Report automatique de la balance du mois précédent (plus jamais manuel)
- [ ] Ajouter un ajustement libre (virement, avance ponctuelle) avec libellé, montant et direction
- [ ] Consulter l'historique des balances mois par mois
- [ ] Supprimer une dépense ou un ajustement
- [ ] Authentification simple (Chris / Alex, credentials en env vars)

### Out of Scope

- Mode offline / PWA avec sync — complexité élevée, v2
- Export PDF mensuel — v2
- Module immobilier (crédit, parts Chris/Alex) — hors périmètre v1
- Graphiques d'évolution — v2
- Charges fixes auto-injectées chaque mois — v2
- Notifications push — v2
- Import des 55 mois historiques — post-launch si besoin

## Context

- Remplace un Google Sheets avec 55 onglets (1 par mois), utilisé depuis juillet 2021
- Le principal point de friction était le report manuel de la balance d'un mois sur l'autre (risque d'erreur silencieuse)
- Les deux users voient toutes les données — c'est volontaire, app partagée
- Saisie principale sur mobile (courses, restaurant) → mobile-first non négociable
- Stack décidée : Next.js 15 App Router, Turso (SQLite cloud), Drizzle ORM, NextAuth v5, shadcn/ui, Vercel

## Constraints

- **Stack**: Next.js 15 + Turso + Drizzle ORM + NextAuth v5 + shadcn/ui + Tailwind 3 — décidé, pas de changement
- **Utilisateurs**: Exactement 2 (Chris et Alex) — pas de système d'inscription
- **Mobile**: Touch targets ≥ 48px, police ≥ 16px, bottom nav fixe uniquement
- **Performance**: Balance recalculée à chaque requête depuis les données brutes, jamais en cache
- **Déploiement**: Vercel (CD automatique sur push main)
- **DB**: Turso cloud via @libsql/client, SQLite

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Server Actions pour les mutations | Évite le fetch côté client, plus simple avec App Router | — Pending |
| Pages = RSC uniquement | Zéro JS superflu côté client, fetch DB direct | — Pending |
| Credentials en variables d'env | 2 users privés, pas de table users, acceptable | — Pending |
| Balance recalculée à chaque requête | Pas de désynchronisation possible, données toujours fraîches | — Pending |
| 3 tables : mois, depenses, ajustements | Modèle minimal qui couvre tous les cas du Sheets | — Pending |
| Vercel SDK pour la gestion des déploiements | Gestion programmatique des déploiements via @vercel/sdk | — Pending |

---
*Last updated: 2026-03-04 after initialization*
