import { describe, expect, it, vi } from 'vitest';

const get = vi.fn();
vi.mock('@/services/api/apiFactory', () => ({ paymentsApi: { get: (...a: unknown[]) => get(...a), post: vi.fn() } }));

import { BillingService } from '../billingService';
import { mapCheckout, mapCustomer, friendlyTenantName } from '../mappers';

describe('contrato real do backend', () => {
  it('GET /subscription sem plano (200 com status None) vira null', async () => {
    get.mockResolvedValueOnce({ data: { data: { planCode: null, status: 'None', currentPeriodStart: null, currentPeriodEnd: null, renewable: true } } });
    await expect(BillingService.getSubscription()).resolves.toBeNull();
  });

  it('GET /subscription com plano mapeia datas', async () => {
    get.mockResolvedValueOnce({ data: { data: { planCode: 'PRO', status: 'Active', currentPeriodStart: '2026-10-01T00:00:00Z', currentPeriodEnd: '2026-11-01T00:00:00Z', renewable: false } } });
    const s = await BillingService.getSubscription();
    expect(s).toMatchObject({ planCode: 'PRO', status: 'Active', renewable: false });
    expect(s?.currentPeriodEnd).toBeInstanceOf(Date);
  });

  it('brCodeBase64 em base64 puro (sem data:) e vazio quando ausente', () => {
    const base = { transactionId: 't', status: 'Pending', planCode: 'PRO', amountInCents: 1, method: 'PIX_TRANSPARENT', expiresAt: null, checkoutUrl: null, paidAt: null };
    expect(mapCheckout({ ...base, pix: { brCode: 'x', brCodeBase64: 'iVBORw0KGgo=' } }).pix?.qrImageSrc).toBe('data:image/png;base64,iVBORw0KGgo=');
    expect(mapCheckout({ ...base, pix: { brCode: 'x', brCodeBase64: '' } }).pix?.qrImageSrc).toBeNull();
  });

  it('tenantName igual ao tenantId vira nome amigável; plano nulo e status desconhecido são tolerados', () => {
    const id = '3f2b8c1e-aaaa-bbbb-cccc-1234567890ab';
    expect(friendlyTenantName(id, id)).toBe('Cliente 3f2b8c1e');
    expect(friendlyTenantName('ACME', id)).toBe('ACME');
    const c = mapCustomer({ tenantId: id, tenantName: id, planCode: null, status: 'Suspended', since: null, currentPeriodEnd: null, lifetimeValueInCents: 0, lastPaymentAt: null });
    expect(c).toMatchObject({ tenantName: 'Cliente 3f2b8c1e', planCode: null, status: 'Suspended' });
    expect(mapCustomer({ ...{ tenantId: id, tenantName: id, planCode: null, since: null, currentPeriodEnd: null, lifetimeValueInCents: 0, lastPaymentAt: null }, status: 'Xyz' }).status).toBe('Unknown');
  });
});

describe('subscription com daysRemaining', () => {
  it('mapeia daysRemaining (pode ser negativo) e graceEndsAt', async () => {
    get.mockResolvedValueOnce({ data: { data: { planCode: 'PRO', status: 'PastDue', currentPeriodStart: null, currentPeriodEnd: '2026-10-01T00:00:00Z', renewable: true, daysRemaining: -2, graceEndsAt: '2026-10-04T00:00:00Z' } } });
    const s = await BillingService.getSubscription();
    expect(s?.daysRemaining).toBe(-2);
    expect(s?.graceEndsAt).toBeInstanceOf(Date);
  });
});
