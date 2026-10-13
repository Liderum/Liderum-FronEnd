import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Info, ShieldAlert, XCircle } from 'lucide-react';
import type { CheckoutStatus } from '@/services/billing';

interface Outcome {
  tone: 'ok' | 'bad' | 'neutral';
  icon: React.ElementType;
  title: string;
  text: string;
  cta: { to: string; label: string };
}

const PLANS = { to: '/billing/plans', label: 'Escolher plano' };

const OUTCOMES: Partial<Record<CheckoutStatus, Outcome>> = {
  Paid: { tone: 'ok', icon: CheckCircle2, title: 'Pagamento confirmado', text: 'Obrigado! Sua assinatura já está ativa.', cta: { to: '/billing/subscription', label: 'Ver minha assinatura' } },
  Expired: { tone: 'bad', icon: Clock, title: 'Pagamento expirado', text: 'O tempo para pagar acabou e nada foi cobrado. Gere um novo pagamento para continuar.', cta: { ...PLANS, label: 'Gerar novo pagamento' } },
  Cancelled: { tone: 'neutral', icon: XCircle, title: 'Pagamento cancelado', text: 'Você cancelou este pagamento. Nada foi cobrado.', cta: PLANS },
  Failed: { tone: 'bad', icon: XCircle, title: 'Não foi possível concluir o pagamento', text: 'Houve uma falha ao processar. Se algum valor foi debitado, ele será devolvido; tente gerar um novo pagamento.', cta: { ...PLANS, label: 'Tentar novamente' } },
  Denied: { tone: 'bad', icon: ShieldAlert, title: 'Pagamento não autorizado', text: 'Não foi possível aprovar esta cobrança. Entre em contato com o suporte para mais informações.', cta: { to: '/contact', label: 'Falar com o suporte' } },
  Refunded: { tone: 'neutral', icon: Info, title: 'Pagamento estornado', text: 'O valor foi devolvido para a sua conta.', cta: PLANS },
  Disputed: { tone: 'bad', icon: ShieldAlert, title: 'Pagamento em contestação', text: 'Este pagamento está em análise por contestação. Entre em contato com o suporte.', cta: { to: '/contact', label: 'Falar com o suporte' } },
  Lost: { tone: 'bad', icon: ShieldAlert, title: 'Contestação encerrada', text: 'A contestação deste pagamento foi concluída. Entre em contato com o suporte.', cta: { to: '/contact', label: 'Falar com o suporte' } },
};

const RETRYABLE: ReadonlySet<CheckoutStatus> = new Set<CheckoutStatus>(['Expired', 'Cancelled', 'Failed']);

/**
 * `onRetry` (fluxo /checkout, fora do layout autenticado): troca o link para as rotas privadas por um botão
 * que reinicia a escolha do plano — só nos estados em que gerar novo PIX faz sentido.
 */
export function CheckoutOutcome({ status, onRetry }: { status: CheckoutStatus; onRetry?: () => void }) {
  const o = OUTCOMES[status];
  if (!o) return null;
  const Icon = o.icon;
  if (onRetry && RETRYABLE.has(status)) {
    return (
      <div className="bl-card bl-end" role="status" data-testid={`outcome-${status}`}>
        <div className={`bl-end-ico ${o.tone === 'neutral' ? '' : o.tone}`}><Icon size={26} aria-hidden /></div>
        <h2 className="bl-h2">{o.title}</h2>
        <p className="bl-lead">{o.text}</p>
        <button type="button" className="bl-btn bl-btn-primary" onClick={onRetry}>Gerar novo PIX</button>
      </div>
    );
  }
  return (
    <div className="bl-card bl-end" role="status" data-testid={`outcome-${status}`}>
      <div className={`bl-end-ico ${o.tone === 'neutral' ? '' : o.tone}`}><Icon size={26} aria-hidden /></div>
      <h2 className="bl-h2">{o.title}</h2>
      <p className="bl-lead">{o.text}</p>
      <Link className="bl-btn bl-btn-primary" to={o.cta.to}>{o.cta.label}</Link>
    </div>
  );
}
