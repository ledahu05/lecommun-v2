import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { seedDatabase } from './helpers/seed';

const SEED_WITH_DATA = {
  mois: [{ annee: 2025, mois: 11, balance_reportee: 100 }],
  depenses: [
    {
      annee: 2025, mois: 11,
      categorie: 'alimentation', sous_categorie: 'intermarche',
      paye_par: 'chris' as const, montant: 50, label: 'courses',
      date_depense: '2025-11-05',
    },
  ],
  ajustements: [
    {
      annee: 2025, mois: 11,
      de: 'alex' as const, vers: 'chris' as const,
      montant: 30, label: 'Remboursement',
      date_ajustement: '2025-11-10',
    },
  ],
};

test.describe('Export mois JSON', () => {
  test('EXPORT-01: bouton export visible sur chaque MoisCard', async ({ page }) => {
    await seedDatabase(SEED_WITH_DATA);
    await loginAs(page, 'chris');
    await page.goto('/historique');

    const cards = page.getByTestId('mois-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i).getByTestId('export-button')).toBeVisible();
    }
  });

  test('EXPORT-02: export telecharge un JSON round-trip valide', async ({ page }) => {
    await seedDatabase(SEED_WITH_DATA);
    await loginAs(page, 'chris');
    await page.goto('/historique');

    // Click export on first card
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-button').first().click();
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
    expect(json.depenses).toHaveLength(1);
    const d = json.depenses[0];
    expect(d).toHaveProperty('mois_id', 1);
    expect(d).toHaveProperty('categorie', 'alimentation');
    expect(d).toHaveProperty('sous_categorie', 'intermarche');
    expect(d).toHaveProperty('paye_par', 'chris');
    expect(d).toHaveProperty('montant', 50);
    expect(d.date_depense).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Ajustements should have correct fields
    expect(json.ajustements).toHaveLength(1);
    const a = json.ajustements[0];
    expect(a).toHaveProperty('mois_id', 1);
    expect(a).toHaveProperty('de', 'alex');
    expect(a).toHaveProperty('vers', 'chris');
    expect(a).toHaveProperty('montant', 30);
    expect(a).toHaveProperty('label', 'Remboursement');
    expect(a.date_ajustement).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
