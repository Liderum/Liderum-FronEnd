import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { ScheduleTask } from '@/modules/shared/types';
import { USE_MOCK, delay, genId, getList, setList } from './mockStore';

const base = (workId: string) => `/works/${workId}/schedule`;

export interface DependencyValidationResult {
  ok: boolean;
  errors: string[];
}

export class ScheduleService {
  static async list(workId: string): Promise<ScheduleTask[]> {
    if (USE_MOCK) return delay(this.computeBlocked([...getList('schedule', workId)]));
    try {
      const { data } = await worksApi.get<ScheduleTask[]>(base(workId));
      return this.computeBlocked(data);
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
      const { data } = await worksApi.post<ScheduleTask>(`${base(workId)}/tasks`, created);
      return data;
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
      const { data } = await worksApi.put<ScheduleTask>(`${base(workId)}/tasks/${taskId}`, patch);
      return data;
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
