---
name: frontend-security-auth-specialist
description: Implementa autenticação segura em aplicações React + Vite usando access token em memória, refresh via cookie HttpOnly, interceptors Axios, guards de rota, RBAC, fluxos de recuperação de senha e formulários endurecidos. Use quando o usuário compartilhar documentação de API de autenticação ou pedir login, logout, refresh-token, revalidação de sessão, checagem de roles/permissões, proteção de rotas com React Router ou boas práticas de segurança frontend.
---

# Especialista em Segurança Frontend

## Quando Usar

Use esta skill quando o usuário quiser:

- Integrar uma API de autenticação em um frontend React + Vite
- Implementar login, logout, registro, refresh-token ou restauração silenciosa de sessão
- Manter o `accessToken` apenas em memória e confiar em cookies `HttpOnly` para o refresh
- Construir interceptors `Axios` com fila de proteção contra refresh concorrente
- Proteger rotas com `React Router v6`
- Adicionar RBAC no frontend com roles e permissões
- Implementar fluxos de esqueci-minha-senha, validação de código e redefinição
- Endurecer formulários e configuração contra problemas comuns de segurança

## Regras de Segurança Inegociáveis

- Manter o `accessToken` somente em memória. Nunca usar `localStorage`, `sessionStorage`, IndexedDB ou cookies gerenciados pelo frontend para bearer tokens.
- Assumir que o `refreshToken` pertence ao servidor via cookie `HttpOnly`. O frontend deve apenas enviar requisições com `withCredentials: true`.
- Nunca logar senhas, tokens, códigos de reset ou headers de autorização.
- Tratar RBAC frontend como UX apenas. A API deve permanecer como barreira final de autorização.
- Em `401`, usar um único fluxo de refresh com fila de requisições para evitar race conditions de refresh concorrente.
- Se o refresh falhar, limpar o estado de autenticação imediatamente e redirecionar para `/login`.
- Não expor segredos em variáveis `VITE_*`. Variáveis com prefixo `VITE_` são públicas no bundle.

## Escolhas Técnicas Padrão

- Usar `React 18+`, `TypeScript`, `Vite`, `React Router v6`, `Axios`, `React Hook Form` e `Zod`
- Preferir `Context API` quando o projeto já a utilizar de forma consistente para sessão
- Usar `Zustand` apenas se o projeto já o adotar ou se houver necessidade clara de estado global fora de componentes
- Usar um módulo dedicado de cliente API em vez de espalhar chamadas `axios` por componentes

## Checklist da Primeira Resposta

Ao receber documentação de API do usuário, fazer isso antes de codar:

1. Confirmar que a base URL deve vir de `import.meta.env.VITE_API_URL`
2. Confirmar se o backend já define flags seguras no cookie como `HttpOnly`, `Secure` e `SameSite`
3. Confirmar que o CORS permite credenciais da origem do frontend
4. Identificar quais endpoints exigem `Authorization: Bearer <accessToken>`
5. Identificar o comportamento de bootstrap de sessão no mount do app via refresh-token

Se algum desses estiver faltando, fazer perguntas concisas antes de implementar.

## Estrutura de Pastas Recomendada

Usar este layout padrão para o módulo de autenticação:

```text
src/
  app/
    router/
      AppRouter.tsx
      PrivateRoute.tsx
      PublicRoute.tsx
  features/
    auth/
      api/
        authApi.ts
        authClient.ts
      components/
        CanAccess.tsx
        PasswordField.tsx
        PasswordStrength.tsx
      hooks/
        useAuth.ts
        usePermission.ts
        useRole.ts
      pages/
        LoginPage.tsx
        RegisterPage.tsx
        ForgotPasswordPage.tsx
      schemas/
        authSchemas.ts
      store/
        authStore.ts
      types/
        auth.types.ts
      utils/
        authSanitize.ts
        authSecurity.ts
```

