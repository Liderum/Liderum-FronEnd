import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { BillingError, BillingService, isPendingStatus } from '@/services/billing';
import { useAuth } from '@/contexts/AuthContext';
import { tokenStore } from '@/services/api/tokenStore';
import { useForceLightTheme } from '@/contexts/ThemeContext';
import { billingQueryClient } from '../queryClient';
import { BillingShell } from '../components/BillingShell';
import { CheckoutOutcome } from '../components/CheckoutOutcome';
import { ErrorBanner } from '../components/Feedback';
import { PlanChooser } from '../components/PlanChooser';
import { PendingStage } from '../components/PendingStage';
import { useBeforeUnloadGuard } from '../hooks/useBeforeUnloadGuard';
import { useCheckoutPolling } from '../hooks/useCheckoutPolling';
import { useSingleFlight } from '../hooks/useSingleFlight';
import { formatBRL } from '../lib';

type Step = 'plan' | 'pay' | 'done';
const ACTIVATION_POLL_MS = 3_000;
const ACTIVATION_MAX_POLLS = 10;

interface FlowProps { email: string }

function useFinish(email: string) {
  const navigate = useNavigate();
  const { setPaymentRequired } = useAuth();
  return useCallback(() => {
    tokenStore.clearCheckoutToken();
    billingQueryClient.clear(); // não deixa dados do checkout em cache para a próxima sessão
    setPaymentRequired(false);
    navigate('/login', { replace: true, state: { email } });
  }, [email, navigate, setPaymentRequired]);
}

/** Sessão de pagamento expirada (token de checkout vale 30 min): o login devolve um token novo. */
function SessionExpired({ email }: FlowProps) {
  const leave = useFinish(email);
  return (
    <div className="bl-card bl-end" role="alert">
      <h2 className="bl-h2">Sua sessão de pagamento expirou</h2>
      <p className="bl-lead">Por segurança ela dura 30 minutos. Entre novamente para continuar de onde parou; nada foi cobrado.</p>
      <button type="button" className="bl-btn bl-btn-primary" onClick={leave}>Entrar novamente</button>
    </div>
  );
}

function PlanStep({ email, initialPlan, onCreated }: FlowProps & { initialPlan: string | null; onCreated: (id: string) => void }) {
  const plansQ = useQuery({ queryKey: ['billing', 'plans'], queryFn: () => BillingService.listPlans() });
  const plans = useMemo(() => plansQ.data ?? [], [plansQ.data]);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  const submit = useCallback(async (planCode: string, extraSeats: number) => {
    // Só planCode/method/extraSeats saem do cliente; preço e valores vêm sempre do servidor.
    const checkout = await BillingService.createCheckout({ planCode, method: 'PIX_TRANSPARENT', extraSeats });
    onCreated(checkout.id);
  }, [onCreated]);

  const unauthorized = (submitError instanceof BillingError && submitError.kind === 'unauthorized')
    || (plansQ.error instanceof BillingError && plansQ.error.kind === 'unauthorized');
  if (unauthorized) return <SessionExpired email={email} />;

  return (
    <PlanChooser
      plans={plans}
      loading={plansQ.isLoading}
      loadError={plansQ.isError ? (plansQ.error as Error) : null}
      onRetry={() => plansQ.refetch()}
      initialCode={initialPlan}
      onSubmit={submit}
      onError={setSubmitError}
      pendingLabel="Gerando PIX…"
      note="Pagamento por PIX. Seu acesso é liberado assim que o pagamento for confirmado."
    />
  );
}

