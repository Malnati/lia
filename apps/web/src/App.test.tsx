import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { resetLiaLocalData } from './local/localStore';

describe('Lia PWA shell', () => {
  beforeEach(async () => {
    await resetLiaLocalData();
    window.history.pushState({}, '', '/lia/');
  });

  it('renders the order workflow and payment online-only copy', () => {
    render(<App />);

    expect(screen.getAllByText('Pedidos')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Molde prótese')[0]).toBeInTheDocument();
    expect(screen.getByText('Ação disponível apenas com conexão à internet.')).toBeInTheDocument();
  });

  it('creates a draft order that waits for offline synchronization', async () => {
    render(<App />);

    fireEvent.click(screen.getAllByText('Novo pedido +')[0]);

    expect(await screen.findByText('Pedido salvo offline. Sincronize quando houver conexão.')).toBeInTheDocument();
    expect(await screen.findAllByText('Novo cliente')).not.toHaveLength(0);
  });
});
