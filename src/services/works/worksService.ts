import { managementApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { Work } from '@/modules/shared/types';
import { mockStore, USE_MOCK, delay, genId, nowIso } from './mockStore';

const BASE = '/liderum/api/works';

export class WorksService {
  static async list(): Promise<Work[]> {
    if (USE_MOCK) return delay([...mockStore.works]);
    try {
      const { data } = await managementApi.get<Work[]>(BASE);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async getById(id: string): Promise<Work | undefined> {
    if (USE_MOCK) return delay(mockStore.works.find((w) => w.id === id));
    try {
      const { data } = await managementApi.get<Work>(`${BASE}/${id}`);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async create(payload: Omit<Work, 'id'>): Promise<Work> {
    if (USE_MOCK) {
      const created: Work = { ...payload, id: genId('w') };
      mockStore.works.push(created);
      return delay(created);
    }
    try {
      const { data } = await managementApi.post<Work>(BASE, payload);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async update(id: string, patch: Partial<Work>): Promise<Work> {
    if (USE_MOCK) {
      const idx = mockStore.works.findIndex((w) => w.id === id);
      if (idx < 0) throw new Error('Obra não encontrada');
      mockStore.works[idx] = { ...mockStore.works[idx], ...patch };
      return delay(mockStore.works[idx]);
    }
    try {
      const { data } = await managementApi.put<Work>(`${BASE}/${id}`, patch);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async addCost(id: string, amount: number, _reason: string): Promise<Work> {
    if (USE_MOCK) {
      const idx = mockStore.works.findIndex((w) => w.id === id);
      if (idx < 0) throw new Error('Obra não encontrada');
      mockStore.works[idx] = {
        ...mockStore.works[idx],
        currentCost: mockStore.works[idx].currentCost + amount,
      };
      return delay(mockStore.works[idx]);
    }
    try {
      const { data } = await managementApi.post<Work>(`${BASE}/${id}/cost`, {
        amount,
        reason: _reason,
        at: nowIso(),
      });
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
