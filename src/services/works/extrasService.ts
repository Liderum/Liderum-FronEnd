import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { ExtraRequest, ExtraStatus } from '@/modules/shared/types';
import { mockStore, USE_MOCK, delay, genId, nowIso, getList, setList } from './mockStore';
import { WorksService } from './worksService';

// Mapeamento do enum ExtraRequestStatus do backend para ExtraStatus do frontend.
// Suporta string (com JsonStringEnumConverter) e inteiro (fallback).
const EXTRA_STATUS_MAP: Record<string, ExtraStatus> = {
  Pending: 'pendente', '1': 'pendente',
  InAnalysis: 'em_analise', '2': 'em_analise',
  AwaitingClient: 'em_analise', '3': 'em_analise',
  Approved: 'aprovado', '4': 'aprovado',
  Rejected: 'rejeitado', '5': 'rejeitado',
  Executed: 'aprovado', '6': 'aprovado',
};

// ExtraStatus do frontend → enum string do backend
const EXTRA_STATUS_TO_BACKEND: Record<ExtraStatus, string> = {
  pendente: 'Pending',
  em_analise: 'InAnalysis',
  aprovado: 'Approved',
  rejeitado: 'Rejected',
};

// Converte "3 dias" ou "3" → 3; retorna null para valores inválidos
function parseScheduleImpactDays(impact?: string): number | null {
  if (!impact) return null;
  const n = parseInt(impact, 10);
  return Number.isFinite(n) ? n : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapExtra(raw: any): ExtraRequest {
  return {
    id: String(raw.id ?? ''),
    workId: raw.workId ? String(raw.workId) : undefined,
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    financialImpact: Number(raw.amount ?? 0),
    scheduleImpact: raw.scheduleImpactDays != null ? `${raw.scheduleImpactDays} dias` : '0 dias',
    status: EXTRA_STATUS_MAP[String(raw.status)] ?? 'pendente',
    requestDate: raw.requestedAt ? String(raw.requestedAt).substring(0, 10) : '',
    requestedBy: String(raw.requestedBy ?? ''),
    approvedBy: raw.approvedBy ? String(raw.approvedBy) : undefined,
    history: Array.isArray(raw.history)
      ? raw.history.map((h: any) => ({
          date: h.occurredAt ? String(h.occurredAt).substring(0, 10) : '',
          action: String(h.actionLabel ?? h.action ?? ''),
          user: String(h.userId ?? ''),
          notes: h.notes ?? undefined,
        }))
      : [],
    attachments: Array.isArray(raw.attachments)
      ? raw.attachments.map((a: any) => String(a.storagePath ?? a.fileName ?? ''))
      : [],
    clientApprovalRequired: raw.clientApprovalSentAt != null,
    clientApprovalRequestedAt: raw.clientApprovalSentAt
      ? String(raw.clientApprovalSentAt).substring(0, 10)
      : undefined,
    clientApprovedAt: raw.clientDecisionAt
      ? String(raw.clientDecisionAt).substring(0, 10)
      : undefined,
    clientDecisionNote: raw.clientNote ?? undefined,
  };
}

const base = (workId: string) => `/works/${workId}/extras`;

export interface CreateExtraInput {
  title: string;
  description: string;
  scheduleImpact: string;
  financialImpact: number;
  requestedBy: string;
  clientApprovalRequired?: boolean;
  attachments?: string[];
}

export class ExtrasService {
  static async list(workId: string): Promise<ExtraRequest[]> {
    if (USE_MOCK) return delay([...getList('extras', workId)]);
    try {
      const { data } = await worksApi.get(base(workId));
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items.map(mapExtra);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async listAll(): Promise<ExtraRequest[]> {
    if (USE_MOCK) {
      const all: ExtraRequest[] = [];
      for (const key of Object.keys(mockStore.extras)) {
        all.push(...getList('extras', key));
      }
      return delay(all);
    }
    try {
      const { data } = await worksApi.get('/extras');
      const items = Array.isArray(data) ? data : data?.items ?? [];
      return items.map(mapExtra);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async create(workId: string, input: CreateExtraInput): Promise<ExtraRequest> {
    const now = nowIso();
    const created: ExtraRequest = {
      id: genId('e'),
      workId,
      title: input.title,
      description: input.description,
      requestDate: now.slice(0, 10),
      scheduleImpact: input.scheduleImpact,
      financialImpact: input.financialImpact,
      status: 'pendente',
      requestedBy: input.requestedBy,
      clientApprovalRequired: input.clientApprovalRequired ?? true,
      attachments: input.attachments ?? [],
      history: [
        {
          date: now,
          action: 'Solicitação criada',
          user: input.requestedBy,
        },
      ],
    };

    if (USE_MOCK) {
      const list = getList('extras', workId);
      setList<ExtraRequest>('extras', workId, [created, ...list]);
      return delay(created);
    }
    try {
      const { data } = await worksApi.post<any>(base(workId), {
        title: input.title,
        description: input.description,
        amount: input.financialImpact,
        scheduleImpactDays: parseScheduleImpactDays(input.scheduleImpact),
      });
      return mapExtra(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async transition(
    workId: string,
    extraId: string,
    to: ExtraStatus,
    user: string,
    note?: string,
  ): Promise<ExtraRequest> {
    if (USE_MOCK) {
      const list = getList('extras', workId);
      const idx = list.findIndex((e) => e.id === extraId);
      if (idx < 0) throw new Error('Extra não encontrado');
      const current = list[idx];
      const actionMap: Record<ExtraStatus, string> = {
        pendente: 'Reaberto',
        em_analise: 'Em análise',
        aprovado: 'Aprovado',
        rejeitado: 'Rejeitado',
      };
      const updated: ExtraRequest = {
        ...current,
        status: to,
        approvedBy: to === 'aprovado' ? user : current.approvedBy,
        history: [
          ...current.history,
          { date: nowIso(), action: actionMap[to], user, notes: note },
        ],
      };
      const next = [...list];
      next[idx] = updated;
      setList<ExtraRequest>('extras', workId, next);

      if (to === 'aprovado' && current.status !== 'aprovado') {
        await WorksService.addCost(workId, current.financialImpact, `Extra aprovado: ${current.title}`);
      }
      return delay(updated);
    }
    try {
      const { data } = await worksApi.patch<any>(
        `${base(workId)}/${extraId}/status`,
        { newStatus: EXTRA_STATUS_TO_BACKEND[to], rejectionReason: note ?? null },
      );
      return mapExtra(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async requestClientApproval(
    workId: string,
    extraId: string,
    user: string,
  ): Promise<ExtraRequest> {
    if (USE_MOCK) {
      const list = getList('extras', workId);
      const idx = list.findIndex((e) => e.id === extraId);
      if (idx < 0) throw new Error('Extra não encontrado');
      const updated: ExtraRequest = {
        ...list[idx],
        clientApprovalRequired: true,
        clientApprovalRequestedAt: nowIso(),
        history: [
          ...list[idx].history,
          { date: nowIso(), action: 'Enviado para aprovação do cliente', user },
        ],
      };
      const next = [...list];
      next[idx] = updated;
      setList<ExtraRequest>('extras', workId, next);
      return delay(updated);
    }
    try {
      const { data } = await worksApi.post<any>(
        `${base(workId)}/${extraId}/client-approval-request`,
        {},
      );
      return mapExtra(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async recordClientDecision(
    workId: string,
    extraId: string,
    decision: 'aprovado' | 'rejeitado',
    clientName: string,
    note?: string,
  ): Promise<ExtraRequest> {
    if (USE_MOCK) {
      const list = getList('extras', workId);
      const idx = list.findIndex((e) => e.id === extraId);
      if (idx < 0) throw new Error('Extra não encontrado');
      const current = list[idx];
      const updated: ExtraRequest = {
        ...current,
        status: decision,
        clientApprovedAt: nowIso(),
        clientApprovedBy: clientName,
        clientDecisionNote: note,
        history: [
          ...current.history,
          {
            date: nowIso(),
            action: decision === 'aprovado' ? 'Cliente aprovou' : 'Cliente rejeitou',
            user: clientName,
            notes: note,
          },
        ],
      };
      const next = [...list];
      next[idx] = updated;
      setList<ExtraRequest>('extras', workId, next);

      if (decision === 'aprovado' && current.status !== 'aprovado') {
        await WorksService.addCost(workId, current.financialImpact, `Extra aprovado: ${current.title}`);
      }
      return delay(updated);
    }
    try {
      // Backend espera ClientDecision enum: Approved=1, Rejected=2
      const backendDecision = decision === 'aprovado' ? 'Approved' : 'Rejected';
      const { data } = await worksApi.post<any>(
        `${base(workId)}/${extraId}/client-decision`,
        { clientName, decision: backendDecision, note, signatureUrl: null },
      );
      return mapExtra(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
