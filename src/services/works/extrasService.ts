import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type { ExtraRequest, ExtraStatus } from '@/modules/shared/types';
import { mockStore, USE_MOCK, delay, genId, nowIso, getList, setList } from './mockStore';
import { WorksService } from './worksService';

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
      const { data } = await worksApi.get<ExtraRequest[]>(base(workId));
      return data;
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
      const { data } = await worksApi.get<ExtraRequest[]>('/extras');
      return data;
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
      const { data } = await worksApi.post<ExtraRequest>(base(workId), created);
      return data;
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
      const { data } = await worksApi.patch<ExtraRequest>(
        `${base(workId)}/${extraId}/status`,
        { newStatus: to, note },
      );
      return data;
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
      const { data } = await worksApi.post<ExtraRequest>(
        `${base(workId)}/${extraId}/client-approval-request`,
        {},
      );
      return data;
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
      const { data } = await worksApi.post<ExtraRequest>(
        `${base(workId)}/${extraId}/client-decision`,
        { decision, clientName, note },
      );
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
