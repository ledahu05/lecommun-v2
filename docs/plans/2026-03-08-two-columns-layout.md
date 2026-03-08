# Two-Column Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Display expenses and adjustments in a 2-column layout (Chris | Alex) with per-person totals in headers, on `/depenses`, `/ajustements`, and `/historique/[id]`.

**Architecture:** Create two shared wrapper components (`TwoColumnDepenses` and `TwoColumnAjustements`) that split items by person and render them in a CSS grid. Each column has a header with name + total. Existing item components are simplified for narrow columns.

**Tech Stack:** React Server Components, Tailwind CSS grid, TypeScript

---

### Task 1: Create TwoColumnDepenses component

**Files:**
- Create: `components/depenses/TwoColumnDepenses.tsx`

**Step 1: Create the component**

```tsx
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { actionDeleteDepense } from '@/app/(app)/depenses/actions';
import type { Depense } from '@/types';

interface TwoColumnDepensesProps {
  depenses: Depense[];
  readOnly?: boolean;
}

export default function TwoColumnDepenses({ depenses, readOnly = false }: TwoColumnDepensesProps) {
  const chrisDepenses = depenses.filter((d) => d.paye_par === 'chris');
  const alexDepenses = depenses.filter((d) => d.paye_par === 'alex');

  const totalChris = chrisDepenses.reduce((sum, d) => sum + d.montant, 0);
  const totalAlex = alexDepenses.reduce((sum, d) => sum + d.montant, 0);

  const formatMontant = (n: number) =>
    n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  if (depenses.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8 text-base" data-testid="depenses-vides">
        Aucune dépense ce mois-ci.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2" data-testid="depenses-list">
      {/* Headers */}
      <div className="font-semibold text-sm py-2 border-b">
        Chris — {formatMontant(totalChris)}
      </div>
      <div className="font-semibold text-sm py-2 border-b">
        Alex — {formatMontant(totalAlex)}
      </div>

      {/* Columns */}
      <div>
        {chrisDepenses.map((d) => (
          <DepenseColumnItem key={d.id} depense={d} readOnly={readOnly} />
        ))}
      </div>
      <div>
        {alexDepenses.map((d) => (
          <DepenseColumnItem key={d.id} depense={d} readOnly={readOnly} />
        ))}
      </div>
    </div>
  );
}

function DepenseColumnItem({ depense, readOnly }: { depense: Depense; readOnly: boolean }) {
  const displayLabel = depense.label ?? depense.sous_categorie;
  const montantFormate = depense.montant.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });

  return (
    <div
      data-testid="depense-item"
      className="min-h-[48px] py-2 border-b last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-base truncate flex-1 min-w-0">{displayLabel}</p>
        {!readOnly && (
          <form action={actionDeleteDepense}>
            <input type="hidden" name="id" value={depense.id} />
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              className="min-h-[48px] min-w-[48px] -mr-3"
              aria-label="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </form>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{montantFormate}</p>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/depenses/TwoColumnDepenses.tsx
git commit -m "feat: add TwoColumnDepenses component"
```

---

### Task 2: Create TwoColumnAjustements component

**Files:**
- Create: `components/ajustements/TwoColumnAjustements.tsx`

**Step 1: Create the component**

```tsx
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { actionDeleteAjustement } from '@/app/(app)/ajustements/actions';
import type { Ajustement } from '@/types';

interface TwoColumnAjustementsProps {
  ajustements: Ajustement[];
  readOnly?: boolean;
}

interface AjustementColonne {
  ajustement: Ajustement;
  role: 'donneur' | 'receveur';
}

export default function TwoColumnAjustements({ ajustements, readOnly = false }: TwoColumnAjustementsProps) {
  const chrisItems: AjustementColonne[] = ajustements
    .filter((a) => a.de === 'chris' || a.vers === 'chris')
    .map((a) => ({ ajustement: a, role: a.de === 'chris' ? 'donneur' : 'receveur' }));

  const alexItems: AjustementColonne[] = ajustements
    .filter((a) => a.de === 'alex' || a.vers === 'alex')
    .map((a) => ({ ajustement: a, role: a.de === 'alex' ? 'donneur' : 'receveur' }));

  const totalChris = chrisItems
    .filter((i) => i.role === 'donneur')
    .reduce((sum, i) => sum + i.ajustement.montant, 0);
  const totalAlex = alexItems
    .filter((i) => i.role === 'donneur')
    .reduce((sum, i) => sum + i.ajustement.montant, 0);

  const formatMontant = (n: number) =>
    n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  if (ajustements.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8" data-testid="ajustements-vides">
        Aucun ajustement ce mois-ci.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2" data-testid="ajustements-list">
      {/* Headers */}
      <div className="font-semibold text-sm py-2 border-b">
        Chris — {formatMontant(totalChris)}
      </div>
      <div className="font-semibold text-sm py-2 border-b">
        Alex — {formatMontant(totalAlex)}
      </div>

      {/* Columns */}
      <div>
        {chrisItems.map((item) => (
          <AjustementColumnItem
            key={`chris-${item.ajustement.id}`}
            item={item}
            readOnly={readOnly}
          />
        ))}
      </div>
      <div>
        {alexItems.map((item) => (
          <AjustementColumnItem
            key={`alex-${item.ajustement.id}`}
            item={item}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

function AjustementColumnItem({ item, readOnly }: { item: AjustementColonne; readOnly: boolean }) {
  const { ajustement, role } = item;
  const montantFormate = ajustement.montant.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
  const showDelete = !readOnly && role === 'donneur';

  return (
    <div
      data-testid="ajustement-item"
      className="min-h-[48px] py-2 border-b last:border-b-0"
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-base truncate flex-1 min-w-0">{ajustement.label}</p>
        {showDelete && (
          <form action={actionDeleteAjustement}>
            <input type="hidden" name="id" value={ajustement.id} />
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              className="min-h-[48px] min-w-[48px] -mr-3"
              aria-label="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </form>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {role === 'donneur' ? `donne ${montantFormate}` : `reçoit ${montantFormate}`}
      </p>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/ajustements/TwoColumnAjustements.tsx
git commit -m "feat: add TwoColumnAjustements component"
```

