import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { seedDatabase } from './helpers/seed';

const MARCH_2026_EMPTY = {
  mois: [{ annee: 2026, mois: 3, balance_reportee: 0 }],
};

const MARCH_2026_WITH_AJUSTEMENT = {
  mois: [{ annee: 2026, mois: 3, balance_reportee: 0 }],
  ajustements: [
    {
      annee: 2026,
      mois: 3,
      de: 'chris' as const,
      vers: 'alex' as const,
      montant: 30,
      label: 'virement test',
      date_ajustement: '2026-03-01',
    },
  ],
};

const MARCH_2026_WITH_DEPENSES = {
  mois: [{ annee: 2026, mois: 3, balance_reportee: 0 }],
  depenses: [
    {
      annee: 2026,
      mois: 3,
      categorie: 'alimentation',
      sous_categorie: 'marche_pain',
      paye_par: 'chris' as const,
      montant: 100,
      date_depense: '2026-03-01',
    },
    {
      annee: 2026,
      mois: 3,
      categorie: 'alimentation',
      sous_categorie: 'intermarche',
      paye_par: 'alex' as const,
      montant: 200,
      date_depense: '2026-03-02',
    },
  ],
};

test.describe('AJU-01: Saisir un ajustement via le formulaire', () => {
  test('formulaire accepte direction, montant, libellé obligatoire, date → ajustement apparaît dans la liste', async ({ page }) => {
    await seedDatabase(MARCH_2026_EMPTY);
    await loginAs(page, 'chris');
    await page.goto('/ajustements');

    // Ouvrir la modale d'ajout
    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.getByRole('dialog').waitFor();

    // Chris is selected by default (de=chris, vers=alex implicit)
    await page.getByRole('dialog').getByLabel(/montant/i).fill('75');
    await page.getByRole('dialog').getByLabel(/libellé/i).fill('test ajustement');
    await page.getByRole('dialog').getByRole('button', { name: /ajouter/i }).click();

    // Attendre que le dialog se ferme (soumission reussie)
    await page.getByRole('dialog').waitFor({ state: 'hidden' });

    // After submit the list should appear
    await expect(page.getByTestId('ajustements-list')).toBeVisible();
    await expect(page.getByTestId('ajustements-list')).toContainText('test ajustement');
  });
});

test.describe('AJU-02: Liste des ajustements du mois courant', () => {
  test('la page /ajustements affiche les ajustements du mois courant', async ({ page }) => {
    await seedDatabase(MARCH_2026_WITH_AJUSTEMENT);
    await loginAs(page, 'chris');
    await page.goto('/ajustements');

    await expect(page.getByTestId('ajustements-list')).toBeVisible();
    await expect(page.getByTestId('ajustements-list')).toContainText('virement test');
  });
});

test.describe('AJU-03: Supprimer un ajustement', () => {
  test('cliquer sur supprimer retire l\'ajustement de la liste', async ({ page }) => {
    await seedDatabase(MARCH_2026_WITH_AJUSTEMENT);
    await loginAs(page, 'chris');
    await page.goto('/ajustements');

    await expect(page.getByTestId('ajustement-item')).toBeVisible();
    await page.getByRole('button', { name: /supprimer/i }).click();
    await expect(page.getByTestId('ajustements-vides')).toBeVisible();
  });
});

test.describe('AJU-04: Ajustement intégré dans la balance finale', () => {
  test('après saisie d\'un ajustement, la balance du dashboard reflète le changement', async ({ page }) => {
    // balance_mensuelle = (200-100)/2 = 50 → Chris doit 50€ à Alex (balance_finale = 50)
    await seedDatabase(MARCH_2026_WITH_DEPENSES);
    await loginAs(page, 'chris');

    // Go to /ajustements and add an alex→chris ajustement of 30
    await page.goto('/ajustements');

    // Ouvrir la modale d'ajout
    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.getByRole('dialog').waitFor();

    // Click Alex button (de=alex, vers=chris)
    await page.getByRole('dialog').getByRole('button', { name: /alex/i }).first().click();
    await page.getByRole('dialog').getByLabel(/montant/i).fill('30');
    await page.getByRole('dialog').getByLabel(/libellé/i).fill('virement alex chris');
    await page.getByRole('dialog').getByRole('button', { name: /ajouter/i }).click();

    // Attendre que le dialog se ferme
    await page.getByRole('dialog').waitFor({ state: 'hidden' });

    // After adding ajustement, check dashboard balance
    // balance_finale = total_chris_vers_alex - total_alex_vers_chris
    //                = (50 + 0) - 30 = 20
    await page.goto('/');
    await expect(page.getByTestId('balance-finale')).toContainText('20');
  });
});
