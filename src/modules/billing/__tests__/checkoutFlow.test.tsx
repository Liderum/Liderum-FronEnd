import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { Checkout, CheckoutStatus } from '@/services/billing';

// Funções simples (não vi.fn) nas chamadas que podem rejeitar: o vi.fn gera "unhandled rejection" espúria.
const state = {
  createCalls: 0,
  createImpl: (): Promise<Checkout> => new Promise(() => {}),
  getCheckout: (): Promise<Checkout> => new Promise(() => {}),
  subscription: null as null | { status: string },
  resumable: null as Checkout | null,
};
const co = (status: CheckoutStatus, withPix = true): Checkout => ({
  id: 'tx-1', status, planCode: 'PRO', amountInCents: 14900, method: 'PIX_TRANSPARENT',
  expiresAt: new Date(Date.now() + 25 * 60_000), checkoutUrl: null, paidAt: null, extraSeats: 0,
  pix: withPix && status === 'Pending' ? { brCode: '00020126BRCODE', qrImageSrc: 'data:image/png;base64,iVBORw0KGgo=' } : null,
});

vi.mock('@/services/billing/billingService', async (orig) => {
  const mod = await orig<typeof import('@/services/billing/billingService')>();
  return {
    ...mod,
    BillingService: {
      listPlans: async () => [
        { id: '1', code: 'PRO', name: 'Pro', priceInCents: 14900 },
        { id: '2', code: 'essencial', name: 'Essencial', priceInCents: 9700 },
      ],
      createCheckout: () => { state.createCalls += 1; return state.createImpl(); },
      getCheckout: () => state.getCheckout(),
      cancelCheckout: async () => co('Cancelled'),
      getSubscription: async () => state.subscription,
      findResumableCheckout: async () => state.resumable,
    },
  };
});

let auth = { isLoading: false, isAuthenticated: false, setPaymentRequired: vi.fn() };
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('@/contexts/ThemeContext', () => ({ useForceLightTheme: () => {} }));

import CheckoutFlowPage from '../pages/CheckoutFlowPage';
import { billingQueryClient } from '../queryClient';
import { tokenStore } from '@/services/api/tokenStore';
import { BillingError } from '@/services/billing';

function Where() {
  const l = useLocation();
  return <div data-testid="where">{l.pathname}|{(l.state as { email?: string } | null)?.email ?? ''}</div>;
}
const mount = (entry: { pathname: string; search?: string; state?: object } = { pathname: '/checkout', state: { email: 'maria@empresa.com.br' } }) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/checkout" element={<CheckoutFlowPage />} />
        <Route path="/login" element={<Where />} />
        <Route path="/billing/plans" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );
const pickPlanAndPay = async () => {
  fireEvent.click(await screen.findByRole('radio', { name: /Pro/ }));
  return screen.getByRole('button', { name: /Gerar PIX/ });
};

beforeEach(() => {
  billingQueryClient.clear();
  tokenStore.setCheckoutToken('tok.checkout.jwt', null);
  auth = { isLoading: false, isAuthenticated: false, setPaymentRequired: vi.fn() };
  Object.assign(state, {
    createCalls: 0, createImpl: () => new Promise(() => {}), getCheckout: () => new Promise(() => {}), subscription: null, resumable: null,
  });
});
afterEach(() => { vi.useRealTimers(); tokenStore.clearCheckoutToken(); });

