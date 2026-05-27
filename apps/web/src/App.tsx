import { type CSSProperties, type FormEvent, useEffect, useMemo, useState } from 'react';
import { createApiClient, exportMockBackendState, getConfiguredApiMode, resetMockBackendState } from './api/apiClient';
import { SignaturePad } from './components/SignaturePad';
import { tenantConfig } from './config/tenant';
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

const apiMode = getConfiguredApiMode();

type View = 'orders' | 'new' | 'clinics' | 'production' | 'pickup' | 'delivery' | 'sync';

type NewOrderForm = {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  product: string;
  notes: string;
};

const emptyNewOrderForm: NewOrderForm = {
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  product: 'Molde prótese',
  notes: ''
};

const navItems: Array<{ key: View; label: string; icon: string }> = [
  { key: 'orders', label: 'Pedidos', icon: '▣' },
  { key: 'new', label: 'Novo pedido', icon: '+' },
  { key: 'clinics', label: 'Consultórios', icon: '◫' },
  { key: 'production', label: 'Produção', icon: '◇' },
  { key: 'pickup', label: 'Retirada', icon: '▱' },
  { key: 'delivery', label: 'Entrega', icon: '⌖' },
  { key: 'sync', label: 'Sync', icon: '↻' }
];

const syncOperationLabels: Record<SyncQueueItem['operation'], string> = {
  create_order: 'Criar pedido',
  update_order: 'Atualizar pedido',
  update_checkpoint: 'Atualizar checkpoint',
  upload_attachment: 'Enviar anexo',
  create_payment_intent: 'Criar pagamento mock'
};

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

