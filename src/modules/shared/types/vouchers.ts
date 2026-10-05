// Compras e serviços da obra com comprovante (contrato vouchers v2)
import type { PagedResult, PaymentReceipt } from './payments';

export const VoucherCategory = { MaterialPurchase: 1, Service: 2, Other: 3 } as const;

export const VOUCHER_CATEGORY_LABEL: Record<number, string> = {
  1: 'Material',
  2: 'Serviço',
  3: 'Outro',
};

/** Mesmo formato do comprovante de recebimento; paymentId carrega o id do voucher. */
export type VoucherFile = PaymentReceipt;

export interface WorkVoucher {
  id: string;
  workId: string;
  category: number;
  description: string;
  amount: number;
  occurredOn: string; // YYYY-MM-DD
  supplierName?: string;
  documentNumber?: string;
  method?: number;
  notes?: string;
  incidentId?: string;
  incidentTitle?: string;
  fileCount: number;
  files: VoucherFile[];
  rowVersion: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkVoucherSummary {
  workId: string;
  totalSpent: number;
  count: number;
  byCategory: { category: number; total: number; count: number }[];
}

export type VoucherSort = 'occurredOn' | '-occurredOn' | 'amount' | '-amount';

export interface WorkVoucherFilters {
  category?: number;
  from?: string;
  to?: string;
  search?: string;
  incidentId?: string;
  hasFile?: boolean;
  page?: number;
  pageSize?: number;
  sort?: VoucherSort;
}

export interface WorkVoucherInput {
  category: number;
  description: string;
  amount: number;
  occurredOn: string;
  supplierName?: string;
  documentNumber?: string;
  method?: number;
  notes?: string;
  incidentId?: string;
}

export type VoucherPage = PagedResult<WorkVoucher>;
