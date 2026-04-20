import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Plus, Filter, ChevronDown, ChevronUp, X, CheckCircle2,
  User, Search, Camera, Upload, Loader2, Calendar, Clock, Trash2,
  AlertTriangle, ArrowRight,
} from 'lucide-react';
import { IncidentsService, ScheduleService, ExtrasService } from '@/services/works';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Incident, IncidentCategory, IncidentSeverity, IncidentStatus, ScheduleTask, ExtraRequest,
} from '@/modules/shared/types';
import {
  INCIDENT_CATEGORY_CONFIG, INCIDENT_SEVERITY_CONFIG, INCIDENT_STATUS_CONFIG,
} from '@/modules/shared/types';

/* ─── CSS ─────────────────────────────────────────────────────────────── */
const CSS = `
.inc{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.inc-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;}
.inc-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink);}

.inc-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;}
.inc-stat{background:#fff;border-radius:10px;border:1px solid rgba(26,24,20,0.08);padding:14px 16px;display:flex;align-items:center;gap:10px;}
.inc-stat-icon{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.inc-stat-val{font-family:var(--font-numeric,'IBM Plex Sans');font-size:20px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;}
.inc-stat-label{font-size:10.5px;color:#7A7670;text-transform:uppercase;letter-spacing:0.3px;font-weight:500;}

.inc-toolbar{background:#fff;border-radius:10px;border:1px solid rgba(26,24,20,0.08);padding:12px 16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
.inc-select{padding:6px 10px;border-radius:6px;border:1px solid rgba(26,24,20,0.12);font-size:12px;font-family:'DM Sans',sans-serif;background:#fff;color:var(--ink);}
.inc-search{padding:6px 10px 6px 32px;border-radius:6px;border:1px solid rgba(26,24,20,0.12);font-size:12px;font-family:'DM Sans',sans-serif;min-width:180px;background:#fff;color:var(--ink);}
.inc-search-wrap{position:relative;}
.inc-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none;}

.inc-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid rgba(26,24,20,0.12);background:#fff;color:var(--ink);font-family:'DM Sans',sans-serif;transition:all 0.16s;white-space:nowrap;}
.inc-btn:hover{background:var(--cream,#F7F4EF);}
.inc-btn.primary{background:linear-gradient(135deg,var(--gold,#B8922A),var(--gold2,#D4A843));color:#fff;border:none;box-shadow:0 2px 10px rgba(184,146,42,0.22);}
.inc-btn.primary:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(184,146,42,0.35);}
.inc-btn.resolve{background:#E8F5E9;color:#1E8449;border-color:rgba(30,132,73,0.2);}
.inc-btn.resolve:hover{background:#d4edda;}
.inc-btn.sm{padding:5px 10px;font-size:11px;}
.inc-btn:disabled{opacity:0.5;cursor:not-allowed;}

.inc-card{background:#fff;border-radius:12px;border:1px solid rgba(26,24,20,0.1);overflow:hidden;box-shadow:0 2px 8px rgba(26,24,20,0.04);transition:box-shadow 0.18s;}
.inc-card:hover{box-shadow:0 4px 20px rgba(26,24,20,0.08);}
.inc-card.severity-critica{border-left:3px solid #C0392B;}
.inc-card.severity-alta{border-left:3px solid #E67E22;}
.inc-card.severity-media{border-left:3px solid #B7770D;}
.inc-card.severity-baixa{border-left:3px solid #1E8449;}

.inc-card-main{padding:16px 20px;cursor:pointer;}
.inc-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
.inc-card-title{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;line-height:1.2;flex:1;}
.inc-card-badges{display:flex;gap:6px;flex-shrink:0;align-items:center;flex-wrap:wrap;}
.inc-badge{padding:3px 10px;border-radius:14px;font-size:10.5px;font-weight:500;white-space:nowrap;}
.inc-card-desc{font-size:12.5px;color:#7A7670;margin-top:8px;line-height:1.55;}
.inc-card-meta{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;font-size:11.5px;color:#7A7670;align-items:center;}
.inc-card-meta-item{display:flex;align-items:center;gap:4px;}

.inc-card-expand{border-top:1px solid rgba(26,24,20,0.06);overflow:hidden;}
.inc-card-history{padding:14px 20px;background:var(--cream,#F7F4EF);}
.inc-history-title{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#7A7670;margin-bottom:10px;}
.inc-history-item{padding:8px 0;font-size:12px;display:flex;gap:10px;border-top:1px solid rgba(26,24,20,0.04);}
.inc-history-item:first-child{border-top:none;}
.inc-history-dot{width:6px;height:6px;border-radius:50%;background:var(--gold,#B8922A);margin-top:5px;flex-shrink:0;}

.inc-photos-section{padding:12px 20px;border-top:1px solid rgba(26,24,20,0.06);display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.inc-photo{width:68px;height:68px;border-radius:8px;overflow:hidden;border:1px solid rgba(26,24,20,0.1);cursor:pointer;transition:transform 0.15s;}
.inc-photo:hover{transform:scale(1.05);}
.inc-photo img{width:100%;height:100%;object-fit:cover;}
.inc-upload-label{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:7px;font-size:11.5px;font-weight:500;cursor:pointer;border:1px dashed rgba(26,24,20,0.25);background:rgba(26,24,20,0.02);color:#7A7670;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
.inc-upload-label:hover{border-color:rgba(184,146,42,0.5);color:var(--gold);background:rgba(184,146,42,0.04);}

.inc-card-actions{display:flex;gap:8px;padding:10px 20px;border-top:1px solid rgba(26,24,20,0.06);background:#fafaf8;flex-wrap:wrap;align-items:center;}
.inc-actions-label{font-size:11px;color:#7A7670;font-weight:500;margin-right:4px;}

.inc-empty{padding:48px 20px;text-align:center;background:#fff;border-radius:12px;border:1px solid rgba(26,24,20,0.08);}

/* Modal */
.inc-overlay{position:fixed;inset:0;background:rgba(26,24,20,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px;backdrop-filter:blur(3px);}
.inc-modal{background:#fff;border-radius:16px;max-width:580px;width:100%;padding:28px;box-shadow:0 24px 64px rgba(0,0,0,0.22);max-height:93vh;overflow-y:auto;}
.inc-modal-sm{max-width:440px;}
.inc-modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;margin-bottom:4px;color:var(--ink);}
.inc-modal-subtitle{font-size:12px;color:#7A7670;margin-bottom:20px;}
.inc-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#7A7670;margin-bottom:6px;display:block;}
.inc-input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;margin-bottom:14px;box-sizing:border-box;background:#fff;color:var(--ink);transition:border-color 0.15s;}
.inc-input:focus{outline:none;border-color:rgba(184,146,42,0.5);}
.inc-textarea{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;min-height:80px;box-sizing:border-box;resize:vertical;margin-bottom:14px;background:#fff;color:var(--ink);transition:border-color 0.15s;}
.inc-textarea:focus{outline:none;border-color:rgba(184,146,42,0.5);}
`;

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = dateStr.substring(0, 10);
  const [year, month, day] = d.split('-');
  return `${day}/${month}/${year}`;
}

