import { initialOrders } from '../data/orders';
import { liaDb, type MockBackendState } from '../local/db';
import { selectNewestOrder } from '../sync/conflicts';
import type {
  ApiMode,
  Attachment,
  AttachmentInput,
  CheckpointInput,
  CheckpointKey,
  CreateOrderInput,
  Order,
  PaymentIntent,
  UpdateOrderInput
} from '../types';

export type ApiClient = {
  listOrders(): Promise<Order[]>;
  createOrder(input: CreateOrderInput): Promise<Order>;
  updateOrder(id: string, input: UpdateOrderInput): Promise<Order>;
  updateCheckpoint(orderId: string, checkpointKey: CheckpointKey, input: CheckpointInput): Promise<Order>;
  uploadAttachment(orderId: string, input: AttachmentInput): Promise<Attachment>;
  createPaymentIntent(orderId: string): Promise<PaymentIntent>;
};

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function getMockState(): Promise<MockBackendState> {
  const existing = await liaDb.mockBackend.get('state');
  if (existing) return existing;

  const seeded: MockBackendState = {
    id: 'state',
    orders: initialOrders.map((order) => ({ ...order, pendingSync: false })),
    attachments: [],
    paymentIntents: [],
    updatedAt: nowIso()
  };
  await liaDb.mockBackend.put(seeded);
  return seeded;
}

async function putMockState(state: MockBackendState): Promise<void> {
  await liaDb.mockBackend.put({ ...state, updatedAt: nowIso() });
}

function normalizeOrder(input: CreateOrderInput): Order {
  const timestamp = input.updatedAt ?? nowIso();
  const id = input.id ?? input.clientId ?? newId('order');
  return {
    id,
    clientId: input.clientId ?? id,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    product: input.product ?? 'Molde prótese',
    status: input.status ?? 'draft',
    paymentStatus: input.paymentStatus ?? 'pending',
    pendingSync: false,
    checkpoints: input.checkpoints ?? [],
    notes: input.notes ?? '',
    version: input.version ?? 1,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: timestamp
  };
}

class MockApiClient implements ApiClient {
  async listOrders(): Promise<Order[]> {
    const state = await getMockState();
    return [...state.orders].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const state = await getMockState();
    const incoming = normalizeOrder(input);
    const index = state.orders.findIndex((order) => order.id === incoming.id || order.clientId === incoming.clientId);

    if (index >= 0) {
      state.orders[index] = selectNewestOrder(state.orders[index], incoming);
    } else {
      state.orders.unshift(incoming);
    }

    await putMockState(state);
    return index >= 0 ? state.orders[index] : incoming;
  }

  async updateOrder(id: string, input: UpdateOrderInput): Promise<Order> {
    const state = await getMockState();
    const index = state.orders.findIndex((order) => order.id === id || order.clientId === id);
    if (index < 0) throw new Error(`Mock order ${id} not found`);

    const updated = {
      ...state.orders[index],
      ...input,
      pendingSync: false,
      version: state.orders[index].version + 1,
      updatedAt: nowIso()
    };
    state.orders[index] = updated;
    await putMockState(state);
    return updated;
  }

  async updateCheckpoint(orderId: string, checkpointKey: CheckpointKey, input: CheckpointInput): Promise<Order> {
    const state = await getMockState();
    const index = state.orders.findIndex((order) => order.id === orderId || order.clientId === orderId);
    if (index < 0) throw new Error(`Mock order ${orderId} not found`);

    const order = state.orders[index];
    const checkpoints = order.checkpoints.map((checkpoint) =>
      checkpoint.key === checkpointKey ? { ...checkpoint, ...input } : checkpoint
    );
    const updated = { ...order, checkpoints, pendingSync: false, version: order.version + 1, updatedAt: nowIso() };
    state.orders[index] = updated;
    await putMockState(state);
    return updated;
  }

  async uploadAttachment(orderId: string, input: AttachmentInput): Promise<Attachment> {
    const state = await getMockState();
    const id = input.clientAttachmentId ?? newId('att');
    const attachment: Omit<Attachment, 'blob'> = {
      id,
      clientAttachmentId: input.clientAttachmentId ?? id,
      orderId,
      kind: input.kind,
      filename: input.filename,
      contentType: input.contentType,
      size: input.blob.size,
      capturedAt: input.capturedAt ?? nowIso(),
      syncStatus: 'synced'
    };
    state.attachments = [attachment, ...state.attachments.filter((item) => item.id !== id)];
    await putMockState(state);
    return attachment;
  }

  async createPaymentIntent(orderId: string): Promise<PaymentIntent> {
    const state = await getMockState();
    const index = state.orders.findIndex((order) => order.id === orderId || order.clientId === orderId);
    if (index < 0) throw new Error(`Mock order ${orderId} not found`);

    const intent: PaymentIntent = {
      id: newId('mock_pi'),
      provider: 'mock',
      orderId,
      amount: 0,
      currency: 'PYG',
      status: 'mock_pending',
      checkoutUrl: `mock://lia/payments/${orderId}`,
      createdAt: nowIso()
    };
    state.paymentIntents.unshift(intent);
    state.orders[index] = { ...state.orders[index], paymentStatus: 'mock_pending', version: state.orders[index].version + 1 };
    await putMockState(state);
    return intent;
  }
}


export function getConfiguredApiMode(): ApiMode {
  return 'mock';
}

export function createApiClient(_mode: ApiMode = getConfiguredApiMode()): ApiClient {
  return new MockApiClient();
}

export async function exportMockBackendState(): Promise<MockBackendState> {
  return getMockState();
}

export async function resetMockBackendState(): Promise<MockBackendState> {
  await liaDb.mockBackend.clear();
  return getMockState();
}
