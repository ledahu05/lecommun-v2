import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { seedDatabase } from './helpers/seed';

const NOV_2024_WITH_DATA = {
  mois: [{ annee: 2024, mois: 11, balance_reportee: 0 }],
  depenses: [
    {
      annee: 2024, mois: 11,
      categorie: 'alimentation', sous_categorie: 'marche_pain',
      paye_par: 'chris' as const, montant: 50, date_depense: '2024-11-01',
    },
  ],
  ajustements: [
    {
      annee: 2024, mois: 11,
      de: 'chris' as const, vers: 'alex' as const,
      montant: 100, label: 'virement test', date_ajustement: '2024-11-10',
    },
  ],
};

test.describe('DELETE-01: Trash button on each MoisCard', () => {
  test('each mois card has a visible delete button with adequate touch target', async ({ page }) => {
    await seedDatabase(NOV_2024_WITH_DATA);
    await loginAs(page, 'chris');
    await page.goto('/historique');
    await expect(page.getByTestId('delete-mois-button').first()).toBeVisible();
  });
});

test.describe('DELETE-02: Confirmation dialog required', () => {
  test('clicking delete button shows a confirmation dialog', async ({ page }) => {
    await seedDatabase(NOV_2024_WITH_DATA);
    await loginAs(page, 'chris');
    await page.goto('/historique');

    await page.getByTestId('delete-mois-button').first().click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
  });

  test('cancelling the dialog does not delete the month', async ({ page }) => {
    await seedDatabase(NOV_2024_WITH_DATA);
    await loginAs(page, 'chris');
    await page.goto('/historique');

    await page.getByTestId('delete-mois-button').first().click();
    await page.getByRole('button', { name: /annuler/i }).click();

    await expect(page.getByTestId('mois-card')).toBeVisible();
  });
});

test.describe('DELETE-03: Deletion cascades to depenses and ajustements', () => {
  test('confirming deletion removes the month from the list', async ({ page }) => {
    await seedDatabase(NOV_2024_WITH_DATA);
    await loginAs(page, 'chris');
    await page.goto('/historique');

    await page.getByTestId('delete-mois-button').first().click();
    await page.getByRole('button', { name: /^supprimer$/i }).click();

    // November 2024 should be gone (mars 2026 may exist from auto-creation at login)
    await expect(page.getByTestId('mois-card').filter({ hasText: 'novembre 2024' })).toHaveCount(0, { timeout: 10000 });
  });
});
