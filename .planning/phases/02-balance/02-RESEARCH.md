# Phase 02: Balance - Research

**Researched:** 2026-03-05
**Domain:** Next.js RSC dashboard, Drizzle ORM queries, balance calculation, automatic month report
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | L'utilisateur voit la balance du mois courant dès la connexion (qui doit combien à qui) | RSC dashboard page fetches current month from DB, runs calculerBalance, displays result |
| DASH-02 | La balance affiche le détail : total Chris, total Alex, balance mensuelle, report du mois précédent | BalanceResult shape from calculerBalance exposes all these fields; display in BalanceCard component |
| DASH-03 | La ventilation par catégorie est visible (montant par personne pour alimentation, habitation, loisirs, vie quotidienne) | Compute per-category sums from depenses array before calling calculerBalance; add BalanceSynthese component |
| DASH-04 | La balance se recalcule en temps réel à chaque affichage depuis les données brutes | RSC with `no-store` semantics; never cache, always fetch fresh on every request |
| RPT-01 | Quand un nouveau mois est créé, la balance_reportee est automatiquement fixée à la balance_finale du mois précédent | getOrCreateCurrentMois() in lib/db/queries/mois.ts computes balance_finale of previous month and inserts as balance_reportee |
| RPT-02 | La balance_reportee n'est jamais saisie manuellement | balance_reportee only written programmatically in getOrCreateCurrentMois(); no UI input for it |
</phase_requirements>

---

## Summary

Phase 2 builds the dashboard: the central page of the app that shows the current-month balance. Phase 1 delivered the full foundation — DB schema (mois, depenses, ajustements tables), Drizzle client (lib/db/index.ts), NextAuth session, middleware, BottomNav, and shadcn/ui card/button/input/label components. Phase 2 has zero infrastructure work; it is pure feature implementation on top of the existing foundation.

The core challenge is threefold. First, `lib/balance.ts` does not yet exist and must be created with the correct algorithm (verified against fixture data). Second, `lib/db/queries/` does not yet exist and needs three query files (mois.ts, depenses.ts, ajustements.ts) to power the dashboard. Third, the automatic month-report logic (RPT-01/RPT-02) must fire on first access to the dashboard for a new month, before the balance is computed.

**Critical algorithm finding:** The CLAUDE.md and TECH_SPEC algorithm blocks contain a documentation error. The correct formula (verified against `docs/fixtures_e2e.json` expected_balances for all 5 months) is:

```
total_chris_vers_alex = balance_mensuelle + balance_reportee + SUM(adj WHERE de='chris' AND vers='alex')
```

NOT the simpler `balance_reportee + adj_cv` stated in CLAUDE.md. The balance_mensuelle term is mandatory and must be included. See "Critical Algorithm Finding" section below.

**Primary recommendation:** Implement `lib/balance.ts` with the corrected algorithm, build `lib/db/queries/` with three typed query files, implement `getOrCreateCurrentMois()` for automatic month creation/report, then build the RSC dashboard page with two presentational components (BalanceCard, BalanceSynthese).

---

## What Phase 1 Delivered (Foundation Already in Place)

| Asset | Path | Status |
|-------|------|--------|
| DB schema | lib/db/schema.ts | Complete — mois, depenses, ajustements tables |
| DB client | lib/db/index.ts | Complete — Turso + Drizzle instance |
| Auth session | lib/auth/config.ts + index.ts | Complete — NextAuth v5, JWT, 30-day session |
| Middleware | middleware.ts | Complete — protects all routes except /login |
| App layout | app/(app)/layout.tsx | Complete — BottomNav + pb-16 safe area |
| Dashboard stub | app/(app)/page.tsx | Stub only — shows "Dashboard à venir" |
| shadcn/ui | components/ui/ | card, button, input, label installed |
| Categories | lib/categories.ts | Complete — 4 categories with emoji |
| Types export | lib/categories.ts | PayePar = 'chris' | 'alex', Categorie type |
| E2E framework | playwright.config.ts + tests/ | Playwright configured, auth tests exist |

