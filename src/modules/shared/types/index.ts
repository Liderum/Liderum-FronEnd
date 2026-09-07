export type WorkStatus = 'em_andamento' | 'atrasada' | 'concluida' | 'pausada' | 'planejada' | 'cancelada';
export type ExtraStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'em_analise';
export type RiskLevel = 'baixo' | 'medio' | 'alto' | 'critico';
export type TaskStatus = 'concluida' | 'em_andamento' | 'pendente' | 'bloqueada' | 'atrasada';
export type IncidentSeverity = 'baixa' | 'media' | 'alta' | 'critica';
export type IncidentStatus = 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
export type IncidentCategory = 'execucao' | 'seguranca' | 'qualidade' | 'prazo' | 'fornecedor' | 'cliente';

export interface Work {
  id: string;
  name: string;
  description?: string;
  address: AddressDto | string;
  status: WorkStatus;
  statusLabel?: string;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  totalBudget: number;
  currentCost: number;
  margin: number;
  marginPercent?: number;
  customerId?: string;
  responsibleUserId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressDto {
  zipCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string | null;
}

export interface CreateWorkDto {
  name: string;
  description?: string | null;
  address: AddressDto;
  startDate: string;
  expectedEndDate?: string | null;
  totalBudget: number;
  customerId?: string | null;
  responsibleUserId?: string | null;
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
  // campos necessários para reconstruir o payload de atualização
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  budgetStatus?: string;
  revisionNumber?: number;
  revisedAt?: string;
  revisedBy?: string;
  note?: string;
}

export interface BudgetRevisionItem {
  id: string;
  category: string;
  description: string;
  plannedValue: number;
  actualValue: number;
  variance: number;
}

export interface BudgetRevision {
  id: string;
  workId: string;
  revisionNumber: number;
  reason: string;
  totalPlanned: number;
  totalActual: number;
  createdAt: string;
  createdBy: string;
  items: BudgetRevisionItem[];
}

export interface ExtraRequest {
  id: string;
  workId?: string;
  title: string;
  description: string;
  requestDate: string;
  scheduleImpact: string;
  financialImpact: number;
  status: ExtraStatus;
  requestedBy: string;
  approvedBy?: string;
  history: ExtraHistoryEntry[];
  clientApprovalRequired?: boolean;
  clientApprovalRequestedAt?: string;
  clientApprovedAt?: string;
  clientApprovedBy?: string;
  clientDecisionNote?: string;
  attachments?: string[];
}

export interface ExtraHistoryEntry {
  date: string;
  action: string;
  user: string;
  notes?: string;
}

export interface DailyLogOccurrence {
  id: string;
  description: string;
  responsible: string;
  deadline: string;
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
  occurrences?: DailyLogOccurrence[];
}

export interface Incident {
  id: string;
  workId: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  deadline?: string;
  resolvedAt?: string;
  resolution?: string;
  photos: string[];
  relatedTaskId?: string;
  relatedExtraId?: string;
  history: IncidentHistoryEntry[];
}

export interface IncidentHistoryEntry {
  date: string;
  action: string;
  user: string;
  notes?: string;
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
  cancelada: { label: 'Cancelada', color: '#6B6B6B', bg: '#EEEEEE' },
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

export const INCIDENT_SEVERITY_CONFIG: Record<IncidentSeverity, { label: string; color: string; bg: string }> = {
  baixa: { label: 'Baixa', color: '#1E8449', bg: '#E8F5E9' },
  media: { label: 'Média', color: '#B7770D', bg: '#FFF8E1' },
  alta: { label: 'Alta', color: '#E67E22', bg: '#FFF3E0' },
  critica: { label: 'Crítica', color: '#C0392B', bg: '#FDEDEC' },
};

export const INCIDENT_STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string; bg: string }> = {
  aberto: { label: 'Aberto', color: '#C0392B', bg: '#FDEDEC' },
  em_andamento: { label: 'Em andamento', color: '#1A5276', bg: '#EBF5FB' },
  resolvido: { label: 'Resolvido', color: '#1E8449', bg: '#E8F5E9' },
  cancelado: { label: 'Cancelado', color: '#7A7670', bg: '#F5F5F5' },
};

export const INCIDENT_CATEGORY_CONFIG: Record<IncidentCategory, { label: string; icon: string }> = {
  execucao: { label: 'Execução', icon: 'Hammer' },
  seguranca: { label: 'Segurança', icon: 'ShieldAlert' },
  qualidade: { label: 'Qualidade', icon: 'Award' },
  prazo: { label: 'Prazo', icon: 'Clock' },
  fornecedor: { label: 'Fornecedor', icon: 'Truck' },
  cliente: { label: 'Cliente', icon: 'User' },
};
