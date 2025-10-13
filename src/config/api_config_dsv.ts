export const API_CONFIG = {
    AUTH: {
      BASE_URL_DSV: import.meta.env.DSV_AUTH_API_URL || 'https://localhost:7247/liderum/api/login', //ajustar conforme o uso.
    },
    FINANCIAL: {
      BASE_URL_DSV: import.meta.env.DSV_FINANCIAL_API_URL || 'https://localhost:3002', //ajustar conforme o uso.
    },
    BILLING: {
      BASE_URL_DSV: import.meta.env.DSV_BILLING_API_URL || 'https://localhost:3003', //ajustar conforme o uso.
    },
    INVENTORY: {
      BASE_URL_DSV: import.meta.env.DSV_INVENTORY_API_URL || 'https://localhost:7143', //ajustar conforme o uso.
    },
    USERS: {
      BASE_URL_DSV: import.meta.env.DSV_USERS_API_URL || 'https://localhost:7247/liderum/api/user', //ajustar conforme o uso.  
    },
  } as const;
  
  export type ApiModule = keyof typeof API_CONFIG; 