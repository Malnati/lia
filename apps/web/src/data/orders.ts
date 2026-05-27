import type { DentalOrder, OrderStage } from '../types';

export const workflowStages: OrderStage[] = [
  { key: 'pickup_checkin', label: 'Retirada check-in', completed: true, actor: 'Juan Pérez', timestamp: '24/05/2026 08:30' },
  { key: 'pickup_checkout', label: 'Retirada check-out', completed: true, actor: 'Juan Pérez', timestamp: '24/05/2026 09:15' },
  { key: 'delivery_checkin', label: 'Entrega check-in', completed: true, actor: 'Ana López', timestamp: '25/05/2026 10:40' },
  { key: 'delivery_checkout', label: 'Entrega check-out', completed: false }
];

export const initialOrders: DentalOrder[] = [
  {
    id: '1008',
    type: 'Molde prótese',
    customer: 'Carlos Martínez',
    phone: '+595 981 123456',
    address: 'San Lorenzo, Paraguay',
    paymentStatus: 'paid',
    statusLabel: 'Pago',
    stages: workflowStages,
    notes: 'Instruções especiais na entrega.',
    pendingSync: true,
    updatedAt: '25/05/2026 10:40'
  },
  {
    id: '1007',
    type: 'Molde prótese',
    customer: 'María González',
    phone: '+595 972 000111',
    address: 'Asunción, Paraguay',
    paymentStatus: 'pending',
    statusLabel: 'Em andamento',
    stages: workflowStages.map((stage, index) => ({ ...stage, completed: index === 0 })),
    notes: 'Aguardando retirada check-out.',
    pendingSync: true,
    updatedAt: '25/05/2026 09:10'
  },
  {
    id: '1006',
    type: 'Molde prótese',
    customer: 'Laboratorio Dental Asunción',
    phone: '+595 981 777222',
    address: 'Fernando de la Mora, Paraguay',
    paymentStatus: 'pending',
    statusLabel: 'Aguardando',
    stages: workflowStages.map((stage) => ({ ...stage, completed: false, actor: undefined, timestamp: undefined })),
    notes: 'Pedido criado offline.',
    pendingSync: true,
    updatedAt: '25/05/2026 08:20'
  }
];

export function countPendingSync(orders: DentalOrder[]): number {
  return orders.filter((order) => order.pendingSync).length;
}

export function createDraftOrder(sequence: number): DentalOrder {
  return {
    id: String(sequence),
    type: 'Molde prótese',
    customer: 'Novo cliente',
    phone: '+595 981 000000',
    address: 'Asunción, Paraguay',
    paymentStatus: 'blocked_offline',
    statusLabel: 'Offline pendente',
    stages: workflowStages.map((stage) => ({ ...stage, completed: false, actor: undefined, timestamp: undefined })),
    notes: 'Pedido salvo localmente aguardando sincronização.',
    pendingSync: true,
    updatedAt: new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date())
  };
}
