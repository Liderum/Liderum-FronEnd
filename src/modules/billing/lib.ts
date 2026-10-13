import type { CheckoutStatus } from '@/services/billing';
import { isTerminalStatus } from '@/services/billing';

export const MAX_POLL_MS = 10 * 60 * 1000;

/**
 * Backoff do polling de checkout: 2s nos primeiros 10s, 5s até 30s, 10s depois; para em estado
 * terminal ou ao passar de 10 min (teto). `false` = TanStack Query para de refazer a consulta.
 */
export function nextPollInterval(opts: { status?: CheckoutStatus; elapsedMs: number }): number | false {
  if (opts.status && isTerminalStatus(opts.status)) return false;
  if (opts.elapsedMs >= MAX_POLL_MS) return false;
  if (opts.elapsedMs < 10_000) return 2_000;
  if (opts.elapsedMs < 30_000) return 5_000;
  return 10_000;
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatBRL = (cents: number) => brl.format(cents / 100);
export const formatBRLCompact = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(cents / 100);
export const formatPercent = (ratio: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(ratio || 0);
export const formatDate = (d: Date | null) =>
  d ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d) : '—';
export const formatDateTime = (d: Date | null) =>
  d ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d) : '—';

export function bannerMessage(days: number, graceEndsAt: Date | null): string {
  if (days > 1) return `Sua assinatura vence em ${days} dias.`;
  if (days === 1) return 'Sua assinatura vence amanhã.';
  if (days === 0) return 'Sua assinatura vence hoje.';
  const ago = Math.abs(days);
  const base = `Sua assinatura venceu há ${ago} ${ago === 1 ? 'dia' : 'dias'}.`;
  return graceEndsAt ? `${base} O acesso é mantido até ${formatDate(graceEndsAt)}.` : base;
}
