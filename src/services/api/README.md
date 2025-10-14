# Sistema de APIs por Módulo

## Visão Geral

Este sistema permite que cada módulo da aplicação tenha sua própria instância de API configurada com a URL correta, mantendo a autenticação centralizada.

## Como Usar

### 1. Importar a instância específica do módulo

```typescript
import { inventoryApi } from "../services/api/apiFactory";
import { financialApi } from "../services/api/apiFactory";
import { billingApi } from "../services/api/apiFactory";
import { usersApi } from "../services/api/apiFactory";
```

### 2. Usar em serviços

```typescript
export class InventoryService {
  static async getProducts() {
    const response = await inventoryApi.get("/api/Produtos");
    return response.data;
  }
}
```

### 3. Configuração automática

Cada instância já vem configurada com:

- ✅ URL base correta do módulo
- ✅ Interceptors de autenticação
- ✅ Renovação automática de token
- ✅ Timeout de 10 segundos
- ✅ Headers padrão

## Módulos Disponíveis

| Módulo       | Instância         | URL Base                            |
| ------------ | ----------------- | ----------------------------------- |
| Autenticação | `authApiInstance` | `API_CONFIG.AUTH.BASE_URL_DSV`      |
| Estoque      | `inventoryApi`    | `API_CONFIG.INVENTORY.BASE_URL_DSV` |
| Financeiro   | `financialApi`    | `API_CONFIG.FINANCIAL.BASE_URL_DSV` |
| Faturamento  | `billingApi`      | `API_CONFIG.BILLING.BASE_URL_DSV`   |
| Usuários     | `usersApi`        | `API_CONFIG.USERS.BASE_URL_DSV`     |

## Migração

### Código Antigo (DEPRECATED)

```typescript
import api from "../services/api/axios";
const response = await api.get("/api/Produtos"); // ❌ Usa URL de login
```

### Código Novo (RECOMENDADO)

```typescript
import { inventoryApi } from "../services/api/apiFactory";
const response = await inventoryApi.get("/api/Produtos"); // ✅ Usa URL correta
```

## Benefícios

1. **URLs Corretas**: Cada módulo usa sua própria API
2. **Autenticação Centralizada**: Token é gerenciado automaticamente
3. **Reutilização**: Instâncias são criadas uma vez e reutilizadas
4. **Compatibilidade**: Código antigo continua funcionando
5. **Type Safety**: TypeScript completo
6. **Manutenibilidade**: Fácil de adicionar novos módulos

## Adicionando Novos Módulos

1. Adicione a configuração em `api_config_dsv.ts`:

```typescript
NEW_MODULE: {
  BASE_URL_DSV: import.meta.env.DSV_NEW_MODULE_API_URL || 'https://localhost:3006',
}
```

2. Adicione o tipo em `ApiModule`:

```typescript
export type ApiModule = keyof typeof API_CONFIG;
```

3. Use a instância:

```typescript
import { ApiFactory } from "../services/api/apiFactory";
const newModuleApi = ApiFactory.getInstance("NEW_MODULE");
```
