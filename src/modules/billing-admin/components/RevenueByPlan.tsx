import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardSummary } from '@/services/billing';
import { formatBRL, formatBRLCompact, formatPercent } from '@/modules/billing/lib';

export function RevenueByPlan({ byPlan }: { byPlan: DashboardSummary['byPlan'] }) {
  const total = byPlan.reduce((a, p) => a + p.revenueInCents, 0);
  const data = [...byPlan].sort((a, b) => b.revenueInCents - a.revenueInCents).map((p) => ({ name: p.planCode, value: p.revenueInCents }));

  return (
    <section className="bl-card bl-chart" aria-labelledby="bl-plan-h">
      <h2 className="bl-h2" id="bl-plan-h">Receita por plano</h2>
      {byPlan.length === 0 ? (
        <div className="bl-empty">Nenhuma receita no período.</div>
      ) : (
        <>
          <div className="bl-chart-box" style={{ height: 200 }} role="img" aria-label={`Receita por plano: ${data.map((d) => `${d.name} ${formatBRL(d.value)}`).join('; ')}.`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--bdr)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--ink3)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatBRLCompact(v)} />
                <YAxis type="category" dataKey="name" width={64} tick={{ fill: 'var(--ink2)', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => [formatBRL(v), 'Receita']} cursor={{ fill: 'var(--cream)' }}
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--bdr-strong)', borderRadius: 10, fontSize: 12, color: 'var(--ink)' }} />
                <Bar dataKey="value" fill="var(--gold)" radius={[0, 5, 5, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bl-table-wrap">
            <table className="bl-table" style={{ minWidth: 0 }}>
              <thead><tr><th scope="col">Plano</th><th scope="col" className="r">Clientes</th><th scope="col" className="r">Receita</th><th scope="col" className="r">%</th></tr></thead>
              <tbody>
                {byPlan.map((p) => (
                  <tr key={p.planCode}>
                    <td>{p.planCode}</td>
                    <td className="r bl-num">{p.customers}</td>
                    <td className="r bl-num">{formatBRL(p.revenueInCents)}</td>
                    <td className="r bl-num">{total ? formatPercent(p.revenueInCents / total) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
