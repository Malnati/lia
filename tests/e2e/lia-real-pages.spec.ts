import { expect, test } from '@playwright/test';

const publicApps = [
  { name: 'core', url: 'https://core.aneety.com/', text: /Lia Core/i },
  { name: 'pwa', url: 'https://pwa.aneety.com/', text: /Lia PWA/i },
  { name: 'desktop', url: 'https://desktop.aneety.com/', text: /Lia Desktop/i },
  { name: 'dashboard', url: 'https://dashboard.aneety.com/', text: /Lia Dashboard/i }
];

test('validates the published portal and real Worker health on aneety.com', async ({ page, request }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Lia/i);
  await expect(page.locator('body')).toContainText(/Lia/i);
  await expect(page.locator('body')).toContainText(/api\.aneety\.com|Supabase|Cloudflare|Worker/i);

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
    const response = await request.get(app.url);
    await expect(response).toBeOK();
    const body = await response.text();
    expect(body).toMatch(app.text);
  });
}
