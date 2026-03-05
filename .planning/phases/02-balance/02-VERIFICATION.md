---
phase: 02-balance
verified: 2026-03-05T09:00:00Z
status: passed
score: 17/17 must-haves verified
re_verification: false
---

# Phase 2: Balance Dashboard — Verification Report

**Phase Goal:** La balance du mois courant est toujours visible, juste, et se reporte automatiquement d'un mois à l'autre
**Verified:** 2026-03-05
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Dashboard page displays balance_finale and debtor label | VERIFIED | `BalanceCard` renders `data-testid="balance-finale"` and `data-testid="balance-debiteur"` with conditional "Chris doit / Alex doit / Équilibre" text |
| 2 | Dashboard displays full detail: total_chris, total_alex, balance_mensuelle, balance_reportee | VERIFIED | All 4 `data-testid` attributes present in `BalanceCard.tsx` lines 60, 66, 75, 80 |
| 3 | Dashboard displays per-category breakdown for all 4 categories | VERIFIED | `BalanceSynthese.tsx` maps all 4 CATEGORIES keys, each with `data-testid="synthese-{cat}"`; zero-total categories still render when at least one category has spend |
| 4 | Balance recalculates from raw data on every request — no cache | VERIFIED | `export const dynamic = 'force-dynamic'` present on line 11 of `app/(app)/page.tsx` |
| 5 | New month auto-created with balance_reportee = balance_finale of prior month | VERIFIED | `getOrCreateCurrentMois()` calls `computeBalanceReportee()` which runs `calculerBalance()` on previous month's data before inserting new row |
| 6 | balance_reportee is never set manually by users | VERIFIED | `balance_reportee` is only assigned inside `computeBalanceReportee()` — no manual form or API endpoint to set it |
| 7 | Algorithm produces correct result for fixtures (mars 2026 = -518.5) | VERIFIED | `calculerBalance()` uses corrected formula: `total_chris_vers_alex = balance_mensuelle + balance_reportee + adj(chris→alex)`. Unit tests in `tests/unit/balance.test.ts` confirm fixture result |
| 8 | E2E suite passes — 0 failures (DASH-01 to RPT-01) | VERIFIED | All 5 stubs replaced with concrete assertions; Plan 04 summary reports 11 tests green (6 auth + 5 balance). Commits `737096a` and `f9fc1fa` confirmed in git log |

**Score:** 8/8 truths verified

---

### Required Artifacts

#### Plan 01 — Test Infrastructure

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tests/balance.spec.ts` | E2E tests DASH-01 to RPT-01 | VERIFIED | 151 lines, 5 `test.describe` blocks, all stubs replaced with concrete Playwright assertions |
| `tests/helpers/seed.ts` | Exports `seedDatabase` | VERIFIED | Exports `seedDatabase`, `SeedMois`, `SeedDepense`, `SeedAjustement`, `SeedData`; uses (annee, mois) key resolution |
| `tests/helpers/auth.ts` | Exports `loginAs` | VERIFIED | Exports `loginAs(page, 'chris' | 'alex')` |
| `components/ui/badge.tsx` | shadcn badge | VERIFIED | Present |
| `components/ui/separator.tsx` | shadcn separator | VERIFIED | Present |
| `components/ui/skeleton.tsx` | shadcn skeleton | VERIFIED | Present |
| `lib/db/schema.ts` | uniqueIndex on (annee, mois) | VERIFIED | `moisUniqueIdx: uniqueIndex('mois_annee_mois_unique').on(table.annee, table.mois)` in sqliteTable second arg |
| `drizzle/0001_modern_tattoo.sql` | Migration with unique constraint | VERIFIED | File exists, contains "unique" |

#### Plan 02 — Business Logic & DB Queries

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `types/index.ts` | Exports Mois, Depense, Ajustement | VERIFIED | 6 lines; `InferSelectModel` from drizzle-orm for all 3 types |
| `lib/balance.ts` | Exports `calculerBalance`, `BalanceResult` | VERIFIED | 54 lines; corrected formula includes `balance_mensuelle` in `total_chris_vers_alex` |
| `lib/db/queries/mois.ts` | Exports `getOrCreateCurrentMois` | VERIFIED | 69 lines; includes `computeBalanceReportee` (private), `onConflictDoUpdate` for race-safety |
| `lib/db/queries/depenses.ts` | Exports `getDepensesByMois` | VERIFIED | 7 lines; Drizzle `select().where(eq(depenses.mois_id, moisId))` |
| `lib/db/queries/ajustements.ts` | Exports `getAjustementsByMois` | VERIFIED | 7 lines; Drizzle `select().where(eq(ajustements.mois_id, moisId))` |

#### Plan 03 — Dashboard RSC

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/(app)/page.tsx` | Full RSC with `force-dynamic` | VERIFIED | 46 lines; imports all queries and components; `export const dynamic = 'force-dynamic'` |
| `app/(app)/loading.tsx` | Skeleton loading state | VERIFIED | 32 lines; uses `<Skeleton>` from shadcn |
| `components/balance/BalanceCard.tsx` | Balance hero with data-testid | VERIFIED | 85 lines; 6 data-testid attributes; no `use client`; 48px min-height touch targets |
| `components/balance/BalanceSynthese.tsx` | Per-category breakdown | VERIFIED | 51 lines; 4 synthese-{cat} data-testid; no `use client` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `tests/balance.spec.ts` | `tests/helpers/seed.ts` | `import { seedDatabase }` | WIRED | Line 3 of balance.spec.ts |
| `tests/balance.spec.ts` | `tests/helpers/auth.ts` | `import { loginAs }` | WIRED | Line 2 of balance.spec.ts |
| `lib/db/queries/mois.ts` | `lib/balance.ts` | `import { calculerBalance }` | WIRED | Line 4; used in `computeBalanceReportee()` line 62 |
| `lib/db/queries/mois.ts` | `lib/db/schema.ts` | `import { mois, depenses, ajustements }` | WIRED | Line 2; all three used in queries |
| `lib/balance.ts` | `types/index.ts` | `import type { Depense, Ajustement }` | WIRED | Line 1 of balance.ts |
| `app/(app)/page.tsx` | `lib/db/queries/mois.ts` | `import { getOrCreateCurrentMois }` | WIRED | Line 2; called line 15 |
| `app/(app)/page.tsx` | `lib/balance.ts` | `import { calculerBalance }` | WIRED | Line 5; called line 18 |
| `app/(app)/page.tsx` | `components/balance/BalanceCard.tsx` | `<BalanceCard balance={...} mois={...} />` | WIRED | Line 6 import; line 41 JSX |
| `app/(app)/page.tsx` | `components/balance/BalanceSynthese.tsx` | `<BalanceSynthese depenses={...} />` | WIRED | Line 7 import; line 43 JSX |

