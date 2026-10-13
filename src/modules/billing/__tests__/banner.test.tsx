import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

const state = { sub: null as null | Record<string, unknown>, calls: 0 };
vi.mock('@/services/billing/billingService', async (orig) => {
  const mod = await orig<typeof import('@/services/billing/billingService')>();
  return { ...mod, BillingService: { getSubscription: async () => { state.calls += 1; return state.sub; } } };
});
let permissions = ['payments.subscription.read'];
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ permissions }) }));

import { SubscriptionBanner } from '../components/SubscriptionBanner';
import { bannerMessage } from '../lib';
import { billingQueryClient } from '../queryClient';

const sub = (daysRemaining: number | null, extra: Record<string, unknown> = {}) => ({
  planCode: 'PRO', status: 'Active', currentPeriodStart: null, currentPeriodEnd: new Date(), renewable: true,
  daysRemaining, graceEndsAt: null, ...extra,
});
const mount = () => render(<MemoryRouter><SubscriptionBanner /></MemoryRouter>);

beforeEach(() => {
  billingQueryClient.clear();
  state.calls = 0;
  permissions = ['payments.subscription.read'];
});

describe('banner de vencimento', () => {
  it.each([7, 3, 1, 0])('aparece com daysRemaining=%i e o CTA renova o plano', async (d) => {
    state.sub = sub(d);
    mount();
    const banner = await screen.findByTestId('subscription-banner');
    expect(banner).toHaveTextContent(/vence/);
    expect(screen.getByRole('link', { name: /Renovar agora/ })).toHaveAttribute('href', '/billing/plans?plan=PRO');
  });

  it('em atraso (negativo) informa o fim da carência', async () => {
    state.sub = sub(-2, { graceEndsAt: new Date('2026-10-12T00:00:00Z') });
    mount();
    expect(await screen.findByTestId('subscription-banner')).toHaveTextContent(/venceu há 2 dias.*acesso é mantido até/i);
  });

  it('não aparece com mais de 7 dias, sem assinatura, ou sem daysRemaining', async () => {
    for (const s of [sub(8), null, sub(null)]) {
      billingQueryClient.clear();
      state.sub = s;
      state.calls = 0;
      const { unmount } = mount();
      await waitFor(() => expect(state.calls).toBe(1));
      expect(screen.queryByTestId('subscription-banner')).not.toBeInTheDocument();
      unmount();
    }
  });

  it('sem permissão de leitura da assinatura nem consulta a API', async () => {
    permissions = [];
    state.sub = sub(1);
    mount();
    await new Promise((r) => setTimeout(r, 50));
    expect(state.calls).toBe(0);
    expect(screen.queryByTestId('subscription-banner')).not.toBeInTheDocument();
  });

  it('mensagens por faixa', () => {
    expect(bannerMessage(5, null)).toBe('Sua assinatura vence em 5 dias.');
    expect(bannerMessage(1, null)).toBe('Sua assinatura vence amanhã.');
    expect(bannerMessage(0, null)).toBe('Sua assinatura vence hoje.');
  });
});