---

### Task 3: Wire up /depenses page

**Files:**
- Modify: `app/(app)/depenses/page.tsx`

**Step 1: Replace DepensesList with TwoColumnDepenses**

Replace the import and usage:

```tsx
// Change import from:
import DepensesList from '@/components/depenses/DepensesList';
// To:
import TwoColumnDepenses from '@/components/depenses/TwoColumnDepenses';

// Change usage from:
<DepensesList depenses={depensesList} />
// To:
<TwoColumnDepenses depenses={depensesList} />
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/\(app\)/depenses/page.tsx
git commit -m "feat: use two-column layout on /depenses page"
```

---

### Task 4: Wire up /ajustements page

**Files:**
- Modify: `app/(app)/ajustements/page.tsx`

**Step 1: Replace AjustementsList with TwoColumnAjustements**

```tsx
// Change import from:
import AjustementsList from '@/components/ajustements/AjustementsList';
// To:
import TwoColumnAjustements from '@/components/ajustements/TwoColumnAjustements';

// Change usage from:
<AjustementsList ajustements={ajustementsList} />
// To:
<TwoColumnAjustements ajustements={ajustementsList} />
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/\(app\)/ajustements/page.tsx
git commit -m "feat: use two-column layout on /ajustements page"
```

---

### Task 5: Wire up /historique/[id] page

**Files:**
- Modify: `app/(app)/historique/[id]/page.tsx`

**Step 1: Replace inline lists with two-column components**

Replace both the depenses and ajustements sections. Remove the imports of `HistoriqueDepenseItem` and `HistoriqueAjustementItem`, and import the new components instead:

```tsx
// Remove these imports:
import { HistoriqueDepenseItem } from '@/components/historique/HistoriqueDepenseItem';
import { HistoriqueAjustementItem } from '@/components/historique/HistoriqueAjustementItem';

// Add these imports:
import TwoColumnDepenses from '@/components/depenses/TwoColumnDepenses';
import TwoColumnAjustements from '@/components/ajustements/TwoColumnAjustements';
```

Replace the depenses section (lines 42-53):
```tsx
<section>
  <h2 className="text-lg font-semibold mb-2">Dépenses</h2>
  <TwoColumnDepenses depenses={depensesList} readOnly />
</section>
```

Replace the ajustements section (lines 55-66):
```tsx
<section>
  <h2 className="text-lg font-semibold mb-2">Ajustements</h2>
  <TwoColumnAjustements ajustements={ajustementsList} readOnly />
</section>
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/\(app\)/historique/\[id\]/page.tsx
git commit -m "feat: use two-column layout on /historique/[id] page"
```

---

### Task 6: Visual check and final commit

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Manually verify on mobile viewport (390x844)**

Check these pages:
- `/depenses` — 2 columns with delete buttons, correct totals
- `/ajustements` — 2 columns, delete only on donneur side, correct totals
- `/historique/[id]` — 2 columns, no delete buttons
- `/historique/[id]/detail` — unchanged (single column)

**Step 3: Run existing E2E tests**

Run: `npx playwright test`
Expected: All tests pass (may need minor selector updates if tests rely on old layout structure)

**Step 4: Fix any test selector issues if needed and commit**

```bash
git add -A
git commit -m "fix: update E2E selectors for two-column layout"
```
