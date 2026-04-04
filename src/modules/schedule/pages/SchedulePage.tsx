import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, Lock, Minus } from 'lucide-react';
import { mockScheduleTasks } from '@/modules/shared/data/mockData';
import { TASK_STATUS_CONFIG } from '@/modules/shared/types';
import type { TaskStatus } from '@/modules/shared/types';

const CSS = `
.sc{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.sc-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;}
.sc-summary-card{background:#fff;border-radius:10px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:14px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 2px 8px rgba(26,24,20,0.03);}
.sc-summary-val{font-family:var(--font-numeric);font-size:22px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink,#1A1814);}
.sc-summary-label{font-size:10.5px;color:var(--ink3,#7A7670);font-weight:500;text-transform:uppercase;letter-spacing:0.4px;}
.sc-timeline{position:relative;padding-left:28px;}
.sc-timeline::before{content:'';position:absolute;left:11px;top:0;bottom:0;width:2px;background:rgba(26,24,20,0.08);border-radius:2px;}
.sc-stage{margin-bottom:26px;}
.sc-stage-label{font-size:10.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold,#B8922A);margin-bottom:10px;position:relative;}
.sc-stage-label::before{content:'';position:absolute;left:-21px;top:50%;transform:translateY(-50%);width:10px;height:10px;border-radius:50%;background:var(--gold,#B8922A);border:2px solid #fff;box-shadow:0 0 0 2px rgba(184,146,42,0.2);}
.sc-task{background:#fff;border-radius:10px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:16px 20px;margin-bottom:8px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 6px rgba(26,24,20,0.03);transition:all 0.18s;position:relative;}
.sc-task:hover{box-shadow:0 4px 16px rgba(26,24,20,0.08);transform:translateX(2px);}
.sc-task-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sc-task-info{flex:1;min-width:0;}
.sc-task-name{font-size:13px;font-weight:500;color:var(--ink,#1A1814);}
.sc-task-dates{font-size:11.5px;color:var(--ink3,#7A7670);margin-top:2px;display:flex;align-items:center;gap:8px;}
.sc-task-responsible{font-size:11px;color:var(--ink3,#7A7670);}
.sc-task-right{display:flex;align-items:center;gap:12px;flex-shrink:0;}
.sc-task-progress{width:80px;}
.sc-task-progress-bar{height:5px;border-radius:10px;background:rgba(26,24,20,0.06);overflow:hidden;}
.sc-task-progress-fill{height:100%;border-radius:10px;transition:width 0.5s ease;}
.sc-task-pct{font-size:11.5px;font-weight:600;color:var(--ink2,#3D3A34);text-align:right;margin-top:2px;}
.sc-task-deps{position:absolute;left:-20px;top:50%;transform:translateY(-50%);width:8px;height:8px;border-radius:50%;border:2px solid rgba(26,24,20,0.15);background:#fff;}
`;

const statusIcons: Record<TaskStatus, typeof CheckCircle2> = {
  concluida: CheckCircle2,
  em_andamento: Clock,
  pendente: Minus,
  bloqueada: Lock,
  atrasada: AlertTriangle,
};

function getProgressColor(pct: number, status: TaskStatus) {
  if (status === 'concluida') return '#1E8449';
  if (status === 'atrasada' || status === 'bloqueada') return '#C0392B';
  if (pct >= 60) return '#B8922A';
  return '#1A5276';
}

export default function SchedulePage() {
  const { id } = useParams();
  const tasks = mockScheduleTasks;

  const stages = Array.from(new Set(tasks.map(t => t.stage)));
  const tasksByStage = stages.map(stage => ({
    stage,
    tasks: tasks.filter(t => t.stage === stage),
  }));

  const completed = tasks.filter(t => t.status === 'concluida').length;
  const inProgress = tasks.filter(t => t.status === 'em_andamento').length;
  const pending = tasks.filter(t => t.status === 'pendente').length;
  const delayed = tasks.filter(t => t.status === 'atrasada' || t.status === 'bloqueada').length;

  const summaryItems = [
    { label: 'Concluídas', value: completed, color: '#1E8449', bg: '#E8F5E9' },
    { label: 'Em Andamento', value: inProgress, color: '#1A5276', bg: '#EBF5FB' },
    { label: 'Pendentes', value: pending, color: '#7A7670', bg: '#F5F5F5' },
    { label: 'Em Risco', value: delayed, color: '#C0392B', bg: '#FDEDEC' },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="sc">
        {/* Summary */}
        <div className="sc-summary">
          {summaryItems.map(s => (
            <div key={s.label} className="sc-summary-card">
              <div style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-numeric)', fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: s.color }}>{s.value}</span>
              </div>
              <div className="sc-summary-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="sc-timeline">
          {tasksByStage.map((group, gi) => (
            <motion.div
              key={group.stage}
              className="sc-stage"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: gi * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="sc-stage-label">{group.stage}</div>
              {group.tasks.map(task => {
                const statusCfg = TASK_STATUS_CONFIG[task.status];
                const StatusIcon = statusIcons[task.status];
                return (
                  <div key={task.id} className="sc-task">
                    <div className="sc-task-deps" style={{ borderColor: statusCfg.color }} />
                    <div className="sc-task-icon" style={{ background: statusCfg.bg }}>
                      <StatusIcon size={15} color={statusCfg.color} />
                    </div>
                    <div className="sc-task-info">
                      <div className="sc-task-name">{task.name}</div>
                      <div className="sc-task-dates">
                        {new Date(task.startDate).toLocaleDateString('pt-BR')} → {new Date(task.endDate).toLocaleDateString('pt-BR')}
                        <span className="sc-task-responsible">• {task.responsible}</span>
                      </div>
                    </div>
                    <div className="sc-task-right">
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 8,
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        whiteSpace: 'nowrap',
                      }}>
                        {statusCfg.label}
                      </span>
                      <div className="sc-task-progress">
                        <div className="sc-task-progress-bar">
                          <div
                            className="sc-task-progress-fill"
                            style={{
                              width: `${task.progress}%`,
                              background: getProgressColor(task.progress, task.status),
                            }}
                          />
                        </div>
                        <div className="sc-task-pct">{task.progress}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
