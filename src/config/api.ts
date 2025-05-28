export const API_CONFIG = {
  AUTH: {
    BASE_URL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5065/liderum/api/login',
  },
  FINANCIAL: {
    BASE_URL: import.meta.env.VITE_FINANCIAL_API_URL || 'http://localhost:3002',
  },
  BILLING: {
    BASE_URL: import.meta.env.VITE_BILLING_API_URL || 'http://localhost:3003',
  },
  INVENTORY: {
    BASE_URL: import.meta.env.VITE_INVENTORY_API_URL || 'http://localhost:3004',
  },
  USERS: {
    BASE_URL: import.meta.env.VITE_USERS_API_URL || 'http://localhost:3005',
  },
} as const;

export type ApiModule = keyof typeof API_CONFIG; 