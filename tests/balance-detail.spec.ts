import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { seedDatabase } from './helpers/seed';

const SCENARIO = {
  mois: [{ annee: 2026, mois: 3, balance_reportee: -290 }],
  depenses: [
    {
      annee: 2026, mois: 3,
      categorie: 'alimentation', sous_categorie: 'intermarche',
      paye_par: 'chris' as const, montant: 40,
      date_depense: '2026-03-08',
    },
    {
      annee: 2026, mois: 3,
      categorie: 'habitation', sous_categorie: 'internet',
      paye_par: 'chris' as const, montant: 33,
      date_depense: '2026-03-08',
    },
    {
      annee: 2026, mois: 3,
      categorie: 'alimentation', sous_categorie: 'marche_pain',
      paye_par: 'alex' as const, montant: 6,
      date_depense: '2026-03-08',
    },
    {
      annee: 2026, mois: 3,
      categorie: 'alimentation', sous_categorie: 'viande',
      paye_par: 'alex' as const, montant: 29,
      date_depense: '2026-03-08',
    },
    {
      annee: 2026, mois: 3,
      categorie: 'alimentation', sous_categorie: 'intermarche',
      paye_par: 'alex' as const, montant: 98,
      date_depense: '2026-03-08',
    },
    {
      annee: 2026, mois: 3,
      categorie: 'habitation', sous_categorie: 'assurance',
      paye_par: 'alex' as const, montant: 31,
      date_depense: '2026-03-08',
    },
    {
      annee: 2026, mois: 3,
      categorie: 'habitation', sous_categorie: 'eau',
      paye_par: 'alex' as const, montant: 115,
      date_depense: '2026-03-08',
    },
  ],
  ajustements: [
    {
      annee: 2026, mois: 3,
      de: 'alex' as const, vers: 'chris' as const,
      montant: 400, label: 'virement',
      date_ajustement: '2026-03-08',
    },
    {
      annee: 2026, mois: 3,
      de: 'chris' as const, vers: 'alex' as const,
      montant: 115, label: 'Appart',
      date_ajustement: '2026-03-08',
    },
  ],
};

// Expected values:
// total_chris = 40 + 33 = 73
// total_alex = 6 + 29 + 98 + 31 + 115 = 279
// balance_mensuelle = (279 - 73) / 2 = 103
// total_chris_vers_alex = 103 + (-290) + 115 = -72
// total_alex_vers_chris = 400
// balance_finale = -72 - 400 = -472
// → Alex doit 472 € à Chris

test.describe('DETAIL-01: Balance detail page shows full calculation', () => {
  test('navigating from dashboard to detail shows all calculation lines', async ({ page }) => {
    await seedDatabase(SCENARIO);
    await loginAs(page, 'chris');
    await page.goto('/');

    // Click the detail link on BalanceCard
    await page.getByTestId('detail-link').click();
    await expect(page.getByTestId('balance-detail')).toBeVisible();

    // Bloc 1: Chris depenses
    const chrisSection = page.getByTestId('detail-chris');
    await expect(chrisSection).toBeVisible();
    await expect(page.getByTestId('detail-chris-total')).toContainText('73');

    // Bloc 2: Alex depenses
    const alexSection = page.getByTestId('detail-alex');
    await expect(alexSection).toBeVisible();
    await expect(page.getByTestId('detail-alex-total')).toContainText('279');

    // Bloc 3: Step-by-step calculation
    await expect(page.getByTestId('detail-balance-mensuelle')).toContainText('103');
    await expect(page.getByTestId('detail-balance-reportee')).toContainText('290');
    await expect(page.getByTestId('detail-balance-finale')).toContainText('472');

    // Conclusion
    await expect(page.getByTestId('detail-conclusion')).toContainText('Alex doit');
    await expect(page.getByTestId('detail-conclusion')).toContainText('Chris');
  });
});
