import type { Page } from '@playwright/test';

export async function loginAs(page: Page, user: 'chris' | 'alex') {
  const password =
    user === 'chris'
      ? (process.env.CHRIS_PASSWORD ?? 'test-chris')
      : (process.env.ALEX_PASSWORD ?? 'test-alex');

  await page.goto('/login');
  await page.getByRole('button', { name: user === 'chris' ? 'Chris' : 'Alex' }).click();
  await page.getByLabel(/mot de passe/i).fill(password);
  await page.getByRole('button', { name: /connexion/i }).click();
  await page.waitForURL('/');
}
