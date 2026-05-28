import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const healthPayload = { status: 'ok', runtime: 'cloudflare-workers', framework: 'hono' };
const dbHealthPayload = { status: 'ok', configured: true };

function stubFetch() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/api/health')) return jsonResponse(healthPayload);
    if (url.endsWith('/api/db/health')) return jsonResponse(dbHealthPayload);
    return new Response('not found', { status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}

describe('Lia portal integrador', () => {
  beforeEach(() => {
    stubFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the real architecture and published surfaces', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /portal integrador/i })).toBeInTheDocument();
    expect(screen.getByText(/Cloudflare Workers \+ Hono/i)).toBeInTheDocument();
    expect(screen.getByText(/Supabase\/Postgres real/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /abrir dashboard/i })).toHaveAttribute('href', 'https://dashboard.aneety.com/');

    await waitFor(() => expect(screen.getAllByText('ok')).toHaveLength(2));
    expect(screen.getByText(/cloudflare-workers \+ hono/i)).toBeInTheDocument();
    expect(screen.getByText(/db\/health OK/i)).toBeInTheDocument();
  });

  it('keeps navigation focused on repo-owned aneety.com apps', async () => {
    render(<App />);


    await waitFor(() => expect(screen.getAllByText('ok')).toHaveLength(2));

    const surfaceLinks = screen.getAllByRole('link', { name: /abrir superfície/i });
    expect(surfaceLinks).toHaveLength(6);

    for (const href of [
      'https://aneety.com/',
      'https://api.aneety.com/api/health',
      'https://core.aneety.com/',
      'https://pwa.aneety.com/',
      'https://desktop.aneety.com/',
      'https://dashboard.aneety.com/'
    ]) {
      expect(document.querySelector(`a[href="${href}"]`)).toBeTruthy();
    }
  });
});
