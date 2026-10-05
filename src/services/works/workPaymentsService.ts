import axios, { AxiosError } from 'axios';
import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type {
  CreateWorkPaymentInput,
  MarkPaidInput,
  PagedResult,
  PaymentReceipt,
  UpdateWorkPaymentInput,
  WorkPayment,
  WorkPaymentFilters,
  WorkPaymentSummary,
} from '@/modules/shared/types/payments';

/** Erro tipado: preserva o status HTTP para a UI decidir (409 → recarregar, 413/415 → arquivo). */
export class PaymentsApiError extends Error {
  status?: number;
  canceled: boolean;
  constructor(message: string, status?: number, canceled = false) {
    super(message);
    this.name = 'PaymentsApiError';
    this.status = status;
    this.canceled = canceled;
  }
}

function toError(error: unknown): PaymentsApiError {
  if (axios.isCancel(error)) return new PaymentsApiError('Envio cancelado.', undefined, true);
  const status = error instanceof AxiosError ? error.response?.status : undefined;
  let message = extractErrorMessage(error);
  if (status === 413) message = 'Arquivo maior que o limite de 10 MB.';
  if (status === 415) message = 'Tipo de arquivo não suportado.';
  if (status === 409) message = 'Este pagamento foi alterado por outra pessoa.';
  if (error instanceof AxiosError && !error.response) message = 'Sem conexão com o servidor. Tente novamente.';
  return new PaymentsApiError(message, status);
}