function PayStep({ id, email, onPaid, onRestart }: FlowProps & { id: string; onPaid: () => void; onRestart: () => void }) {
  const qc = useQueryClient();
  const { data: checkout, error, isLoading, terminal, timedOut, restart, refetch } = useCheckoutPolling(id);
  const plansQ = useQuery({ queryKey: ['billing', 'plans'], queryFn: () => BillingService.listPlans() });
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelError, setCancelError] = useState<Error | null>(null);

  useEffect(() => {
    if (checkout?.status === 'Paid') onPaid();
  }, [checkout?.status, onPaid]);

  const cancel = useCallback(async () => {
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

  if (error instanceof BillingError && error.kind === 'unauthorized') return <SessionExpired email={email} />;
  const fatal = error instanceof BillingError && !error.retryable ? error : null;
  const pending = !!checkout && isPendingStatus(checkout.status);
  const planName = plansQ.data?.find((p) => p.code === checkout?.planCode)?.name ?? checkout?.planCode;

  return (
    <div className="bl-grid2">
      <div style={{ display: 'grid', gap: 16 }}>
        {isLoading && <div className="bl-skel" style={{ height: 320 }} aria-busy="true" aria-label="Carregando pagamento" />}
        {fatal && (<><ErrorBanner error={fatal} /><div><button type="button" className="bl-btn" onClick={onRestart}>Voltar aos planos</button></div></>)}
        {error && !fatal && !checkout && <ErrorBanner error={error as Error} onRetry={() => refetch()} />}
        {checkout && pending && <PendingStage checkout={checkout} timedOut={timedOut} restart={restart} unstable={!!error && !fatal} />}
        {checkout && terminal && checkout.status !== 'Paid' && <CheckoutOutcome status={checkout.status} onRetry={onRestart} />}
      </div>

      {checkout && (
        <aside className="bl-card bl-receipt" aria-label="Resumo do pedido">
          <h2 className="bl-h2">Resumo</h2>
          <div className="bl-line"><span>Plano</span><span>{planName}</span></div>
          <div className="bl-line"><span>Forma</span><span>PIX</span></div>
          <div className="bl-total">
            <span style={{ color: 'var(--ink3)', fontSize: 12 }}>Total</span>
            <strong className="bl-num">{formatBRL(checkout.amountInCents)}</strong>
          </div>
          {pending && (confirmCancel ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontSize: 12.5 }}>Cancelar este PIX para escolher outro plano? Se você já pagou, não cancele.</span>
              {cancelError && <div className="bl-alert bl-alert-err" role="alert">{cancelError.message}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="bl-btn bl-btn-danger" disabled={cancelling} aria-busy={cancelling} onClick={() => { void runCancel(); }}>
                  {cancelling ? <><span className="bl-spin" aria-hidden /> Cancelando…</> : 'Sim, cancelar'}
                </button>
                <button type="button" className="bl-btn" disabled={cancelling} onClick={() => setConfirmCancel(false)}>Voltar</button>
              </div>
            </div>
          ) : (
            <button type="button" className="bl-btn bl-btn-ghost" onClick={() => setConfirmCancel(true)}>Trocar de plano</button>
          ))}
        </aside>
      )}
    </div>
  );
}

function DoneStep({ email }: FlowProps) {
  const leave = useFinish(email);
  const polls = useRef(0);
  // A Security ativa o tenant de forma assíncrona (evento do Payments): espera a assinatura ficar Active.
  const subQ = useQuery({
    queryKey: ['billing', 'subscription', 'activation'],
    queryFn: async () => { polls.current += 1; return BillingService.getSubscription(); },
    refetchInterval: (q) => (q.state.data?.status === 'Active' || polls.current >= ACTIVATION_MAX_POLLS ? false : ACTIVATION_POLL_MS),
    staleTime: 0,
  });
  const active = subQ.data?.status === 'Active';
  const gaveUp = !active && (polls.current >= ACTIVATION_MAX_POLLS || subQ.isError);

  return (
    <div className="bl-card bl-end" role="status" data-testid="payment-confirmed" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="bl-end-ico ok"><CheckCircle2 size={26} aria-hidden /></div>
      <h2 className="bl-h2">Pagamento confirmado</h2>
      <p className="bl-lead">
        {active ? 'Sua conta está ativa. Entre com o seu e-mail e senha para começar.'
          : gaveUp ? 'Recebemos o seu pagamento. A ativação pode levar alguns instantes; se o login ainda pedir pagamento, aguarde um pouco e tente de novo.'
          : 'Recebemos o seu pagamento. Estamos ativando a sua conta…'}
      </p>
      <button type="button" className="bl-btn bl-btn-primary" onClick={leave} disabled={!active && !gaveUp} aria-busy={!active && !gaveUp}>
        {!active && !gaveUp ? <><span className="bl-spin" aria-hidden /> Ativando…</> : 'Entrar'}
      </button>
    </div>
  );
}

