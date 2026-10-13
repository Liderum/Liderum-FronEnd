import { useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock } from 'lucide-react';
import { BillingService } from '@/services/billing';
import { useAuth } from '@/contexts/AuthContext';
import { PAYMENTS_PERMISSIONS } from '@/constants/permissions';
import { formatBRL } from '../lib';
import { PlanChooser } from '../components/PlanChooser';

export default function PlansPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { permissions } = useAuth();
  const canCreate = permissions.includes(PAYMENTS_PERMISSIONS.CHECKOUTS_CREATE);
  const canReadSubscription = permissions.includes(PAYMENTS_PERMISSIONS.SUBSCRIPTION_READ);
  const canReadCheckouts = permissions.includes(PAYMENTS_PERMISSIONS.CHECKOUTS_READ);

  const plansQ = useQuery({ queryKey: ['billing', 'plans'], queryFn: () => BillingService.listPlans() });
  const subQ = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => BillingService.getSubscription(),
    enabled: canReadSubscription,
  });
  const resumeQ = useQuery({
    queryKey: ['billing', 'resumable'],
    queryFn: () => BillingService.findResumableCheckout(),
    enabled: canReadCheckouts,
    staleTime: 0,
  });

  const plans = useMemo(() => plansQ.data ?? [], [plansQ.data]);
  const submit = useCallback(async (planCode: string, extraSeats: number) => {
    // Só planCode/method/extraSeats saem do cliente — o total é calculado pelo servidor.
    const checkout = await BillingService.createCheckout({ planCode, method: 'PIX_TRANSPARENT', extraSeats });
    // 202 (retido para análise) volta sem pix: a tela de checkout mostra "em análise" e faz polling.
    navigate(`/billing/checkout/${checkout.id}`);
  }, [navigate]);

  const current = subQ.data?.planCode;
  const resumable = resumeQ.data;

  return (
    <div className="bl">
      <header>
        <span className="bl-eyebrow">Assinatura</span>
        <h1 className="bl-h1">Escolha o plano que <em>acompanha sua obra</em></h1>
        <p className="bl-lead">Pagamento por PIX, com confirmação em segundos. O valor é sempre definido pelo Liderum — nada é cobrado sem a sua confirmação.</p>
      </header>

      {resumable && (
        <div className="bl-alert bl-alert-gold" role="status">
          <Clock size={18} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            Você tem um pagamento pendente de <strong className="bl-num">{formatBRL(resumable.amountInCents)}</strong>.{' '}
            <Link to={`/billing/checkout/${resumable.id}`} style={{ color: 'var(--gold)', fontWeight: 600 }}>
              Retomar pagamento <ArrowRight size={13} style={{ display: 'inline', verticalAlign: '-2px' }} aria-hidden />
            </Link>
          </div>
        </div>
      )}

      <PlanChooser
        plans={plans}
        loading={plansQ.isLoading}
        loadError={plansQ.isError ? (plansQ.error as Error) : null}
        onRetry={() => plansQ.refetch()}
        initialCode={params.get('plan')}
        currentCode={current}
        currentExtraSeats={subQ.data?.extraSeats ?? 0}
        canCreate={canCreate}
        onSubmit={submit}
      />
    </div>
  );
}
