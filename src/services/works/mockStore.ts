import {
  mockWorks,
  mockScheduleTasks,
  mockBudgetItems,
  mockExtras,
  mockDailyLogs,
} from '@/modules/shared/data/mockData';
import type {
  Work,
  ScheduleTask,
  BudgetItem,
  BudgetRevision,
  ExtraRequest,
  DailyLogEntry,
  Incident,
} from '@/modules/shared/types';

type WorkScoped<T> = Record<string, T[]>;

function seedPerWork<T>(base: T[], workId: string = '1'): WorkScoped<T> {
  return { [workId]: [...base] };
}

export const mockStore = {
  works: [...mockWorks] as Work[],
  schedule: seedPerWork<ScheduleTask>(mockScheduleTasks) as WorkScoped<ScheduleTask>,
  budget: seedPerWork<BudgetItem>(mockBudgetItems) as WorkScoped<BudgetItem>,
  budgetRevisions: {} as WorkScoped<BudgetRevision>,
  extras: {
    '1': mockExtras.filter((e) => ['e1', 'e2'].includes(e.id)).map((e) => ({ ...e, workId: '1' })),
    '2': mockExtras.filter((e) => e.id === 'e3').map((e) => ({ ...e, workId: '2' })),
    '3': mockExtras.filter((e) => e.id === 'e4').map((e) => ({ ...e, workId: '3' })),
  } as WorkScoped<ExtraRequest>,
  dailyLogs: seedPerWork<DailyLogEntry>(mockDailyLogs) as WorkScoped<DailyLogEntry>,
  incidents: {} as WorkScoped<Incident>,
};

export function getList<K extends keyof typeof mockStore>(
  area: K,
  workId: string,
): (typeof mockStore)[K] extends WorkScoped<infer T> ? T[] : never {
  const bucket = mockStore[area] as unknown as WorkScoped<unknown>;
  if (!bucket[workId]) bucket[workId] = [];
  return bucket[workId] as never;
}

export function setList<T>(
  area: Exclude<keyof typeof mockStore, 'works'>,
  workId: string,
  next: T[],
): void {
  (mockStore[area] as unknown as WorkScoped<T>)[workId] = next;
}

export function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK ?? 'true').toString().toLowerCase() !== 'false';

export function nowIso(): string {
  return new Date().toISOString();
}

export function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
