import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

describe('Lia PWA shell', () => {
  it('renders the order workflow and payment online-only copy', () => {
    render(<App />);

    expect(screen.getAllByText('Pedidos')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Molde prótese')[0]).toBeInTheDocument();
    expect(screen.getByText('Ação disponível apenas com conexão à internet.')).toBeInTheDocument();
  });

  it('creates a draft order that waits for offline synchronization', () => {
    render(<App />);

    fireEvent.click(screen.getAllByText('Novo pedido +')[0]);

    expect(screen.getByText('Pedido salvo offline. Sincronize quando houver conexão.')).toBeInTheDocument();
    expect(screen.getAllByText('Novo cliente')[0]).toBeInTheDocument();
  });
});
