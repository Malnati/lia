import { expect, test } from '@playwright/test';

test('covers the published GitHub Pages mock MVP flow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('mock/');
  await expect(page.getByRole('heading', { name: 'Lia mock backend' })).toBeVisible();
  await page.getByRole('button', { name: 'Resetar seed mock' }).click();
  await expect(page.getByRole('textbox', { name: 'Export JSON do mock backend' })).toHaveValue(/Carlos Martínez/);

  await page.goto('./');
  await expect(page).toHaveTitle(/Lia/);
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  await expect(mobile).toBeVisible();
  await expect(mobile.getByRole('heading', { name: 'Pedidos', exact: true })).toBeVisible();

  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Novo pedido/ }).click();
  const newOrderPanel = mobile.getByRole('region', { name: 'Novo pedido' });
  await newOrderPanel.getByLabel('Cliente').fill('Clínica E2E Pages');
  await newOrderPanel.getByLabel('Telefone').fill('+595 981 333444');
  await newOrderPanel.getByLabel('Endereço de entrega').fill('Luque, Paraguay');
  await newOrderPanel.getByLabel('Observações do pedido').fill('Criado pelo Playwright no Pages');
  await newOrderPanel.getByRole('button', { name: 'Salvar novo pedido offline' }).click();
  await expect(page.getByText('Pedido Clínica E2E Pages salvo offline. Sincronize quando houver conexão.')).toBeVisible();

  await mobile.getByRole('button', { name: 'Sincronizar' }).click();
  await expect(page.getByText(/Sincronização concluída: \d+ enviados, 0 falhas\./)).toBeVisible();

  await nav.getByRole('button', { name: /Retirada/ }).click();
  const pickupPanel = mobile.getByRole('region', { name: 'Retirada operacional' });
  await expect(pickupPanel.getByRole('heading', { name: 'Retirada' })).toBeVisible();
  await pickupPanel.getByRole('button', { name: 'Marcar retirada check-in' }).click();
  await expect(page.getByText('Marcar retirada check-in salvo offline.')).toBeVisible();
  await pickupPanel.getByRole('button', { name: 'Marcar retirada check-out' }).click();
  await expect(page.getByText('Marcar retirada check-out salvo offline.')).toBeVisible();

  await nav.getByRole('button', { name: /Entrega/ }).click();
  const deliveryPanel = mobile.getByRole('region', { name: 'Entrega operacional' });
  await expect(deliveryPanel.getByRole('heading', { name: 'Entrega' })).toBeVisible();
  await deliveryPanel.getByRole('button', { name: 'Marcar entrega check-in' }).click();
  await expect(page.getByText('Marcar entrega check-in salvo offline.')).toBeVisible();
  await deliveryPanel.getByRole('button', { name: 'Marcar entrega check-out' }).click();
  await expect(page.getByText('Marcar entrega check-out salvo offline.')).toBeVisible();

  await nav.getByRole('button', { name: /Pedidos/ }).click();
  await mobile.getByRole('button', { name: 'Criar pagamento mock' }).click();
  await expect(page.getByText('Intenção de pagamento mock entrou na fila. Pagamento real requer conexão.')).toBeVisible();

  await nav.getByRole('button', { name: /Sync/ }).click();
  const syncPanel = mobile.getByRole('region', { name: 'Fila de sincronização' });
  await expect(syncPanel.getByText(/Itens pendentes:/)).toBeVisible();
  await syncPanel.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.getByText(/Sincronização concluída: \d+ enviados, 0 falhas\./)).toBeVisible();

  await page.goto('mock/');
  await page.getByRole('button', { name: 'Atualizar export' }).click();
  await expect(page.getByRole('textbox', { name: 'Export JSON do mock backend' })).toHaveValue(/Clínica E2E Pages/);
});

test('covers published white-label and admin production screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('./');
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  await expect(mobile.getByText('Operação Lia')).toBeVisible();
  await expect(mobile.getByText('White-label pronto para outras operações')).toBeVisible();

  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Consultórios/ }).click();
  const clinicsPanel = mobile.getByRole('region', { name: 'Consultórios e moldes' });
  await expect(clinicsPanel.getByText('Consultórios que pedem próteses')).toBeVisible();
  await expect(clinicsPanel.getByText('Moldes em produção')).toBeVisible();

  await nav.getByRole('button', { name: /Produção/ }).click();
  const productionPanel = mobile.getByRole('region', { name: 'Produção de próteses' });
  await expect(productionPanel.getByText('Controle da empresa de próteses')).toBeVisible();
  await expect(productionPanel.getByText('Próteses prontas para entrega')).toBeVisible();
});
