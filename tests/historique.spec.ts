import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { seedDatabase } from './helpers/seed';

const NOV_2024 = {
  mois: [{ annee: 2024, mois: 11, balance_reportee: 0 }],
  depenses: [
    { annee: 2024, mois: 11, categorie: 'alimentation', sous_categorie: 'marche_pain', paye_par: 'chris' as const, montant: 50, date_depense: '2024-11-01' },
    { annee: 2024, mois: 11, categorie: 'habitation', sous_categorie: 'loyer', paye_par: 'alex' as const, montant: 200, date_depense: '2024-11-05' },
  ],
  ajustements: [
    { annee: 2024, mois: 11, de: 'chris' as const, vers: 'alex' as const, montant: 100, label: 'virement test', date_ajustement: '2024-11-10' },
  ],
};

test.describe('HIS-01: Liste des mois archivés', () => {
  test('la page /historique liste tous les mois avec leur balance finale', async ({ page }) => {
    await seedDatabase(NOV_2024);
    await loginAs(page, 'chris');
    await page.goto('/historique');
    // At least one mois-card is visible
    await expect(page.getByTestId('mois-card').first()).toBeVisible();
    // The card shows the month label
    await expect(page.getByTestId('mois-card').first()).toContainText('novembre 2024');
    // The card contains a link to /historique/[id]
    const href = await page.getByTestId('mois-card').first().locator('a').getAttribute('href');
    expect(href).toMatch(/\/historique\/\d+/);
  });
});

test.describe("HIS-02: Détail d'un mois archivé", () => {
  test('/historique/[id] affiche les dépenses, ajustements et balance du mois archivé', async ({ page }) => {
    await seedDatabase(NOV_2024);
    await loginAs(page, 'chris');
    // Navigate via the list
    await page.goto('/historique');
    await page.getByTestId('mois-card').first().click();
    // Detail page loaded
    await expect(page.getByTestId('historique-detail')).toBeVisible();
    // Balance visible
    await expect(page.getByTestId('balance-finale')).toBeVisible();
    // At least one depense item visible
    await expect(page.getByTestId('historique-depense-item').first()).toBeVisible();
    // At least one ajustement item visible
    await expect(page.getByTestId('historique-ajustement-item').first()).toBeVisible();
    // No delete buttons present
    await expect(page.getByRole('button', { name: /supprimer/i })).toHaveCount(0);
  });
});
