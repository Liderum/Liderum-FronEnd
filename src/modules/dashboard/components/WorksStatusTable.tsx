import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Work } from '@/modules/shared/types';
import { STATUS_CONFIG } from '@/modules/shared/types';

interface WorksStatusTableProps {
  works: Work[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

export function WorksStatusTable({ works }: WorksStatusTableProps) {
  const navigate = useNavigate();

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid var(--bdr, rgba(26,24,20,0.10))',
      boxShadow: '0 2px 10px rgba(26,24,20,0.04)',
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
              {['Obra', 'Etapa', 'Progresso', 'Custo', 'Status', ''].map(h => (
                <th key={h} style={{
                  padding: '12px 16px',
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'var(--ink3, #7A7670)',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {works.map((work) => {
              const statusCfg = STATUS_CONFIG[work.status];
              return (
                <tr
                  key={work.id}
                  onClick={() => navigate(`/works/${work.id}`)}
                  style={{
                    borderBottom: '1px solid rgba(26,24,20,0.05)',
                    cursor: 'pointer',
                    transition: 'background 0.14s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream, #F7F4EF)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink, #1A1814)' }}>{work.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink3, #7A7670)', marginTop: 2 }}>{work.client}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12.5, color: 'var(--ink2, #3D3A34)' }}>
                    {work.currentStage}
                  </td>
                  <td style={{ padding: '14px 16px', minWidth: 120 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        flex: 1,
                        height: 5,
                        borderRadius: 10,
                        background: 'rgba(26,24,20,0.06)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${work.percentComplete}%`,
                          height: '100%',
                          borderRadius: 10,
                          background: work.percentComplete >= 70 ? '#1E8449' : work.percentComplete >= 40 ? '#B8922A' : '#E67E22',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-numeric)', fontVariantNumeric: 'tabular-nums', fontSize: 11.5, fontWeight: 600, color: 'var(--ink2, #3D3A34)', minWidth: 32, textAlign: 'right' }}>
                        {work.percentComplete}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-numeric)', fontVariantNumeric: 'tabular-nums', fontSize: 12.5, fontWeight: 500, color: 'var(--ink, #1A1814)', whiteSpace: 'nowrap' }}>
                    {formatCurrency(work.currentCost)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 500,
                      background: statusCfg.bg,
                      color: statusCfg.color,
                      whiteSpace: 'nowrap',
                    }}>
                      ● {statusCfg.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <ArrowRight size={14} color="var(--ink3, #7A7670)" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
