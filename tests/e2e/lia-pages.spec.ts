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

test('covers required-field exception in the published new order form', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('./');
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Novo pedido/ }).click();

  const newOrderPanel = mobile.getByRole('region', { name: 'Novo pedido' });
  await newOrderPanel.getByRole('button', { name: 'Salvar novo pedido offline' }).click();

  await expect(page.getByText('Preencha cliente, telefone e endereço antes de salvar.')).toBeVisible();
  await expect(newOrderPanel.getByLabel('Cliente')).toHaveValue('');
  await expect(newOrderPanel.getByLabel('Produto')).toHaveValue('Molde prótese');
});

test('covers empty sync queue idempotency on published Pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('mock/');
  await expect(page.getByRole('heading', { name: 'Lia mock backend' })).toBeVisible();
  await page.getByRole('button', { name: 'Resetar seed mock' }).click();

  await page.goto('./');
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Sync/ }).click();

  const syncPanel = mobile.getByRole('region', { name: 'Fila de sincronização' });
  await syncPanel.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.getByText(/Sincronização concluída: \d+ enviados, 0 falhas\./)).toBeVisible();
  await expect(syncPanel.getByText('Fila vazia. Mock browser-side está sincronizado.')).toBeVisible();

  await syncPanel.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.getByText('Sincronização concluída: 0 enviados, 0 falhas.')).toBeVisible();
  await expect(syncPanel.getByText('Itens pendentes: 0')).toBeVisible();
});

test('covers signature attachment sync on published Pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('mock/');
  await expect(page.getByRole('heading', { name: 'Lia mock backend' })).toBeVisible();
  await page.getByRole('button', { name: 'Resetar seed mock' }).click();

  await page.goto('./');
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  const signatureCanvas = mobile.getByLabel('Assinatura do cliente');
  await signatureCanvas.scrollIntoViewIfNeeded();

  const box = await signatureCanvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 24, box!.y + 36);
  await page.mouse.down();
  await page.mouse.move(box!.x + 170, box!.y + 92);
  await page.mouse.move(box!.x + 260, box!.y + 50);
  await page.mouse.up();

  await mobile.getByRole('button', { name: 'Salvar assinatura' }).click();
  await expect(page.getByText('Assinatura salva offline para sincronização.')).toBeVisible();
  await expect(mobile.getByText('1 anexos locais deste pedido.')).toBeVisible();

  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Sync/ }).click();
  const syncPanel = mobile.getByRole('region', { name: 'Fila de sincronização' });
  await expect(syncPanel.getByText('upload_attachment')).toBeVisible();
  await syncPanel.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.getByText(/Sincronização concluída: \d+ enviados, 0 falhas\./)).toBeVisible();

  await page.goto('mock/');
  await page.getByRole('button', { name: 'Atualizar export' }).click();
  await expect(page.getByRole('textbox', { name: 'Export JSON do mock backend' })).toHaveValue(/assinatura-1008\.png/);
});

test('covers photo attachment upload sync on published Pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('mock/');
  await expect(page.getByRole('heading', { name: 'Lia mock backend' })).toBeVisible();
  await page.getByRole('button', { name: 'Resetar seed mock' }).click();

  await page.goto('./');
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  const photoInput = mobile.getByLabel('Adicionar foto do molde');
  await photoInput.scrollIntoViewIfNeeded();
  await photoInput.setInputFiles({
    name: 'molde-e2e.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
  });

  await expect(page.getByText('Foto compactada e salva offline para sincronização.')).toBeVisible();
  await expect(mobile.getByText('1 anexos locais deste pedido.')).toBeVisible();

  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Sync/ }).click();
  const syncPanel = mobile.getByRole('region', { name: 'Fila de sincronização' });
  await expect(syncPanel.getByText('upload_attachment')).toBeVisible();
  await syncPanel.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.getByText(/Sincronização concluída: \d+ enviados, 0 falhas\./)).toBeVisible();

  await page.goto('mock/');
  await page.getByRole('button', { name: 'Atualizar export' }).click();
  await expect(page.getByRole('textbox', { name: 'Export JSON do mock backend' })).toHaveValue(/molde-e2e\.webp/);
});

