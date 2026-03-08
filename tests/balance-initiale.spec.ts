import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { seedDatabase } from './helpers/seed';

// Dynamic date calculation for current month (same pattern as RPT-01)
const now = new Date();
const currentMonth = now.getMonth() + 1; // 1-12
const currentYear = now.getFullYear();
const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
const currentDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
const prevDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;

// Scenario A: Only current month exists (no previous month in DB)
// Chris paie 100, Alex paie 0, balance_reportee = 0
// balance_mensuelle = (0 - 100) / 2 = -50
// total_chris_vers_alex = -50 + 0 + 0 = -50
// balance_finale = -50 => Alex doit 50 a Chris
const SCENARIO_NO_PREV = {
  mois: [{ annee: currentYear, mois: currentMonth, balance_reportee: 0 }],
  depenses: [
    {
      annee: currentYear, mois: currentMonth,
      categorie: 'alimentation', sous_categorie: 'marche_pain',
      paye_par: 'chris' as const, montant: 100,
      label: 'courses test', date_depense: currentDate,
    },
  ],
};

// Scenario B: Both current and previous month exist
// Previous month: Chris paie 200, Alex paie 0, balance_reportee = 0
// prev balance_mensuelle = (0 - 200) / 2 = -100
// prev balance_finale = -100
// Current month: balance_reportee = -100 (auto-computed from prev)
const SCENARIO_WITH_PREV = {
  mois: [
    { annee: prevYear, mois: prevMonth, balance_reportee: 0 },
    { annee: currentYear, mois: currentMonth, balance_reportee: -100 },
  ],
  depenses: [
    {
      annee: prevYear, mois: prevMonth,
      categorie: 'alimentation', sous_categorie: 'marche_pain',
      paye_par: 'chris' as const, montant: 200,
      label: 'courses prev', date_depense: prevDate,
    },
    {
      annee: currentYear, mois: currentMonth,
      categorie: 'alimentation', sous_categorie: 'marche_pain',
      paye_par: 'chris' as const, montant: 100,
      label: 'courses current', date_depense: currentDate,
    },
  ],
};

test.describe('INIT-01: Editable field shown when no previous month', () => {
  test('dashboard shows initial balance form when no previous month exists', async ({ page }) => {
    await seedDatabase(SCENARIO_NO_PREV);
    await loginAs(page, 'chris');
    await page.goto('/');

    await expect(page.getByTestId('initial-balance-form')).toBeVisible();
    await expect(page.getByTestId('initial-balance-input')).toBeVisible();
    await expect(page.getByTestId('initial-balance-submit')).toBeVisible();
  });
});

test.describe('INIT-02: Signed amount submission', () => {
  test('user can submit positive and negative balance values', async ({ page }) => {
    await seedDatabase(SCENARIO_NO_PREV);
    await loginAs(page, 'chris');
    await page.goto('/');

    const input = page.getByTestId('initial-balance-input');
    const submit = page.getByTestId('initial-balance-submit');

    // Submit positive value
    await input.clear();
    await input.fill('891.50');
    await submit.click();

    // Wait for page to refresh and form to still be visible
    await expect(page.getByTestId('initial-balance-form')).toBeVisible();
    // Input should reflect the submitted value
    await expect(input).toHaveValue('891.5');

    // Submit negative value
    await input.clear();
    await input.fill('-150');
    await submit.click();

    await expect(page.getByTestId('initial-balance-form')).toBeVisible();
    await expect(input).toHaveValue('-150');
  });
});

test.describe('INIT-03: Balance recalculates after submission', () => {
  test('balance_finale updates after changing balance_reportee', async ({ page }) => {
    await seedDatabase(SCENARIO_NO_PREV);
    await loginAs(page, 'chris');
    await page.goto('/');

    // Initial: balance_reportee=0, chris paid 100, alex paid 0
    // balance_mensuelle = -50, balance_finale = -50
    const balanceFinale = page.getByTestId('balance-finale');
    await expect(balanceFinale).toContainText('50');

    // Enter initial balance of 100
    const input = page.getByTestId('initial-balance-input');
    await input.clear();
    await input.fill('100');
    await page.getByTestId('initial-balance-submit').click();

    // After refresh: balance_reportee=100
    // total_chris_vers_alex = -50 + 100 + 0 = 50
    // balance_finale = 50 > 0 => Chris doit a Alex
    await expect(page.getByTestId('initial-balance-form')).toBeVisible();
    // balance_finale should now show 50 (with balance_reportee=100, balance_mensuelle=-50)
    // total_chris_vers_alex = balance_mensuelle + balance_reportee = -50 + 100 = 50
    await expect(balanceFinale).toContainText('50');

    // Verify the debiteur text changed
    await expect(page.getByTestId('balance-debiteur')).toContainText('Chris');
  });
});

test.describe('INIT-04: Field remains editable for re-edit', () => {
  test('form stays visible after submission and allows re-editing', async ({ page }) => {
    await seedDatabase(SCENARIO_NO_PREV);
    await loginAs(page, 'chris');
    await page.goto('/');

    const input = page.getByTestId('initial-balance-input');
    const submit = page.getByTestId('initial-balance-submit');

    // First submission
    await input.clear();
    await input.fill('500');
    await submit.click();

    // Form still visible after refresh
    await expect(page.getByTestId('initial-balance-form')).toBeVisible();
    await expect(input).toHaveValue('500');

    // Re-edit with different value -- reload page to get clean DOM
    await page.reload();
    await expect(page.getByTestId('initial-balance-form')).toBeVisible();
    const input2 = page.getByTestId('initial-balance-input');
    await expect(input2).toHaveValue('500');

    await input2.clear();
    await input2.fill('600');
    await page.getByTestId('initial-balance-submit').click();

    // Verify by reloading
    await page.reload();
    await expect(page.getByTestId('initial-balance-form')).toBeVisible();
    await expect(page.getByTestId('initial-balance-input')).toHaveValue('600');
  });
});

test.describe('INIT-05: Field hidden when previous month exists', () => {
  test('static balance_reportee shown when previous month exists in DB', async ({ page }) => {
    await seedDatabase(SCENARIO_WITH_PREV);
    await loginAs(page, 'chris');
    await page.goto('/');

    // Form should NOT be visible
    await expect(page.getByTestId('initial-balance-form')).toHaveCount(0);

    // Static balance_reportee display should be visible
    await expect(page.getByTestId('balance-reportee')).toBeVisible();
    await expect(page.getByTestId('balance-reportee')).toContainText('100');
  });
});
