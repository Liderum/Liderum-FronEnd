import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { PaymentsAdminService } from '@/services/billing';
import { ErrorBanner } from '@/modules/billing/components/Feedback';
import { formatDate } from '@/modules/billing/lib';
import { granularityFor, PERIODS, periodRange, type PeriodKey } from '../lib';
import { KpiGrid } from '../components/KpiGrid';
import { TimeseriesChart } from '../components/TimeseriesChart';
import { RevenueByPlan } from '../components/RevenueByPlan';
import { CustomersTable } from '../components/CustomersTable';

export default function PaymentsDashboardPage() {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const range = useMemo(() => periodRange(period), [period]);
  const granularity = granularityFor(period);
  const key = [range.from.toISOString(), range.to.toISOString()];

  const summaryQ = useQuery({
    queryKey: ['billing-admin', 'summary', ...key],
    queryFn: () => PaymentsAdminService.getSummary(range.from, range.to),
    placeholderData: keepPreviousData,
  });
  const seriesQ = useQuery({
    queryKey: ['billing-admin', 'timeseries', ...key, granularity],
    queryFn: () => PaymentsAdminService.getTimeseries(range.from, range.to, granularity),
    placeholderData: keepPreviousData,
  });
  const s = summaryQ.data;

  return (
    <div className="bl">
      <div className="bl-toolbar">
        <header>
          <span className="bl-eyebrow">Plataforma</span>
          <h1 className="bl-h1">Painel de <em>pagamentos</em></h1>
          <p className="bl-lead">{formatDate(range.from)} a {formatDate(range.to)}, comparado ao período anterior equivalente.</p>
        </header>
        <div className="bl-seg" role="group" aria-label="Período">
          {PERIODS.map((p) => (
            <button key={p.key} type="button" className="bl-tab" aria-pressed={period === p.key} onClick={() => setPeriod(p.key)}>{p.label}</button>
          ))}
        </div>
      </div>

      {summaryQ.isError && <ErrorBanner error={summaryQ.error as Error} onRetry={() => summaryQ.refetch()} />}
      {summaryQ.isLoading && (
        <div className="bl-kpis" aria-busy="true" aria-label="Carregando indicadores">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="bl-skel" style={{ height: 104, borderRadius: 14 }} />)}
        </div>
      )}
      {s && (
        <>
          <KpiGrid s={s} />
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink3)' }} className="bl-num">
            Cobranças criadas {s.checkoutsCreated} · pagas {s.checkoutsPaid} · pendentes {s.pendingCount} · falhas {s.failedCount} · estornos {s.refundedCount} · disputas {s.disputedCount}
          </p>
        </>
      )}

      <div className="bl-charts">
        <div>
          {seriesQ.isError ? <ErrorBanner error={seriesQ.error as Error} onRetry={() => seriesQ.refetch()} />
            : seriesQ.isLoading ? <div className="bl-skel" style={{ height: 400, borderRadius: 14 }} aria-busy="true" aria-label="Carregando gráfico" />
            : <TimeseriesChart points={seriesQ.data ?? []} granularity={granularity} />}
        </div>
        <div>
          {s ? <RevenueByPlan byPlan={s.byPlan} /> : !summaryQ.isError && <div className="bl-skel" style={{ height: 400, borderRadius: 14 }} aria-hidden />}
        </div>
      </div>

      <CustomersTable />
    </div>
  );
}
