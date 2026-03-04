---
phase: 01-fondation
plan: "02"
subsystem: auth-ui
tags: [nextjs, nextauth, middleware, ui, mobile-first, bottom-nav]
dependency_graph:
  requires: [01-01]
  provides: [auth-ui, route-protection, navigation]
  affects: [all-pages]
tech_stack:
  added: []
  patterns:
    - "Route groups: (auth) pour login public, (app) pour pages protegees"
    - "Client Component signIn depuis next-auth/react (pas lib/auth/index)"
    - "Server Action signOut dans RSC page.tsx"
    - "BottomNav: usePathname avec exact match / et startsWith pour sous-routes"
key_files:
  created:
    - middleware.ts
    - app/api/auth/[...nextauth]/route.ts
    - app/(auth)/login/page.tsx
    - app/(app)/layout.tsx
    - app/(app)/page.tsx
    - app/(app)/depenses/page.tsx
    - app/(app)/ajustements/page.tsx
    - app/(app)/historique/page.tsx
    - components/layout/BottomNav.tsx
  modified:
    - app/layout.tsx
  deleted:
    - app/page.tsx
decisions:
  - "signIn depuis next-auth/react dans Client Components (pas lib/auth/index qui est serveur uniquement)"
  - "Route group (app) contient toutes les pages protegees; root page.tsx supprime pour eviter conflit"
  - "BottomNav: exact match pour /, startsWith pour /depenses, /ajustements, /historique"
metrics:
  duration: "3min"
  completed_date: "2026-03-04"
  tasks_completed: 3
  files_changed: 10
---

# Phase 01 Plan 02: Auth UI et Navigation Summary

**One-liner:** Interface complete avec middleware NextAuth, page login segmentee Chris/Alex, bottom bar fixe 4 onglets et pages placeholder.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Middleware et route handler NextAuth | 050fda6 | middleware.ts, app/api/auth/[...nextauth]/route.ts |
| 2 | Page connexion boutons segmentes Chris/Alex | 97cfb3b | app/(auth)/login/page.tsx |
| 3 | Layout app, BottomNav et pages placeholder | f9f5bd5 | app/(app)/layout.tsx, components/layout/BottomNav.tsx, 4 pages |

## What Was Built

### Middleware de protection des routes (Task 1)

`middleware.ts` a la racine utilise `auth` de `lib/auth/index` (Edge-safe) pour:
- Rediriger vers `/login` si non connecte sur toute route hors `/login`
- Rediriger vers `/` si deja connecte et tente d'acceder a `/login`
- Le matcher exclut `api/auth`, `_next/static`, `_next/image`, `favicon.ico`

`app/api/auth/[...nextauth]/route.ts` expose les handlers GET/POST de NextAuth.

### Page de connexion (Task 2)

`app/(auth)/login/page.tsx` est un Client Component avec:
- Deux boutons segmentes Chris/Alex (touch targets `h-12` = 48px, mobile-first)
- Un seul champ mot de passe (`text-base` = 16px, evite zoom iOS)
- Message d'erreur generique "Identifiants incorrects"
- `signIn('credentials', { redirect: false })` depuis `next-auth/react`
- Redirection vers `/` apres connexion reussie via `router.push('/')`

### Layout, BottomNav et pages (Task 3)

`components/layout/BottomNav.tsx` (Client Component):
- 4 onglets: Accueil, Depenses, Ajustements, Historique
- Touch targets `min-h-[48px]` sur chaque lien
- `isActive` = exact match pour `/`, `startsWith` pour sous-routes
- Barre fixe en bas `fixed bottom-0 h-16 z-50`

`app/(app)/layout.tsx`:
- `pb-16` = 64px padding bas, evite masquage du contenu par la bottom bar
- Inclut `<BottomNav>` pour toutes les pages du groupe

`app/(app)/page.tsx` (RSC):
- Bouton deconnexion via Server Action `signOut({ redirectTo: '/login' })`
- Affiche le nom de l'utilisateur depuis `session.user.id`

`app/layout.tsx` mis a jour: titre "Le Commun", lang="fr".

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Suppression de app/page.tsx conflictuel**
- **Found during:** Task 3
- **Issue:** `app/page.tsx` (genere par create-next-app) et `app/(app)/page.tsx` mappent tous les deux sur la route `/` — conflit Next.js
- **Fix:** Suppression de `app/page.tsx` (contenu create-next-app sans valeur fonctionnelle)
- **Files modified:** app/page.tsx (deleted)
- **Commit:** f9f5bd5

## Verification Results

- `npm run build` passe sans erreur: Routes `/`, `/login`, `/depenses`, `/ajustements`, `/historique`, `/api/auth/[...nextauth]` toutes compilees
- middleware.ts n'importe que depuis `lib/auth/index` (pas de lib/db)
- Touch targets h-12 (48px) sur tous les boutons de la page login
- pb-16 present dans (app)/layout.tsx
- BottomNav avec exact match `/` et startsWith pour sous-routes

## Self-Check: PASSED

All 9 created files verified present on disk.
All 3 task commits verified in git log (050fda6, 97cfb3b, f9f5bd5).
