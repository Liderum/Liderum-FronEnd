# 🚨 Correção Rápida - Rotas não funcionam após deploy

## Problema

Quando você publica o projeto e tenta acessar diretamente uma rota como `https://seusite.com/payments`, retorna 404.

## Causa

Em uma SPA (Single Page Application), todas as rotas devem redirecionar para o `index.html`. O servidor precisa estar configurado para isso.

## Solução Aplicada

Foram criados arquivos de configuração para diferentes servidores. Escolha o arquivo apropriado para seu ambiente:

### ✅ Para ambiente de Desenvolvimento (DSV)

**Opção 1: Usar Node.js/Express (Recomendado)**

```bash
# 1. Instale as dependências
npm install

# 2. Faça o build
npm run build:dev

# 3. Inicie o servidor
npm run serve
```

Acesse: http://localhost:8080

**Opção 2: Usar Nginx**

1. Copie o arquivo `nginx.conf` para seu servidor
2. Ajuste o caminho da pasta `root` no arquivo
3. Reinicie o Nginx

**Opção 3: Usar Apache**

1. Copie o arquivo `.htaccess` para a pasta `dist`
2. Certifique-se de que o `mod_rewrite` está habilitado

### ✅ Para ambiente de Produção (PRD)

Se você está usando Vercel:

- O arquivo `vercel.json` já está configurado ✅
- Apenas faça o deploy normalmente

Se você está usando outro servidor:

- Use as mesmas configurações do ambiente de desenvolvimento
- Apenas faça o build de produção: `npm run build`

## Verificação

Após aplicar a configuração:

1. Acesse a URL raiz: `https://seusite.com/` ✅
2. Navegue pela aplicação usando os links ✅
3. **Teste crítico:** Cole diretamente na barra de endereço: `https://seusite.com/payments` ✅

Se o teste #3 **não funcionar**, significa que a configuração do servidor não foi aplicada corretamente.

## Arquivos Criados

- ✅ `vercel.json` - Para deploy na Vercel
- ✅ `nginx.conf` - Para servidores Nginx
- ✅ `.htaccess` - Para servidores Apache
- ✅ `web.config` - Para servidores IIS
- ✅ `server.js` - Servidor Node.js/Express
- ✅ `DEPLOYMENT_CONFIG.md` - Documentação completa

## Arquivos Modificados

- ✅ `vite.config.ts` - Adicionado `base: '/'`
- ✅ `package.json` - Adicionado Express e scripts de servidor
- ✅ `README.md` - Atualizado com informações de deploy

## Próximos Passos

1. Escolha a configuração apropriada para seu ambiente
2. Aplique a configuração
3. Faça o deploy novamente
4. Teste acessando rotas diretamente

## Precisa de Ajuda?

Consulte o arquivo [DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md) para instruções detalhadas.
