import type { QueryClient } from '@tanstack/react-query';
import { WorkPaymentsService } from '@/services/works/workPaymentsService';
import { WorkVouchersService } from '@/services/works/workVouchersService';
import type { PagedResult, PaymentReceipt, WorkPayment } from '@/modules/shared/types/payments';
import type { WorkVoucher } from '@/modules/shared/types/vouchers';
import { qk } from './paymentUtils';

/** Abstrai de onde vêm/para onde vão os arquivos, para reaproveitar o ReceiptsDialog. */
export interface FilesAdapter {
  filesKey: (id: string) => readonly unknown[];
  listsKey: readonly unknown[];
  fetchFiles: (id: string) => Promise<PaymentReceipt[]>;
  upload: (
    id: string,
    file: File,
    opts: { idempotencyKey?: string; onProgress?: (pct: number) => void; signal?: AbortSignal },
  ) => Promise<PaymentReceipt>;
  download: (id: string, fileId: string) => Promise<Blob>;
  remove: (id: string, fileId: string) => Promise<void>;
  adjustListCount?: (qc: QueryClient, id: string, delta: number) => void;
}

export const vk = {
  all: (workId: string) => ['work-vouchers', workId] as const,
  lists: (workId: string) => ['work-vouchers', workId, 'list'] as const,
  list: (workId: string, filters: unknown) => ['work-vouchers', workId, 'list', filters] as const,
  summaries: (workId: string) => ['work-vouchers', workId, 'summary'] as const,
  summary: (workId: string, range: unknown) => ['work-vouchers', workId, 'summary', range] as const,
  files: (workId: string, id: string) => ['work-vouchers', workId, 'files', id] as const,
};

export function paymentsAdapter(workId: string): FilesAdapter {
  return {
    filesKey: (id) => ['work-payments', workId, 'files', id],
    listsKey: qk.lists(workId),
    fetchFiles: async (id) => (await WorkPaymentsService.getById(workId, id)).receipts,
    upload: (id, file, opts) => WorkPaymentsService.uploadReceipt(workId, id, file, opts),
    download: (id, fileId) => WorkPaymentsService.downloadReceipt(workId, id, fileId),
    remove: (id, fileId) => WorkPaymentsService.removeReceipt(workId, id, fileId),
    adjustListCount: (qc, id, delta) =>
      qc.setQueriesData<PagedResult<WorkPayment>>({ queryKey: qk.lists(workId) }, (l) =>
        l ? { ...l, items: l.items.map((p) => (p.id === id ? { ...p, receiptCount: Math.max(0, p.receiptCount + delta) } : p)) } : l),
  };
}

export function vouchersAdapter(workId: string): FilesAdapter {
  return {
    filesKey: (id) => vk.files(workId, id),
    listsKey: vk.lists(workId),
    fetchFiles: async (id) => (await WorkVouchersService.getById(workId, id)).files,
    upload: (id, file, opts) => WorkVouchersService.uploadFile(workId, id, file, opts),
    download: (id, fileId) => WorkVouchersService.downloadFile(workId, id, fileId),
    remove: (id, fileId) => WorkVouchersService.removeFile(workId, id, fileId),
    adjustListCount: (qc, id, delta) =>
      qc.setQueriesData<PagedResult<WorkVoucher>>({ queryKey: vk.lists(workId) }, (l) =>
        l ? { ...l, items: l.items.map((p) => (p.id === id ? { ...p, fileCount: Math.max(0, p.fileCount + delta) } : p)) } : l),
  };
}
