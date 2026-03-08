# Phase 6: Balance Initiale - Research

**Researched:** 2026-03-08
**Domain:** Next.js Server Actions, conditional UI rendering, Drizzle ORM updates
**Confidence:** HIGH

## Summary

Phase 6 adds a single focused feature: when the current month has no previous month in the database, the dashboard displays an editable field for the user to manually set `balance_reportee`. This replaces the current default of `0` with a user-provided initial balance (carried from the original Google Sheets). Once a previous month exists, the automatic computation (already implemented in `computeBalanceReportee`) takes over and the edit field disappears.

The implementation is straightforward: detect "no previous month" condition (already partially handled in `computeBalanceReportee` at line 92 of `lib/db/queries/mois.ts`), surface this to the dashboard page, render a client component with an input field, and create a server action to update `balance_reportee` on the `mois` row. No schema changes are needed -- `balance_reportee` already exists as a `real` column on the `mois` table.

**Primary recommendation:** Add a `hasPreviousMois` boolean to the dashboard data flow, conditionally render an `InitialBalanceForm` client component inside `BalanceCard`, and create a simple server action `actionUpdateBalanceReportee` that updates the `mois` row and revalidates `/`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INIT-01 | Dashboard affiche un champ editable quand pas de mois precedent | Detect via new `hasPreviousMois()` query; conditional render in `BalanceCard` |
| INIT-02 | Saisie d'un montant signe (positif = Chris doit a Alex) | Standard `<input type="number">` with `step="0.01"`, allow negative via no `min` constraint; Zod validation server-side |
| INIT-03 | La valeur met a jour `balance_reportee` et recalcule immediatement | Server action + `revalidatePath('/')` + `router.refresh()` pattern (from Phase 05 learning) |
| INIT-04 | Champ reste editable tant qu'aucun mois precedent n'existe | Condition re-evaluated on each page load (RSC); no state to manage |
| INIT-05 | Quand mois precedent existe, balance reportee auto et non editable | Already implemented -- `computeBalanceReportee` returns computed value; just hide the form |
</phase_requirements>

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15 | App Router, Server Actions, RSC | Project stack |
| Drizzle ORM | current | DB update for `balance_reportee` | Project ORM |
| Zod | current | Validate signed amount input | Project validation |
| shadcn/ui | current | Input, Button components | Project UI |

### Supporting (already in project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @libsql/client | current | Direct DB access in tests | E2E seed helper |
| Playwright | current | E2E tests | Validation |

No new dependencies are needed for this phase.

## Architecture Patterns

### Recommended Changes

```
lib/db/queries/mois.ts        # Add: hasPreviousMois(), updateBalanceReportee()
app/(app)/page.tsx             # Pass hasPreviousMois flag to BalanceCard
components/balance/BalanceCard.tsx  # Conditionally render InitialBalanceForm
components/balance/InitialBalanceForm.tsx  # NEW: Client component for editable field
app/(app)/actions.ts           # NEW: actionUpdateBalanceReportee server action
```

### Pattern 1: Detect "No Previous Month" Condition

**What:** Query whether the calendar-previous month exists in the `mois` table.
**When to use:** On every dashboard load (RSC, no cache).
**Key insight:** `computeBalanceReportee` already does this check (line 92: `if (prevRows.length === 0) return 0`). Extract the "exists" check into a reusable function.

```typescript
// lib/db/queries/mois.ts
export async function hasPreviousMois(annee: number, moisNum: number): Promise<boolean> {
  const prevMoisNum = moisNum === 1 ? 12 : moisNum - 1;
  const prevAnnee   = moisNum === 1 ? annee - 1 : annee;

  const rows = await db
    .select({ id: mois.id })
    .from(mois)
    .where(and(eq(mois.annee, prevAnnee), eq(mois.mois, prevMoisNum)))
    .limit(1);

  return rows.length > 0;
}
```

### Pattern 2: Server Action for Updating balance_reportee

**What:** A server action that validates a signed number and updates the `mois` row.
**When to use:** When user submits the initial balance form.

```typescript
// app/(app)/actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { mois } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const BalanceReporteeSchema = z.object({
  mois_id: z.coerce.number().int().positive(),
  balance_reportee: z.coerce.number(), // signed: positive or negative
});

export async function actionUpdateBalanceReportee(
  formData: FormData
): Promise<{ error: string } | void> {
  const parsed = BalanceReporteeSchema.safeParse({
    mois_id: formData.get('mois_id'),
    balance_reportee: formData.get('balance_reportee'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Montant invalide' };
  }

  await db
    .update(mois)
    .set({ balance_reportee: parsed.data.balance_reportee })
    .where(eq(mois.id, parsed.data.mois_id));

  revalidatePath('/');
}
```

