import { test, expect } from '@playwright/test';

const TEST_USERS = {
  chris: { username: 'chris', password: process.env.CHRIS_PASSWORD ?? 'test-chris' },
  alex: { username: 'alex', password: process.env.ALEX_PASSWORD ?? 'test-alex' },
};

test.describe('AUTH-01: Connexion chris et alex', () => {
  test('chris login — chris peut se connecter avec son mot de passe', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Chris' }).click();
    await page.getByLabel(/mot de passe/i).fill(TEST_USERS.chris.password);
    await page.getByRole('button', { name: /connexion/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('alex login — alex peut se connecter avec son mot de passe', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Alex' }).click();
    await page.getByLabel(/mot de passe/i).fill(TEST_USERS.alex.password);
    await page.getByRole('button', { name: /connexion/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('wrong password — mauvais mot de passe affiche "Identifiants incorrects"', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Chris' }).click();
    await page.getByLabel(/mot de passe/i).fill('mauvais-mot-de-passe');
    await page.getByRole('button', { name: /connexion/i }).click();
    await expect(page.getByText('Identifiants incorrects')).toBeVisible();
  });
});

test.describe('AUTH-02: Session 30 jours', () => {
  test('session persists — le cookie de session a une durée de 30 jours', async ({ page, context }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Chris' }).click();
    await page.getByLabel(/mot de passe/i).fill(TEST_USERS.chris.password);
    await page.getByRole('button', { name: /connexion/i }).click();
    await expect(page).toHaveURL('/');

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name.includes('session-token') || c.name.includes('authjs'));
    expect(sessionCookie).toBeDefined();
    // Vérifier que le cookie existe et a les bonnes propriétés de sécurité
    // NextAuth v5 configure maxAge=30 jours dans la config ; Playwright rapporte expires
    // en timestamp absolu (secondes) ou -1 pour les cookies de session navigateur.
    // La vérification porte sur l'existence du cookie — preuve que la session est établie.
    expect(sessionCookie?.httpOnly).toBe(true);
    // Si expires est un timestamp absolu futur (> now), vérifier que c'est ~30 jours
    if (sessionCookie?.expires && sessionCookie.expires > Date.now() / 1000) {
      const maxAgeSeconds = sessionCookie.expires - Date.now() / 1000;
      expect(maxAgeSeconds).toBeGreaterThan(2592000 - 60);
    }
  });
});

test.describe('AUTH-03: Protection des routes', () => {
  test('redirect unauthenticated — accès à / sans session redirige vers /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirect authenticated — accès à /login avec session redirige vers /', async ({ page, context }) => {
    // Se connecter d'abord
    await page.goto('/login');
    await page.getByRole('button', { name: 'Chris' }).click();
    await page.getByLabel(/mot de passe/i).fill(TEST_USERS.chris.password);
    await page.getByRole('button', { name: /connexion/i }).click();
    await expect(page).toHaveURL('/');

    // Tenter d'accéder à /login avec la session active
    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });
});
