import { worksApi } from '@/services/api/apiFactory';
import { API_CONFIG } from '@/config/api';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { DailyLogEntry, DailyLogOccurrence } from '@/modules/shared/types';
import { USE_MOCK, delay, genId, getList, setList } from './mockStore';

const base = (workId: string) => `/works/${workId}/daily-logs`;

// Constrói URL absoluta a partir do storagePath relativo da API
const FILE_BASE =
  import.meta.env.VITE_FILE_SERVER_URL ||
  API_CONFIG.WORKS.BASE_URL.replace(/\/api\/v1\/?$/, '');

export function buildPhotoUrl(storagePath: string): string {
  if (!storagePath) return '';
  if (
    storagePath.startsWith('http') ||
    storagePath.startsWith('data:') ||
    storagePath.startsWith('blob:')
  ) {
    return storagePath;
  }
  return `${FILE_BASE}/${storagePath}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDailyLog(raw: any): DailyLogEntry {
  const photos: string[] = Array.isArray(raw.photos)
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      raw.photos.map((p: any) => buildPhotoUrl(p.storagePath ?? p.fileName ?? ''))
    : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const occurrences: DailyLogOccurrence[] = Array.isArray(raw.occurrences)
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      raw.occurrences.map((o: any) => ({
        id: String(o.id ?? ''),
        description: o.description ?? '',
        responsible: o.responsible ?? '',
        deadline: o.deadline ? String(o.deadline).substring(0, 10) : '',
      }))
    : [];

  return {
    id: String(raw.id ?? ''),
    date: raw.date ? String(raw.date).substring(0, 10) : '',
    description: raw.activities ?? '',
    problems: raw.issues ?? undefined,
    actions: raw.notes ?? undefined,
    responsible: raw.authorId ? String(raw.authorId) : '',
    weather: raw.weather ?? undefined,
    workersCount: raw.workersCount != null ? Number(raw.workersCount) : undefined,
    photos,
    occurrences: occurrences.length > 0 ? occurrences : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBackendPayload(entry: Partial<DailyLogEntry>): any {
  return {
    weather: entry.weather || 'Não informado',
    workersCount: entry.workersCount ?? 0,
    activities: entry.description ?? '',
    issues: entry.problems ?? null,
    notes: entry.actions ?? null,
    occurrences: entry.occurrences?.map((o) => ({
      description: o.description,
      responsible: o.responsible,
      deadline: o.deadline,
    })) ?? null,
  };
}

export interface DailyLogFilter {
  from?: string;
  to?: string;
  responsible?: string;
  withProblemsOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface DailyLogPageResult {
  items: DailyLogEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class DailyLogService {
  static async list(workId: string, filter?: DailyLogFilter): Promise<DailyLogEntry[]> {
    let items: DailyLogEntry[];
    if (USE_MOCK) {
      items = [...getList('dailyLogs', workId)];
    } else {
      try {
        const params: Record<string, unknown> = {
          page: filter?.page ?? 1,
          pageSize: filter?.pageSize ?? 20,
        };
        const { data } = await worksApi.get<any>(base(workId), { params });
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

  static async listPaged(
    workId: string,
    page = 1,
    pageSize = 20,
  ): Promise<DailyLogPageResult> {
    if (USE_MOCK) {
      const all = [...getList('dailyLogs', workId)].sort((a, b) =>
        a.date < b.date ? 1 : -1,
      );
      const totalCount = all.length;
      const totalPages = Math.ceil(totalCount / pageSize) || 1;
      const start = (page - 1) * pageSize;
      const items = all.slice(start, start + pageSize);
      return delay({
        items,
        totalCount,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });
    }
    try {
      const { data } = await worksApi.get<any>(base(workId), {
        params: { page, pageSize },
      });
      const raw: any[] = Array.isArray(data) ? data : (data?.items ?? []);
      return {
        items: raw.map(mapDailyLog),
        totalCount: data?.totalCount ?? raw.length,
        page: data?.page ?? page,
        pageSize: data?.pageSize ?? pageSize,
        totalPages: data?.totalPages ?? 1,
        hasNextPage: data?.hasNextPage ?? false,
        hasPreviousPage: data?.hasPreviousPage ?? false,
      };
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async getById(workId: string, entryId: string): Promise<DailyLogEntry> {
    if (USE_MOCK) {
      const list = getList('dailyLogs', workId);
      const found = list.find((i) => i.id === entryId);
      if (!found) throw new Error('Registro não encontrado');
      return delay(found);
    }
    try {
      const { data } = await worksApi.get<any>(`${base(workId)}/${entryId}`);
      return mapDailyLog(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async create(workId: string, payload: Omit<DailyLogEntry, 'id'>): Promise<DailyLogEntry> {
    if (USE_MOCK) {
      const created: DailyLogEntry = { ...payload, id: genId('d') };
      const list = getList('dailyLogs', workId);
      setList<DailyLogEntry>('dailyLogs', workId, [created, ...list]);
      return delay(created);
    }
    try {
      const body = {
        date: payload.date,
        ...toBackendPayload(payload),
      };
      const { data } = await worksApi.post<any>(base(workId), body);
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
      const { data } = await worksApi.put<any>(
        `${base(workId)}/${entryId}`,
        toBackendPayload(patch),
      );
      return mapDailyLog(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async remove(workId: string, entryId: string): Promise<void> {
    if (USE_MOCK) {
      const list = getList('dailyLogs', workId);
      setList<DailyLogEntry>(
        'dailyLogs',
        workId,
        list.filter((i) => i.id !== entryId),
      );
      return delay(undefined);
    }
    try {
      await worksApi.delete(`${base(workId)}/${entryId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  /**
   * Upload de foto vinculada a um registro específico.
   * POST /api/v1/works/{workId}/daily-logs/{entryId}/photos
   */
  static async uploadPhoto(
    workId: string,
    entryId: string,
    file: File,
    caption?: string,
  ): Promise<string> {
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
      if (caption) formData.append('caption', caption);
      const { data } = await worksApi.post<any>(
        `${base(workId)}/${entryId}/photos`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return buildPhotoUrl(data.storagePath ?? data.fileName ?? '');
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  /**
   * Exporta o diário como PDF para download.
   * GET /api/v1/works/{workId}/daily-logs/export/pdf
   */
  static async exportPdf(workId: string, from?: string, to?: string): Promise<void> {
    if (USE_MOCK) {
      alert('Export de PDF não disponível em modo mock.');
      return;
    }
    try {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await worksApi.get(`${base(workId)}/export/pdf`, {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().substring(0, 10);
      a.href = url;
      a.download = `diario-${workId}-${today}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error: any) {
      // Quando responseType é 'blob', o corpo do erro também chega como Blob.
      // É necessário ler o Blob como texto e parsear o JSON para obter a mensagem.
      const responseData = error?.response?.data;
      if (responseData instanceof Blob) {
        try {
          const text = await responseData.text();
          const json = JSON.parse(text);
          throw new Error(json.title ?? json.detail ?? 'Erro ao exportar PDF.');
        } catch (parseErr) {
          if (parseErr instanceof Error && parseErr.message !== 'Erro ao exportar PDF.') {
            throw parseErr;
          }
        }
      }
      throw new Error(extractErrorMessage(error));
    }
  }
}