describe('/checkout (pós-cadastro)', () => {
  it('sem token de checkout em memória (ex.: F5) volta para o login', async () => {
    tokenStore.clearCheckoutToken();
    mount();
    expect(await screen.findByTestId('where')).toHaveTextContent('/login|maria@empresa.com.br');
  });

  it('plano vindo do cadastro (router state) já chega pré-selecionado', async () => {
    mount({ pathname: '/checkout', state: { email: 'maria@empresa.com.br', plan: 'essencial' } });
    expect(await screen.findByRole('radio', { name: 'Essencial' })).toBeChecked();
    expect(screen.getByRole('button', { name: /Gerar PIX/ })).toBeInTheDocument();
  });

  it('?plan= na URL do /checkout também pré-seleciona; sem plano nada vem marcado', async () => {
    mount({ pathname: '/checkout', search: '?plan=essencial', state: { email: 'a@b.com' } });
    expect(await screen.findByRole('radio', { name: 'Essencial' })).toBeChecked();
  });

  it('sem plano pré-selecionado nenhum card vem marcado', async () => {
    mount();
    expect(await screen.findByRole('radio', { name: 'Essencial' })).not.toBeChecked();
    expect(screen.queryByRole('button', { name: /Gerar PIX/ })).not.toBeInTheDocument();
  });

  it('já autenticado vai para /billing/plans', async () => {
    auth.isAuthenticated = true;
    mount();
    expect(await screen.findByTestId('where')).toHaveTextContent('/billing/plans');
  });

  it('plano -> PIX: mostra QR, copia-e-cola e contador', async () => {
    state.createImpl = async () => co('Pending');
    state.getCheckout = async () => co('Pending');
    mount();
    fireEvent.click(await pickPlanAndPay());
    expect(await screen.findByAltText(/QR Code PIX/)).toBeInTheDocument();
    expect(screen.getByLabelText(/copia e cola/i)).toHaveValue('00020126BRCODE');
    expect(screen.getByRole('timer')).toHaveTextContent(/\d\d:\d\d/);
  });

  it('duplo clique em "Gerar PIX" dispara só 1 criação', async () => {
    let resolve!: (c: Checkout) => void;
    state.createImpl = () => new Promise<Checkout>((r) => { resolve = r; });
    state.getCheckout = async () => co('Pending');
    mount();
    const btn = await pickPlanAndPay();
    fireEvent.click(btn); fireEvent.click(btn); fireEvent.click(btn);
    expect(state.createCalls).toBe(1);
    await waitFor(() => expect(screen.getByRole('button', { name: /Gerando PIX/ })).toBeDisabled());
    await act(async () => { resolve(co('Pending')); });
    expect(await screen.findByAltText(/QR Code PIX/)).toBeInTheDocument();
  });

  it('202 em análise: sem PIX, mostra "em análise" e continua o polling', async () => {
    state.createImpl = async () => co('Created');
    state.getCheckout = async () => co('Created');
    mount();
    fireEvent.click(await pickPlanAndPay());
    expect(await screen.findByTestId('waiting-Created')).toHaveTextContent(/em análise/i);
    expect(screen.queryByAltText(/QR Code PIX/)).not.toBeInTheDocument();
  });

  it('polling até Paid -> "Pagamento confirmado" -> Entrar leva ao login com o e-mail', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    state.createImpl = async () => co('Pending');
    let polls = 0;
    state.getCheckout = async () => { polls += 1; return polls < 3 ? co('Pending') : { ...co('Paid'), paidAt: new Date() }; };
    state.subscription = { status: 'Active' };
    mount();
    fireEvent.click(await pickPlanAndPay());
    expect(await screen.findByAltText(/QR Code PIX/)).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(4500); });
    expect(await screen.findByTestId('payment-confirmed')).toBeInTheDocument();
    const enter = await screen.findByRole('button', { name: 'Entrar' });
    await waitFor(() => expect(enter).not.toBeDisabled());
    fireEvent.click(enter);
    expect(await screen.findByTestId('where')).toHaveTextContent('/login|maria@empresa.com.br');
    expect(tokenStore.getCheckoutToken()).toBeNull();
    expect(auth.setPaymentRequired).toHaveBeenCalledWith(false);
  });

  it('PIX expirado: oferece gerar novo PIX e volta aos planos', async () => {
    state.createImpl = async () => co('Pending');
    state.getCheckout = async () => co('Expired');
    mount();
    fireEvent.click(await pickPlanAndPay());
    expect(await screen.findByTestId('outcome-Expired')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Gerar novo PIX/ }));
    expect(await screen.findByRole('radio', { name: /Pro/ })).toBeInTheDocument();
  });

  it('retoma PIX pendente ao reabrir (após 402 no login)', async () => {
    state.resumable = co('Pending');
    state.getCheckout = async () => co('Pending');
    mount();
    expect(await screen.findByAltText(/QR Code PIX/)).toBeInTheDocument();
    expect(state.createCalls).toBe(0);
  });

  it('assinatura já Active (pagou antes): vai direto para "confirmado", sem cobrar de novo', async () => {
    state.subscription = { status: 'Active' };
    mount();
    expect(await screen.findByTestId('payment-confirmed')).toBeInTheDocument();
    expect(state.createCalls).toBe(0);
  });

  it('token de checkout expirado (401): orienta a entrar de novo', async () => {
    state.createImpl = () => Promise.reject(new BillingError('unauthorized', 401, null, 'Sua sessão expirou.'));
    mount();
    fireEvent.click(await pickPlanAndPay());
    expect(await screen.findByText(/sessão de pagamento expirou/i)).toBeInTheDocument();
  });
});
