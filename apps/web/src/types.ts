export const orderStatuses = [
  'draft',
  'awaiting_payment',
  'paid',
  'pickup_scheduled',
  'picked_up',
  'in_production',
  'ready_for_delivery',
  'delivery_scheduled',
  'delivered',
  'cancelled'
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'mock_pending';

export const checkpointKeys = [
  'pickup_checkin',
  'pickup_checkout',
  'delivery_checkin',
  'delivery_checkout'
] as const;

export type CheckpointKey = (typeof checkpointKeys)[number];

export type OrderCheckpoint = {
  key: CheckpointKey;
  label: string;
  completed: boolean;
  actor?: string;
  timestamp?: string;
  notes?: string;
};

export type Order = {
  id: string;
  clientId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  product: 'Molde prótese' | string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  pendingSync: boolean;
  checkpoints: OrderCheckpoint[];
  notes: string;
  version: number;
  updatedAt: string;
  createdAt: string;
};

export type CreateOrderInput = {
  id?: string;
  clientId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  product?: 'Molde prótese' | string;
  notes?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  pendingSync?: boolean;
  checkpoints?: OrderCheckpoint[];
  version?: number;
  updatedAt?: string;
  createdAt?: string;
};

export type UpdateOrderInput = Partial<
  Pick<
    Order,
    | 'customerName'
    | 'customerPhone'
    | 'deliveryAddress'
    | 'product'
    | 'status'
    | 'paymentStatus'
    | 'pendingSync'
    | 'notes'
  >
>;

export type CheckpointInput = Partial<Pick<OrderCheckpoint, 'completed' | 'actor' | 'timestamp' | 'notes'>>;

export type AttachmentKind = 'photo' | 'signature';

export type Attachment = {
  id: string;
  orderId: string;
  kind: AttachmentKind;
  filename: string;
  contentType: string;
  size: number;
  capturedAt: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  clientAttachmentId?: string;
  blob?: Blob;
};

export type AttachmentInput = {
  kind: AttachmentKind;
  filename: string;
  contentType: string;
  blob: Blob;
  clientAttachmentId?: string;
  capturedAt?: string;
};

export type PaymentIntent = {
  id: string;
  provider: 'mock';
  orderId: string;
  amount: number;
  currency: 'PYG' | 'USD';
  status: 'mock_pending' | 'paid' | 'failed';
  checkoutUrl: string;
  createdAt: string;
};

export type SyncOperation =
  | 'create_order'
  | 'update_order'
  | 'update_checkpoint'
  | 'upload_attachment'
  | 'create_payment_intent';

export type SyncQueueItem = {
  id: string;
  operation: SyncOperation;
  orderId: string;
  payload: unknown;
  createdAt: string;
  attempts: number;
  lastError?: string;
};

export type ApiMode = 'mock';

export type SyncResult = {
  synced: number;
  failed: number;
};

export type DentalOrder = Order;
export type OrderStage = OrderCheckpoint;
