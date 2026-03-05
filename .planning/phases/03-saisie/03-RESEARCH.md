# Phase 3: Saisie - Research

**Researched:** 2026-03-05
**Domain:** Next.js 15 Server Actions, React 19 forms, Zod validation, mobile-first UI
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DEP-01 | L'utilisateur peut saisir une dépense avec catégorie, sous-catégorie, montant, payeur (chris/alex), date et libellé optionnel | Server Action `actionCreateDepense` + Client Component form + Zod schema |
| DEP-02 | L'utilisateur voit la liste des dépenses du mois courant | RSC `depenses/page.tsx` fetches via `getDepensesByMois` (query already exists) |
| DEP-03 | L'utilisateur peut supprimer une dépense | Server Action `actionDeleteDepense` + delete button with confirmation |
| DEP-04 | Une dépense avec montant ≤ 0 est rejetée (validation serveur + client) | Zod `.positive()` in schema + HTML5 `min="0.01"` on input |
| DEP-05 | Les catégories et sous-catégories sont fixes (alimentation, habitation, loisirs, vie_quotidienne + sous-catégories) | Drive UI from `lib/categories.ts` CATEGORIES constant — already complete |
| AJU-01 | L'utilisateur peut saisir un ajustement (virement, avance ponctuelle) avec direction, montant, libellé obligatoire et date | Server Action `actionCreateAjustement` + Client Component form |
| AJU-02 | L'utilisateur voit la liste des ajustements du mois courant | RSC `ajustements/page.tsx` fetches via `getAjustementsByMois` (query already exists) |
| AJU-03 | L'utilisateur peut supprimer un ajustement | Server Action `actionDeleteAjustement` + delete button |
| AJU-04 | Les ajustements sont intégrés dans le calcul de la balance finale | Already implemented in `lib/balance.ts` — no new logic needed; deleting adjustments triggers balance recalc on next page load |
</phase_requirements>

---

## Summary

Phase 3 adds the two core data-entry flows of the app: expense entry/listing/deletion and adjustment entry/listing/deletion. The technical foundation is already largely in place: the DB schema (`depenses`, `ajustements` tables), the query functions (`getDepensesByMois`, `getAjustementsByMois`), the balance algorithm (`lib/balance.ts`), and the type definitions (`types/index.ts`) all exist from Phases 1 and 2. What is missing is the UI layer: the two placeholder pages (`depenses/page.tsx` and `ajustements/page.tsx`) need to be built out as full RSC pages with embedded Client Component forms and delete buttons.

The app is strictly mobile-first (390×844, 48px touch targets, 16px minimum font size). The project already enforces the Server Actions pattern (no fetch on the client), RSC for read pages, and Zod for all input validation. The `paye_par` field on iOS must NOT use a `<select>` — use segmented buttons instead, per CLAUDE.md.

**Primary recommendation:** Implement each page as an RSC that fetches data and renders a list, with a Client Component "form sheet" that calls a Server Action. Delete is a small inline form also calling a Server Action. No new libraries needed.

---

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Next.js | 16.1.6 | App Router, RSC, Server Actions | Already in use |
| React | 19.2.3 | Client Components | Already in use |
| Zod | ^4.3.6 | Schema validation (server + client) | Already installed |
| Drizzle ORM | ^0.45.1 | DB insert/delete queries | Already in use |
| shadcn/ui | installed | Form primitives: Input, Label, Button, Card | button, input, label, card, separator, skeleton all installed |
| date-fns | ^4.1.0 | Date formatting (fr locale) | Already used in BalanceCard |
| lucide-react | ^0.577.0 | Icons (Trash2, Plus) | Already installed |

### Missing shadcn Components to Add

| Component | Purpose | Install Command |
|-----------|---------|-----------------|
| `select` | Sous-catégorie dropdown | `npx shadcn add select` |
| `form` | React Hook Form integration (optional) | `npx shadcn add form` |
| `dialog` | Floating form panel (alternative to new page) | `npx shadcn add dialog` |
| `alert-dialog` | Delete confirmation | `npx shadcn add alert-dialog` |

