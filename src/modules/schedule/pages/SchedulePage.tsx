import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, Lock, Minus, Plus, X, List, BarChart3,
  Trash2, GripVertical, ChevronDown, ChevronUp, Edit2, Calendar, User, Link2,
  Filter,
} from 'lucide-react';
import { ScheduleService } from '@/services/works';
import type { CreateTaskDto } from '@/services/works/scheduleService';
import { useAuth } from '@/contexts/AuthContext';
import { TASK_STATUS_CONFIG } from '@/modules/shared/types';
import type { ScheduleTask, TaskStatus, TaskDependency, DependencyType } from '@/modules/shared/types';
import GanttView from '../components/GanttView';

const CSS = `
.sc{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:16px;}
.sc-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;}
.sc-card{background:#fff;border-radius:12px;border:1px solid rgba(26,24,20,0.09);padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 6px rgba(26,24,20,0.04);transition:box-shadow 0.15s;}
.sc-card:hover{box-shadow:0 4px 16px rgba(26,24,20,0.09);}
.sc-card-icon{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sc-card-val{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums lining-nums;line-height:1;}
.sc-card-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:#7A7670;margin-top:2px;}
.sc-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.sc-search{flex:1;min-width:160px;max-width:300px;position:relative;}
.sc-search input{width:100%;padding:8px 12px 8px 34px;border-radius:8px;border:1px solid rgba(26,24,20,0.12);font-family:'DM Sans',sans-serif;font-size:12.5px;color:#1A1814;background:#fff;box-sizing:border-box;outline:none;transition:border-color 0.12s;}
.sc-search input:focus{border-color:#B8922A;}
.sc-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#7A7670;pointer-events:none;}
.sc-view-toggle{display:inline-flex;border-radius:8px;border:1px solid rgba(26,24,20,0.12);overflow:hidden;}
.sc-view-btn{padding:8px 14px;font-size:12px;font-weight:500;border:none;background:#fff;color:#7A7670;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:'DM Sans',sans-serif;transition:background 0.12s;}
.sc-view-btn.active{background:#B8922A;color:#fff;}
.sc-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid rgba(26,24,20,0.12);background:#fff;color:#1A1814;font-family:'DM Sans',sans-serif;transition:all 0.14s;}
.sc-btn:hover{background:#F7F4EF;}
.sc-btn.primary{background:#B8922A;color:#fff;border-color:#B8922A;}
.sc-btn.primary:hover{background:#a07e1f;}
.sc-btn:disabled{opacity:0.45;cursor:not-allowed;}
.sc-filter-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid rgba(26,24,20,0.12);background:#fff;color:#7A7670;font-family:'DM Sans',sans-serif;transition:all 0.14s;position:relative;}
.sc-filter-btn:hover{background:#F7F4EF;}
.sc-filter-btn.active{border-color:#B8922A;color:#B8922A;background:rgba(184,146,42,0.06);}
.sc-dropdown{position:absolute;top:calc(100% + 6px);right:0;background:#fff;border-radius:10px;border:1px solid rgba(26,24,20,0.12);box-shadow:0 8px 28px rgba(26,24,20,0.14);z-index:50;min-width:160px;overflow:hidden;}
.sc-dropdown-item{padding:9px 14px;font-size:12.5px;cursor:pointer;color:#1A1814;display:flex;align-items:center;gap:8px;transition:background 0.1s;}
.sc-dropdown-item:hover{background:#F7F4EF;}
.sc-dropdown-item.selected{background:rgba(184,146,42,0.08);color:#B8922A;font-weight:500;}
.sc-list{display:flex;flex-direction:column;gap:6px;}
.sc-task-row{background:#fff;border-radius:12px;border:1px solid rgba(26,24,20,0.09);box-shadow:0 1px 6px rgba(26,24,20,0.04);transition:all 0.18s;overflow:hidden;}
.sc-task-row.drag-over{border-color:#B8922A;box-shadow:0 0 0 2px rgba(184,146,42,0.2);}
.sc-task-row.dragging{opacity:0.45;transform:scale(0.99);}
.sc-task-main{display:flex;align-items:center;gap:10px;padding:13px 16px;cursor:pointer;}
.sc-task-main:hover{background:#fafaf7;}
.sc-drag-handle{cursor:grab;color:#C4BFB5;flex-shrink:0;padding:2px;border-radius:4px;display:flex;align-items:center;transition:color 0.1s;}
.sc-drag-handle:hover{color:#7A7670;}
.sc-drag-handle:active{cursor:grabbing;}
.sc-status-icon{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sc-task-info{flex:1;min-width:0;}
.sc-task-name{font-size:13px;font-weight:500;color:#1A1814;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.sc-task-meta{font-size:11px;color:#7A7670;margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.sc-risk-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700;background:#FFF3CD;color:#856404;border:1px solid #FFEAA7;}
.sc-blocked-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700;background:#FDEDEC;color:#C0392B;border:1px solid rgba(192,57,43,0.2);}
.sc-dep-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:10px;font-size:10px;background:#F3E5F5;color:#6B21A8;border:1px solid rgba(107,33,168,0.12);}
.sc-task-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.sc-status-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:14px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid transparent;transition:all 0.12s;position:relative;}
.sc-status-pill:hover{filter:brightness(0.93);}
.sc-progress-compact{display:flex;align-items:center;gap:6px;min-width:80px;}
.sc-progress-bar{height:5px;border-radius:10px;background:rgba(26,24,20,0.08);overflow:hidden;flex:1;}
.sc-progress-fill{height:100%;border-radius:10px;transition:width 0.4s ease;}
.sc-progress-pct{font-size:11.5px;font-weight:700;color:#1A1814;min-width:28px;text-align:right;}
.sc-expand-btn{padding:4px;background:none;border:none;cursor:pointer;color:#7A7670;border-radius:5px;display:flex;transition:background 0.1s;}
.sc-expand-btn:hover{background:#F0EDE8;}
.sc-task-expanded{padding:0 16px 14px;border-top:1px solid rgba(26,24,20,0.06);background:#fafaf7;}
.sc-expanded-section{padding-top:12px;}
.sc-expanded-label{font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:#7A7670;margin-bottom:6px;}
.sc-progress-slider-wrap{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.sc-progress-slider{flex:1;height:6px;accent-color:#B8922A;cursor:pointer;}
.sc-expanded-dates{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;}
.sc-date-block{background:#fff;border-radius:8px;border:1px solid rgba(26,24,20,0.08);padding:8px 12px;}
.sc-date-block-label{font-size:10px;color:#7A7670;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;}
.sc-date-block-val{font-size:12.5px;font-weight:500;color:#1A1814;}
.sc-expanded-actions{display:flex;gap:6px;flex-wrap:wrap;}
.sc-dep-list{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}
.sc-dep-item{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:14px;font-size:11px;background:#EDE7F6;color:#5E35B1;border:1px solid rgba(94,53,177,0.12);}
.sc-dep-type-tag{font-size:9px;font-weight:700;opacity:0.65;letter-spacing:0.5px;}
.sc-empty{padding:40px;text-align:center;color:#7A7670;background:#fff;border-radius:12px;border:1px solid rgba(26,24,20,0.08);}
.sc-modal-bg{position:fixed;inset:0;background:rgba(26,24,20,0.45);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;}
.sc-modal{background:#fff;border-radius:16px;max-width:580px;width:100%;padding:28px;box-shadow:0 24px 72px rgba(0,0,0,0.28);max-height:92vh;overflow-y:auto;}
.sc-modal-title{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;color:#1A1814;margin-bottom:20px;}
.sc-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.sc-field{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
.sc-field.full{grid-column:1/-1;}
.sc-label{font-size:10.5px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:#7A7670;}
.sc-input{padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.14);font-family:'DM Sans',sans-serif;font-size:13px;color:#1A1814;background:#fff;outline:none;transition:border-color 0.12s;box-sizing:border-box;width:100%;}
.sc-input:focus{border-color:#B8922A;box-shadow:0 0 0 3px rgba(184,146,42,0.1);}
.sc-select{padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.14);font-family:'DM Sans',sans-serif;font-size:13px;color:#1A1814;background:#fff;outline:none;appearance:none;cursor:pointer;box-sizing:border-box;width:100%;}
.sc-textarea{padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.14);font-family:'DM Sans',sans-serif;font-size:13px;color:#1A1814;background:#fff;outline:none;resize:vertical;min-height:72px;box-sizing:border-box;width:100%;}
.sc-textarea:focus,.sc-select:focus{border-color:#B8922A;box-shadow:0 0 0 3px rgba(184,146,42,0.1);}
.sc-deps-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:140px;overflow-y:auto;padding:8px;border:1px solid rgba(26,24,20,0.10);border-radius:8px;background:#fafaf7;}
.sc-dep-chip{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;font-size:11.5px;border:1.5px solid transparent;cursor:pointer;transition:all 0.12s;background:#fff;}
.sc-dep-chip:hover{background:#F0EDE8;}
.sc-dep-chip.selected{background:rgba(184,146,42,0.08);border-color:#B8922A;color:#B8922A;}
.sc-dep-type-select{font-size:10px;padding:2px 4px;border:1px solid rgba(26,24,20,0.12);border-radius:4px;cursor:pointer;background:#fff;font-family:'DM Sans',sans-serif;}
.sc-err{background:#FDEDEC;color:#C0392B;padding:10px 14px;border-radius:8px;font-size:12.5px;border:1px solid rgba(192,57,43,0.15);margin-bottom:14px;}
.sc-modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:4px;}
.sc-status-dropdown{position:absolute;top:calc(100% + 6px);right:0;background:#fff;border-radius:10px;border:1px solid rgba(26,24,20,0.12);box-shadow:0 8px 28px rgba(26,24,20,0.14);z-index:60;min-width:150px;overflow:hidden;}
.sc-status-option{padding:8px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:7px;transition:background 0.1s;}
.sc-status-option:hover{background:#F7F4EF;}
`;

