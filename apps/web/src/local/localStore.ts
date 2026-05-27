import { createDefaultCheckpoints, initialOrders } from '../data/orders';
import {
  exportMockBackendState as exportStateFromClient,
  resetMockBackendState,
  type ApiClient
} from '../api/apiClient';
import { liaDb } from './db';
import type {
  Attachment,
  AttachmentInput,
  CheckpointInput,
  CheckpointKey,
  CreateOrderInput,
  Order,
  SyncQueueItem,
  SyncResult,
  UpdateOrderInput
} from '../types';

const syncOperationPriority: Record<SyncQueueItem['operation'], number> = {
  create_order: 0,
  update_order: 1,
  update_checkpoint: 1,
  upload_attachment: 2,
  create_payment_intent: 2
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  if ('crypto' in globalThis && typeof globalThis.crypto.randomUUID === 'function') {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function toOrder(input: CreateOrderInput): Order {
  const timestamp = nowIso();
  const id = input.id ?? input.clientId ?? newId('local_order');
  return {
    id,
    clientId: input.clientId ?? id,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    product: input.product ?? 'Molde prótese',
    status: input.status ?? 'draft',
    paymentStatus: input.paymentStatus ?? 'pending',
    pendingSync: input.pendingSync ?? true,
    checkpoints: input.checkpoints ?? createDefaultCheckpoints(),
    notes: input.notes ?? '',
    version: input.version ?? 1,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp
  };
}

async function enqueue(operation: SyncQueueItem['operation'], orderId: string, payload: unknown): Promise<void> {
  await liaDb.syncQueue.add({
    id: newId('sync'),
    operation,
    orderId,
    payload,
    createdAt: nowIso(),
    attempts: 0
  });
}

export async function ensureLiaLocalData(): Promise<void> {
  const count = await liaDb.orders.count();
  if (count > 0) return;
  await liaDb.orders.bulkPut(initialOrders);
  await liaDb.syncQueue.bulkAdd(
    initialOrders
      .filter((order) => order.pendingSync)
      .map((order) => ({
        id: newId('sync'),
        operation: 'create_order' as const,
        orderId: order.id,
        payload: order,
        createdAt: nowIso(),
        attempts: 0
      }))
  );
  await resetMockBackendState();
}

export async function resetLiaLocalData(): Promise<void> {
  await liaDb.transaction('rw', liaDb.orders, liaDb.syncQueue, liaDb.attachments, liaDb.mockBackend, async () => {
    await liaDb.orders.clear();
    await liaDb.syncQueue.clear();
    await liaDb.attachments.clear();
    await liaDb.mockBackend.clear();
  });
}

export async function getLocalOrders(): Promise<Order[]> {
  await ensureLiaLocalData();
  return liaDb.orders.orderBy('updatedAt').reverse().toArray();
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const queue = await liaDb.syncQueue.orderBy('createdAt').toArray();
  return queue.sort(
    (left, right) =>
      left.createdAt.localeCompare(right.createdAt) ||
      syncOperationPriority[left.operation] - syncOperationPriority[right.operation]
  );
}

export async function getLocalAttachments(orderId?: string): Promise<Attachment[]> {
  if (!orderId) return liaDb.attachments.orderBy('capturedAt').reverse().toArray();
  return liaDb.attachments.where('orderId').equals(orderId).reverse().sortBy('capturedAt');
}

export async function createOfflineOrder(input: CreateOrderInput): Promise<Order> {
  const order = toOrder(input);
  await liaDb.orders.put(order);
  await enqueue('create_order', order.id, order);
  return order;
}

export async function updateOfflineOrder(id: string, input: UpdateOrderInput): Promise<Order> {
  await ensureLiaLocalData();
  const order = await liaDb.orders.get(id);
  if (!order) throw new Error(`Order ${id} not found`);

  const updated: Order = {
    ...order,
    ...input,
    pendingSync: true,
    version: order.version + 1,
    updatedAt: nowIso()
  };
  await liaDb.orders.put(updated);
  await enqueue('update_order', id, input);
  return updated;
}

export async function updateOfflineCheckpoint(
  orderId: string,
  checkpointKey: CheckpointKey,
  input: CheckpointInput
): Promise<Order> {
  await ensureLiaLocalData();
  const order = await liaDb.orders.get(orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);

  const checkpoints = order.checkpoints.map((checkpoint) =>
    checkpoint.key === checkpointKey
      ? { ...checkpoint, ...input, timestamp: input.timestamp ?? (input.completed ? nowIso() : checkpoint.timestamp) }
      : checkpoint
  );
  const updated: Order = {
    ...order,
    checkpoints,
    pendingSync: true,
    version: order.version + 1,
    updatedAt: nowIso()
  };
  await liaDb.orders.put(updated);
  await enqueue('update_checkpoint', orderId, { checkpointKey, input });
  return updated;
}

export async function saveLocalAttachment(orderId: string, input: AttachmentInput): Promise<Attachment> {
  await ensureLiaLocalData();
  const id = input.clientAttachmentId ?? newId('att');
  const attachment: Attachment = {
    id,
    clientAttachmentId: id,
    orderId,
    kind: input.kind,
    filename: input.filename,
    contentType: input.contentType,
    size: input.blob.size,
    capturedAt: input.capturedAt ?? nowIso(),
    syncStatus: 'pending',
    blob: input.blob
  };
  await liaDb.attachments.put(attachment);
  await enqueue('upload_attachment', orderId, { attachmentId: id });
  return attachment;
}

export async function enqueuePaymentIntent(orderId: string): Promise<void> {
  await ensureLiaLocalData();
  await enqueue('create_payment_intent', orderId, { orderId });
}

export async function syncPendingItems(apiClient: ApiClient): Promise<SyncResult> {
  const queue = await getPendingSyncItems();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      if (item.operation === 'create_order') {
        const remote = await apiClient.createOrder(item.payload as CreateOrderInput);
        await liaDb.orders.put({ ...remote, pendingSync: false });
      }
      if (item.operation === 'update_order') {
        const remote = await apiClient.updateOrder(item.orderId, item.payload as UpdateOrderInput);
        await liaDb.orders.put({ ...remote, pendingSync: false });
      }
      if (item.operation === 'update_checkpoint') {
        const payload = item.payload as { checkpointKey: CheckpointKey; input: CheckpointInput };
        const remote = await apiClient.updateCheckpoint(item.orderId, payload.checkpointKey, payload.input);
        await liaDb.orders.put({ ...remote, pendingSync: false });
      }
      if (item.operation === 'upload_attachment') {
        const payload = item.payload as { attachmentId: string };
        const attachment = await liaDb.attachments.get(payload.attachmentId);
        if (!attachment?.blob) throw new Error(`Attachment ${payload.attachmentId} not found`);
        const syncedAttachment = await apiClient.uploadAttachment(item.orderId, {
          kind: attachment.kind,
          filename: attachment.filename,
          contentType: attachment.contentType,
          blob: attachment.blob,
          clientAttachmentId: attachment.clientAttachmentId ?? attachment.id,
          capturedAt: attachment.capturedAt
        });
        await liaDb.attachments.put({ ...attachment, ...syncedAttachment, blob: attachment.blob, syncStatus: 'synced' });
      }
      if (item.operation === 'create_payment_intent') {
        await apiClient.createPaymentIntent(item.orderId);
        const order = await liaDb.orders.get(item.orderId);
        if (order) await liaDb.orders.put({ ...order, paymentStatus: 'mock_pending', pendingSync: false });
      }
      await liaDb.syncQueue.delete(item.id);
      synced += 1;
    } catch (error) {
      failed += 1;
      await liaDb.syncQueue.update(item.id, {
        attempts: item.attempts + 1,
        lastError: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return { synced, failed };
}

export async function exportMockBackendState() {
  return exportStateFromClient();
}
