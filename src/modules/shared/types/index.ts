export type WorkStatus = 'em_andamento' | 'atrasada' | 'concluida' | 'pausada' | 'planejada';
export type ExtraStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'em_analise';
export type RiskLevel = 'baixo' | 'medio' | 'alto' | 'critico';
export type TaskStatus = 'concluida' | 'em_andamento' | 'pendente' | 'bloqueada' | 'atrasada';

export interface Work {
  id: string;
  name: string;
  client: string;
  responsible: string;
  currentStage: string;
  percentComplete: number;
  currentCost: number;
  plannedCost: number;
  deadline: string;
  startDate: string;
  status: WorkStatus;
  address?: string;
  riskLevel: RiskLevel;
  margin: number;
}

export interface ScheduleTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies: string[];
  responsible: string;
  status: TaskStatus;
  stage: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  plannedCost: number;
  actualCost: number;
}

export interface ExtraRequest {
  id: string;
  title: string;
  description: string;
  requestDate: string;
  scheduleImpact: string;
  financialImpact: number;
  status: ExtraStatus;
  requestedBy: string;
  approvedBy?: string;
  history: ExtraHistoryEntry[];
}

export interface ExtraHistoryEntry {
  date: string;
  action: string;
  user: string;
  notes?: string;
}

export interface DailyLogEntry {
  id: string;
  date: string;
  description: string;
  problems?: string;
  responsible: string;
  actions?: string;
  photos: string[];
  weather?: string;
  workersCount?: number;
}

export interface RiskAlert {
  id: string;
  workId: string;
  workName: string;
  type: 'prazo' | 'orcamento' | 'qualidade' | 'seguranca';
  message: string;
  severity: RiskLevel;
  date: string;
}

export interface FinancialDataPoint {
  month: string;
  previsto: number;
  realizado: number;
}

export interface WorkEvolutionPoint {
  month: string;
  concluidas: number;
  emAndamento: number;
  atrasadas: number;
}

export const STATUS_CONFIG: Record<WorkStatus, { label: string; color: string; bg: string }> = {
  em_andamento: { label: 'Em andamento', color: '#1E8449', bg: '#E8F5E9' },
  atrasada: { label: 'Atrasada', color: '#C0392B', bg: '#FDEDEC' },
  concluida: { label: 'Concluída', color: '#1A5276', bg: '#EBF5FB' },
  pausada: { label: 'Pausada', color: '#B7770D', bg: '#FFF8E1' },
  planejada: { label: 'Planejada', color: '#7A7670', bg: '#F5F5F5' },
};

export const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  baixo: { label: 'Baixo', color: '#1E8449', bg: '#E8F5E9' },
  medio: { label: 'Médio', color: '#B7770D', bg: '#FFF8E1' },
  alto: { label: 'Alto', color: '#E67E22', bg: '#FFF3E0' },
  critico: { label: 'Crítico', color: '#C0392B', bg: '#FDEDEC' },
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  concluida: { label: 'Concluída', color: '#1E8449', bg: '#E8F5E9' },
  em_andamento: { label: 'Em andamento', color: '#1A5276', bg: '#EBF5FB' },
  pendente: { label: 'Pendente', color: '#7A7670', bg: '#F5F5F5' },
  bloqueada: { label: 'Bloqueada', color: '#C0392B', bg: '#FDEDEC' },
  atrasada: { label: 'Atrasada', color: '#E67E22', bg: '#FFF3E0' },
};

export const EXTRA_STATUS_CONFIG: Record<ExtraStatus, { label: string; color: string; bg: string }> = {
  pendente: { label: 'Pendente', color: '#B7770D', bg: '#FFF8E1' },
  aprovado: { label: 'Aprovado', color: '#1E8449', bg: '#E8F5E9' },
  rejeitado: { label: 'Rejeitado', color: '#C0392B', bg: '#FDEDEC' },
  em_analise: { label: 'Em análise', color: '#1A5276', bg: '#EBF5FB' },
};