const date10 = (v: unknown): string | undefined => (v ? String(v).substring(0, 10) : undefined);
const optNum = (v: unknown): number | undefined => (v == null || v === '' ? undefined : Number(v));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReceipt(raw: any): PaymentReceipt {
  return {
    id: String(raw.id ?? ''),
    paymentId: String(raw.paymentId ?? ''),
    fileName: String(raw.fileName ?? 'comprovante'),
    contentType: String(raw.contentType ?? 'application/octet-stream'),
    sizeBytes: Number(raw.sizeBytes ?? 0),
    uploadedAt: raw.uploadedAt ? String(raw.uploadedAt) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPayment(raw: any): WorkPayment {
  const receipts = Array.isArray(raw.receipts) ? raw.receipts.map(mapReceipt) : [];
  return {
    id: String(raw.id ?? ''),
    workId: String(raw.workId ?? ''),
    type: Number(raw.type ?? 4),
    description: raw.description ?? undefined,
    amount: Number(raw.amount ?? 0),
    dueDate: date10(raw.dueDate) ?? '',
    paidAt: date10(raw.paidAt),
    paidAmount: optNum(raw.paidAmount),
    method: optNum(raw.method),
    status: Number(raw.status ?? 1),
    isOverdue: Boolean(raw.isOverdue),
    notes: raw.notes ?? undefined,
    receiptCount: Number(raw.receiptCount ?? receipts.length),
    receipts,
    rowVersion: String(raw.rowVersion ?? ''),
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSummary(raw: any, workId: string): WorkPaymentSummary {
  const n = (v: unknown) => Number(v ?? 0);
  const contractAmount = n(raw.contractAmount);
  const totalScheduled = n(raw.totalScheduled);
  const totalPaid = n(raw.totalPaid);
  return {
    workId: String(raw.workId ?? workId),
    contractAmount,
    totalScheduled,
    totalPaid,
    totalPending: n(raw.totalPending),
    totalOverdue: n(raw.totalOverdue),
    remainingToSchedule: raw.remainingToSchedule != null
      ? n(raw.remainingToSchedule)
      : Math.max(0, contractAmount - totalScheduled),
    percentPaid: raw.percentPaid != null ? n(raw.percentPaid) : contractAmount > 0 ? (totalPaid / contractAmount) * 100 : 0,
    percentScheduled: raw.percentScheduled != null
      ? n(raw.percentScheduled)
      : contractAmount > 0 ? (totalScheduled / contractAmount) * 100 : 0,
    paymentsCount: n(raw.paymentsCount),
    paidCount: n(raw.paidCount),
    pendingCount: n(raw.pendingCount),
    overdueCount: n(raw.overdueCount),
    nextDue: raw.nextDue
      ? { id: String(raw.nextDue.id ?? ''), dueDate: date10(raw.nextDue.dueDate) ?? '', amount: n(raw.nextDue.amount) }
      : null,
  };
}

const base = (workId: string) => `/works/${workId}/payments`;
const idemHeaders = (key?: string) => (key ? { 'Idempotency-Key': key } : undefined);

export class WorkPaymentsService {
  static async list(workId: string, f: WorkPaymentFilters = {}, signal?: AbortSignal): Promise<PagedResult<WorkPayment>> {
    try {
      const params: Record<string, unknown> = {
        status: f.status,
        type: f.type,
        from: f.from || undefined,
        to: f.to || undefined,
        search: f.search?.trim() || undefined,
        hasReceipt: f.hasReceipt,
        page: f.page ?? 1,
        pageSize: f.pageSize ?? 25,
        sort: f.sort ?? 'dueDate',
      };
      const { data } = await worksApi.get(base(workId), { params, signal });
      const rawItems = Array.isArray(data) ? data : data?.items ?? [];
      const items = rawItems.map(mapPayment);
      const page = Number(data?.page ?? params.page);
      const pageSize = Number(data?.pageSize ?? params.pageSize);
      const totalCount = Number(data?.totalCount ?? items.length);
      return {
        items,
        totalCount,
        page,
        pageSize,
        hasNextPage: data?.hasNextPage ?? page * pageSize < totalCount,
        hasPreviousPage: data?.hasPreviousPage ?? page > 1,
      };
    } catch (e) {
      throw toError(e);
    }
  }

  static async summary(workId: string): Promise<WorkPaymentSummary> {
    try {
      const { data } = await worksApi.get(`${base(workId)}/summary`);
      return mapSummary(data ?? {}, workId);
    } catch (e) {
      throw toError(e);
    }
  }

  static async getById(workId: string, id: string): Promise<WorkPayment> {
    try {
      const { data } = await worksApi.get(`${base(workId)}/${id}`);
      return mapPayment(data);
    } catch (e) {
      throw toError(e);
    }
  }

  static async create(workId: string, input: CreateWorkPaymentInput, idempotencyKey?: string): Promise<WorkPayment> {
    try {
      const { data } = await worksApi.post(base(workId), input, { headers: idemHeaders(idempotencyKey) });
      return mapPayment(data);
    } catch (e) {
      throw toError(e);
    }
  }

  static async update(workId: string, id: string, input: UpdateWorkPaymentInput): Promise<WorkPayment> {
    try {
      const { data } = await worksApi.put(`${base(workId)}/${id}`, input, {
        headers: { 'If-Match': input.rowVersion },
      });
      return mapPayment(data);
    } catch (e) {
      throw toError(e);
    }
  }

  static async markPaid(workId: string, id: string, input: MarkPaidInput): Promise<WorkPayment> {
    try {
      const { data } = await worksApi.post(`${base(workId)}/${id}/mark-paid`, input);
      return mapPayment(data);
    } catch (e) {
      throw toError(e);
    }
  }

  static async cancel(workId: string, id: string): Promise<WorkPayment> {
    try {
      const { data } = await worksApi.post(`${base(workId)}/${id}/cancel`);
      return mapPayment(data);
    } catch (e) {
      throw toError(e);
    }
  }

  static async remove(workId: string, id: string): Promise<void> {
    try {
      await worksApi.delete(`${base(workId)}/${id}`);
    } catch (e) {
      throw toError(e);
    }
  }

  static async uploadReceipt(
    workId: string,
    paymentId: string,
    file: File,
    opts: { idempotencyKey?: string; onProgress?: (pct: number) => void; signal?: AbortSignal } = {},
  ): Promise<PaymentReceipt> {
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await worksApi.post(`${base(workId)}/${paymentId}/receipts`, form, {
        // Content-Type removido para o browser definir o boundary do multipart.
        headers: { 'Content-Type': undefined, ...idemHeaders(opts.idempotencyKey) },
        timeout: 120000,
        signal: opts.signal,
        onUploadProgress: (e) => {
          if (e.total) opts.onProgress?.(Math.min(99, Math.round((e.loaded / e.total) * 100)));
        },
      });
      opts.onProgress?.(100);
      return mapReceipt({ paymentId, ...data });
    } catch (e) {
      throw toError(e);
    }
  }

  /** Baixa o comprovante como Blob autenticado (sem URL pública). */
  static async downloadReceipt(workId: string, paymentId: string, receiptId: string): Promise<Blob> {
    try {
      const { data } = await worksApi.get<Blob>(`${base(workId)}/${paymentId}/receipts/${receiptId}/download`, {
        responseType: 'blob',
        timeout: 120000,
      });
      return data;
    } catch (e) {
      throw toError(e);
    }
  }

  static async removeReceipt(workId: string, paymentId: string, receiptId: string): Promise<void> {
    try {
      await worksApi.delete(`${base(workId)}/${paymentId}/receipts/${receiptId}`);
    } catch (e) {
      throw toError(e);
    }
  }
}
