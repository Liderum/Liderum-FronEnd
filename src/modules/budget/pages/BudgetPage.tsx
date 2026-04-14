import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Percent, ArrowUpRight, ArrowDownRight,
  Download, History, FileEdit, Plus, X,
} from 'lucide-react';
import { BudgetService, WorksService } from '@/services/works';
import { useAuth } from '@/contexts/AuthContext';
import type { BudgetItem, BudgetRevision, Work } from '@/modules/shared/types';

const CSS = `
.bg{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.bg-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;}
.bg-stat{background:#fff;border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:20px;display:flex;align-items:center;gap:14px;box-shadow:0 2px 10px rgba(26,24,20,0.04);position:relative;overflow:hidden;}
.bg-stat-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.bg-stat-val{font-family:var(--font-numeric);font-size:24px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink,#1A1814);line-height:1.1;}
.bg-stat-label{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.4px;color:var(--ink3,#7A7670);margin-top:2px;}
.bg-actions{display:flex;gap:8px;flex-wrap:wrap;}
.bg-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:12px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;border:1px solid rgba(26,24,20,0.12);background:#fff;color:var(--ink,#1A1814);transition:all 0.14s;}
.bg-btn:hover{background:var(--cream,#F7F4EF);}
.bg-btn.primary{background:var(--gold,#B8922A);color:#fff;border-color:var(--gold,#B8922A);}
.bg-btn.primary:hover{background:#a07e1f;}
.bg-btn:disabled{opacity:0.5;cursor:not-allowed;}
.bg-table-wrap{background:#fff;border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));box-shadow:0 2px 10px rgba(26,24,20,0.04);overflow:hidden;}
.bg-table-header{padding:16px 20px;border-bottom:1px solid rgba(26,24,20,0.06);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.bg-table-title{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink,#1A1814);}
.bg-cat-tabs{display:flex;gap:4px;flex-wrap:wrap;}
.bg-cat-tab{padding:5px 12px;border-radius:6px;font-size:11.5px;font-weight:500;cursor:pointer;border:1px solid transparent;background:transparent;color:var(--ink3,#7A7670);font-family:'DM Sans',sans-serif;transition:all 0.14s;}
.bg-cat-tab:hover{background:var(--cream,#F7F4EF);}
.bg-cat-tab.active{background:rgba(184,146,42,0.08);color:var(--gold,#B8922A);border-color:rgba(184,146,42,0.15);}
.bg-tbl{width:100%;border-collapse:collapse;}
.bg-tbl th{padding:10px 20px;font-size:10.5px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--ink3,#7A7670);text-align:left;border-bottom:1px solid rgba(26,24,20,0.06);white-space:nowrap;}
.bg-tbl td{padding:12px 20px;font-size:12.5px;border-bottom:1px solid rgba(26,24,20,0.04);}
.bg-tbl tr:hover{background:var(--cream,#F7F4EF);}
.bg-tbl-cat{font-size:10px;font-weight:600;padding:2px 8px;border-radius:6px;display:inline-block;letter-spacing:0.3px;}
.bg-tbl-diff{display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:600;padding:2px 8px;border-radius:6px;}
.bg-totals{display:flex;justify-content:flex-end;padding:14px 20px;gap:32px;border-top:2px solid rgba(26,24,20,0.08);}
.bg-total-item{text-align:right;}
.bg-total-val{font-family:var(--font-numeric);font-size:18px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink,#1A1814);}
.bg-total-label{font-size:10.5px;color:var(--ink3,#7A7670);text-transform:uppercase;letter-spacing:0.4px;font-weight:500;}
.bg-edit-input{font-family:var(--font-numeric);font-variant-numeric:tabular-nums;padding:4px 8px;border-radius:6px;border:1px solid rgba(26,24,20,0.15);width:120px;text-align:right;font-size:12px;}
.bg-modal{position:fixed;inset:0;background:rgba(26,24,20,0.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;}
.bg-modal-card{background:#fff;border-radius:14px;max-width:520px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.25);}
.bg-modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink,#1A1814);margin-bottom:8px;}
.bg-modal-sub{font-size:12.5px;color:var(--ink3,#7A7670);margin-bottom:16px;}
.bg-modal-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--ink3,#7A7670);margin-bottom:6px;display:block;}
.bg-modal-input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;margin-bottom:14px;box-sizing:border-box;}
.bg-modal-textarea{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(26,24,20,0.15);font-family:'DM Sans',sans-serif;font-size:13px;min-height:80px;box-sizing:border-box;resize:vertical;margin-bottom:14px;}
.bg-modal-actions{display:flex;gap:10px;justify-content:flex-end;}
.bg-rev-list{margin-top:14px;display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;}
.bg-rev-item{padding:10px 12px;border-radius:8px;background:var(--cream,#F7F4EF);border:1px solid rgba(26,24,20,0.06);font-size:12px;}
.bg-rev-num{font-weight:700;color:var(--gold,#B8922A);}
.bg-rev-reason{color:var(--ink3,#7A7670);margin-top:4px;font-style:italic;}
`;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

