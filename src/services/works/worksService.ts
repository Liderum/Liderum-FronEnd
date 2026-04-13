import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { Work, WorkStatus, CreateWorkDto } from '@/modules/shared/types';
import { Console } from 'console';

const BASE = '/works';

// Mapeamento do StatusLabel do backend para o WorkStatus do frontend
const STATUS_MAP: Record<string, WorkStatus> = {
  Planning: 'planejada',
  InProgress: 'em_andamento',
  Paused: 'pausada',
  Completed: 'concluida',
  Cancelled: 'pausada',
};

function mapWork(raw: Record<string, unknown>): Work {
  const statusLabel = (raw.statusLabel as string) ?? '';
  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    description: raw.description as string | undefined,
    address: String(raw.address ?? ''),
    status: STATUS_MAP[statusLabel] ?? 'planejada',
    statusLabel,
    startDate: String(raw.startDate ?? ''),
    expectedEndDate: raw.expectedEndDate as string | undefined,
    actualEndDate: raw.actualEndDate as string | undefined,
    totalBudget: Number(raw.totalBudget ?? 0),
    currentCost: Number(raw.currentCost ?? 0),
    margin: Number(raw.margin ?? 0),
    marginPercent: Number(raw.marginPercent ?? 0),
    customerId: raw.customerId as string | undefined,
    responsibleUserId: raw.responsibleUserId as string | undefined,
    createdAt: raw.createdAt as string | undefined,
    updatedAt: raw.updatedAt as string | undefined,
  };
}

export class WorksService {
  static async list(): Promise<Work[]> {
    try {
      const { data } = await worksApi.get(BASE);
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items.map(mapWork);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async getById(id: string): Promise<Work | undefined> {
    try {
      const { data } = await worksApi.get(`${BASE}/${id}`);
      return mapWork(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async create(payload: CreateWorkDto): Promise<Work> {
    try {
      const { data } = await worksApi.post(BASE, payload);
      return mapWork(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async update(id: string, patch: Partial<Work>): Promise<Work> {
    try {
      const { data } = await worksApi.put(`${BASE}/${id}`, patch);
      return mapWork(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async addCost(id: string, amount: number, reason: string): Promise<Work> {
    try {
      const { data } = await worksApi.post(`${BASE}/${id}/cost`, { amount, reason });
      return mapWork(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