test('covers mock payment intent export on published Pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('mock/');
  await expect(page.getByRole('heading', { name: 'Lia mock backend' })).toBeVisible();
  await page.getByRole('button', { name: 'Resetar seed mock' }).click();

  await page.goto('./');
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  await mobile.getByRole('button', { name: 'Criar pagamento mock' }).click();
  await expect(page.getByText('Intenção de pagamento mock entrou na fila. Pagamento real requer conexão.')).toBeVisible();

  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Sync/ }).click();
  const syncPanel = mobile.getByRole('region', { name: 'Fila de sincronização' });
  await expect(syncPanel.getByText('create_payment_intent')).toBeVisible();
  await syncPanel.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.getByText(/Sincronização concluída: \d+ enviados, 0 falhas\./)).toBeVisible();

  await nav.getByRole('button', { name: /Pedidos/ }).click();
  await expect(mobile.getByText('Mock pendente').first()).toBeVisible();

  await page.goto('mock/');
  await page.getByRole('button', { name: 'Atualizar export' }).click();
  const exportBox = page.getByRole('textbox', { name: 'Export JSON do mock backend' });
  await expect(exportBox).toHaveValue(/"paymentIntents"/);
  await expect(exportBox).toHaveValue(/mock:\/\/lia\/payments\/1008/);
  await expect(exportBox).toHaveValue(/"status": "mock_pending"/);
});

test('covers sync error details for a missing attachment on published Pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('mock/');
  await expect(page.getByRole('heading', { name: 'Lia mock backend' })).toBeVisible();
  await page.getByRole('button', { name: 'Resetar seed mock' }).click();

  await page.goto('./');
  await expect(page.getByRole('region', { name: 'Aplicativo mobile Lia' })).toBeVisible();

  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('lia_local_first');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');
        store.clear();
        store.put({
          id: 'sync_missing_attachment_e2e',
          operation: 'upload_attachment',
          orderId: '1008',
          payload: { attachmentId: 'missing-attachment-e2e' },
          createdAt: new Date().toISOString(),
          attempts: 0
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  });

  await page.reload();
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Sync/ }).click();

  const syncPanel = mobile.getByRole('region', { name: 'Fila de sincronização' });
  await expect(syncPanel.getByText('upload_attachment')).toBeVisible();
  await expect(syncPanel.getByText('Tentativas: 0')).toBeVisible();

  await syncPanel.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.getByText('Sincronização concluída: 0 enviados, 1 falhas.')).toBeVisible();
  await expect(syncPanel.getByText('Erro: Attachment missing-attachment-e2e not found')).toBeVisible();
  await expect(syncPanel.getByText('Tentativas: 1')).toBeVisible();
});

test('covers sync error details for a missing checkpoint order on published Pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('mock/');
  await expect(page.getByRole('heading', { name: 'Lia mock backend' })).toBeVisible();
  await page.getByRole('button', { name: 'Resetar seed mock' }).click();

  await page.goto('./');
  await expect(page.getByRole('region', { name: 'Aplicativo mobile Lia' })).toBeVisible();

  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('lia_local_first');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');
        store.clear();
        store.put({
          id: 'sync_missing_checkpoint_order_e2e',
          operation: 'update_checkpoint',
          orderId: 'missing-order-e2e',
          payload: {
            checkpointKey: 'pickup_checkin',
            input: { completed: true, actor: 'Playwright erro' }
          },
          createdAt: new Date().toISOString(),
          attempts: 0
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  });

  await page.reload();
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Sync/ }).click();

  const syncPanel = mobile.getByRole('region', { name: 'Fila de sincronização' });
  await expect(syncPanel.getByText('update_checkpoint')).toBeVisible();
  await expect(syncPanel.getByText('Pedido: missing-order-e2e')).toBeVisible();
  await expect(syncPanel.getByText('Tentativas: 0')).toBeVisible();

  await syncPanel.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.getByText('Sincronização concluída: 0 enviados, 1 falhas.')).toBeVisible();
  await expect(syncPanel.getByText('Erro: Mock order missing-order-e2e not found')).toBeVisible();
  await expect(syncPanel.getByText('Tentativas: 1')).toBeVisible();
});

