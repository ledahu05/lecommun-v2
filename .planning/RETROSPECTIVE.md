# Retrospective: Le Commun

---

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-05
**Phases:** 4 | **Plans:** 13
**Timeline:** 2026-03-04 → 2026-03-05 (2 days)
**Tests:** 22/22 Playwright green | **LOC:** 2,535 TypeScript

### What Was Built

- **Phase 1 (Fondation):** Next.js 15 bootstrapped, Drizzle ORM schema (3 tables), NextAuth v5 Edge-safe split config, Turso + Vercel deployed, 6 Playwright auth tests green
- **Phase 2 (Balance):** Corrected balance algorithm, auto monthly carry-forward, dashboard RSC with `force-dynamic`, 5 E2E tests (DASH-01..RPT-01) green
- **Phase 3 (Saisie):** Dépenses + ajustements CRUD with Zod Server Actions, mobile-first forms (48px touch targets), 9 E2E tests green, human mobile UX approved
- **Phase 4 (Historique):** Read-only archived months list + detail page, getAllMois() query, 2 E2E tests green (22 total), replaces Google Sheets

### What Worked

- **RSC + Server Actions pattern** was extremely clean — no client-side fetch boilerplate, revalidatePath() for instant cache busting
- **TDD with stubs first (plan 01 per phase)** gave clear acceptance criteria before implementation started
- **Seed helper using (annee, mois) key** instead of mois_id made tests robust against AUTOINCREMENT gaps
- **Mobile-first gate (human sign-off)** caught real UX issues before marking phases complete
- **Split verify phase (last plan = gate plan)** worked well — full suite run + human checkpoint before completing

### What Was Inefficient

- **Nyquist VALIDATION.md files** were created during planning but never updated post-execution — they sit at `draft` for all 4 phases; should auto-update or mark complete during execute-phase
- **SUMMARY.md `one_liner` field absent** — `gsd-tools milestone complete` extracted 0 accomplishments; SUMMARY format doesn't include the standard fields (requires manual accomplishment writing)
- **Balance algorithm discovery:** CLAUDE.md had an incorrect formula documented — required cross-checking against the fixtures to catch the bug before shipping

### Patterns Established

- `test.fixme(true, msg)` instead of `test.todo()` — Playwright 1.58.2 doesn't have `test.todo()`
- **Zod v4:** use `parsed.error.issues` instead of `parsed.error.errors`
- **Form action type wrapper:** `handleCreate*` wrapper needed to satisfy React `void | Promise<void>` signature for Server Actions
- **`vers` implicitly derived from `de`** in AjustementForm — eliminates UX error class entirely
- **`uniqueIndex` inside `sqliteTable` second arg callback** (not a standalone export) — required for drizzle-kit generate to pick it up
- **`onConflictDoUpdate`** for idempotent month creation — race-condition-safe

### Key Lessons

1. Always verify business logic formulas against actual fixtures before implementation — not documentation
2. Phase gate plans (run full suite + human checkpoint) are worth the extra plan slot
3. The SUMMARY.md format in this project doesn't follow GSD standard `one_liner` field — document custom format or adapt tools
4. Nyquist VALIDATION.md files need a post-execution update step; adding it to execute-phase checklist would eliminate this recurring debt

### Cost Observations

- Model mix: balanced profile (sonnet predominantly)
- Sessions: ~8-10 sessions across 2 days
- Notable: Parallel agent execution (gsd-verifier + gsd-integration-checker) worked well for audit

---

## Milestone: v1.1 — Import & Gestion des Mois

**Shipped:** 2026-03-08
**Phases:** 1 | **Plans:** 1
**Timeline:** 2026-03-05 → 2026-03-08
**Tests:** 33/33 Playwright green | **LOC:** ~4,500 TypeScript

### What Was Built

- **Phase 5 (Import & Gestion):** JSON fixture import with Zod validation + mois_id remapping, month deletion with AlertDialog confirmation and cascade on dépenses/ajustements, 11 new E2E tests

### What Worked

- **Single-phase milestone** kept scope tight — import + delete shipped cleanly
- **router.refresh() discovery** — revalidatePath alone insufficient with useTransition, now a known pattern

### What Was Inefficient

- **Paused mid-implementation** (wip commit) — context restore required for continuation

### Patterns Established

- `router.refresh()` after server actions when using useTransition for optimistic updates

