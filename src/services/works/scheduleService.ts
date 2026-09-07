import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { ScheduleTask, TaskStatus } from '@/modules/shared/types';
import { USE_MOCK, delay, genId, getList, setList } from './mockStore';

const base = (workId: string) => `/works/${workId}/schedule`;

// Backend ScheduleTaskStatus (string com JsonStringEnumConverter) → frontend TaskStatus
const TASK_STATUS_FROM_BACKEND: Record<string, TaskStatus> = {
  Pending: 'pendente',
  InProgress: 'em_andamento',
  Completed: 'concluida',
  Delayed: 'atrasada',
  Blocked: 'bloqueada',
  Cancelled: 'pendente',
};

// Frontend TaskStatus → backend ScheduleTaskStatus string
const TASK_STATUS_TO_BACKEND: Record<TaskStatus, string> = {
  pendente: 'Pending',
  em_andamento: 'InProgress',
  concluida: 'Completed',
  atrasada: 'Delayed',
  bloqueada: 'Blocked',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapScheduleTask(raw: any): ScheduleTask {
  return {
    id: String(raw.id ?? ''),
    name: raw.name ?? '',
    startDate: raw.startDate ? String(raw.startDate).substring(0, 10) : '',
    endDate: raw.endDate ? String(raw.endDate).substring(0, 10) : '',
    progress: Number(raw.progress ?? 0),
    dependencies: Array.isArray(raw.dependencies) ? raw.dependencies.map(String) : [],
    responsible: raw.responsibleUserId ? String(raw.responsibleUserId) : '',
    status: TASK_STATUS_FROM_BACKEND[String(raw.status)] ?? 'pendente',
    stage: raw.description ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBackendTaskPayload(task: Partial<ScheduleTask>): any {
  const payload: any = {};
  if (task.name != null) payload.name = task.name;
  if (task.startDate != null) payload.startDate = task.startDate + 'T00:00:00';
  if (task.endDate != null) payload.endDate = task.endDate + 'T00:00:00';
  if (task.progress != null) payload.progress = task.progress;
  if (task.dependencies != null) payload.dependencies = task.dependencies;
  if (task.status != null) payload.status = TASK_STATUS_TO_BACKEND[task.status] ?? 'Pending';
  if (task.stage != null) payload.description = task.stage;
  payload.order = 0;
  return payload;
}

export interface DependencyValidationResult {
  ok: boolean;
  errors: string[];
}

export class ScheduleService {
  static async list(workId: string): Promise<ScheduleTask[]> {
    if (USE_MOCK) return delay(this.computeBlocked([...getList('schedule', workId)]));
    try {
      const { data } = await worksApi.get<any>(base(workId));
      const raw: any[] = Array.isArray(data) ? data : (data?.items ?? []);
      return this.computeBlocked(raw.map(mapScheduleTask));
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async create(workId: string, payload: Omit<ScheduleTask, 'id'>): Promise<ScheduleTask> {
    const all = USE_MOCK ? getList('schedule', workId) : await this.list(workId);
    const validation = this.validateDependencies([...all, { ...payload, id: '__new__' }]);
    if (!validation.ok) throw new Error(validation.errors.join(' | '));

    const created: ScheduleTask = { ...payload, id: genId('t') };
    if (USE_MOCK) {
      setList<ScheduleTask>('schedule', workId, [...all, created]);
      return delay(created);
    }
    try {
      const { data } = await worksApi.post<any>(`${base(workId)}/tasks`, toBackendTaskPayload(payload));
      return mapScheduleTask(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async update(
    workId: string,
    taskId: string,
    patch: Partial<ScheduleTask>,
  ): Promise<ScheduleTask> {
    const list = USE_MOCK ? getList('schedule', workId) : await this.list(workId);
    const idx = list.findIndex((t) => t.id === taskId);
    if (idx < 0) throw new Error('Tarefa não encontrada');
    const merged = { ...list[idx], ...patch };
    const next = [...list];
    next[idx] = merged;
    const validation = this.validateDependencies(next);
    if (!validation.ok) throw new Error(validation.errors.join(' | '));

    if (USE_MOCK) {
      setList<ScheduleTask>('schedule', workId, next);
      return delay(merged);
    }
    try {
      const { data } = await worksApi.put<any>(`${base(workId)}/tasks/${taskId}`, toBackendTaskPayload(merged));
      return mapScheduleTask(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async remove(workId: string, taskId: string): Promise<void> {
    if (USE_MOCK) {
      const list = getList('schedule', workId);
      const hasDependent = list.some((t) => t.dependencies.includes(taskId));
      if (hasDependent) throw new Error('Há tarefas dependentes desta. Remova-as primeiro.');
      setList<ScheduleTask>('schedule', workId, list.filter((t) => t.id !== taskId));
      return delay(undefined);
    }
    try {
      await worksApi.delete(`${base(workId)}/tasks/${taskId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static validateDependencies(tasks: ScheduleTask[]): DependencyValidationResult {
    const errors: string[] = [];
    const byId = new Map(tasks.map((t) => [t.id, t]));

    for (const task of tasks) {
      for (const depId of task.dependencies) {
        const dep = byId.get(depId);
        if (!dep) {
          errors.push(`${task.name}: dependência "${depId}" não existe`);
          continue;
        }
        if (task.startDate && dep.endDate && task.startDate < dep.endDate) {
          errors.push(
            `${task.name}: inicia em ${task.startDate}, antes do fim da dependência "${dep.name}" (${dep.endDate})`,
          );
        }
      }
    }

    if (this.hasCycle(tasks)) errors.push('Há ciclo nas dependências do cronograma');
    return { ok: errors.length === 0, errors };
  }

  private static hasCycle(tasks: ScheduleTask[]): boolean {
    const graph = new Map(tasks.map((t) => [t.id, t.dependencies]));
    const visited = new Set<string>();
    const stack = new Set<string>();

    const visit = (id: string): boolean => {
      if (stack.has(id)) return true;
      if (visited.has(id)) return false;
      visited.add(id);
      stack.add(id);
      for (const dep of graph.get(id) ?? []) {
        if (visit(dep)) return true;
      }
      stack.delete(id);
      return false;
    };

    for (const [id] of graph) {
      if (visit(id)) return true;
    }
    return false;
  }

  private static computeBlocked(tasks: ScheduleTask[]): ScheduleTask[] {
    const byId = new Map(tasks.map((t) => [t.id, t]));
    return tasks.map((t) => {
      if (t.status === 'concluida' || t.status === 'em_andamento') return t;
      const blocked = t.dependencies.some((d) => byId.get(d)?.status !== 'concluida');
      if (blocked && t.dependencies.length > 0) return { ...t, status: 'bloqueada' };
      return t;
    });
  }
}
