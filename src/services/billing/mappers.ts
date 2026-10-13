import type {
  Checkout, CheckoutDto, CheckoutMethod, CheckoutStatus, Customer, CustomerDto, PlanLimitsDto, CustomerStatus,
  DashboardSummary, DashboardSummaryDto, Plan, PlanDto, Subscription, SubscriptionDto,
  TimeseriesPoint, TimeseriesPointDto,
} from './types';
import { PLAN_CATALOG, getCatalogPlan } from '@/constants/plans';

const STATUSES: readonly CheckoutStatus[] = [
  'Created', 'PendingGateway', 'Pending', 'Paid', 'Refunded', 'Disputed', 'Lost',
  'Expired', 'Cancelled', 'Failed', 'Denied',
];
const TERMINAL: ReadonlySet<CheckoutStatus> = new Set<CheckoutStatus>([
  'Paid', 'Refunded', 'Disputed', 'Lost', 'Expired', 'Cancelled', 'Failed', 'Denied',
]);

export const isTerminalStatus = (s: CheckoutStatus) => TERMINAL.has(s);
export const isPendingStatus = (s: CheckoutStatus) =>
  s === 'Created' || s === 'PendingGateway' || s === 'Pending' || s === 'Unknown';

export function mapStatus(raw: string | null | undefined): CheckoutStatus {
  const found = STATUSES.find((s) => s.toLowerCase() === String(raw ?? '').toLowerCase());
  return found ?? 'Unknown';
}

const toDate = (v: string | null | undefined): Date | null => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Aceita base64 puro ou data URI PNG. Qualquer outra coisa é descartada (nunca vira src de <img>).
const BASE64_RE = /^[A-Za-z0-9+/=\s]+$/;
export function toQrImageSrc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const prefix = 'data:image/png;base64,';
  const payload = raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
  if (!BASE64_RE.test(payload)) return null;
  return prefix + payload.replace(/\s+/g, '');
}

const NO_LIMITS: PlanLimitsDto = { maxActiveWorks: null, maxMembers: null, maxStorageMb: null };

const mapLimits = (l: Partial<PlanLimitsDto> | null | undefined, fallback: PlanLimitsDto): PlanLimitsDto => ({
  maxActiveWorks: l && 'maxActiveWorks' in l ? l.maxActiveWorks ?? null : fallback.maxActiveWorks,
  maxMembers: l && 'maxMembers' in l ? l.maxMembers ?? null : fallback.maxMembers,
  maxStorageMb: l && 'maxStorageMb' in l ? l.maxStorageMb ?? null : fallback.maxStorageMb,
});

/** A API manda; o catálogo local só preenche o que vier ausente (texto pt-BR, destaque, limites). */
export function mapPlan(dto: PlanDto): Plan {
  const cat = getCatalogPlan(dto.planCode);
  const fallbackLimits = cat?.limits ?? NO_LIMITS;
  return {
    id: dto.id,
    code: dto.planCode,
    name: dto.name || cat?.name || dto.planCode,
    priceInCents: dto.priceInCents,
    tagline: dto.tagline || cat?.tagline || '',
    highlighted: dto.highlighted ?? cat?.highlighted ?? false,
    purchasable: dto.purchasable ?? cat?.purchasable ?? true,
    features: dto.features && dto.features.length > 0 ? dto.features : cat?.features ?? [],
    limits: mapLimits(dto.limits, fallbackLimits),
    modules: dto.modules ?? [],
    listPriceInCents: dto.listPriceInCents ?? cat?.listPriceInCents ?? 0,
    extraSeatPriceInCents: dto.extraSeatPriceInCents !== undefined ? dto.extraSeatPriceInCents : cat?.extraSeatPriceInCents ?? null,
    maxExtraSeats: dto.maxExtraSeats ?? cat?.maxExtraSeats ?? 0,
  };
}

