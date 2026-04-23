import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Lock, CheckCircle2, Clock, Minus, Calendar, User } from 'lucide-react';
import type { ScheduleTask, TaskStatus } from '@/modules/shared/types';
import { TASK_STATUS_CONFIG } from '@/modules/shared/types';
import { ScheduleService } from '@/services/works';

const CSS = `
.gantt-wrap{background:#fff;border-radius:14px;border:1px solid rgba(26,24,20,0.10);overflow:hidden;box-shadow:0 2px 12px rgba(26,24,20,0.06);font-family:'DM Sans',sans-serif;user-select:none;}
.gantt-layout{display:grid;grid-template-columns:220px 1fr;}
.gantt-names-col{border-right:2px solid rgba(26,24,20,0.08);overflow:hidden;}
.gantt-header-left{height:52px;display:flex;align-items:center;padding:0 16px;border-bottom:1px solid rgba(26,24,20,0.08);background:#fafaf7;}
.gantt-header-label{font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#7A7670;}
.gantt-name-row{display:flex;align-items:center;padding:0 16px;height:52px;border-bottom:1px solid rgba(26,24,20,0.05);cursor:pointer;transition:background 0.12s;}
.gantt-name-row:hover{background:#fafaf7;}
.gantt-name-row.selected{background:rgba(184,146,42,0.06);}
.gantt-task-name{font-size:12.5px;font-weight:500;color:#1A1814;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.gantt-task-meta{font-size:10.5px;color:#7A7670;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.gantt-timeline-col{overflow-x:auto;position:relative;}
.gantt-timeline-scroll{min-width:100%;position:relative;}
.gantt-months-header{display:flex;height:52px;align-items:center;border-bottom:1px solid rgba(26,24,20,0.08);background:#fafaf7;position:sticky;top:0;z-index:4;}
.gantt-month-cell{display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(26,24,20,0.06);height:100%;}
.gantt-month-label{font-size:11px;font-weight:600;color:#7A7670;letter-spacing:0.3px;}
.gantt-rows-area{position:relative;}
.gantt-track-row{position:relative;height:52px;border-bottom:1px solid rgba(26,24,20,0.05);}
.gantt-track-row:hover{background:rgba(26,24,20,0.015);}
.gantt-grid-line{position:absolute;top:0;bottom:0;width:1px;background:rgba(26,24,20,0.05);pointer-events:none;}
.gantt-today-line{position:absolute;top:0;bottom:0;width:2px;background:#B8922A;opacity:0.7;z-index:3;pointer-events:none;}
.gantt-today-label{position:absolute;top:-20px;transform:translateX(-50%);background:#B8922A;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px;white-space:nowrap;}
.gantt-bar{position:absolute;top:10px;height:32px;border-radius:8px;cursor:grab;transition:box-shadow 0.15s,opacity 0.15s;display:flex;align-items:center;overflow:hidden;border:1.5px solid transparent;}
.gantt-bar:hover{box-shadow:0 4px 16px rgba(0,0,0,0.18);z-index:2;}
.gantt-bar.dragging{cursor:grabbing;opacity:0.85;box-shadow:0 8px 24px rgba(0,0,0,0.22);z-index:10;}
.gantt-bar.selected{outline:2px solid #B8922A;outline-offset:1px;z-index:2;}
.gantt-bar-fill{height:100%;border-radius:6px 0 0 6px;transition:width 0.4s ease;}
.gantt-bar-label{position:absolute;left:8px;right:8px;font-size:10.5px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px rgba(0,0,0,0.35);pointer-events:none;}
.gantt-dep-svg{position:absolute;top:0;left:0;width:100%;pointer-events:none;overflow:visible;}
.gantt-detail-panel{position:fixed;right:0;top:0;bottom:0;width:340px;background:#fff;box-shadow:-8px 0 40px rgba(26,24,20,0.15);z-index:100;display:flex;flex-direction:column;border-left:1px solid rgba(26,24,20,0.10);}
.gantt-detail-header{padding:20px 20px 16px;border-bottom:1px solid rgba(26,24,20,0.08);display:flex;align-items:flex-start;gap:12px;}
.gantt-detail-body{flex:1;overflow-y:auto;padding:20px;}
.gantt-detail-section{margin-bottom:18px;}
.gantt-detail-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#7A7670;margin-bottom:6px;}
.gantt-detail-value{font-size:13px;color:#1A1814;line-height:1.5;}
.gantt-detail-row{display:flex;align-items:center;gap:8px;font-size:12.5px;color:#3D3A34;margin-bottom:6px;}
.gantt-status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;}
.gantt-risk-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:12px;font-size:10.5px;font-weight:600;background:#FFF3CD;color:#856404;border:1px solid #FFEAA7;}
.gantt-progress-row{display:flex;align-items:center;gap:10px;margin-top:10px;}
.gantt-progress-track{flex:1;height:8px;background:rgba(26,24,20,0.08);border-radius:10px;overflow:hidden;}
.gantt-progress-fill{height:100%;border-radius:10px;transition:width 0.4s ease;}
.gantt-dep-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:11px;background:#F3E5F5;color:#6B21A8;border:1px solid rgba(107,33,168,0.15);margin:2px;}
.gantt-dep-type{font-size:9px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;opacity:0.7;}
.gantt-empty{padding:48px;text-align:center;color:#7A7670;}
`;