test('covers sync error details for a missing update order on published Pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('mock/');
  await expect(page.getByRole('heading', { name: 'Lia mock backend' })).toBeVisible();
  await page.getByRole('button', { name: 'Resetar seed mock' }).click();

  await page.goto('./');
  await expect(page.getByRole('region', { name: 'Aplicativo mobile Lia' })).toBeVisible();

  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('lia_local_first');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');
        store.clear();
        store.put({
          id: 'sync_missing_update_order_e2e',
          operation: 'update_order',
          orderId: 'missing-update-order-e2e',
          payload: { notes: 'Força erro update_order no Pages' },
          createdAt: new Date().toISOString(),
          attempts: 0
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  });

  await page.reload();
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Sync/ }).click();

  const syncPanel = mobile.getByRole('region', { name: 'Fila de sincronização' });
  await expect(syncPanel.getByText('update_order')).toBeVisible();
  await expect(syncPanel.getByText('Pedido: missing-update-order-e2e')).toBeVisible();
  await expect(syncPanel.getByText('Tentativas: 0')).toBeVisible();

  await syncPanel.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.getByText('Sincronização concluída: 0 enviados, 1 falhas.')).toBeVisible();
  await expect(syncPanel.getByText('Erro: Mock order missing-update-order-e2e not found')).toBeVisible();
  await expect(syncPanel.getByText('Tentativas: 1')).toBeVisible();
});

test('covers sync error details for a missing payment order on published Pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('mock/');
  await expect(page.getByRole('heading', { name: 'Lia mock backend' })).toBeVisible();
  await page.getByRole('button', { name: 'Resetar seed mock' }).click();

  await page.goto('./');
  await expect(page.getByRole('region', { name: 'Aplicativo mobile Lia' })).toBeVisible();

  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('lia_local_first');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');
        store.clear();
        store.put({
          id: 'sync_missing_payment_order_e2e',
          operation: 'create_payment_intent',
          orderId: 'missing-payment-order-e2e',
          payload: { orderId: 'missing-payment-order-e2e' },
          createdAt: new Date().toISOString(),
          attempts: 0
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  });

  await page.reload();
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Sync/ }).click();

  const syncPanel = mobile.getByRole('region', { name: 'Fila de sincronização' });
  await expect(syncPanel.getByText('create_payment_intent')).toBeVisible();
  await expect(syncPanel.getByText('Pedido: missing-payment-order-e2e')).toBeVisible();
  await expect(syncPanel.getByText('Tentativas: 0')).toBeVisible();

  await syncPanel.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.getByText('Sincronização concluída: 0 enviados, 1 falhas.')).toBeVisible();
  await expect(syncPanel.getByText('Erro: Mock order missing-payment-order-e2e not found')).toBeVisible();
  await expect(syncPanel.getByText('Tentativas: 1')).toBeVisible();
});

test('covers sync error details for an invalid create order payload on published Pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });

  await page.goto('mock/');
  await expect(page.getByRole('heading', { name: 'Lia mock backend' })).toBeVisible();
  await page.getByRole('button', { name: 'Resetar seed mock' }).click();

  await page.goto('./');
  await expect(page.getByRole('region', { name: 'Aplicativo mobile Lia' })).toBeVisible();

  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('lia_local_first');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('syncQueue', 'readwrite');
        const store = tx.objectStore('syncQueue');
        store.clear();
        store.put({
          id: 'sync_invalid_create_order_e2e',
          operation: 'create_order',
          orderId: 'invalid-create-order-e2e',
          payload: {
            id: 'invalid-create-order-e2e',
            customerName: ' ',
            customerPhone: '',
            deliveryAddress: '',
            product: 'Molde prótese',
            status: 'draft',
            paymentStatus: 'pending',
            pendingSync: true,
            checkpoints: [],
            notes: 'Payload corrompido pelo E2E',
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          attempts: 0
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  });

  await page.reload();
  const mobile = page.getByRole('region', { name: 'Aplicativo mobile Lia' });
  const nav = mobile.getByRole('navigation', { name: 'Navegação principal' });
  await nav.getByRole('button', { name: /Sync/ }).click();

  const syncPanel = mobile.getByRole('region', { name: 'Fila de sincronização' });
  await expect(syncPanel.getByText('create_order')).toBeVisible();
  await expect(syncPanel.getByText('Pedido: invalid-create-order-e2e')).toBeVisible();
  await expect(syncPanel.getByText('Tentativas: 0')).toBeVisible();

  await syncPanel.getByRole('button', { name: 'Sincronizar agora' }).click();
  await expect(page.getByText('Sincronização concluída: 0 enviados, 1 falhas.')).toBeVisible();
  await expect(
    syncPanel.getByText('Erro: Mock order payload missing required fields: customerName, customerPhone, deliveryAddress')
  ).toBeVisible();
  await expect(syncPanel.getByText('Tentativas: 1')).toBeVisible();
});
