import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Minus, Plus, QrCode } from 'lucide-react';
import { BillingError, normalizePlan, type Plan } from '@/services/billing';
import { useSingleFlight } from '../hooks/useSingleFlight';
import { useBeforeUnloadGuard } from '../hooks/useBeforeUnloadGuard';
import { formatBRL } from '../lib';
import { ErrorBanner } from './Feedback';
import { PlanCards } from './PlanCards';

interface Props {
  plans: Plan[];
  loading: boolean;
  loadError: Error | null;
  onRetry: () => void;
  /** Plano vindo de `?plan=`; só vale se existir e for comprável. */
  initialCode?: string | null;
  currentCode?: string | null;
  canCreate?: boolean;
  /** Usuários extras já contratados no plano atual: pré-preenche a renovação para não derrubar usuários sem querer. */
  currentExtraSeats?: number;
  /** Cria o checkout; erros viram banner aqui e também são repassados em `onError`. */
  onSubmit: (planCode: string, extraSeats: number) => Promise<void>;
  onError?: (e: BillingError | Error) => void;
  note?: string;
  pendingLabel?: string;
}

export function PlanChooser({
  plans: rawPlans, loading, loadError, onRetry, initialCode, currentCode, currentExtraSeats = 0, canCreate = true, onSubmit, onError,
  pendingLabel = 'Gerando pagamento…',
  note = 'Pagamento por PIX (QR Code e copia e cola). Confirmação automática.',
}: Props) {
  const plans = useMemo(() => rawPlans.map((p) => normalizePlan(p)), [rawPlans]);
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState<BillingError | Error | null>(null);
  const [cooldown, setCooldown] = useState(0);
  // undefined = ainda não mexeu: segue o padrão (extras atuais ao renovar o mesmo plano, senão 0)
  const [seatsPicked, setSeatsPicked] = useState<number | undefined>(undefined);

  const code = picked ?? (initialCode && plans.some((p) => p.code === initialCode && p.purchasable) ? initialCode : null);
  const selected = useMemo(() => plans.find((p) => p.code === code && p.purchasable), [plans, code]);

  const maxSeats = selected?.extraSeatPriceInCents != null ? selected.maxExtraSeats : 0;
  const defaultSeats = selected && selected.code === currentCode ? Math.min(currentExtraSeats, maxSeats) : 0;
  const seats = Math.min(seatsPicked ?? defaultSeats, maxSeats);
  const total = selected ? selected.priceInCents + seats * (selected.extraSeatPriceInCents ?? 0) : 0;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = useCallback(async () => {
    if (!selected) return;
    setError(null);
    try {
      await onSubmit(selected.code, seats);
    } catch (e) {
      const err = e instanceof BillingError ? e : new Error('Erro inesperado.');
      setError(err);
      if (err instanceof BillingError && err.kind === 'rate_limited') setCooldown(err.retryAfterSeconds ?? 15);
      onError?.(err);
    }
  }, [selected, seats, onSubmit, onError]);

  const { run, pending } = useSingleFlight(submit);
  useBeforeUnloadGuard(pending);

  const isChange = !!currentCode && !!selected && selected.code !== currentCode;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {loading && (
        <div className="bl-pc-wrap" aria-busy="true" aria-label="Carregando planos">
          <div className="bl-pc-group">{[0, 1].map((i) => <div key={i} className="bl-skel" style={{ height: 420, borderRadius: 16 }} />)}</div>
          <div className="bl-skel" style={{ height: 420, borderRadius: 16 }} />
        </div>
      )}
      {loadError && <ErrorBanner error={loadError} onRetry={onRetry} />}
      {!loading && !loadError && plans.length === 0 && <div className="bl-card bl-empty">Nenhum plano disponível no momento.</div>}

      {plans.length > 0 && (
        <>
          <PlanCards plans={plans} selectedCode={code} onSelect={(c) => { setPicked(c); setSeatsPicked(undefined); }} disabled={pending} currentCode={currentCode} />

          <aside className="bl-card bl-receipt" aria-live="polite" aria-label="Resumo do pedido">
            {!selected ? (
              <p className="bl-lead">Selecione um plano para ver o resumo e gerar o pagamento.</p>
            ) : (
              <>
                <div className="bl-total" style={{ borderTop: 0, paddingTop: 0 }}>
                  <span><span style={{ color: 'var(--ink3)', fontSize: 12 }}>Plano </span><strong style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24 }}>{selected.name}</strong></span>
                  <strong className="bl-num">{formatBRL(selected.priceInCents)}</strong>
                </div>
                {maxSeats > 0 && (
                  <div className="bl-total" style={{ borderTop: 0, paddingTop: 0 }}>
                    <span id="bl-seats-label">
                      Usuários extras <small style={{ color: 'var(--ink3)' }}>({formatBRL(selected.extraSeatPriceInCents ?? 0)} cada, até {maxSeats})</small>
                    </span>
                    <span role="group" aria-labelledby="bl-seats-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" className="bl-btn" aria-label="Menos um usuário extra" disabled={pending || seats <= 0} onClick={() => setSeatsPicked(Math.max(0, seats - 1))}><Minus size={14} aria-hidden /></button>
                      <output className="bl-num" aria-live="polite" style={{ minWidth: 24, textAlign: 'center' }}>{seats}</output>
                      <button type="button" className="bl-btn" aria-label="Mais um usuário extra" disabled={pending || seats >= maxSeats} onClick={() => setSeatsPicked(Math.min(maxSeats, seats + 1))}><Plus size={14} aria-hidden /></button>
                    </span>
                  </div>
                )}
                {seats > 0 && (
                  <div className="bl-total" style={{ borderTop: 0, paddingTop: 0 }}>
                    <span>Total por mês</span>
                    <strong className="bl-num">{formatBRL(total)}</strong>
                  </div>
                )}
                <div className="bl-alert" role="note">
                  <QrCode size={16} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{note} Cada pagamento libera 30 dias de acesso; a renovação é um novo PIX.</span>
                </div>
                {isChange && (
                  <div className="bl-alert bl-alert-gold" role="note">
                    Ao trocar de plano, um novo período de 30 dias começa a partir do pagamento. Os dias restantes do plano atual não são creditados.
                  </div>
                )}
                <ErrorBanner error={error} />
                {cooldown > 0 && <div role="status" style={{ fontSize: 12, color: 'var(--ink3)' }}>Você poderá tentar novamente em {cooldown}s.</div>}
                {!canCreate && <div className="bl-alert" role="note">Seu perfil não tem permissão para contratar planos.</div>}
                <button
                  type="button" className="bl-btn bl-btn-primary" style={{ justifySelf: 'start' }}
                  disabled={pending || cooldown > 0 || !canCreate} aria-busy={pending}
                  onClick={() => { void run(); }}
                >
                  {pending ? (<><span className="bl-spin" aria-hidden /> {pendingLabel}</>) : (<><CheckCircle2 size={15} aria-hidden /> Gerar PIX</>)}
                </button>
                <p style={{ fontSize: 11.5, color: 'var(--ink3)', margin: 0 }}>
                  Não feche esta página enquanto o pagamento é gerado. Cliques repetidos não geram cobrança duplicada.
                </p>
              </>
            )}
          </aside>
        </>
      )}
    </div>
  );
}