### Pattern 3: Client Component with useTransition + router.refresh()

**What:** Form submission with immediate UI feedback.
**When to use:** For the editable balance field.
**Key learning from Phase 05:** `revalidatePath` alone is insufficient with `useTransition` -- must also call `router.refresh()` after the server action.

```typescript
// components/balance/InitialBalanceForm.tsx
'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { actionUpdateBalanceReportee } from '@/app/(app)/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  moisId: number;
  currentValue: number;
}

export function InitialBalanceForm({ moisId, currentValue }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    formData.set('mois_id', String(moisId));
    startTransition(async () => {
      await actionUpdateBalanceReportee(formData);
      router.refresh(); // Phase 05 learning: required for RSC re-render
    });
  }

  return (
    <form action={handleSubmit} className="space-y-2">
      <label className="text-sm text-muted-foreground">
        Balance initiale (report du tableur)
      </label>
      <div className="flex gap-2">
        <Input
          name="balance_reportee"
          type="number"
          step="0.01"
          defaultValue={currentValue}
          className="min-h-[48px] text-base"
          placeholder="ex: 891.50 ou -150.00"
        />
        <Button
          type="submit"
          disabled={isPending}
          className="min-h-[48px] px-6"
        >
          {isPending ? '...' : 'OK'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Positif = Chris doit a Alex, negatif = Alex doit a Chris
      </p>
    </form>
  );
}
```

### Anti-Patterns to Avoid
- **Storing "isInitial" as a separate DB column:** The condition is purely derived from whether a previous month exists. Adding a column would create a sync problem.
- **Allowing edit when previous month exists:** This would break the cascade invariant. The edit field must disappear the moment a previous month is inserted.
- **Using client-side state for the balance value:** The balance must always come from DB. After submit, refresh RSC data rather than optimistic update.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Number input validation | Custom parser for signed EUR amounts | `z.coerce.number()` | Handles decimals, signs, edge cases |
| Form submission + refresh | Custom fetch + setState | Server Action + `useTransition` + `router.refresh()` | Established project pattern |
| Previous month detection | Complex date math | Simple calendar arithmetic (already in codebase) | Only need month-1, year rollover |

## Common Pitfalls

### Pitfall 1: iOS Number Input Zoom
**What goes wrong:** On iOS, `<input>` with font-size < 16px triggers auto-zoom.
**Why it happens:** Safari behavior on small text inputs.
**How to avoid:** Use `text-base` class (16px) on the input -- already specified in CLAUDE.md mobile-first rules.
**Warning signs:** Input zooms in when tapped on iPhone.

### Pitfall 2: Race Condition on Month Creation
**What goes wrong:** Two requests could create the current month simultaneously, one with user-provided balance_reportee, one with default 0.
**Why it happens:** `getOrCreateCurrentMois` uses `onConflictDoUpdate` which would overwrite.
**How to avoid:** The initial balance edit happens AFTER month creation (month already exists when user sees the form). The server action does a targeted `UPDATE ... WHERE id = ?` on the existing row. No race condition.
**Warning signs:** Balance resetting to 0 unexpectedly.

### Pitfall 3: revalidatePath Not Refreshing RSC Data
**What goes wrong:** After server action, page doesn't reflect updated balance.
**Why it happens:** Known issue documented in Phase 05 decision: `revalidatePath` alone insufficient with `useTransition`.
**How to avoid:** Always call `router.refresh()` after the server action completes.
**Warning signs:** Form submits but displayed balance doesn't change until manual reload.

### Pitfall 4: Decimal Precision
**What goes wrong:** Floating point artifacts in displayed amounts (e.g., 891.5000000001).
**Why it happens:** JavaScript floating point arithmetic.
**How to avoid:** The `formatEur()` function in BalanceCard already handles this via `toLocaleString`. Just ensure the raw number stored is a simple decimal (SQLite `real` type).
**Warning signs:** Extra decimal digits in displayed amounts.

### Pitfall 5: Negative Values in Number Input
**What goes wrong:** Some mobile browsers strip the minus sign or don't show it on numeric keyboard.
**Why it happens:** `type="number"` keyboard behavior varies by browser/OS.
**How to avoid:** Test on actual mobile. If problematic, consider `inputMode="decimal"` with `type="text"` and Zod parsing. But `type="number"` with `step="0.01"` and no `min` attribute should work on modern iOS/Android.
**Warning signs:** User cannot enter negative amounts on mobile.

## Code Examples

### Dashboard Page Integration

