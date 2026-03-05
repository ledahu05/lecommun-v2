# Phase 4: Historique - Research

**Researched:** 2026-03-05
**Domain:** Next.js App Router dynamic routes, read-only archive views, Drizzle ORM queries
**Confidence:** HIGH

---

## Summary

Phase 4 is a read-only feature: display all archived months (HIS-01) and let the user drill into one month to see its depenses, ajustements, and full balance detail (HIS-02). There are no mutations — no forms, no Server Actions, no delete buttons in history.

The codebase is already 95% of what is needed. All queries (`getDepensesByMois`, `getAjustementsByMois`, `calculerBalance`) and display components (`BalanceCard`, `BalanceSynthese`, `DepensesList`, `AjustementsList`) are in place and tested. The only missing pieces are: (1) a DB query to list all months ordered by recency, (2) the `/historique` list page (currently a stub), (3) a dynamic detail route `/historique/[id]`, and (4) read-only wrappers for the item lists that omit delete buttons.

**Primary recommendation:** Reuse existing components with minimal adaptation. Add one DB query (`getAllMois`), replace the stub `/historique/page.tsx`, create `/historique/[id]/page.tsx`, and add read-only variants of `DepenseItem`/`AjustementItem` (or pass a `readOnly` prop).

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HIS-01 | L'utilisateur peut consulter la liste des mois archivés | New `getAllMois()` DB query + list page that maps each Mois row to a clickable card showing month label + balance_finale |
| HIS-02 | L'utilisateur peut consulter le détail d'un mois archivé (dépenses, ajustements, balance) | Dynamic route `/historique/[id]` that fetches mois by id, runs `calculerBalance`, reuses `BalanceCard` + `BalanceSynthese` + read-only item lists |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15 | Dynamic segments `[id]`, RSC data fetching | Already in use project-wide |
| Drizzle ORM | current | `db.select().from(mois).orderBy(...)` | Already in use for all queries |
| date-fns/fr | current | French month labels (`format(..., 'MMMM yyyy', { locale: fr })`) | Already used in `BalanceCard` |
| shadcn/ui | current | Card, Separator, Badge — visual consistency | Already in use project-wide |

### No new dependencies required
This phase adds zero npm packages. All needed libraries are already installed.

---

## Architecture Patterns

### Recommended Project Structure
```
app/(app)/historique/
├── page.tsx                # HIS-01: list of all months (RSC)
└── [id]/
    └── page.tsx            # HIS-02: detail of one archived month (RSC)

lib/db/queries/
└── mois.ts                 # Add getAllMois() here (existing file)

components/historique/
├── MoisCard.tsx            # Clickable month summary row for the list
├── HistoriqueDepenseItem.tsx  # Read-only depense item (no delete button)
└── HistoriqueAjustementItem.tsx  # Read-only ajustement item (no delete button)
```

### Pattern 1: RSC list page with `getAllMois`
**What:** `/historique/page.tsx` fetches all months ordered by (annee DESC, mois DESC). Renders a list of clickable cards, each showing the month label and its computed balance_finale.
**When to use:** HIS-01 — the archive landing page.

Computing `balance_finale` for every month in a list requires loading all depenses and ajustements for each month. For 2 users with 55 months of history this is acceptable (55 DB round-trips max). Optimize only if needed.

```typescript
// Source: existing pattern from lib/db/queries/mois.ts + lib/balance.ts
import { db } from '@/lib/db';
import { mois, depenses, ajustements } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { calculerBalance } from '@/lib/balance';

export async function getAllMois() {
  const allMois = await db
    .select()
    .from(mois)
    .orderBy(desc(mois.annee), desc(mois.mois));

  // For each month, compute balance_finale for display in the list
  const results = await Promise.all(
    allMois.map(async (m) => {
      const deps = await db.select().from(depenses).where(eq(depenses.mois_id, m.id));
      const adjs = await db.select().from(ajustements).where(eq(ajustements.mois_id, m.id));
      const balance = calculerBalance(deps, adjs, m.balance_reportee);
      return { mois: m, balance_finale: balance.balance_finale };
    })
  );

  return results;
}
```

### Pattern 2: Dynamic route `/historique/[id]`
**What:** RSC that receives `params.id`, fetches the single mois row, its depenses, its ajustements, computes full `BalanceResult`, then renders reusable display components.
**When to use:** HIS-02 — clicking a month in the list.

