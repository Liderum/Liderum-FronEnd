export const API_CONFIG = {
    AUTH: {
      BASE_URL: import.meta.env.DSV_AUTH_API_URL || 'http://localhost:5065/liderum/api/login', //ajustar conforme o uso.
    },
    FINANCIAL: {
      BASE_URL: import.meta.env.DSV_FINANCIAL_API_URL || 'http://localhost:3002', //ajustar conforme o uso.
    },
    BILLING: {
      BASE_URL: import.meta.env.DSV_BILLING_API_URL || 'http://localhost:3003', //ajustar conforme o uso.
    },
    INVENTORY: {
      BASE_URL: import.meta.env.DSV_INVENTORY_API_URL || 'http://localhost:3004', //ajustar conforme o uso.
    },
    USERS: {
      BASE_URL: import.meta.env.DSV_USERS_API_URL || 'http://localhost:3005', //ajustar conforme o uso.  
    },
  } as const;
  
  export type ApiModule = keyof typeof API_CONFIG; 