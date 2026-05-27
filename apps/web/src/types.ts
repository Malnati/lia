export type OrderStatus =
  | 'pickup_checkin'
  | 'pickup_checkout'
  | 'delivery_checkin'
  | 'delivery_checkout'
  | 'awaiting_payment'
  | 'delivered';

export type PaymentStatus = 'paid' | 'pending' | 'blocked_offline';

export type OrderStage = {
  key: Exclude<OrderStatus, 'awaiting_payment' | 'delivered'>;
  label: string;
  completed: boolean;
  actor?: string;
  timestamp?: string;
};

export type DentalOrder = {
  id: string;
  type: 'Molde prótese';
  customer: string;
  phone: string;
  address: string;
  paymentStatus: PaymentStatus;
  statusLabel: string;
  stages: OrderStage[];
  notes: string;
  pendingSync: boolean;
  updatedAt: string;
};