function viewTitle(view: View): string {
  const match = navItems.find((item) => item.key === view);
  return match?.label ?? 'Pedidos';
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
  const [draftNotes, setDraftNotes] = useState(initialOrders[0].notes);
  const [newOrderForm, setNewOrderForm] = useState<NewOrderForm>(emptyNewOrderForm);

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

    const currentOrder = localOrders.find((order) => order.id === selectedId) ?? localOrders[0];
    if (currentOrder) {
      setSelectedId(currentOrder.id);
      setDraftNotes(currentOrder.notes);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function selectOrder(order: Order, nextView: View = 'orders') {
    setSelectedId(order.id);
    setDraftNotes(order.notes);
    setView(nextView);
  }

  async function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const customerName = newOrderForm.customerName.trim();
    const customerPhone = newOrderForm.customerPhone.trim();
    const deliveryAddress = newOrderForm.deliveryAddress.trim();

    if (!customerName || !customerPhone || !deliveryAddress) {
      setSyncMessage('Preencha cliente, telefone e endereço antes de salvar.');
      return;
    }

    const nextOrder = await createOfflineOrder({
      customerName,
      customerPhone,
      deliveryAddress,
      product: newOrderForm.product.trim() || 'Molde prótese',
      notes: newOrderForm.notes.trim() || 'Pedido salvo localmente aguardando sincronização.',
      paymentStatus: 'pending'
    });
    setSelectedId(nextOrder.id);
    setDraftNotes(nextOrder.notes);
    setNewOrderForm(emptyNewOrderForm);
    setView('orders');
    setSyncMessage(`Pedido ${nextOrder.customerName} salvo offline. Sincronize quando houver conexão.`);
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

  const sharedProps = {
    orders,
    selectedOrder,
    selectedAttachments,
    queue,
    draftNotes,
    newOrderForm,
    selectOrder,
    setDraftNotes,
    setNewOrderForm,
    handleCreateOrder,
    handleCheckpoint,
    handleSaveNotes,
    handlePaymentIntent,
    handlePhoto,
    handleSignature,
    handleSync
  };

  return (
    <main
      className="app-shell"
      style={{
        '--tenant-primary': tenantConfig.primaryColor,
        '--tenant-dark': tenantConfig.darkColor
      } as CSSProperties}
    >
      <section className="phone-frame" aria-label="Aplicativo mobile Lia">
        <header className="mobile-header">
          <button className="icon-button" aria-label="Abrir menu">☰</button>
          <strong className="brand">{tenantConfig.brandName}</strong>
          <a className="mock-link" href="/lia/mock/">Mock</a>
        </header>
        <TenantBadge />

        <div className="title-row">
          <h1>{viewTitle(view)}</h1>
          <button className="primary-button" onClick={() => setView('new')}>Novo pedido +</button>
        </div>

        <SyncBanner pendingSync={pendingSync} syncMessage={syncMessage} onSync={handleSync} />

        <MobileContent view={view} {...sharedProps} />

        <PrimaryNav view={view} onChange={setView} />
      </section>

      <section className="desktop-preview" aria-label="Painel administrativo Lia">
        <header className="desktop-topbar">
          <div>
            <strong className="brand">{tenantConfig.brandName}</strong>
            <TenantBadge />
          </div>
          <div className="account-chip"><span>{apiMode}</span> Mock browser-side</div>
        </header>
        <div className="desktop-body">
          <aside className="sidebar" aria-label="Navegação administrativa">
            {navItems.map((item) => (
              <button className={view === item.key ? 'active' : ''} key={item.key} onClick={() => setView(item.key)}>
                {item.label === 'Sync' ? 'Sincronização' : item.label}
              </button>
            ))}
            <div className="sidebar-sync">
              <strong>☁ Offline pendente</strong>
              <span>{pendingSync} itens aguardando sincronização</span>
              <button onClick={handleSync}>Sincronizar</button>
            </div>
          </aside>

          <DesktopContent view={view} {...sharedProps} />
        </div>
        <footer className="api-note">Modo ativo: {apiMode}. Backend real separado; GitHub Pages usa somente mock. Mock: <a href="/lia/mock/">/lia/mock/</a></footer>
      </section>
    </main>
  );
}

type SharedContentProps = {
  orders: Order[];
  selectedOrder?: Order;
  selectedAttachments: Attachment[];
  queue: SyncQueueItem[];
  draftNotes: string;
  newOrderForm: NewOrderForm;
  selectOrder: (order: Order, nextView?: View) => void;
  setDraftNotes: (notes: string) => void;
  setNewOrderForm: (form: NewOrderForm) => void;
  handleCreateOrder: (event: FormEvent<HTMLFormElement>) => void;
  handleCheckpoint: (key: CheckpointKey) => void;
  handleSaveNotes: () => void;
  handlePaymentIntent: () => void;
  handlePhoto: (file?: File) => void;
  handleSignature: (blob: Blob) => void;
  handleSync: () => void;
};

type ContentProps = SharedContentProps & { view: View };

function MobileContent(props: ContentProps) {
  if (props.view === 'new') return <NewOrderPanel {...props} compact />;
  if (props.view === 'clinics') return <ClinicsAdminPanel {...props} compact />;
  if (props.view === 'production') return <ProductionAdminPanel {...props} compact />;
  if (props.view === 'pickup') return <WorkflowPanel title="Retirada" keys={['pickup_checkin', 'pickup_checkout']} {...props} compact />;
  if (props.view === 'delivery') return <WorkflowPanel title="Entrega" keys={['delivery_checkin', 'delivery_checkout']} {...props} compact />;
  if (props.view === 'sync') return <SyncQueuePanel {...props} compact />;
  return <OrdersPanel {...props} compact />;
}

function DesktopContent(props: ContentProps) {
  if (props.view === 'new') return <NewOrderPanel {...props} />;
  if (props.view === 'clinics') return <ClinicsAdminPanel {...props} />;
  if (props.view === 'production') return <ProductionAdminPanel {...props} />;
  if (props.view === 'pickup') return <WorkflowPanel title="Retirada" keys={['pickup_checkin', 'pickup_checkout']} {...props} />;
  if (props.view === 'delivery') return <WorkflowPanel title="Entrega" keys={['delivery_checkin', 'delivery_checkout']} {...props} />;
  if (props.view === 'sync') return <SyncQueuePanel {...props} />;
  return <OrdersPanel {...props} />;
}

function TenantBadge() {
  return (
    <aside className="tenant-badge" aria-label="Configuração white-label">
      <strong>{tenantConfig.operationName}</strong>
      <span>{tenantConfig.whiteLabelNote}</span>
    </aside>
  );
}

function SyncBanner({ pendingSync, syncMessage, onSync }: { pendingSync: number; syncMessage: string; onSync: () => void }) {
  return (
    <>
      <aside className="sync-card" aria-live="polite">
        <div>
          <strong>☁ Offline pendente</strong>
          <span>{pendingSync || 0} itens aguardando sincronização</span>
        </div>
        <button onClick={onSync}>Sincronizar</button>
      </aside>
      <p className="sync-message">{syncMessage}</p>
    </>
  );
}

function PrimaryNav({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {navItems.map((item) => (
        <button
          key={item.key}
          className={view === item.key ? 'active' : ''}
          onClick={() => onChange(item.key)}
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function OrdersPanel(props: SharedContentProps & { compact?: boolean }) {
  return (
    <section className={props.compact ? 'mobile-panel' : 'order-detail'} aria-label="Pedidos cadastrados">
      <h2>Meus pedidos</h2>
      <OrderList orders={props.orders} selectedOrder={props.selectedOrder} selectOrder={props.selectOrder} />
      {props.selectedOrder ? (
        <OrderDetailCard
          order={props.selectedOrder}
          attachments={props.selectedAttachments}
          draftNotes={props.draftNotes}
          setDraftNotes={props.setDraftNotes}
          handleSaveNotes={props.handleSaveNotes}
          handleCheckpoint={props.handleCheckpoint}
          handlePaymentIntent={props.handlePaymentIntent}
          handlePhoto={props.handlePhoto}
          handleSignature={props.handleSignature}
          compact={props.compact}
        />
      ) : null}
    </section>
  );
}

function OrderList({ orders, selectedOrder, selectOrder }: Pick<SharedContentProps, 'orders' | 'selectedOrder' | 'selectOrder'>) {
  return (
    <div className="order-list">
      {orders.map((order) => (
        <button
          className={`order-card ${order.id === selectedOrder?.id ? 'selected' : ''}`}
          key={order.id}
          onClick={() => selectOrder(order, 'orders')}
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
  );
}

function NewOrderPanel({ newOrderForm, setNewOrderForm, handleCreateOrder, compact }: SharedContentProps & { compact?: boolean }) {
  function updateField(key: keyof NewOrderForm, value: string) {
    setNewOrderForm({ ...newOrderForm, [key]: value });
  }

  return (
    <section className={compact ? 'mobile-panel' : 'order-detail'} aria-label="Novo pedido">
      <h2>Novo pedido</h2>
      <form className="order-form" onSubmit={handleCreateOrder}>
        <label>
          Cliente
          <input value={newOrderForm.customerName} onChange={(event) => updateField('customerName', event.target.value)} />
        </label>
        <label>
          Telefone
          <input value={newOrderForm.customerPhone} onChange={(event) => updateField('customerPhone', event.target.value)} />
        </label>
        <label>
          Endereço de entrega
          <input value={newOrderForm.deliveryAddress} onChange={(event) => updateField('deliveryAddress', event.target.value)} />
        </label>
        <label>
          Produto
          <input value={newOrderForm.product} onChange={(event) => updateField('product', event.target.value)} />
        </label>
        <label className="wide-field">
          Observações do pedido
          <textarea value={newOrderForm.notes} onChange={(event) => updateField('notes', event.target.value)} />
        </label>
        <div className="form-note">
          <strong>Offline-first</strong>
          <span>O pedido fica no IndexedDB e entra na fila do mock até sincronizar.</span>
        </div>
        <button className="primary-button" type="submit">Salvar novo pedido offline</button>
      </form>
    </section>
  );
}

function ClinicsAdminPanel({ orders, compact }: SharedContentProps & { compact?: boolean }) {
  const clinicNames = Array.from(new Set(orders.map((order) => order.customerName)));
  const moldOrders = orders.filter((order) => order.product.toLocaleLowerCase('pt-BR').includes('molde'));
  const pendingMolds = moldOrders.filter((order) => order.status !== 'delivered');

  return (
    <section className={compact ? 'mobile-panel admin-panel' : 'order-detail admin-panel'} aria-label="Consultórios e moldes">
      <p className="breadcrumb">Administração › Consultórios e moldes</p>
      <h2>{tenantConfig.clinicAdminTitle}</h2>
      <p>{tenantConfig.clinicAdminSubtitle}</p>
      <div className="admin-kpis">
        <article>
          <strong>{clinicNames.length}</strong>
          <span>Consultórios e clientes ativos</span>
        </article>
        <article>
          <strong>{moldOrders.length}</strong>
          <span>Moldes em produção</span>
        </article>
        <article>
          <strong>{pendingMolds.length}</strong>
          <span>Pedidos aguardando conclusão</span>
        </article>
      </div>
      <ul className="admin-list">
        {orders.map((order) => (
          <li key={order.id}>
            <strong>{order.customerName}</strong>
            <span>{order.product} · {statusLabel(order)} · {paymentLabel(order)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductionAdminPanel({ orders, compact }: SharedContentProps & { compact?: boolean }) {
  const inProduction = orders.filter((order) =>
    ['paid', 'picked_up', 'in_production', 'ready_for_delivery'].includes(order.status)
  );
  const readyForDelivery = orders.filter((order) =>
    ['ready_for_delivery', 'delivery_scheduled', 'delivered'].includes(order.status) ||
    order.checkpoints.some((checkpoint) => checkpoint.key === 'delivery_checkin' && checkpoint.completed)
  );

  return (
    <section className={compact ? 'mobile-panel admin-panel' : 'order-detail admin-panel'} aria-label="Produção de próteses">
      <p className="breadcrumb">Administração › Produção de próteses</p>
      <h2>{tenantConfig.productionAdminTitle}</h2>
      <p>{tenantConfig.productionAdminSubtitle}</p>
      <div className="admin-kpis">
        <article>
          <strong>{orders.length}</strong>
          <span>Pedidos no pipeline</span>
        </article>
        <article>
          <strong>{inProduction.length}</strong>
          <span>Próteses em produção</span>
        </article>
        <article>
          <strong>{readyForDelivery.length}</strong>
          <span>Próteses prontas para entrega</span>
        </article>
      </div>
      <ol className="admin-list">
        {orders.map((order) => (
          <li key={order.id}>
            <strong>#{order.id} · {order.product}</strong>
            <span>{order.customerName} · pagamento {paymentLabel(order)} · {statusLabel(order)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function WorkflowPanel({ title, keys, selectedOrder, handleCheckpoint, compact }: SharedContentProps & { title: string; keys: CheckpointKey[]; compact?: boolean }) {
  return (
    <section className={compact ? 'mobile-panel workflow-panel' : 'order-detail'} aria-label={`${title} operacional`}>
      <h2>{title}</h2>
      {selectedOrder ? (
        <div className="workflow-card">
          <p className="breadcrumb">Pedido selecionado › #{selectedOrder.id}</p>
          <h3>{selectedOrder.customerName}</h3>
          <p>{selectedOrder.deliveryAddress}</p>
          <div className="workflow-actions">
            {keys.map((key) => {
              const checkpoint = selectedOrder.checkpoints.find((item) => item.key === key);
              return (
                <article key={key} className={checkpoint?.completed ? 'checkpoint-card complete' : 'checkpoint-card'}>
                  <strong>{checkpoint?.label ?? checkpointButtonLabel(key)}</strong>
                  <span>{checkpoint?.completed ? `Concluído em ${fmt(checkpoint.timestamp)}` : 'Aguardando execução'}</span>
                  {checkpoint?.actor ? <small>{checkpoint.actor}</small> : null}
                  <button className="secondary-button" type="button" onClick={() => handleCheckpoint(key)}>
                    {checkpointButtonLabel(key)}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <p>Nenhum pedido selecionado.</p>
      )}
    </section>
  );
}

function SyncQueuePanel({ queue, handleSync, compact }: SharedContentProps & { compact?: boolean }) {
  return (
    <section className={compact ? 'mobile-panel sync-panel' : 'order-detail'} aria-label="Fila de sincronização">
      <h2>Sincronização offline</h2>
      <div className="queue-summary">
        <strong>Itens pendentes: {queue.length}</strong>
        <button className="primary-button" onClick={handleSync}>Sincronizar agora</button>
      </div>
      {queue.length ? (
        <ol className="queue-list">
          {queue.map((item) => (
            <li key={item.id}>
              <strong>{syncOperationLabels[item.operation]}</strong>
              <code>{item.operation}</code>
              <span>Pedido: {item.orderId}</span>
              <span>Tentativas: {item.attempts}</span>
              {item.lastError ? <small>Erro: {item.lastError}</small> : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-state">Fila vazia. Mock browser-side está sincronizado.</p>
      )}
    </section>
  );
}

function OrderDetailCard({
  order,
  attachments,
  draftNotes,
  setDraftNotes,
  handleSaveNotes,
  handleCheckpoint,
  handlePaymentIntent,
  handlePhoto,
  handleSignature,
  compact
}: {
  order: Order;
  attachments: Attachment[];
  draftNotes: string;
  setDraftNotes: (notes: string) => void;
  handleSaveNotes: () => void;
  handleCheckpoint: (key: CheckpointKey) => void;
  handlePaymentIntent: () => void;
  handlePhoto: (file?: File) => void;
  handleSignature: (blob: Blob) => void;
  compact?: boolean;
}) {
  return (
    <article className={compact ? 'selected-order-detail' : undefined}>
      <p className="breadcrumb">Pedidos › #{order.id}</p>
      <section className="hero-card">
        <div>
          <h2>#{order.id.slice(-8)} · {order.product}</h2>
          <p>Cliente: {order.customerName} <span className={`status ${order.paymentStatus}`}>{paymentLabel(order)}</span></p>
        </div>
        <button className="primary-button" onClick={handleSaveNotes}>Salvar edição</button>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <h3>Linha do tempo operacional</h3>
          <ol className="timeline">
            {order.checkpoints.map((checkpoint) => (
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
            <dt>Tipo</dt><dd>{order.product}</dd>
            <dt>Cliente</dt><dd>{order.customerName}</dd>
            <dt>Telefone</dt><dd>{order.customerPhone}</dd>
            <dt>Endereço de entrega</dt><dd>{order.deliveryAddress}</dd>
            <dt>Status de pagamento</dt><dd><span className={`status ${order.paymentStatus}`}>{paymentLabel(order)}</span></dd>
            <dt>Versão local</dt><dd>{order.version}</dd>
          </dl>
          <label className="field-block">
            Observações
            <textarea value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} />
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
            <p>{attachments.length} anexos locais deste pedido.</p>
          </div>
        </section>
      </div>
    </article>
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
