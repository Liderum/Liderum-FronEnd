import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Função simples (não vi.fn): o vi.fn rastreia promises rejeitadas e gera "unhandled rejection" espúria.
const calls: unknown[][] = [];
let impl: () => Promise<unknown> = () => new Promise(() => {});
const createCheckout = {
  mockReset() { calls.length = 0; impl = () => new Promise(() => {}); },
  mockImplementation(fn: () => Promise<unknown>) { impl = fn; },
  mockReturnValue(p: Promise<unknown>) { impl = () => p; },
  call(...a: unknown[]) { calls.push(a); return impl(); },
};
vi.mock('@/services/billing/billingService', async (orig) => {
  const mod = await orig<typeof import('@/services/billing/billingService')>();
  return {
    ...mod,
    BillingService: {
      listPlans: vi.fn().mockResolvedValue([{ id: '1', code: 'PRO', name: 'Pro', priceInCents: 14900 }]),
      getSubscription: vi.fn().mockResolvedValue(null),
      findResumableCheckout: vi.fn().mockResolvedValue(null),
      createCheckout: (...a: unknown[]) => createCheckout.call(...a),
    },
  };
});
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    permissions: ['payments.plans.read', 'payments.checkouts.create', 'payments.checkouts.read', 'payments.subscription.read'],
  }),
}));

import PlansPage from '../pages/PlansPage';

function setup() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}><MemoryRouter><PlansPage /></MemoryRouter></QueryClientProvider>,
  );
}

async function selectPlan() {
  fireEvent.click(await screen.findByRole('radio', { name: /Pro/ }));
  return screen.getByRole('button', { name: /Gerar PIX/ });
}

describe('PlansPage - criação de checkout', () => {
  beforeEach(() => createCheckout.mockReset());

  it('duplo clique no mesmo tick dispara só 1 chamada', async () => {
    let resolve!: (v: unknown) => void;
    createCheckout.mockReturnValue(new Promise((r) => { resolve = r; }));
    setup();
    const btn = await selectPlan();
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual([{ planCode: 'PRO', method: 'PIX_TRANSPARENT', extraSeats: 0 }]);
    await waitFor(() => expect(screen.getByRole('button', { name: /Gerando pagamento/ })).toBeDisabled());
    resolve({ id: 'tx', method: 'PIX_TRANSPARENT' });
  });

  it('mostra erro claro em 429 e bloqueia o botão durante o cooldown', async () => {
    const { BillingError } = await import('@/services/billing');
    createCheckout.mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(new BillingError('rate_limited', 429, 'RATE_LIMITED', 'Muitas tentativas em pouco tempo.', 20)), 0)),
    );
    setup();
    fireEvent.click(await selectPlan());
    expect(await screen.findByText(/Muitas tentativas/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gerar PIX/ })).toBeDisabled();
    expect(screen.getByText(/20s/)).toBeInTheDocument();
  });

  it('não oferece campo de cupom (API devolve 422 COUPON_NOT_SUPPORTED)', async () => {
    setup();
    await selectPlan();
    expect(screen.queryByLabelText(/Cupom/i)).not.toBeInTheDocument();
  });
});
