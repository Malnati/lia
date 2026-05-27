import 'fake-indexeddb/auto';
import {
  createOfflineOrder,
  exportMockBackendState,
  getLocalOrders,
  getPendingSyncItems,
  resetLiaLocalData,
  saveLocalAttachment,
  syncPendingItems,
  updateOfflineCheckpoint
} from './local/localStore';
import { createApiClient } from './api/apiClient';
import { selectNewestOrder } from './sync/conflicts';
import type { Order } from './types';

describe('Lia local-first workflow', () => {
  beforeEach(async () => {
    await resetLiaLocalData();
  });

  it('creates an offline order and enqueues it for synchronization', async () => {
    const order = await createOfflineOrder({
      customerName: 'Cliente offline',
      customerPhone: '+595 981 222333',
      deliveryAddress: 'Asunción, Paraguay',
      notes: 'Criado sem conexão'
    });

    const orders = await getLocalOrders();
    const queue = await getPendingSyncItems();

    expect(order.pendingSync).toBe(true);
    expect(orders.some((item) => item.id === order.id)).toBe(true);
    expect(queue).toHaveLength(1);
    expect(queue[0].operation).toBe('create_order');
  });

  it('syncs pending operations with the browser mock backend and clears the queue', async () => {
    const order = await createOfflineOrder({
      customerName: 'Mock sync',
      customerPhone: '+595 981 444555',
      deliveryAddress: 'San Lorenzo, Paraguay'
    });
    await updateOfflineCheckpoint(order.id, 'pickup_checkin', {
      completed: true,
      actor: 'Técnico mock',
      notes: 'Retirada iniciada'
    });

    const result = await syncPendingItems(createApiClient('mock'));
    const queue = await getPendingSyncItems();
    const orders = await getLocalOrders();
    const backendState = await exportMockBackendState();

    expect(result.synced).toBe(2);
    expect(queue).toHaveLength(0);
    expect(orders.find((item) => item.id === order.id)?.pendingSync).toBe(false);
    expect(backendState.orders.some((item) => item.id === order.id)).toBe(true);
  });

  it('chooses the newest order by version and updatedAt for last-write-wins sync', () => {
    const base: Order = {
      id: 'order-1',
      customerName: 'Versão antiga',
      customerPhone: '+595 981 000000',
      deliveryAddress: 'Asunción',
      product: 'Molde prótese',
      status: 'draft',
      paymentStatus: 'pending',
      pendingSync: false,
      notes: '',
      checkpoints: [],
      version: 2,
      updatedAt: '2026-05-27T10:00:00.000Z',
      createdAt: '2026-05-27T09:00:00.000Z'
    };
    const incoming = {
      ...base,
      customerName: 'Versão nova',
      version: 3,
      updatedAt: '2026-05-27T10:05:00.000Z'
    };

    expect(selectNewestOrder(base, incoming).customerName).toBe('Versão nova');
  });

  it('rejects mock payment intents for missing orders', async () => {
    await expect(createApiClient('mock').createPaymentIntent('missing-payment-order')).rejects.toThrow(
      'Mock order missing-payment-order not found'
    );

    const backendState = await exportMockBackendState();
    expect(backendState.paymentIntents).toHaveLength(0);
  });

  it('stores photo and signature blobs locally and enqueues attachment upload', async () => {
    const order = await createOfflineOrder({
      customerName: 'Com anexos',
      customerPhone: '+595 981 777888',
      deliveryAddress: 'Fernando de la Mora'
    });

    await saveLocalAttachment(order.id, {
      kind: 'photo',
      filename: 'molde.webp',
      contentType: 'image/webp',
      blob: new Blob(['photo'], { type: 'image/webp' })
    });
    await saveLocalAttachment(order.id, {
      kind: 'signature',
      filename: 'assinatura.png',
      contentType: 'image/png',
      blob: new Blob(['signature'], { type: 'image/png' })
    });

    const queue = await getPendingSyncItems();

    expect(queue.filter((item) => item.operation === 'upload_attachment')).toHaveLength(2);
  });
});
