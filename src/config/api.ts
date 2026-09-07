// Configuração unificada de API — URLs resolvidas em build time via VITE_* env vars.
//
// Dois ambientes:
//   dsv — desenvolvimento local + Vercel Preview (sem URL fixa)
//   prd — produção em https://liderum.com.br/ (Vercel Production)
export interface ApiConfig {
  AUTH: { BASE_URL: string };
  USERS: { BASE_URL: string };
  WORKS: { BASE_URL: string };
  RBAC: { BASE_URL: string };
  TENANT: { BASE_URL: string };
}

export type ApiModule = keyof ApiConfig;

type AppEnv = 'dsv' | 'prd';

const getEnvironment = (): AppEnv => {
  // VITE_APP_ENV é injetado pela Vercel por ambiente (prd em Production, dsv em Preview).
  // Em desenvolvimento local, cai no MODE do Vite (dsv via `npm run dev`).
  const appEnv = import.meta.env.VITE_APP_ENV as string | undefined;
  if (appEnv === 'prd') return 'prd';
  if (appEnv === 'dsv') return 'dsv';
  if (import.meta.env.MODE === 'prd' || import.meta.env.MODE === 'production') return 'prd';
  return 'dsv';
};

// Liderum.Security.API roda em http://localhost:5065 (ver launchSettings.json).
// Fallbacks para localhost são válidos apenas em dsv.
const dsvConfig: ApiConfig = {
  AUTH:  { BASE_URL: import.meta.env.VITE_AUTH_API_URL  || 'http://localhost:5065/liderum/api/login' },
  USERS: { BASE_URL: import.meta.env.VITE_USERS_API_URL || 'http://localhost:5065/liderum/api/user' },
  WORKS: { BASE_URL: import.meta.env.VITE_WORKS_API_URL || 'https://localhost:7141/api/v1' },
  RBAC:  { BASE_URL: import.meta.env.VITE_RBAC_API_URL  || 'http://localhost:5065/liderum/api/rbac' },
  TENANT: { BASE_URL: import.meta.env.VITE_TENANT_API_URL || 'http://localhost:5065/liderum/api/tenant' },
};

// Sem fallback — prd exige que todas as VITE_* estejam definidas na Vercel.
// Se faltar alguma, a validação abaixo aborta o startup com erro claro.
const prdConfig: ApiConfig = {
  AUTH:  { BASE_URL: import.meta.env.VITE_AUTH_API_URL  || '' },
  USERS: { BASE_URL: import.meta.env.VITE_USERS_API_URL || '' },
  WORKS: { BASE_URL: import.meta.env.VITE_WORKS_API_URL || '' },
  RBAC:  { BASE_URL: import.meta.env.VITE_RBAC_API_URL  || '' },
  TENANT: { BASE_URL: import.meta.env.VITE_TENANT_API_URL || '' },
};

/**
 * Valida que todas as URLs obrigatórias estão preenchidas em prd.
 * Lança um erro em tempo de inicialização para evitar falhas silenciosas em produção.
 */
function validateConfig(config: ApiConfig, env: AppEnv): void {
  const required: (keyof ApiConfig)[] = ['AUTH', 'USERS', 'WORKS', 'RBAC', 'TENANT'];
  const missing = required.filter((key) => !config[key].BASE_URL);
  if (missing.length > 0) {
    throw new Error(
      `[Liderum] Variáveis de ambiente obrigatórias não definidas para o ambiente "${env}": ` +
      missing.map((k) => `VITE_${k}_API_URL`).join(', ') +
      '. Defina-as nas variáveis de ambiente da Vercel (Production).',
    );
  }
}

export const getApiConfig = (): ApiConfig => {
  const environment = getEnvironment();

  if (environment === 'prd') {
    validateConfig(prdConfig, 'prd');
    return prdConfig;
  }

  return dsvConfig;
};

export const API_CONFIG = getApiConfig();

if (import.meta.env.DEV) {
  console.log('[Liderum] Ambiente detectado:', getEnvironment());
}
