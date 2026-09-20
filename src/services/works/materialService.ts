import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';

// Status possíveis do fluxo de material da obra (workflow: Necessidade → Orçado → Comprado → Recebido → Consumindo → Concluído, ou Cancelado).
export type WorkMaterialStatus =
  | 'Necessidade'
  | 'Orcado'
  | 'Comprado'
  | 'Recebido'
  | 'Consumindo'
  | 'Concluido'
  | 'Cancelado';

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
  status: string;
  budgetedUnitPrice?: number;
  budgetedSupplierId?: string;
  budgetedAt?: string;
  purchaseOrderNumber?: string;
  purchasedUnitPrice?: number;
  expectedDeliveryDate?: string;
  purchasedAt?: string;
  receivedQuantity?: number;
  receivedAt?: string;
  invoiceNumber?: string;
  consumedQuantity: number;
  availableQuantity?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkMaterialHistoryDto {
  id: string;
  workMaterialId: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  changedAt: string;
  notes?: string;
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

export interface OrcarWorkMaterialInput {
  unitPrice: number;
  supplierId?: string;
}

export interface ComprarWorkMaterialInput {
  orderNumber: string;
  unitPrice: number;
  expectedDeliveryDate?: string;
}

export interface ReceberWorkMaterialInput {
  receivedQuantity: number;
  invoiceNumber?: string;
}

export interface ConsumirWorkMaterialInput {
  quantity: number;
  notes?: string;
  dailyLogEntryId?: string;
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
    status: String(raw.status ?? 'Necessidade'),
    budgetedUnitPrice: raw.budgetedUnitPrice != null ? Number(raw.budgetedUnitPrice) : undefined,
    budgetedSupplierId: raw.budgetedSupplierId ? String(raw.budgetedSupplierId) : undefined,
    budgetedAt: raw.budgetedAt ? String(raw.budgetedAt) : undefined,
    purchaseOrderNumber: raw.purchaseOrderNumber ?? undefined,
    purchasedUnitPrice: raw.purchasedUnitPrice != null ? Number(raw.purchasedUnitPrice) : undefined,
    expectedDeliveryDate: raw.expectedDeliveryDate ? String(raw.expectedDeliveryDate) : undefined,
    purchasedAt: raw.purchasedAt ? String(raw.purchasedAt) : undefined,
    receivedQuantity: raw.receivedQuantity != null ? Number(raw.receivedQuantity) : undefined,
    receivedAt: raw.receivedAt ? String(raw.receivedAt) : undefined,
    invoiceNumber: raw.invoiceNumber ?? undefined,
    consumedQuantity: Number(raw.consumedQuantity ?? 0),
    availableQuantity: raw.availableQuantity != null ? Number(raw.availableQuantity) : undefined,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWorkMaterialHistory(raw: any): WorkMaterialHistoryDto {
  return {
    id: String(raw.id ?? ''),
    workMaterialId: String(raw.workMaterialId ?? ''),
    fromStatus: String(raw.fromStatus ?? ''),
    toStatus: String(raw.toStatus ?? ''),
    changedBy: String(raw.changedBy ?? ''),
    changedAt: String(raw.changedAt ?? ''),
    notes: raw.notes ?? undefined,
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

  static async orcar(workId: string, id: string, input: OrcarWorkMaterialInput): Promise<WorkMaterialDto> {
    try {
      const { data } = await worksApi.patch(`${base(workId)}/${id}/orcar`, input);
      return mapWorkMaterial(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async comprar(workId: string, id: string, input: ComprarWorkMaterialInput): Promise<WorkMaterialDto> {
    try {
      const { data } = await worksApi.patch(`${base(workId)}/${id}/comprar`, input);
      return mapWorkMaterial(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async receber(workId: string, id: string, input: ReceberWorkMaterialInput): Promise<WorkMaterialDto> {
    try {
      const { data } = await worksApi.post(`${base(workId)}/${id}/receber`, input);
      return mapWorkMaterial(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async consumir(workId: string, id: string, input: ConsumirWorkMaterialInput): Promise<WorkMaterialDto> {
    try {
      const { data } = await worksApi.post(`${base(workId)}/${id}/consumir`, input);
      return mapWorkMaterial(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async getHistory(workId: string, id: string): Promise<WorkMaterialHistoryDto[]> {
    try {
      const { data } = await worksApi.get(`${base(workId)}/${id}/history`);
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items.map(mapWorkMaterialHistory);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
