import { expect, type Page, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const portalUrl = normalizeUrl(process.env.PLAYWRIGHT_BASE_URL ?? 'https://aneety.com/');
const apiUrl = normalizeUrl(process.env.LIA_E2E_API_URL ?? 'https://api.aneety.com');
const desktopUrl = normalizeUrl(process.env.LIA_E2E_DESKTOP_URL ?? 'https://desktop.aneety.com');
const pwaUrl = normalizeUrl(process.env.LIA_E2E_PWA_URL ?? 'https://pwa.aneety.com');
const dashboardUrl = normalizeUrl(process.env.LIA_E2E_DASHBOARD_URL ?? 'https://dashboard.aneety.com');
const supabaseUrl = normalizeUrl(process.env.LIA_E2E_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_PROJECT_URL ?? '');
const supabasePublishableKey = process.env.LIA_E2E_SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_PUBLIC_KEY ??
  '';
const requiredEnv = ['LIA_E2E_ADMIN_EMAIL', 'LIA_E2E_ADMIN_PASSWORD'] as const;
const realCrossApp = process.env.LIA_E2E_ENABLED === '1' ? test : test.skip;

realCrossApp('portal orquestra fluxo publicado entre API, desktop, PWA e dashboard', async ({ page }) => {
  test.setTimeout(120_000);
  assertConfig();

  const runId = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const customerName = `Portal Cross App E2E ${runId}`;
  const attachmentFilename = `portal-cross-app-${runId}.png`;
  const token = await signInForApi();

  const created = await jsonApiFetch<OrderResponse>('/api/orders', {
    method: 'POST',
    token,
    expectedStatus: 201,
    body: {
      clientId: 'lia-portal-cross-app-e2e',
      customerName,
      customerPhone: '+595 21 555 002',
      deliveryAddress: 'Portal cross-app E2E, Asunción',
      product: 'Molde prótese Portal Cross App E2E',
      notes: `Criado pelo E2E cross-app do portal ${runId}`
    }
  });

  await page.goto(withE2EParam(portalUrl, runId));
  await expect(page.getByRole('tab', { name: 'Apps publicados' })).toBeVisible();
  await expect(page.locator('a[href="https://api.aneety.com/api/health"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://desktop.aneety.com/"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://pwa.aneety.com/"]').first()).toBeVisible();
  await expect(page.locator('a[href="https://dashboard.aneety.com/"]').first()).toBeVisible();

  await page.goto(withE2EParam(desktopUrl, runId));
  await expect(page.getByRole('heading', { name: 'Operação desktop real' })).toBeVisible();
  await signInVisibleForm(page);
  await expect(page.getByText('Sessão ativa', { exact: true })).toBeVisible();
  await expect(page.getByRole('table').getByText(customerName, { exact: true })).toBeVisible({ timeout: 30_000 });

  await page.getByRole('button', { name: `Abrir ${customerName}` }).click();
  await page.getByRole('tab', { name: 'Checkpoints' }).click();
  await page.getByLabel('Responsável').fill('Codex Portal Cross App E2E');
  await page.getByLabel('Notas').fill('Checkpoint concluído no desktop publicado via portal cross-app.');
  await page.getByRole('button', { name: 'Concluir Produção de molde conclusão' }).click();
  await expect(page.getByText('Checkpoint Produção de molde conclusão concluído na API/Postgres.')).toBeVisible({ timeout: 30_000 });

  await page.getByRole('tab', { name: 'Anexos' }).click();
  await page.setInputFiles('#desktopAttachment', {
    name: attachmentFilename,
    mimeType: 'image/png',
    buffer: Buffer.from(onePixelPng())
  });
  await page.getByRole('button', { name: 'Enviar anexo' }).click();
  await expect(page.getByText(`Anexo ${attachmentFilename} enviado para Supabase Storage via Worker.`)).toBeVisible({ timeout: 30_000 });

  await page.goto(withE2EParam(pwaUrl, runId));
  await signInVisibleForm(page);
  await expect(page.getByText('Sessão ativa', { exact: true })).toBeVisible();
  for (const tabName of ['Pedidos', 'Novo', 'Retirada', 'Entrega', 'Anexos', 'Pagamento', 'Sync', 'Perfil']) {
    await expect(page.getByRole('tab', { name: tabName })).toBeVisible();
  }

  await page.goto(withE2EParam(dashboardUrl, runId));
  await signInVisibleForm(page);
  await expect(page.getByText('CRUD de usuários')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Perfis de acesso' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Usuários' })).toBeVisible();

  const orders = await jsonApiFetch<OrderResponse[]>('/api/orders', { token });
  const syncedOrder = orders.find((order) => order.id === created.id || order.customerName === customerName);
  expect(syncedOrder?.id).toBe(created.id);
  expect(syncedOrder?.checkpoints.some((checkpoint) =>
    checkpoint.key === 'model_production_done' &&
    checkpoint.completed === true &&
    checkpoint.actor === 'Codex Portal Cross App E2E'
  )).toBe(true);

  const attachments = await jsonApiFetch<AttachmentResponse[]>(`/api/orders/${created.id}/attachments`, { token });
  expect(attachments.some((attachment) => attachment.filename === attachmentFilename && attachment.contentType === 'image/png')).toBe(true);
});

type ApiFetchOptions = {
  method?: string;
  token?: string;
  expectedStatus?: number;
  body?: unknown;
};

type OrderResponse = {
  id: string;
  customerName?: string;
  status: string;
  checkpoints: Array<{ key: string; completed: boolean; actor?: string }>;
};

type AttachmentResponse = {
  filename: string;
  contentType: string;
};

function assertConfig(): void {
  const missing = [
    ...requiredEnv.filter((name) => !process.env[name]?.trim()),
    !supabaseUrl ? 'VITE_SUPABASE_URL' : '',
    !supabasePublishableKey ? 'VITE_SUPABASE_PUBLISHABLE_KEY' : ''
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing E2E env vars: ${missing.join(', ')}`);
  }
}

async function signInForApi(): Promise<string> {
  const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.LIA_E2E_ADMIN_EMAIL!,
    password: process.env.LIA_E2E_ADMIN_PASSWORD!
  });
  if (error || !data.session?.access_token) {
    throw new Error(error?.message ?? 'Supabase Auth não retornou token');
  }
  return data.session.access_token;
}

async function signInVisibleForm(page: Page): Promise<void> {
  const email = page.getByLabel('E-mail');
  if (await email.isVisible().catch(() => false)) {
    await email.fill(process.env.LIA_E2E_ADMIN_EMAIL!);
    await page.getByLabel('Senha').fill(process.env.LIA_E2E_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: 'Entrar' }).click();
  }
}

async function jsonApiFetch<T>(path: string, options: ApiFetchOptions): Promise<T> {
  const response = await apiFetch(path, options);
  return await response.json() as T;
}

async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const headers = new Headers();
  if (options.token) headers.set('authorization', `Bearer ${options.token}`);
  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers.set('content-type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${apiUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body
  });

  expectApiStatus(response, options.expectedStatus ?? 200, path);
  return response;
}

function expectApiStatus(response: Response, expectedStatus: number, path: string): void {
  if (response.status !== expectedStatus) {
    throw new Error(`${path} returned ${response.status}; expected ${expectedStatus}`);
  }
}

function withE2EParam(base: string, runId: string): string {
  const url = new URL(base);
  url.searchParams.set('e2e', runId);
  return url.toString();
}

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function onePixelPng(): number[] {
  return [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a,
    0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05,
    0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
    0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ];
}
