// Pagamentos da obra + comprovantes (contrato WorkPayments)

export const PaymentType = { Deposit: 1, Installment: 2, Final: 3, Other: 4 } as const;
export type PaymentTypeValue = (typeof PaymentType)[keyof typeof PaymentType];

export const PaymentStatus = { Pending: 1, Paid: 2, Cancelled: 3 } as const;
export type PaymentStatusValue = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = { Pix: 1, BankTransfer: 2, Cash: 3, Check: 4, Card: 5, Other: 6 } as const;
export type PaymentMethodValue = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PAYMENT_TYPE_LABEL: Record<number, string> = {
  1: 'Sinal',
  2: 'Parcela',
  3: 'Final',
  4: 'Outro',
};

export const PAYMENT_METHOD_LABEL: Record<number, string> = {
  1: 'Pix',
  2: 'Transferência',
  3: 'Dinheiro',
  4: 'Cheque',
  5: 'Cartão',
  6: 'Outro',
};

export interface PaymentReceipt {
  id: string;
  paymentId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt?: string;
}

export interface WorkPayment {
  id: string;
  workId: string;
  type: number;
  description?: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paidAt?: string; // YYYY-MM-DD
  paidAmount?: number;
  method?: number;
  status: number;
  isOverdue: boolean;
  notes?: string;
  receiptCount: number;
  receipts: PaymentReceipt[];
  rowVersion: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkPaymentSummary {
  workId: string;
  contractAmount: number;
  totalScheduled: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  remainingToSchedule: number;
  percentPaid: number;
  percentScheduled: number;
  paymentsCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  nextDue: { id: string; dueDate: string; amount: number } | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type PaymentSort = 'dueDate' | '-dueDate' | 'amount' | '-amount';

export interface WorkPaymentFilters {
  status?: number;
  type?: number;
  from?: string;
  to?: string;
  search?: string;
  hasReceipt?: boolean;
  page?: number;
  pageSize?: number;
  sort?: PaymentSort;
}

export interface CreateWorkPaymentInput {
  type: number;
  description?: string;
  amount?: number;
  percentOfContract?: number;
  dueDate: string;
  paidAt?: string;
  paidAmount?: number;
  method?: number;
  notes?: string;
  markAsPaid?: boolean;
}

export interface UpdateWorkPaymentInput {
  type: number;
  description?: string;
  amount: number;
  dueDate: string;
  method?: number;
  notes?: string;
  rowVersion: string;
}

export interface MarkPaidInput {
  paidAt: string;
  paidAmount?: number;
  method: number;
}