Ajustar nomes para combinar com o projeto, mas manter as responsabilidades separadas.

## Fluxo de Implementação

Seguir esta ordem a menos que o usuário peça diferente:

1. Criar tipos de auth para usuário, payload de token, permissões, roles e ações de autenticação
2. Construir um cliente `Axios` dedicado com `baseURL`, `withCredentials: true`, timeout e interceptors
3. Armazenar `accessToken`, usuário e estado RBAC somente em memória
4. Implementar `login`, `register`, `logout` e `refreshSession`
5. No mount do app, executar silent refresh uma vez antes de resolver rotas protegidas
6. Buscar `/rbac/my-permissions` após login e após silent refresh
7. Adicionar `PrivateRoute`, `PublicRoute`, `usePermission()`, `useRole()` e `CanAccess`
8. Construir fluxo de esqueci-minha-senha em três etapas com estado local
9. Endurecer formulários: validação, requisitos de senha, toggle exibir/ocultar, bloqueio visual após falhas repetidas
10. Configurar headers de segurança no `vite.config`
11. Adicionar `.env.example` e garantir que `.env` esteja no `.gitignore`
12. Explicar como cada escolha mitiga ameaças

## Requisitos do Axios

Sempre implementar estes comportamentos no cliente:

- `baseURL: import.meta.env.VITE_API_URL`
- `withCredentials: true`
- Timeout razoável como `10000`
- Interceptor de request que lê o token em memória e injeta `Authorization`
- Interceptor de response que:
  - ignora recursão de refresh para o próprio endpoint de refresh
  - tenta novamente uma vez após refresh bem-sucedido
  - usa uma flag compartilhada `isRefreshing` mais uma fila de requisições pendentes
  - resolve requisições enfileiradas com o novo token
  - rejeita requisições enfileiradas e limpa o estado de auth se o refresh falhar

Padrão preferido de fila:

```ts
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];
```

## Requisitos do Estado de Auth

O estado de autenticação deve expor:

- `user`
- `accessToken`
- `permissions`
- `roles`
- `modules`
- `isAuthenticated`
- `isLoading`
- `login()`
- `logout()`
- `register()`
- `refreshSession()`
- `clearAuth()`

Regras de comportamento:

- Definir `isLoading` durante o silent refresh inicial
- Se o refresh tiver sucesso, restaurar sessão em memória e buscar perfil e permissões
- Se o refresh falhar, deixar o app não autenticado sem erros ruidosos
- No logout ou sessão inválida, limpar token, perfil, roles, permissões e módulos juntos

## Regras de Proteção de Rotas

Implementar:

- `PrivateRoute`
- `PublicRoute`

Regras do `PrivateRoute`:

- Se auth ainda estiver carregando, renderizar estado de loading seguro
- Se não autenticado, redirecionar para `/login` preservando `returnUrl`
- Se `requiredPermission` existir, permitir apenas usuários com essa permissão
- Opcionalmente suportar `requiredRole`

Regras do `PublicRoute`:

- Se autenticado, redirecionar para `/dashboard`
- Caso contrário, renderizar a página pública normalmente

## Regras de RBAC

Após login ou silent refresh bem-sucedido:

1. Buscar `/rbac/my-permissions`
2. Armazenar `roles`, `modules` e `permissions` em memória
3. Fornecer `usePermission(permission: string): boolean`
4. Fornecer `useRole(role: string): boolean`
5. Fornecer `<CanAccess permission="...">...</CanAccess>`

Nunca descrever RBAC frontend como segurança suficiente. Declarar claramente que o backend deve aplicar a autorização.

## Regras de Esqueci Minha Senha

Usar estado local de componente para o fluxo de três etapas:

1. Envio de email via `/forgot-password`
2. Validação de código via `/validate-code`
3. Redefinição de senha via `/reset-password`

Requisitos:

