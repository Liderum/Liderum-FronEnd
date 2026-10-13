import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Checkout, CheckoutStatus } from '@/services/billing';

const getCheckout = vi.fn();
vi.mock('@/services/billing/billingService', async (orig) => {
  const mod = await orig<typeof import('@/services/billing/billingService')>();
  return { ...mod, BillingService: { getCheckout: (...a: unknown[]) => getCheckout(...a) } };
});

import { useCheckoutPolling } from '../hooks/useCheckoutPolling';

const co = (status: CheckoutStatus): Checkout => ({
  id: 'tx', status, planCode: 'PRO', amountInCents: 100, method: 'PIX_TRANSPARENT', expiresAt: null, checkoutUrl: null, pix: null, paidAt: null, extraSeats: 0,
});

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
const tick = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

describe('useCheckoutPolling', () => {
  beforeEach(() => { vi.useFakeTimers(); getCheckout.mockReset(); });
  afterEach(() => vi.useRealTimers());

  it('refaz a consulta a cada 2s e para ao chegar em Paid', async () => {
    getCheckout.mockResolvedValueOnce(co('Pending')).mockResolvedValueOnce(co('Pending')).mockResolvedValue(co('Paid'));
    const { result } = renderHook(() => useCheckoutPolling('tx'), { wrapper: wrapper() });
    await tick(0);
    expect(getCheckout).toHaveBeenCalledTimes(1);
    await tick(2000);
    expect(getCheckout).toHaveBeenCalledTimes(2);
    await tick(2000);
    expect(getCheckout).toHaveBeenCalledTimes(3);
    expect(result.current.data?.status).toBe('Paid');
    expect(result.current.terminal).toBe(true);
    await tick(60_000);
    expect(getCheckout).toHaveBeenCalledTimes(3);
  });

  it('aplica backoff: depois de 10s o intervalo passa a 5s', async () => {
    getCheckout.mockResolvedValue(co('Pending'));
    renderHook(() => useCheckoutPolling('tx'), { wrapper: wrapper() });
    await tick(0);
    await tick(10_000);
    const at10s = getCheckout.mock.calls.length;
    await tick(4_000);
    expect(getCheckout.mock.calls.length).toBe(at10s);
    await tick(1_000);
    expect(getCheckout.mock.calls.length).toBe(at10s + 1);
  });

  it.each(['Expired', 'Cancelled', 'Failed', 'Denied'] as const)('para em %s', async (status) => {
    getCheckout.mockResolvedValue(co(status));
    const { result } = renderHook(() => useCheckoutPolling('tx'), { wrapper: wrapper() });
    await tick(0);
    await tick(30_000);
    expect(getCheckout).toHaveBeenCalledTimes(1);
    expect(result.current.terminal).toBe(true);
  });

  it('cancela o polling ao desmontar', async () => {
    getCheckout.mockResolvedValue(co('Pending'));
    const { unmount } = renderHook(() => useCheckoutPolling('tx'), { wrapper: wrapper() });
    await tick(0);
    unmount();
    const before = getCheckout.mock.calls.length;
    await tick(60_000);
    expect(getCheckout.mock.calls.length).toBe(before);
  });

  it('para ao atingir o teto de 10 minutos e sinaliza timedOut', async () => {
    getCheckout.mockResolvedValue(co('Pending'));
    const { result } = renderHook(() => useCheckoutPolling('tx'), { wrapper: wrapper() });
    await tick(0);
    await tick(10 * 60_000 + 1_000);
    const n = getCheckout.mock.calls.length;
    expect(result.current.timedOut).toBe(true);
    await tick(60_000);
    expect(getCheckout.mock.calls.length).toBe(n);
  });
});