**What does NOT exist yet (Phase 2 must create):**
- `lib/balance.ts` — balance calculation function
- `lib/db/queries/mois.ts` — getOrCreateCurrentMois(), getMoisPrecedent(), getBalanceFinale()
- `lib/db/queries/depenses.ts` — getDepensesByMois()
- `lib/db/queries/ajustements.ts` — getAjustementsByMois()
- `components/balance/BalanceCard.tsx` — main balance display
- `components/balance/BalanceSynthese.tsx` — per-category breakdown
- `types/index.ts` — shared TypeScript types
- `tests/balance.spec.ts` — E2E tests for DASH-01 through RPT-02

---

## Critical Algorithm Finding

### The CLAUDE.md Documentation Error

The algorithm in CLAUDE.md (section "Algorithme de balance") states:

```
total_chris→alex = balance_reportee + SUM(ajustements WHERE de='chris' AND vers='alex')
```

This is **incorrect**. Verification against `docs/fixtures_e2e.json` expected_balances for March 2026 (the only month where fixture items are complete) proves the correct formula is:

```
total_chris→alex = balance_mensuelle
                 + balance_reportee
                 + SUM(ajustements WHERE de='chris' AND vers='alex')
```

**Verification (Mars 2026, mois_id=5 — all items present in fixture):**

| Value | Computed | Fixture Expected |
|-------|----------|-----------------|
| total_chris | 33 | 33 |
| total_alex | 146 | 146 |
| balance_mensuelle | (146-33)/2 = 56.5 | 56.5 |
| balance_reportee | -290 | -290 |
| adj chris→alex | 115 (appart) | — |
| total_chris_vers_alex | 56.5 + (-290) + 115 = **-118.5** | **-118.5** |
| adj alex→chris | 400 (virement) | — |
| total_alex_vers_chris | 400 | 400 |
| balance_finale | -118.5 - 400 = **-518.5** | **-518.5** |

