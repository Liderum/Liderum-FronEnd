import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';

const post = vi.fn();
vi.mock('@/services/api/apiFactory', () => ({ paymentsApi: { post: (...a: unknown[]) => post(...a), get: vi.fn() } }));

import { BillingService } from '../billingService';
import { IntentStore } from '../idempotency';

const ok = (status: string) => ({
  data: { data: { transactionId: 'tx-1', status, planCode: 'PRO', amountInCents: 14900, method: 'PIX_TRANSPARENT', expiresAt: null, checkoutUrl: null, pix: null, paidAt: null } },
});
const httpError = (status: number, code?: string) =>
  new AxiosError('x', String(status), undefined, undefined, { status, data: { errors: [{ code }] }, headers: {}, statusText: '', config: {} as never });
const input = { planCode: 'PRO', method: 'PIX_TRANSPARENT' as const };
const keyOf = (i: number) => post.mock.calls[i][2].headers['Idempotency-Key'] as string;

describe('Idempotency-Key', () => {
  beforeEach(() => { post.mockReset(); IntentStore._resetForTests(); });

  it('é UUID v4 e reaproveitada em retry sem resposta (rede/timeout) e em 429', async () => {
    post.mockRejectedValueOnce(new AxiosError('Network Error'))
      .mockRejectedValueOnce(httpError(429, 'RATE_LIMITED'))
      .mockResolvedValueOnce(ok('Pending'));
    await expect(BillingService.createCheckout(input)).rejects.toMatchObject({ kind: 'unavailable' });
    await expect(BillingService.createCheckout(input)).rejects.toMatchObject({ kind: 'rate_limited' });
    await BillingService.createCheckout(input);

    expect(keyOf(0)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(new Set([keyOf(0), keyOf(1), keyOf(2)]).size).toBe(1);
  });

  it('503 GATEWAY_UNAVAILABLE: o servidor grava a falha sob a chave, então a nova tentativa usa chave nova', async () => {
    post.mockRejectedValueOnce(httpError(503, 'GATEWAY_UNAVAILABLE')).mockResolvedValueOnce(ok('Pending'));
    await expect(BillingService.createCheckout(input)).rejects.toMatchObject({ kind: 'unavailable' });
    await BillingService.createCheckout(input);
    expect(keyOf(0)).not.toBe(keyOf(1));
  });

  it('409 IDEMPOTENCY_IN_PROGRESS: espera e repete com a MESMA chave', async () => {
    const { timing } = await import('../billingService');
    const sleep = vi.spyOn(timing, 'sleep').mockResolvedValue();
    post.mockRejectedValueOnce(httpError(409, 'IDEMPOTENCY_IN_PROGRESS')).mockResolvedValueOnce(ok('Pending'));
    const c = await BillingService.createCheckout(input);
    expect(c.status).toBe('Pending');
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledTimes(2);
    expect(keyOf(0)).toBe(keyOf(1));
  });

  it('409 persistente desiste após as tentativas e mantém a chave', async () => {
    const { timing } = await import('../billingService');
    vi.spyOn(timing, 'sleep').mockResolvedValue();
    post.mockRejectedValue(httpError(409, 'IDEMPOTENCY_IN_PROGRESS'));
    await expect(BillingService.createCheckout(input)).rejects.toMatchObject({ code: 'IDEMPOTENCY_IN_PROGRESS' });
    expect(post).toHaveBeenCalledTimes(4);
    post.mockResolvedValue(ok('Pending'));
    await BillingService.createCheckout(input);
    expect(keyOf(4)).toBe(keyOf(0));
  });

  it('202 (retido para análise): devolve checkout Created sem pix/url e mantém a intenção', async () => {
    post.mockResolvedValue({ data: { data: { transactionId: 'tx-9', status: 'Created', planCode: 'PRO', amountInCents: 14900, method: 'PIX_TRANSPARENT', expiresAt: null, checkoutUrl: null, pix: null, paidAt: null } }, status: 202 });
    const c = await BillingService.createCheckout(input);
    expect(c).toMatchObject({ id: 'tx-9', status: 'Created', pix: null, checkoutUrl: null });
    await BillingService.createCheckout(input);
    expect(keyOf(0)).toBe(keyOf(1));
  });

  it('reutiliza a chave com checkout ainda pendente (duplo envio devolve o mesmo checkout)', async () => {
    post.mockResolvedValue(ok('Pending'));
    await BillingService.createCheckout(input);
    await BillingService.createCheckout(input);
    expect(keyOf(0)).toBe(keyOf(1));
  });

  it('gera chave nova após estado terminal e após recusa definitiva (422)', async () => {
    post.mockResolvedValueOnce(ok('Pending'));
    await BillingService.createCheckout(input);
    IntentStore.clearByCheckout('tx-1');
    post.mockRejectedValueOnce(httpError(422, 'RISK_DENIED')).mockResolvedValueOnce(ok('Pending'));
    await expect(BillingService.createCheckout(input)).rejects.toMatchObject({ kind: 'validation', code: 'RISK_DENIED' });
    await BillingService.createCheckout(input);
    expect(new Set([keyOf(0), keyOf(1), keyOf(2)]).size).toBe(3);
  });

  it('chaves diferentes para intenções diferentes', async () => {
    post.mockResolvedValue(ok('Pending'));
    await BillingService.createCheckout(input);
    await BillingService.createCheckout({ ...input, method: 'HOSTED' });
    expect(keyOf(0)).not.toBe(keyOf(1));
  });

  it('nunca envia preço no corpo nem guarda token ou brCode no storage', async () => {
    post.mockResolvedValue(ok('Pending'));
    await BillingService.createCheckout(input);
    expect(post.mock.calls[0][1]).toEqual({ planCode: 'PRO', method: 'PIX_TRANSPARENT' });
    const stored = sessionStorage.getItem('liderum.billing.intents.v1') ?? '';
    expect(stored).not.toMatch(/token|brCode|amount|price/i);
  });

  it('classifica 401, 422, 429 e 503', async () => {
    const cases = [[401, 'unauthorized'], [422, 'validation'], [429, 'rate_limited'], [503, 'unavailable']] as const;
    for (const [status, kind] of cases) {
      post.mockRejectedValueOnce(httpError(status));
      await expect(BillingService.createCheckout({ ...input, planCode: `P${status}` })).rejects.toMatchObject({ kind });
    }
  });
});
