import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Calendar, AlertTriangle,
  CheckCircle2, Clock, ArrowRight, Percent,
} from 'lucide-react';
import { mockWorks, mockScheduleTasks, mockRiskAlerts, mockExtras } from '@/modules/shared/data/mockData';
import { STATUS_CONFIG, TASK_STATUS_CONFIG } from '@/modules/shared/types';

const CSS = `
.wo{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.wo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;}
.wo-stat{background:#fff;border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 2px 10px rgba(26,24,20,0.04);position:relative;overflow:hidden;}
.wo-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
.wo-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.wo-stat-val{font-family:var(--font-numeric);font-size:22px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink,#1A1814);line-height:1.1;}
.wo-stat-label{font-size:11px;font-weight:500;letter-spacing:0.4px;text-transform:uppercase;color:var(--ink3,#7A7670);margin-top:2px;}
.wo-section-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.wo-card{background:#fff;border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));box-shadow:0 2px 10px rgba(26,24,20,0.04);overflow:hidden;}
.wo-card-header{padding:16px 20px;border-bottom:1px solid rgba(26,24,20,0.06);display:flex;align-items:center;justify-content:space-between;}
.wo-card-title{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:700;color:var(--ink,#1A1814);}
.wo-card-link{font-size:12px;color:var(--gold,#B8922A);cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif;font-weight:500;display:flex;align-items:center;gap:4px;}
.wo-card-body{padding:16px 20px;}
.wo-milestone{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(26,24,20,0.05);}
.wo-milestone:last-child{border-bottom:none;}
.wo-milestone-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0;}
.wo-milestone-info{flex:1;}
.wo-milestone-name{font-size:13px;font-weight:500;color:var(--ink,#1A1814);}
.wo-milestone-date{font-size:11.5px;color:var(--ink3,#7A7670);margin-top:2px;}
.wo-alert-item{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(26,24,20,0.05);}
.wo-alert-item:last-child{border-bottom:none;}
@media(max-width:768px){.wo-section-grid{grid-template-columns:1fr;}}
`;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

export default function WorkOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const work = mockWorks.find(w => w.id === id) || mockWorks[0];
  const alerts = mockRiskAlerts.filter(a => a.workId === id);
  const nextMilestones = mockScheduleTasks.filter(t => t.status !== 'concluida').slice(0, 4);
  const pendingExtras = mockExtras.filter(e => e.status === 'pendente' || e.status === 'em_analise');

  const variation = ((work.currentCost - work.plannedCost) / work.plannedCost * 100);

  const stats = [
    { label: 'Custo Previsto', value: formatCurrency(work.plannedCost), icon: DollarSign, color: '#1A5276', bg: '#EBF5FB' },
    { label: 'Custo Realizado', value: formatCurrency(work.currentCost), icon: TrendingUp, color: variation > 0 ? '#C0392B' : '#1E8449', bg: variation > 0 ? '#FDEDEC' : '#E8F5E9' },
    { label: 'Variação', value: `${variation > 0 ? '+' : ''}${variation.toFixed(1)}%`, icon: Percent, color: variation > 0 ? '#C0392B' : '#1E8449', bg: variation > 0 ? '#FDEDEC' : '#E8F5E9' },
    { label: 'Margem', value: `${work.margin}%`, icon: TrendingUp, color: work.margin > 0 ? '#1E8449' : '#C0392B', bg: work.margin > 0 ? '#E8F5E9' : '#FDEDEC' },
    { label: 'Prazo', value: new Date(work.deadline).toLocaleDateString('pt-BR'), icon: Calendar, color: '#B7770D', bg: '#FFF8E1' },
    { label: 'Extras Pendentes', value: pendingExtras.length, icon: AlertTriangle, color: '#E67E22', bg: '#FFF3E0' },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="wo">
        {/* Stats */}
        <div className="wo-grid">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="wo-stat" style={{ overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
                <div className="wo-stat-icon" style={{ background: s.bg }}>
                  <Icon size={18} color={s.color} />
                </div>
                <div>
                  <div className="wo-stat-val">{s.value}</div>
                  <div className="wo-stat-label">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cards */}
        <div className="wo-section-grid">
          {/* Próximos Marcos */}
          <div className="wo-card">
            <div className="wo-card-header">
              <span className="wo-card-title">Próximos Marcos</span>
              <button className="wo-card-link" onClick={() => navigate(`/works/${id}/schedule`)}>
                Ver cronograma <ArrowRight size={12} />
              </button>
            </div>
            <div className="wo-card-body">
              {nextMilestones.map(task => {
                const statusCfg = TASK_STATUS_CONFIG[task.status];
                return (
                  <div key={task.id} className="wo-milestone">
                    <div className="wo-milestone-dot" style={{ background: statusCfg.color }} />
                    <div className="wo-milestone-info">
                      <div className="wo-milestone-name">{task.name}</div>
                      <div className="wo-milestone-date">
                        {new Date(task.startDate).toLocaleDateString('pt-BR')} — {new Date(task.endDate).toLocaleDateString('pt-BR')}
                        <span style={{
                          marginLeft: 8,
                          fontSize: 10.5,
                          padding: '1px 7px',
                          borderRadius: 8,
                          background: statusCfg.bg,
                          color: statusCfg.color,
                          fontWeight: 500,
                        }}>
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)', alignSelf: 'center' }}>
                      {task.progress}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alertas */}
          <div className="wo-card">
            <div className="wo-card-header">
              <span className="wo-card-title">Alertas & Riscos</span>
            </div>
            <div className="wo-card-body">
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--ink3)' }}>
                  <CheckCircle2 size={28} color="#1E8449" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 13 }}>Nenhum alerta ativo</div>
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="wo-alert-item">
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: alert.severity === 'critico' ? '#FDEDEC' : alert.severity === 'alto' ? '#FFF3E0' : '#FFF8E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <AlertTriangle size={13} color={alert.severity === 'critico' ? '#C0392B' : alert.severity === 'alto' ? '#E67E22' : '#B7770D'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)' }}>{alert.message}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{alert.date}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
