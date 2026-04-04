// Configuração unificada de API que detecta automaticamente o ambiente
export interface ApiConfig {
  AUTH: {
    BASE_URL: string;
  };
  FINANCIAL: {
    BASE_URL: string;
  };
  BILLING: {
    BASE_URL: string;
  };
  INVENTORY: {
    BASE_URL: string;
  };
  USERS: {
    BASE_URL: string;
  };
  MANAGEMENT: {
    BASE_URL: string;
  };
}

// Função para detectar o ambiente atual
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  // Verifica se está em produção baseado no modo do Vite
  if (import.meta.env.MODE === 'production') {
    return 'production';
  }
  
  // Verifica se está em staging
  if (import.meta.env.MODE === 'staging') {
    return 'staging';
  }
  
  // Verifica se está em desenvolvimento
  if (import.meta.env.MODE === 'development') {
    return 'development';
  }
  
  // Fallback: verifica se está rodando localmente
  if (import.meta.env.DEV) {
    return 'development';
  }
  
  return 'production';
};

// Configurações de desenvolvimento
const developmentConfig: ApiConfig = {
  AUTH: {
    BASE_URL: 'https://localhost:7247/liderum/api/login',
  },
  FINANCIAL: {
    BASE_URL: import.meta.env.VITE_FINANCIAL_API_URL || 'https://localhost:3002',
  },
  BILLING: {
    BASE_URL: import.meta.env.VITE_BILLING_API_URL || 'https://localhost:3003',
  },
  INVENTORY: {
    BASE_URL: import.meta.env.VITE_INVENTORY_API_URL || 'http://localhost:5002/Liderum', 
  },
  USERS: {
    BASE_URL: import.meta.env.VITE_USERS_API_URL || 'https://localhost:7247/liderum/api/user',
  },
  MANAGEMENT: {
    BASE_URL: import.meta.env.VITE_MANAGEMENT_API_URL || 'https://localhost:7036',
  },
};

// Configurações de staging (pode usar as mesmas de desenvolvimento ou URLs específicas)
const stagingConfig: ApiConfig = {
  AUTH: {
    BASE_URL: import.meta.env.VITE_AUTH_API_URL || 'https://localhost:7247/liderum/api/login',
  },
  FINANCIAL: {
    BASE_URL: import.meta.env.VITE_FINANCIAL_API_URL || 'https://localhost:3002',
  },
  BILLING: {
    BASE_URL: import.meta.env.VITE_BILLING_API_URL || 'https://localhost:3003',
  },
  INVENTORY: {
    BASE_URL: import.meta.env.VITE_INVENTORY_API_URL || 'https://localhost:7143/Liderum',
  },
  USERS: {
    BASE_URL: import.meta.env.VITE_USERS_API_URL || 'https://localhost:7247/liderum/api/user',
  },
  MANAGEMENT: {
    BASE_URL: import.meta.env.VITE_MANAGEMENT_API_URL || 'https://localhost:7036',
  },
};

// Configurações de produção
const productionConfig: ApiConfig = {
  AUTH: {
    BASE_URL: import.meta.env.VITE_AUTH_API_URL || '',
  },
  FINANCIAL: {
    BASE_URL: import.meta.env.VITE_FINANCIAL_API_URL || '',
  },
  BILLING: {
    BASE_URL: import.meta.env.VITE_BILLING_API_URL || '',
  },
  INVENTORY: {
    BASE_URL: import.meta.env.VITE_INVENTORY_API_URL || '',
  },
  USERS: {
    BASE_URL: import.meta.env.VITE_USERS_API_URL || '',
  },
  MANAGEMENT: {
    BASE_URL: import.meta.env.VITE_MANAGEMENT_API_URL || '',
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

// Log para debug (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 Ambiente detectado:', getEnvironment());
  console.log('🌐 Configuração de API:', API_CONFIG);
}