### Key Lessons

1. Small focused milestones ship faster and have fewer integration issues

---

## Milestone: v1.2 — Balance Initiale

**Shipped:** 2026-03-08
**Phases:** 1 | **Plans:** 1
**Timeline:** 2026-03-08 (1 day)
**Tests:** 38/38 Playwright green | **LOC:** 6,380 TypeScript

### What Was Built

- **Phase 6 (Balance Initiale):** Editable initial balance on dashboard when no previous month exists — hasPreviousMois query, Zod-validated server action, InitialBalanceForm client component, conditional BalanceCard rendering, 5 E2E tests

### What Worked

- **Single plan, 3 tasks** — minimal overhead for a focused feature
- **key={currentValue} pattern** for uncontrolled input sync — clean React pattern discovered and immediately applied
- **Auto-fixed deviations** (3 total) were all caught during E2E testing and resolved without scope creep

### What Was Inefficient

- Nothing notable — small scope executed cleanly

### Patterns Established

- `key={serverValue}` on uncontrolled inputs to force React remount when server data changes after mutations

### Key Lessons

1. Small features with clear requirements (5 INIT-xx) are ideal for single-plan execution
2. Key-prop reset pattern is the canonical way to handle uncontrolled input sync with server state

### Cost Observations

- Model mix: sonnet for executor + verifier
- Sessions: 1
- Notable: 8 min execution time for full plan including 5 E2E tests

---

## Milestone: v1.3 — Modales d'ajout

**Shipped:** 2026-03-08
**Phases:** 1 | **Plans:** 2
**Timeline:** 2026-03-08 (1 day)
**Tests:** 38/38 Playwright green | **LOC:** ~7,800 TypeScript

### What Was Built

- **Phase 7 Plan 01 (Modales Dialog):** Replaced inline Card forms with Dialog modals on /depenses and /ajustements, subcategory 3-col button grid, useTransition error handling, cross-page revalidation, 38 E2E tests pass
- **Phase 7 Plan 02 (Quick-add Dashboard):** Quick-add buttons on dashboard for one-tap depense/ajustement creation, composable trigger props on modal components

### What Worked

- **Dialog modal + useTransition pattern** — captures server action errors inline without closing the modal, clean separation of concerns
- **Composable trigger props** (triggerLabel, triggerVariant, triggerTestId) made modal reuse across pages trivial
- **2 quick tasks** executed smoothly between plans — direction inversion and collapsible fields shipped without disrupting main plan flow

### What Was Inefficient

- **SUMMARY.md one_liner field still not emitted** — CLI extracted 0 accomplishments, had to populate MILESTONES.md manually (same issue as v1.0)

### Patterns Established

- Dialog modal form: Dialog wrapper with controlled open state, useTransition for pending, inline error display, router.refresh() on success
- Button grid selection: grid of outline/default variant buttons with hidden input for form value
- Quick-add buttons in RSC page.tsx (not inside client components) to avoid RSC/client boundary issues

### Key Lessons

1. Subcategory button grids are significantly faster than native `<select>` on mobile — user validated at 390x844
2. Placing quick-add modals in page.tsx RSC avoids RSC/client boundary issues entirely

### Cost Observations

- Model mix: balanced profile (sonnet)
- Sessions: 1
- Notable: 14 min total execution time for 2 plans (6min + 8min)

---

## Cross-Milestone Trends

| Milestone | Duration | LOC | Tests | Requirements | Tech Debt |
|-----------|----------|-----|-------|--------------|-----------|
| v1.0 MVP | 2 days | 2,535 TS | 22/22 | 23/23 | 7 items (process) |
| v1.1 Import | 3 days | ~4,500 TS | 33/33 | 8/8 | None new |
| v1.2 Balance Init | 1 day | 6,380 TS | 38/38 | 5/5 | None new |
| v1.3 Modales | 1 day | ~7,800 TS | 38/38 | 8/8 | None new |

### Top Lessons (Verified Across Milestones)

1. Always verify business logic against fixtures, not documentation — validated v1.0, reinforced v1.1/v1.2
2. Small focused milestones (1 phase) ship faster with fewer issues — confirmed v1.1, v1.2, v1.3
3. RSC + Server Actions + revalidatePath/router.refresh is the clean mutation pattern — stable across all 4 milestones
4. Button grids > native `<select>` on mobile for bounded option sets — validated v1.3