const STATUS_ICONS: Record<TaskStatus, typeof CheckCircle2> = {
  concluida: CheckCircle2,
  em_andamento: Clock,
  pendente: Minus,
  bloqueada: Lock,
  atrasada: AlertTriangle,
};

function parseDate(s: string) {
  return new Date(s.substring(0, 10) + 'T00:00:00');
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function toYMD(d: Date): string {
  return d.toISOString().substring(0, 10);
}

function formatDate(s?: string): string {
  if (!s) return '—';
  const [y, m, day] = s.substring(0, 10).split('-');
  return `${day}/${m}/${y}`;
}

interface DragState {
  taskId: string;
  startMouseX: number;
  originalStartDate: string;
  originalEndDate: string;
  durationDays: number;
}

interface Props {
  workId: string;
  tasks: ScheduleTask[];
  onTaskUpdate: (taskId: string, patch: Partial<ScheduleTask>) => void;
  canWrite: boolean;
}

export default function GanttView({ workId, tasks, onTaskUpdate, canWrite }: Props) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragPreview, setDragPreview] = useState<{ taskId: string; startDate: string; endDate: string } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const computed = useMemo(() => {
    if (tasks.length === 0) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = tasks.flatMap((t) => [parseDate(t.startDate), parseDate(t.endDate)]);
    const rawMin = new Date(Math.min(...dates.map((d) => d.getTime())));
    const rawMax = new Date(Math.max(...dates.map((d) => d.getTime())));

    const minDate = new Date(rawMin.getFullYear(), rawMin.getMonth(), 1);
    const maxDate = new Date(rawMax.getFullYear(), rawMax.getMonth() + 2, 0);

    const totalDays = Math.max(1, daysBetween(minDate, maxDate));

    const months: Array<{ label: string; startDay: number; days: number }> = [];
    const cursor = new Date(minDate);
    while (cursor <= maxDate) {
      const start = daysBetween(minDate, cursor);
      const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const daysInMonth = Math.min(daysBetween(cursor, end) + 1, totalDays - start);
      months.push({
        label: cursor.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        startDay: start,
        days: Math.max(0, daysInMonth),
      });
      cursor.setMonth(cursor.getMonth() + 1);
      cursor.setDate(1);
    }

    const todayOffset = Math.max(0, Math.min(1, daysBetween(minDate, today) / totalDays));

    const DAY_PX = 28;
    const totalWidth = totalDays * DAY_PX;

    return { minDate, totalDays, months, todayOffset, today, DAY_PX, totalWidth };
  }, [tasks]);

  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  const barPositions = useMemo(() => {
    if (!computed) return new Map<string, { left: number; right: number; top: number }>();
    const { minDate, DAY_PX } = computed;
    const positions = new Map<string, { left: number; right: number; top: number }>();
    tasks.forEach((task, i) => {
      const display = dragPreview?.taskId === task.id ? dragPreview : task;
      const start = parseDate(display.startDate);
      const end = parseDate(display.endDate);
      const left = daysBetween(minDate, start) * DAY_PX;
      const right = daysBetween(minDate, end) * DAY_PX;
      const top = i * 52 + 26;
      positions.set(task.id, { left, right, top });
    });
    return positions;
  }, [tasks, computed, dragPreview]);

  const handleBarMouseDown = useCallback(
    (e: React.MouseEvent, task: ScheduleTask) => {
      if (!canWrite) return;
      e.preventDefault();
      e.stopPropagation();
      setSelectedId(task.id);
      setDragState({
        taskId: task.id,
        startMouseX: e.clientX,
        originalStartDate: task.startDate,
        originalEndDate: task.endDate,
        durationDays: daysBetween(parseDate(task.startDate), parseDate(task.endDate)),
      });
    },
    [canWrite],
  );

  useEffect(() => {
    if (!dragState || !computed) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      const deltaX = e.clientX - dragState.startMouseX;
      const daysDelta = Math.round(deltaX / computed.DAY_PX);
      if (daysDelta === 0) return;

      const newStart = addDays(parseDate(dragState.originalStartDate), daysDelta);
      const newEnd = addDays(newStart, dragState.durationDays);
      setDragPreview({
        taskId: dragState.taskId,
        startDate: toYMD(newStart),
        endDate: toYMD(newEnd),
      });
    };

    const handleMouseUp = async () => {
      if (dragPreview && dragPreview.taskId === dragState.taskId) {
        const changed =
          dragPreview.startDate !== dragState.originalStartDate ||
          dragPreview.endDate !== dragState.originalEndDate;
        if (changed) {
          setSaving(dragState.taskId);
          try {
            await ScheduleService.update(workId, dragState.taskId, {
              startDate: dragPreview.startDate,
              endDate: dragPreview.endDate,
            });
            onTaskUpdate(dragState.taskId, {
              startDate: dragPreview.startDate,
              endDate: dragPreview.endDate,
            });
          } catch {
            // silently revert on error
          } finally {
            setSaving(null);
          }
        }
      }
      setDragState(null);
      setDragPreview(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, dragPreview, computed, workId, onTaskUpdate]);

  const selectedTask = selectedId ? taskById.get(selectedId) : null;

  if (!computed) {
    return <div className="gantt-empty">Sem tarefas para exibir no Gantt.</div>;
  }

  const { months, todayOffset, DAY_PX, totalWidth, totalDays } = computed;

  return (
    <>
      <style>{CSS}</style>
      <div className="gantt-wrap">
        <div className="gantt-layout">
          {/* Left names column */}
          <div className="gantt-names-col">
            <div className="gantt-header-left">
              <span className="gantt-header-label">Tarefa</span>
            </div>
            {tasks.map((task) => {
              const cfg = TASK_STATUS_CONFIG[task.status];
              const Icon = STATUS_ICONS[task.status];
              return (
                <div
                  key={task.id}
                  className={`gantt-name-row${selectedId === task.id ? ' selected' : ''}`}
                  onClick={() => setSelectedId(selectedId === task.id ? null : task.id)}
                >
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 8 }}>
                    <Icon size={12} color={cfg.color} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="gantt-task-name">{task.name}</div>
                    <div className="gantt-task-meta">
                      {formatDate(task.startDate)} → {formatDate(task.endDate)}
                    </div>
                  </div>
                  {task.isAtRisk && (
                    <AlertTriangle size={11} color="#856404" style={{ marginLeft: 4, flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right timeline column */}
          <div className="gantt-timeline-col" ref={timelineRef}>
            <div className="gantt-timeline-scroll" style={{ width: Math.max(totalWidth + 40, 600) }}>
              {/* Month headers */}
              <div className="gantt-months-header">
                {months.map((m) => (
                  <div
                    key={m.label + m.startDay}
                    className="gantt-month-cell"
                    style={{ width: m.days * DAY_PX, minWidth: m.days * DAY_PX, flexShrink: 0 }}
                  >
                    <span className="gantt-month-label">{m.label}</span>
                  </div>
                ))}
              </div>

              {/* Rows + bars */}
              <div className="gantt-rows-area">
                {/* Grid lines */}
                {months.map((m) => (
                  <div
                    key={`grid-${m.startDay}`}
                    className="gantt-grid-line"
                    style={{ left: m.startDay * DAY_PX }}
                  />
                ))}

                {/* Today line */}
                <div
                  className="gantt-today-line"
                  style={{ left: todayOffset * totalWidth + (todayOffset === 0 ? 0 : 0) }}
                >
                  <div className="gantt-today-label">Hoje</div>
                </div>

                {/* Track rows */}
                {tasks.map((task) => (
                  <div key={task.id} className="gantt-track-row" />
                ))}

                {/* SVG dependency arrows */}
                <svg
                  className="gantt-dep-svg"
                  style={{ height: tasks.length * 52 }}
                  width={totalWidth + 40}
                >
                  {tasks.flatMap((task) =>
                    task.dependencies.map((dep) => {
                      const fromPos = barPositions.get(dep.dependsOnTaskId);
                      const toPos = barPositions.get(task.id);
                      if (!fromPos || !toPos) return null;
                      const x1 = fromPos.right;
                      const y1 = fromPos.top;
                      const x2 = toPos.left;
                      const y2 = toPos.top;
                      const mx = (x1 + x2) / 2;
                      const color = dep.type === 'StartToStart' ? '#8E44AD' : 'rgba(26,24,20,0.3)';
                      return (
                        <g key={`${dep.dependsOnTaskId}->${task.id}`}>
                          <path
                            d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                            fill="none"
                            stroke={color}
                            strokeWidth="1.5"
                            strokeDasharray={dep.type === 'StartToStart' ? '5,3' : 'none'}
                            markerEnd="url(#arrow)"
                          />
                        </g>
                      );
                    }),
                  )}
                  <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 z" fill="rgba(26,24,20,0.3)" />
                    </marker>
                  </defs>
                </svg>

                {/* Bars */}
                {tasks.map((task) => {
                  const display =
                    dragPreview?.taskId === task.id ? { ...task, ...dragPreview } : task;
                  const start = parseDate(display.startDate);
                  const end = parseDate(display.endDate);
                  const left = daysBetween(computed.minDate, start) * DAY_PX;
                  const width = Math.max(DAY_PX, daysBetween(start, end) * DAY_PX);
                  const cfg = TASK_STATUS_CONFIG[task.status];
                  const isDragging = dragState?.taskId === task.id;
                  const isSaving = saving === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`gantt-bar${isDragging ? ' dragging' : ''}${selectedId === task.id ? ' selected' : ''}`}
                      style={{
                        left,
                        width,
                        top: tasks.indexOf(task) * 52 + 10,
                        background: cfg.bg,
                        borderColor: cfg.color,
                        opacity: isSaving ? 0.6 : 1,
                        cursor: canWrite ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                      }}
                      onMouseDown={(e) => handleBarMouseDown(e, task)}
                      onClick={() => setSelectedId(selectedId === task.id ? null : task.id)}
                      title={`${task.name}\n${formatDate(display.startDate)} → ${formatDate(display.endDate)}\n${task.progress}% · ${TASK_STATUS_CONFIG[task.status].label}`}
                    >
                      <div
                        className="gantt-bar-fill"
                        style={{ width: `${task.progress}%`, background: cfg.color }}
                      />
                      <span className="gantt-bar-label">
                        {task.name} · {task.progress}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 99 }}
              onClick={() => setSelectedId(null)}
            />
            <motion.div
              className="gantt-detail-panel"
              initial={{ x: 340 }}
              animate={{ x: 0 }}
              exit={{ x: 340 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <div className="gantt-detail-header">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700, color: '#1A1814', marginBottom: 6, lineHeight: 1.2 }}>
                    {selectedTask.name}
                  </div>
                  {(() => {
                    const cfg = TASK_STATUS_CONFIG[selectedTask.status];
                    const Icon = STATUS_ICONS[selectedTask.status];
                    return (
                      <span className="gantt-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                        <Icon size={12} />
                        {cfg.label}
                      </span>
                    );
                  })()}
                  {selectedTask.isAtRisk && (
                    <span className="gantt-risk-badge" style={{ marginLeft: 6 }}>
                      <AlertTriangle size={11} /> Em risco
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#7A7670', borderRadius: 6 }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="gantt-detail-body">
                {selectedTask.description && (
                  <div className="gantt-detail-section">
                    <div className="gantt-detail-label">Descrição</div>
                    <div className="gantt-detail-value">{selectedTask.description}</div>
                  </div>
                )}

                <div className="gantt-detail-section">
                  <div className="gantt-detail-label">Progresso</div>
                  <div className="gantt-progress-row">
                    <div className="gantt-progress-track">
                      <div
                        className="gantt-progress-fill"
                        style={{
                          width: `${selectedTask.progress}%`,
                          background: TASK_STATUS_CONFIG[selectedTask.status].color,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1814', minWidth: 32, textAlign: 'right' }}>
                      {selectedTask.progress}%
                    </span>
                  </div>
                </div>

                <div className="gantt-detail-section">
                  <div className="gantt-detail-label">Datas Planejadas</div>
                  <div className="gantt-detail-row">
                    <Calendar size={13} color="#7A7670" />
                    <span>{formatDate(selectedTask.startDate)} → {formatDate(selectedTask.endDate)}</span>
                  </div>
                  {(selectedTask.actualStartDate || selectedTask.actualEndDate) && (
                    <>
                      <div className="gantt-detail-label" style={{ marginTop: 8 }}>Datas Realizadas</div>
                      <div className="gantt-detail-row">
                        <Calendar size={13} color="#1E8449" />
                        <span style={{ color: '#1E8449' }}>
                          {formatDate(selectedTask.actualStartDate)} → {formatDate(selectedTask.actualEndDate)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {selectedTask.responsibleUserId && (
                  <div className="gantt-detail-section">
                    <div className="gantt-detail-label">Responsável</div>
                    <div className="gantt-detail-row">
                      <User size={13} color="#7A7670" />
                      <span>{selectedTask.responsibleUserId}</span>
                    </div>
                  </div>
                )}

                {selectedTask.daysUntilDeadline != null && (
                  <div className="gantt-detail-section">
                    <div className="gantt-detail-label">Prazo</div>
                    <div className="gantt-detail-value" style={{ color: selectedTask.daysUntilDeadline < 0 ? '#C0392B' : selectedTask.daysUntilDeadline < 7 ? '#856404' : '#1E8449' }}>
                      {selectedTask.daysUntilDeadline < 0
                        ? `${Math.abs(selectedTask.daysUntilDeadline)} dias em atraso`
                        : selectedTask.daysUntilDeadline === 0
                        ? 'Vence hoje'
                        : `${selectedTask.daysUntilDeadline} dias restantes`}
                    </div>
                  </div>
                )}

                {selectedTask.dependencies.length > 0 && (
                  <div className="gantt-detail-section">
                    <div className="gantt-detail-label">Dependências</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {selectedTask.dependencies.map((dep) => {
                        const depTask = taskById.get(dep.dependsOnTaskId);
                        return (
                          <span key={dep.dependsOnTaskId} className="gantt-dep-chip">
                            {depTask?.name ?? dep.dependsOnTaskId}
                            <span className="gantt-dep-type">
                              {dep.type === 'FinishToStart' ? 'FTS' : 'IaI'}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {canWrite && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#7A7670', textAlign: 'center', padding: '8px', background: '#fafaf7', borderRadius: 8, border: '1px solid rgba(26,24,20,0.06)' }}>
                    Arraste a barra no Gantt para reposicionar
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
