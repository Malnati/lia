import type { Order } from '../types';

export function selectNewestOrder(current: Order, incoming: Order): Order {
  if ((incoming.version ?? 0) > (current.version ?? 0)) return incoming;
  if ((incoming.version ?? 0) < (current.version ?? 0)) return current;
  return new Date(incoming.updatedAt).getTime() >= new Date(current.updatedAt).getTime() ? incoming : current;
}
