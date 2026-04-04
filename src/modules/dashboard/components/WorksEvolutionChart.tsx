import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { mockEvolutionData } from '@/modules/shared/data/mockData';

export function WorksEvolutionChart() {
  return (
    <div style={{
      background: '#fff',
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
        background: 'linear-gradient(90deg, #1E8449, #27AE60)',
      }} />
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink, #1A1814)' }}>
          Evolução das Obras
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink3, #7A7670)', marginTop: 2 }}>
          Distribuição por status mensal
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={mockEvolutionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,24,20,0.06)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7A7670' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#7A7670' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid rgba(26,24,20,0.09)', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = { concluidas: 'Concluídas', emAndamento: 'Em andamento', atrasadas: 'Atrasadas' };
              return [value, labels[name] || name];
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", paddingBottom: 8 }}
            formatter={(value: string) => {
              const labels: Record<string, string> = { concluidas: 'Concluídas', emAndamento: 'Em andamento', atrasadas: 'Atrasadas' };
              return labels[value] || value;
            }}
          />
          <Bar dataKey="concluidas" fill="#1E8449" radius={[3, 3, 0, 0]} barSize={18} />
          <Bar dataKey="emAndamento" fill="#1A5276" radius={[3, 3, 0, 0]} barSize={18} />
          <Bar dataKey="atrasadas" fill="#C0392B" radius={[3, 3, 0, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
