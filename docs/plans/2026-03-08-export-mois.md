# Export JSON d'un mois — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ajouter un bouton "Exporter" sur chaque MoisCard dans /historique qui telecharge un fichier JSON round-trip compatible avec l'import existant.

**Architecture:** Server Action read-only qui assemble le JSON depuis les 3 tables (mois, depenses, ajustements), puis client component ExportButton qui declenche le download via Blob + URL.createObjectURL.

**Tech Stack:** Next.js Server Actions, Drizzle ORM queries, shadcn/ui Button, lucide-react Download icon

---

### Task 1: Server Action `actionExportMois`

**Files:**
- Modify: `app/(app)/historique/actions.ts` (append after line 120)

**Step 1: Add imports**

Add `getDepensesByMois` and `getAjustementsByMois` to the imports at top of file. Add `getMoisById` — but this function doesn't exist yet, so we'll query inline.

Add at the top of `app/(app)/historique/actions.ts`, alongside existing imports:

```typescript
import { getDepensesByMois } from '@/lib/db/queries/depenses';
import { getAjustementsByMois } from '@/lib/db/queries/ajustements';
```

Also need to query mois by id — add a direct import:

```typescript
import { db } from '@/lib/db';
import { mois as moisTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
```

**Step 2: Write the server action**

Append after `actionDeleteMois` (after line 120):

```typescript
// ── actionExportMois ─────────────────────────────────────────────────────────

export async function actionExportMois(
  moisId: number
): Promise<{ error: string } | { json: string; filename: string }> {
  // Fetch mois
  const rows = await db
    .select()
    .from(moisTable)
    .where(eq(moisTable.id, moisId))
    .limit(1);

  const m = rows[0];
  if (!m) {
    return { error: 'Mois introuvable.' };
  }

  // Fetch depenses and ajustements
  const deps = await getDepensesByMois(moisId);
  const adjs = await getAjustementsByMois(moisId);

  // Format dates as YYYY-MM-DD strings (DB stores as timestamp)
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Assemble round-trip compatible JSON (same structure as import)
  const exportData = {
    mois: [{
      annee: m.annee,
      mois: m.mois,
      balance_reportee: m.balance_reportee,
    }],
    depenses: deps.map((d) => ({
      mois_id: 1,
      categorie: d.categorie,
      sous_categorie: d.sous_categorie,
      paye_par: d.paye_par,
      montant: d.montant,
      label: d.label ?? null,
      date_depense: formatDate(d.date_depense),
    })),
    ajustements: adjs.map((a) => ({
      mois_id: 1,
      de: a.de,
      vers: a.vers,
      montant: a.montant,
      label: a.label,
      date_ajustement: formatDate(a.date_ajustement),
    })),
  };

  const pad = String(m.mois).padStart(2, '0');
  const filename = `lecommun-${m.annee}-${pad}.json`;

  return { json: JSON.stringify(exportData, null, 2), filename };
}
```

**Step 3: Commit**

```bash
git add app/(app)/historique/actions.ts
git commit -m "feat: add actionExportMois server action (read-only)"
```

---

### Task 2: Client component `ExportButton`

**Files:**
- Create: `components/historique/ExportButton.tsx`

**Step 1: Write the component**

```typescript
'use client';

import { useState, useTransition } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { actionExportMois } from '@/app/(app)/historique/actions';

interface Props {
  moisId: number;
}

export function ExportButton({ moisId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    setError(null);
    startTransition(async () => {
      const result = await actionExportMois(moisId);
      if ('error' in result) {
        setError(result.error);
        return;
      }

      // Trigger download via Blob
      const blob = new Blob([result.json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <>
      <Button
        data-testid="export-button"
        variant="ghost"
        size="icon"
        className="min-h-[48px] min-w-[48px]"
        disabled={isPending}
        onClick={handleExport}
        type="button"
        aria-label="Exporter"
      >
        <Download className="w-4 h-4" />
      </Button>
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </>
  );
}
```

**Step 2: Commit**

```bash
git add components/historique/ExportButton.tsx
git commit -m "feat: add ExportButton client component with Blob download"
```