**Note on paye_par / direction:** Do NOT use `<select>` for the `paye_par` field (iOS native select problems per CLAUDE.md). Use segmented button pair (Chris / Alex) implemented with shadcn `Button` variants.

**Note on form pattern:** React Hook Form + shadcn Form is the standard for complex forms with inline validation feedback. However, given this app has simple forms (5-7 fields) and already has Zod installed, direct uncontrolled form submission with Server Actions is acceptable. Use whatever produces the cleanest code — either approach is fine.

### No New Libraries Needed

All required libraries are already installed. Do NOT add new form libraries (react-hook-form, formik) unless the plan specifically calls for it.

---

## Architecture Patterns

### Page Structure (RSC + Client Component)

```
app/(app)/
├── depenses/
│   ├── page.tsx          # RSC: fetches list, renders DepensesList + DepenseForm
│   └── actions.ts        # Server Actions: actionCreateDepense, actionDeleteDepense
├── ajustements/
│   ├── page.tsx          # RSC: fetches list, renders AjustementsList + AjustementForm
│   └── actions.ts        # Server Actions: actionCreateAjustement, actionDeleteAjustement

components/
├── depenses/
│   ├── DepensesList.tsx   # RSC or Client: renders list with delete buttons
│   ├── DepenseForm.tsx    # 'use client': form for new depense
│   └── DepenseItem.tsx    # Single row with delete form
├── ajustements/
│   ├── AjustementsList.tsx
│   ├── AjustementForm.tsx
│   └── AjustementItem.tsx

lib/db/queries/
├── depenses.ts    # Add: insertDepense, deleteDepense (getDepensesByMois already exists)
├── ajustements.ts # Add: insertAjustement, deleteAjustement (getAjustementsByMois already exists)
```

### Pattern 1: Server Action with Zod validation

```typescript
// app/(app)/depenses/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { insertDepense } from '@/lib/db/queries/depenses';
import { getOrCreateCurrentMois } from '@/lib/db/queries/mois';
import { CATEGORIES } from '@/lib/categories';

const DepenseSchema = z.object({
  categorie: z.enum(['alimentation', 'habitation', 'loisirs', 'vie_quotidienne']),
  sous_categorie: z.string().min(1),
  paye_par: z.enum(['chris', 'alex']),
  montant: z.coerce.number().positive('Le montant doit être supérieur à 0'),
  date_depense: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  label: z.string().optional(),
});

export async function actionCreateDepense(formData: FormData) {
  const parsed = DepenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const moisCourant = await getOrCreateCurrentMois();
  await insertDepense({ ...parsed.data, mois_id: moisCourant.id });
  revalidatePath('/depenses');
  revalidatePath('/');
}
```

**Key insight:** `revalidatePath('/')` is required in addition to `/depenses` — the dashboard balance must also refresh when expenses change.

### Pattern 2: Delete via inline form (no JS required)

```typescript
// components/depenses/DepenseItem.tsx
// Server Component (or Client) — delete uses a form + Server Action
import { actionDeleteDepense } from '@/app/(app)/depenses/actions';

export function DepenseItem({ depense }: { depense: Depense }) {
  return (
    <div className="flex items-center justify-between min-h-[48px] py-2">
      <div>
        <p className="font-medium">{depense.label ?? depense.sous_categorie}</p>
        <p className="text-sm text-muted-foreground">
          {depense.paye_par} — {depense.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </p>
      </div>
      <form action={actionDeleteDepense}>
        <input type="hidden" name="id" value={depense.id} />
        <Button variant="ghost" size="icon" type="submit" className="min-h-[48px] min-w-[48px]">
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </form>
    </div>
  );
}
```

### Pattern 3: Segmented buttons for paye_par (iOS-safe)

```typescript
// 'use client'
// Replace <select> with two adjacent buttons
const [payePar, setPayePar] = useState<'chris' | 'alex'>('chris');

<div className="flex gap-2">
  <Button
    type="button"
    variant={payePar === 'chris' ? 'default' : 'outline'}
    className="flex-1 min-h-[48px]"
    onClick={() => setPayePar('chris')}
  >
    Chris
  </Button>
  <Button
    type="button"
    variant={payePar === 'alex' ? 'default' : 'outline'}
    className="flex-1 min-h-[48px]"
    onClick={() => setPayePar('alex')}
  >
    Alex
  </Button>
  <input type="hidden" name="paye_par" value={payePar} />
</div>
```

