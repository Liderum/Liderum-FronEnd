import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, Lock, Minus, Plus, X, List, BarChart3, Trash2,
} from 'lucide-react';
import { ScheduleService } from '@/services/works';
import { useAuth } from '@/contexts/AuthContext';
import { TASK_STATUS_CONFIG } from '@/modules/shared/types';
import type { ScheduleTask, TaskStatus } from '@/modules/shared/types';
import GanttView from '../components/GanttView';
import { LdDateInput } from '@/components/LdDateInput';

const CSS = `
.sc{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.sc-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;}
.sc-summary-card{background:#fff;border-radius:10px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:14px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 2px 8px rgba(26,24,20,0.03);}
.sc-summary-val{font-family:var(--font-numeric);font-size:22px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink,#1A1814);}
.sc-summary-label{font-size:10.5px;color:var(--ink3,#7A7670);font-weight:500;text-transform:uppercase;letter-spacing:0.4px;}
.sc-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.sc-view-toggle{display:inline-flex;border-radius:8px;border:1px solid rgba(26,24,20,0.12);overflow:hidden;}
.sc-view-btn{padding:8px 14px;font-size:12px;font-weight:500;border:none;background:#fff;color:#7A7670;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:'DM Sans',sans-serif;}
.sc-view-btn.active{background:var(--gold,#B8922A);color:#fff;}
.sc-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid rgba(26,24,20,0.12);background:#fff;color:var(--ink,#1A1814);font-family:'DM Sans',sans-serif;transition:all 0.14s;}
.sc-btn:hover{background:var(--cream,#F7F4EF);}
.sc-btn.primary{background:var(--gold,#B8922A);color:#fff;border-color:var(--gold,#B8922A);}
.sc-btn.primary:hover{background:#a07e1f;}
.sc-btn:disabled{opacity:0.5;cursor:not-allowed;}
.sc-timeline{position:relative;padding-left:28px;}
.sc-timeline::before{content:'';position:absolute;left:11px;top:0;bottom:0;width:2px;background:rgba(26,24,20,0.08);border-radius:2px;}
.sc-stage{margin-bottom:26px;}
.sc-stage-label{font-size:10.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold,#B8922A);margin-bottom:10px;position:relative;}
.sc-stage-label::before{content:'';position:absolute;left:-21px;top:50%;transform:translateY(-50%);width:10px;height:10px;border-radius:50%;background:var(--gold,#B8922A);border:2px solid #fff;box-shadow:0 0 0 2px rgba(184,146,42,0.2);}
.sc-task{background:#fff;border-radius:10px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:16px 20px;margin-bottom:8px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 6px rgba(26,24,20,0.03);transition:all 0.18s;}
.sc-task:hover{box-shadow:0 4px 16px rgba(26,24,20,0.08);transform:translateX(2px);}
.sc-task-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sc-task-info{flex:1;min-width:0;}
.sc-task-name{font-size:13px;font-weight:500;color:var(--ink,#1A1814);}
.sc-task-dates{font-size:11.5px;color:var(--ink3,#7A7670);margin-top:2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.sc-task-responsible{font-size:11px;color:var(--ink3,#7A7670);}
.sc-task-deps-label{font-size:10.5px;color:#8E44AD;background:#F3E5F5;padding:1px 6px;border-radius:10px;}
.sc-task-right{display:flex;align-items:center;gap:12px;flex-shrink:0;}
.sc-task-progress{width:80px;}
.sc-task-progress-bar{height:5px;border-radius:10px;background:rgba(26,24,20,0.06);overflow:hidden;}
.sc-task-progress-fill{height:100%;border-radius:10px;transition:width 0.5s ease;}
.sc-task-pct{font-size:11.5px;font-weight:600;color:var(--ink2,#3D3A34);text-align:right;margin-top:2px;}
.sc-err{background:#FDEDEC;color:#C0392B;padding:10px 14px;border-radius:8px;font-size:12px;border:1px solid rgba(192,57,43,0.15);}
.sc-modal{position:fixed;inset:0;background:rgba(26,24,20,0.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;}
.sc-modal-card{background:#fff;border-radius:14px;max-width:560px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.25);max-height:90vh;overflow-y:auto;}
.sc-modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink,#1A1814);margin-bottom:16px;}
.sc-modal-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--ink3,#7A7670);margin-bottom:6px;display:block;}
.sc-modal-input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;margin-bottom:14px;box-sizing:border-box;}
.sc-modal-actions{display:flex;gap:10px;justify-content:flex-end;}
.sc-dep-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:14px;font-size:11px;background:var(--cream);border:1px solid rgba(26,24,20,0.1);cursor:pointer;margin:2px;}
.sc-dep-chip.active{background:rgba(184,146,42,0.12);border-color:var(--gold);color:var(--gold);}
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

interface FormState {
  name: string;
  stage: string;
  startDate: string;
  endDate: string;
  responsible: string;
  dependencies: string[];
}

const emptyForm: FormState = {
  name: '',
  stage: '',
  startDate: '',
  endDate: '',
  responsible: '',
  dependencies: [],
};

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = dateStr.substring(0, 10);
  const [year, month, day] = d.split('-');
  return `${day}/${month}/${year}`;
}

export default function SchedulePage() {
  const { id } = useParams();
  const workId = id ?? '1';
  const { permissions } = useAuth();
  const canCreate = permissions.includes('schedule.write');
  const canDelete = permissions.includes('schedule.delete');

  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [view, setView] = useState<'list' | 'gantt'>('list');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    ScheduleService.list(workId)
      .then((data) => active && setTasks(data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [workId]);

  const tasksByStage = useMemo(() => {
    const stages = Array.from(new Set(tasks.map((t) => t.stage)));
    return stages.map((stage) => ({ stage, tasks: tasks.filter((t) => t.stage === stage) }));
  }, [tasks]);

  const completed = tasks.filter((t) => t.status === 'concluida').length;
  const inProgress = tasks.filter((t) => t.status === 'em_andamento').length;
  const pending = tasks.filter((t) => t.status === 'pendente').length;
  const delayed = tasks.filter((t) => t.status === 'atrasada' || t.status === 'bloqueada').length;

  const summaryItems = [
    { label: 'Concluídas', value: completed, color: '#1E8449', bg: '#E8F5E9' },
    { label: 'Em Andamento', value: inProgress, color: '#1A5276', bg: '#EBF5FB' },
    { label: 'Pendentes', value: pending, color: '#7A7670', bg: '#F5F5F5' },
    { label: 'Em Risco', value: delayed, color: '#C0392B', bg: '#FDEDEC' },
  ];

  const submitForm = async () => {
    setFormError(null);
    if (!form.name.trim() || !form.stage.trim() || !form.startDate || !form.endDate) {
      setFormError('Preencha nome, etapa, data de início e fim.');
      return;
    }
    if (form.startDate >= form.endDate) {
      setFormError('A data de fim deve ser posterior ao início.');
      return;
    }
    try {
      const created = await ScheduleService.create(workId, {
        name: form.name.trim(),
        stage: form.stage.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        responsible: form.responsible.trim() || '—',
        dependencies: form.dependencies,
        progress: 0,
        status: 'pendente',
      });
      const fresh = await ScheduleService.list(workId);
      setTasks(fresh);
      setForm(emptyForm);
      setShowForm(false);
      void created;
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const toggleDep = (taskId: string) => {
    setForm((f) => ({
      ...f,
      dependencies: f.dependencies.includes(taskId)
        ? f.dependencies.filter((d) => d !== taskId)
        : [...f.dependencies, taskId],
    }));
  };

  const remove = async (task: ScheduleTask) => {
    if (!confirm(`Excluir tarefa "${task.name}"?`)) return;
    try {
      await ScheduleService.remove(workId, task.id);
      const fresh = await ScheduleService.list(workId);
      setTasks(fresh);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#7A7670', fontFamily: 'DM Sans' }}>
        Carregando cronograma…
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="sc">
        <div className="sc-summary">
          {summaryItems.map((s) => (
            <div key={s.label} className="sc-summary-card">
              <div style={{ width: 36, height: 36, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-numeric)', fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: s.color }}>{s.value}</span>
              </div>
              <div className="sc-summary-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="sc-toolbar">
          <div className="sc-view-toggle">
            <button className={`sc-view-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}>
              <List size={13} /> Lista
            </button>
            <button className={`sc-view-btn${view === 'gantt' ? ' active' : ''}`} onClick={() => setView('gantt')}>
              <BarChart3 size={13} /> Gantt
            </button>
          </div>
          <div style={{ flex: 1 }} />
          {canCreate && (
            <button className="sc-btn primary" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Nova tarefa
            </button>
          )}
        </div>

        {view === 'gantt' && <GanttView tasks={tasks} />}

        {view === 'list' && (
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
                {group.tasks.map((task) => {
                  const statusCfg = TASK_STATUS_CONFIG[task.status];
                  const StatusIcon = statusIcons[task.status];
                  return (
                    <div key={task.id} className="sc-task">
                      <div className="sc-task-icon" style={{ background: statusCfg.bg }}>
                        <StatusIcon size={15} color={statusCfg.color} />
                      </div>
                      <div className="sc-task-info">
                        <div className="sc-task-name">{task.name}</div>
                        <div className="sc-task-dates">
                          {formatDate(task.startDate)} → {formatDate(task.endDate)}
                          <span className="sc-task-responsible">• {task.responsible}</span>
                          {task.dependencies.length > 0 && (
                            <span className="sc-task-deps-label">{task.dependencies.length} dep.</span>
                          )}
                        </div>
                      </div>
                      <div className="sc-task-right">
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: statusCfg.bg, color: statusCfg.color, whiteSpace: 'nowrap' }}>
                          {statusCfg.label}
                        </span>
                        <div className="sc-task-progress">
                          <div className="sc-task-progress-bar">
                            <div className="sc-task-progress-fill" style={{ width: `${task.progress}%`, background: getProgressColor(task.progress, task.status) }} />
                          </div>
                          <div className="sc-task-pct">{task.progress}%</div>
                        </div>
                        {canDelete && (
                          <button className="sc-btn" style={{ padding: '4px 8px' }} onClick={() => remove(task)} aria-label="Excluir">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="sc-modal" onClick={() => setShowForm(false)}>
          <div className="sc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sc-modal-title">Nova tarefa</div>
            {formError && <div className="sc-err" style={{ marginBottom: 12 }}>{formError}</div>}
            <label className="sc-modal-label">Nome</label>
            <input className="sc-modal-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label className="sc-modal-label">Etapa</label>
            <input className="sc-modal-input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} placeholder="Ex.: Estrutura" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="sc-modal-label">Início</label>
                <LdDateInput value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} clearable={false} />
              </div>
              <div>
                <label className="sc-modal-label">Fim</label>
                <LdDateInput value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} clearable={false} />
              </div>
            </div>
            <label className="sc-modal-label">Responsável</label>
            <input className="sc-modal-input" value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} />
            <label className="sc-modal-label">Dependências (clique para marcar)</label>
            <div style={{ maxHeight: 140, overflowY: 'auto', padding: 6, border: '1px solid rgba(26,24,20,0.08)', borderRadius: 8, marginBottom: 14 }}>
              {tasks.length === 0 && <div style={{ color: '#7A7670', fontSize: 12, padding: 6 }}>Sem tarefas prévias.</div>}
              {tasks.map((t) => {
                const active = form.dependencies.includes(t.id);
                return (
                  <span key={t.id} className={`sc-dep-chip${active ? ' active' : ''}`} onClick={() => toggleDep(t.id)}>
                    {t.name}
                  </span>
                );
              })}
            </div>
            <div className="sc-modal-actions">
              <button className="sc-btn" onClick={() => setShowForm(false)}>
                <X size={14} /> Cancelar
              </button>
              <button className="sc-btn primary" onClick={submitForm}>Criar tarefa</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
