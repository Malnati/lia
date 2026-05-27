import { useEffect, useMemo, useState } from 'react';
import { createApiClient, exportMockBackendState, getConfiguredApiMode, resetMockBackendState } from './api/apiClient';
import { SignaturePad } from './components/SignaturePad';
import { countPendingSync, initialOrders } from './data/orders';
import {
  createOfflineOrder,
  enqueuePaymentIntent,
  ensureLiaLocalData,
  getLocalAttachments,
  getLocalOrders,
  getPendingSyncItems,
  saveLocalAttachment,
  syncPendingItems,
  updateOfflineCheckpoint,
  updateOfflineOrder
} from './local/localStore';
import { compressImage } from './media/imageCompression';
import type { ApiMode, Attachment, CheckpointKey, Order, SyncQueueItem } from './types';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const apiMode = getConfiguredApiMode();

type View = 'orders' | 'new' | 'pickup' | 'delivery' | 'sync';

const navItems: Array<{ key: View; label: string; icon: string }> = [
  { key: 'orders', label: 'Pedidos', icon: '▣' },
  { key: 'new', label: 'Novo pedido', icon: '+' },
  { key: 'pickup', label: 'Retirada', icon: '▱' },
  { key: 'delivery', label: 'Entrega', icon: '⌖' },
  { key: 'sync', label: 'Sync', icon: '↻' }
];

function paymentLabel(order: Order): string {
  if (order.paymentStatus === 'paid') return 'Pago';
  if (order.paymentStatus === 'failed') return 'Falhou';
  if (order.paymentStatus === 'mock_pending') return 'Mock pendente';
  return 'Pendente';
}

function statusLabel(order: Order): string {
  if (order.pendingSync) return 'Offline pendente';
  if (order.status === 'delivered') return 'Entregue';
  if (order.status === 'paid') return 'Pago';
  if (order.status === 'picked_up') return 'Retirado';
  return 'Em andamento';
}

