import type { Order, OrderCheckpoint } from '../types';

export const workflowStages: OrderCheckpoint[] = [
  { key: 'pickup_checkin', label: 'Retirada check-in', completed: true, actor: 'Juan Pérez', timestamp: '2026-05-24T08:30:00.000Z' },
  { key: 'pickup_checkout', label: 'Retirada check-out', completed: true, actor: 'Juan Pérez', timestamp: '2026-05-24T09:15:00.000Z' },
  { key: 'delivery_checkin', label: 'Entrega check-in', completed: true, actor: 'Ana López', timestamp: '2026-05-25T10:40:00.000Z' },
  { key: 'delivery_checkout', label: 'Entrega check-out', completed: false }
];

export function createDefaultCheckpoints(): OrderCheckpoint[] {
  return [
    { key: 'pickup_checkin', label: 'Retirada check-in', completed: false },
    { key: 'pickup_checkout', label: 'Retirada check-out', completed: false },
    { key: 'delivery_checkin', label: 'Entrega check-in', completed: false },
    { key: 'delivery_checkout', label: 'Entrega check-out', completed: false }
  ];
}

export const initialOrders: Order[] = [
  {
    id: '1008',
    clientId: '1008',
    product: 'Molde prótese',
    customerName: 'Carlos Martínez',
    customerPhone: '+595 981 123456',
    deliveryAddress: 'San Lorenzo, Paraguay',
    status: 'paid',
    paymentStatus: 'paid',
    checkpoints: workflowStages,
    notes: 'Instruções especiais na entrega.',
    pendingSync: true,
    version: 1,
    createdAt: '2026-05-25T10:00:00.000Z',
    updatedAt: '2026-05-25T10:40:00.000Z'
  },
  {
    id: '1007',
    clientId: '1007',
    product: 'Molde prótese',
    customerName: 'María González',
    customerPhone: '+595 972 000111',
    deliveryAddress: 'Asunción, Paraguay',
    status: 'picked_up',
    paymentStatus: 'pending',
    checkpoints: workflowStages.map((stage, index) => ({ ...stage, completed: index === 0 })),
    notes: 'Aguardando retirada check-out.',
    pendingSync: true,
    version: 1,
    createdAt: '2026-05-25T09:00:00.000Z',
    updatedAt: '2026-05-25T09:10:00.000Z'
  },
  {
    id: '1006',
    clientId: '1006',
    product: 'Molde prótese',
    customerName: 'Laboratorio Dental Asunción',
    customerPhone: '+595 981 777222',
    deliveryAddress: 'Fernando de la Mora, Paraguay',
    status: 'draft',
    paymentStatus: 'pending',
    checkpoints: createDefaultCheckpoints(),
    notes: 'Pedido criado offline.',
    pendingSync: true,
    version: 1,
    createdAt: '2026-05-25T08:00:00.000Z',
    updatedAt: '2026-05-25T08:20:00.000Z'
  }
];

export function countPendingSync(orders: Order[]): number {
  return orders.filter((order) => order.pendingSync).length;
}

export function createDraftOrder(sequence: number): Order {
  const now = new Date().toISOString();
  return {
    id: String(sequence),
    clientId: String(sequence),
    product: 'Molde prótese',
    customerName: 'Novo cliente',
    customerPhone: '+595 981 000000',
    deliveryAddress: 'Asunción, Paraguay',
    status: 'draft',
    paymentStatus: 'mock_pending',
    checkpoints: createDefaultCheckpoints(),
    notes: 'Pedido salvo localmente aguardando sincronização.',
    pendingSync: true,
    version: 1,
    createdAt: now,
    updatedAt: now
  };
}
