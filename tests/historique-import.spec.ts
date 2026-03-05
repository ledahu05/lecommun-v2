import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { seedDatabase } from './helpers/seed';

const FIXTURE_PATH = 'docs/fixtures_janvier_2026.json';

/** Wait for the file input's native change listener to be attached (post-hydration). */
async function waitForFileInputReady(page: import('@playwright/test').Page) {
  await expect(page.locator('input[type="file"][data-ready="true"]')).toBeAttached({ timeout: 10000 });
}

test.describe('IMPORT-01: Upload button visible and functional', () => {
  test('import button is visible on /historique page', async ({ page }) => {
    await seedDatabase({ mois: [] });
    await loginAs(page, 'chris');
    await page.goto('/historique');
    await expect(page.getByTestId('import-button')).toBeVisible();
  });

  test('uploading fixtures_janvier_2026.json imports the month and it appears in the list', async ({ page }) => {
    await seedDatabase({ mois: [] });
    await loginAs(page, 'chris');
    await page.goto('/historique');
    await waitForFileInputReady(page);

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);

    await expect(page.getByTestId('mois-card').filter({ hasText: 'janvier 2026' })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('IMPORT-02: JSON structure validation', () => {
  test('uploading invalid JSON shows an error', async ({ page }) => {
    await seedDatabase({ mois: [] });
    await loginAs(page, 'chris');
    await page.goto('/historique');
    await waitForFileInputReady(page);

    await page.locator('input[type="file"]').setInputFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from('not valid json'),
    });

    await expect(page.getByTestId('import-error')).toBeVisible({ timeout: 5000 });
  });

  test('uploading JSON missing required fields shows an error', async ({ page }) => {
    await seedDatabase({ mois: [] });
    await loginAs(page, 'chris');
    await page.goto('/historique');
    await waitForFileInputReady(page);

    await page.locator('input[type="file"]').setInputFiles({
      name: 'incomplete.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ mois: [], notTheRightFields: true })),
    });

    await expect(page.getByTestId('import-error')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('IMPORT-03: balance_reportee preserved from fixture', () => {
  test('imported month shows correct balance using balance_reportee from file', async ({ page }) => {
    await seedDatabase({ mois: [] });
    await loginAs(page, 'chris');
    await page.goto('/historique');
    await waitForFileInputReady(page);

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);

    // Verify janvier 2026 appears with a non-zero balance (balance_reportee = -656 from fixture is used)
    const janCard = page.getByTestId('mois-card').filter({ hasText: 'janvier 2026' });
    await expect(janCard).toBeVisible({ timeout: 10000 });
    // A balance amount is shown (not "Equilibre"), proving balance_reportee was applied
    await expect(janCard).not.toContainText('Equilibre');
  });
});

test.describe('IMPORT-04: No silent duplicate month', () => {
  test('uploading a month that already exists shows an error and does not duplicate', async ({ page }) => {
    await seedDatabase({ mois: [{ annee: 2026, mois: 1, balance_reportee: 0 }] });
    await loginAs(page, 'chris');
    await page.goto('/historique');
    await waitForFileInputReady(page);

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);

    await expect(page.getByTestId('import-error')).toContainText('existe déjà', { timeout: 5000 });
    // Only one mois card should still be there (not duplicated)
    await expect(page.getByTestId('mois-card')).toHaveCount(1);
  });
});

test.describe('IMPORT-05: Fixture IDs ignored, mois_id remapped', () => {
  test('imported depenses appear on detail page with correct count', async ({ page }) => {
    await seedDatabase({ mois: [] });
    await loginAs(page, 'chris');
    await page.goto('/historique');
    await waitForFileInputReady(page);

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PATH);

    // Navigate to the imported month detail
    await page.getByTestId('mois-card').filter({ hasText: 'janvier 2026' }).locator('a').click();

    // fixtures_janvier_2026.json has 12 depenses
    await expect(page.getByTestId('historique-depense-item')).toHaveCount(12, { timeout: 10000 });
    // and 5 ajustements
    await expect(page.getByTestId('historique-ajustement-item')).toHaveCount(5, { timeout: 10000 });
  });
});
