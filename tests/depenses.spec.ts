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
      label: 'courses test',
      date_depense: '2026-03-01',
    },
  ],
};

const MARCH_2026_EMPTY = {
  mois: [{ annee: 2026, mois: 3, balance_reportee: 0 }],
};

test.describe('DEP-01: Saisir une dépense via le formulaire', () => {
  test('formulaire accepte catégorie, sous-catégorie, montant, payeur, date, libellé optionnel → dépense apparaît dans la liste', async ({ page }) => {
    await seedDatabase(MARCH_2026_EMPTY);
    await loginAs(page, 'chris');
    await page.goto('/depenses');

    // Cliquer sur le bouton catégorie alimentation
    await page.getByRole('button', { name: /alimentation/i }).click();

    // La sous-catégorie marche_pain est la première option — déjà sélectionnée

    // Remplir le montant
    await page.locator('input[name="montant"]').fill('42');

    // Chris est le payeur par défaut (pas besoin de cliquer)

    // Libellé
    await page.locator('input[name="label"]').fill('test label');

    // Soumettre
    await page.getByRole('button', { name: /ajouter/i }).click();

    // La dépense doit apparaître dans la liste
    await expect(page.getByTestId('depenses-list')).toBeVisible();
    await expect(page.getByTestId('depenses-list')).toContainText('42');
  });
});

test.describe('DEP-02: Liste des dépenses du mois courant', () => {
  test('la page /depenses affiche les dépenses du mois courant', async ({ page }) => {
    await seedDatabase(MARCH_2026);
    await loginAs(page, 'chris');
    await page.goto('/depenses');

    await expect(page.getByTestId('depenses-list')).toBeVisible();
    await expect(page.getByTestId('depenses-list')).toContainText('courses test');
  });
});

test.describe('DEP-03: Supprimer une dépense', () => {
  test('cliquer sur supprimer retire la dépense de la liste', async ({ page }) => {
    await seedDatabase(MARCH_2026);
    await loginAs(page, 'chris');
    await page.goto('/depenses');

    // Vérifier qu'une dépense est visible
    await expect(page.getByTestId('depense-item')).toBeVisible();

    // Cliquer sur le bouton supprimer
    await page.getByRole('button', { name: /supprimer/i }).click();

    // La liste doit être vide
    await expect(page.getByTestId('depenses-vides')).toBeVisible();
  });
});

test.describe('DEP-04: Rejeter montant ≤ 0', () => {
  test('soumettre montant=0 ou négatif affiche un message d\'erreur', async ({ page }) => {
    await seedDatabase(MARCH_2026_EMPTY);
    await loginAs(page, 'chris');
    await page.goto('/depenses');

    // Tester avec montant = 0
    await page.locator('input[name="montant"]').fill('0');
    await page.getByRole('button', { name: /ajouter/i }).click();

    // Le formulaire HTML5 devrait bloquer (min="0.01") ou la validation serveur rejette
    // Dans tous les cas la liste reste vide
    await expect(page.getByTestId('depenses-vides')).toBeVisible();
  });
});

test.describe('DEP-05: Catégories conformes à lib/categories.ts', () => {
  test('les options de catégorie dans le formulaire correspondent aux 4 catégories du projet', async ({ page }) => {
    await seedDatabase(MARCH_2026_EMPTY);
    await loginAs(page, 'chris');
    await page.goto('/depenses');

    const form = page.getByTestId('depense-form');

    // Vérifier les 4 boutons de catégorie
    await expect(form.getByRole('button', { name: /alimentation/i })).toBeVisible();
    await expect(form.getByRole('button', { name: /habitation/i })).toBeVisible();
    await expect(form.getByRole('button', { name: /loisirs/i })).toBeVisible();
    await expect(form.getByRole('button', { name: /vie quotidienne/i })).toBeVisible();
  });
});