```typescript
// app/(app)/page.tsx — modified
import { hasPreviousMois } from '@/lib/db/queries/mois';

export default async function HomePage() {
  const moisCourant = await getOrCreateCurrentMois();
  const depenses = await getDepensesByMois(moisCourant.id);
  const ajustements = await getAjustementsByMois(moisCourant.id);
  const balance = calculerBalance(depenses, ajustements, moisCourant.balance_reportee);
  const hasPrev = await hasPreviousMois(moisCourant.annee, moisCourant.mois);

  return (
    <main className="p-4 space-y-6 pb-6">
      {/* ... header ... */}
      <BalanceCard
        balance={balance}
        mois={moisCourant}
        editableBalanceReportee={!hasPrev}
      />
      <BalanceSynthese depenses={depenses} />
    </main>
  );
}
```

### BalanceCard Conditional Rendering

```typescript
// components/balance/BalanceCard.tsx — add to Props and render
interface Props {
  balance: BalanceResult;
  mois: Mois;
  editableBalanceReportee?: boolean;
}

// In the render, replace the static "Report mois prec." line:
{editableBalanceReportee ? (
  <InitialBalanceForm moisId={mois.id} currentValue={balance.balance_reportee} />
) : (
  <div className="flex justify-between items-center min-h-[48px]">
    <span className="text-muted-foreground">Report mois prec.</span>
    <span data-testid="balance-reportee">{formatSigned(balance_reportee)}</span>
  </div>
)}
```

### Update Query

```typescript
// lib/db/queries/mois.ts
export async function updateBalanceReportee(id: number, value: number): Promise<void> {
  await db
    .update(mois)
    .set({ balance_reportee: value })
    .where(eq(mois.id, id));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Default balance_reportee = 0 for first month | User-editable initial balance | This phase | Allows migrating from spreadsheet with correct opening balance |

**No deprecated APIs involved.** All patterns used are established in the existing codebase (Server Actions, RSC, Drizzle, Zod).

## Open Questions

1. **Should the edit form show inline in BalanceCard or as a separate section?**
   - What we know: BalanceCard currently shows "Report mois prec." as a static line. Replacing it with an inline form keeps context clear.
   - What's unclear: Whether the form is visually distinct enough inline.
   - Recommendation: Inline with a subtle highlight (e.g., a colored border or background) to indicate editability. Keep it simple -- this is a one-time setup action.

2. **Should there be a confirmation step before saving?**
   - What we know: The user can re-edit at any time (INIT-04), so an accidental save is easily corrected.
   - Recommendation: No confirmation needed. Simple submit button is sufficient.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (E2E) + Vitest (unit, if needed) |
| Config file | `playwright.config.ts` |
| Quick run command | `npx playwright test tests/balance-initiale.spec.ts` |
| Full suite command | `npx playwright test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INIT-01 | Editable field shown when no previous month | E2E | `npx playwright test tests/balance-initiale.spec.ts -g "INIT-01"` | No - Wave 0 |
| INIT-02 | Signed amount submission (positive and negative) | E2E | `npx playwright test tests/balance-initiale.spec.ts -g "INIT-02"` | No - Wave 0 |
| INIT-03 | Balance recalculates after submission | E2E | `npx playwright test tests/balance-initiale.spec.ts -g "INIT-03"` | No - Wave 0 |
| INIT-04 | Field remains editable (re-edit scenario) | E2E | `npx playwright test tests/balance-initiale.spec.ts -g "INIT-04"` | No - Wave 0 |
| INIT-05 | Field hidden when previous month exists | E2E | `npx playwright test tests/balance-initiale.spec.ts -g "INIT-05"` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npx playwright test tests/balance-initiale.spec.ts`
- **Per wave merge:** `npx playwright test`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
- [ ] `tests/balance-initiale.spec.ts` -- covers INIT-01 through INIT-05
- [ ] Seed scenarios: one with no previous month (isolated current month), one with previous month present

*(Existing test infrastructure -- seed helper, auth helper, Playwright config -- is already in place.)*

## Sources

### Primary (HIGH confidence)
- Existing codebase: `lib/db/queries/mois.ts` -- `computeBalanceReportee` logic, `getOrCreateCurrentMois` pattern
- Existing codebase: `app/(app)/depenses/actions.ts` -- server action pattern with Zod + `revalidatePath`
- Existing codebase: `components/balance/BalanceCard.tsx` -- current rendering structure
- Existing codebase: `lib/db/schema.ts` -- `balance_reportee` is `real` column, no schema change needed
- Existing codebase: `tests/balance.spec.ts` -- E2E test patterns, seed helper usage

### Secondary (MEDIUM confidence)
- Phase 05 decision (from STATE.md): `router.refresh()` required after server actions with `useTransition`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries needed, all patterns exist in codebase
- Architecture: HIGH - straightforward extension of existing dashboard page
- Pitfalls: HIGH - known issues from previous phases, well-documented in project

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable domain, no external dependencies)
