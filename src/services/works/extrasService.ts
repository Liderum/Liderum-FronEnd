import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { ExtraRequest } from '@/modules/shared/types';
import { mockStore, USE_MOCK, delay, genId, nowIso, getList, setList } from './mockStore';
import { WorksService } from './worksService';

// Converte "3 dias" ou "3" → 3; retorna null para valores inválidos
function parseScheduleImpactDays(impact?: string): number | null {
  if (!impact) return null;
  const n = parseInt(impact, 10);
  return Number.isFinite(n) ? n : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExtra(raw: any): ExtraRequest {
  return {
    id: String(raw.id ?? ''),
    workId: raw.workId ? String(raw.workId) : undefined,
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    financialImpact: Number(raw.amount ?? 0),
    scheduleImpact: raw.scheduleImpactDays != null ? `${raw.scheduleImpactDays} dias` : '0 dias',
    requestDate: raw.requestedAt ? String(raw.requestedAt).substring(0, 10) : '',
    requestedBy: String(raw.requestedBy ?? ''),
    history: Array.isArray(raw.history)
      ? raw.history.map((h: any) => ({
          date: h.occurredAt ? String(h.occurredAt).substring(0, 10) : '',
          action: String(h.actionLabel ?? h.action ?? ''),
          user: String(h.userId ?? ''),
          notes: h.notes ?? undefined,
        }))
      : [],
    attachments: Array.isArray(raw.attachments)
      ? raw.attachments.map((a: any) => String(a.storagePath ?? a.fileName ?? ''))
      : [],
  };
}

const base = (workId: string) => `/works/${workId}/extras`;

export interface CreateExtraInput {
  title: string;
  description: string;
  scheduleImpact: string;
  financialImpact: number;
  requestedBy: string;
  attachments?: string[];
}

export class ExtrasService {
  static async list(workId: string): Promise<ExtraRequest[]> {
    if (USE_MOCK) return delay([...getList('extras', workId)]);
    try {
      const { data } = await worksApi.get(base(workId));
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items.map(mapExtra);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async listAll(): Promise<ExtraRequest[]> {
    if (USE_MOCK) {
      const all: ExtraRequest[] = [];
      for (const key of Object.keys(mockStore.extras)) {
        all.push(...getList('extras', key));
      }
      return delay(all);
    }
    try {
      const { data } = await worksApi.get('/extras');
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items.map(mapExtra);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async create(workId: string, input: CreateExtraInput): Promise<ExtraRequest> {
    const now = nowIso();
    const created: ExtraRequest = {
      id: genId('e'),
      workId,
      title: input.title,
      description: input.description,
      requestDate: now.slice(0, 10),
      scheduleImpact: input.scheduleImpact,
      financialImpact: input.financialImpact,
      requestedBy: input.requestedBy,
      attachments: input.attachments ?? [],
      history: [
        {
          date: now,
          action: 'Extra adicionado',
          user: input.requestedBy,
        },
      ],
    };

    if (USE_MOCK) {
      const list = getList('extras', workId);
      setList<ExtraRequest>('extras', workId, [created, ...list]);
      // Extra adicionado é a fonte da verdade: conta direto no custo da obra.
      await WorksService.addCost(workId, created.financialImpact, `Extra: ${created.title}`);
      return delay(created);
    }
    try {
      const { data } = await worksApi.post<any>(base(workId), {
        title: input.title,
        description: input.description,
        amount: input.financialImpact,
        scheduleImpactDays: parseScheduleImpactDays(input.scheduleImpact),
      });
      return mapExtra(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
