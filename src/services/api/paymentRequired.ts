import axios from 'axios';

export interface PaymentRequiredInfo {
  checkoutToken: string;
  checkoutTokenExpiresAt: string | null;
}

/** Erro lançado pelo login quando o tenant está com pagamento pendente (HTTP 402). */
export class PaymentRequiredError extends Error {
  constructor(public info: PaymentRequiredInfo) {
    super('Pagamento pendente');
    this.name = 'PaymentRequiredError';
  }
}

/**
 * Extrai o token de checkout de um 402 ProblemDetails `{code:"PAYMENT_REQUIRED", checkoutToken, checkoutTokenExpiresAt}`.
 * Retorna null para qualquer outro erro (inclusive 402 sem token).
 */
export function parsePaymentRequired(err: unknown): PaymentRequiredInfo | null {
  if (!axios.isAxiosError(err) || err.response?.status !== 402) return null;
  const d = err.response.data as { code?: string; checkoutToken?: string; checkoutTokenExpiresAt?: string } | undefined;
  if (!d || d.code !== 'PAYMENT_REQUIRED' || typeof d.checkoutToken !== 'string' || !d.checkoutToken) return null;
  return { checkoutToken: d.checkoutToken, checkoutTokenExpiresAt: d.checkoutTokenExpiresAt ?? null };
}
