import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Plus, Filter, ChevronDown, ChevronUp, X, CheckCircle2, User, Search,
} from 'lucide-react';
import { IncidentsService, ScheduleService, ExtrasService } from '@/services/works';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Incident, IncidentCategory, IncidentSeverity, IncidentStatus, ScheduleTask, ExtraRequest,
} from '@/modules/shared/types';
import {
  INCIDENT_CATEGORY_CONFIG, INCIDENT_SEVERITY_CONFIG, INCIDENT_STATUS_CONFIG,
} from '@/modules/shared/types';

const CSS = `
.inc{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.inc-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;}
.inc-stat{background:#fff;border-radius:10px;border:1px solid rgba(26,24,20,0.1);padding:16px 18px;display:flex;align-items:center;gap:12px;}
.inc-stat-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;}
.inc-stat-val{font-family:var(--font-numeric);font-size:20px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;}
.inc-stat-label{font-size:10.5px;color:#7A7670;text-transform:uppercase;letter-spacing:0.3px;font-weight:500;}
.inc-toolbar{background:#fff;border-radius:10px;border:1px solid rgba(26,24,20,0.08);padding:12px 16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;}
.inc-select{padding:6px 10px;border-radius:6px;border:1px solid rgba(26,24,20,0.12);font-size:12px;font-family:'DM Sans',sans-serif;background:#fff;}
.inc-search{padding:6px 10px 6px 32px;border-radius:6px;border:1px solid rgba(26,24,20,0.12);font-size:12px;font-family:'DM Sans',sans-serif;min-width:200px;}
.inc-search-wrap{position:relative;}
.inc-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;}
.inc-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid rgba(26,24,20,0.12);background:#fff;color:var(--ink);font-family:'DM Sans',sans-serif;}
.inc-btn:hover{background:var(--cream);}
.inc-btn.primary{background:var(--gold);color:#fff;border-color:var(--gold);}
.inc-btn.primary:hover{background:#a07e1f;}
.inc-btn.approve{background:#1E8449;color:#fff;border-color:#1E8449;}
.inc-btn:disabled{opacity:0.5;cursor:not-allowed;}
.inc-card{background:#fff;border-radius:12px;border:1px solid rgba(26,24,20,0.1);overflow:hidden;box-shadow:0 2px 10px rgba(26,24,20,0.04);}
.inc-card-main{padding:18px 22px;cursor:pointer;}
.inc-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
.inc-card-title{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;line-height:1.2;flex:1;}
.inc-card-badges{display:flex;gap:6px;flex-shrink:0;align-items:center;}
.inc-badge{padding:3px 10px;border-radius:14px;font-size:10.5px;font-weight:500;white-space:nowrap;}
.inc-card-desc{font-size:12.5px;color:#7A7670;margin-top:8px;line-height:1.55;}
.inc-card-meta{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:11.5px;color:#7A7670;}
.inc-card-history{border-top:1px solid rgba(26,24,20,0.06);padding:14px 22px;background:var(--cream);}
.inc-history-title{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#7A7670;margin-bottom:8px;}
.inc-history-item{padding:6px 0;font-size:12px;display:flex;gap:10px;border-top:1px solid rgba(26,24,20,0.04);}
.inc-history-item:first-child{border-top:none;}
.inc-history-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);margin-top:6px;flex-shrink:0;}
.inc-card-actions{display:flex;gap:8px;padding:12px 22px;border-top:1px solid rgba(26,24,20,0.06);background:#fafaf7;flex-wrap:wrap;}
.inc-modal{position:fixed;inset:0;background:rgba(26,24,20,0.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;}
.inc-modal-card{background:#fff;border-radius:14px;max-width:560px;width:100%;padding:24px;max-height:92vh;overflow-y:auto;}
.inc-modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;margin-bottom:16px;}
.inc-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#7A7670;margin-bottom:6px;display:block;}
.inc-input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;margin-bottom:14px;box-sizing:border-box;}
.inc-textarea{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;min-height:80px;box-sizing:border-box;resize:vertical;margin-bottom:14px;}
`;

const emptyForm = {
  title: '',
  description: '',
  category: 'execucao' as IncidentCategory,
  severity: 'media' as IncidentSeverity,
  assignedTo: '',
  relatedTaskId: '',
  relatedExtraId: '',
};

