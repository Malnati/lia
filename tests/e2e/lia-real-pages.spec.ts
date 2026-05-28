import { expect, test } from '@playwright/test';

const publicApps = [
  { name: 'core', url: 'https://core.aneety.com/', text: /Lia Core/i },
  { name: 'pwa', url: 'https://pwa.aneety.com/', text: /Lia PWA/i },
  { name: 'desktop', url: 'https://desktop.aneety.com/', text: /Lia Desktop/i },
  { name: 'dashboard', url: 'https://dashboard.aneety.com/', text: /Lia Dashboard/i }
];

const forbiddenGitHubRuntime = /github\.io|gh-pages|pages\.github/i;

test('validates the published portal and real Worker health on aneety.com', async ({ page, request }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Lia/i);
  await expect(page.locator('body')).toContainText(/Lia/i);
  await expect(page.locator('body')).toContainText(/api\.aneety\.com|Supabase|Cloudflare|Worker/i);
  await expect(page.getByText('aneety.com', { exact: true })).toBeVisible();
  await expect(page.getByText('Cloudflare Free', { exact: true })).toBeVisible();
  await expect(page.getByText('Supabase Free', { exact: true })).toBeVisible();
  await expect(page.getByText('shadcn/ui', { exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Apps publicados' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Checklist REQ.md' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Próxima cobertura' })).toBeVisible();
  await expect(page.getByText('Worker/Hono', { exact: true })).toBeVisible();
  await expect(page.getByText('Supabase/Postgres', { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: 'Checklist REQ.md' }).click();
  await expect(page.getByText('Supabase/Postgres real com RLS como fonte de dados operacional.')).toBeVisible();
  await page.getByRole('tab', { name: 'Próxima cobertura' }).click();
  await expect(page.getByText('Estados visíveis shadcn para loading, erro, vazio e sucesso.')).toBeVisible();
  await page.getByRole('tab', { name: 'Apps publicados' }).click();
  for (const href of await page.locator('a').evaluateAll((links) => links.map((link) => link.href))) {
    expect(href).not.toMatch(forbiddenGitHubRuntime);
  }

  const health = await request.get('https://api.aneety.com/api/health');
  await expect(health).toBeOK();
  const healthJson = await health.json();
  expect(healthJson.status).toBe('ok');
  expect(healthJson.runtime).toBe('cloudflare-workers');
  expect(healthJson.framework).toBe('hono');

  const dbHealth = await request.get('https://api.aneety.com/api/db/health');
  await expect(dbHealth).toBeOK();
  const dbHealthJson = await dbHealth.json();
  expect(dbHealthJson.status).toBe('ok');
  expect(dbHealthJson.configured).toBe(true);
});

for (const app of publicApps) {
  test(`validates published ${app.name} surface on aneety.com`, async ({ request }) => {
    expect(app.url).not.toMatch(forbiddenGitHubRuntime);
    expect(new URL(app.url).hostname).toMatch(/(^|\.)aneety\.com$/);
    const response = await request.get(app.url);
    await expect(response).toBeOK();
    expect(response.url()).not.toMatch(forbiddenGitHubRuntime);
    expect(new URL(response.url()).hostname).toMatch(/(^|\.)aneety\.com$/);
    const body = await response.text();
    expect(body).toMatch(app.text);
  });
}