/** Garante todos os campos de um Plan (tolerante a respostas/mocks antigos sem os campos novos). */
export function normalizePlan(p: Partial<Plan> & Pick<Plan, 'id' | 'code'>): Plan {
  return mapPlan({
    id: p.id, planCode: p.code, name: p.name ?? '', priceInCents: p.priceInCents ?? 0, tagline: p.tagline,
    highlighted: p.highlighted, purchasable: p.purchasable, features: p.features, limits: p.limits, modules: p.modules,
    listPriceInCents: p.listPriceInCents, extraSeatPriceInCents: p.extraSeatPriceInCents, maxExtraSeats: p.maxExtraSeats,
  });
}

/** Enterprise é só contato: se a API não o listar, o catálogo local garante o card. */
export function withEnterprise(plans: Plan[]): Plan[] {
  if (plans.some((p) => !p.purchasable)) return plans;
  const ent = PLAN_CATALOG.find((p) => !p.purchasable);
  if (!ent) return plans;
  return [...plans, {
    id: 'catalog-' + ent.code, code: ent.code, name: ent.name, priceInCents: 0, tagline: ent.tagline,
    highlighted: false, purchasable: false, features: ent.features, limits: ent.limits, modules: [],
    listPriceInCents: 0, extraSeatPriceInCents: null, maxExtraSeats: 0,
  }];
}

export function mapCheckout(dto: CheckoutDto): Checkout {
  const method: CheckoutMethod = dto.method === 'HOSTED' ? 'HOSTED' : 'PIX_TRANSPARENT';
  return {
    id: dto.transactionId,
    status: mapStatus(dto.status),
    planCode: dto.planCode,
    amountInCents: dto.amountInCents,
    method,
    expiresAt: toDate(dto.expiresAt),
    checkoutUrl: dto.checkoutUrl ?? null,
    pix: dto.pix ? { brCode: dto.pix.brCode, qrImageSrc: toQrImageSrc(dto.pix.brCodeBase64) } : null,
    paidAt: toDate(dto.paidAt),
    extraSeats: dto.extraSeats ?? 0,
  };
}

export function mapSubscription(dto: SubscriptionDto): Subscription {
  return {
    planCode: dto.planCode ?? '',
    status: dto.status,
    currentPeriodStart: toDate(dto.currentPeriodStart),
    currentPeriodEnd: toDate(dto.currentPeriodEnd),
    renewable: !!dto.renewable,
    daysRemaining: typeof dto.daysRemaining === 'number' ? dto.daysRemaining : null,
    graceEndsAt: toDate(dto.graceEndsAt),
    planName: dto.planName ?? null,
    limits: dto.limits ? mapLimits(dto.limits, NO_LIMITS) : null,
    features: dto.features ?? [],
    extraSeats: dto.extraSeats ?? 0,
  };
}

export function mapSummary(dto: DashboardSummaryDto): DashboardSummary {
  return {
    ...dto,
    period: { from: new Date(dto.period.from), to: new Date(dto.period.to) },
    byPlan: dto.byPlan ?? [],
    previousPeriod: dto.previousPeriod ?? null,
  };
}

export function mapTimeseriesPoint(dto: TimeseriesPointDto): TimeseriesPoint {
  return { ...dto, bucket: new Date(dto.bucket) };
}

const CUSTOMER_STATUSES: readonly CustomerStatus[] = ['Active', 'PastDue', 'Churned', 'Trial', 'Suspended'];

// Enquanto a Security não expõe o nome do tenant, a API devolve o próprio id em tenantName.
export function friendlyTenantName(name: string | null | undefined, tenantId: string): string {
  if (!name || name.toLowerCase() === tenantId.toLowerCase()) return `Cliente ${tenantId.slice(0, 8)}`;
  return name;
}

export function mapCustomer(dto: CustomerDto): Customer {
  const status = CUSTOMER_STATUSES.find((s) => s.toLowerCase() === String(dto.status).toLowerCase()) ?? 'Unknown';
  return {
    tenantId: dto.tenantId,
    tenantName: friendlyTenantName(dto.tenantName, dto.tenantId),
    planCode: dto.planCode,
    status,
    since: toDate(dto.since),
    currentPeriodEnd: toDate(dto.currentPeriodEnd),
    lifetimeValueInCents: dto.lifetimeValueInCents,
    lastPaymentAt: toDate(dto.lastPaymentAt),
  };
}
