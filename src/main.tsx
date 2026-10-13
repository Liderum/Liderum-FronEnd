import { createRoot } from 'react-dom/client'
import './index.css'

// Modo prospecção: enquanto VITE_PROSPECT_MODE=true o site publica só a landing de captação de contatos.
// O app (login, cadastro, painel) fica em outro chunk que nunca é baixado e nenhuma rota dele responde, então não há como criar
// conta nem entrar. Para reabrir o produto, basta VITE_PROSPECT_MODE=false (ou remover a variável) e publicar.
async function bootstrap() {
  const root = createRoot(document.getElementById('root')!);

  if (import.meta.env.VITE_PROSPECT_MODE === 'true') {
    const { ProspectLanding } = await import('./pages/prospect/ProspectLanding');
    root.render(<ProspectLanding />);
    return;
  }

  const { default: App } = await import('./App.tsx');
  root.render(<App />);
}

bootstrap();