const catColors: Record<string, { bg: string; color: string }> = {
  'Mão de Obra': { bg: '#EBF5FB', color: '#1A5276' },
  'Material': { bg: '#FFF8E1', color: '#B7770D' },
  'Serviços': { bg: '#E8F5E9', color: '#1E8449' },
  'Administrativo': { bg: '#F3E5F5', color: '#8E44AD' },
};

export default function BudgetPage() {
  const { id } = useParams();
  const workId = id ?? '1';
  const { permissions, user } = useAuth();
  const canEdit = permissions.includes('budget.update');
  const canExport = permissions.includes('budget.export');

  const [items, setItems] = useState<BudgetItem[]>([]);
  const [revisions, setRevisions] = useState<BudgetRevision[]>([]);
  const [work, setWork] = useState<Work | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('Todas');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      BudgetService.list(workId),
      BudgetService.listRevisions(workId),
      WorksService.getById(workId),
    ])
      .then(([it, rev, w]) => {
        if (!active) return;
        setItems(it);
        setRevisions(rev);
        setWork(w ?? null);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [workId]);

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(items.map((i) => i.category)))],
    [items],
  );
  const filteredItems = selectedCat === 'Todas' ? items : items.filter((i) => i.category === selectedCat);

  const totalPlanned = items.reduce((s, i) => s + i.plannedCost, 0);
  const totalActual = items.reduce((s, i) => s + i.actualCost, 0);
  const totalVariation = totalPlanned === 0 ? 0 : ((totalActual - totalPlanned) / totalPlanned) * 100;

  const startEdit = (item: BudgetItem) => {
    if (!canEdit) return;
    setEditingId(item.id);
    setEditValue(item.actualCost.toString());
  };

  const saveEdit = async (item: BudgetItem) => {
    const parsed = Number(editValue);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setEditingId(null);
      return;
    }
    const updated = await BudgetService.update(workId, item, parsed);
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    setEditingId(null);
  };

  const createRevision = async () => {
    if (!revisionReason.trim()) return;
    const rev = await BudgetService.createRevision(
      workId,
      revisionReason.trim(),
      user?.name ?? user?.email ?? 'usuário',
    );
    setRevisions((prev) => [rev, ...prev]);
    setRevisionReason('');
    setShowRevisionModal(false);
  };

  const exportCSV = () => {
    const csv = BudgetService.toCSV(items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orcamento_obra_${workId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryStats = [
    { label: 'Orçamento Total', value: formatCurrency(totalPlanned), icon: DollarSign, color: '#1A5276', bg: '#EBF5FB' },
    {
      label: 'Custo Atual',
      value: formatCurrency(totalActual),
      icon: TrendingUp,
      color: totalActual > totalPlanned ? '#C0392B' : '#1E8449',
      bg: totalActual > totalPlanned ? '#FDEDEC' : '#E8F5E9',
    },
    {
      label: 'Variação',
      value: `${totalVariation > 0 ? '+' : ''}${totalVariation.toFixed(1)}%`,
      icon: Percent,
      color: totalVariation > 0 ? '#C0392B' : '#1E8449',
      bg: totalVariation > 0 ? '#FDEDEC' : '#E8F5E9',
    },
    {
      label: 'Margem',
      value: work ? `${work.margin}%` : '—',
      icon: work && work.margin > 0 ? TrendingUp : TrendingDown,
      color: work && work.margin > 0 ? '#1E8449' : '#C0392B',
      bg: work && work.margin > 0 ? '#E8F5E9' : '#FDEDEC',
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#7A7670', fontFamily: 'DM Sans' }}>
        Carregando orçamento…
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="bg">
        <div className="bg-summary">
          {summaryStats.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} className="bg-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
                <div className="bg-stat-icon" style={{ background: s.bg }}>
                  <Icon size={18} color={s.color} />
                </div>
                <div>
                  <div className="bg-stat-val">{s.value}</div>
                  <div className="bg-stat-label">{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-actions">
          {canEdit && (
            <button className="bg-btn primary" onClick={() => setShowRevisionModal(true)}>
              <Plus size={14} /> Criar revisão
            </button>
          )}
          <button className="bg-btn" onClick={() => setShowHistory((v) => !v)}>
            <History size={14} /> Histórico de revisões ({revisions.length})
          </button>
          {canExport && (
            <button className="bg-btn" onClick={exportCSV}>
              <Download size={14} /> Exportar CSV
            </button>
          )}
        </div>

        {showHistory && revisions.length > 0 && (
          <div className="bg-table-wrap" style={{ padding: 16 }}>
            <div className="bg-table-title" style={{ marginBottom: 12 }}>Revisões</div>
            <div className="bg-rev-list">
              {revisions.map((r) => (
                <div key={r.id} className="bg-rev-item">
                  <div>
                    <span className="bg-rev-num">#{r.revisionNumber}</span>
                    {' — '}
                    <span style={{ fontFamily: 'var(--font-numeric)', fontWeight: 600 }}>
                      {formatCurrency(r.totalPlanned)} previsto / {formatCurrency(r.totalActual)} realizado
                    </span>
                    {' — '}
                    <span style={{ color: '#7A7670' }}>{new Date(r.createdAt).toLocaleString('pt-BR')}</span>
                    {' — '}
                    <span>{r.createdBy}</span>
                  </div>
                  <div className="bg-rev-reason">"{r.reason}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-table-wrap">
          <div className="bg-table-header">
            <span className="bg-table-title">Itens do Orçamento</span>
            <div className="bg-cat-tabs">
              {categories.map((c) => (
                <button key={c} className={`bg-cat-tab${selectedCat === c ? ' active' : ''}`} onClick={() => setSelectedCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="bg-tbl">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th style={{ textAlign: 'right' }}>Previsto</th>
                  <th style={{ textAlign: 'right' }}>Realizado</th>
                  <th style={{ textAlign: 'right' }}>Diferença</th>
                  {canEdit && <th />}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const diff = item.actualCost - item.plannedCost;
                  const pctDiff = item.plannedCost === 0 ? 0 : (diff / item.plannedCost) * 100;
                  const isOver = diff > 0;
                  const cc = catColors[item.category] || { bg: '#F5F5F5', color: '#7A7670' };
                  const isEditing = editingId === item.id;
                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="bg-tbl-cat" style={{ background: cc.bg, color: cc.color }}>{item.category}</span>
                      </td>
                      <td style={{ color: 'var(--ink)', fontWeight: 400 }}>{item.description}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-numeric)', fontVariantNumeric: 'tabular-nums', fontWeight: 500, whiteSpace: 'nowrap' }}>{formatCurrency(item.plannedCost)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-numeric)', fontVariantNumeric: 'tabular-nums', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {isEditing ? (
                          <input
                            className="bg-edit-input"
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(item)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(item);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                        ) : (
                          formatCurrency(item.actualCost)
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span
                          className="bg-tbl-diff"
                          style={{
                            fontFamily: 'var(--font-numeric)',
                            fontVariantNumeric: 'tabular-nums',
                            background: diff === 0 ? '#F5F5F5' : isOver ? '#FDEDEC' : '#E8F5E9',
                            color: diff === 0 ? '#7A7670' : isOver ? '#C0392B' : '#1E8449',
                          }}
                        >
                          {isOver ? <ArrowUpRight size={12} /> : diff < 0 ? <ArrowDownRight size={12} /> : null}
                          {pctDiff > 0 ? '+' : ''}
                          {pctDiff.toFixed(1)}%
                        </span>
                      </td>
                      {canEdit && (
                        <td style={{ textAlign: 'right' }}>
                          {!isEditing && (
                            <button
                              className="bg-btn"
                              style={{ padding: '4px 10px' }}
                              onClick={() => startEdit(item)}
                              aria-label="Editar realizado"
                            >
                              <FileEdit size={12} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-totals">
            <div className="bg-total-item">
              <div className="bg-total-val">{formatCurrency(totalPlanned)}</div>
              <div className="bg-total-label">Total Previsto</div>
            </div>
            <div className="bg-total-item">
              <div className="bg-total-val" style={{ color: totalActual > totalPlanned ? '#C0392B' : '#1E8449' }}>
                {formatCurrency(totalActual)}
              </div>
              <div className="bg-total-label">Total Realizado</div>
            </div>
          </div>
        </div>
      </div>

      {showRevisionModal && (
        <div className="bg-modal" onClick={() => setShowRevisionModal(false)}>
          <div className="bg-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="bg-modal-title">Nova revisão de orçamento</div>
            <div className="bg-modal-sub">
              Snapshota o orçamento atual ({formatCurrency(totalPlanned)} previsto / {formatCurrency(totalActual)} realizado).
              Descreva o motivo para rastreabilidade.
            </div>
            <label className="bg-modal-label">Motivo da revisão</label>
            <textarea
              className="bg-modal-textarea"
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="Ex.: Reajuste de preço de insumos — março/2026"
            />
            <div className="bg-modal-actions">
              <button className="bg-btn" onClick={() => setShowRevisionModal(false)}>
                <X size={14} /> Cancelar
              </button>
              <button className="bg-btn primary" onClick={createRevision} disabled={!revisionReason.trim()}>
                Criar revisão
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