### Pattern 4: Category cascade (catégorie → sous-catégorie)

When catégorie changes, the sous_categorie list must update. Since CATEGORIES is a static constant, this is pure derived state — no async fetch needed:

```typescript
// 'use client'
import { CATEGORIES, type Categorie } from '@/lib/categories';

const [categorie, setCategorie] = useState<Categorie>('alimentation');
const sousCats = CATEGORIES[categorie].sous_categories;
```

### Pattern 5: date default = today

```typescript
// Default date_depense to today in fr format
const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
<input type="date" name="date_depense" defaultValue={today} />
```

### Anti-Patterns to Avoid

- **Don't use `<select>` for paye_par / de / vers on mobile:** iOS renders native selects poorly; use segmented Button pairs instead.
- **Don't forget `revalidatePath('/')` after mutations:** The dashboard balance must reflect new/deleted expenses immediately.
- **Don't store balance in DB:** Balance is always calculated from raw data on each request — `lib/balance.ts` already handles this.
- **Don't add `montant: 0` guard only on client:** Server Action MUST validate with Zod `.positive()` — client validation is defense-in-depth only.
- **Don't use `router.push` after Server Action in a Server Component:** Use `revalidatePath` + `redirect` (from `next/navigation`) when needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | Zod `.safeParse()` | Already installed; handles coercion, type inference, field errors |
| Category list | Hardcoded arrays in component | `CATEGORIES` from `lib/categories.ts` | Single source of truth, already defined |
| Currency formatting | Custom formatter | `.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })` | Project convention per CLAUDE.md |
| DB types | Manual type definitions | `InferSelectModel` from Drizzle | Already used in `types/index.ts` |
| Page cache invalidation | Custom cache busting | `revalidatePath` from next/cache | Next.js built-in, required for RSC data refresh |
| Delete confirmation | Custom modal | `AlertDialog` from shadcn | Handles accessibility, keyboard, focus trap |

**Key insight:** The entire data layer (schema, queries, types, balance) is already implemented. Phase 3 is pure UI work on top of an existing foundation.

---

## Common Pitfalls

### Pitfall 1: Forgetting `revalidatePath('/')` after mutations
**What goes wrong:** Expense is inserted/deleted successfully, the `/depenses` page updates, but the dashboard still shows the old balance.
**Why it happens:** Next.js RSC pages cache their data; `revalidatePath` is needed per route.
**How to avoid:** Every Server Action that mutates `depenses` or `ajustements` must call both `revalidatePath('/depenses')` and `revalidatePath('/')`. Ajustements must call `revalidatePath('/ajustements')` and `revalidatePath('/')`.
**Warning signs:** Dashboard shows stale balance after adding a depense.

### Pitfall 2: `<select>` for paye_par on iOS
**What goes wrong:** iOS renders `<select>` with a native picker wheel that can be misaligned with shadcn styling, or the form scrolls unexpectedly.
**Why it happens:** iOS intercepts `<select>` rendering.
**How to avoid:** Use two `<Button>` components with toggle state + `<input type="hidden">` for the actual form value (Pattern 3 above).
**Warning signs:** Layout shifts on focus in Safari mobile viewport.

### Pitfall 3: `montant` comes in as string from FormData
**What goes wrong:** `formData.get('montant')` returns `"42.5"` (string), not a number; DB insert fails or stores wrong type.
**Why it happens:** All FormData values are strings.
**How to avoid:** Use `z.coerce.number()` in Zod schema, which runs `Number(value)` before validation.
**Warning signs:** TypeScript error on `insertDepense` call, or `montant` stored as 0.

### Pitfall 4: `date_depense` stored incorrectly
**What goes wrong:** Date stored as string, but schema expects Unix timestamp integer.
**Why it happens:** HTML `<input type="date">` returns 'YYYY-MM-DD' string.
**How to avoid:** In the Server Action, convert with `Math.floor(new Date(parsed.data.date_depense).getTime() / 1000)` before DB insert. Consistent with the seed.ts pattern already in the project.
**Warning signs:** `date_depense` column shows 0 or NaN in Drizzle Studio.

