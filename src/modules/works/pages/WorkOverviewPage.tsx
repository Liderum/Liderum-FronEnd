import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp, Calendar, AlertTriangle,
  CheckCircle2, ArrowRight, Percent, ShieldAlert, BookOpen,
} from 'lucide-react';
import {
  WorksService,
  ExtrasService,
  IncidentsService,
  ScheduleService,
  DailyLogService,
} from '@/services/works';
import { TASK_STATUS_CONFIG, INCIDENT_SEVERITY_CONFIG } from '@/modules/shared/types';
import type {
  Work, ExtraRequest, Incident, ScheduleTask, DailyLogEntry,
} from '@/modules/shared/types';

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
.wo-item{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(26,24,20,0.05);}
.wo-item:last-child{border-bottom:none;}
@media(max-width:768px){.wo-section-grid{grid-template-columns:1fr;}}
`;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

export default function WorkOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workId = id ?? '1';

  const [work, setWork] = useState<Work | null>(null);
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [extras, setExtras] = useState<ExtraRequest[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [logs, setLogs] = useState<DailyLogEntry[]>([]);

  useEffect(() => {
    Promise.all([
      WorksService.getById(workId),
      ScheduleService.list(workId),
      ExtrasService.list(workId),
      IncidentsService.list(workId),
      DailyLogService.list(workId),
    ]).then(([w, t, e, i, l]) => {
      setWork(w ?? null);
      setTasks(t);
      setExtras(e);
      setIncidents(i);
      setLogs(l);
    });
  }, [workId]);

  if (!work) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#7A7670' }}>Carregando…</div>;
  }

  const variation = work.totalBudget === 0 ? 0 : ((work.currentCost - work.totalBudget) / work.totalBudget) * 100;
  const marginPct = work.marginPercent ?? (work.totalBudget > 0 ? (work.margin / work.totalBudget) * 100 : 0);
  const pendingExtras = extras.filter((e) => e.status === 'pendente' || e.status === 'em_analise');
  const openIncidents = incidents.filter((i) => i.status !== 'resolvido' && i.status !== 'cancelado');
  const nextMilestones = tasks.filter((t) => t.status !== 'concluida').slice(0, 4);
  const lastLog = logs[0];

  const stats = [
    { label: 'Orçamento Total', value: formatCurrency(work.totalBudget), icon: DollarSign, color: '#1A5276', bg: '#EBF5FB' },
    { label: 'Custo Realizado', value: formatCurrency(work.currentCost), icon: TrendingUp, color: variation > 0 ? '#C0392B' : '#1E8449', bg: variation > 0 ? '#FDEDEC' : '#E8F5E9' },
    { label: 'Variação', value: `${variation > 0 ? '+' : ''}${variation.toFixed(1)}%`, icon: Percent, color: variation > 0 ? '#C0392B' : '#1E8449', bg: variation > 0 ? '#FDEDEC' : '#E8F5E9' },
    { label: 'Margem', value: `${marginPct.toFixed(1)}%`, icon: TrendingUp, color: marginPct > 0 ? '#1E8449' : '#C0392B', bg: marginPct > 0 ? '#E8F5E9' : '#FDEDEC' },
    { label: 'Prazo', value: work.expectedEndDate ? new Date(work.expectedEndDate).toLocaleDateString('pt-BR') : '—', icon: Calendar, color: '#B7770D', bg: '#FFF8E1' },
    { label: 'Extras Pendentes', value: pendingExtras.length, icon: AlertTriangle, color: '#E67E22', bg: '#FFF3E0' },
    { label: 'Incidentes Abertos', value: openIncidents.length, icon: ShieldAlert, color: openIncidents.length > 0 ? '#C0392B' : '#7A7670', bg: openIncidents.length > 0 ? '#FDEDEC' : '#F5F5F5' },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="wo">
        <div className="wo-grid">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="wo-stat">
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

        <div className="wo-section-grid">
          <div className="wo-card">
            <div className="wo-card-header">
              <span className="wo-card-title">Próximos Marcos</span>
              <button className="wo-card-link" onClick={() => navigate(`/works/${workId}/schedule`)}>
                Ver cronograma <ArrowRight size={12} />
              </button>
            </div>
            <div className="wo-card-body">
              {nextMilestones.length === 0 && <div style={{ color: '#7A7670', fontSize: 12 }}>Nenhuma tarefa pendente.</div>}
              {nextMilestones.map((task) => {
                const statusCfg = TASK_STATUS_CONFIG[task.status];
                return (
                  <div key={task.id} className="wo-milestone">
                    <div className="wo-milestone-dot" style={{ background: statusCfg.color }} />
                    <div className="wo-milestone-info">
                      <div className="wo-milestone-name">{task.name}</div>
                      <div className="wo-milestone-date">
                        {new Date(task.startDate).toLocaleDateString('pt-BR')} — {new Date(task.endDate).toLocaleDateString('pt-BR')}
                        <span style={{ marginLeft: 8, fontSize: 10.5, padding: '1px 7px', borderRadius: 8, background: statusCfg.bg, color: statusCfg.color, fontWeight: 500 }}>
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

          <div className="wo-card">
            <div className="wo-card-header">
              <span className="wo-card-title">Incidentes Abertos</span>
              <button className="wo-card-link" onClick={() => navigate(`/works/${workId}/incidents`)}>
                Ver todos <ArrowRight size={12} />
              </button>
            </div>
            <div className="wo-card-body">
              {openIncidents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--ink3)' }}>
                  <CheckCircle2 size={28} color="#1E8449" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 13 }}>Nenhum incidente aberto</div>
                </div>
              ) : (
                openIncidents.slice(0, 4).map((inc) => {
                  const sevCfg = INCIDENT_SEVERITY_CONFIG[inc.severity];
                  return (
                    <div key={inc.id} className="wo-item">
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: sevCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldAlert size={13} color={sevCfg.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{inc.title}</div>
                        <div style={{ fontSize: 11, color: '#7A7670', marginTop: 2 }}>
                          {sevCfg.label} • {inc.reportedBy} • {new Date(inc.reportedAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="wo-section-grid">
          <div className="wo-card">
            <div className="wo-card-header">
              <span className="wo-card-title">Extras Pendentes</span>
              <button className="wo-card-link" onClick={() => navigate(`/works/${workId}/extras`)}>
                Ver todos <ArrowRight size={12} />
              </button>
            </div>
            <div className="wo-card-body">
              {pendingExtras.length === 0 ? (
                <div style={{ color: '#7A7670', fontSize: 12 }}>Nenhum extra pendente.</div>
              ) : (
                pendingExtras.slice(0, 3).map((e) => (
                  <div key={e.id} className="wo-item">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{e.title}</div>
                      <div style={{ fontSize: 11, color: '#7A7670', marginTop: 2 }}>
                        {formatCurrency(e.financialImpact)} • {e.scheduleImpact}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="wo-card">
            <div className="wo-card-header">
              <span className="wo-card-title">Último Registro do Diário</span>
              <button className="wo-card-link" onClick={() => navigate(`/works/${workId}/daily-log`)}>
                Ver diário <ArrowRight size={12} />
              </button>
            </div>
            <div className="wo-card-body">
              {!lastLog ? (
                <div style={{ color: '#7A7670', fontSize: 12 }}>Nenhum registro.</div>
              ) : (
                <div>
                  <div style={{ fontSize: 11, color: '#7A7670', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    <BookOpen size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {new Date(lastLog.date).toLocaleDateString('pt-BR')} — {lastLog.responsible}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{lastLog.description}</div>
                  {lastLog.problems && (
                    <div style={{ marginTop: 10, padding: 10, background: '#FDEDEC', borderRadius: 8, fontSize: 12, color: '#922B21' }}>
                      <strong>Problema:</strong> {lastLog.problems}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