function fmt(value?: string): string {
  if (!value) return 'Aguardando';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function checkpointButtonLabel(key: CheckpointKey): string {
  const labels: Record<CheckpointKey, string> = {
    pickup_checkin: 'Marcar retirada check-in',
    pickup_checkout: 'Marcar retirada check-out',
    delivery_checkin: 'Marcar entrega check-in',
    delivery_checkout: 'Marcar entrega check-out'
  };
  return labels[key];
}

function App() {
  if (window.location.pathname.replace(/\/$/, '').endsWith('/mock')) {
    return <MockAdmin mode={apiMode} />;
  }

  return <LiaApp />;
}

function LiaApp() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedId, setSelectedId] = useState(initialOrders[0].id);
  const [view, setView] = useState<View>('orders');
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [syncMessage, setSyncMessage] = useState('Dados locais prontos para operar offline.');
  const [draftNotes, setDraftNotes] = useState('');

  const apiClient = useMemo(() => createApiClient(apiMode), []);
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? orders[0],
    [orders, selectedId]
  );
  const pendingSync = queue.length || countPendingSync(orders);
  const selectedAttachments = attachments.filter((attachment) => attachment.orderId === selectedOrder?.id);

  async function refresh() {
    await ensureLiaLocalData();
    const [localOrders, syncItems, localAttachments] = await Promise.all([
      getLocalOrders(),
      getPendingSyncItems(),
      getLocalAttachments()
    ]);
    setOrders(localOrders);
    setQueue(syncItems);
    setAttachments(localAttachments);
    if (!localOrders.some((order) => order.id === selectedId) && localOrders[0]) {
      setSelectedId(localOrders[0].id);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleCreateOrder() {
    const nextOrder = await createOfflineOrder({
      customerName: 'Novo cliente',
      customerPhone: '+595 981 000000',
      deliveryAddress: 'Asunción, Paraguay',
      notes: 'Pedido salvo localmente aguardando sincronização.',
      paymentStatus: 'mock_pending'
    });
    setSelectedId(nextOrder.id);
    setDraftNotes(nextOrder.notes);
    setView('new');
    setSyncMessage('Pedido salvo offline. Sincronize quando houver conexão.');
    await refresh();
  }

  async function handleSaveNotes() {
    if (!selectedOrder) return;
    await updateOfflineOrder(selectedOrder.id, { notes: draftNotes || selectedOrder.notes });
    setSyncMessage('Edição salva offline e enviada para a fila.');
    await refresh();
  }

  async function handleCheckpoint(key: CheckpointKey) {
    if (!selectedOrder) return;
    await updateOfflineCheckpoint(selectedOrder.id, key, {
      completed: true,
      actor: 'Operador Lia',
      notes: 'Atualizado no PWA offline-first'
    });
    setSyncMessage(`${checkpointButtonLabel(key)} salvo offline.`);
    await refresh();
  }

  async function handleSync() {
    const result = await syncPendingItems(apiClient);
    setSyncMessage(`Sincronização concluída: ${result.synced} enviados, ${result.failed} falhas.`);
    await refresh();
  }

  async function handlePhoto(file?: File) {
    if (!file || !selectedOrder) return;
    const blob = await compressImage(file);
    await saveLocalAttachment(selectedOrder.id, {
      kind: 'photo',
      filename: file.name.replace(/\.[^.]+$/, '.webp'),
      contentType: blob.type || 'image/webp',
      blob
    });
    setSyncMessage('Foto compactada e salva offline para sincronização.');
    await refresh();
  }

  async function handleSignature(blob: Blob) {
    if (!selectedOrder) return;
    await saveLocalAttachment(selectedOrder.id, {
      kind: 'signature',
      filename: `assinatura-${selectedOrder.id}.png`,
      contentType: 'image/png',
      blob
    });
    setSyncMessage('Assinatura salva offline para sincronização.');
    await refresh();
  }

  async function handlePaymentIntent() {
    if (!selectedOrder) return;
    await enqueuePaymentIntent(selectedOrder.id);
    setSyncMessage('Intenção de pagamento mock entrou na fila. Pagamento real requer conexão.');
    await refresh();
  }

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Aplicativo mobile Lia">
        <header className="mobile-header">
          <button className="icon-button" aria-label="Abrir menu">☰</button>
          <strong className="brand">Lia</strong>
          <a className="mock-link" href="/lia/mock/">Mock</a>
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
              className={`order-card ${order.id === selectedOrder?.id ? 'selected' : ''}`}
              key={order.id}
              onClick={() => {
                setSelectedId(order.id);
                setDraftNotes(order.notes);
                setView('orders');
              }}
            >
              <span className="order-id">#{order.id.slice(-8)}</span>
              <strong>{order.product}</strong>
              <span>Cliente: {order.customerName}</span>
              <small className={`status ${order.paymentStatus}`}>{statusLabel(order)}</small>
              <div className="mini-timeline" aria-label={`Progresso do pedido ${order.id}`}>
                {order.checkpoints.map((checkpoint) => (
                  <i key={checkpoint.key} className={checkpoint.completed ? 'done' : ''} aria-label={checkpoint.label} />
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
          <div className="account-chip"><span>{apiMode}</span> API: {apiMode === 'mock' ? 'Mock browser-side' : apiUrl}</div>
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

          {selectedOrder ? (
            <article className="order-detail">
              <p className="breadcrumb">Pedidos › #{selectedOrder.id}</p>
              <section className="hero-card">
                <div>
                  <h2>#{selectedOrder.id.slice(-8)} · {selectedOrder.product}</h2>
                  <p>Cliente: {selectedOrder.customerName} <span className={`status ${selectedOrder.paymentStatus}`}>{paymentLabel(selectedOrder)}</span></p>
                </div>
                <button className="primary-button" onClick={handleSaveNotes}>Salvar edição</button>
              </section>

              <div className="detail-grid">
                <section className="panel">
                  <h3>Linha do tempo operacional</h3>
                  <ol className="timeline">
                    {selectedOrder.checkpoints.map((checkpoint) => (
                      <li className={checkpoint.completed ? 'complete' : ''} key={checkpoint.key}>
                        <span aria-hidden="true">✓</span>
                        <div>
                          <strong>{checkpoint.label}</strong>
                          <p>{fmt(checkpoint.timestamp)}</p>
                          {checkpoint.actor ? <p>{checkpoint.actor}</p> : null}
                          <button type="button" className="secondary-button" onClick={() => handleCheckpoint(checkpoint.key)}>
                            {checkpointButtonLabel(checkpoint.key)}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="panel details-panel">
                  <h3>Detalhes do pedido</h3>
                  <dl>
                    <dt>Tipo</dt><dd>{selectedOrder.product}</dd>
                    <dt>Cliente</dt><dd>{selectedOrder.customerName}</dd>
                    <dt>Telefone</dt><dd>{selectedOrder.customerPhone}</dd>
                    <dt>Endereço de entrega</dt><dd>{selectedOrder.deliveryAddress}</dd>
                    <dt>Status de pagamento</dt><dd><span className={`status ${selectedOrder.paymentStatus}`}>{paymentLabel(selectedOrder)}</span></dd>
                    <dt>Versão local</dt><dd>{selectedOrder.version}</dd>
                  </dl>
                  <label className="field-block">
                    Observações
                    <textarea value={draftNotes || selectedOrder.notes} onChange={(event) => setDraftNotes(event.target.value)} />
                  </label>
                  <div className="payment-box">
                    <strong>▣ Pagamento online</strong>
                    <p>Ação disponível apenas com conexão à internet.</p>
                    <button className="primary-button" onClick={handlePaymentIntent}>Criar pagamento mock</button>
                  </div>
                  <div className="media-box">
                    <strong>Anexos offline</strong>
                    <input aria-label="Adicionar foto do molde" type="file" accept="image/*" onChange={(event) => handlePhoto(event.target.files?.[0])} />
                    <SignaturePad onSave={handleSignature} />
                    <p>{selectedAttachments.length} anexos locais deste pedido.</p>
                  </div>
                </section>
              </div>
            </article>
          ) : null}
        </div>
        <footer className="api-note">Modo API: {apiMode}. API configurável: {apiUrl}. Mock: <a href="/lia/mock/">/lia/mock/</a></footer>
      </section>
    </main>
  );
}

function MockAdmin({ mode }: { mode: ApiMode }) {
  const [state, setState] = useState<string>('Carregando mock...');
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);

  async function refresh() {
    const [mockState, syncItems] = await Promise.all([exportMockBackendState(), getPendingSyncItems()]);
    setState(JSON.stringify(mockState, null, 2));
    setQueue(syncItems);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function reset() {
    await resetMockBackendState();
    await refresh();
  }

  return (
    <main className="mock-page">
      <section className="mock-panel">
        <a href="/lia/">← Voltar ao app</a>
        <h1>Lia mock backend</h1>
        <p>Modo ativo: <strong>{mode}</strong>. Este mock roda no IndexedDB do navegador; GitHub Pages não executa backend.</p>
        <div className="mock-actions">
          <button className="primary-button" onClick={refresh}>Atualizar export</button>
          <button className="secondary-button" onClick={reset}>Resetar seed mock</button>
        </div>
        <p>Fila local pendente: {queue.length}</p>
        <textarea readOnly value={state} aria-label="Export JSON do mock backend" />
      </section>
    </main>
  );
}

export default App;
