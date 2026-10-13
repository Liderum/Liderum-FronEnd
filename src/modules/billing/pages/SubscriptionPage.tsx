import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { BillingService } from '@/services/billing';
import { ErrorBanner } from '../components/Feedback';
import { formatBytes, formatStorage, getCatalogPlan, PLAN_CODES } from '@/constants/plans';
import { StorageService } from '@/services/works/storageService';
import { formatDate } from '../lib';

const STATUS_LABEL: Record<string, string> = {
  active: 'Ativa', pastdue: 'Pagamento em atraso', cancelled: 'Cancelada', canceled: 'Cancelada',
  expired: 'Expirada',
};

export default function SubscriptionPage() {
  const subQ = useQuery({ queryKey: ['billing', 'subscription'], queryFn: () => BillingService.getSubscription() });
  const plansQ = useQuery({ queryKey: ['billing', 'plans'], queryFn: () => BillingService.listPlans() });
  const sub = subQ.data;
  // O uso vem da Works e é só informativo: falha aqui nunca derruba a tela de assinatura.
  const usageQ = useQuery({ queryKey: ['billing', 'storage-usage'], queryFn: () => StorageService.getUsage(), enabled: !!sub, retry: false });
  const usage = usageQ.data;
  const usagePct = usage && usage.limitMb ? Math.min(100, Math.round((usage.usedBytes / (usage.limitMb * 1024 * 1024)) * 100)) : null;
  const apiPlan = plansQ.data?.find((p) => p.code === sub?.planCode);
  const catalog = getCatalogPlan(sub?.planCode);
  const planName = sub?.planName ?? apiPlan?.name ?? catalog?.name ?? sub?.planCode;
  const limits = sub?.limits ?? apiPlan?.limits ?? catalog?.limits ?? null;
  const features = sub && sub.features.length > 0 ? sub.features : apiPlan?.features ?? catalog?.features ?? [];
  const canUpgrade = !!sub?.planCode && sub.planCode.toLowerCase() !== PLAN_CODES.ENTERPRISE && sub.planCode.toLowerCase() !== PLAN_CODES.CRESCIMENTO;
  const upgradeTo = `/billing/plans?plan=${PLAN_CODES.CRESCIMENTO}`;
  const daysLeft = sub?.currentPeriodEnd ? Math.ceil((sub.currentPeriodEnd.getTime() - Date.now()) / 86_400_000) : null;

  return (
    <div className="bl">
      <header>
        <span className="bl-eyebrow">Assinatura</span>
        <h1 className="bl-h1">Minha <em>assinatura</em></h1>
      </header>

      {subQ.isLoading && <div className="bl-skel" style={{ height: 200 }} aria-busy="true" aria-label="Carregando assinatura" />}
      {subQ.isError && <ErrorBanner error={subQ.error as Error} onRetry={() => subQ.refetch()} />}

      {subQ.isSuccess && !sub && (
        <div className="bl-card bl-empty">
          <h2 className="bl-h2">Você ainda não tem um plano ativo</h2>
          <p style={{ margin: 0 }}>Escolha um plano para liberar todos os recursos do Liderum.</p>
          <Link className="bl-btn bl-btn-primary" to="/billing/plans">Ver planos</Link>
        </div>
      )}

      {sub && (
        <div className="bl-card bl-receipt" style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
            <h2 className="bl-h2" style={{ fontSize: 28 }}>{planName}</h2>
            <span className="bl-tag">{STATUS_LABEL[sub.status.toLowerCase()] ?? sub.status}</span>
          </div>
          <div className="bl-line"><span>Início do ciclo</span><span>{formatDate(sub.currentPeriodStart)}</span></div>
          <div className="bl-line"><span>Válida até</span><span>{formatDate(sub.currentPeriodEnd)}</span></div>
          {daysLeft !== null && daysLeft >= 0 && (
            <div className="bl-line"><span>Restam</span><span className="bl-num">{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</span></div>
          )}
          {limits && (
            <>
              <div className="bl-line"><span>Obras ativas</span><span className="bl-num">{limits.maxActiveWorks === null ? 'Ilimitadas' : `até ${limits.maxActiveWorks}`}</span></div>
              <div className="bl-line"><span>Usuários</span><span className="bl-num">{limits.maxMembers === null ? 'Ilimitados' : `até ${limits.maxMembers}`}{sub.extraSeats > 0 ? ` (${sub.extraSeats} extra${sub.extraSeats === 1 ? '' : 's'})` : ''}</span></div>
              <div className="bl-line"><span>Fotos e anexos</span><span className="bl-num">{usage ? `${formatBytes(usage.usedBytes)} de ${formatStorage(usage.limitMb ?? limits.maxStorageMb)}` : formatStorage(limits.maxStorageMb)}</span></div>
              {usagePct !== null && (
                <div role="progressbar" aria-label="Uso do armazenamento" aria-valuemin={0} aria-valuemax={100} aria-valuenow={usagePct}
                  style={{ height: 6, borderRadius: 3, background: 'var(--line, #E5E1D8)', overflow: 'hidden' }}>
                  <div style={{ width: `${usagePct}%`, height: '100%', background: usagePct >= 90 ? '#B3412F' : 'var(--gold, #B8922A)' }} />
                </div>
              )}
              {usagePct !== null && usagePct >= 90 && (
                <div className="bl-alert bl-alert-gold" role="note">
                  Você usou {usagePct}% da franquia de arquivos. Remova anexos antigos ou faça upgrade antes que novos envios sejam bloqueados.
                </div>
              )}
            </>
          )}
          {features.length > 0 && (
            <ul className="bl-pc-list" aria-label="O que o seu plano inclui">
              {features.map((f) => <li key={f}><Check size={15} aria-hidden /><span>{f}</span></li>)}
            </ul>
          )}
          {sub.renewable && (
            <div className="bl-alert bl-alert-gold" role="note">
              A renovação é feita por um novo pagamento PIX a cada ciclo. Renove antes do vencimento para não perder o acesso.
            </div>
          )}
          {canUpgrade && (
            <p style={{ fontSize: 11.5, color: 'var(--ink3)', margin: 0 }}>
              No upgrade, um novo período de 30 dias começa a partir do pagamento. Os dias restantes do plano atual não são creditados.
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {sub.renewable && <Link className="bl-btn bl-btn-primary" to={`/billing/plans?plan=${encodeURIComponent(sub.planCode)}`}>Renovar agora</Link>}
            {canUpgrade && <Link className="bl-btn bl-btn-primary" to={upgradeTo}>Fazer upgrade</Link>}
            <Link className="bl-btn" to="/billing/plans">Ver planos</Link>
          </div>
        </div>
      )}
    </div>
  );
}
