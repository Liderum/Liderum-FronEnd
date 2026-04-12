import { managementApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { BudgetItem, BudgetRevision } from '@/modules/shared/types';
import { mockStore, USE_MOCK, delay, genId, nowIso, getList, setList } from './mockStore';

const base = (workId: string) => `/liderum/api/works/${workId}/budget`;

export class BudgetService {
  static async list(workId: string): Promise<BudgetItem[]> {
    if (USE_MOCK) return delay([...getList('budget', workId)]);
    try {
      const { data } = await managementApi.get<BudgetItem[]>(base(workId));
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async create(workId: string, payload: Omit<BudgetItem, 'id'>): Promise<BudgetItem> {
    if (USE_MOCK) {
      const created: BudgetItem = { ...payload, id: genId('b') };
      const list = getList('budget', workId);
      setList<BudgetItem>('budget', workId, [...list, created]);
      return delay(created);
    }
    try {
      const { data } = await managementApi.post<BudgetItem>(base(workId), payload);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async update(
    workId: string,
    itemId: string,
    patch: Partial<BudgetItem>,
  ): Promise<BudgetItem> {
    if (USE_MOCK) {
      const list = getList('budget', workId);
      const idx = list.findIndex((i) => i.id === itemId);
      if (idx < 0) throw new Error('Item de orçamento não encontrado');
      const updated = { ...list[idx], ...patch };
      const next = [...list];
      next[idx] = updated;
      setList<BudgetItem>('budget', workId, next);
      return delay(updated);
    }
    try {
      const { data } = await managementApi.put<BudgetItem>(`${base(workId)}/${itemId}`, patch);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async remove(workId: string, itemId: string): Promise<void> {
    if (USE_MOCK) {
      const list = getList('budget', workId);
      setList<BudgetItem>('budget', workId, list.filter((i) => i.id !== itemId));
      return delay(undefined);
    }
    try {
      await managementApi.delete(`${base(workId)}/${itemId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async listRevisions(workId: string): Promise<BudgetRevision[]> {
    if (USE_MOCK) {
      return delay([...(mockStore.budgetRevisions[workId] ?? [])]);
    }
    try {
      const { data } = await managementApi.get<BudgetRevision[]>(`${base(workId)}/revisions`);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async createRevision(
    workId: string,
    reason: string,
    createdBy: string,
  ): Promise<BudgetRevision> {
    const items = await this.list(workId);
    const totalPlanned = items.reduce((s, i) => s + i.plannedCost, 0);
    const totalActual = items.reduce((s, i) => s + i.actualCost, 0);
    if (USE_MOCK) {
      const existing = mockStore.budgetRevisions[workId] ?? [];
      const revision: BudgetRevision = {
        id: genId('rev'),
        workId,
        revisionNumber: existing.length + 1,
        reason,
        totalPlanned,
        totalActual,
        createdAt: nowIso(),
        createdBy,
      };
      mockStore.budgetRevisions[workId] = [revision, ...existing];
      return delay(revision);
    }
    try {
      const { data } = await managementApi.post<BudgetRevision>(`${base(workId)}/revisions`, {
        reason,
        totalPlanned,
        totalActual,
      });
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static toCSV(items: BudgetItem[]): string {
    const header = ['Categoria', 'Descricao', 'Previsto', 'Realizado', 'Variacao', 'VariacaoPct'];
    const rows = items.map((i) => {
      const diff = i.actualCost - i.plannedCost;
      const pct = i.plannedCost === 0 ? 0 : (diff / i.plannedCost) * 100;
      return [
        `"${i.category}"`,
        `"${i.description.replace(/"/g, '""')}"`,
        i.plannedCost.toFixed(2),
        i.actualCost.toFixed(2),
        diff.toFixed(2),
        pct.toFixed(2),
      ].join(',');
    });
    return [header.join(','), ...rows].join('\n');
  }
}
