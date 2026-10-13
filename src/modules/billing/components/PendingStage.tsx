import { RefreshCw } from 'lucide-react';
import type { Checkout } from '@/services/billing';
import { PixPanel } from './PixPanel';

interface Props {
  checkout: Checkout;
  timedOut: boolean;
  restart: () => void;
  /** Houve falha transitória ao consultar (o polling continua). */
  unstable?: boolean;
}

/** Estágio "aguardando pagamento": PIX (QR/copia e cola), em análise, preparando, e avisos de polling. */
export function PendingStage({ checkout, timedOut, restart, unstable }: Props) {
  const hasPix = !!checkout.pix;
  return (
    <>
      {!hasPix && (
        <div className="bl-card bl-end" role="status" data-testid={`waiting-${checkout.status}`}>
          <h2 className="bl-h2">{checkout.status === 'Created' ? 'Pagamento em análise' : 'Preparando o pagamento'}</h2>
          <p className="bl-lead">
            {checkout.status === 'Created'
              ? 'Por segurança, este pagamento está passando por uma análise. Assim que for liberado, o PIX aparece aqui automaticamente.'
              : 'Estamos gerando o seu pagamento. Isso leva alguns segundos.'}
          </p>
          <div className="bl-live">{!timedOut && <span className="bl-dot" aria-hidden />}<span>{timedOut ? 'Verificação automática pausada' : 'Atualizando automaticamente…'}</span></div>
        </div>
      )}

      {hasPix && <PixPanel checkout={checkout} paused={timedOut} />}

      {timedOut && (
        <div className="bl-alert bl-alert-gold" role="status">
          <RefreshCw size={18} aria-hidden style={{ flexShrink: 0 }} />
          <div>
            Paramos de verificar automaticamente. Se você já pagou, a confirmação pode levar alguns minutos.{' '}
            <button type="button" className="bl-btn bl-btn-ghost" style={{ padding: 0, minHeight: 0, color: 'var(--gold)', fontWeight: 600 }} onClick={restart}>Verificar novamente</button>
          </div>
        </div>
      )}
      {unstable && !timedOut && (
        <div className="bl-alert" role="status">Instabilidade ao verificar o pagamento. Continuaremos tentando.</div>
      )}
    </>
  );
}
