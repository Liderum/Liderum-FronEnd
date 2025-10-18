# Configuração de Ambientes

## Visão Geral

Este projeto agora suporta configuração automática de ambientes. O sistema detecta automaticamente se está rodando em desenvolvimento ou produção e usa as configurações apropriadas.

## Arquivos de Ambiente

Crie os seguintes arquivos na raiz do projeto:

### `.env.development` (Desenvolvimento)

```env
# Configurações de Desenvolvimento (DSV)
VITE_AUTH_API_URL=https://localhost:7247/liderum/api/login
VITE_FINANCIAL_API_URL=https://localhost:3002
VITE_BILLING_API_URL=https://localhost:3003
VITE_INVENTORY_API_URL=https://localhost:7143/Liderum
VITE_USERS_API_URL=https://localhost:7247/liderum/api/user
```

### `.env.production` (Produção)

```env
# Configurações de Produção (PRD)
VITE_AUTH_API_URL=https://api-prod.liderum.com/auth
VITE_FINANCIAL_API_URL=https://api-prod.liderum.com/financial
VITE_BILLING_API_URL=https://api-prod.liderum.com/billing
VITE_INVENTORY_API_URL=https://api-prod.liderum.com/inventory
VITE_USERS_API_URL=https://api-prod.liderum.com/users
```
'
## Como Funciona

1. **Desenvolvimento**: Usa o arquivo `.env.development` com URLs de localhost
2. **Produção**: Usa o arquivo `.env.production` com URLs de produção
3. **Detecção Automática**: O Vite carrega automaticamente o arquivo correto baseado no modo:
   - `npm run dev` → carrega `.env.development`
   - `npm run build` → carrega `.env.production`

## Scripts Disponíveis

```bash
# Desenvolvimento (usa .env.development)
npm run dev

# Build para produção (usa .env.production)
npm run build

# Preview da build de produção
npm run preview
```

## Configuração na Vercel

Para configurar na Vercel:

1. Vá para as configurações do projeto
2. Adicione as variáveis de ambiente na seção "Environment Variables"
3. Use as variáveis com prefixo `VITE_*` para produção

### Exemplo de variáveis na Vercel:

- `VITE_AUTH_API_URL` = `https://api-prod.liderum.com/auth`
- `VITE_FINANCIAL_API_URL` = `https://api-prod.liderum.com/financial`
- `VITE_BILLING_API_URL` = `https://api-prod.liderum.com/billing`
- `VITE_INVENTORY_API_URL` = `https://api-prod.liderum.com/inventory`
- `VITE_USERS_API_URL` = `https://api-prod.liderum.com/users`

## Migração

O sistema é compatível com o código existente. Apenas a importação da configuração mudou:

### Antes:

```typescript
import { API_CONFIG } from "@/config/api_config_dsv";
```

### Depois:

```typescript
import { API_CONFIG } from "@/config/api";
```

## Debug

Para verificar qual ambiente está sendo usado, abra o console do navegador. Você verá logs como:

```
🔧 Ambiente detectado: development
🌐 Configuração de API: { AUTH: { BASE_URL: "..." }, ... }
```