```typescript
// Source: next.js app router dynamic segment pattern (established in project via (app) route group)
// app/(app)/historique/[id]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { mois } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getDepensesByMois } from '@/lib/db/queries/depenses';
import { getAjustementsByMois } from '@/lib/db/queries/ajustements';
import { calculerBalance } from '@/lib/balance';
import { BalanceCard } from '@/components/balance/BalanceCard';
import { BalanceSynthese } from '@/components/balance/BalanceSynthese';

export const dynamic = 'force-dynamic';

export default async function HistoriqueDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const rows = await db.select().from(mois).where(eq(mois.id, id)).limit(1);
  if (rows.length === 0) notFound();

  const moisRow = rows[0];
  const depensesList = await getDepensesByMois(moisRow.id);
  const ajustementsList = await getAjustementsByMois(moisRow.id);
  const balance = calculerBalance(depensesList, ajustementsList, moisRow.balance_reportee);

  return (
    <main className="p-4 space-y-6 pb-6">
      {/* Back link + month title */}
      <BalanceCard balance={balance} mois={moisRow} />
      <BalanceSynthese depenses={depensesList} />
      {/* Read-only depenses list */}
      {/* Read-only ajustements list */}
    </main>
  );
}
```

### Pattern 3: Read-only item components
**What:** The existing `DepenseItem` and `AjustementItem` include a delete form/button. The archive must be read-only — these can be duplicated as simple display components or the existing ones can accept a `readOnly` prop.
**Recommendation:** Duplicate as `HistoriqueDepenseItem` and `HistoriqueAjustementItem` — simpler than adding conditional logic to components already in use elsewhere, and the RSC of each is small.

### Back navigation pattern
**What:** A back link/button from the detail page to `/historique`. Since there is no persistent state, a plain `<Link href="/historique">` suffices.
**When to use:** Top of the detail page.

### Anti-Patterns to Avoid
- **Caching the balance:** Never store `balance_finale` in the DB — recalculate at query time (project decision: "La balance se recalcule à chaque requête").
- **Client Components for the detail page:** No user interaction needed — keep it pure RSC.
- **Adding delete buttons in the archive:** HIS-02 is read-only consultation only.
- **Reusing `getOrCreateCurrentMois`:** The historique detail should fetch by explicit `id`, not call `getOrCreateCurrentMois` which creates a new month if missing.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Month label formatting | Custom format function | `date-fns format(..., 'MMMM yyyy', { locale: fr })` | Already used in BalanceCard |
| Balance calculation | Any new calculation logic | `calculerBalance()` from `lib/balance.ts` | Verified against fixtures_e2e, already tested |
| 404 handling | Custom error pages | `notFound()` from `next/navigation` | Next.js built-in, renders the nearest not-found.tsx |
| Currency formatting | Custom formatter | `.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })` | Project convention from CLAUDE.md |

---

## Common Pitfalls

### Pitfall 1: `params` is async in Next.js 15
**What goes wrong:** In Next.js 15 with App Router, `params` in dynamic segments is a Promise. Accessing `params.id` synchronously causes a build error or runtime warning.
**Why it happens:** Next.js 15 changed params to be async to enable better streaming.
**How to avoid:** Await params: `const { id } = await params;` — or use `params` as a prop typed `Promise<{ id: string }>` and await it.
**Warning signs:** TypeScript error "Property 'id' does not exist on type Promise" or runtime warning about sync access.

```typescript
// Correct pattern for Next.js 15
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  ...
}
```

### Pitfall 2: `notFound()` must be called, not just returned
**What goes wrong:** Returning `null` or an empty fragment when the mois ID is not found silently renders a blank page.
**How to avoid:** Always call `notFound()` from `next/navigation` for missing records — this renders the nearest `not-found.tsx` boundary.

### Pitfall 3: Linking to `/historique/[id]` with string ID
**What goes wrong:** `mois.id` from Drizzle is typed as `number`. Using it directly in `href="/historique/${mois.id}"` works fine in TypeScript. The gotcha is parsing it back: `Number(params.id)` can return `NaN` for malformed URLs — always guard with `isNaN(id)`.

### Pitfall 4: Including current month in the archive
**What goes wrong:** The historique list may include the current month, which is still being edited. Depending on the product decision, the list should either include all months (simpler) or exclude the current month.
**Project decision:** The requirements say "mois archivés" — treat all existing months as viewable. Since the current month exists in DB, include it. No filtering needed unless the user decides otherwise.

### Pitfall 5: Empty historique on first use
**What goes wrong:** Before any month exists in DB (fresh install), `getAllMois()` returns an empty array. The list page must handle this gracefully.
**How to avoid:** Render an empty state message (e.g. "Aucun mois archivé pour l'instant.").

