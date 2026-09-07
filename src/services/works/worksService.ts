import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { Work, WorkStatus, CreateWorkDto, AddressDto } from '@/modules/shared/types';

const BASE = '/works';

// Mapeamento do StatusLabel do backend (enum name) para o WorkStatus do frontend
const STATUS_MAP: Record<string, WorkStatus> = {
  Planning: 'planejada',
  InProgress: 'em_andamento',
  Paused: 'pausada',
  Completed: 'concluida',
  Cancelled: 'cancelada',
};

// Extrai apenas a parte da data (YYYY-MM-DD) de uma string ISO para evitar
// conversão de fuso horário ao usar o construtor Date() do JavaScript.
function normalizeDate(raw: unknown): string | undefined {
  if (raw == null) return undefined;
  const str = String(raw);
  return str.length >= 10 ? str.substring(0, 10) : str;
}

function mapAddress(raw: unknown): AddressDto | string {
  if (raw == null) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') {
    const a = raw as Record<string, unknown>;
    return {
      zipCode: String(a.zipCode ?? ''),
      street: String(a.street ?? ''),
      number: String(a.number ?? ''),
      neighborhood: String(a.neighborhood ?? ''),
      city: String(a.city ?? ''),
      state: String(a.state ?? ''),
      complement: a.complement != null ? String(a.complement) : undefined,
    } satisfies AddressDto;
  }
  return '';
}

function mapWork(raw: Record<string, unknown>): Work {
  const statusLabel = (raw.statusLabel as string) ?? '';
  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    description: raw.description as string | undefined,
    address: mapAddress(raw.address),
    status: STATUS_MAP[statusLabel] ?? 'planejada',
    statusLabel,
    startDate: normalizeDate(raw.startDate) ?? '',
    expectedEndDate: normalizeDate(raw.expectedEndDate),
    actualEndDate: normalizeDate(raw.actualEndDate),
    totalBudget: Number(raw.totalBudget ?? 0),
    currentCost: Number(raw.currentCost ?? 0),
    margin: Number(raw.margin ?? 0),
    marginPercent: Number(raw.marginPercent ?? 0),
    customerId: raw.customerId as string | undefined,
    responsibleUserId: raw.responsibleUserId as string | undefined,
    createdAt: normalizeDate(raw.createdAt),
    updatedAt: normalizeDate(raw.updatedAt),
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

  static async lookupCep(cep: string): Promise<CepResult> {
    try {
      const { data } = await worksApi.get(`${BASE}/cep/${cep}`);
      if (!data.isSuccess) {
        throw new Error(data.error ?? 'CEP não encontrado.');
      }
      return data.value as CepResult;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}

export interface CepResult {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}