const emptyForm = {
  title: '',
  description: '',
  category: 'execucao' as IncidentCategory,
  severity: 'media' as IncidentSeverity,
  assignedTo: '',
  deadline: '',
  relatedTaskId: '',
  relatedExtraId: '',
};

/** Máquina de estados válida conforme a API */
function validTransitions(status: IncidentStatus): IncidentStatus[] {
  switch (status) {
    case 'aberto': return ['em_andamento', 'cancelado'];
    case 'em_andamento': return ['aberto', 'resolvido', 'cancelado'];
    default: return [];
  }
}

/* ─── Component ───────────────────────────────────────────────────────── */
export default function IncidentsPage() {
  const { id } = useParams();
  const workId = id ?? '1';
  const { permissions, user } = useAuth();
  const canCreate = permissions.includes('incidents.create') || permissions.includes('daily-log.create');
  const canUpdate = permissions.includes('incidents.update') || permissions.includes('daily-log.update') || permissions.includes('daily-log.create');

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [extras, setExtras] = useState<ExtraRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<IncidentCategory | ''>('');
  const [filterSeverity, setFilterSeverity] = useState<IncidentSeverity | ''>('');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | ''>('');
  const [search, setSearch] = useState('');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  // Resolve modal
  const [resolveTarget, setResolveTarget] = useState<Incident | null>(null);
  const [resolveResolution, setResolveResolution] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  // Photo upload
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  /* ── Load ── */
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
    return () => { active = false; };
  }, [workId]);

  /* ── Filtered ── */
  const filtered = useMemo(
    () =>
      incidents.filter((i) => {
        if (filterCategory && i.category !== filterCategory) return false;
        if (filterSeverity && i.severity !== filterSeverity) return false;
        if (filterStatus && i.status !== filterStatus) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!i.title.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q))
            return false;
        }
        return true;
      }),
    [incidents, filterCategory, filterSeverity, filterStatus, search],
  );

  const openCount = incidents.filter((i) => i.status === 'aberto').length;
  const inProgressCount = incidents.filter((i) => i.status === 'em_andamento').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolvido').length;
  const criticalOpen = incidents.filter(
    (i) => i.severity === 'critica' && i.status !== 'resolvido' && i.status !== 'cancelado',
  ).length;

  const toggle = (iid: string) =>
    setExpanded((p) => (p.includes(iid) ? p.filter((x) => x !== iid) : [...p, iid]));

  /* ── Create ── */
  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setCreating(true);
    try {
      const created = await IncidentsService.create(workId, {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        severity: form.severity,
        reportedBy: user?.name ?? user?.email ?? 'usuário',
        assignedTo: form.assignedTo.trim() || undefined,
        deadline: form.deadline || undefined,
        relatedTaskId: form.relatedTaskId || undefined,
        relatedExtraId: form.relatedExtraId || undefined,
      });
      setIncidents((prev) => [created, ...prev]);
      setForm(emptyForm);
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  };

  /* ── Transition ── */
  const doTransition = async (
    incident: Incident,
    to: IncidentStatus,
    note?: string,
    resolution?: string,
  ) => {
    setBusyId(incident.id);
    try {
      const updated = await IncidentsService.transition(
        workId,
        incident.id,
        to,
        user?.name ?? user?.email ?? 'usuário',
        note,
        resolution,
      );
      setIncidents((prev) => prev.map((i) => (i.id === incident.id ? updated : i)));
    } finally {
      setBusyId(null);
    }
  };

  /* ── Resolve flow ── */
  const openResolve = (incident: Incident) => {
    setResolveTarget(incident);
    setResolveResolution('');
    setResolveNotes('');
  };

  const handleResolve = async () => {
    if (!resolveTarget) return;
    setResolving(true);
    try {
      await doTransition(resolveTarget, 'resolvido', resolveNotes || undefined, resolveResolution || undefined);
      setResolveTarget(null);
    } finally {
      setResolving(false);
    }
  };

  /* ── Photo upload ── */
  const handlePhotoUpload = async (incident: Incident, files: FileList | null) => {
    if (!files) return;
    setUploadingFor(incident.id);
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) =>
          IncidentsService.uploadPhoto(workId, incident.id, file),
        ),
      );
      setIncidents((prev) =>
        prev.map((i) =>
          i.id === incident.id ? { ...i, photos: [...i.photos, ...urls] } : i,
        ),
      );
    } finally {
      setUploadingFor(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60, color: '#7A7670' }}>
        <Loader2 size={22} className="animate-spin" style={{ marginRight: 10, color: 'var(--gold,#B8922A)' }} />
        <span style={{ fontFamily: 'DM Sans', fontSize: 13 }}>Carregando ocorrências…</span>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="inc">

        {/* ── Header ── */}
        <div className="inc-header">
          <div className="inc-title">Ocorrências</div>
          {canCreate && (
            <button className="inc-btn primary" onClick={() => setShowCreate(true)}>
              <Plus size={14} /> Registrar ocorrência
            </button>
          )}
        </div>

        {/* ── Stats ── */}
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
              <ArrowRight size={16} color="#1A5276" />
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
              <AlertTriangle size={16} color="#E67E22" />
            </div>
            <div>
              <div className="inc-stat-val">{criticalOpen}</div>
              <div className="inc-stat-label">Críticos pendentes</div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="inc-toolbar">
          <Filter size={13} color="#7A7670" />
          <div className="inc-search-wrap">
            <Search className="inc-search-icon" size={13} color="#7A7670" />
            <input
              className="inc-search"
              placeholder="Buscar título ou descrição…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="inc-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as IncidentCategory | '')}
          >
            <option value="">Todas categorias</option>
            {Object.entries(INCIDENT_CATEGORY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            className="inc-select"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as IncidentSeverity | '')}
          >
            <option value="">Todas severidades</option>
            {Object.entries(INCIDENT_SEVERITY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            className="inc-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | '')}
          >
            <option value="">Todos status</option>
            {Object.entries(INCIDENT_STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {(filterCategory || filterSeverity || filterStatus || search) && (
            <button
              className="inc-btn sm"
              onClick={() => { setFilterCategory(''); setFilterSeverity(''); setFilterStatus(''); setSearch(''); }}
            >
              <X size={11} /> Limpar
            </button>
          )}
        </div>

        {/* ── List ── */}
        {filtered.length === 0 ? (
          <div className="inc-empty">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(184,146,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <ShieldAlert size={22} color="var(--gold,#B8922A)" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
              Nenhuma ocorrência encontrada
            </div>
            <div style={{ fontSize: 12, color: '#7A7670' }}>
              {(filterCategory || filterSeverity || filterStatus || search)
                ? 'Nenhuma ocorrência corresponde aos filtros.'
                : 'Nenhuma ocorrência registrada para esta obra.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((incident, i) => {
              const sevCfg = INCIDENT_SEVERITY_CONFIG[incident.severity];
              const statCfg = INCIDENT_STATUS_CONFIG[incident.status];
              const catCfg = INCIDENT_CATEGORY_CONFIG[incident.category];
              const isExpanded = expanded.includes(incident.id);
              const isBusy = busyId === incident.id;
              const transitions = validTransitions(incident.status);
              const relatedTask = incident.relatedTaskId
                ? tasks.find((t) => t.id === incident.relatedTaskId)
                : null;
              const relatedExtra = incident.relatedExtraId
                ? extras.find((e) => e.id === incident.relatedExtraId)
                : null;
              const isTerminal = incident.status === 'resolvido' || incident.status === 'cancelado';

              return (
                <motion.div
                  key={incident.id}
                  className={`inc-card severity-${incident.severity}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.28 }}
                >
                  {/* ── Card main ── */}
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
                        {isExpanded
                          ? <ChevronUp size={14} color="#7A7670" />
                          : <ChevronDown size={14} color="#7A7670" />}
                      </div>
                    </div>
                    <div className="inc-card-desc">{incident.description}</div>
                    <div className="inc-card-meta">
                      <span className="inc-card-meta-item">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 10, background: 'rgba(26,24,20,0.05)', fontSize: 10.5 }}>
                          {catCfg.label}
                        </span>
                      </span>
                      <span className="inc-card-meta-item">
                        <User size={11} /> {incident.reportedBy}
                      </span>
                      <span className="inc-card-meta-item">
                        <Calendar size={11} /> {formatDate(incident.reportedAt)}
                      </span>
                      {incident.deadline && (
                        <span className="inc-card-meta-item" style={{ color: '#E67E22' }}>
                          <Clock size={11} /> Prazo: {formatDate(incident.deadline)}
                        </span>
                      )}
                      {incident.assignedTo && (
                        <span className="inc-card-meta-item">Atribuído: {incident.assignedTo}</span>
                      )}
                      {relatedTask && (
                        <span className="inc-card-meta-item">Tarefa: {relatedTask.name}</span>
                      )}
                      {relatedExtra && (
                        <span className="inc-card-meta-item">Extra: {relatedExtra.title}</span>
                      )}
                      {incident.photos.length > 0 && (
                        <span className="inc-card-meta-item">
                          <Camera size={11} /> {incident.photos.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Actions ── */}
                  {(canUpdate && !isTerminal) || canCreate ? (
                    <div className="inc-card-actions" onClick={(e) => e.stopPropagation()}>
                      {canUpdate && !isTerminal && (
                        <>
                          <span className="inc-actions-label">Ação:</span>
                          {transitions.includes('em_andamento') && (
                            <button
                              className="inc-btn sm"
                              disabled={isBusy}
                              onClick={() => doTransition(incident, 'em_andamento')}
                            >
                              {isBusy ? <Loader2 size={11} className="animate-spin" /> : <ArrowRight size={11} />}
                              Iniciar tratativa
                            </button>
                          )}
                          {transitions.includes('aberto') && (
                            <button
                              className="inc-btn sm"
                              disabled={isBusy}
                              onClick={() => doTransition(incident, 'aberto')}
                            >
                              Reabrir
                            </button>
                          )}
                          {transitions.includes('resolvido') && (
                            <button
                              className="inc-btn sm resolve"
                              disabled={isBusy}
                              onClick={() => openResolve(incident)}
                            >
                              <CheckCircle2 size={11} /> Resolver
                            </button>
                          )}
                          {transitions.includes('cancelado') && (
                            <button
                              className="inc-btn sm"
                              style={{ color: '#7A7670' }}
                              disabled={isBusy}
                              onClick={() => doTransition(incident, 'cancelado')}
                            >
                              <Trash2 size={11} /> Cancelar
                            </button>
                          )}
                        </>
                      )}
                      {canCreate && !isTerminal && (
                        <label className="inc-upload-label" style={{ marginLeft: 'auto' }}>
                          {uploadingFor === incident.id ? (
                            <><Loader2 size={12} className="animate-spin" /> Enviando…</>
                          ) : (
                            <><Upload size={12} /> Foto</>
                          )}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            style={{ display: 'none' }}
                            onChange={(e) => handlePhotoUpload(incident, e.target.files)}
                            disabled={uploadingFor === incident.id}
                          />
                        </label>
                      )}
                    </div>
                  ) : null}

                  {/* ── Expanded ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className="inc-card-expand"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        {/* Photos */}
                        {incident.photos.length > 0 && (
                          <div className="inc-photos-section">
                            {incident.photos.map((photo, pi) => (
                              <div
                                key={pi}
                                className="inc-photo"
                                onClick={() => setLightboxSrc(photo)}
                              >
                                {(photo.startsWith('data:') || photo.startsWith('http') || photo.startsWith('blob:')) ? (
                                  <img src={photo} alt={`Foto ${pi + 1}`} />
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                                    <Camera size={20} color="#7A7670" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* History */}
                        <div className="inc-card-history">
                          <div className="inc-history-title">Histórico da ocorrência</div>
                          {incident.history.map((h, hi) => (
                            <div key={hi} className="inc-history-item">
                              <div className="inc-history-dot" />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500 }}>{h.action}</div>
                                <div style={{ fontSize: 11, color: '#7A7670', marginTop: 2 }}>
                                  {h.user} — {h.date ? new Date(h.date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                                </div>
                                {h.notes && (
                                  <div style={{ fontSize: 11, color: '#7A7670', fontStyle: 'italic', marginTop: 3 }}>
                                    "{h.notes}"
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {incident.resolution && (
                            <div style={{ marginTop: 10, padding: '10px 14px', background: '#E8F5E9', borderRadius: 8, fontSize: 12, color: '#186A3B', border: '1px solid rgba(30,132,73,0.15)' }}>
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
        )}
      </div>

      {/* ── Create Modal ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="inc-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              className="inc-modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inc-modal-title">Registrar ocorrência</div>
              <div className="inc-modal-subtitle">
                Documente a ocorrência com o máximo de detalhes possível.
              </div>

              <label className="inc-label">Título *</label>
              <input
                className="inc-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Queda de material no 2º andar"
              />

              <label className="inc-label">Descrição *</label>
              <textarea
                className="inc-textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descreva o que aconteceu com o máximo de detalhes…"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="inc-label">Categoria *</label>
                  <select
                    className="inc-input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as IncidentCategory })}
                  >
                    {Object.entries(INCIDENT_CATEGORY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="inc-label">Severidade *</label>
                  <select
                    className="inc-input"
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value as IncidentSeverity })}
                  >
                    {Object.entries(INCIDENT_SEVERITY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="inc-label">Responsável pela tratativa</label>
                  <input
                    className="inc-input"
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    placeholder="Nome ou email (opcional)"
                  />
                </div>
                <div>
                  <label className="inc-label">Prazo para resolução</label>
                  <input
                    className="inc-input"
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="inc-label">Tarefa relacionada</label>
                  <select
                    className="inc-input"
                    value={form.relatedTaskId}
                    onChange={(e) => setForm({ ...form, relatedTaskId: e.target.value })}
                  >
                    <option value="">— Nenhuma —</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="inc-label">Extra relacionado</label>
                  <select
                    className="inc-input"
                    value={form.relatedExtraId}
                    onChange={(e) => setForm({ ...form, relatedExtraId: e.target.value })}
                  >
                    <option value="">— Nenhum —</option>
                    {extras.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="inc-btn" onClick={() => setShowCreate(false)}>
                  <X size={13} /> Cancelar
                </button>
                <button
                  className="inc-btn primary"
                  onClick={handleCreate}
                  disabled={creating || !form.title.trim() || !form.description.trim()}
                >
                  {creating ? (
                    <><Loader2 size={13} className="animate-spin" /> Registrando…</>
                  ) : (
                    <><CheckCircle2 size={13} /> Registrar</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Resolve Modal ── */}
      <AnimatePresence>
        {resolveTarget && (
          <motion.div
            className="inc-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setResolveTarget(null)}
          >
            <motion.div
              className="inc-modal inc-modal-sm"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={20} color="#1E8449" />
                </div>
                <div>
                  <div className="inc-modal-title" style={{ fontSize: 20, marginBottom: 0 }}>
                    Resolver ocorrência
                  </div>
                  <div style={{ fontSize: 12, color: '#7A7670', marginTop: 2 }}>
                    {resolveTarget.title}
                  </div>
                </div>
              </div>

              <label className="inc-label">Descrição da resolução</label>
              <textarea
                className="inc-textarea"
                value={resolveResolution}
                onChange={(e) => setResolveResolution(e.target.value)}
                placeholder="Descreva como o problema foi resolvido…"
              />

              <label className="inc-label">Notas adicionais (opcional)</label>
              <textarea
                className="inc-textarea"
                style={{ minHeight: 60 }}
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Observações para o histórico…"
              />

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="inc-btn" onClick={() => setResolveTarget(null)}>
                  <X size={13} /> Cancelar
                </button>
                <button
                  className="inc-btn resolve"
                  onClick={handleResolve}
                  disabled={resolving}
                  style={{ background: '#1E8449', color: '#fff' }}
                >
                  {resolving ? (
                    <><Loader2 size={13} className="animate-spin" /> Resolvendo…</>
                  ) : (
                    <><CheckCircle2 size={13} /> Confirmar resolução</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,8,6,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'zoom-out' }}
          >
            <motion.img
              src={lightboxSrc}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 10, boxShadow: '0 30px 80px rgba(0,0,0,0.5)', objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxSrc(null)}
              style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            >
              <X size={16} color="#fff" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
