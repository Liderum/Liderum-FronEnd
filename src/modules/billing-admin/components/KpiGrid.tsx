import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { DashboardSummary } from '@/services/billing';
import { formatBRL, formatPercent } from '@/modules/billing/lib';
import { deltaRatio } from '../lib';

export function Delta({ ratio, invert = false }: { ratio: number | null; invert?: boolean }) {
  if (ratio === null) return <span className="bl-delta flat"><Minus size={13} aria-hidden /> sem comparação</span>;
  const dir = Math.abs(ratio) < 0.0005 ? 'flat' : ratio > 0 ? 'up' : 'down';
  const good = dir === 'flat' ? 'flat' : (dir === 'up') !== invert ? 'up' : 'down';
  const Icon = dir === 'up' ? ArrowUpRight : dir === 'down' ? ArrowDownRight : Minus;
  const pct = `${ratio > 0 ? '+' : ''}${(ratio * 100).toFixed(1).replace('.', ',')}%`;
  const word = dir === 'up' ? 'aumento' : dir === 'down' ? 'queda' : 'estável';
  return (
    <span className={`bl-delta ${good}`}>
      <Icon size={14} aria-hidden />
      <span className="bl-num">{pct}</span>
      <span className="bl-sr">{word} em relação ao período anterior</span>
      <span aria-hidden style={{ color: 'var(--ink3)', fontWeight: 400 }}>vs. anterior</span>
    </span>
  );
}

interface Kpi { label: string; value: string; delta?: number | null }

export function KpiGrid({ s }: { s: DashboardSummary }) {
  const p = s.previousPeriod;
  const kpis: Kpi[] = [
    { label: 'Receita', value: formatBRL(s.revenueInCents), delta: deltaRatio(s.revenueInCents, p?.revenueInCents) },
    { label: 'MRR', value: formatBRL(s.mrrInCents) },
    { label: 'Clientes ativos', value: String(s.activeCustomers), delta: deltaRatio(s.activeCustomers, p?.activeCustomers) },
    { label: 'Novos clientes', value: String(s.newCustomers), delta: deltaRatio(s.newCustomers, p?.newCustomers) },
    { label: 'Ticket médio', value: formatBRL(s.avgTicketInCents) },
    { label: 'Conversão do checkout', value: formatPercent(s.conversionRate) },
    { label: 'Churn', value: formatPercent(s.churnRate) },
    { label: 'Taxa de estorno', value: formatPercent(s.refundRate) },
  ];
  return (
    <ul className="bl-kpis" style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Indicadores do período">
      {kpis.map((k) => (
        <li key={k.label} className="bl-card bl-kpi">
          <span className="bl-kpi-l">{k.label}</span>
          <span className="bl-kpi-v bl-num">{k.value}</span>
          {k.delta !== undefined && <Delta ratio={k.delta} invert={k.label === 'Churn'} />}
        </li>
      ))}
    </ul>
  );
}
