import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FilePlus2, Clock, DollarSign, Calendar,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, User, Plus, Send, X,
} from 'lucide-react';
import { ExtrasService } from '@/services/works';
import { useAuth } from '@/contexts/AuthContext';
import { EXTRA_STATUS_CONFIG } from '@/modules/shared/types';
import type { ExtraRequest, ExtraStatus } from '@/modules/shared/types';

const CSS = `
.ex{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.ex-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;}
.ex-summary-card{background:#fff;border-radius:10px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:16px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(26,24,20,0.03);}
.ex-summary-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ex-summary-val{font-family:var(--font-numeric);font-size:20px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink,#1A1814);}
.ex-summary-label{font-size:10.5px;color:var(--ink3,#7A7670);font-weight:500;text-transform:uppercase;letter-spacing:0.3px;}
.ex-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.ex-filters{display:flex;gap:6px;flex-wrap:wrap;}
.ex-filter{padding:6px 12px;border-radius:7px;font-size:11.5px;font-weight:500;cursor:pointer;border:1px solid transparent;background:transparent;color:var(--ink3,#7A7670);font-family:'DM Sans',sans-serif;transition:all 0.14s;}
.ex-filter:hover{background:var(--cream,#F7F4EF);}
.ex-filter.active{background:rgba(184,146,42,0.08);color:var(--gold,#B8922A);border-color:rgba(184,146,42,0.15);}
.ex-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid rgba(26,24,20,0.12);background:#fff;color:var(--ink,#1A1814);font-family:'DM Sans',sans-serif;transition:all 0.14s;}
.ex-btn:hover{background:var(--cream,#F7F4EF);}
.ex-btn.primary{background:var(--gold,#B8922A);color:#fff;border-color:var(--gold,#B8922A);}
.ex-btn.primary:hover{background:#a07e1f;}
.ex-btn.approve{background:#1E8449;color:#fff;border-color:#1E8449;}
.ex-btn.approve:hover{background:#196e3d;}
.ex-btn.reject{background:#C0392B;color:#fff;border-color:#C0392B;}
.ex-btn.reject:hover{background:#a03024;}
.ex-btn:disabled{opacity:0.5;cursor:not-allowed;}
.ex-card{background:#fff;border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:0;overflow:hidden;box-shadow:0 2px 10px rgba(26,24,20,0.04);transition:all 0.18s;}
.ex-card:hover{box-shadow:0 6px 24px rgba(26,24,20,0.08);}
.ex-card-main{padding:20px 24px;cursor:pointer;display:flex;flex-direction:column;gap:12px;}
.ex-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.ex-card-title{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink,#1A1814);line-height:1.2;}
.ex-card-desc{font-size:12.5px;color:var(--ink3,#7A7670);line-height:1.5;}
.ex-card-meta{display:flex;gap:16px;flex-wrap:wrap;}
.ex-card-meta-item{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--ink3,#7A7670);}
.ex-card-meta-value{font-weight:600;color:var(--ink,#1A1814);}
.ex-card-actions{display:flex;gap:8px;padding:12px 24px;border-top:1px solid rgba(26,24,20,0.06);background:#fafaf7;flex-wrap:wrap;}
.ex-card-history{border-top:1px solid rgba(26,24,20,0.06);padding:16px 24px;background:var(--cream,#F7F4EF);}
.ex-history-title{font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--ink3,#7A7670);margin-bottom:10px;}
.ex-history-item{display:flex;gap:12px;padding:8px 0;position:relative;}
.ex-history-item+.ex-history-item{border-top:1px solid rgba(26,24,20,0.06);}
.ex-history-dot{width:7px;height:7px;border-radius:50%;background:var(--gold,#B8922A);margin-top:5px;flex-shrink:0;}
.ex-history-info{flex:1;}
.ex-history-action{font-size:12.5px;font-weight:500;color:var(--ink,#1A1814);}
.ex-history-user{font-size:11.5px;color:var(--ink3,#7A7670);margin-top:1px;}
.ex-history-notes{font-size:11.5px;color:var(--ink3,#7A7670);font-style:italic;margin-top:3px;}
.ex-history-date{font-size:10.5px;color:rgba(26,24,20,0.4);flex-shrink:0;margin-top:3px;}
.ex-modal{position:fixed;inset:0;background:rgba(26,24,20,0.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;}
.ex-modal-card{background:#fff;border-radius:14px;max-width:560px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.25);max-height:90vh;overflow-y:auto;}
.ex-modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink,#1A1814);margin-bottom:16px;}
.ex-modal-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--ink3,#7A7670);margin-bottom:6px;display:block;}
.ex-modal-input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;margin-bottom:14px;box-sizing:border-box;}
.ex-modal-textarea{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;min-height:80px;box-sizing:border-box;resize:vertical;margin-bottom:14px;}
.ex-modal-actions{display:flex;gap:10px;justify-content:flex-end;}
.ex-client-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:12px;font-size:10.5px;font-weight:500;background:#EBF5FB;color:#1A5276;}
`;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = dateStr.substring(0, 10);
  const [year, month, day] = d.split('-');
  return `${day}/${month}/${year}`;
}

