let accessToken: string | null = null;
let refreshToken: string | null = null;
// Token de checkout (pagamento pendente): SOMENTE em memória, nunca em localStorage/sessionStorage.
// `clear()` NÃO o apaga de propósito (uma falha de refresh que devolve 402 limpa a sessão e guarda o token de checkout).
let checkoutToken: string | null = null;
let checkoutTokenExpiresAt: string | null = null;
let onAuthFailure: (() => void) | null = null;
let onPaymentRequired: (() => void) | null = null;

export const tokenStore = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => { accessToken = token; },
  getRefreshToken: () => refreshToken,
  setRefreshToken: (token: string | null) => { refreshToken = token; },
  getCheckoutToken: () => checkoutToken,
  getCheckoutTokenExpiresAt: () => checkoutTokenExpiresAt,
  setCheckoutToken: (token: string | null, expiresAt?: string | null) => {
    checkoutToken = token;
    checkoutTokenExpiresAt = token ? expiresAt ?? null : null;
  },
  clearCheckoutToken() {
    checkoutToken = null;
    checkoutTokenExpiresAt = null;
  },
  clear() {
    accessToken = null;
    refreshToken = null;
  },
  setOnAuthFailure: (cb: (() => void) | null) => { onAuthFailure = cb; },
  notifyAuthFailure() {
    onAuthFailure?.();
  },
  setOnPaymentRequired: (cb: (() => void) | null) => { onPaymentRequired = cb; },
  notifyPaymentRequired() {
    onPaymentRequired?.();
  },
};
