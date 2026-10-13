import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Granularity, TimeseriesPoint } from '@/services/billing';
import { formatBRL, formatBRLCompact } from '@/modules/billing/lib';

type Metric = 'revenueInCents' | 'paidCount' | 'newCustomers';
const METRICS: { key: Metric; label: string }[] = [
  { key: 'revenueInCents', label: 'Receita' },
  { key: 'paidCount', label: 'Pagamentos' },
  { key: 'newCustomers', label: 'Novos clientes' },
];

const fmtBucket = (d: Date, g: Granularity) =>
  new Intl.DateTimeFormat('pt-BR', g === 'month' ? { month: 'short', year: '2-digit' } : { day: '2-digit', month: 'short' }).format(d);

export function TimeseriesChart({ points, granularity }: { points: TimeseriesPoint[]; granularity: Granularity }) {
  const [metric, setMetric] = useState<Metric>('revenueInCents');
  const isMoney = metric === 'revenueInCents';
  const fmt = (v: number) => (isMoney ? formatBRL(v) : String(v));
  const data = points.map((p) => ({ label: fmtBucket(p.bucket, granularity), value: p[metric] }));
  const total = points.reduce((a, p) => a + p[metric], 0);
  const metricLabel = METRICS.find((m) => m.key === metric)!.label;

  return (
    <section className="bl-card bl-chart" aria-labelledby="bl-ts-h">
      <div className="bl-toolbar">
        <div>
          <h2 className="bl-h2" id="bl-ts-h">Evolução no período</h2>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>Total: <span className="bl-num">{fmt(total)}</span></div>
        </div>
        <div className="bl-seg" role="group" aria-label="Métrica do gráfico">
          {METRICS.map((m) => (
            <button key={m.key} type="button" className="bl-tab" aria-pressed={metric === m.key} onClick={() => setMetric(m.key)}>{m.label}</button>
          ))}
        </div>
      </div>

      {points.length === 0 ? (
        <div className="bl-empty">Sem movimentação neste período.</div>
      ) : (
        <>
          <div className="bl-chart-box" role="img" aria-label={`Gráfico de ${metricLabel.toLowerCase()} por ${granularity === 'day' ? 'dia' : granularity === 'week' ? 'semana' : 'mês'}, total ${fmt(total)}. Os dados estão na tabela abaixo.`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bl-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--bdr)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--ink3)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--bdr-strong)' }} minTickGap={24} />
                <YAxis tick={{ fill: 'var(--ink3)', fontSize: 11 }} tickLine={false} axisLine={false} width={isMoney ? 64 : 36} allowDecimals={false}
                  tickFormatter={(v: number) => (isMoney ? formatBRLCompact(v) : String(v))} />
                <Tooltip
                  formatter={(v: number) => [fmt(v), metricLabel]}
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--bdr-strong)', borderRadius: 10, fontSize: 12, color: 'var(--ink)' }}
                  labelStyle={{ color: 'var(--ink3)' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--gold)" strokeWidth={2.2} fill="url(#bl-grad)" activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <details>
            <summary style={{ cursor: 'pointer', fontSize: 12.5, color: 'var(--ink3)' }}>Ver dados em tabela</summary>
            <div className="bl-table-wrap">
              <table className="bl-table" style={{ minWidth: 0 }}>
                <caption className="bl-sr">{metricLabel} por período</caption>
                <thead><tr><th scope="col">Período</th><th scope="col" className="r">{metricLabel}</th></tr></thead>
                <tbody>{data.map((d, i) => <tr key={i}><td>{d.label}</td><td className="r bl-num">{fmt(d.value)}</td></tr>)}</tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
