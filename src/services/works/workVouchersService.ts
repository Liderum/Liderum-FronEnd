import axios, { AxiosError } from 'axios';
import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import { PaymentsApiError } from './workPaymentsService';
import type { PagedResult } from '@/modules/shared/types/payments';
import type {
  VoucherFile,
  WorkVoucher,
  WorkVoucherFilters,
  WorkVoucherInput,
  WorkVoucherSummary,
} from '@/modules/shared/types/vouchers';

function toError(error: unknown): PaymentsApiError {
  if (axios.isCancel(error)) return new PaymentsApiError('Envio cancelado.', undefined, true);
  const status = error instanceof AxiosError ? error.response?.status : undefined;
  let message = extractErrorMessage(error);
  if (status === 413) message = 'Arquivo maior que o limite de 10 MB.';
  if (status === 415) message = 'Tipo de arquivo não suportado.';
  if (status === 409) message = 'Este registro foi alterado por outra pessoa.';
  if (error instanceof AxiosError && !error.response) message = 'Sem conexão com o servidor. Tente novamente.';
  return new PaymentsApiError(message, status);
}

const date10 = (v: unknown): string | undefined => (v ? String(v).substring(0, 10) : undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFile(raw: any, voucherId = ''): VoucherFile {
  return {
    id: String(raw.id ?? ''),
    paymentId: String(raw.voucherId ?? voucherId),
    fileName: String(raw.fileName ?? 'comprovante'),
    contentType: String(raw.contentType ?? 'application/octet-stream'),
    sizeBytes: Number(raw.sizeBytes ?? 0),
    uploadedAt: raw.uploadedAt ? String(raw.uploadedAt) : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVoucher(raw: any): WorkVoucher {
  const id = String(raw.id ?? '');
  const files: VoucherFile[] = Array.isArray(raw.files) ? raw.files.map((f: unknown) => mapFile(f, id)) : [];
  return {
    id,
    workId: String(raw.workId ?? ''),
    category: Number(raw.category ?? 3),
    description: String(raw.description ?? ''),
    amount: Number(raw.amount ?? 0),
    occurredOn: date10(raw.occurredOn) ?? '',
    supplierName: raw.supplierName ?? undefined,
    documentNumber: raw.documentNumber ?? undefined,
    method: raw.method != null ? Number(raw.method) : undefined,
    notes: raw.notes ?? undefined,
    incidentId: raw.incidentId ? String(raw.incidentId) : undefined,
    incidentTitle: raw.incidentTitle ?? undefined,
    fileCount: Number(raw.fileCount ?? files.length),
    files,
    rowVersion: String(raw.rowVersion ?? ''),
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

const base = (workId: string) => `/works/${workId}/vouchers`;
const idem = (key?: string) => (key ? { 'Idempotency-Key': key } : undefined);

export class WorkVouchersService {
  static async list(workId: string, f: WorkVoucherFilters = {}, signal?: AbortSignal): Promise<PagedResult<WorkVoucher>> {
    try {
      const params = {
        category: f.category,
        from: f.from || undefined,
        to: f.to || undefined,
        search: f.search?.trim() || undefined,
        incidentId: f.incidentId || undefined,
        hasFile: f.hasFile,
        page: f.page ?? 1,
        pageSize: f.pageSize ?? 25,
        sort: f.sort ?? '-occurredOn',
      };
      const { data } = await worksApi.get(base(workId), { params, signal });
      const raw = Array.isArray(data) ? data : data?.items ?? [];
      const items: WorkVoucher[] = raw.map(mapVoucher);
      const page = Number(data?.page ?? params.page);
      const pageSize = Number(data?.pageSize ?? params.pageSize);
      const totalCount = Number(data?.totalCount ?? items.length);
      return {
        items, totalCount, page, pageSize,
        hasNextPage: data?.hasNextPage ?? page * pageSize < totalCount,
        hasPreviousPage: data?.hasPreviousPage ?? page > 1,
      };
    } catch (e) {
      throw toError(e);
    }
  }

  static async summary(workId: string, range: { from?: string; to?: string } = {}): Promise<WorkVoucherSummary> {
    try {
      const { data } = await worksApi.get(`${base(workId)}/summary`, {
        params: { from: range.from || undefined, to: range.to || undefined },
      });
      return {
        workId: String(data?.workId ?? workId),
        totalSpent: Number(data?.totalSpent ?? 0),
        count: Number(data?.count ?? 0),
        byCategory: Array.isArray(data?.byCategory)
          ? data.byCategory.map((c: { category: unknown; total: unknown; count: unknown }) => ({
              category: Number(c.category), total: Number(c.total ?? 0), count: Number(c.count ?? 0),
            }))
          : [],
      };
    } catch (e) {
      throw toError(e);
    }
  }

  static async getById(workId: string, id: string): Promise<WorkVoucher> {
    try {
      const { data } = await worksApi.get(`${base(workId)}/${id}`);
      return mapVoucher(data);
    } catch (e) {
      throw toError(e);
    }
  }

  static async create(workId: string, input: WorkVoucherInput, idempotencyKey?: string): Promise<WorkVoucher> {
    try {
      const { data } = await worksApi.post(base(workId), input, { headers: idem(idempotencyKey) });
      return mapVoucher(data);
    } catch (e) {
      throw toError(e);
    }
  }

  static async update(workId: string, id: string, input: WorkVoucherInput & { rowVersion: string }): Promise<WorkVoucher> {
    try {
      const { data } = await worksApi.put(`${base(workId)}/${id}`, input, { headers: { 'If-Match': input.rowVersion } });
      return mapVoucher(data);
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

  static async uploadFile(
    workId: string,
    voucherId: string,
    file: File,
    opts: { idempotencyKey?: string; onProgress?: (pct: number) => void; signal?: AbortSignal } = {},
  ): Promise<VoucherFile> {
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await worksApi.post(`${base(workId)}/${voucherId}/files`, form, {
        headers: { 'Content-Type': undefined, ...idem(opts.idempotencyKey) },
        timeout: 120000,
        signal: opts.signal,
        onUploadProgress: (e) => {
          if (e.total) opts.onProgress?.(Math.min(99, Math.round((e.loaded / e.total) * 100)));
        },
      });
      opts.onProgress?.(100);
      return mapFile(data, voucherId);
    } catch (e) {
      throw toError(e);
    }
  }

  static async downloadFile(workId: string, voucherId: string, fileId: string): Promise<Blob> {
    try {
      const { data } = await worksApi.get<Blob>(`${base(workId)}/${voucherId}/files/${fileId}/download`, {
        responseType: 'blob',
        timeout: 120000,
      });
      return data;
    } catch (e) {
      throw toError(e);
    }
  }

  static async removeFile(workId: string, voucherId: string, fileId: string): Promise<void> {
    try {
      await worksApi.delete(`${base(workId)}/${voucherId}/files/${fileId}`);
    } catch (e) {
      throw toError(e);
    }
  }
}
