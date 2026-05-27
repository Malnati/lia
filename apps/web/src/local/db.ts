import Dexie, { type EntityTable } from 'dexie';
import type { Attachment, Order, SyncQueueItem } from '../types';

export type MockBackendState = {
  id: 'state';
  orders: Order[];
  attachments: Array<Omit<Attachment, 'blob'>>;
  paymentIntents: unknown[];
  updatedAt: string;
};

type LiaDatabase = Dexie & {
  orders: EntityTable<Order, 'id'>;
  syncQueue: EntityTable<SyncQueueItem, 'id'>;
  attachments: EntityTable<Attachment, 'id'>;
  mockBackend: EntityTable<MockBackendState, 'id'>;
};

export const liaDb = new Dexie('lia_local_first') as LiaDatabase;

liaDb.version(1).stores({
  orders: 'id, clientId, status, paymentStatus, updatedAt, pendingSync',
  syncQueue: 'id, operation, orderId, createdAt',
  attachments: 'id, orderId, kind, syncStatus, capturedAt',
  mockBackend: 'id, updatedAt'
});
