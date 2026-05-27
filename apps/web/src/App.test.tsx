import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';
import { exportMockBackendState, resetLiaLocalData } from './local/localStore';

describe('Lia PWA shell', () => {
  beforeEach(async () => {
    await resetLiaLocalData();
    window.history.pushState({}, '', '/lia/');
  });

  it('renders the order workflow and payment online-only copy', async () => {
    render(<App />);

    expect(screen.getAllByText('Pedidos')[0]).toBeInTheDocument();
    expect(await screen.findAllByText('Molde prótese')).not.toHaveLength(0);
    expect(screen.getAllByText('Ação disponível apenas com conexão à internet.')[0]).toBeInTheDocument();
  });

  it('creates a draft order from the real form and syncs it with the mock backend', async () => {
    render(<App />);

    const mobile = screen.getByRole('region', { name: 'Aplicativo mobile Lia' });
    const nav = within(mobile).getByRole('navigation', { name: 'Navegação principal' });
    fireEvent.click(within(nav).getByRole('button', { name: /novo pedido/i }));
    const newOrderPanel = within(mobile).getByRole('region', { name: 'Novo pedido' });
    fireEvent.change(within(newOrderPanel).getByLabelText('Cliente'), { target: { value: 'Clínica Santa Ana' } });
    fireEvent.change(within(newOrderPanel).getByLabelText('Telefone'), { target: { value: '+595 981 333444' } });
    fireEvent.change(within(newOrderPanel).getByLabelText('Endereço de entrega'), { target: { value: 'Luque, Paraguay' } });
    fireEvent.change(within(newOrderPanel).getByLabelText('Observações do pedido'), { target: { value: 'Entregar pela manhã' } });
    fireEvent.click(within(newOrderPanel).getByRole('button', { name: 'Salvar novo pedido offline' }));

    expect(await screen.findByText('Pedido Clínica Santa Ana salvo offline. Sincronize quando houver conexão.')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Sincronizar' })[0]);

    await waitFor(async () => {
      const backendState = await exportMockBackendState();
      expect(backendState.orders.some((order) => order.customerName === 'Clínica Santa Ana')).toBe(true);
    });
    expect(await screen.findByText(/Sincronização concluída: \d+ enviados, 0 falhas\./)).toBeInTheDocument();
  });

  it('shows functional mobile views for pickup, delivery, and sync queue', async () => {
    render(<App />);

    const mobile = screen.getByRole('region', { name: 'Aplicativo mobile Lia' });
    const nav = within(mobile).getByRole('navigation', { name: 'Navegação principal' });

    fireEvent.click(within(nav).getByRole('button', { name: /retirada/i }));
    const pickupPanel = within(mobile).getByRole('region', { name: 'Retirada operacional' });
    expect(within(pickupPanel).getByRole('heading', { name: 'Retirada' })).toBeInTheDocument();
    fireEvent.click(within(pickupPanel).getByRole('button', { name: 'Marcar retirada check-in' }));
    expect(await screen.findByText('Marcar retirada check-in salvo offline.')).toBeInTheDocument();

    fireEvent.click(within(nav).getByRole('button', { name: /entrega/i }));
    const deliveryPanel = within(mobile).getByRole('region', { name: 'Entrega operacional' });
    expect(within(deliveryPanel).getByRole('heading', { name: 'Entrega' })).toBeInTheDocument();
    fireEvent.click(within(deliveryPanel).getByRole('button', { name: 'Marcar entrega check-out' }));
    expect(await screen.findByText('Marcar entrega check-out salvo offline.')).toBeInTheDocument();

    fireEvent.click(within(nav).getByRole('button', { name: /sync/i }));
    const syncPanel = within(mobile).getByRole('region', { name: 'Fila de sincronização' });
    expect(within(syncPanel).getByText(/Itens pendentes/)).toBeInTheDocument();
    expect(within(syncPanel).getAllByText(/update_checkpoint|create_order/).length).toBeGreaterThan(0);
  });
});

describe('Lia mock backend route', () => {
  beforeEach(async () => {
    await resetLiaLocalData();
    window.history.pushState({}, '', '/lia/mock/');
  });

  it('renders the mock admin for the GitHub Pages deep link', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Lia mock backend' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Export JSON do mock backend' })).toBeInTheDocument();
  });
});
