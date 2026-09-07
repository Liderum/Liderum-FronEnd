import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { mockFinancialData } from '@/modules/shared/data/mockData';

function formatCurrency(value: number) {
  if (value >= 1e6) return `R$ ${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `R$ ${(value / 1e3).toFixed(0)}k`;
  return `R$ ${value}`;
}

export function FinancialChart() {
  return (
    <div style={{
      background: 'var(--card-bg, #fff)',
      borderRadius: 12,
      border: '1px solid var(--bdr, rgba(26,24,20,0.10))',
      padding: '22px 24px',
      boxShadow: '0 2px 10px rgba(26,24,20,0.04)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, var(--gold, #B8922A), var(--gold2, #D4A843))',
      }} />
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink, #1A1814)' }}>
          Previsto × Realizado
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink3, #7A7670)', marginTop: 2 }}>
          Acumulado nos últimos 8 meses
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={mockFinancialData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradPrevisto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B8922A" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#B8922A" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradRealizado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A5276" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1A5276" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,24,20,0.06)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--ink3, #7A7670)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--ink3, #7A7670)' }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name === 'previsto' ? 'Previsto' : 'Realizado']}
            contentStyle={{ borderRadius: 8, border: '1px solid rgba(26,24,20,0.09)', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", paddingBottom: 8 }}
            formatter={(value: string) => value === 'previsto' ? 'Previsto' : 'Realizado'}
          />
          <Area type="monotone" dataKey="previsto" stroke="#B8922A" fill="url(#gradPrevisto)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="realizado" stroke="#1A5276" fill="url(#gradRealizado)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