- Não colocar códigos de reset em query params se o usuário pediu fluxo com estado local
- Limpar estado local do código após reset bem-sucedido
- Não fazer auto-login após reset a menos que a API exija explicitamente
- Mostrar mensagens de erro genéricas que não vazem existência de conta desnecessariamente

## Regras de Endurecimento de Formulários

Para formulários de auth, sempre incluir:

- `React Hook Form` + `Zod`
- Toggle de visibilidade de senha
- Feedback de força e requisitos de senha em tempo real
- Bloqueio visual de login após 3 tentativas falhas com countdown de 30 segundos
- Sanitização antes de renderizar strings retornadas pela API na UI

Orientações:

- Usar mensagens genéricas de falha de auth a menos que o backend distinga casos com segurança
- Aparar e normalizar input de email antes do envio
- Evitar over-sanitizing de valores enviados à API; sanitizar primariamente antes de renderizar conteúdo não confiável
- Não armazenar campos de senha brutos fora do form state

## Regras de Vite e Ambiente

Implementar:

- `import.meta.env.VITE_API_URL`
- `.env.example` documentando variáveis esperadas
- `.env` no `.gitignore`

Definir estes headers de desenvolvimento no `vite.config`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

Se o usuário perguntar sobre CSP, explicar que CSP robusto geralmente pertence ao servidor web real ou proxy reverso, não apenas ao Vite dev server.

## Como Explicar Decisões de Segurança

Ao entregar a solução, mapear decisões para ameaças explicitamente:

- `accessToken` em memória: reduz impacto de roubo de token por XSS persistente comparado com `localStorage`
- Cookie `HttpOnly` para refresh: impede acesso direto do JavaScript ao refresh token
- `withCredentials`: permite continuação segura de sessão baseada em cookie
- Fila de refresh: previne race conditions e tempestades de refresh de token
- Limpar auth em falha de refresh: reduz loops de sessão quebrada e uso indevido de token
- Guards de rota: previnem navegação não autorizada na UI
- RBAC aplicado no backend: previne escalação de privilégios mesmo se a UI for burlada
- Erros genéricos de auth: reduzem risco de enumeração de contas
- Cooldown de login após falhas repetidas: desacelera tentativas de força bruta na camada da UI
- Regras de força de senha: reduzem risco de credenciais fracas
- Evitar logs sensíveis: reduz vazamento acidental de credenciais
- Headers de segurança: reduzem MIME sniffing, clickjacking, vazamento de referrer e capacidades desnecessárias do browser

## Formato de Entrega Esperado

Quando o usuário pedir implementação, estruturar a resposta nesta ordem:

1. Estrutura de pastas sugerida
2. Código completo para cliente API e interceptors
3. Código completo para estado/provider de auth
4. Código completo para rotas, hooks e componentes de controle de acesso
5. Código completo para login, registro e fluxo de esqueci-minha-senha
6. Configuração do `vite.config` e ambiente
7. Explicação curta mapeando cada decisão para ameaças de segurança

Preferir editar arquivos reais do projeto em vez de apenas dar trechos quando o repositório estiver disponível.

## Barra de Qualidade

Antes de finalizar:

- Verificar que nenhum token é persistido fora da memória
- Verificar que requisições de refresh incluem credenciais
- Verificar que respostas `401` concorrentes não disparam múltiplas chamadas de refresh
- Verificar que logout limpa todo estado de auth e RBAC
- Verificar que campos sensíveis não são logados
- Verificar que arquivos editados recentemente não introduzem erros de lint
- Verificar que explicações mencionam limites de responsabilidade frontend e backend

## Exemplos de Gatilho

Aplicar esta skill para prompts como:

- "Implemente login seguro com refresh token em React + Vite"
- "Tenho uma API de autenticação, monta o AuthProvider com Axios interceptor"
- "Preciso proteger rotas por permissão no React Router"
- "Quero guardar o access token só em memória"
- "Monte o fluxo de forgot password com validação de código"