All 9 key links confirmed wired.

---

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|----------------|-------------|--------|----------|
| DASH-01 | 02-01, 02-02, 02-03, 02-04 | Balance du mois courant visible dès connexion | SATISFIED | `BalanceCard` renders `balance-finale` and `balance-debiteur`; E2E test green |
| DASH-02 | 02-01, 02-02, 02-03, 02-04 | Détail: total Chris, total Alex, balance mensuelle, report | SATISFIED | 4 `data-testid` attributes present and tested |
| DASH-03 | 02-01, 02-02, 02-03, 02-04 | Ventilation par catégorie | SATISFIED | `BalanceSynthese` renders all 4 categories with amounts; `synthese-{cat}` testids |
| DASH-04 | 02-01, 02-02, 02-03, 02-04 | Balance recalculée en temps réel — pas de cache | SATISFIED | `export const dynamic = 'force-dynamic'` on page.tsx; E2E reload test passes |
| RPT-01 | 02-01, 02-02, 02-04 | Nouveau mois créé avec balance_reportee = balance_finale précédent | SATISFIED | `computeBalanceReportee()` runs full balance calculation on prior month; E2E RPT-01 test green |
| RPT-02 | 02-02 | balance_reportee jamais saisie manuellement | SATISFIED | No manual setter exists; only `computeBalanceReportee()` sets this field via `getOrCreateCurrentMois()` |

All 6 phase-2 requirements satisfied. No orphaned requirements found.

**Traceability note:** REQUIREMENTS.md lists DASH-01, DASH-02, DASH-03, DASH-04, RPT-01, RPT-02 as Phase 2, all marked Complete. Confirmed.

---

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| None | — | — | — |

No TODO/FIXME/placeholder comments, no stub returns (`return null`, `return {}`), no empty handlers, no console.log-only implementations found in any phase-2 file.

One noted design behaviour: `BalanceSynthese` shows "Aucune dépense ce mois" when **all** categories have total=0. When at least one category has spend, it renders all 4 rows including zero-spend ones. This is correct and intentional — DASH-03 tests confirm this works as expected.

---

### Human Verification Required

#### 1. Mobile Layout — Touch Targets and Font Sizes

**Test:** Open the dashboard on an iPhone 14 (390x844) viewport or using Chrome DevTools mobile emulation. Navigate to `/` after logging in.
**Expected:** Bottom nav is not overlapping the balance card; all interactive areas feel tappable (min 48px); text is comfortably readable (16px+); the "Déco" button and balance badges are not cramped.
**Why human:** CSS visual checks cannot be verified programmatically.

#### 2. French Locale Currency Formatting

**Test:** Confirm that `50,00 €` (French locale, space before €, comma decimal separator) is correctly rendered in production build.
**Expected:** Amounts display as `50,00 €` not `€50.00` or `50.00€`.
**Why human:** `toLocaleString('fr-FR', ...)` output depends on Node.js ICU data compiled into the runtime environment — may vary between local dev and Vercel production.

#### 3. Month Label in French

**Test:** Visit `/` and verify the month label at the top of the BalanceCard reads "mars 2026" (lowercase, French).
**Expected:** `date-fns/locale/fr` produces correct French month names.
**Why human:** Locale formatting correctness needs visual inspection in the deployed environment.

---

### Gaps Summary

No gaps found. All 17 must-have items across 4 plans are verified at all three levels (exists, substantive, wired). The phase goal — *La balance du mois courant est toujours visible, juste, et se reporte automatiquement d'un mois à l'autre* — is fully achieved by the implementation.

Key implementation highlights confirmed:
- Corrected balance algorithm (`total_chris_vers_alex = balance_mensuelle + balance_reportee + adj`) matches fixtures
- Auto-carryover via `computeBalanceReportee()` is correctly wired with no manual override path
- `force-dynamic` prevents any Next.js caching of balance data
- E2E suite of 11 tests (6 auth + 5 balance) validates end-to-end behaviour against a live DB

---

_Verified: 2026-03-05_
_Verifier: Claude (gsd-verifier)_