---

### Task 3: Integrate ExportButton into MoisCard

**Files:**
- Modify: `components/historique/MoisCard.tsx`

**Step 1: Add import and render ExportButton**

Add import at top:

```typescript
import { ExportButton } from './ExportButton';
```

Add ExportButton next to DeleteMoisButton in the MoisCard JSX. The current layout is:

```tsx
<div className="flex items-center border-b last:border-b-0">
  <Link ...>...</Link>
  <DeleteMoisButton ... />
</div>
```

Change to:

```tsx
<div className="flex items-center border-b last:border-b-0">
  <Link ...>...</Link>
  <ExportButton moisId={mois.id} />
  <DeleteMoisButton ... />
</div>
```

ExportButton goes before DeleteMoisButton (export is less destructive, appears first).

**Step 2: Verify locally**

Run: `npm run dev`

Navigate to `/historique` — each MoisCard should show a download icon button.
Click it — a `lecommun-YYYY-MM.json` file should download.
Open the file — it should match the import format and be parseable by the existing Zod schema.

**Step 3: Commit**

```bash
git add components/historique/MoisCard.tsx
git commit -m "feat: add export button to MoisCard in /historique"
```

---

### Task 4: E2E test

**Files:**
- Create: `tests/historique-export.spec.ts`

**Step 1: Write the test**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Export mois JSON', () => {
  test('EXPORT-01: bouton export visible sur chaque MoisCard', async ({ page }) => {
    await page.goto('/historique');
    const cards = page.locator('[data-testid="mois-card"]');
    const count = await cards.count();
    // At least one month should exist (current month auto-created)
    expect(count).toBeGreaterThan(0);

    // Each card should have an export button
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).locator('[data-testid="export-button"]')).toBeVisible();
    }
  });

  test('EXPORT-02: export telecharge un JSON round-trip valide', async ({ page }) => {
    await page.goto('/historique');

    // Click export on first card
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="export-button"]').first().click();
    const download = await downloadPromise;

    // Filename should match lecommun-YYYY-MM.json
    expect(download.suggestedFilename()).toMatch(/^lecommun-\d{4}-\d{2}\.json$/);

    // Read and parse the downloaded file
    const content = await (await download.createReadStream()).toArray();
    const json = JSON.parse(Buffer.concat(content).toString('utf-8'));

    // Verify structure matches import format
    expect(json).toHaveProperty('mois');
    expect(json).toHaveProperty('depenses');
    expect(json).toHaveProperty('ajustements');
    expect(json.mois).toHaveLength(1);
    expect(json.mois[0]).toHaveProperty('annee');
    expect(json.mois[0]).toHaveProperty('mois');
    expect(json.mois[0]).toHaveProperty('balance_reportee');

    // Depenses should have correct fields
    if (json.depenses.length > 0) {
      const d = json.depenses[0];
      expect(d).toHaveProperty('mois_id', 1);
      expect(d).toHaveProperty('categorie');
      expect(d).toHaveProperty('sous_categorie');
      expect(d).toHaveProperty('paye_par');
      expect(d).toHaveProperty('montant');
      expect(d).toHaveProperty('date_depense');
      expect(d.date_depense).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }

    // Ajustements should have correct fields
    if (json.ajustements.length > 0) {
      const a = json.ajustements[0];
      expect(a).toHaveProperty('mois_id', 1);
      expect(a).toHaveProperty('de');
      expect(a).toHaveProperty('vers');
      expect(a).toHaveProperty('montant');
      expect(a).toHaveProperty('label');
      expect(a).toHaveProperty('date_ajustement');
      expect(a.date_ajustement).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
```

**Step 2: Run tests**

Run: `npx playwright test tests/historique-export.spec.ts`
Expected: 2 tests pass

**Step 3: Run full test suite to verify no regressions**

Run: `npx playwright test`
Expected: All tests pass (38 existing + 2 new = 40)

**Step 4: Commit**

```bash
git add tests/historique-export.spec.ts
git commit -m "test: add E2E tests for export mois JSON (EXPORT-01, EXPORT-02)"
```
