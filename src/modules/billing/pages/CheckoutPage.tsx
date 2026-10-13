import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BillingError, BillingService, isPendingStatus } from '@/services/billing';
import { useAuth } from '@/contexts/AuthContext';
import { PAYMENTS_PERMISSIONS } from '@/constants/permissions';
import { useCheckoutPolling } from '../hooks/useCheckoutPolling';
import { useSingleFlight } from '../hooks/useSingleFlight';
import { formatBRL, formatDateTime } from '../lib';
import { CheckoutOutcome } from '../components/CheckoutOutcome';
import { PendingStage } from '../components/PendingStage';
import { ErrorBanner } from '../components/Feedback';

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { permissions } = useAuth();
  const canCancel = permissions.includes(PAYMENTS_PERMISSIONS.CHECKOUTS_CREATE);
  const { data: checkout, error, isLoading, terminal, timedOut, restart, refetch } = useCheckoutPolling(id);
  const plansQ = useQuery({ queryKey: ['billing', 'plans'], queryFn: () => BillingService.listPlans() });
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelError, setCancelError] = useState<Error | null>(null);

  useEffect(() => {
    if (checkout?.status === 'Paid') {
      void qc.invalidateQueries({ queryKey: ['billing', 'subscription'] });
      void qc.invalidateQueries({ queryKey: ['billing', 'resumable'] });
    }
  }, [checkout?.status, qc]);

  const cancel = useCallback(async () => {
    if (!id) return;
    setCancelError(null);
    try {
      const updated = await BillingService.cancelCheckout(id);
      qc.setQueryData(['billing', 'checkout', id], updated);
      setConfirmCancel(false);
    } catch (e) {
      setCancelError(e instanceof Error ? e : new Error('Erro inesperado.'));
    }
  }, [id, qc]);
  const { run: runCancel, pending: cancelling } = useSingleFlight(cancel);

  const planName = plansQ.data?.find((p) => p.code === checkout?.planCode)?.name ?? checkout?.planCode;
  const pending = !!checkout && isPendingStatus(checkout.status);
  const fatal = error instanceof BillingError && !error.retryable ? error : null;

  return (
    <div className="bl">
      <header>
        <span className="bl-eyebrow">Pagamento</span>
        <h1 className="bl-h1">Finalize sua <em>assinatura</em></h1>
      </header>

      {isLoading && <div className="bl-skel" style={{ height: 320 }} aria-busy="true" aria-label="Carregando pagamento" />}
      {fatal && (
        <>
          <ErrorBanner error={fatal} />
          <div><Link className="bl-btn" to="/billing/plans">Voltar aos planos</Link></div>
        </>
      )}
      {error && !fatal && !checkout && <ErrorBanner error={error as Error} onRetry={() => refetch()} />}

      {checkout && (
        <div className="bl-grid2">
          <div style={{ display: 'grid', gap: 16 }}>
            {pending && <PendingStage checkout={checkout} timedOut={timedOut} restart={restart} unstable={!!error && !fatal} />}
            {terminal && <CheckoutOutcome status={checkout.status} />}
          </div>

          <aside className="bl-card bl-receipt" aria-label="Resumo do pedido">
            <h2 className="bl-h2">Resumo</h2>
            <div className="bl-line"><span>Plano</span><span>{planName}</span></div>
            <div className="bl-line"><span>Forma</span><span>PIX</span></div>
            {checkout.paidAt && <div className="bl-line"><span>Pago em</span><span>{formatDateTime(checkout.paidAt)}</span></div>}
            <div className="bl-total">
              <span style={{ color: 'var(--ink3)', fontSize: 12 }}>Total</span>
              <strong className="bl-num">{formatBRL(checkout.amountInCents)}</strong>
            </div>

            {pending && canCancel && (
              confirmCancel ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontSize: 12.5 }}>Cancelar este pagamento? Se você já pagou, não cancele.</span>
                  {cancelError && <div className="bl-alert bl-alert-err" role="alert">{cancelError.message}</div>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="bl-btn bl-btn-danger" disabled={cancelling} aria-busy={cancelling} onClick={() => { void runCancel(); }}>
                      {cancelling ? <><span className="bl-spin" aria-hidden /> Cancelando…</> : 'Sim, cancelar'}
                    </button>
                    <button type="button" className="bl-btn" disabled={cancelling} onClick={() => setConfirmCancel(false)}>Voltar</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="bl-btn bl-btn-ghost" onClick={() => setConfirmCancel(true)}>Cancelar pagamento</button>
              )
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
