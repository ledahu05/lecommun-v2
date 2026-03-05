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

## Cross-Milestone Trends

| Milestone | Duration | LOC | Tests | Requirements | Tech Debt |
|-----------|----------|-----|-------|--------------|-----------|
| v1.0 MVP | 2 days | 2,535 TS | 22/22 | 23/23 | 7 items (process) |
