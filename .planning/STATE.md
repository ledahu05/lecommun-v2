---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: completed
stopped_at: Completed 03-saisie-03-01-PLAN.md
last_updated: "2026-03-05T08:53:17.490Z"
last_activity: "2026-03-04 — Phase 1 complete: DB + Vercel + auth tests + mobile sign-off"
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 11
  completed_plans: 8
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-04)

**Core value:** La balance nette entre Chris et Alex est toujours visible et juste — report automatique, zéro saisie manuelle, zéro erreur de copie.
**Current focus:** Phase 2 — Depenses (next)

## Current Position

Phase: 1 of 4 (Fondation) — COMPLETE
Plan: 3 of 3 in phase 1 (all done)
Status: Phase 1 complete, ready for Phase 2
Last activity: 2026-03-04 — Phase 1 complete: DB + Vercel + auth tests + mobile sign-off

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01-fondation P01 | 5min | 3 tasks | 24 files |
| Phase 01-fondation P02 | 3min | 3 tasks | 10 files |
| Phase 01-fondation P03 | 180 | 4 tasks | 2 files |
| Phase 02-balance P02 | 4 | 2 tasks | 7 files |
| Phase 02-balance P01 | 18 | 3 tasks | 8 files |
| Phase 02-balance P03 | 8 | 2 tasks | 4 files |
| Phase 02-balance P04 | 5 | 2 tasks | 2 files |
| Phase 03-saisie P01 | 5 | 2 tasks | 2 files |

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
- [Phase 01-fondation]: Turso DB provisioned by user via CLI — DB name lecommun matches project name
- [Phase 01-fondation]: Vercel CD linked to GitHub main branch — automatic deploy on push, no staging needed for 2-person project
- [Phase 02-balance]: Algorithm correction: total_chris_vers_alex includes balance_mensuelle — CLAUDE.md documentation was wrong, verified against fixtures_e2e.json mars 2026 (balance_finale = -518.5)
- [Phase 02-balance]: vitest added for unit testing pure business logic; Playwright remains E2E only
- [Phase 02-balance]: onConflictDoUpdate on (annee, mois) for idempotent month creation (race-condition-safe)
- [Phase 02-balance]: uniqueIndex defined inside sqliteTable second arg callback — standalone export not picked up by drizzle-kit generate
- [Phase 02-balance]: SeedDepense/SeedAjustement use (annee, mois) instead of mois_id — resolved internally after INSERT to handle AUTOINCREMENT gaps
- [Phase 02-balance]: test.fixme(true) instead of test.todo() — test.todo absent in Playwright 1.58.2
- [Phase 02-balance]: signOut button kept in dashboard header since layout.tsx has no logout mechanism
- [Phase 02-balance]: BalanceCard uses Math.abs(balance_finale) for display — sign communicated via debiteurText label
- [Phase 02-balance]: RPT-01 uses dynamic prev-month calculation for date-independent test robustness
- [Phase 02-balance]: playwright.config.ts testIgnore excludes unit/ dir to prevent vitest CJS import error in Playwright runner
- [Phase 03-saisie]: test.fixme(true, msg) used instead of test.todo() — consistent with Phase 02 decision (Playwright 1.58.2 has no test.todo)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-03-05T08:53:17.487Z
Stopped at: Completed 03-saisie-03-01-PLAN.md
Resume file: None
