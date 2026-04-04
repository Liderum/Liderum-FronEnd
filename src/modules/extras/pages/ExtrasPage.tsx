import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FilePlus2, Clock, DollarSign, Calendar,
  CheckCircle2, XCircle, Search as SearchIcon, ChevronDown, ChevronUp, User,
} from 'lucide-react';
import { mockExtras } from '@/modules/shared/data/mockData';
import { EXTRA_STATUS_CONFIG } from '@/modules/shared/types';
import type { ExtraStatus } from '@/modules/shared/types';

const CSS = `
.ex{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.ex-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;}
.ex-summary-card{background:#fff;border-radius:10px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:16px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(26,24,20,0.03);}
.ex-summary-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ex-summary-val{font-family:var(--font-numeric);font-size:20px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink,#1A1814);}
.ex-summary-label{font-size:10.5px;color:var(--ink3,#7A7670);font-weight:500;text-transform:uppercase;letter-spacing:0.3px;}
.ex-filters{display:flex;gap:6px;flex-wrap:wrap;}
.ex-filter{padding:6px 12px;border-radius:7px;font-size:11.5px;font-weight:500;cursor:pointer;border:1px solid transparent;background:transparent;color:var(--ink3,#7A7670);font-family:'DM Sans',sans-serif;transition:all 0.14s;}
.ex-filter:hover{background:var(--cream,#F7F4EF);}
.ex-filter.active{background:rgba(184,146,42,0.08);color:var(--gold,#B8922A);border-color:rgba(184,146,42,0.15);}
.ex-card{background:#fff;border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:0;overflow:hidden;box-shadow:0 2px 10px rgba(26,24,20,0.04);transition:all 0.18s;}
.ex-card:hover{box-shadow:0 6px 24px rgba(26,24,20,0.08);}
.ex-card-main{padding:20px 24px;cursor:pointer;display:flex;flex-direction:column;gap:12px;}
.ex-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.ex-card-title{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink,#1A1814);line-height:1.2;}
.ex-card-desc{font-size:12.5px;color:var(--ink3,#7A7670);line-height:1.5;}
.ex-card-meta{display:flex;gap:16px;flex-wrap:wrap;}
.ex-card-meta-item{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--ink3,#7A7670);}
.ex-card-meta-value{font-weight:600;color:var(--ink,#1A1814);}
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
`;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

type FilterKey = 'todas' | ExtraStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'em_analise', label: 'Em análise' },
  { key: 'aprovado', label: 'Aprovadas' },
  { key: 'rejeitado', label: 'Rejeitadas' },
];

export default function ExtrasPage() {
  const { id } = useParams();
  const [filter, setFilter] = useState<FilterKey>('todas');
  const [expanded, setExpanded] = useState<string[]>([]);

  const filtered = filter === 'todas'
    ? mockExtras
    : mockExtras.filter(e => e.status === filter);

  const totalImpact = mockExtras.reduce((s, e) => s + e.financialImpact, 0);
  const pending = mockExtras.filter(e => e.status === 'pendente' || e.status === 'em_analise').length;
  const approved = mockExtras.filter(e => e.status === 'aprovado').length;

  const toggle = (eid: string) => setExpanded(p => p.includes(eid) ? p.filter(x => x !== eid) : [...p, eid]);

  return (
    <>
      <style>{CSS}</style>
      <div className="ex">
        {/* Summary */}
        <div className="ex-summary">
          <div className="ex-summary-card">
            <div className="ex-summary-icon" style={{ background: '#FFF3E0' }}>
              <FilePlus2 size={16} color="#E67E22" />
            </div>
            <div>
              <div className="ex-summary-val">{mockExtras.length}</div>
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

        {/* Filters */}
        <div className="ex-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`ex-filter${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((extra, i) => {
            const statusCfg = EXTRA_STATUS_CONFIG[extra.status];
            const isOpen = expanded.includes(extra.id);
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
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 10.5,
                        fontWeight: 500,
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        whiteSpace: 'nowrap',
                      }}>
                        ● {statusCfg.label}
                      </span>
                      {isOpen ? <ChevronUp size={14} color="var(--ink3)" /> : <ChevronDown size={14} color="var(--ink3)" />}
                    </div>
                  </div>
                  <div className="ex-card-desc">{extra.description}</div>
                  <div className="ex-card-meta">
                    <div className="ex-card-meta-item">
                      <Calendar size={12} /> <span className="ex-card-meta-value">{new Date(extra.requestDate).toLocaleDateString('pt-BR')}</span>
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
                            <div className="ex-history-date">{new Date(h.date).toLocaleDateString('pt-BR')}</div>
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
    </>
  );
}