**Verified February 2026 (using fixture's own totals 431/607):** bm=88, br=-27, adj_cv=249 → total_cv=310 ✓, balance_finale=-290 ✓

**Sign convention:** balance_finale < 0 → Alex doit à Chris. balance_finale > 0 → Chris doit à Alex.

### Fixture Data Note

The fixture `depenses` items are representative samples from the real spreadsheet, not complete month data. For months 1-4, item sums do not equal fixture `expected_balances` totals. Only month 5 (mars 2026) is complete. **E2E tests must compute expected balances from the seeded items themselves**, not from `expected_balances` in the fixture file.

---

## Standard Stack

### Core (already installed — no new dependencies needed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| next | 16.1.6 | App Router, RSC, Server Actions | Installed |
| react | 19.2.3 | UI rendering | Installed |
| drizzle-orm | ^0.45.1 | Type-safe DB queries | Installed |
| @libsql/client | ^0.17.0 | Turso connection | Installed |
| next-auth | ^5.0.0-beta.30 | Session access in RSC | Installed |
| date-fns | ^4.1.0 | French date formatting | Installed |
| zod | ^4.3.6 | Input validation | Installed |
| tailwindcss | ^4 | Styling | Installed |

### UI Components (shadcn/ui — partial install)

| Component | Status | Needed For |
|-----------|--------|-----------|
| card | Installed | BalanceCard, BalanceSynthese |
| button | Installed | Sign out |
| badge | NOT installed | Debtor label ("Alex doit à Chris") |
| separator | NOT installed | Visual dividers in dashboard |
| skeleton | NOT installed | Loading states |

**Installation needed:**
```bash
npx shadcn@latest add badge separator skeleton
```

### No New Dependencies Required

All calculation, query, and display work is achievable with installed libraries. Do not add chart libraries, state management, or caching layers.

---

## Architecture Patterns

### Recommended File Structure for Phase 2

```
lib/
├── balance.ts                    # NEW — calculerBalance() + BalanceResult type
├── db/
│   ├── index.ts                  # EXISTS
│   ├── schema.ts                 # EXISTS
│   └── queries/                  # NEW directory
│       ├── mois.ts               # getOrCreateCurrentMois(), getMoisPrecedent()
│       ├── depenses.ts           # getDepensesByMois()
│       └── ajustements.ts        # getAjustementsByMois()
types/
└── index.ts                      # NEW — Depense, Ajustement, Mois TS types

components/
└── balance/                      # NEW directory
    ├── BalanceCard.tsx            # "Chris doit X € à Alex" hero card
    └── BalanceSynthese.tsx        # Per-category breakdown table

app/(app)/
└── page.tsx                      # REPLACE stub — full RSC dashboard

tests/
└── balance.spec.ts               # NEW — E2E tests for DASH-01 to RPT-02
```

### Pattern 1: RSC Dashboard with Direct DB Fetch

The dashboard page is a React Server Component. It fetches data directly — no API route, no client fetch.

```typescript
// app/(app)/page.tsx
import { auth } from '@/lib/auth/index';
import { getOrCreateCurrentMois } from '@/lib/db/queries/mois';
import { getDepensesByMois } from '@/lib/db/queries/depenses';
import { getAjustementsByMois } from '@/lib/db/queries/ajustements';
import { calculerBalance } from '@/lib/balance';
import { BalanceCard } from '@/components/balance/BalanceCard';
import { BalanceSynthese } from '@/components/balance/BalanceSynthese';

export const dynamic = 'force-dynamic'; // never cache — DASH-04

export default async function HomePage() {
  const session = await auth();
  const moisCourant = await getOrCreateCurrentMois();
  const depenses = await getDepensesByMois(moisCourant.id);
  const ajustements = await getAjustementsByMois(moisCourant.id);
  const balance = calculerBalance(depenses, ajustements, moisCourant.balance_reportee);

  return (
    <main className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Le Commun</h1>
        <span className="text-sm text-muted-foreground">
          {session?.user?.id === 'chris' ? 'Chris' : 'Alex'}
        </span>
      </header>
      <BalanceCard balance={balance} mois={moisCourant} />
      <BalanceSynthese depenses={depenses} />
    </main>
  );
}
```

### Pattern 2: Corrected Balance Calculation

```typescript
// lib/balance.ts
import type { Depense, Ajustement } from '@/types';

export interface BalanceResult {
  total_chris: number;
  total_alex: number;
  balance_mensuelle: number;        // (total_alex - total_chris) / 2
  balance_reportee: number;         // carried from previous month
  total_chris_vers_alex: number;    // balance_mensuelle + balance_reportee + adj(chris->alex)
  total_alex_vers_chris: number;    // adj(alex->chris)
  balance_finale: number;           // total_cv - total_vc
  // > 0: Chris doit à Alex  |  < 0: Alex doit à Chris  |  = 0: équilibre
}

export function calculerBalance(
  depenses: Depense[],
  ajustements: Ajustement[],
  balance_reportee: number,
): BalanceResult {
  const total_chris = depenses
    .filter((d) => d.paye_par === 'chris')
    .reduce((sum, d) => sum + d.montant, 0);

  const total_alex = depenses
    .filter((d) => d.paye_par === 'alex')
    .reduce((sum, d) => sum + d.montant, 0);

  const balance_mensuelle = (total_alex - total_chris) / 2;

  // CORRECTED: balance_mensuelle IS included in total_chris_vers_alex
  // (verified against fixtures_e2e.json for all 5 months)
  const total_chris_vers_alex =
    balance_mensuelle +
    balance_reportee +
    ajustements
      .filter((a) => a.de === 'chris' && a.vers === 'alex')
      .reduce((sum, a) => sum + a.montant, 0);

  const total_alex_vers_chris = ajustements
    .filter((a) => a.de === 'alex' && a.vers === 'chris')
    .reduce((sum, a) => sum + a.montant, 0);

  const balance_finale = total_chris_vers_alex - total_alex_vers_chris;

  return {
    total_chris,
    total_alex,
    balance_mensuelle,
    balance_reportee,
    total_chris_vers_alex,
    total_alex_vers_chris,
    balance_finale,
  };
}
```

### Pattern 3: getOrCreateCurrentMois with Automatic Report (RPT-01/RPT-02)

```typescript
// lib/db/queries/mois.ts
import { db } from '@/lib/db';
import { mois, depenses, ajustements } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { calculerBalance } from '@/lib/balance';

export async function getOrCreateCurrentMois() {
  const now = new Date();
  const annee = now.getFullYear();
  const moisNum = now.getMonth() + 1; // 1-12

  // 1. Look for existing current month row
  const existing = await db
    .select()
    .from(mois)
    .where(and(eq(mois.annee, annee), eq(mois.mois, moisNum)))
    .limit(1);

  if (existing.length > 0) return existing[0];

  // 2. Not found — compute balance_reportee from previous month (RPT-01)
  const balance_reportee = await computeBalanceReportee(annee, moisNum);

  // 3. Insert new month (RPT-02: never manual)
  const [inserted] = await db
    .insert(mois)
    .values({ annee, mois: moisNum, balance_reportee })
    .returning();

  return inserted;
}

async function computeBalanceReportee(annee: number, moisNum: number): Promise<number> {
  // Previous month in calendar terms
  const prevMoisNum = moisNum === 1 ? 12 : moisNum - 1;
  const prevAnnee  = moisNum === 1 ? annee - 1 : annee;

  const prevMoisRows = await db
    .select()
    .from(mois)
    .where(and(eq(mois.annee, prevAnnee), eq(mois.mois, prevMoisNum)))
    .limit(1);

  if (prevMoisRows.length === 0) return 0; // First month ever

  const prevMois = prevMoisRows[0];
  const prevDepenses = await db
    .select()
    .from(depenses)
    .where(eq(depenses.mois_id, prevMois.id));
  const prevAjustements = await db
    .select()
    .from(ajustements)
    .where(eq(ajustements.mois_id, prevMois.id));

  const { balance_finale } = calculerBalance(
    prevDepenses,
    prevAjustements,
    prevMois.balance_reportee,
  );

  return balance_finale;
}
```

### Pattern 4: Category Breakdown (DASH-03)

```typescript
// In app/(app)/page.tsx or BalanceSynthese component
import { CATEGORIES, type Categorie } from '@/lib/categories';

function computeCategoryBreakdown(depenses: Depense[]) {
  return (Object.keys(CATEGORIES) as Categorie[]).map((cat) => {
    const catDepenses = depenses.filter((d) => d.categorie === cat);
    const total = catDepenses.reduce((sum, d) => sum + d.montant, 0);
    const parPersonne = total / 2; // shared 50/50
    const chris = catDepenses.filter(d => d.paye_par === 'chris').reduce((s,d) => s+d.montant, 0);
    const alex  = catDepenses.filter(d => d.paye_par === 'alex').reduce((s,d) => s+d.montant, 0);
    return {
      categorie: cat,
      label: CATEGORIES[cat].label,
      emoji: CATEGORIES[cat].emoji,
      total,
      parPersonne,
      chris,
      alex,
    };
  });
}
```

### Pattern 5: Monetary Formatting (project convention)

```typescript
// Always use this format — from CLAUDE.md convention
function formatEur(amount: number): string {
  return Math.abs(amount).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}
// Output: "891,50 €"  (fixture expects "891,50 €" — French locale confirmed)
```

### Pattern 6: French Month/Date Display

```typescript
// Using date-fns/fr (installed)
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function formatMoisLabel(annee: number, moisNum: number): string {
  const date = new Date(annee, moisNum - 1, 1);
  return format(date, 'MMMM yyyy', { locale: fr }); // "mars 2026"
}
```

### Pattern 7: DB Queries Pattern

```typescript
// lib/db/queries/depenses.ts
import { db } from '@/lib/db';
import { depenses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getDepensesByMois(moisId: number) {
  return db.select().from(depenses).where(eq(depenses.mois_id, moisId));
}

// lib/db/queries/ajustements.ts
import { db } from '@/lib/db';
import { ajustements } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getAjustementsByMois(moisId: number) {
  return db.select().from(ajustements).where(eq(ajustements.mois_id, moisId));
}
```

### Anti-Patterns to Avoid

- **Do NOT use `cache()` from React**: balance_finale must be fresh on every load (DASH-04). Use `export const dynamic = 'force-dynamic'` on the page.
- **Do NOT store balance_finale in DB**: it is always computed from raw data. Only `balance_reportee` is stored (which equals the previous month's `balance_finale`).
- **Do NOT write `balance_reportee` from the UI**: RPT-02 mandates it is always programmatic. No form field, no API endpoint for it.
- **Do NOT use floating point equality for display**: `toLocaleString('fr-FR')` handles rounding for display. Internal math stays as floats.
- **Do NOT use `useEffect` + `fetch` for balance data**: this is server data, fetched in RSC. No client-side fetching.
- **Do NOT create an API route for balance**: the dashboard page fetches directly. API routes are only needed for mutations (Phase 3).

---

## TypeScript Types

Phase 2 needs `types/index.ts` to provide typed representations of DB rows:

```typescript
// types/index.ts
// Infer from Drizzle schema for type safety
import type { InferSelectModel } from 'drizzle-orm';
import type { mois, depenses, ajustements } from '@/lib/db/schema';

export type Mois       = InferSelectModel<typeof mois>;
export type Depense    = InferSelectModel<typeof depenses>;
export type Ajustement = InferSelectModel<typeof ajustements>;
```

Using `InferSelectModel` keeps types in sync with schema automatically. No manual duplication.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| French currency formatting | Custom formatter | `toLocaleString('fr-FR', ...)` | Handles commas, € symbol, rounding |
| French month names | String arrays | `date-fns/fr` + `format()` | Locale-aware, handles edge cases |
| DB type inference | Manual interfaces | `InferSelectModel<typeof table>` | Always in sync with schema |
| Session access in RSC | Cookie parsing | `auth()` from lib/auth/index | NextAuth v5 RSC-safe |

---

## Common Pitfalls

### Pitfall 1: Using the Wrong Balance Algorithm

**What goes wrong:** Using `total_chris_vers_alex = balance_reportee + adj_cv` (from CLAUDE.md documentation) produces wrong balance_finale values. The TECH_SPEC lib/balance.ts pseudo-code has the same error.
**Why it happens:** Documentation was written without full verification against fixture data.
**How to avoid:** Use the corrected formula: `balance_mensuelle + balance_reportee + adj_cv`. Verified against fixtures_e2e.json for all 5 months (mars 2026 is the full-data proof).
**Warning signs:** E2E test `balance_01` fails showing -518.5 when 0 or other wrong value appears.

### Pitfall 2: Race Condition in getOrCreateCurrentMois

**What goes wrong:** Two concurrent requests hit the dashboard at the same time, both find no current month, both attempt INSERT — one fails with a unique constraint violation (or both succeed creating duplicate rows).
**Why it happens:** Check-then-insert is not atomic.
**How to avoid:** Add a unique index on (annee, mois) to the schema OR use Drizzle's `onConflictDoNothing()`. Better: use `onConflictDoUpdate` with a no-op. Since this is a 2-person app with low concurrency, the practical risk is minimal, but the unique constraint prevents data corruption.
**Warning signs:** `UNIQUE constraint failed: mois.annee, mois.mois` error in logs.

### Pitfall 3: `export const dynamic = 'force-dynamic'` Missing

**What goes wrong:** Next.js caches the RSC response. The balance shown is stale (cached from a previous request). This violates DASH-04.
**Why it happens:** Next.js App Router caches RSC pages by default for performance.
**How to avoid:** Add `export const dynamic = 'force-dynamic'` at the top of `app/(app)/page.tsx`.
**Warning signs:** Adding a depense (Phase 3) does not update the dashboard balance without a hard refresh.

### Pitfall 4: month.mois Field Name Collision

**What goes wrong:** The Drizzle table is named `mois` and the column is also named `mois`. Drizzle handles this correctly but TypeScript types can be confusing: `row.mois` refers to the month number (1-12), not the table.
**Why it happens:** Schema uses French naming where both table and field share the word "mois".
**How to avoid:** Use explicit aliases in queries when ambiguity arises. In TypeScript: `const { mois: moisNum } = row;`

### Pitfall 5: Tailwind 4 vs shadcn/ui Compatibility

**What goes wrong:** The project uses Tailwind 4 (`^4`), while many shadcn/ui docs and examples use Tailwind 3 syntax. CSS variables and some utilities differ.
**Why it happens:** Tailwind 4 changed the config format (no `tailwind.config.js`, uses CSS-based config). Phase 1 set this up but any new shadcn components must be added with the correct shadcn CLI version.
**How to avoid:** Always use `npx shadcn@latest add <component>` (not older syntax). Do not copy Tailwind 3 config snippets.

### Pitfall 6: Fixture Data Not Complete for Most Months

**What goes wrong:** E2E test seeds months 1-4 from fixture items and asserts against `expected_balances` values — test fails because fixture items are partial.
**Why it happens:** fixture depenses/ajustements are representative samples; only month 5 (mars 2026) is complete.
**How to avoid:** E2E tests must either (a) compute expected values from seeded items programmatically, or (b) use only month 5 for balance assertion tests, or (c) use manually crafted simple test data with known totals.

---

## Dashboard UI Design

### Wire frame (from TECH_SPEC section 6.3)

```
┌─────────────────────────────────────┐
│  Le Commun              👤 Chris    │
├─────────────────────────────────────┤
│  Mars 2026                          │
│  ┌─────────────────────────────┐   │
│  │    Chris doit               │   │
│  │    267 € à Alex             │   │   ← BalanceCard (hero)
│  └─────────────────────────────┘   │
│                                     │
│  Chris : 234 €    Alex : 581 €     │   ← totaux bruts
│                                     │
│  🛒 Alimentation     89 €/pers.    │
│  🏠 Habitation      186 €/pers.    │   ← BalanceSynthese
│  🎿 Loisirs          72 €/pers.    │
│  💊 Vie quot.        27 €/pers.    │
│                                     │
│  Report mois préc.   -27 €         │   ← balance_reportee display
├─────────────────────────────────────┤
│  🏠        📋        🔄        📅   │   ← BottomNav (exists)
└─────────────────────────────────────┘
```

### Mobile-First Requirements (from CLAUDE.md)

- Touch targets minimum 48px height on all interactive elements
- Font minimum 16px (prevents iOS auto-zoom)
- Test at 390×844 viewport (iPhone 14)
- All text in French ("Chris doit X € à Alex" / "Alex doit X € à Chris")

### BalanceCard Visual States

| Condition | Display |
|-----------|---------|
| balance_finale > 0 | "Chris doit {amount} à Alex" — warning color |
| balance_finale < 0 | "Alex doit {amount} à Chris" — info color |
| balance_finale = 0 | "Équilibre" — success color |

### data-testid Attributes Required (for E2E tests)

| Element | data-testid |
|---------|------------|
| Balance finale amount | `balance-finale` |
| Debtor label | `balance-debiteur` |
| Total Chris | `total-chris` |
| Total Alex | `total-alex` |
| Balance mensuelle | `balance-mensuelle` |
| Balance reportée | `balance-reportee` |
| Category row (per cat) | `synthese-{categorie}` |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.x |
| Config file | playwright.config.ts (exists at root) |
| Quick run command | `npx playwright test tests/balance.spec.ts` |
| Full suite command | `npx playwright test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Dashboard shows balance_finale and debtor label for current month | E2E | `npx playwright test tests/balance.spec.ts --grep "DASH-01"` | ❌ Wave 0 |
| DASH-02 | Dashboard shows total_chris, total_alex, balance_mensuelle, balance_reportee | E2E | `npx playwright test tests/balance.spec.ts --grep "DASH-02"` | ❌ Wave 0 |
| DASH-03 | Dashboard shows per-category amounts | E2E | `npx playwright test tests/balance.spec.ts --grep "DASH-03"` | ❌ Wave 0 |
| DASH-04 | No cache — fresh data on every load | E2E smoke | `npx playwright test tests/balance.spec.ts --grep "DASH-04"` | ❌ Wave 0 |
| RPT-01 | New month creation copies balance_finale from previous month | E2E | `npx playwright test tests/balance.spec.ts --grep "RPT-01"` | ❌ Wave 0 |
| RPT-02 | balance_reportee never manually settable | Manual verification | N/A — no UI for it | Manual only |

### E2E Test Strategy for Balance Tests

Because fixture items for months 1-4 are partial (not matching expected_balances), E2E tests must use a **self-contained seed approach**:

```typescript
// tests/balance.spec.ts approach
// Use a simple handcrafted scenario with known totals:
// Chris pays: 100€
// Alex pays: 200€
// balance_mensuelle = (200-100)/2 = 50
// balance_reportee = 0 (first month, no previous)
// No adjustments
// balance_finale = 50 + 0 + 0 - 0 = 50
// → Chris doit 50 € à Alex
```

**OR** use mars 2026 fixture (month 5) which IS complete:
- Seed: depenses 501+502+503, ajustements 3001+3002, balance_reportee=-290
- Expected: balance_finale = -518.5 → "Alex doit 518,50 € à Chris"

The Playwright helper pattern from CLAUDE.md (seedDatabase function) needs to be created in `tests/helpers/seed.ts`.

### Sampling Rate

- **Per task commit:** `npx playwright test tests/balance.spec.ts`
- **Per wave merge:** `npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/balance.spec.ts` — covers DASH-01, DASH-02, DASH-03, DASH-04, RPT-01
- [ ] `tests/helpers/seed.ts` — seedDatabase helper for Playwright
- [ ] `tests/helpers/auth.ts` — login helper (reuse across test files)
- [ ] shadcn components: `npx shadcn@latest add badge separator skeleton`

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| API route for data fetching | RSC direct DB fetch | Fewer round trips, no loading spinner needed |
| useState + useEffect | Server component async/await | Simpler code, better performance |
| Manual migration SQL | Drizzle Kit generate + migrate | Type-safe, versioned |
| Manual month report entry | getOrCreateCurrentMois() | Eliminates the core spreadsheet pain point |

---

## Open Questions

1. **Unique constraint on (annee, mois)**
   - What we know: schema.ts does not currently have this unique constraint
   - What's unclear: Phase 1 migration may already be applied; adding the constraint requires a new migration
   - Recommendation: Add unique constraint via `unique()` in schema.ts + `npx drizzle-kit generate && npx drizzle-kit migrate`

2. **What to show when no current month exists yet (first-ever load)**
   - What we know: `getOrCreateCurrentMois()` creates a new month with balance_reportee=0 if nothing exists
   - What's unclear: Should the UI show an empty state, or just show zero balance?
   - Recommendation: Show zero balance with "Aucune dépense ce mois" message — graceful, not an error

3. **Loading state for dashboard**
   - What we know: RSC has no loading spinner by default; Next.js supports `loading.tsx` for Suspense
   - What's unclear: Is a loading state needed for this phase?
   - Recommendation: Add `app/(app)/loading.tsx` with Skeleton components for polish — low effort, good UX

---

## Sources

### Primary (HIGH confidence)
- Codebase inspection — lib/db/schema.ts, lib/auth/config.ts, app/(app)/page.tsx, lib/categories.ts
- docs/fixtures_e2e.json — verified algorithm against 5 months of expected_balances (mars 2026 is complete dataset)
- CLAUDE.md — project conventions, mobile-first rules, formatting patterns
- docs/TECH_SPEC_LeCommun.md — architecture patterns, component structure
- playwright.config.ts — test framework configuration

### Secondary (MEDIUM confidence)
- docs/PRD_Compta_Commune.md — business algorithm from PRD section 3.2 (corroborates the corrected formula)
- package.json — exact installed versions (no version guessing)

### Tertiary (LOW confidence — not verified externally)
- Tailwind 4 + shadcn/ui compatibility: assumed working since Phase 1 installed both successfully
- Drizzle `onConflictDoNothing()` API: verified concept exists in Drizzle but exact syntax not Context7-checked

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all from package.json + codebase inspection
- Architecture patterns: HIGH — follows TECH_SPEC + verified against Phase 1 code
- Algorithm correctness: HIGH — mathematically verified against 2 complete fixture months
- Algorithm documentation bug: HIGH — definitively proven via mars/février 2026 fixture data
- Pitfalls: HIGH — derived from codebase analysis and known Next.js/Drizzle patterns
- Fixture data completeness: HIGH — numerically verified (only mars 2026 items sum to expected_balances)

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable stack, no fast-moving parts)
