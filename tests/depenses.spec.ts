import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { seedDatabase } from './helpers/seed';

const MARCH_2026 = {
  mois: [{ annee: 2026, mois: 3, balance_reportee: 0 }],
  depenses: [
    {
      annee: 2026, mois: 3,
      categorie: 'alimentation', sous_categorie: 'marche_pain',
      paye_par: 'chris' as const, montant: 50,
      date_depense: '2026-03-01',
    },
  ],
};

test.describe('DEP-01: Saisir une dépense via le formulaire', () => {
  test('formulaire accepte catégorie, sous-catégorie, montant, payeur, date, libellé optionnel → dépense apparaît dans la liste', async ({ page }) => {
    test.fixme(true, 'not implemented — will be green after Plan 02');
    await seedDatabase(MARCH_2026);
    await loginAs(page, 'chris');
  });
});

test.describe('DEP-02: Liste des dépenses du mois courant', () => {
  test('la page /depenses affiche les dépenses du mois courant', async ({ page }) => {
    test.fixme(true, 'not implemented — will be green after Plan 02');
    await seedDatabase(MARCH_2026);
    await loginAs(page, 'chris');
  });
});

test.describe('DEP-03: Supprimer une dépense', () => {
  test('cliquer sur supprimer retire la dépense de la liste', async ({ page }) => {
    test.fixme(true, 'not implemented — will be green after Plan 02');
    await seedDatabase(MARCH_2026);
    await loginAs(page, 'chris');
  });
});

test.describe('DEP-04: Rejeter montant ≤ 0', () => {
  test('soumettre montant=0 ou négatif affiche un message d\'erreur', async ({ page }) => {
    test.fixme(true, 'not implemented — will be green after Plan 02');
    await seedDatabase(MARCH_2026);
    await loginAs(page, 'chris');
  });
});

test.describe('DEP-05: Catégories conformes à lib/categories.ts', () => {
  test('les options de catégorie dans le formulaire correspondent aux 4 catégories du projet', async ({ page }) => {
    test.fixme(true, 'not implemented — will be green after Plan 02');
    await seedDatabase(MARCH_2026);
    await loginAs(page, 'chris');
  });
});
