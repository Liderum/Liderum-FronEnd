let accessToken: string | null = null;
let refreshToken: string | null = null;
let onAuthFailure: (() => void) | null = null;

export const tokenStore = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => { accessToken = token; },
  getRefreshToken: () => refreshToken,
  setRefreshToken: (token: string | null) => { refreshToken = token; },
  clear() {
    accessToken = null;
    refreshToken = null;
  },
  setOnAuthFailure: (cb: (() => void) | null) => { onAuthFailure = cb; },
  notifyAuthFailure() {
    onAuthFailure?.();
  },
};