type FilterKey = 'todas' | ExtraStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'em_analise', label: 'Em análise' },
  { key: 'aprovado', label: 'Aprovadas' },
  { key: 'rejeitado', label: 'Rejeitadas' },
];

interface FormState {
  title: string;
  description: string;
  scheduleImpact: string;
  financialImpact: string;
  requestedBy: string;
}

const emptyForm: FormState = {
  title: '',
  description: '',
  scheduleImpact: '',
  financialImpact: '',
  requestedBy: '',
};

export default function ExtrasPage() {
  const { id } = useParams();
  const workId = id ?? '1';
  const { permissions, user } = useAuth();
  const canCreate = permissions.includes('extras.create');
  const canApprove = permissions.includes('extras.approve');

  const [extras, setExtras] = useState<ExtraRequest[]>([]);
  const [filter, setFilter] = useState<FilterKey>('todas');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    ExtrasService.list(workId)
      .then((data) => {
        if (active) setExtras(data);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [workId]);

  const filtered = filter === 'todas' ? extras : extras.filter((e) => e.status === filter);

  const totalImpact = extras.reduce((s, e) => s + e.financialImpact, 0);
  const pending = extras.filter((e) => e.status === 'pendente' || e.status === 'em_analise').length;
  const approved = extras.filter((e) => e.status === 'aprovado').length;

  const toggle = (eid: string) =>
    setExpanded((p) => (p.includes(eid) ? p.filter((x) => x !== eid) : [...p, eid]));

  const submitForm = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    const financialImpact = Number(form.financialImpact);
    if (!Number.isFinite(financialImpact) || financialImpact < 0) return;
    const created = await ExtrasService.create(workId, {
      title: form.title.trim(),
      description: form.description.trim(),
      scheduleImpact: form.scheduleImpact.trim() || '—',
      financialImpact,
      requestedBy: form.requestedBy.trim() || user?.name || 'usuário',
      clientApprovalRequired: true,
    });
    setExtras((prev) => [created, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const doTransition = async (extra: ExtraRequest, to: ExtraStatus, note?: string) => {
    setBusyId(extra.id);
    try {
      const updated = await ExtrasService.transition(
        workId,
        extra.id,
        to,
        user?.name ?? user?.email ?? 'usuário',
        note,
      );
      setExtras((prev) => prev.map((e) => (e.id === extra.id ? updated : e)));
    } finally {
      setBusyId(null);
    }
  };

  const requestClient = async (extra: ExtraRequest) => {
    setBusyId(extra.id);
    try {
      const updated = await ExtrasService.requestClientApproval(
        workId,
        extra.id,
        user?.name ?? user?.email ?? 'usuário',
      );
      setExtras((prev) => prev.map((e) => (e.id === extra.id ? updated : e)));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#7A7670', fontFamily: 'DM Sans' }}>
        Carregando extras…
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="ex">
        <div className="ex-summary">
          <div className="ex-summary-card">
            <div className="ex-summary-icon" style={{ background: '#FFF3E0' }}>
              <FilePlus2 size={16} color="#E67E22" />
            </div>
            <div>
              <div className="ex-summary-val">{extras.length}</div>
              <div className="ex-summary-label">Total de Extras</div>
            </div>
          </div>
          <div className="ex-summary-card">
            <div className="ex-summary-icon" style={{ background: '#FFF8E1' }}>
              <Clock size={16} color="#B7770D" />
            </div>
            <div>
              <div className="ex-summary-val">{pending}</div>
              <div className="ex-summary-label">Pendentes</div>
            </div>
          </div>
          <div className="ex-summary-card">
            <div className="ex-summary-icon" style={{ background: '#E8F5E9' }}>
              <CheckCircle2 size={16} color="#1E8449" />
            </div>
            <div>
              <div className="ex-summary-val">{approved}</div>
              <div className="ex-summary-label">Aprovadas</div>
            </div>
          </div>
          <div className="ex-summary-card">
            <div className="ex-summary-icon" style={{ background: '#FDEDEC' }}>
              <DollarSign size={16} color="#C0392B" />
            </div>
            <div>
              <div className="ex-summary-val">{formatCurrency(totalImpact)}</div>
              <div className="ex-summary-label">Impacto Total</div>
            </div>
          </div>
        </div>

        <div className="ex-toolbar">
          <div className="ex-filters">
            {FILTERS.map((f) => (
              <button key={f.key} className={`ex-filter${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          {canCreate && (
            <button className="ex-btn primary" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Novo extra
            </button>
          )}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#7A7670', background: '#fff', borderRadius: 12, border: '1px solid rgba(26,24,20,0.08)' }}>
            Nenhum extra nesta visão.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((extra, i) => {
            const statusCfg = EXTRA_STATUS_CONFIG[extra.status];
            const isOpen = expanded.includes(extra.id);
            const isBusy = busyId === extra.id;
            const canTransitionFrom = extra.status === 'pendente' || extra.status === 'em_analise';
            return (
              <motion.div
                key={extra.id}
                className="ex-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <div className="ex-card-main" onClick={() => toggle(extra.id)}>
                  <div className="ex-card-top">
                    <div className="ex-card-title">{extra.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 500, background: statusCfg.bg, color: statusCfg.color, whiteSpace: 'nowrap' }}>
                        ● {statusCfg.label}
                      </span>
                      {extra.clientApprovalRequestedAt && !extra.clientApprovedAt && (
                        <span className="ex-client-badge">aguardando cliente</span>
                      )}
                      {extra.clientApprovedAt && (
                        <span className="ex-client-badge">cliente confirmou</span>
                      )}
                      {isOpen ? <ChevronUp size={14} color="var(--ink3)" /> : <ChevronDown size={14} color="var(--ink3)" />}
                    </div>
                  </div>
                  <div className="ex-card-desc">{extra.description}</div>
                  <div className="ex-card-meta">
                    <div className="ex-card-meta-item">
                      <Calendar size={12} /> <span className="ex-card-meta-value">{formatDate(extra.requestDate)}</span>
                    </div>
                    <div className="ex-card-meta-item">
                      <Clock size={12} /> Prazo: <span className="ex-card-meta-value">{extra.scheduleImpact}</span>
                    </div>
                    <div className="ex-card-meta-item">
                      <DollarSign size={12} /> <span className="ex-card-meta-value" style={{ fontFamily: 'var(--font-numeric)', fontVariantNumeric: 'tabular-nums', color: '#C0392B' }}>{formatCurrency(extra.financialImpact)}</span>
                    </div>
                    <div className="ex-card-meta-item">
                      <User size={12} /> {extra.requestedBy}
                    </div>
                  </div>
                </div>

                {canTransitionFrom && (canApprove || extra.status === 'pendente') && (
                  <div className="ex-card-actions" onClick={(e) => e.stopPropagation()}>
                    {extra.status === 'pendente' && canApprove && (
                      <button className="ex-btn" disabled={isBusy} onClick={() => doTransition(extra, 'em_analise')}>
                        Marcar em análise
                      </button>
                    )}
                    {!extra.clientApprovalRequestedAt && canApprove && (
                      <button className="ex-btn" disabled={isBusy} onClick={() => requestClient(extra)}>
                        <Send size={12} /> Enviar para cliente
                      </button>
                    )}
                    {canApprove && (
                      <>
                        <button className="ex-btn approve" disabled={isBusy} onClick={() => doTransition(extra, 'aprovado')}>
                          <CheckCircle2 size={12} /> Aprovar
                        </button>
                        <button className="ex-btn reject" disabled={isBusy} onClick={() => doTransition(extra, 'rejeitado')}>
                          <XCircle size={12} /> Rejeitar
                        </button>
                      </>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="ex-card-history">
                        <div className="ex-history-title">Histórico</div>
                        {extra.history.map((h, hi) => (
                          <div key={hi} className="ex-history-item">
                            <div className="ex-history-dot" />
                            <div className="ex-history-info">
                              <div className="ex-history-action">{h.action}</div>
                              <div className="ex-history-user">{h.user}</div>
                              {h.notes && <div className="ex-history-notes">"{h.notes}"</div>}
                            </div>
                            <div className="ex-history-date">{formatDate(h.date)}</div>
                          </div>
                        ))}
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
        <div className="ex-modal" onClick={() => setShowForm(false)}>
          <div className="ex-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ex-modal-title">Novo extra</div>
            <label className="ex-modal-label">Título</label>
            <input
              className="ex-modal-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex.: Substituição de revestimento"
            />
            <label className="ex-modal-label">Descrição</label>
            <textarea
              className="ex-modal-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Contextualize o pedido, escopo e justificativa"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="ex-modal-label">Impacto financeiro (R$)</label>
                <input
                  className="ex-modal-input"
                  type="number"
                  min={0}
                  value={form.financialImpact}
                  onChange={(e) => setForm({ ...form, financialImpact: e.target.value })}
                />
              </div>
              <div>
                <label className="ex-modal-label">Impacto no prazo</label>
                <input
                  className="ex-modal-input"
                  value={form.scheduleImpact}
                  onChange={(e) => setForm({ ...form, scheduleImpact: e.target.value })}
                  placeholder="Ex.: +15 dias"
                />
              </div>
            </div>
            <label className="ex-modal-label">Solicitado por</label>
            <input
              className="ex-modal-input"
              value={form.requestedBy}
              onChange={(e) => setForm({ ...form, requestedBy: e.target.value })}
              placeholder={user?.name ?? 'Nome do solicitante'}
            />
            <div className="ex-modal-actions">
              <button className="ex-btn" onClick={() => setShowForm(false)}>
                <X size={14} /> Cancelar
              </button>
              <button
                className="ex-btn primary"
                onClick={submitForm}
                disabled={!form.title.trim() || !form.description.trim()}
              >
                Criar extra
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
