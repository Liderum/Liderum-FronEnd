// Configuração unificada de API que detecta automaticamente o ambiente
export interface ApiConfig {
  AUTH: {
    BASE_URL: string;
  };
  USERS: {
    BASE_URL: string;
  };
  WORKS: {
    BASE_URL: string;
  };
  RBAC: {
    BASE_URL: string;
  };
}

// Função para detectar o ambiente atual
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  if (import.meta.env.MODE === 'production') {
    return 'production';
  }

  if (import.meta.env.MODE === 'staging') {
    return 'staging';
  }

  if (import.meta.env.MODE === 'development') {
    return 'development';
  }

  if (import.meta.env.DEV) {
    return 'development';
  }

  return 'production';
};

// Liderum.Security.API roda em http://localhost:5065 (ver launchSettings.json).
const developmentConfig: ApiConfig = {
  AUTH: {
    BASE_URL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5065/liderum/api/login',
  },
  USERS: {
    BASE_URL: import.meta.env.VITE_USERS_API_URL || 'http://localhost:5065/liderum/api/user',
  },
  WORKS: {
    BASE_URL: import.meta.env.VITE_WORKS_API_URL || 'http://localhost:5003/api/v1',
  },
  RBAC: {
    BASE_URL: import.meta.env.VITE_RBAC_API_URL || 'http://localhost:5065/liderum/api/rbac',
  },
};

// Configurações de staging
const stagingConfig: ApiConfig = {
  AUTH: {
    BASE_URL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001/liderum/api/login',
  },
  USERS: {
    BASE_URL: import.meta.env.VITE_USERS_API_URL || 'http://localhost:5001/liderum/api/user',
  },
  WORKS: {
    BASE_URL: import.meta.env.VITE_WORKS_API_URL || 'http://localhost:5003/api/v1',
  },
  RBAC: {
    BASE_URL: import.meta.env.VITE_RBAC_API_URL || 'http://localhost:5001/liderum/api/rbac',
  },
};

// Configurações de produção
const productionConfig: ApiConfig = {
  AUTH: {
    BASE_URL: import.meta.env.VITE_AUTH_API_URL || '',
  },
  USERS: {
    BASE_URL: import.meta.env.VITE_USERS_API_URL || '',
  },
  WORKS: {
    BASE_URL: import.meta.env.VITE_WORKS_API_URL || '',
  },
  RBAC: {
    BASE_URL: import.meta.env.VITE_RBAC_API_URL || '',
  },
};

// Função para obter a configuração baseada no ambiente
export const getApiConfig = (): ApiConfig => {
  const environment = getEnvironment();

  switch (environment) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'development':
    default:
      return developmentConfig;
  }
};

// Exporta a configuração atual
export const API_CONFIG = getApiConfig();

// Exporta o tipo para compatibilidade
export type ApiModule = keyof ApiConfig;

if (import.meta.env.DEV) {
  console.log('Ambiente detectado:', getEnvironment());
}
