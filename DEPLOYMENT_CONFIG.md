# Configuração de Deploy

## Problema: Rotas não funcionam após deploy (404)

Quando você acessa uma rota diretamente no navegador (por exemplo, `https://seusite.com/payments`), o servidor tenta encontrar um arquivo chamado `payments`. Como não existe, ele retorna um erro 404.

Em uma **SPA (Single Page Application)**, todas as rotas devem redirecionar para o `index.html`, que então carrega o React Router e gerencia as rotas do lado do cliente.

## Solução

Configurações foram adicionadas para os servidores mais comuns. Escolha a configuração adequada para seu ambiente:

### 1. Vercel / Netlify / Cloudflare Pages

**Arquivo:** `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Como usar:**

- Simplesmente faça o deploy normalmente
- O arquivo `vercel.json` na raiz do projeto é lido automaticamente

### 2. Nginx

**Arquivo:** `nginx.conf`

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Como usar:**

```bash
# Copie o arquivo nginx.conf para seu servidor
# Geralmente em /etc/nginx/sites-available/

sudo cp nginx.conf /etc/nginx/sites-available/liderum
sudo ln -s /etc/nginx/sites-available/liderum /etc/nginx/sites-enabled/

# Edite o arquivo e ajuste o caminho para sua pasta dist
# root /caminho/para/seu/projeto/dist;

sudo nginx -t  # Teste a configuração
sudo systemctl reload nginx  # Recarregue o Nginx
```

### 3. Apache

**Arquivo:** `.htaccess`

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
```

**Como usar:**

```bash
# Copie o arquivo .htaccess para a pasta dist
cp .htaccess dist/

# Certifique-se de que o mod_rewrite está habilitado
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 4. IIS (Windows Server)

**Arquivo:** `web.config`

```xml
<rule name="React Routes" stopProcessing="true">
  <match url=".*" />
  <conditions>
    <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
    <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
  </conditions>
  <action type="Rewrite" url="/index.html" />
</rule>
```

**Como usar:**

```powershell
# Copie o arquivo web.config para a pasta dist
Copy-Item web.config dist\

# No IIS:
# 1. Configure a aplicação para usar IIS Node
# 2. O arquivo web.config será lido automaticamente
```

### 5. Node.js / Express (Recomendado para DSV)

Um servidor Node.js/Express já está configurado no projeto.

**Arquivo:** `server.js`

**Como usar:**

1. Instale as dependências (incluindo Express):

```bash
npm install
```

2. Faça o build do frontend:

```bash
npm run build
# ou para desenvolvimento
npm run build:dev
```

3. Inicie o servidor:

```bash
npm run serve
# ou
npm start
```

O servidor irá rodar na porta 8080 (ou na porta definida em `process.env.PORT`).

**Para produção:**

```bash
NODE_ENV=production PORT=8080 npm run serve
```

**Para desenvolvimento:**

```bash
NODE_ENV=development PORT=8080 npm run serve
```

### 6. Caddy Server

**Arquivo:** `Caddyfile`

```
localhost {
    root * dist
    file_server
    try_files {path} /index.html
}
```

## Verificação

Após configurar, teste:

1. Acesse a URL raiz: `https://seusite.com/`
2. Navegue usando os links da aplicação: deve funcionar
3. **Teste crítico:** Acesse diretamente uma rota: `https://seusite.com/payments`
   - ✅ **Deve funcionar** - Carrega a página de pagamentos
   - ❌ **Não funciona** - Retorna 404 (configuração incorreta)

## Ambientes

### Desenvolvimento (DSV)

Use uma das configurações acima no servidor de desenvolvimento (DSV).

### Produção (PRD)

Use as mesmas configurações no servidor de produção (PRD).

## Build para Produção

Certifique-se de fazer o build correto antes de fazer deploy:

```bash
# Build para produção
npm run build

# Ou para desenvolvimento (com sourcemaps)
npm run build:dev

# Ou para staging
npm run build:staging
```

## Arquivos Necessários no Deploy

Certifique-se de que estes arquivos estão na pasta `dist` após o build:

- ✅ `index.html`
- ✅ `assets/` (pasta com JS e CSS)
- ✅ Configuração do servidor (vercel.json, .htaccess, web.config, etc)

## Troubleshooting

### Problema: Ainda retorna 404

**Possíveis causas:**

1. Configuração do servidor não está sendo aplicada
2. Arquivo de configuração não está na pasta correta
3. Servidor não suporta a configuração (ex: mod_rewrite desabilitado no Apache)
4. Cache do navegador - limpe o cache (Ctrl+F5)

### Problema: Assets não carregam

**Possíveis causas:**

1. Caminho base incorreto no `vite.config.ts`
2. Variável `BASE_URL` não configurada corretamente

## Configuração Recomendada para Vite

Certifique-se de que o `vite.config.ts` tem a configuração correta:

```typescript
export default defineConfig({
  base: "/", // Base path para o deploy
  build: {
    outDir: "dist",
  },
});
```

## Documentação Adicional

- [Vite - Static Asset Handling](https://vitejs.dev/guide/assets.html)
- [React Router - Deployment](https://reactrouter.com/en/main/start/overview#deployment)
- [Vercel - Single Page Applications](https://vercel.com/docs/configuration#routes)
