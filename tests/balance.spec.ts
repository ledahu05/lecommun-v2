import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { seedDatabase } from './helpers/seed';

// Scénario de base pour les tests DASH-*
// Chris paie 100€, Alex paie 200€
// balance_mensuelle = (200-100)/2 = 50
// balance_reportee = 0 (premier mois)
// Pas d'ajustements
// balance_finale = 50 → Chris doit 50 € à Alex
const SCENARIO_SIMPLE = {
  mois: [{ annee: 2026, mois: 3, balance_reportee: 0 }],
  depenses: [
    { annee: 2026, mois: 3, categorie: 'alimentation', sous_categorie: 'marche_pain', paye_par: 'chris' as const, montant: 100, label: 'courses', date_depense: '2026-03-01' },
    { annee: 2026, mois: 3, categorie: 'alimentation', sous_categorie: 'intermarche', paye_par: 'alex' as const, montant: 200, label: 'intermarche', date_depense: '2026-03-02' },
  ],
};

test.describe('DASH-01: Balance du mois courant visible', () => {
  test('dashboard shows balance_finale and debtor label for current month', async ({ page }) => {
    test.fixme(true, 'Stub — sera implémenté en Wave 2 (Plan 04)');
  });
});

test.describe('DASH-02: Détail complet de la balance', () => {
  test('dashboard shows total_chris, total_alex, balance_mensuelle, balance_reportee', async ({ page }) => {
    test.fixme(true, 'Stub — sera implémenté en Wave 2 (Plan 04)');
  });
});

test.describe('DASH-03: Ventilation par catégorie', () => {
  test('dashboard shows per-category amounts for alimentation, habitation, loisirs, vie_quotidienne', async ({ page }) => {
    test.fixme(true, 'Stub — sera implémenté en Wave 2 (Plan 04)');
  });
});

test.describe('DASH-04: Pas de cache — données fraîches', () => {
  test('balance reflects fresh data on every page load without cache', async ({ page }) => {
    test.fixme(true, 'Stub — sera implémenté en Wave 2 (Plan 04)');
  });
});

test.describe('RPT-01: Report automatique de la balance', () => {
  test('new month creation copies balance_finale from previous month as balance_reportee', async ({ page }) => {
    test.fixme(true, 'Stub — sera implémenté en Wave 2 (Plan 04)');
  });
});
