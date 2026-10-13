import { worksApi } from '@/services/api/apiFactory';

export interface StorageUsage {
  usedBytes: number;
  /** MB; `null` = ilimitado. */
  limitMb: number | null;
}

export class StorageService {
  /** GET /api/v1/storage/usage: uso da franquia de fotos e anexos do plano. */
  static async getUsage(): Promise<StorageUsage> {
    const { data } = await worksApi.get<{ usedBytes?: number; limitMb?: number | null }>('/storage/usage');
    return { usedBytes: Number(data.usedBytes ?? 0), limitMb: data.limitMb ?? null };
  }
}
