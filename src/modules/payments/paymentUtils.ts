import { PaymentStatus, type WorkPayment } from '@/modules/shared/types/payments';

export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_RECEIPT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];
export const ACCEPT_ATTR = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/jpeg,image/png,image/webp,image/heic';

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(v) ? v : 0);

/** YYYY-MM-DD → dd/MM/yyyy sem passar por Date (evita deslocamento de fuso). */
export function fmtDate(d?: string): string {
  if (!d) return '—';
  const [y, m, day] = d.substring(0, 10).split('-');
  return y && m && day ? `${day}/${m}/${y}` : '—';
}

export function todayYMD(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addMonthsYMD(ymd: string, months: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const target = new Date(y, m - 1 + months, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d, last));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${target.getFullYear()}-${p(target.getMonth() + 1)}-${p(target.getDate())}`;
}

/** Máscara de moeda do projeto (NewWorkPage/Materiais): só dígitos, centavos, pt-BR. */
export function maskMoney(value: string): string {
  const digits = value.replace(/D/g, '');
  if (!digits) return '';
  return (parseInt(digits, 10) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Aceita "1.234,56", "1234,56" e "1234.56". Retorna NaN se inválido. */
export function parseMoney(input: string): number {
  const s = input.trim().replace(/[R$\s]/g, '');
  if (!s) return NaN;
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
  return /^\d+(\.\d{1,2})?$/.test(normalized) ? Number(normalized) : NaN;
}

export function moneyToInput(v?: number): string {
  return v == null ? '' : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export type DisplayStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export function displayStatus(p: Pick<WorkPayment, 'status' | 'isOverdue'>): DisplayStatus {
  if (p.status === PaymentStatus.Paid) return 'paid';
  if (p.status === PaymentStatus.Cancelled) return 'cancelled';
  return p.isOverdue ? 'overdue' : 'pending';
}

export const STATUS_UI: Record<DisplayStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: '#9A6A00', bg: '#FFF6DD' },
  paid: { label: 'Pago', color: '#1E8449', bg: '#E8F5E9' },
  overdue: { label: 'Atrasado', color: '#C0392B', bg: '#FDEDEC' },
  cancelled: { label: 'Cancelado', color: '#7A7670', bg: '#EFEDE8' },
};

export function validateReceiptFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const okExt = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext);
  const okType = !file.type || ACCEPTED_RECEIPT_TYPES.includes(file.type);
  if (!okExt || !okType) return 'Tipo não suportado. Use PDF, JPG, PNG, WEBP ou HEIC.';
  if (file.size > MAX_RECEIPT_BYTES) return `Arquivo com ${fmtBytes(file.size)}; o limite é 10 MB.`;
  if (file.size === 0) return 'Arquivo vazio.';
  return null;
}

export const isImage = (ct: string) => ct.startsWith('image/') && !/hei[cf]/i.test(ct);
export const isPdf = (ct: string) => ct === 'application/pdf';

export const qk = {
  all: (workId: string) => ['work-payments', workId] as const,
  list: (workId: string, filters: unknown) => ['work-payments', workId, 'list', filters] as const,
  lists: (workId: string) => ['work-payments', workId, 'list'] as const,
  summary: (workId: string) => ['work-payments', workId, 'summary'] as const,
  detail: (workId: string, id: string) => ['work-payments', workId, 'detail', id] as const,
};
