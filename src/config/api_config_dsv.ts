export const API_CONFIG = {
    AUTH: {
      BASE_URL_DSV: 'http://localhost:5001/liderum/api/login', //ajustar conforme o uso.
    },
    FINANCIAL: {
      BASE_URL_DSV: import.meta.env.DSV_FINANCIAL_API_URL || 'https://localhost:3002', //ajustar conforme o uso.
    },
    BILLING: {
      BASE_URL_DSV: import.meta.env.DSV_BILLING_API_URL || 'https://localhost:3003', //ajustar conforme o uso.
    },
    INVENTORY: {
      BASE_URL_DSV: import.meta.env.DSV_INVENTORY_API_URL || 'http://localhost:5002/Liderum', //ajustar conforme o uso.
    },
    USERS: {
      BASE_URL_DSV: import.meta.env.DSV_USERS_API_URL || 'http://localhost:5001/liderum/api/user', //ajustar conforme o uso.  
    },
    MANAGEMENT: {
      BASE_URL_DSV: import.meta.env.DSV_MANAGEMENT_API_URL || 'https://localhost:7036',
    },
  } as const;
  
  export type ApiModule = keyof typeof API_CONFIG; 