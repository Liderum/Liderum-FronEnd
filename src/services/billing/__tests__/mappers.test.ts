import { describe, expect, it } from 'vitest';
import {
  isTerminalStatus, mapCheckout, mapCustomer, mapPlan, mapStatus, mapSubscription, mapSummary, toQrImageSrc,
  type CheckoutDto, type DashboardSummaryDto,
} from '@/services/billing';
import { nextPollInterval } from '@/modules/billing/lib';
import { deltaRatio } from '@/modules/billing-admin/lib';

const dto: CheckoutDto = {
  transactionId: 'tx-1', status: 'Pending', planCode: 'PRO', amountInCents: 14900, method: 'PIX_TRANSPARENT',
  expiresAt: '2026-10-10T12:30:00Z', checkoutUrl: null, pix: { brCode: '000201abc', brCodeBase64: 'iVBORw0KGgo=' }, paidAt: null,
};

describe('mapeamento de DTOs', () => {
  it('mapeia checkout PIX (DTO -> modelo)', () => {
    const c = mapCheckout(dto);
    expect(c).toMatchObject({ id: 'tx-1', status: 'Pending', planCode: 'PRO', amountInCents: 14900, method: 'PIX_TRANSPARENT' });
    expect(c.expiresAt).toEqual(new Date('2026-10-10T12:30:00Z'));
    expect(c.pix?.qrImageSrc).toBe('data:image/png;base64,iVBORw0KGgo=');
    expect(c.paidAt).toBeNull();
  });

  it('descarta QR com conteúdo suspeito e status desconhecido vira Unknown', () => {
    expect(toQrImageSrc('" onerror="alert(1)')).toBeNull();
    expect(toQrImageSrc('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(mapStatus('qualquer')).toBe('Unknown');
    expect(mapStatus('PAID')).toBe('Paid');
  });

  it('identifica estados terminais', () => {
    for (const s of ['Paid', 'Expired', 'Cancelled', 'Failed', 'Denied'] as const) expect(isTerminalStatus(s)).toBe(true);
    for (const s of ['Created', 'PendingGateway', 'Pending', 'Unknown'] as const) expect(isTerminalStatus(s)).toBe(false);
  });

  it('mapeia plano, assinatura, resumo e cliente', () => {
    expect(mapPlan({ id: '1', planCode: 'PRO', name: 'Pro', priceInCents: 100 })).toMatchObject({ id: '1', code: 'PRO', name: 'Pro', priceInCents: 100, purchasable: true, features: [] });
    expect(mapSubscription({ planCode: 'PRO', status: 'Active', currentPeriodStart: '2026-10-01T00:00:00Z', currentPeriodEnd: null, renewable: true }))
      .toMatchObject({ planCode: 'PRO', renewable: true, currentPeriodEnd: null });
    const s: DashboardSummaryDto = {
      period: { from: '2026-09-10T00:00:00Z', to: '2026-10-10T00:00:00Z' }, activeCustomers: 1, newCustomers: 1, churnedCustomers: 0, churnRate: 0,
      mrrInCents: 1, revenueInCents: 2, avgTicketInCents: 3, checkoutsCreated: 1, checkoutsPaid: 1, conversionRate: 1, pendingCount: 0,
      failedCount: 0, refundedCount: 0, disputedCount: 0, refundRate: 0, byPlan: [], previousPeriod: null,
    };
    expect(mapSummary(s).period.from).toBeInstanceOf(Date);
    expect(mapCustomer({ tenantId: 't', tenantName: 'ACME', planCode: 'PRO', status: 'pastdue', since: null, currentPeriodEnd: null, lifetimeValueInCents: 5, lastPaymentAt: null }).status).toBe('PastDue');
  });
});

describe('backoff do polling', () => {
  it('2s, 5s e 10s, parando no teto de 10 min', () => {
    expect(nextPollInterval({ status: 'Pending', elapsedMs: 0 })).toBe(2000);
    expect(nextPollInterval({ status: 'Pending', elapsedMs: 9_999 })).toBe(2000);
    expect(nextPollInterval({ status: 'Pending', elapsedMs: 10_000 })).toBe(5000);
    expect(nextPollInterval({ status: 'Pending', elapsedMs: 30_000 })).toBe(10_000);
    expect(nextPollInterval({ status: 'Pending', elapsedMs: 599_999 })).toBe(10_000);
    expect(nextPollInterval({ status: 'Pending', elapsedMs: 600_000 })).toBe(false);
  });
  it('para em qualquer estado terminal', () => {
    for (const s of ['Paid', 'Expired', 'Cancelled', 'Failed', 'Denied'] as const) expect(nextPollInterval({ status: s, elapsedMs: 0 })).toBe(false);
  });
});

describe('delta vs período anterior', () => {
  it('calcula razão e trata base zero', () => {
    expect(deltaRatio(150, 100)).toBeCloseTo(0.5);
    expect(deltaRatio(50, 100)).toBeCloseTo(-0.5);
    expect(deltaRatio(10, 0)).toBeNull();
    expect(deltaRatio(10, undefined)).toBeNull();
  });
});