const STATUS_ICONS: Record<TaskStatus, typeof CheckCircle2> = {
  concluida: CheckCircle2,
  em_andamento: Clock,
  pendente: Minus,
  bloqueada: Lock,
  atrasada: AlertTriangle,
};

const STATUS_ORDER: TaskStatus[] = ['pendente', 'em_andamento', 'concluida', 'atrasada', 'bloqueada'];

function formatDate(s?: string): string {
  if (!s) return '—';
  const [y, m, d] = s.substring(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

function getProgressColor(pct: number, status: TaskStatus): string {
  if (status === 'concluida') return '#1E8449';
  if (status === 'atrasada') return '#E67E22';
  if (status === 'bloqueada') return '#C0392B';
  if (pct >= 70) return '#1E8449';
  if (pct >= 30) return '#B8922A';
  return '#1A5276';
}

interface FormState {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  responsibleUserId: string;
  parentTaskId: string;
  dependencies: Array<{ dependsOnTaskId: string; type: DependencyType }>;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  responsibleUserId: '',
  parentTaskId: '',
  dependencies: [],
};

export default function SchedulePage() {
  const { id } = useParams();
  const workId = id ?? '1';
  const { permissions } = useAuth();
  const canCreate = permissions.includes('schedule.write') || permissions.includes('schedule.create');
  const canWrite = permissions.includes('schedule.write') || permissions.includes('schedule.create');
  const canDelete = permissions.includes('schedule.delete');

  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [view, setView] = useState<'list' | 'gantt'>('list');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);
  const [progressEditing, setProgressEditing] = useState<Record<string, number>>({});
  const [savingProgress, setSavingProgress] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragCounterRef = useRef<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ScheduleService.list(workId);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [workId]);

  useEffect(() => { load(); }, [load]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => {
      setShowFilterDropdown(false);
      setStatusDropdownId(null);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filterStatus !== 'all') list = list.filter((t) => t.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.responsibleUserId ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [tasks, filterStatus, search]);

  const counts = useMemo(() => ({
    concluida: tasks.filter((t) => t.status === 'concluida').length,
    em_andamento: tasks.filter((t) => t.status === 'em_andamento').length,
    pendente: tasks.filter((t) => t.status === 'pendente').length,
    atRisk: tasks.filter((t) => t.isAtRisk).length,
    bloqueada: tasks.filter((t) => t.status === 'bloqueada').length,
  }), [tasks]);

  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  // ── Drag and drop ─────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragEnter = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    dragCounterRef.current[taskId] = (dragCounterRef.current[taskId] ?? 0) + 1;
    setDragOverId(taskId);
  };

  const handleDragLeave = (_e: React.DragEvent, taskId: string) => {
    dragCounterRef.current[taskId] = (dragCounterRef.current[taskId] ?? 1) - 1;
    if (dragCounterRef.current[taskId] <= 0) {
      dragCounterRef.current[taskId] = 0;
      setDragOverId((prev) => (prev === taskId ? null : prev));
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const currentOrder = [...tasks].sort((a, b) => a.order - b.order);
    const srcIdx = currentOrder.findIndex((t) => t.id === sourceId);
    const tgtIdx = currentOrder.findIndex((t) => t.id === targetId);
    if (srcIdx < 0 || tgtIdx < 0) return;

    const next = [...currentOrder];
    const [moved] = next.splice(srcIdx, 1);
    next.splice(tgtIdx, 0, moved);
    const reordered = next.map((t, i) => ({ ...t, order: i }));
    setTasks(reordered);
    setDraggedId(null);
    setDragOverId(null);
    dragCounterRef.current = {};

    try {
      await ScheduleService.reorder(workId, reordered.map((t) => ({ id: t.id, order: t.order })));
    } catch {
      load();
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    dragCounterRef.current = {};
  };

  // ── Status change ──────────────────────────────────────────────
  const handleStatusChange = async (task: ScheduleTask, newStatus: TaskStatus) => {
    setStatusDropdownId(null);
    if (task.status === newStatus) return;
    const prev = tasks;
    setTasks((ts) => ts.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
    try {
      await ScheduleService.updateStatus(workId, task.id, newStatus);
      load();
    } catch (err) {
      setTasks(prev);
      alert((err as Error).message);
    }
  };

  // ── Progress change ────────────────────────────────────────────
  const progressTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleProgressChange = (taskId: string, value: number) => {
    setProgressEditing((p) => ({ ...p, [taskId]: value }));
    if (progressTimers.current[taskId]) clearTimeout(progressTimers.current[taskId]);
    progressTimers.current[taskId] = setTimeout(async () => {
      setSavingProgress(taskId);
      try {
        await ScheduleService.updateProgress(workId, taskId, value);
        load();
      } finally {
        setSavingProgress(null);
        setProgressEditing((p) => { const n = { ...p }; delete n[taskId]; return n; });
      }
    }, 600);
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (task: ScheduleTask) => {
    if (!confirm(`Excluir a tarefa "${task.name}"?\n\nEsta ação não pode ser desfeita.`)) return;
    setDeletingId(task.id);
    try {
      await ScheduleService.remove(workId, task.id);
      setTasks((ts) => ts.filter((t) => t.id !== task.id));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Form (create / edit) ───────────────────────────────────────
  const openCreate = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (task: ScheduleTask) => {
    setEditingTask(task);
    setForm({
      name: task.name,
      description: task.description,
      startDate: task.startDate,
      endDate: task.endDate,
      responsibleUserId: task.responsibleUserId ?? '',
      parentTaskId: task.parentTaskId ?? '',
      dependencies: task.dependencies.map((d) => ({ ...d })),
    });
    setFormError(null);
    setShowForm(true);
  };

  const toggleDep = (depId: string) => {
    setForm((f) => {
      const existing = f.dependencies.find((d) => d.dependsOnTaskId === depId);
      if (existing) {
        return { ...f, dependencies: f.dependencies.filter((d) => d.dependsOnTaskId !== depId) };
      }
      return { ...f, dependencies: [...f.dependencies, { dependsOnTaskId: depId, type: 'FinishToStart' as DependencyType }] };
    });
  };

  const setDepType = (depId: string, type: DependencyType) => {
    setForm((f) => ({
      ...f,
      dependencies: f.dependencies.map((d) => d.dependsOnTaskId === depId ? { ...d, type } : d),
    }));
  };

  const submitForm = async () => {
    setFormError(null);
    if (!form.name.trim()) { setFormError('Nome é obrigatório.'); return; }
    if (!form.startDate || !form.endDate) { setFormError('Datas de início e fim são obrigatórias.'); return; }
    if (form.startDate >= form.endDate) { setFormError('A data de fim deve ser após o início.'); return; }

    setFormSaving(true);
    try {
      const dto: CreateTaskDto = {
        name: form.name.trim(),
        description: form.description.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        responsibleUserId: form.responsibleUserId.trim() || undefined,
        parentTaskId: form.parentTaskId || undefined,
        order: editingTask?.order ?? tasks.length,
        dependencies: form.dependencies as TaskDependency[],
      };

      if (editingTask) {
        await ScheduleService.update(workId, editingTask.id, dto);
      } else {
        await ScheduleService.create(workId, dto);
      }

      setShowForm(false);
      setEditingTask(null);
      load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setFormSaving(false);
    }
  };

  // ── Gantt update callback ──────────────────────────────────────
  const handleGanttTaskUpdate = useCallback((taskId: string, patch: Partial<ScheduleTask>) => {
    setTasks((ts) => ts.map((t) => t.id === taskId ? { ...t, ...patch } : t));
  }, []);

  // ── Render ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#7A7670', fontFamily: 'DM Sans' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', marginBottom: 12 }}>
          <Clock size={24} color="#B8922A" />
        </motion.div>
        <div style={{ fontSize: 14 }}>Carregando cronograma…</div>
      </div>
    );
  }

  const summaryItems = [
    { label: 'Concluídas', value: counts.concluida, color: '#1E8449', bg: '#E8F5E9', icon: CheckCircle2 },
    { label: 'Em Andamento', value: counts.em_andamento, color: '#1A5276', bg: '#EBF5FB', icon: Clock },
    { label: 'Pendentes', value: counts.pendente, color: '#7A7670', bg: '#F5F5F5', icon: Minus },
    { label: 'Em Risco', value: counts.atRisk, color: '#856404', bg: '#FFF3CD', icon: AlertTriangle },
  ];

  const filterLabel = filterStatus === 'all' ? 'Todos' : TASK_STATUS_CONFIG[filterStatus].label;

  return (
    <>
      <style>{CSS}</style>
      <div className="sc">
        {/* Summary cards */}
        <div className="sc-summary">
          {summaryItems.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                className="sc-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const map: Record<string, TaskStatus | 'all'> = {
                    'Concluídas': 'concluida', 'Em Andamento': 'em_andamento',
                    'Pendentes': 'pendente', 'Em Risco': 'all',
                  };
                  const next = map[s.label] ?? 'all';
                  setFilterStatus((prev) => prev === next ? 'all' : next);
                }}
              >
                <div className="sc-card-icon" style={{ background: s.bg }}>
                  <Icon size={18} color={s.color} />
                </div>
                <div>
                  <div className="sc-card-val" style={{ color: s.color }}>{s.value}</div>
                  <div className="sc-card-label">{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="sc-toolbar">
          <div className="sc-search">
            <Filter size={13} className="sc-search-icon" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#7A7670' }} />
            <input
              placeholder="Buscar tarefas…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 34 }}
            />
          </div>

          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              className={`sc-filter-btn${filterStatus !== 'all' ? ' active' : ''}`}
              onClick={() => setShowFilterDropdown((v) => !v)}
            >
              <Filter size={13} /> {filterLabel} <ChevronDown size={12} />
            </button>
            {showFilterDropdown && (
              <div className="sc-dropdown">
                {(['all', ...STATUS_ORDER] as Array<TaskStatus | 'all'>).map((s) => {
                  const label = s === 'all' ? 'Todos os status' : TASK_STATUS_CONFIG[s].label;
                  const color = s === 'all' ? '#7A7670' : TASK_STATUS_CONFIG[s].color;
                  return (
                    <div
                      key={s}
                      className={`sc-dropdown-item${filterStatus === s ? ' selected' : ''}`}
                      onClick={() => { setFilterStatus(s); setShowFilterDropdown(false); }}
                    >
                      {s !== 'all' && (
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: color, flexShrink: 0 }} />
                      )}
                      {label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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
            <motion.button
              className="sc-btn primary"
              onClick={openCreate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={14} /> Nova Tarefa
            </motion.button>
          )}
        </div>

        {/* Gantt view */}
        {view === 'gantt' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <GanttView
              workId={workId}
              tasks={filtered}
              onTaskUpdate={handleGanttTaskUpdate}
              canWrite={canWrite}
            />
          </motion.div>
        )}

        {/* List view */}
        {view === 'list' && (
          <div className="sc-list">
            {filtered.length === 0 && (
              <div className="sc-empty">
                {search || filterStatus !== 'all' ? 'Nenhuma tarefa encontrada com esses filtros.' : 'Nenhuma tarefa cadastrada ainda.'}
              </div>
            )}

            {filtered.map((task, idx) => {
              const cfg = TASK_STATUS_CONFIG[task.status];
              const Icon = STATUS_ICONS[task.status];
              const isExpanded = expandedId === task.id;
              const isDragging = draggedId === task.id;
              const isDragOver = dragOverId === task.id && draggedId !== task.id;
              const progress = progressEditing[task.id] ?? task.progress;
              const progressColor = getProgressColor(progress, task.status);

              return (
                <motion.div
                  key={task.id}
                  className={`sc-task-row${isDragOver ? ' drag-over' : ''}${isDragging ? ' dragging' : ''}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                  draggable={canWrite}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnter={(e) => handleDragEnter(e, task.id)}
                  onDragLeave={(e) => handleDragLeave(e, task.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, task.id)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Main row */}
                  <div className="sc-task-main" onClick={() => setExpandedId(isExpanded ? null : task.id)}>
                    {canWrite && (
                      <div className="sc-drag-handle" onClick={(e) => e.stopPropagation()}>
                        <GripVertical size={16} />
                      </div>
                    )}

                    <div className="sc-status-icon" style={{ background: cfg.bg }}>
                      <Icon size={14} color={cfg.color} />
                    </div>

                    <div className="sc-task-info">
                      <div className="sc-task-name">
                        {task.name}
                        {task.isAtRisk && (
                          <span className="sc-risk-badge">
                            <AlertTriangle size={9} /> Em risco
                          </span>
                        )}
                        {task.status === 'bloqueada' && (
                          <span className="sc-blocked-badge">
                            <Lock size={9} /> Bloqueada
                          </span>
                        )}
                      </div>
                      <div className="sc-task-meta">
                        <Calendar size={11} />
                        {formatDate(task.startDate)} → {formatDate(task.endDate)}
                        {task.responsibleUserId && (
                          <>
                            <span>·</span>
                            <User size={10} />
                            {task.responsibleUserId}
                          </>
                        )}
                        {task.dependencies.length > 0 && (
                          <span className="sc-dep-badge">
                            <Link2 size={9} /> {task.dependencies.length} dep.
                          </span>
                        )}
                        {task.daysUntilDeadline != null && task.daysUntilDeadline <= 7 && task.status !== 'concluida' && (
                          <span style={{ color: task.daysUntilDeadline < 0 ? '#C0392B' : '#856404', fontWeight: 600, fontSize: 11 }}>
                            {task.daysUntilDeadline < 0
                              ? `${Math.abs(task.daysUntilDeadline)}d atraso`
                              : task.daysUntilDeadline === 0
                              ? 'Vence hoje'
                              : `${task.daysUntilDeadline}d restantes`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sc-task-right" onClick={(e) => e.stopPropagation()}>
                      {/* Status pill with dropdown */}
                      <div style={{ position: 'relative' }}>
                        <button
                          className="sc-status-pill"
                          style={{ background: cfg.bg, color: cfg.color, borderColor: 'transparent' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!canWrite) return;
                            setStatusDropdownId(statusDropdownId === task.id ? null : task.id);
                          }}
                          title={canWrite ? 'Clique para mudar o status' : undefined}
                        >
                          <Icon size={11} />
                          {cfg.label}
                          {canWrite && <ChevronDown size={10} style={{ opacity: 0.6 }} />}
                        </button>
                        {statusDropdownId === task.id && (
                          <div className="sc-status-dropdown" onClick={(e) => e.stopPropagation()}>
                            {STATUS_ORDER.map((s) => {
                              const scfg = TASK_STATUS_CONFIG[s];
                              const SIcon = STATUS_ICONS[s];
                              return (
                                <div
                                  key={s}
                                  className="sc-status-option"
                                  onClick={() => handleStatusChange(task, s)}
                                  style={{ fontWeight: task.status === s ? 600 : 400 }}
                                >
                                  <div style={{ width: 20, height: 20, borderRadius: 5, background: scfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <SIcon size={11} color={scfg.color} />
                                  </div>
                                  {scfg.label}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Progress compact */}
                      <div className="sc-progress-compact">
                        <div className="sc-progress-bar">
                          <div className="sc-progress-fill" style={{ width: `${progress}%`, background: progressColor }} />
                        </div>
                        <span className="sc-progress-pct">{progress}%</span>
                      </div>

                      <button
                        className="sc-expand-btn"
                        onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : task.id); }}
                        title={isExpanded ? 'Recolher' : 'Expandir detalhes'}
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="sc-task-expanded">
                          {task.description && (
                            <div className="sc-expanded-section">
                              <div className="sc-expanded-label">Descrição</div>
                              <div style={{ fontSize: 13, color: '#3D3A34', lineHeight: 1.5 }}>{task.description}</div>
                            </div>
                          )}

                          {/* Progress slider */}
                          {canWrite && (
                            <div className="sc-expanded-section">
                              <div className="sc-expanded-label">
                                Progresso {savingProgress === task.id && <span style={{ color: '#B8922A', fontWeight: 400 }}>Salvando…</span>}
                              </div>
                              <div className="sc-progress-slider-wrap">
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  step={5}
                                  value={progress}
                                  className="sc-progress-slider"
                                  onChange={(e) => handleProgressChange(task.id, Number(e.target.value))}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span style={{ fontSize: 14, fontWeight: 700, color: progressColor, minWidth: 36, textAlign: 'right' }}>
                                  {progress}%
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Dates grid */}
                          <div className="sc-expanded-section">
                            <div className="sc-expanded-label">Datas</div>
                            <div className="sc-expanded-dates">
                              <div className="sc-date-block">
                                <div className="sc-date-block-label">Início planejado</div>
                                <div className="sc-date-block-val">{formatDate(task.startDate)}</div>
                              </div>
                              <div className="sc-date-block">
                                <div className="sc-date-block-label">Fim planejado</div>
                                <div className="sc-date-block-val">{formatDate(task.endDate)}</div>
                              </div>
                              {task.actualStartDate && (
                                <div className="sc-date-block">
                                  <div className="sc-date-block-label" style={{ color: '#1E8449' }}>Início real</div>
                                  <div className="sc-date-block-val">{formatDate(task.actualStartDate)}</div>
                                </div>
                              )}
                              {task.actualEndDate && (
                                <div className="sc-date-block">
                                  <div className="sc-date-block-label" style={{ color: '#1E8449' }}>Fim real</div>
                                  <div className="sc-date-block-val">{formatDate(task.actualEndDate)}</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Dependencies */}
                          {task.dependencies.length > 0 && (
                            <div className="sc-expanded-section">
                              <div className="sc-expanded-label">Dependências</div>
                              <div className="sc-dep-list">
                                {task.dependencies.map((dep) => {
                                  const depTask = taskById.get(dep.dependsOnTaskId);
                                  return (
                                    <span key={dep.dependsOnTaskId} className="sc-dep-item">
                                      <Link2 size={10} />
                                      {depTask?.name ?? dep.dependsOnTaskId}
                                      <span className="sc-dep-type-tag">
                                        {dep.type === 'FinishToStart' ? 'FTS' : 'IaI'}
                                      </span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="sc-expanded-section">
                            <div className="sc-expanded-actions">
                              {canWrite && (
                                <button
                                  className="sc-btn"
                                  onClick={(e) => { e.stopPropagation(); openEdit(task); }}
                                  style={{ fontSize: 12 }}
                                >
                                  <Edit2 size={12} /> Editar tarefa
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  className="sc-btn"
                                  style={{ color: '#C0392B', borderColor: 'rgba(192,57,43,0.2)', fontSize: 12 }}
                                  onClick={(e) => { e.stopPropagation(); handleDelete(task); }}
                                  disabled={deletingId === task.id}
                                >
                                  <Trash2 size={12} />
                                  {deletingId === task.id ? 'Excluindo…' : 'Excluir'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="sc-modal-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (!formSaving) { setShowForm(false); setEditingTask(null); } }}
          >
            <motion.div
              className="sc-modal"
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sc-modal-title">
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </div>

              {formError && <div className="sc-err">{formError}</div>}

              <div className="sc-modal-grid">
                <div className="sc-field full">
                  <label className="sc-label">Nome da tarefa *</label>
                  <input
                    className="sc-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex.: Alvenaria — 3º pavimento"
                    autoFocus
                  />
                </div>

                <div className="sc-field full">
                  <label className="sc-label">Descrição</label>
                  <textarea
                    className="sc-textarea"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descreva o escopo da tarefa…"
                  />
                </div>

                <div className="sc-field">
                  <label className="sc-label">Data de início *</label>
                  <input
                    className="sc-input"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>

                <div className="sc-field">
                  <label className="sc-label">Data de fim *</label>
                  <input
                    className="sc-input"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>

                <div className="sc-field">
                  <label className="sc-label">Responsável</label>
                  <input
                    className="sc-input"
                    value={form.responsibleUserId}
                    onChange={(e) => setForm({ ...form, responsibleUserId: e.target.value })}
                    placeholder="Nome ou ID do responsável"
                  />
                </div>

                <div className="sc-field">
                  <label className="sc-label">Tarefa pai (opcional)</label>
                  <select
                    className="sc-select"
                    value={form.parentTaskId}
                    onChange={(e) => setForm({ ...form, parentTaskId: e.target.value })}
                  >
                    <option value="">— Nenhuma —</option>
                    {tasks
                      .filter((t) => t.id !== editingTask?.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                  </select>
                </div>

                <div className="sc-field full">
                  <label className="sc-label">Dependências</label>
                  <div className="sc-deps-grid">
                    {tasks.filter((t) => t.id !== editingTask?.id).length === 0 && (
                      <div style={{ gridColumn: '1/-1', color: '#7A7670', fontSize: 12, padding: 8 }}>Sem tarefas disponíveis.</div>
                    )}
                    {tasks
                      .filter((t) => t.id !== editingTask?.id)
                      .map((t) => {
                        const depEntry = form.dependencies.find((d) => d.dependsOnTaskId === t.id);
                        const isSelected = !!depEntry;
                        return (
                          <div
                            key={t.id}
                            className={`sc-dep-chip${isSelected ? ' selected' : ''}`}
                            onClick={() => toggleDep(t.id)}
                          >
                            <div style={{ width: 8, height: 8, borderRadius: 4, background: TASK_STATUS_CONFIG[t.status].color, flexShrink: 0 }} />
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                            {isSelected && (
                              <select
                                className="sc-dep-type-select"
                                value={depEntry.type}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setDepType(t.id, e.target.value as DependencyType)}
                              >
                                <option value="FinishToStart">FTS</option>
                                <option value="StartToStart">IaI</option>
                              </select>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#7A7670', marginTop: 5 }}>
                    FTS = Fim→Início · IaI = Início→Início
                  </div>
                </div>
              </div>

              <div className="sc-modal-actions">
                <button
                  className="sc-btn"
                  onClick={() => { setShowForm(false); setEditingTask(null); }}
                  disabled={formSaving}
                >
                  <X size={14} /> Cancelar
                </button>
                <motion.button
                  className="sc-btn primary"
                  onClick={submitForm}
                  disabled={formSaving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {formSaving ? 'Salvando…' : editingTask ? 'Salvar alterações' : 'Criar tarefa'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
