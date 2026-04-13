import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { DailyLogEntry } from '@/modules/shared/types';
import { USE_MOCK, delay, genId, getList, setList } from './mockStore';

const base = (workId: string) => `/works/${workId}/daily-logs`;

export interface DailyLogFilter {
  from?: string;
  to?: string;
  responsible?: string;
  withProblemsOnly?: boolean;
}

export class DailyLogService {
  static async list(workId: string, filter?: DailyLogFilter): Promise<DailyLogEntry[]> {
    let items: DailyLogEntry[];
    if (USE_MOCK) {
      items = [...getList('dailyLogs', workId)];
    } else {
      try {
        const { data } = await worksApi.get<DailyLogEntry[]>(base(workId), { params: filter });
        items = data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }

    if (filter) {
      if (filter.from) items = items.filter((i) => i.date >= filter.from!);
      if (filter.to) items = items.filter((i) => i.date <= filter.to!);
      if (filter.responsible) items = items.filter((i) => i.responsible === filter.responsible);
      if (filter.withProblemsOnly) items = items.filter((i) => !!i.problems);
    }

    items.sort((a, b) => (a.date < b.date ? 1 : -1));
    return USE_MOCK ? delay(items) : items;
  }

  static async create(workId: string, payload: Omit<DailyLogEntry, 'id'>): Promise<DailyLogEntry> {
    if (USE_MOCK) {
      const created: DailyLogEntry = { ...payload, id: genId('d') };
      const list = getList('dailyLogs', workId);
      setList<DailyLogEntry>('dailyLogs', workId, [created, ...list]);
      return delay(created);
    }
    try {
      const { data } = await worksApi.post<DailyLogEntry>(base(workId), payload);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async update(
    workId: string,
    entryId: string,
    patch: Partial<DailyLogEntry>,
  ): Promise<DailyLogEntry> {
    if (USE_MOCK) {
      const list = getList('dailyLogs', workId);
      const idx = list.findIndex((i) => i.id === entryId);
      if (idx < 0) throw new Error('Registro não encontrado');
      const updated = { ...list[idx], ...patch };
      const next = [...list];
      next[idx] = updated;
      setList<DailyLogEntry>('dailyLogs', workId, next);
      return delay(updated);
    }
    try {
      const { data } = await worksApi.put<DailyLogEntry>(`${base(workId)}/${entryId}`, patch);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async remove(workId: string, entryId: string): Promise<void> {
    if (USE_MOCK) {
      const list = getList('dailyLogs', workId);
      setList<DailyLogEntry>('dailyLogs', workId, list.filter((i) => i.id !== entryId));
      return delay(undefined);
    }
    try {
      await worksApi.delete(`${base(workId)}/${entryId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async uploadPhoto(_workId: string, file: File): Promise<string> {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { data } = await worksApi.post<{ url: string }>(`${base(_workId)}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.url;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
