import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente baseadas no modo
  const env = loadEnv(mode, process.cwd(), '');
  void env;

  return {
    base: '/',
    server: {
      host: "::",
      port: 8080,
      headers: securityHeaders,
    },
    // Headers de segurança também para `vite preview` (npm run preview)
    preview: {
      headers: securityHeaders,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      // Sourcemap em development e staging — facilita debug sem expor em produção
      sourcemap: mode !== 'production',
      // Minificação em staging e produção — reduz tamanho do bundle
      minify: mode !== 'development' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          // Code splitting manual: isola vendors grandes para cache eficiente no browser
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-popover',
              'cmdk',
            ],
            'vendor-charts': ['recharts'],
            'vendor-motion': ['framer-motion'],
            'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'vendor-query': ['@tanstack/react-query'],
          },
        },
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
  };
});
