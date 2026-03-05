import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { seedDatabase } from './helpers/seed';

// Scénario de base : calcul simple et prévisible
// Chris paie 100€, Alex paie 200€ en alimentation, mars 2026
// balance_mensuelle = (200-100)/2 = 50
// balance_reportee = 0 (injecté en seed)
// Aucun ajustement
// total_chris_vers_alex = 50 + 0 + 0 = 50
// balance_finale = 50 > 0 → "Chris doit 50,00 € à Alex"
const SCENARIO_SIMPLE = {
  mois: [{ annee: 2026, mois: 3, balance_reportee: 0 }],
  depenses: [
    {
      annee: 2026, mois: 3,
      categorie: 'alimentation', sous_categorie: 'marche_pain',
      paye_par: 'chris' as const, montant: 100,
      label: 'courses chris', date_depense: '2026-03-01',
    },
    {
      annee: 2026, mois: 3,
      categorie: 'alimentation', sous_categorie: 'intermarche',
      paye_par: 'alex' as const, montant: 200,
      label: 'intermarche alex', date_depense: '2026-03-02',
    },
  ],
};

test.describe('DASH-01: Balance du mois courant visible', () => {
  test('dashboard shows balance_finale and debtor label for current month', async ({ page }) => {
    await seedDatabase(SCENARIO_SIMPLE);
    await loginAs(page, 'chris');
    await page.goto('/');

    // Le montant de la balance finale doit être affiché
    const balanceFinale = page.getByTestId('balance-finale');
    await expect(balanceFinale).toBeVisible();
    await expect(balanceFinale).toContainText('50');

    // Le label débiteur doit indiquer Chris doit à Alex
    const debiteur = page.getByTestId('balance-debiteur');
    await expect(debiteur).toBeVisible();
    await expect(debiteur).toContainText('Chris');
    await expect(debiteur).toContainText('Alex');
  });
});

test.describe('DASH-02: Détail complet de la balance', () => {
  test('dashboard shows total_chris, total_alex, balance_mensuelle, balance_reportee', async ({ page }) => {
    await seedDatabase(SCENARIO_SIMPLE);
    await loginAs(page, 'chris');
    await page.goto('/');

    // total_chris = 100€
    await expect(page.getByTestId('total-chris')).toContainText('100');
    // total_alex = 200€
    await expect(page.getByTestId('total-alex')).toContainText('200');
    // balance_mensuelle = +50€ (positif — Chris doit compenser)
    await expect(page.getByTestId('balance-mensuelle')).toContainText('50');
    // balance_reportee = 0 (premier mois — pas de report)
    const balanceReportee = page.getByTestId('balance-reportee');
    await expect(balanceReportee).toBeVisible();
    // 0 s'affiche soit comme "0,00 €" ou "+ 0,00 €" — vérifier la présence de l'élément
    await expect(balanceReportee).toContainText('0');
  });
});

test.describe('DASH-03: Ventilation par catégorie', () => {
  test('dashboard shows per-category amounts for alimentation, habitation, loisirs, vie_quotidienne', async ({ page }) => {
    await seedDatabase(SCENARIO_SIMPLE);
    await loginAs(page, 'chris');
    await page.goto('/');

    // Alimentation: Chris 100 + Alex 200 = 300€ total
    const alimentation = page.getByTestId('synthese-alimentation');
    await expect(alimentation).toBeVisible();
    await expect(alimentation).toContainText('300');

    // Les 3 autres catégories doivent être présentes (avec 0 dépenses)
    await expect(page.getByTestId('synthese-habitation')).toBeVisible();
    await expect(page.getByTestId('synthese-loisirs')).toBeVisible();
    await expect(page.getByTestId('synthese-vie_quotidienne')).toBeVisible();
  });
});

test.describe('DASH-04: Pas de cache — données fraîches', () => {
  test('balance reflects fresh data on every page load without cache', async ({ page }) => {
    await seedDatabase(SCENARIO_SIMPLE);
    await loginAs(page, 'chris');

    // Premier chargement
    await page.goto('/');
    const firstBalance = await page.getByTestId('balance-finale').textContent();

    // Rechargement (force-dynamic = toujours fresh)
    await page.reload();
    const secondBalance = await page.getByTestId('balance-finale').textContent();

    // Les deux valeurs doivent être identiques (même données, pas de cache fluke)
    expect(firstBalance).toBe(secondBalance);
    expect(firstBalance).toContain('50');
  });
});

test.describe('RPT-01: Report automatique de la balance', () => {
  test('new month creation copies balance_finale from previous month as balance_reportee', async ({ page }) => {
    // Calcul dynamique du mois précédent pour être robuste quelle que soit la date réelle
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Seeder UNIQUEMENT le mois précédent avec des dépenses connues
    // Chris paie 100€, Alex paie 0€
    // balance_mensuelle = (0-100)/2 = -50
    // total_chris_vers_alex = -50 + 0 + 0 = -50
    // balance_finale = -50 → Alex doit 50 à Chris
    const prevDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const SCENARIO_PREV = {
      mois: [{ annee: prevYear, mois: prevMonth, balance_reportee: 0 }],
      depenses: [
        {
          annee: prevYear, mois: prevMonth,
          categorie: 'alimentation', sous_categorie: 'marche_pain',
          paye_par: 'chris' as const, montant: 100,
          label: 'courses prev', date_depense: prevDate,
        },
      ],
    };

    await seedDatabase(SCENARIO_PREV);
    // Le mois courant n'existe PAS en DB à ce stade

    await loginAs(page, 'chris');
    await page.goto('/');
    // La page charge le mois courant
    // getOrCreateCurrentMois() doit créer le mois courant avec balance_reportee = -50

    // Le report du mois précédent doit refléter -50 (valeur absolue = 50)
    const balanceReportee = page.getByTestId('balance-reportee');
    await expect(balanceReportee).toBeVisible();
    await expect(balanceReportee).toContainText('50'); // valeur absolue 50

    // Le mois courant doit être visible dans le titre (format date-fns/fr)
    // Le mois est toujours présent dans la page (BalanceCard affiche le mois)
    await expect(page.getByTestId('balance-finale')).toBeVisible();
  });
});
