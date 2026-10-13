import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Checkout } from '@/services/billing';
import { formatRemaining, useCountdown } from '../hooks/useCountdown';

interface Props { checkout: Checkout; paused?: boolean }

export function PixPanel({ checkout, paused }: Props) {
  const remaining = useCountdown(checkout.expiresAt);
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);
  const brRef = useRef<HTMLTextAreaElement>(null);
  const pix = checkout.pix;

  // O brCode nunca é logado: só vai para o clipboard e para o textarea.
  const copy = async () => {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.brCode);
      setCopied('ok');
    } catch {
      brRef.current?.select();
      setCopied('fail');
    }
    setTimeout(() => setCopied(null), 4000);
  };

  if (!pix) return null;
  const low = remaining !== null && remaining < 60_000;

  return (
    <div className="bl-card bl-pix">
      {pix.qrImageSrc ? (
        <div className="bl-qr">
          <i /><i /><i /><i />
          <img src={pix.qrImageSrc} alt="QR Code PIX para pagamento da assinatura" width={216} height={216} />
        </div>
      ) : (
        <p className="bl-lead">QR Code indisponível. Use o código de copia e cola abaixo.</p>
      )}

      {remaining !== null && (
        <div>
          <div className="bl-sr" role="timer" aria-live="off">Tempo restante {formatRemaining(remaining)}</div>
          <div className={`bl-timer bl-num${low ? ' bl-timer-low' : ''}`} aria-hidden>{formatRemaining(remaining)}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink3)' }}>para o código expirar</div>
        </div>
      )}

      <div className="bl-copy">
        <label className="bl-label" htmlFor="bl-brcode">PIX copia e cola</label>
        <textarea id="bl-brcode" ref={brRef} readOnly value={pix.brCode} onFocus={(e) => e.currentTarget.select()} />
        <button type="button" className="bl-btn" onClick={copy}>
          {copied === 'ok' ? <><Check size={15} aria-hidden /> Código copiado</> : <><Copy size={15} aria-hidden /> Copiar código</>}
        </button>
        <div role="status" className="bl-sr">
          {copied === 'ok' ? 'Código PIX copiado.' : copied === 'fail' ? 'Não foi possível copiar automaticamente; o código foi selecionado.' : ''}
        </div>
        {copied === 'fail' && <div style={{ fontSize: 12, color: 'var(--ink3)' }}>Não foi possível copiar automaticamente. O código foi selecionado, use Ctrl+C.</div>}
      </div>

      <div className="bl-live">
        {!paused && <span className="bl-dot" aria-hidden />}
        <span>{paused ? 'Verificação automática pausada' : 'Aguardando confirmação do pagamento…'}</span>
      </div>
      <div className="bl-steps">
        <span>1. Abra o app do seu banco</span><span>2. Escolha pagar com PIX</span><span>3. Leia o QR ou cole o código</span>
      </div>
    </div>
  );
}
