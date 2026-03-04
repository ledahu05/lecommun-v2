# Phase 1: Fondation - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Mettre en place l'infrastructure Vercel + Turso et rendre l'authentification Chris/Alex opérationnelle. Le résultat est une application déployée en production où les deux utilisateurs peuvent se connecter, avec une session persistante 30 jours, et toutes les routes protégées sauf /login. Aucune fonctionnalité métier (dashboard, balance, saisie) — uniquement le squelette de l'app fonctionnel et connecté.

</domain>

<decisions>
## Implementation Decisions

### Login page
- Boutons segmentés (Chris / Alex) pour le choix de l'utilisateur — pas de champ texte (cohérence mobile-first, même logique que paye_par)
- Un seul champ à saisir : le mot de passe
- Message d'erreur générique : "Identifiants incorrects" (pas de distinction "mauvais user" / "mauvais mot de passe" pour raisons de sécurité)
- Design épuré shadcn/ui, centré verticalement, pas de logo ou branding elaborate

### Post-login shell
- Après connexion, l'utilisateur atterrit sur `/` (future dashboard)
- Phase 1 livre une page placeholder avec le nom de la route et un message court ("À venir")
- La navigation (bottom bar) est fonctionnelle et présente dès Phase 1, même si les routes pointent vers des placeholders

### Navigation scaffold
- Bottom bar fixe avec 4 onglets correspondant aux 4 sections v1 :
  - Accueil (icône home) → `/`
  - Dépenses (icône receipt ou shopping-bag) → `/depenses`
  - Ajustements (icône arrow-left-right) → `/ajustements`
  - Historique (icône clock ou calendar) → `/historique`
- Labels courts, touch targets ≥ 48px, onglet actif mis en évidence

### Logout
- Bouton de déconnexion accessible depuis la page `/` (future dashboard), probablement en haut à droite ou dans un menu minimal
- Claude's Discretion : placement exact du bouton logout
- Session expirée → middleware redirige silencieusement vers `/login` (pas de notification)

### Infrastructure
- Vercel : CD automatique sur push `main`, pas de preview deployments configurés pour l'instant
- Turso : DB provisionnée, schéma appliqué via `drizzle-kit migrate`
- Variables d'environnement configurées sur Vercel : TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, AUTH_SECRET, CHRIS_PASSWORD, ALEX_PASSWORD

### Claude's Discretion
- Exact styling de la login page (couleurs, spacing)
- Icônes choisies pour la bottom bar
- Placement exact du bouton logout
- Gestion des erreurs Turso (connexion DB indisponible)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Aucun code existant — projet vierge, tout est à créer

### Established Patterns
- Next.js 15 App Router : pages = RSC, mutations = Server Actions, Client Components uniquement pour interactions UI
- snake_case pour les champs DB, camelCase pour les variables TS
- Validation Zod sur tous les inputs

### Integration Points
- `middleware.ts` à la racine : protège toutes les routes sauf `/login`
- `lib/auth/config.ts` : config NextAuth v5 avec provider Credentials
- `lib/db/index.ts` : client Turso + instance Drizzle
- `lib/db/schema.ts` : définition des 3 tables (mois, depenses, ajustements)
- Group `(app)/` : layout protégé avec bottom bar
- Group `(auth)/login/` : page publique

</code_context>

<specifics>
## Specific Ideas

- L'analogie avec `paye_par` est pertinente pour le login : boutons segmentés plutôt que saisie texte du username — rapide sur mobile, sans risque de typo
- La bottom bar doit être présente dès Phase 1 même si les pages sont vides, pour valider le routing et le layout

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-fondation*
*Context gathered: 2026-03-04*
