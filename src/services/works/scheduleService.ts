import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { ScheduleTask, TaskStatus, TaskDependency } from '@/modules/shared/types';
import { USE_MOCK, delay, genId, getList, setList } from './mockStore';

const base = (workId: string) => `/works/${workId}/schedule`;

const TASK_STATUS_FROM_BACKEND: Record<string, TaskStatus> = {
  Pending: 'pendente',
  InProgress: 'em_andamento',
  Completed: 'concluida',
  Delayed: 'atrasada',
  Blocked: 'bloqueada',
  Cancelled: 'pendente',
};

const TASK_STATUS_TO_BACKEND: Record<TaskStatus, string> = {
  pendente: 'Pending',
  em_andamento: 'InProgress',
  concluida: 'Completed',
  atrasada: 'Delayed',
  bloqueada: 'Blocked',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapScheduleTask(raw: any): ScheduleTask {
  const deps: TaskDependency[] = Array.isArray(raw.dependencies)
    ? raw.dependencies.map((d: any) => ({
        dependsOnTaskId: String(d.dependsOnTaskId ?? d),
        type: (d.type === 'StartToStart' ? 'StartToStart' : 'FinishToStart') as TaskDependency['type'],
      }))
    : [];

  return {
    id: String(raw.id ?? ''),
    workId: raw.workId ? String(raw.workId) : undefined,
    name: raw.name ?? '',
    description: raw.description ?? '',
    startDate: raw.startDate ? String(raw.startDate).substring(0, 10) : '',
    endDate: raw.endDate ? String(raw.endDate).substring(0, 10) : '',
    actualStartDate: raw.actualStartDate ? String(raw.actualStartDate).substring(0, 10) : undefined,
    actualEndDate: raw.actualEndDate ? String(raw.actualEndDate).substring(0, 10) : undefined,
    progress: Number(raw.progress ?? 0),
    status: TASK_STATUS_FROM_BACKEND[String(raw.status)] ?? 'pendente',
    responsibleUserId: raw.responsibleUserId ? String(raw.responsibleUserId) : undefined,
    parentTaskId: raw.parentTaskId ? String(raw.parentTaskId) : undefined,
    order: Number(raw.order ?? 0),
    dependencies: deps,
    isAtRisk: Boolean(raw.isAtRisk ?? false),
    daysUntilDeadline: raw.daysUntilDeadline != null ? Number(raw.daysUntilDeadline) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBackendTaskPayload(task: Partial<ScheduleTask>): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {};
  if (task.name != null) payload.name = task.name;
  if (task.description != null) payload.description = task.description;
  if (task.startDate != null) payload.startDate = task.startDate + 'T00:00:00';
  if (task.endDate != null) payload.endDate = task.endDate + 'T00:00:00';
  if (task.actualStartDate != null) payload.actualStartDate = task.actualStartDate + 'T00:00:00';
  if (task.actualEndDate != null) payload.actualEndDate = task.actualEndDate + 'T00:00:00';
  if (task.progress != null) payload.progress = task.progress;
  if (task.status != null) payload.status = TASK_STATUS_TO_BACKEND[task.status] ?? 'Pending';
  if (task.responsibleUserId != null) payload.responsibleUserId = task.responsibleUserId;
  if (task.parentTaskId != null) payload.parentTaskId = task.parentTaskId;
  if (task.order != null) payload.order = task.order;
  if (task.dependencies != null) {
    payload.dependencies = task.dependencies.map((d) => ({
      dependsOnTaskId: d.dependsOnTaskId,
      type: d.type,
    }));
  }
  return payload;
}

export type CreateTaskDto = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  responsibleUserId?: string;
  parentTaskId?: string;
  order?: number;
  dependencies: TaskDependency[];
};

export class ScheduleService {
  static async list(workId: string): Promise<ScheduleTask[]> {
    if (USE_MOCK) {
      const tasks = getList('schedule', workId);
      return delay([...tasks].sort((a, b) => a.order - b.order));
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await worksApi.get<any>(base(workId));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any[] = Array.isArray(data) ? data : (data?.items ?? []);
      return raw.map(mapScheduleTask).sort((a, b) => a.order - b.order);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async create(workId: string, dto: CreateTaskDto): Promise<ScheduleTask> {
    if (USE_MOCK) {
      const all = getList('schedule', workId);
      const order = dto.order ?? all.length;
      const created: ScheduleTask = {
        id: genId('t'),
        workId,
        name: dto.name,
        description: dto.description,
        startDate: dto.startDate,
        endDate: dto.endDate,
        progress: 0,
        status: 'pendente',
        responsibleUserId: dto.responsibleUserId,
        parentTaskId: dto.parentTaskId,
        order,
        dependencies: dto.dependencies,
        isAtRisk: false,
      };
      setList<ScheduleTask>('schedule', workId, [...all, created]);
      return delay(created);
    }
    try {
      const { data } = await worksApi.post<ScheduleTask>(
        `${base(workId)}/tasks`,
        toBackendTaskPayload({ ...dto, order: dto.order ?? 0, progress: 0, status: 'pendente' }),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mapScheduleTask(data as any);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async update(workId: string, taskId: string, patch: Partial<ScheduleTask>): Promise<ScheduleTask> {
    if (USE_MOCK) {
      const list = getList('schedule', workId);
      const idx = list.findIndex((t) => t.id === taskId);
      if (idx < 0) throw new Error('Tarefa não encontrada');
      const merged = { ...list[idx], ...patch };
      const next = [...list];
      next[idx] = merged;
      setList<ScheduleTask>('schedule', workId, next);
      return delay(merged);
    }
    try {
      const list = await this.list(workId);
      const existing = list.find((t) => t.id === taskId);
      if (!existing) throw new Error('Tarefa não encontrada');
      const merged = { ...existing, ...patch };
      const { data } = await worksApi.put<ScheduleTask>(
        `${base(workId)}/tasks/${taskId}`,
        toBackendTaskPayload(merged),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mapScheduleTask(data as any);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async updateStatus(workId: string, taskId: string, status: TaskStatus): Promise<void> {
    if (USE_MOCK) {
      const list = getList('schedule', workId);
      const idx = list.findIndex((t) => t.id === taskId);
      if (idx < 0) throw new Error('Tarefa não encontrada');
      const task = list[idx];
      const updates: Partial<ScheduleTask> = { status };
      if (status === 'em_andamento' && !task.actualStartDate) {
        updates.actualStartDate = new Date().toISOString().substring(0, 10);
      }
      if (status === 'concluida') {
        updates.actualEndDate = new Date().toISOString().substring(0, 10);
        updates.progress = 100;
      }
      const next = [...list];
      next[idx] = { ...task, ...updates };
      setList<ScheduleTask>('schedule', workId, next);
      return delay(undefined);
    }
    try {
      await worksApi.patch(`${base(workId)}/tasks/${taskId}/status`, {
        status: TASK_STATUS_TO_BACKEND[status] ?? 'Pending',
      });
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async updateProgress(workId: string, taskId: string, progress: number): Promise<void> {
    const pct = Math.max(0, Math.min(100, Math.round(progress)));
    if (USE_MOCK) {
      const list = getList('schedule', workId);
      const idx = list.findIndex((t) => t.id === taskId);
      if (idx < 0) throw new Error('Tarefa não encontrada');
      const task = list[idx];
      const updates: Partial<ScheduleTask> = { progress: pct };
      if (pct > 0 && task.status === 'pendente') {
        updates.status = 'em_andamento';
        if (!task.actualStartDate) updates.actualStartDate = new Date().toISOString().substring(0, 10);
      }
      if (pct === 100 && (task.status === 'em_andamento' || task.status === 'atrasada')) {
        updates.status = 'concluida';
        updates.actualEndDate = new Date().toISOString().substring(0, 10);
      }
      const next = [...list];
      next[idx] = { ...task, ...updates };
      setList<ScheduleTask>('schedule', workId, next);
      return delay(undefined);
    }
    try {
      await worksApi.patch(`${base(workId)}/tasks/${taskId}/progress`, { progress: pct });
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async reorder(workId: string, items: Array<{ id: string; order: number }>): Promise<void> {
    if (USE_MOCK) {
      const list = getList('schedule', workId);
      const orderMap = new Map(items.map((i) => [i.id, i.order]));
      const next = list.map((t) => ({
        ...t,
        order: orderMap.has(t.id) ? orderMap.get(t.id)! : t.order,
      }));
      setList<ScheduleTask>('schedule', workId, next);
      return delay(undefined);
    }
    try {
      await worksApi.patch(`${base(workId)}/tasks/reorder`, { items });
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async remove(workId: string, taskId: string): Promise<void> {
    if (USE_MOCK) {
      const list = getList('schedule', workId);
      const hasDependent = list.some((t) =>
        t.dependencies.some((d) => d.dependsOnTaskId === taskId),
      );
      if (hasDependent) throw new Error('Outras tarefas dependem desta. Remova as dependências primeiro.');
      setList<ScheduleTask>('schedule', workId, list.filter((t) => t.id !== taskId));
      return delay(undefined);
    }
    try {
      await worksApi.delete(`${base(workId)}/tasks/${taskId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
