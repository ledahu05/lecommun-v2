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
    test.fixme(true, 'not implemented — will be green after Plan 02');
  });
});

test.describe("HIS-02: Détail d'un mois archivé", () => {
  test('/historique/[id] affiche les dépenses, ajustements et balance du mois archivé', async ({ page }) => {
    test.fixme(true, 'not implemented — will be green after Plan 02');
  });
});
