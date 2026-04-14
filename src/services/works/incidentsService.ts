import { worksApi } from '@/services/api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import type {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from '@/modules/shared/types';
import { mockStore, USE_MOCK, delay, genId, nowIso, getList, setList } from './mockStore';

// Mapeamentos de enum do backend (string com JsonStringEnumConverter ou inteiro como fallback)
const INCIDENT_STATUS_MAP: Record<string, IncidentStatus> = {
  Aberto: 'aberto', Open: 'aberto', '1': 'aberto',
  EmAndamento: 'em_andamento', InProgress: 'em_andamento', '2': 'em_andamento',
  Resolvido: 'resolvido', Resolved: 'resolvido', '3': 'resolvido',
  Cancelado: 'cancelado', Cancelled: 'cancelado', '4': 'cancelado',
};

const INCIDENT_STATUS_TO_BACKEND: Record<IncidentStatus, string> = {
  aberto: 'Aberto',
  em_andamento: 'EmAndamento',
  resolvido: 'Resolvido',
  cancelado: 'Cancelado',
};

const INCIDENT_SEVERITY_MAP: Record<string, IncidentSeverity> = {
  Baixa: 'baixa', Low: 'baixa', '1': 'baixa',
  Media: 'media', Medium: 'media', '2': 'media',
  Alta: 'alta', High: 'alta', '3': 'alta',
  Critica: 'critica', Critical: 'critica', '4': 'critica',
};

const INCIDENT_SEVERITY_TO_BACKEND: Record<IncidentSeverity, string> = {
  baixa: 'Baixa',
  media: 'Media',
  alta: 'Alta',
  critica: 'Critica',
};

const INCIDENT_CATEGORY_MAP: Record<string, IncidentCategory> = {
  Execucao: 'execucao', Execution: 'execucao', '1': 'execucao',
  Seguranca: 'seguranca', Safety: 'seguranca', '2': 'seguranca',
  Qualidade: 'qualidade', Quality: 'qualidade', '3': 'qualidade',
  Prazo: 'prazo', Deadline: 'prazo', '4': 'prazo',
  Fornecedor: 'fornecedor', Supplier: 'fornecedor', '5': 'fornecedor',
  Cliente: 'cliente', Client: 'cliente', '6': 'cliente',
};

const INCIDENT_CATEGORY_TO_BACKEND: Record<IncidentCategory, string> = {
  execucao: 'Execucao',
  seguranca: 'Seguranca',
  qualidade: 'Qualidade',
  prazo: 'Prazo',
  fornecedor: 'Fornecedor',
  cliente: 'Cliente',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapIncident(raw: any): Incident {
  return {
    id: String(raw.id ?? ''),
    workId: String(raw.workId ?? ''),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    category: INCIDENT_CATEGORY_MAP[String(raw.category)] ?? 'execucao',
    severity: INCIDENT_SEVERITY_MAP[String(raw.severity)] ?? 'baixa',
    status: INCIDENT_STATUS_MAP[String(raw.status)] ?? 'aberto',
    reportedBy: String(raw.reportedBy ?? ''),
    reportedAt: raw.reportedAt ? String(raw.reportedAt).substring(0, 10) : '',
    assignedTo: raw.assignedTo ? String(raw.assignedTo) : undefined,
    resolvedAt: raw.resolvedAt ? String(raw.resolvedAt).substring(0, 10) : undefined,
    resolution: raw.resolution ?? undefined,
    relatedTaskId: raw.relatedTaskId ? String(raw.relatedTaskId) : undefined,
    relatedExtraId: raw.relatedExtraId ? String(raw.relatedExtraId) : undefined,
    photos: Array.isArray(raw.photos)
      ? raw.photos.map((p: any) => String(p.storagePath ?? p.fileName ?? ''))
      : [],
    history: Array.isArray(raw.history)
      ? raw.history.map((h: any) => ({
          date: h.occurredAt ? String(h.occurredAt).substring(0, 10) : '',
          action: String(h.actionLabel ?? h.action ?? ''),
          user: String(h.userId ?? ''),
          notes: h.notes ?? undefined,
        }))
      : [],
  };
}

const base = (workId: string) => `/works/${workId}/incidents`;

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
        const { data } = await worksApi.get(base(workId), { params: filter });
        const raw = Array.isArray(data) ? data : data?.items ?? [];
        items = raw.map(mapIncident);
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
      const { data } = await worksApi.get('/incidents');
      const raw = Array.isArray(data) ? data : data?.items ?? [];
      return raw.map(mapIncident);
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
      const { data } = await worksApi.post<any>(base(workId), {
        title: input.title,
        description: input.description,
        category: INCIDENT_CATEGORY_TO_BACKEND[input.category],
        severity: INCIDENT_SEVERITY_TO_BACKEND[input.severity],
        assignedTo: input.assignedTo ?? null,
        relatedTaskId: input.relatedTaskId ?? null,
        relatedExtraId: input.relatedExtraId ?? null,
      });
      return mapIncident(data);
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
      const { data } = await worksApi.patch<any>(
        `${base(workId)}/${incidentId}/status`,
        {
          newStatus: INCIDENT_STATUS_TO_BACKEND[to],
          resolution: to === 'resolvido' ? note : null,
          notes: note,
        },
      );
      return mapIncident(data);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }
}
