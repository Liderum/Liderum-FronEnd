# Liderum ERP Frontend

Frontend do sistema ERP Liderum, desenvolvido com React, TypeScript e Vite.

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── contexts/       # Contextos React (Auth, etc)
├── layouts/        # Layouts da aplicação
├── pages/          # Páginas da aplicação
├── services/       # Serviços (API, etc)
└── config/         # Configurações
```

## Requisitos

- Node.js 18+
- npm ou yarn

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/liderum-frontend.git
cd liderum-frontend
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as URLs corretas das suas APIs.

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

O projeto estará disponível em `http://localhost:5173`.

## Build

Para criar uma build de produção:

```bash
npm run build
# ou
yarn build
```

Para builds específicos:

```bash
npm run build        # Build para produção (production)
npm run build:dev    # Build para desenvolvimento (development)
npm run build:staging # Build para staging (staging)
```

## Deploy

⚠️ **IMPORTANTE:** Após o deploy, certifique-se de configurar o servidor para fazer o fallback para `index.html` em todas as rotas.

Consulte o arquivo [DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md) para instruções detalhadas de deploy em diferentes ambientes.

### Configuração de Servidor

Para que as rotas do frontend funcionem corretamente (ex: `/payments`, `/dashboard`), você precisa configurar o servidor web:

- **Vercel**: Arquivo `vercel.json` já configurado
- **Nginx**: Use o arquivo `nginx.conf`
- **Apache**: Use o arquivo `.htaccess`
- **IIS**: Use o arquivo `web.config`

### Ambientes

O projeto suporta múltiplos ambientes configurados no arquivo `src/config/api.ts`:

- Development (DSV)
- Staging
- Production (PRD)

Configure as variáveis de ambiente conforme descrito em [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).

## Arquitetura

O projeto segue uma arquitetura modular, com separação clara entre:

- **UI**: Componentes React e páginas
- **Lógica de Negócio**: Hooks e contextos
- **Comunicação com APIs**: Serviços centralizados

### Módulos

- **Autenticação**: Login e gerenciamento de usuários
- **Financeiro**: Gestão financeira
- **Faturamento**: Emissão de notas fiscais
- **Estoque**: Controle de inventário
- **Usuários**: Gestão de usuários e permissões

### APIs

O sistema se comunica com múltiplas APIs, cada uma responsável por um módulo específico:

- Auth API: Autenticação e usuários
- Financial API: Gestão financeira
- Billing API: Faturamento
- Inventory API: Estoque
- Users API: Gestão de usuários

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.
