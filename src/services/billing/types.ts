// DTOs = formato do Liderum.Payments (PAYMENTS-WORKFLOW.md seção 5). Models = formato usado pela UI.

export type CheckoutMethod = 'PIX_TRANSPARENT' | 'HOSTED';

export type CheckoutStatus =
  | 'Created' | 'PendingGateway' | 'Pending'
  | 'Paid' | 'Refunded' | 'Disputed' | 'Lost'
  | 'Expired' | 'Cancelled' | 'Failed' | 'Denied'
  | 'Unknown';

export interface PlanLimitsDto { maxActiveWorks: number | null; maxMembers: number | null; maxStorageMb: number | null }
export interface PlanDto {
  id: string; planCode: string; name: string; priceInCents: number;
  tagline?: string | null; highlighted?: boolean; purchasable?: boolean;
  features?: string[] | null; limits?: Partial<PlanLimitsDto> | null; modules?: string[] | null;
  listPriceInCents?: number; extraSeatPriceInCents?: number | null; maxExtraSeats?: number;
}
export interface Plan {
  id: string; code: string; name: string; priceInCents: number;
  tagline: string; highlighted: boolean; purchasable: boolean;
  features: string[]; limits: PlanLimitsDto; modules: string[];
  /** Preço de tabela da fase de escala; 0 = sem. A vitrine mostra riscado enquanto o lançamento durar. */
  listPriceInCents: number;
  /** null = o plano não vende usuário extra. */
  extraSeatPriceInCents: number | null;
  maxExtraSeats: number;
}

export interface CheckoutDto {
  transactionId: string;
  status: string;
  planCode: string;
  amountInCents: number;
  method: string;
  expiresAt: string | null;
  checkoutUrl: string | null;
  pix: { brCode: string; brCodeBase64: string } | null;
  paidAt: string | null;
  extraSeats?: number;
}
export interface Checkout {
  id: string;
  status: CheckoutStatus;
  planCode: string;
  amountInCents: number;
  method: CheckoutMethod;
  expiresAt: Date | null;
  checkoutUrl: string | null;
  pix: { brCode: string; qrImageSrc: string | null } | null;
  paidAt: Date | null;
  extraSeats: number;
}

export interface CreateCheckoutInput {
  planCode: string;
  method: CheckoutMethod;
  /** Usuários além do limite base do plano (cobrados por período). O servidor valida o teto e calcula o total. */
  extraSeats?: number;
  /** Cliente opcional (PIX com dados do pagador). Cupom NÃO é suportado pela API (422 COUPON_NOT_SUPPORTED). */
  customer?: { name?: string; email?: string; taxId?: string; cellphone?: string };
}

export interface SubscriptionDto {
  planCode: string | null;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  renewable: boolean;
  /** Dias até o fim do período (negativo = vencida). */
  daysRemaining?: number | null;
  graceEndsAt?: string | null;
  planName?: string | null;
  limits?: Partial<PlanLimitsDto> | null;
  features?: string[] | null;
  extraSeats?: number;
}
export interface Subscription {
  planCode: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  renewable: boolean;
  daysRemaining: number | null;
  graceEndsAt: Date | null;
  planName: string | null;
  limits: PlanLimitsDto | null;
  features: string[];
  /** Usuários extras já incluídos em limits.maxMembers. */
  extraSeats: number;
}

export interface Page<T> { items: T[]; totalRecords: number; totalPages: number }

// ── Admin ────────────────────────────────────────────────────────────────
export interface DashboardSummaryDto {
  period: { from: string; to: string };
  activeCustomers: number; newCustomers: number; churnedCustomers: number; churnRate: number;
  mrrInCents: number; revenueInCents: number; avgTicketInCents: number;
  checkoutsCreated: number; checkoutsPaid: number; conversionRate: number;
  pendingCount: number; failedCount: number; refundedCount: number; disputedCount: number; refundRate: number;
  byPlan: { planCode: string; customers: number; revenueInCents: number }[];
  previousPeriod: { revenueInCents: number; activeCustomers: number; newCustomers: number } | null;
}
export interface DashboardSummary extends Omit<DashboardSummaryDto, 'period'> {
  period: { from: Date; to: Date };
}

export interface TimeseriesPointDto {
  bucket: string; revenueInCents: number; paidCount: number; newCustomers: number; createdCount: number;
}
export interface TimeseriesPoint {
  bucket: Date; revenueInCents: number; paidCount: number; newCustomers: number; createdCount: number;
}

export type CustomerStatus = 'Active' | 'PastDue' | 'Churned' | 'Trial' | 'Suspended' | 'Unknown';
export interface CustomerDto {
  tenantId: string; tenantName: string; planCode: string | null; status: string;
  since: string | null; currentPeriodEnd: string | null; lifetimeValueInCents: number; lastPaymentAt: string | null;
}
export interface Customer {
  tenantId: string; tenantName: string; planCode: string | null; status: CustomerStatus;
  since: Date | null; currentPeriodEnd: Date | null; lifetimeValueInCents: number; lastPaymentAt: Date | null;
}

export type Granularity = 'day' | 'week' | 'month';
