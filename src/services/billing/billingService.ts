import { paymentsApi } from '@/services/api/apiFactory';
import { API_CONFIG } from '@/config/api';
import { IntentStore, intentId } from './idempotency';
import { BillingError, toBillingError } from './errors';
import {
  isTerminalStatus, mapCheckout, mapCustomer, mapPlan, mapSubscription, mapSummary, mapTimeseriesPoint,
} from './mappers';
import type {
  Checkout, CheckoutDto, CreateCheckoutInput, Customer, CustomerDto, DashboardSummary, DashboardSummaryDto,
  Granularity, Page, Plan, PlanDto, Subscription, SubscriptionDto, TimeseriesPoint, TimeseriesPointDto,
} from './types';

interface Envelope<T> { data: T; meta?: { totalRecords: number; totalPages: number } }

const IN_PROGRESS_RETRIES = 3;
const IN_PROGRESS_DELAY_MS = 2000;
/** Isolado para os testes não esperarem de verdade. */
export const timing = { sleep: (ms: number) => new Promise<void>((r) => setTimeout(r, ms)) };

function assertConfigured() {
  if (!API_CONFIG.PAYMENTS.BASE_URL) {
    throw new BillingError('unavailable', null, null, 'Serviço de pagamentos não configurado neste ambiente.');
  }
}

async function call<T>(fn: () => Promise<T>): Promise<T> {
  assertConfigured();
  try {
    return await fn();
  } catch (e) {
    throw toBillingError(e);
  }
}

const toPage = <D, M>(env: Envelope<D[]>, map: (d: D) => M): Page<M> => ({
  items: (env.data ?? []).map(map),
  totalRecords: env.meta?.totalRecords ?? env.data?.length ?? 0,
  totalPages: env.meta?.totalPages ?? 1,
});

export class BillingService {
  static async listPlans(): Promise<Plan[]> {
    return call(async () => {
      const { data } = await paymentsApi.get<Envelope<PlanDto[]>>('/plans');
      return (data.data ?? []).map(mapPlan);
    });
  }

  /**
   * Cria o checkout. O preço NUNCA é enviado: o servidor resolve pelo planCode.
   * A Idempotency-Key é por intenção e reaproveitada em qualquer retry até estado terminal
   * (ou recusa definitiva da API), então duplo clique/retry de rede não gera cobrança dupla.
   */
  static async createCheckout(input: CreateCheckoutInput): Promise<Checkout> {
    const extraSeats = input.extraSeats && input.extraSeats > 0 ? Math.floor(input.extraSeats) : 0;
    const id = intentId(input.planCode, input.method, extraSeats);
    const intent = IntentStore.getOrCreate(id);
    const body: CreateCheckoutInput = { planCode: input.planCode, method: input.method };
    if (extraSeats > 0) body.extraSeats = extraSeats;
    if (input.customer) body.customer = input.customer;

    try {
      assertConfigured();
      // 409 IDEMPOTENCY_IN_PROGRESS: a requisição original ainda roda; espera e repete com a MESMA chave.
      for (let attempt = 0; ; attempt++) {
        try {
          const { data } = await paymentsApi.post<Envelope<CheckoutDto>>('/checkouts', body, {
            headers: { 'Idempotency-Key': intent.key },
          });
          // 201 criado, 200 replay/reaproveitamento, 202 retido p/ análise (status Created, sem pix/url).
          const checkout = mapCheckout(data.data);
          if (isTerminalStatus(checkout.status)) IntentStore.clear(id);
          else IntentStore.attachCheckout(id, checkout.id);
          return checkout;
        } catch (e) {
          const err = toBillingError(e);
          if (err.code === 'IDEMPOTENCY_IN_PROGRESS' && attempt < IN_PROGRESS_RETRIES) {
            await timing.sleep(IN_PROGRESS_DELAY_MS);
            continue;
          }
          throw err;
        }
      }
    } catch (e) {
      const err = toBillingError(e);
      // Mantém a chave só quando o retry é seguro: sem resposta (rede/timeout), 429, 409 em andamento e 401.
      // Qualquer outra recusa, inclusive 5xx (o servidor grava a falha sob a chave), libera a intenção.
      const keepKey = err.status === null || err.kind === 'rate_limited' || err.kind === 'unauthorized' || err.code === 'IDEMPOTENCY_IN_PROGRESS';
      if (!keepKey) IntentStore.clear(id);
      throw err;
    }
  }

  static async getCheckout(id: string): Promise<Checkout> {
    const checkout = await call(async () => {
      const { data } = await paymentsApi.get<Envelope<CheckoutDto>>(`/checkouts/${encodeURIComponent(id)}`);
      return mapCheckout(data.data);
    });
    if (isTerminalStatus(checkout.status)) IntentStore.clearByCheckout(checkout.id);
    return checkout;
  }

  static async cancelCheckout(id: string): Promise<Checkout> {
    const checkout = await call(async () => {
      const { data } = await paymentsApi.post<Envelope<CheckoutDto>>(`/checkouts/${encodeURIComponent(id)}/cancel`);
      return mapCheckout(data.data);
    });
    IntentStore.clearByCheckout(checkout.id);
    return checkout;
  }

  static async listCheckouts(page = 1, pageSize = 10): Promise<Page<Checkout>> {
    return call(async () => {
      const { data } = await paymentsApi.get<Envelope<CheckoutDto[]>>('/checkouts', {
        params: { page, 'page-size': pageSize },
      });
      return toPage(data, mapCheckout);
    });
  }

  /** Checkout ainda pagável mais recente (retomada ao reabrir a tela). */
  static async findResumableCheckout(): Promise<Checkout | null> {
    const page = await BillingService.listCheckouts(1, 10);
    const now = Date.now();
    return (
      page.items.find((c) => c.status === 'Pending' && (!c.expiresAt || c.expiresAt.getTime() > now)) ?? null
    );
  }

  /** `null` = tenant sem assinatura (404). */
  static async getSubscription(): Promise<Subscription | null> {
    try {
      return await call(async () => {
        const { data } = await paymentsApi.get<Envelope<SubscriptionDto>>('/subscription');
        // Sem plano a API responde 200 com status "None" e planCode nulo.
        if (!data.data || !data.data.planCode || data.data.status === 'None') return null;
        return mapSubscription(data.data);
      });
    } catch (e) {
      if (e instanceof BillingError && e.kind === 'not_found') return null;
      throw e;
    }
  }
}

export class PaymentsAdminService {
  static async getSummary(from: Date, to: Date): Promise<DashboardSummary> {
    return call(async () => {
      const { data } = await paymentsApi.get<Envelope<DashboardSummaryDto>>('/admin/dashboard/summary', {
        params: { from: from.toISOString(), to: to.toISOString() },
      });
      return mapSummary(data.data);
    });
  }

  static async getTimeseries(from: Date, to: Date, granularity: Granularity): Promise<TimeseriesPoint[]> {
    return call(async () => {
      const { data } = await paymentsApi.get<Envelope<TimeseriesPointDto[]>>('/admin/dashboard/timeseries', {
        params: { from: from.toISOString(), to: to.toISOString(), granularity },
      });
      return (data.data ?? []).map(mapTimeseriesPoint);
    });
  }

  static async listCustomers(status: string | undefined, page: number, pageSize = 10): Promise<Page<Customer>> {
    return call(async () => {
      const { data } = await paymentsApi.get<Envelope<CustomerDto[]>>('/admin/dashboard/customers', {
        params: { status: status || undefined, page, 'page-size': pageSize },
      });
      return toPage(data, mapCustomer);
    });
  }
}
