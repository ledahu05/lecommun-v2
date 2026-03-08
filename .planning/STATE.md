---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Balance Initiale
status: not_started
stopped_at: defining requirements
last_updated: "2026-03-08T00:00:00.000Z"
last_activity: "2026-03-08 — Milestone v1.2 started"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08 after v1.2 start)

**Core value:** La balance nette entre Chris et Alex est toujours visible et juste — report automatique, zéro saisie manuelle, zéro erreur de copie.
**Current focus:** Permettre l'initialisation manuelle de la balance reportée quand l'app démarre sans données.

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-08 — Milestone v1.2 started

Progress: ░░░░░░░░░░ 0%

## Performance Metrics

*Carried from v1.0 + v1.1*

| Phase 01-fondation P01 | 5min | 3 tasks | 24 files |
| Phase 01-fondation P02 | 3min | 3 tasks | 10 files |
| Phase 01-fondation P03 | 180 | 4 tasks | 2 files |
| Phase 02-balance P02 | 4 | 2 tasks | 7 files |
| Phase 02-balance P01 | 18 | 3 tasks | 8 files |
| Phase 02-balance P03 | 8 | 2 tasks | 4 files |
| Phase 02-balance P04 | 5 | 2 tasks | 2 files |
| Phase 03-saisie P01 | 5 | 2 tasks | 2 files |
| Phase 03-saisie P02 | 3 | 3 tasks | 7 files |
| Phase 03-saisie P03 | 4 | 3 tasks | 7 files |
| Phase 03-saisie P04 | 5 | 2 tasks | 0 files |
| Phase 04-historique P01 | 2 | 1 tasks | 1 files |
| Phase 04-historique P02 | 35 | 3 tasks | 7 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Server Actions pour les mutations (pas de fetch côté client)
- Pages = RSC uniquement (zéro JS superflu)
- Credentials en variables d'env (2 users privés, pas de table users)
- Balance recalculée à chaque requête (pas de cache, jamais de désynchronisation)
- 3 tables : mois, depenses, ajustements
- [Phase 01-fondation]: NextAuth split config: authConfig in lib/auth/config.ts (Edge-safe, no DB) imported by middleware; full NextAuth in lib/auth/index.ts for server actions
- [Phase 01-fondation]: Turso dialect in drizzle.config.ts must be 'turso' not 'sqlite' for Turso cloud database support
- [Phase 01-fondation]: No src/ directory: app/, lib/, components/ at root level; tsconfig paths use './*' not './src/*'
- [Phase 01-fondation]: signIn from next-auth/react in Client Components (not lib/auth/index which is server-only)
- [Phase 01-fondation]: Route group (app) for protected pages; root page.tsx deleted to avoid route conflict
- [Phase 01-fondation]: BottomNav: exact match for /, startsWith for /depenses, /ajustements, /historique
- [Phase 02-balance]: Algorithm correction: total_chris_vers_alex includes balance_mensuelle — CLAUDE.md documentation was wrong, verified against fixtures_e2e.json mars 2026 (balance_finale = -518.5)
- [Phase 02-balance]: vitest added for unit testing pure business logic; Playwright remains E2E only
- [Phase 02-balance]: onConflictDoUpdate on (annee, mois) for idempotent month creation (race-condition-safe)
- [Phase 02-balance]: BalanceCard uses Math.abs(balance_finale) for display — sign communicated via debiteurText label
- [Phase 03-saisie]: Zod v4: use parsed.error.issues instead of parsed.error.errors
- [Phase 03-saisie]: AjustementForm uses implicit vers derivation from de — eliminates de === vers UX error class
- [Phase 04-historique]: getAllMois() computes balance_finale at query time via Promise.all — no cache, consistent with project pattern
- [Phase 05-import-delete]: Native DOM event listener for file input — Playwright setInputFiles doesn't trigger React synthetic onChange
- [Phase 05-import-delete]: router.refresh() after server actions — revalidatePath alone insufficient with useTransition

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-03-08
Stopped at: Starting milestone v1.2
Resume file: None