function Flow({ email, initialPlan }: FlowProps & { initialPlan: string | null }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>('plan');
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  // Retomada: pagamento já feito (tenant Active/assinatura) ou PIX pendente ao reabrir/relogar.
  const bootQ = useQuery({
    queryKey: ['billing', 'checkout-boot'],
    queryFn: async () => {
      const [sub, pending] = await Promise.all([
        BillingService.getSubscription().catch(() => null),
        BillingService.findResumableCheckout().catch(() => null),
      ]);
      return { active: sub?.status === 'Active', pendingId: pending?.id ?? null };
    },
    staleTime: 0,
    gcTime: 0,
  });
  const booted = useRef(false);
  useEffect(() => {
    if (!bootQ.data || booted.current) return;
    booted.current = true;
    if (bootQ.data.active) setStep('done');
    else if (bootQ.data.pendingId) { setCheckoutId(bootQ.data.pendingId); setStep('pay'); }
  }, [bootQ.data]);

  const onCreated = useCallback((id: string) => { setCheckoutId(id); setStep('pay'); }, []);
  const onPaid = useCallback(() => setStep('done'), []);
  const onRestart = useCallback(() => { setCheckoutId(null); setStep('plan'); }, []);

  const steps: { key: Step; label: string }[] = [
    { key: 'plan', label: 'Plano' }, { key: 'pay', label: 'Pagamento PIX' }, { key: 'done', label: 'Confirmação' },
  ];
  const idx = steps.findIndex((s) => s.key === step);

  return (
    <div className="bl">
      <header>
        <span className="bl-eyebrow">Falta só um passo</span>
        <h1 className="bl-h1">Ative a sua conta <em>no Liderum</em></h1>
        <ol className="bl-stepper" aria-label="Etapas">
          {steps.map((s, i) => (
            <li key={s.key} className={i < idx ? 'done' : ''} aria-current={i === idx ? 'step' : undefined}>
              <span className="n">{i < idx ? '✓' : i + 1}</span>{s.label}
            </li>
          ))}
        </ol>
      </header>

      {bootQ.isLoading ? (
        <div className="bl-skel" style={{ height: 260 }} aria-busy="true" aria-label="Carregando" />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 'plan' && <PlanStep email={email} initialPlan={initialPlan} onCreated={onCreated} />}
            {step === 'pay' && checkoutId && <PayStep id={checkoutId} email={email} onPaid={onPaid} onRestart={onRestart} />}
            {step === 'done' && <DoneStep email={email} />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

/**
 * Checkout pós-cadastro / pós-402 (fora do DashboardLayout). Autenticado só com o token de checkout em memória:
 * sem ele (ex.: F5) volta ao login, que devolve um token novo via 402.
 */
export default function CheckoutFlowPage() {
  useForceLightTheme();
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';
  // Plano vindo da landing/cadastro (router state) ou de ?plan= — só pré-seleciona; o preço sempre vem da API.
  const initialPlan = (location.state as { plan?: string } | null)?.plan ?? new URLSearchParams(location.search).get('plan');
  // Trava a decisão depois do bootstrap: ao concluir o fluxo o token é limpo e não devemos redirecionar sozinhos.
  const allowed = useRef<boolean | null>(null);
  if (!isLoading && allowed.current === null) allowed.current = !!tokenStore.getCheckoutToken();

  if (isLoading || allowed.current === null) {
    return <div className="bl-page" style={{ display: 'grid', placeItems: 'center' }} aria-busy="true"><span className="bl-spin" role="status" aria-label="Carregando" /></div>;
  }
  if (isAuthenticated) return <Navigate to="/billing/plans" replace />;
  if (!allowed.current) return <Navigate to="/login" replace state={{ email }} />;

  return (
    <BillingShell>
      <div className="bl-page">
        <nav className="bl-page-nav" aria-label="Topo">
          <span className="bl-logo">Lider<span>um</span></span>
          {email && <span style={{ fontSize: 12.5, color: 'var(--ink3)' }}>{email}</span>}
        </nav>
        <main className="bl-page-main">
          <Flow email={email} initialPlan={initialPlan} />
        </main>
      </div>
    </BillingShell>
  );
}
