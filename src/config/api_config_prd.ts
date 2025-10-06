export const API_CONFIG = {
  AUTH: {
    BASE_URL: import.meta.env.PROD_AUTH_API_URL
  },
  FINANCIAL: {
    BASE_URL: import.meta.env.PROD_FINANCIAL_API_URL  
  },
  BILLING: {
    BASE_URL: import.meta.env.PROD_BILLING_API_URL  
  },
  INVENTORY: {
    BASE_URL: import.meta.env.PROD_INVENTORY_API_URL  
  },
  USERS: {
    BASE_URL: import.meta.env.PROD_USERS_API_URL
  },
} as const;

export type ApiModule = keyof typeof API_CONFIG; 