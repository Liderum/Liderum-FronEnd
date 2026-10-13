import axios from 'axios';

export type BillingErrorKind =
  | 'unauthorized' | 'forbidden' | 'validation' | 'rate_limited'
  | 'unavailable' | 'not_found' | 'conflict' | 'unknown';

export class BillingError extends Error {
  constructor(
    public kind: BillingErrorKind,
    public status: number | null,
    public code: string | null,
    message: string,
    public retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = 'BillingError';
  }
  /** Retry com a MESMA Idempotency-Key é seguro; nos demais a intenção deve ser descartada. */
  get retryable() {
    return this.kind === 'unavailable' || this.kind === 'rate_limited' || this.code === 'IDEMPOTENCY_IN_PROGRESS';
  }
}

const CODE_MESSAGES: Record<string, string> = {
  RISK_DENIED: 'Não foi possível concluir esta cobrança. Entre em contato com o suporte.',
  CHECKOUT_EXPIRED: 'Este pagamento expirou. Inicie uma nova cobrança.',
  IDEMPOTENCY_KEY_REUSED: 'Esta solicitação já foi usada com outros dados. Tente novamente.',
  COUPON_NOT_SUPPORTED: 'Cupons ainda não são suportados.',
  IDEMPOTENCY_IN_PROGRESS: 'Seu pagamento ainda está sendo processado. Aguarde um instante.',
  EXTRA_SEATS_INVALID: 'A quantidade de usuários extras não é permitida neste plano.',
  CHECKOUT_PENDING_SEATS_MISMATCH: 'Você tem um PIX em aberto com outra quantidade de usuários. Pague ou cancele-o para gerar um novo.',
  INVALID_STATE_TRANSITION: 'O pagamento não está mais em um estado que permita esta ação.',
};

const KIND_MESSAGES: Record<BillingErrorKind, string> = {
  unauthorized: 'Sua sessão expirou. Entre novamente para continuar.',
  forbidden: 'Você não tem permissão para esta ação.',
  validation: 'Não foi possível processar a solicitação. Verifique os dados e tente novamente.',
  rate_limited: 'Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente de novo.',
  unavailable: 'Serviço de pagamentos indisponível no momento. Tente novamente em instantes.',
  not_found: 'Registro não encontrado.',
  conflict: 'Esta solicitação conflita com uma operação em andamento.',
  unknown: 'Ocorreu um erro inesperado. Tente novamente.',
};

function kindFromStatus(status: number | null): BillingErrorKind {
  if (status === null) return 'unavailable'; // rede/timeout: o servidor pode ou não ter processado
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rate_limited';
  if (status === 400 || status === 422) return 'validation';
  if (status >= 500) return 'unavailable';
  return 'unknown';
}

export function toBillingError(err: unknown): BillingError {
  if (err instanceof BillingError) return err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? null;
    const body = err.response?.data as { errors?: { code?: string; detail?: string }[] } | undefined;
    const code = body?.errors?.[0]?.code ?? null;
    let kind = kindFromStatus(status);
    if (code === 'RATE_LIMITED') kind = 'rate_limited';
    if (code === 'GATEWAY_UNAVAILABLE') kind = 'unavailable';
    const retryHeader = Number(err.response?.headers?.['retry-after']);
    const retry = Number.isFinite(retryHeader) && retryHeader > 0 ? Math.min(retryHeader, 300) : null;
    const message = (code && CODE_MESSAGES[code]) || KIND_MESSAGES[kind];
    return new BillingError(kind, status, code, message, retry);
  }
  return new BillingError('unknown', null, null, KIND_MESSAGES.unknown);
}
