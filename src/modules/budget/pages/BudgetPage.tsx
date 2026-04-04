import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { mockWorks, mockBudgetItems } from '@/modules/shared/data/mockData';

const CSS = `
.bg{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:18px;}
.bg-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;}
.bg-stat{background:#fff;border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:20px;display:flex;align-items:center;gap:14px;box-shadow:0 2px 10px rgba(26,24,20,0.04);position:relative;overflow:hidden;}
.bg-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
.bg-stat-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.bg-stat-val{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;color:var(--ink,#1A1814);line-height:1.1;}
.bg-stat-label{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.4px;color:var(--ink3,#7A7670);margin-top:2px;}
.bg-table-wrap{background:#fff;border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));box-shadow:0 2px 10px rgba(26,24,20,0.04);overflow:hidden;}
.bg-table-header{padding:16px 20px;border-bottom:1px solid rgba(26,24,20,0.06);display:flex;align-items:center;justify-content:space-between;}
.bg-table-title{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink,#1A1814);}
.bg-cat-tabs{display:flex;gap:4px;}
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
.bg-total-val{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;color:var(--ink,#1A1814);}
.bg-total-label{font-size:10.5px;color:var(--ink3,#7A7670);text-transform:uppercase;letter-spacing:0.4px;font-weight:500;}
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
  const work = mockWorks.find(w => w.id === id) || mockWorks[0];
  const [selectedCat, setSelectedCat] = useState<string>('Todas');

  const categories = ['Todas', ...Array.from(new Set(mockBudgetItems.map(i => i.category)))];
  const filteredItems = selectedCat === 'Todas'
    ? mockBudgetItems
    : mockBudgetItems.filter(i => i.category === selectedCat);

  const totalPlanned = mockBudgetItems.reduce((s, i) => s + i.plannedCost, 0);
  const totalActual = mockBudgetItems.reduce((s, i) => s + i.actualCost, 0);
  const totalVariation = ((totalActual - totalPlanned) / totalPlanned * 100);

  const summaryStats = [
    { label: 'Orçamento Total', value: formatCurrency(totalPlanned), icon: DollarSign, color: '#1A5276', bg: '#EBF5FB' },
    { label: 'Custo Atual', value: formatCurrency(totalActual), icon: TrendingUp, color: totalActual > totalPlanned ? '#C0392B' : '#1E8449', bg: totalActual > totalPlanned ? '#FDEDEC' : '#E8F5E9' },
    { label: 'Variação', value: `${totalVariation > 0 ? '+' : ''}${totalVariation.toFixed(1)}%`, icon: Percent, color: totalVariation > 0 ? '#C0392B' : '#1E8449', bg: totalVariation > 0 ? '#FDEDEC' : '#E8F5E9' },
    { label: 'Margem', value: `${work.margin}%`, icon: work.margin > 0 ? TrendingUp : TrendingDown, color: work.margin > 0 ? '#1E8449' : '#C0392B', bg: work.margin > 0 ? '#E8F5E9' : '#FDEDEC' },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="bg">
        {/* Summary */}
        <div className="bg-summary">
          {summaryStats.map(s => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                className="bg-stat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
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

        {/* Table */}
        <div className="bg-table-wrap">
          <div className="bg-table-header">
            <span className="bg-table-title">Itens do Orçamento</span>
            <div className="bg-cat-tabs">
              {categories.map(c => (
                <button
                  key={c}
                  className={`bg-cat-tab${selectedCat === c ? ' active' : ''}`}
                  onClick={() => setSelectedCat(c)}
                >
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
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const diff = item.actualCost - item.plannedCost;
                  const pctDiff = (diff / item.plannedCost * 100);
                  const isOver = diff > 0;
                  const cc = catColors[item.category] || { bg: '#F5F5F5', color: '#7A7670' };
                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="bg-tbl-cat" style={{ background: cc.bg, color: cc.color }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--ink)', fontWeight: 400 }}>{item.description}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500, whiteSpace: 'nowrap' }}>{formatCurrency(item.plannedCost)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500, whiteSpace: 'nowrap' }}>{formatCurrency(item.actualCost)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span
                          className="bg-tbl-diff"
                          style={{
                            background: diff === 0 ? '#F5F5F5' : isOver ? '#FDEDEC' : '#E8F5E9',
                            color: diff === 0 ? '#7A7670' : isOver ? '#C0392B' : '#1E8449',
                          }}
                        >
                          {isOver ? <ArrowUpRight size={12} /> : diff < 0 ? <ArrowDownRight size={12} /> : null}
                          {pctDiff > 0 ? '+' : ''}{pctDiff.toFixed(1)}%
                        </span>
                      </td>
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
    </>
  );
}