---

## Code Examples

### getAllMois DB query
```typescript
// Source: drizzle-orm pattern — mirrors existing queries in lib/db/queries/
import { db } from '@/lib/db';
import { mois } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function getAllMois() {
  return db
    .select()
    .from(mois)
    .orderBy(desc(mois.annee), desc(mois.mois));
}
```

### MoisCard — clickable summary row
```typescript
// Mobile-first: min-h-[48px], full-width tap target
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Mois } from '@/types';

interface Props {
  mois: Mois;
  balance_finale: number;
}

export function MoisCard({ mois, balance_finale }: Props) {
  const label = format(new Date(mois.annee, mois.mois - 1, 1), 'MMMM yyyy', { locale: fr });
  const montant = Math.abs(balance_finale).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
  const debiteur = balance_finale > 0
    ? `Chris doit ${montant}`
    : balance_finale < 0
    ? `Alex doit ${montant}`
    : 'Équilibre';

  return (
    <Link
      href={`/historique/${mois.id}`}
      className="flex items-center justify-between min-h-[48px] py-3 border-b last:border-b-0"
      data-testid="mois-card"
    >
      <span className="font-medium text-base capitalize">{label}</span>
      <span className="text-sm text-muted-foreground">{debiteur}</span>
    </Link>
  );
}
```

### Read-only DepenseItem (no delete button)
```typescript
// Mirrors DepenseItem but without the delete form
import type { Depense } from '@/types';

interface Props { depense: Depense; }

export function HistoriqueDepenseItem({ depense }: Props) {
  const displayLabel = depense.label ?? depense.sous_categorie;
  const montant = depense.montant.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });

  return (
    <div
      data-testid="historique-depense-item"
      className="flex items-center justify-between min-h-[48px] py-3 border-b last:border-b-0"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-base truncate">{displayLabel}</p>
        <p className="text-sm text-muted-foreground">{depense.paye_par} — {montant}</p>
      </div>
    </div>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `params.id` sync access (Next.js 14) | `await params` (Next.js 15) | Must use async params to avoid warnings/errors |
| Separate balance store | Recalculate at query time | Already established — no change needed |

---

## Open Questions

1. **Include or exclude the current month in the historique list?**
   - What we know: Requirements say "mois archivés" but no explicit exclusion of current month.
   - What's unclear: Whether users want to browse the current month's full detail from the historique page too (the dashboard already shows current month).
   - Recommendation: Include all months. Simplest implementation; the detail page works identically for current and past months. The user can decide to filter later.

2. **Should delete still be available from the historique detail?**
   - What we know: HIS-02 says "consulter" (consult/view) — read-only intent. No delete requirement.
   - Recommendation: No delete in historique. Read-only.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 |
| Config file | `playwright.config.ts` |
| Quick run command | `npx playwright test tests/historique.spec.ts` |
| Full suite command | `npx playwright test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HIS-01 | La page /historique liste tous les mois avec leur balance | E2E | `npx playwright test tests/historique.spec.ts` | Wave 0 |
| HIS-02 | /historique/[id] affiche les dépenses, ajustements et balance du mois archivé | E2E | `npx playwright test tests/historique.spec.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx playwright test tests/historique.spec.ts`
- **Per wave merge:** `npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/historique.spec.ts` — covers HIS-01 and HIS-02
- [ ] Uses existing `tests/helpers/seed.ts` and `tests/helpers/auth.ts` — no new fixtures needed

*(No framework changes, no new conftest — existing Playwright infrastructure covers everything.)*

---

## Sources

### Primary (HIGH confidence)
- Codebase direct inspection — `lib/db/queries/`, `lib/balance.ts`, `types/index.ts`, `components/balance/`, `components/depenses/`, `components/ajustements/`, `tests/helpers/`, `playwright.config.ts`
- `app/(app)/page.tsx` and `app/(app)/depenses/page.tsx` — RSC patterns already in use
- `.planning/STATE.md` — established project decisions (no cache, Server Actions for mutations, RSC for pages)

### Secondary (MEDIUM confidence)
- Next.js 15 App Router docs — async params pattern for dynamic segments (known breaking change from Next.js 14 to 15)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies; all libraries verified in codebase
- Architecture: HIGH — directly mirrors Phase 2/3 patterns already working in production
- Pitfalls: HIGH — Next.js 15 async params is a verified breaking change; others drawn from existing codebase patterns
- Test infrastructure: HIGH — Playwright setup is operational; `seedDatabase` and `loginAs` helpers are ready

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable stack; no fast-moving dependencies)
