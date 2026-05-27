import { useMemo, useState } from 'react';
import { createDraftOrder, countPendingSync, initialOrders } from './data/orders';
import type { DentalOrder } from './types';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

type View = 'orders' | 'new' | 'pickup' | 'delivery';

const navItems: Array<{ key: View; label: string; icon: string }> = [
  { key: 'orders', label: 'Pedidos', icon: '▣' },
  { key: 'new', label: 'Novo pedido', icon: '+' },
  { key: 'pickup', label: 'Retirada', icon: '▱' },
  { key: 'delivery', label: 'Entrega', icon: '⌖' }
];

function paymentLabel(order: DentalOrder): string {
  if (order.paymentStatus === 'paid') return 'Pago';
  if (order.paymentStatus === 'blocked_offline') return 'Online';
  return 'Pendente';
}

function App() {
  const [orders, setOrders] = useState<DentalOrder[]>(initialOrders);
  const [selectedId, setSelectedId] = useState(initialOrders[0].id);
  const [view, setView] = useState<View>('orders');
  const [syncMessage, setSyncMessage] = useState('3 itens aguardando sincronização');

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? orders[0],
    [orders, selectedId]
  );
  const pendingSync = countPendingSync(orders);

  function handleCreateOrder() {
    const nextOrder = createDraftOrder(1000 + orders.length + 6);
    setOrders((current) => [nextOrder, ...current]);
    setSelectedId(nextOrder.id);
    setView('new');
    setSyncMessage('Pedido salvo offline. Sincronize quando houver conexão.');
  }

  function handleSync() {
    setOrders((current) => current.map((order) => ({ ...order, pendingSync: false })));
    setSyncMessage('Sincronização concluída com a API quando online.');
  }

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Aplicativo mobile Lia">
        <header className="mobile-header">
          <button className="icon-button" aria-label="Abrir menu">☰</button>
          <strong className="brand">Lia</strong>
          <button className="google-button" aria-label="Entrar com Google">G</button>
        </header>

        <div className="title-row">
          <h1>Pedidos</h1>
          <button className="primary-button" onClick={handleCreateOrder}>Novo pedido +</button>
        </div>

        <aside className="sync-card" aria-live="polite">
          <div>
            <strong>☁ Offline pendente</strong>
            <span>{pendingSync || 0} itens aguardando sincronização</span>
          </div>
          <button onClick={handleSync}>Sincronizar</button>
        </aside>
        <p className="sync-message">{syncMessage}</p>

        <h2>Meus pedidos</h2>
        <div className="order-list">
          {orders.map((order) => (
            <button
              className={`order-card ${order.id === selectedOrder.id ? 'selected' : ''}`}
              key={order.id}
              onClick={() => {
                setSelectedId(order.id);
                setView('orders');
              }}
            >
              <span className="order-id">#{order.id}</span>
              <strong>{order.type}</strong>
              <span>Cliente: {order.customer}</span>
              <small className={`status ${order.paymentStatus}`}>{order.statusLabel}</small>
              <div className="mini-timeline" aria-label={`Progresso do pedido ${order.id}`}>
                {order.stages.map((stage) => (
                  <i key={stage.key} className={stage.completed ? 'done' : ''} aria-label={stage.label} />
                ))}
              </div>
            </button>
          ))}
        </div>

        <nav className="bottom-nav" aria-label="Navegação principal">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={view === item.key ? 'active' : ''}
              onClick={() => setView(item.key)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </section>

      <section className="desktop-preview" aria-label="Painel administrativo Lia">
        <header className="desktop-topbar">
          <strong className="brand">Lia</strong>
          <div className="account-chip"><span>G</span> Conta Google⌄</div>
        </header>
        <div className="desktop-body">
          <aside className="sidebar">
            {['Pedidos', 'Novo pedido', 'Retirada', 'Entrega', 'Pagamentos', 'Sincronização', 'Configurações'].map((item, index) => (
              <button className={index === 0 ? 'active' : ''} key={item}>{item}</button>
            ))}
            <div className="sidebar-sync">
              <strong>☁ Offline pendente</strong>
              <span>{pendingSync} itens aguardando sincronização</span>
              <button onClick={handleSync}>Sincronizar</button>
            </div>
          </aside>

          <article className="order-detail">
            <p className="breadcrumb">Pedidos › #{selectedOrder.id}</p>
            <section className="hero-card">
              <div>
                <h2>#{selectedOrder.id} · {selectedOrder.type}</h2>
                <p>Cliente: {selectedOrder.customer} <span className="status paid">{paymentLabel(selectedOrder)}</span></p>
              </div>
              <button className="primary-button">Ações⌄</button>
            </section>

            <div className="detail-grid">
              <section className="panel">
                <h3>Linha do tempo</h3>
                <ol className="timeline">
                  {selectedOrder.stages.map((stage) => (
                    <li className={stage.completed ? 'complete' : ''} key={stage.key}>
                      <span aria-hidden="true">✓</span>
                      <div>
                        <strong>{stage.label}</strong>
                        <p>{stage.timestamp ?? 'Aguardando'}</p>
                        {stage.actor ? <p>{stage.actor}</p> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="panel details-panel">
                <h3>Detalhes do pedido</h3>
                <dl>
                  <dt>Tipo</dt><dd>{selectedOrder.type}</dd>
                  <dt>Cliente</dt><dd>{selectedOrder.customer}</dd>
                  <dt>Telefone</dt><dd>{selectedOrder.phone}</dd>
                  <dt>Endereço de entrega</dt><dd>{selectedOrder.address}</dd>
                  <dt>Status de pagamento</dt><dd><span className={`status ${selectedOrder.paymentStatus}`}>{paymentLabel(selectedOrder)}</span></dd>
                  <dt>Observações</dt><dd>{selectedOrder.notes}</dd>
                </dl>
                <div className="payment-box">
                  <strong>▣ Pagamento online</strong>
                  <p>Ação disponível apenas com conexão à internet.</p>
                  <button className="primary-button">Ver pagamento</button>
                </div>
              </section>
            </div>
          </article>
        </div>
        <footer className="api-note">API configurável: {apiUrl}</footer>
      </section>
    </main>
  );
}

export default App;
