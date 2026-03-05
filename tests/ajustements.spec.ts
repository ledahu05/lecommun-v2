import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { seedDatabase } from './helpers/seed';

const MARCH_2026 = {
  mois: [{ annee: 2026, mois: 3, balance_reportee: 0 }],
  ajustements: [
    {
      annee: 2026, mois: 3,
      de: 'chris' as const, vers: 'alex' as const, montant: 100,
      label: 'virement test', date_ajustement: '2026-03-01',
    },
  ],
};

test.describe('AJU-01: Saisir un ajustement via le formulaire', () => {
  test('formulaire accepte direction, montant, libellé obligatoire, date → ajustement apparaît dans la liste', async ({ page }) => {
    test.fixme(true, 'not implemented — will be green after Plan 03');
    await seedDatabase(MARCH_2026);
    await loginAs(page, 'chris');
  });
});

test.describe('AJU-02: Liste des ajustements du mois courant', () => {
  test('la page /ajustements affiche les ajustements du mois courant', async ({ page }) => {
    test.fixme(true, 'not implemented — will be green after Plan 03');
    await seedDatabase(MARCH_2026);
    await loginAs(page, 'chris');
  });
});

test.describe('AJU-03: Supprimer un ajustement', () => {
  test('cliquer sur supprimer retire l\'ajustement de la liste', async ({ page }) => {
    test.fixme(true, 'not implemented — will be green after Plan 03');
    await seedDatabase(MARCH_2026);
    await loginAs(page, 'chris');
  });
});

test.describe('AJU-04: Ajustement intégré dans la balance finale', () => {
  test('après saisie d\'un ajustement, la balance du dashboard reflète le changement', async ({ page }) => {
    test.fixme(true, 'not implemented — will be green after Plan 03');
    await seedDatabase(MARCH_2026);
    await loginAs(page, 'chris');
  });
});