export default function IncidentsPage() {
  const { id } = useParams();
  const workId = id ?? '1';
  const { permissions, user } = useAuth();
  const canCreate = permissions.includes('daily-log.create');
  const canUpdate = permissions.includes('daily-log.update');

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [extras, setExtras] = useState<ExtraRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterCategory, setFilterCategory] = useState<IncidentCategory | ''>('');
  const [filterSeverity, setFilterSeverity] = useState<IncidentSeverity | ''>('');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | ''>('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      IncidentsService.list(workId),
      ScheduleService.list(workId),
      ExtrasService.list(workId),
    ])
      .then(([inc, t, ex]) => {
        if (!active) return;
        setIncidents(inc);
        setTasks(t);
        setExtras(ex);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [workId]);

  const filtered = useMemo(
    () =>
      incidents.filter((i) => {
        if (filterCategory && i.category !== filterCategory) return false;
        if (filterSeverity && i.severity !== filterSeverity) return false;
        if (filterStatus && i.status !== filterStatus) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!i.title.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) {
            return false;
          }
        }
        return true;
      }),
    [incidents, filterCategory, filterSeverity, filterStatus, search],
  );

  const openCount = incidents.filter((i) => i.status === 'aberto').length;
  const inProgressCount = incidents.filter((i) => i.status === 'em_andamento').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolvido').length;
  const criticalOpen = incidents.filter((i) => i.severity === 'critica' && i.status !== 'resolvido').length;

  const toggle = (iid: string) =>
    setExpanded((p) => (p.includes(iid) ? p.filter((x) => x !== iid) : [...p, iid]));

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    const created = await IncidentsService.create(workId, {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      severity: form.severity,
      reportedBy: user?.name ?? user?.email ?? 'usuário',
      assignedTo: form.assignedTo.trim() || undefined,
      relatedTaskId: form.relatedTaskId || undefined,
      relatedExtraId: form.relatedExtraId || undefined,
    });
    setIncidents((prev) => [created, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const doTransition = async (incident: Incident, to: IncidentStatus, note?: string) => {
    setBusyId(incident.id);
    try {
      const updated = await IncidentsService.transition(
        workId,
        incident.id,
        to,
        user?.name ?? user?.email ?? 'usuário',
        note,
      );
      setIncidents((prev) => prev.map((i) => (i.id === incident.id ? updated : i)));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#7A7670' }}>Carregando incidentes…</div>;
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="inc">
        <div className="inc-summary">
          <div className="inc-stat">
            <div className="inc-stat-icon" style={{ background: '#FDEDEC' }}>
              <ShieldAlert size={16} color="#C0392B" />
            </div>
            <div>
              <div className="inc-stat-val">{openCount}</div>
              <div className="inc-stat-label">Abertos</div>
            </div>
          </div>
          <div className="inc-stat">
            <div className="inc-stat-icon" style={{ background: '#EBF5FB' }}>
              <ShieldAlert size={16} color="#1A5276" />
            </div>
            <div>
              <div className="inc-stat-val">{inProgressCount}</div>
              <div className="inc-stat-label">Em andamento</div>
            </div>
          </div>
          <div className="inc-stat">
            <div className="inc-stat-icon" style={{ background: '#E8F5E9' }}>
              <CheckCircle2 size={16} color="#1E8449" />
            </div>
            <div>
              <div className="inc-stat-val">{resolvedCount}</div>
              <div className="inc-stat-label">Resolvidos</div>
            </div>
          </div>
          <div className="inc-stat">
            <div className="inc-stat-icon" style={{ background: '#FFF3E0' }}>
              <ShieldAlert size={16} color="#E67E22" />
            </div>
            <div>
              <div className="inc-stat-val">{criticalOpen}</div>
              <div className="inc-stat-label">Críticos pendentes</div>
            </div>
          </div>
        </div>

        <div className="inc-toolbar">
          <Filter size={14} color="#7A7670" />
          <div className="inc-search-wrap">
            <Search className="inc-search-icon" size={13} color="#7A7670" />
            <input
              className="inc-search"
              placeholder="Buscar título ou descrição"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="inc-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as IncidentCategory | '')}>
            <option value="">Todas categorias</option>
            {Object.entries(INCIDENT_CATEGORY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select className="inc-select" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value as IncidentSeverity | '')}>
            <option value="">Todas severidades</option>
            {Object.entries(INCIDENT_SEVERITY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select className="inc-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | '')}>
            <option value="">Todos status</option>
            {Object.entries(INCIDENT_STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <div style={{ flex: 1 }} />
          {canCreate && (
            <button className="inc-btn primary" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Registrar incidente
            </button>
          )}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#7A7670', background: '#fff', borderRadius: 12, border: '1px solid rgba(26,24,20,0.08)' }}>
            Nenhum incidente registrado.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((incident, i) => {
            const sevCfg = INCIDENT_SEVERITY_CONFIG[incident.severity];
            const statCfg = INCIDENT_STATUS_CONFIG[incident.status];
            const catCfg = INCIDENT_CATEGORY_CONFIG[incident.category];
            const isOpen = expanded.includes(incident.id);
            const isBusy = busyId === incident.id;
            const relatedTask = incident.relatedTaskId ? tasks.find((t) => t.id === incident.relatedTaskId) : null;
            const relatedExtra = incident.relatedExtraId ? extras.find((e) => e.id === incident.relatedExtraId) : null;
            return (
              <motion.div
                key={incident.id}
                className="inc-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="inc-card-main" onClick={() => toggle(incident.id)}>
                  <div className="inc-card-top">
                    <div className="inc-card-title">{incident.title}</div>
                    <div className="inc-card-badges">
                      <span className="inc-badge" style={{ background: sevCfg.bg, color: sevCfg.color }}>
                        ● {sevCfg.label}
                      </span>
                      <span className="inc-badge" style={{ background: statCfg.bg, color: statCfg.color }}>
                        {statCfg.label}
                      </span>
                      {isOpen ? <ChevronUp size={14} color="#7A7670" /> : <ChevronDown size={14} color="#7A7670" />}
                    </div>
                  </div>
                  <div className="inc-card-desc">{incident.description}</div>
                  <div className="inc-card-meta">
                    <span>{catCfg.label}</span>
                    <span><User size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {incident.reportedBy}</span>
                    <span>{new Date(incident.reportedAt).toLocaleDateString('pt-BR')}</span>
                    {incident.assignedTo && <span>Atribuído: {incident.assignedTo}</span>}
                    {relatedTask && <span>Tarefa: {relatedTask.name}</span>}
                    {relatedExtra && <span>Extra: {relatedExtra.title}</span>}
                  </div>
                </div>

                {canUpdate && incident.status !== 'resolvido' && incident.status !== 'cancelado' && (
                  <div className="inc-card-actions" onClick={(e) => e.stopPropagation()}>
                    {incident.status === 'aberto' && (
                      <button className="inc-btn" disabled={isBusy} onClick={() => doTransition(incident, 'em_andamento')}>
                        Iniciar tratativa
                      </button>
                    )}
                    <button className="inc-btn approve" disabled={isBusy} onClick={() => {
                      const note = prompt('Descrição da resolução (opcional):') ?? undefined;
                      doTransition(incident, 'resolvido', note ?? undefined);
                    }}>
                      <CheckCircle2 size={12} /> Resolver
                    </button>
                    <button className="inc-btn" disabled={isBusy} onClick={() => doTransition(incident, 'cancelado')}>
                      Cancelar
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="inc-card-history">
                        <div className="inc-history-title">Histórico</div>
                        {incident.history.map((h, hi) => (
                          <div key={hi} className="inc-history-item">
                            <div className="inc-history-dot" />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500 }}>{h.action}</div>
                              <div style={{ fontSize: 11, color: '#7A7670' }}>
                                {h.user} — {new Date(h.date).toLocaleString('pt-BR')}
                              </div>
                              {h.notes && <div style={{ fontSize: 11, color: '#7A7670', fontStyle: 'italic', marginTop: 3 }}>"{h.notes}"</div>}
                            </div>
                          </div>
                        ))}
                        {incident.resolution && (
                          <div style={{ marginTop: 10, padding: 10, background: '#E8F5E9', borderRadius: 8, fontSize: 12, color: '#186A3B' }}>
                            <strong>Resolução:</strong> {incident.resolution}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <div className="inc-modal" onClick={() => setShowForm(false)}>
          <div className="inc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="inc-modal-title">Registrar incidente</div>
            <label className="inc-label">Título</label>
            <input className="inc-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <label className="inc-label">Descrição</label>
            <textarea className="inc-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="inc-label">Categoria</label>
                <select className="inc-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as IncidentCategory })}>
                  {Object.entries(INCIDENT_CATEGORY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="inc-label">Severidade</label>
                <select className="inc-input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as IncidentSeverity })}>
                  {Object.entries(INCIDENT_SEVERITY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="inc-label">Responsável pela tratativa</label>
            <input className="inc-input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} />
            <label className="inc-label">Tarefa relacionada (opcional)</label>
            <select className="inc-input" value={form.relatedTaskId} onChange={(e) => setForm({ ...form, relatedTaskId: e.target.value })}>
              <option value="">—</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <label className="inc-label">Extra relacionado (opcional)</label>
            <select className="inc-input" value={form.relatedExtraId} onChange={(e) => setForm({ ...form, relatedExtraId: e.target.value })}>
              <option value="">—</option>
              {extras.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.title}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="inc-btn" onClick={() => setShowForm(false)}>
                <X size={14} /> Cancelar
              </button>
              <button className="inc-btn primary" onClick={submit} disabled={!form.title.trim() || !form.description.trim()}>
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
