import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import type { Granularity } from '@/services/billing';

export type PeriodKey = '7d' | '30d' | '90d' | '12m';

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
  { key: '12m', label: '12 meses' },
];

export function periodRange(key: PeriodKey, ref = new Date()): { from: Date; to: Date } {
  const to = endOfDay(ref);
  switch (key) {
    case '7d': return { from: startOfDay(subDays(ref, 6)), to };
    case '30d': return { from: startOfDay(subDays(ref, 29)), to };
    case '90d': return { from: startOfDay(subDays(ref, 89)), to };
    case '12m': return { from: startOfDay(subMonths(ref, 12)), to };
  }
}

export function granularityFor(key: PeriodKey): Granularity {
  if (key === '7d' || key === '30d') return 'day';
  if (key === '90d') return 'week';
  return 'month';
}

/** Variação relativa vs. período anterior; `null` quando não há base de comparação. */
export function deltaRatio(current: number, previous: number | undefined | null): number | null {
  if (previous === undefined || previous === null || previous === 0) return null;
  return (current - previous) / previous;
}
