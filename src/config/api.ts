// Configuração unificada de API — URLs resolvidas em build time via VITE_* env vars.
export interface ApiConfig {
  AUTH: { BASE_URL: string };
  USERS: { BASE_URL: string };
  WORKS: { BASE_URL: string };
  RBAC: { BASE_URL: string };
}

export type ApiModule = keyof ApiConfig;

const getEnvironment = (): 'development' | 'staging' | 'production' => {
  if (import.meta.env.MODE === 'production') return 'production';
  if (import.meta.env.MODE === 'staging') return 'staging';
  if (import.meta.env.MODE === 'development' || import.meta.env.DEV) return 'development';
  return 'production';
};

// Liderum.Security.API roda em http://localhost:5065 (ver launchSettings.json).
// Fallbacks para localhost são válidos apenas em development.
const developmentConfig: ApiConfig = {
  AUTH:  { BASE_URL: import.meta.env.VITE_AUTH_API_URL  || 'http://localhost:5065/liderum/api/login' },
  USERS: { BASE_URL: import.meta.env.VITE_USERS_API_URL || 'http://localhost:5065/liderum/api/user' },
  WORKS: { BASE_URL: import.meta.env.VITE_WORKS_API_URL || 'https://localhost:7141/api/v1' },
  RBAC:  { BASE_URL: import.meta.env.VITE_RBAC_API_URL  || 'http://localhost:5065/liderum/api/rbac' },
};

// Sem fallback para localhost — staging deve ter as variáveis VITE_* definidas.
// Se não estiverem definidas, a validação abaixo aborta o startup com erro claro.
const stagingConfig: ApiConfig = {
  AUTH:  { BASE_URL: import.meta.env.VITE_AUTH_API_URL  || '' },
  USERS: { BASE_URL: import.meta.env.VITE_USERS_API_URL || '' },
  WORKS: { BASE_URL: import.meta.env.VITE_WORKS_API_URL || '' },
  RBAC:  { BASE_URL: import.meta.env.VITE_RBAC_API_URL  || '' },
};

const productionConfig: ApiConfig = {
  AUTH:  { BASE_URL: import.meta.env.VITE_AUTH_API_URL  || '' },
  USERS: { BASE_URL: import.meta.env.VITE_USERS_API_URL || '' },
  WORKS: { BASE_URL: import.meta.env.VITE_WORKS_API_URL || '' },
  RBAC:  { BASE_URL: import.meta.env.VITE_RBAC_API_URL  || '' },
};

/**
 * Valida que todas as URLs obrigatórias estão preenchidas em ambientes não-development.
 * Lança um erro em tempo de inicialização para evitar falhas silenciosas em produção/staging.
 */
function validateConfig(config: ApiConfig, env: string): void {
  const required: (keyof ApiConfig)[] = ['AUTH', 'USERS', 'WORKS', 'RBAC'];
  const missing = required.filter((key) => !config[key].BASE_URL);
  if (missing.length > 0) {
    throw new Error(
      `[Liderum] Variáveis de ambiente obrigatórias não definidas para o ambiente "${env}": ` +
      missing.map((k) => `VITE_${k}_API_URL`).join(', ') +
      '. Defina-as no arquivo .env.' + env + ' antes de buildar.',
    );
  }
}

export const getApiConfig = (): ApiConfig => {
  const environment = getEnvironment();

  switch (environment) {
    case 'production': {
      validateConfig(productionConfig, 'production');
      return productionConfig;
    }
    case 'staging': {
      validateConfig(stagingConfig, 'staging');
      return stagingConfig;
    }
    case 'development':
    default:
      return developmentConfig;
  }
};

export const API_CONFIG = getApiConfig();

if (import.meta.env.DEV) {
  console.log('[Liderum] Ambiente detectado:', getEnvironment());
}
