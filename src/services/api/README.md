# Sistema de APIs por Módulo

## Visão Geral

Cada módulo da aplicação tem sua própria instância Axios configurada com a URL correta, autenticação centralizada e renovação automática de token via interceptor.

## Como Usar

### 1. Importar a instância específica do módulo

```typescript
import { worksApi } from "@/services/api/apiFactory";
import { usersApi } from "@/services/api/apiFactory";
import { rbacApi }  from "@/services/api/apiFactory";
```

### 2. Usar em serviços

```typescript
export class WorksService {
  static async list() {
    const response = await worksApi.get('/works');
    return response.data;
  }
}
```

### 3. Configuração automática

Cada instância já vem configurada com:

- URL base correta do módulo (via `src/config/api.ts`)
- Interceptors de autenticação (Bearer token em memória)
- Renovação automática de token em 401 com fila de pendentes
- Timeout de 10 segundos
- `withCredentials: true` para refresh via cookie HttpOnly

## Módulos Disponíveis

| Módulo        | Instância         | Config                   |
| ------------- | ----------------- | ------------------------ |
| Autenticação  | `authApiInstance` | `API_CONFIG.AUTH`        |
| Usuários      | `usersApi`        | `API_CONFIG.USERS`       |
| Obras         | `worksApi`        | `API_CONFIG.WORKS`       |
| RBAC          | `rbacApi`         | `API_CONFIG.RBAC`        |

## Configuração de Ambiente

As URLs são definidas via variáveis de ambiente `VITE_*` (obrigatório o prefixo `VITE_`):

```env
VITE_AUTH_API_URL=https://api.staging.liderum.com/liderum/api/login
VITE_USERS_API_URL=https://api.staging.liderum.com/liderum/api/user
VITE_WORKS_API_URL=https://api.staging.liderum.com/api/v1
VITE_RBAC_API_URL=https://api.staging.liderum.com/liderum/api/rbac
```

O arquivo `src/config/api.ts` detecta o modo do build (`development` | `staging` | `production`) e aplica a configuração correta.

## Adicionando Novos Módulos

1. Adicione o módulo em `src/config/api.ts`:

```typescript
export interface ApiConfig {
  // ...módulos existentes
  NEW_MODULE: { BASE_URL: string };
}
```

2. Preencha a URL nos três configs (`developmentConfig`, `stagingConfig`, `productionConfig`):

```typescript
NEW_MODULE: {
  BASE_URL: import.meta.env.VITE_NEW_MODULE_API_URL || '',
},
```

3. Exporte a instância em `apiFactory.ts`:

```typescript
export const newModuleApi = ApiFactory.getInstance('NEW_MODULE');
```
