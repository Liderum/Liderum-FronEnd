import { managementApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from '@/modules/shared/types';
import { mockStore, USE_MOCK, delay, genId, nowIso, getList, setList } from './mockStore';

const base = (workId: string) => `/liderum/api/works/${workId}/incidents`;

export interface CreateIncidentInput {
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  reportedBy: string;
  assignedTo?: string;
  photos?: string[];
  relatedTaskId?: string;
  relatedExtraId?: string;
}

export interface IncidentFilter {
  category?: IncidentCategory;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  search?: string;
}

export class IncidentsService {
  static async list(workId: string, filter?: IncidentFilter): Promise<Incident[]> {
    let items: Incident[];
    if (USE_MOCK) {
      items = [...getList('incidents', workId)];
    } else {
      try {
        const { data } = await managementApi.get<Incident[]>(base(workId), { params: filter });
        items = data;
      } catch (error) {
        throw new Error(extractErrorMessage(error));
      }
    }

    if (filter) {
      if (filter.category) items = items.filter((i) => i.category === filter.category);
      if (filter.severity) items = items.filter((i) => i.severity === filter.severity);
      if (filter.status) items = items.filter((i) => i.status === filter.status);
      if (filter.search) {
        const q = filter.search.toLowerCase();
        items = items.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q),
        );
      }
    }

    items.sort((a, b) => (a.reportedAt < b.reportedAt ? 1 : -1));
    return USE_MOCK ? delay(items) : items;
  }

  static async listAll(): Promise<Incident[]> {
    if (USE_MOCK) {
      const all: Incident[] = [];
      for (const key of Object.keys(mockStore.incidents)) {
        all.push(...getList('incidents', key));
      }
      return delay(all);
    }
    try {
      const { data } = await managementApi.get<Incident[]>('/liderum/api/incidents');
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async create(workId: string, input: CreateIncidentInput): Promise<Incident> {
    const now = nowIso();
    const created: Incident = {
      id: genId('inc'),
      workId,
      title: input.title,
      description: input.description,
      category: input.category,
      severity: input.severity,
      status: 'aberto',
      reportedBy: input.reportedBy,
      reportedAt: now,
      assignedTo: input.assignedTo,
      photos: input.photos ?? [],
      relatedTaskId: input.relatedTaskId,
      relatedExtraId: input.relatedExtraId,
      history: [
        { date: now, action: 'Incidente registrado', user: input.reportedBy },
      ],
    };

    if (USE_MOCK) {
      const list = getList('incidents', workId);
      setList<Incident>('incidents', workId, [created, ...list]);
      return delay(created);
    }
    try {
      const { data } = await managementApi.post<Incident>(base(workId), created);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static async transition(
    workId: string,
    incidentId: string,
    to: IncidentStatus,
    user: string,
    note?: string,
  ): Promise<Incident> {
    if (USE_MOCK) {
      const list = getList('incidents', workId);
      const idx = list.findIndex((i) => i.id === incidentId);
      if (idx < 0) throw new Error('Incidente não encontrado');
      const current = list[idx];
      const updated: Incident = {
        ...current,
        status: to,
        resolvedAt: to === 'resolvido' ? nowIso() : current.resolvedAt,
        resolution: to === 'resolvido' ? note ?? current.resolution : current.resolution,
        history: [
          ...current.history,
          { date: nowIso(), action: `Status alterado para ${to}`, user, notes: note },
        ],
      };
      const next = [...list];
      next[idx] = updated;
      setList<Incident>('incidents', workId, next);
      return delay(updated);
    }
    try {
      const { data } = await managementApi.post<Incident>(
        `${base(workId)}/${incidentId}/transition`,
        { to, note },
      );
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
