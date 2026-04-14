import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { DailyLogEntry } from '@/modules/shared/types';
import { USE_MOCK, delay, genId, getList, setList } from './mockStore';

const base = (workId: string) => `/works/${workId}/daily-logs`;

// Mapeia DailyLogEntryDto do backend para DailyLogEntry do frontend.
// O backend usa nomes de campo técnicos (activities, issues, notes, authorId).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDailyLog(raw: any): DailyLogEntry {
  return {
    id: String(raw.id ?? ''),
    date: raw.date ? String(raw.date).substring(0, 10) : '',
    description: raw.activities ?? '',
    problems: raw.issues ?? undefined,
    actions: raw.notes ?? undefined,
    responsible: raw.authorId ? String(raw.authorId) : '',
    weather: raw.weather ?? undefined,
    workersCount: raw.workersCount != null ? Number(raw.workersCount) : undefined,
    photos: [],
  };
}

// Converte DailyLogEntry do frontend para o payload esperado pelo backend.
// "weather" é obrigatório no backend (NotEmpty); usa "Não informado" como fallback.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBackendPayload(entry: Omit<DailyLogEntry, 'id'>): any {
  return {
    date: entry.date,
    weather: entry.weather || 'Não informado',
    workersCount: entry.workersCount ?? 0,
    activities: entry.description,
    issues: entry.problems ?? null,
    notes: entry.actions ?? null,
  };
}

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
        const { data } = await worksApi.get<any>(base(workId), { params: filter });
        // A API retorna PagedResult<DailyLogEntryDto> com campo "items"
        const raw: any[] = Array.isArray(data) ? data : (data?.items ?? []);
        items = raw.map(mapDailyLog);
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }

    if (filter) {
      if (filter.from) items = items.filter((i) => i.date >= filter.from!);
      if (filter.to) items = items.filter((i) => i.date <= filter.to!);
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
      const { data } = await worksApi.post<any>(base(workId), toBackendPayload(payload));
      return mapDailyLog(data);
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
      const { data } = await worksApi.put<any>(`${base(workId)}/${entryId}`, toBackendPayload(patch as Omit<DailyLogEntry, 'id'>));
      return mapDailyLog(data);
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
