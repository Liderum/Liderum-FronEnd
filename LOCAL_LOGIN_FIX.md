# Configuração de Ambiente para Desenvolvimento Local

## Problema Identificado

O login não está funcionando localmente porque:

1. **URL base incorreta**: A configuração não estava seguindo o padrão correto da API
2. **Falta de arquivo .env**: Não existe arquivo de configuração de ambiente
3. **Endpoint específico**: A API usa um endpoint específico `/doLogin` que precisa ser configurado corretamente

## Solução Implementada

### 1. Correção das URLs de Desenvolvimento

Baseado no padrão da API:

```bash
curl https://localhost:7247/liderum/api/login/doLogin \
  --request POST \
--data '{
  "email": "",
  "password": ""
}'
```

A URL base correta é:

```typescript
BASE_URL: "https://localhost:7247/liderum/api/login";
```

### 2. Mudanças Realizadas

- ✅ Configurado URL base correta: `https://localhost:7247/liderum/api/login`
- ✅ Mantido HTTPS conforme padrão da API
- ✅ Endpoint `/doLogin` será adicionado automaticamente pelo axios
- ✅ Padronizado URLs para todos os módulos

### 3. Como Configurar

#### Opção 1: Usar configuração padrão (recomendado)

As URLs já estão configuradas corretamente no código e devem funcionar se sua API estiver rodando nas portas padrão.

#### Opção 2: Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto com:

```env
# Configurações para desenvolvimento local
VITE_AUTH_API_URL=https://localhost:7247/liderum/api/login
VITE_FINANCIAL_API_URL=https://localhost:3002
VITE_BILLING_API_URL=https://localhost:3003
VITE_INVENTORY_API_URL=https://localhost:7143/Liderum
VITE_USERS_API_URL=https://localhost:7247/liderum/api/user
```

### 4. Verificações Necessárias

1. **API rodando**: Certifique-se de que sua API está rodando na porta 7247
2. **CORS configurado**: A API deve permitir requisições do frontend (porta 8080)
3. **Endpoint correto**: O endpoint `/doLogin` deve estar disponível em `https://localhost:7247/liderum/api/login/doLogin`
4. **Certificado SSL**: Para HTTPS local, você pode precisar aceitar o certificado auto-assinado

### 5. Teste da Configuração

Para testar se a configuração está funcionando:

1. Abra o console do navegador (F12)
2. Vá para a aba Network
3. Tente fazer login
4. Verifique se a requisição está sendo feita para `https://localhost:7247/liderum/api/login/doLogin`

### 6. Debug

Se ainda não funcionar, verifique:

- Se a API está rodando: `https://localhost:7247/liderum/api/login`
- Se o endpoint existe: `https://localhost:7247/liderum/api/login/doLogin`
- Se há erros de CORS no console
- Se há erros de rede na aba Network
- Se o certificado SSL está sendo aceito pelo navegador

## Próximos Passos

1. Teste o login localmente
2. Se funcionar, o problema está resolvido
3. Se não funcionar, verifique se a API está rodando e configurada corretamente