### Pitfall 5: Missing `mois_id` — inserting to wrong month
**What goes wrong:** Depense is always linked to the current month because `getOrCreateCurrentMois()` is called in the Server Action. If the user is somehow on a historical page in a future phase, this would insert to the wrong month.
**Why it happens:** Phase 3 only handles the current month, so this is not a problem now. Document for Phase 4 awareness.
**How to avoid:** For Phase 3, always use `getOrCreateCurrentMois()` in Server Actions. Phase 4 will need an explicit `mois_id` parameter.

### Pitfall 6: `sous_categorie` not validated against `categorie`
**What goes wrong:** User could submit `categorie: 'alimentation'` with `sous_categorie: 'loyer'` (which belongs to `habitation`), creating inconsistent data.
**Why it happens:** Zod validates each field independently by default.
**How to avoid:** Add a Zod `.refine()` check: `z.string().refine(val => CATEGORIES[data.categorie].sous_categories.includes(val))`. Or rely on the UI cascade (Pattern 4) since the form only offers valid sous_categories for the selected categorie.

---

## Code Examples

### Insert depense query (add to lib/db/queries/depenses.ts)

```typescript
// lib/db/queries/depenses.ts
import { db } from '@/lib/db';
import { depenses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getDepensesByMois(moisId: number) {
  return db.select().from(depenses).where(eq(depenses.mois_id, moisId));
}

export async function insertDepense(data: {
  mois_id: number;
  categorie: string;
  sous_categorie: string;
  paye_par: 'chris' | 'alex';
  montant: number;
  label?: string;
  date_depense: Date; // pass as Date, Drizzle handles timestamp mode
}) {
  return db.insert(depenses).values(data);
}

export async function deleteDepense(id: number) {
  return db.delete(depenses).where(eq(depenses.id, id));
}
```

### Insert ajustement query (add to lib/db/queries/ajustements.ts)

```typescript
// lib/db/queries/ajustements.ts
export async function insertAjustement(data: {
  mois_id: number;
  de: 'chris' | 'alex';
  vers: 'chris' | 'alex';
  montant: number;
  label: string;
  date_ajustement: Date;
}) {
  return db.insert(ajustements).values(data);
}

export async function deleteAjustement(id: number) {
  return db.delete(ajustements).where(eq(ajustements.id, id));
}
```

### Zod schema for ajustement (label is required, direction is explicit)

