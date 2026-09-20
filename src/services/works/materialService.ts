import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';

// DTO já vem resolvido/flat do backend (joins com Material/Supplier feitos no servidor).
export interface WorkMaterialDto {
  id: string;
  workId: string;
  materialId: string;
  materialName: string;
  materialUnit: string;
  supplierId?: string;
  supplierName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWorkMaterialInput {
  materialId: string;
  supplierId?: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface UpdateWorkMaterialInput {
  supplierId?: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWorkMaterial(raw: any): WorkMaterialDto {
  return {
    id: String(raw.id ?? ''),
    workId: String(raw.workId ?? ''),
    materialId: String(raw.materialId ?? ''),
    materialName: String(raw.materialName ?? ''),
    materialUnit: String(raw.materialUnit ?? ''),
    supplierId: raw.supplierId ? String(raw.supplierId) : undefined,
    supplierName: raw.supplierName ?? undefined,
    quantity: Number(raw.quantity ?? 0),
    unitPrice: Number(raw.unitPrice ?? 0),
    totalPrice: Number(raw.totalPrice ?? 0),
    notes: raw.notes ?? undefined,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

const base = (workId: string) => `/works/${workId}/materials`;

export class WorkMaterialService {
  static async list(workId: string): Promise<WorkMaterialDto[]> {
    try {
      const { data } = await worksApi.get(base(workId));
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items.map(mapWorkMaterial);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async getById(workId: string, id: string): Promise<WorkMaterialDto> {
    try {
      const { data } = await worksApi.get(`${base(workId)}/${id}`);
      return mapWorkMaterial(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async create(workId: string, input: CreateWorkMaterialInput): Promise<WorkMaterialDto> {
    try {
      const { data } = await worksApi.post(base(workId), input);
      return mapWorkMaterial(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async update(workId: string, id: string, input: UpdateWorkMaterialInput): Promise<WorkMaterialDto> {
    try {
      const { data } = await worksApi.put(`${base(workId)}/${id}`, input);
      return mapWorkMaterial(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async delete(workId: string, id: string): Promise<void> {
    try {
      await worksApi.delete(`${base(workId)}/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