```typescript
const AjustementSchema = z.object({
  de: z.enum(['chris', 'alex']),
  vers: z.enum(['chris', 'alex']),
  montant: z.coerce.number().positive('Le montant doit être supérieur à 0'),
  label: z.string().min(1, 'Le libellé est obligatoire pour un ajustement'),
  date_ajustement: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).refine(data => data.de !== data.vers, {
  message: 'Le débiteur et le créditeur ne peuvent pas être la même personne',
  path: ['vers'],
});
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| `pages/` router + `getServerSideProps` | App Router RSC + Server Actions | Mutations without API routes; no client fetch |
| `<form onSubmit>` + `fetch()` | `<form action={serverAction}>` | Works without JS; progressive enhancement |
| Separate API route for delete | Inline `<form action={actionDelete}>` | Simpler, fewer files |

**Key note on Next.js 15 Server Actions:** Server Actions with `useActionState` (React 19) provide pending state and return values. However, for this simple app, plain `<form action={action}>` without useActionState is sufficient and simpler — no loading spinner needed for 2-user private app.

---

## Open Questions

1. **Delete confirmation needed?**
   - What we know: Project CLAUDE.md does not specify. Accidental deletes would require re-entry.
   - What's unclear: Is an `AlertDialog` confirmation modal worth the added complexity?
   - Recommendation: Add confirmation for delete (AlertDialog from shadcn) — data loss is worse than extra tap on mobile.

2. **Form placement: inline on page vs floating sheet?**
   - What we know: The app is mobile-first with a fixed bottom nav. A floating sheet (Dialog or drawer from bottom) keeps context and is ergonomic on mobile.
   - What's unclear: shadcn `Drawer` component is not yet installed.
   - Recommendation: Use a `Dialog` (already installable) with bottom-anchored appearance via CSS, or simply inline form at top of page. An inline form above the list is simpler and avoids a new component.

3. **Sorting order for list display?**
   - What we know: `getDepensesByMois` does not specify ORDER BY.
   - What's unclear: Should list show newest first (most recent entry) or by date_depense?
   - Recommendation: Order by `date_depense DESC` in the query — most recent expense at top is natural for daily use.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.58.2 (E2E) + Vitest 4.0.18 (unit) |
| Config file | `playwright.config.ts` (E2E), `vitest.config.ts` (unit) |
| Quick run command | `npx playwright test tests/depenses.spec.ts --project=chromium` |
| Full suite command | `npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEP-01 | Formulaire saisie dépense → apparaît dans la liste | E2E | `npx playwright test tests/depenses.spec.ts -g "DEP-01"` | ❌ Wave 0 |
| DEP-02 | Liste des dépenses du mois courant visible | E2E | `npx playwright test tests/depenses.spec.ts -g "DEP-02"` | ❌ Wave 0 |
| DEP-03 | Suppression d'une dépense → retire de la liste | E2E | `npx playwright test tests/depenses.spec.ts -g "DEP-03"` | ❌ Wave 0 |
| DEP-04 | Montant ≤ 0 rejeté client + serveur | E2E | `npx playwright test tests/depenses.spec.ts -g "DEP-04"` | ❌ Wave 0 |
| DEP-05 | Catégories = contenu de CATEGORIES constant | E2E | `npx playwright test tests/depenses.spec.ts -g "DEP-05"` | ❌ Wave 0 |
| AJU-01 | Formulaire saisie ajustement → apparaît dans la liste | E2E | `npx playwright test tests/ajustements.spec.ts -g "AJU-01"` | ❌ Wave 0 |
| AJU-02 | Liste des ajustements visible | E2E | `npx playwright test tests/ajustements.spec.ts -g "AJU-02"` | ❌ Wave 0 |
| AJU-03 | Suppression d'un ajustement → retire de la liste | E2E | `npx playwright test tests/ajustements.spec.ts -g "AJU-03"` | ❌ Wave 0 |
| AJU-04 | Ajustement intégré dans balance finale dashboard | E2E | `npx playwright test tests/ajustements.spec.ts -g "AJU-04"` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx playwright test tests/depenses.spec.ts --project=chromium` or `tests/ajustements.spec.ts`
- **Per wave merge:** `npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/depenses.spec.ts` — covers DEP-01, DEP-02, DEP-03, DEP-04, DEP-05
- [ ] `tests/ajustements.spec.ts` — covers AJU-01, AJU-02, AJU-03, AJU-04
- [ ] No new framework install needed — Playwright already configured

**Test data pattern:** Use `seedDatabase` from `tests/helpers/seed.ts` (already implemented). Seed a mois for march 2026, add depenses/ajustements in tests via UI actions, verify they appear. For DEP-04: submit with `montant: -1` or `montant: 0`, verify error message displayed.

---

## Sources

### Primary (HIGH confidence)

- Codebase direct inspection — `lib/db/schema.ts`, `lib/categories.ts`, `lib/balance.ts`, `types/index.ts`
- `package.json` — exact installed versions verified
- `playwright.config.ts` and existing test files — test infrastructure confirmed

### Secondary (MEDIUM confidence)

- Next.js 15 App Router Server Actions docs — `revalidatePath` behavior and Server Action conventions consistent with project usage in `app/(app)/page.tsx`
- CLAUDE.md project conventions — iOS select pitfall, formatting conventions, architecture rules

### Tertiary (LOW confidence)

- None — all findings are grounded in direct codebase inspection

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions read directly from `package.json`
- Architecture: HIGH — established patterns from Phase 2 (RSC pages, Server Actions) directly observable in codebase
- Pitfalls: HIGH — `seed.ts` timestamp pattern, CLAUDE.md iOS warning, and Zod coerce pattern all verified against existing code
- Test map: HIGH — `seedDatabase` helper exists and works (Phase 2 tests pass)

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable stack, Next.js 15 / Drizzle / Zod — no churn expected)
