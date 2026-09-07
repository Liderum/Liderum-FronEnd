import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, Building2, ArrowRight, MapPin,
  Calendar, LayoutGrid, List, Loader2,
} from 'lucide-react';
import type { Work, WorkStatus, AddressDto } from '@/modules/shared/types';
import { STATUS_CONFIG } from '@/modules/shared/types';
import { WorksService } from '@/services/works/worksService';

const CSS = `
.wl{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:20px;}
.wl-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.wl-title-wrap{}
.wl-tag{font-size:10px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:var(--gold,#B8922A);margin-bottom:4px;}
.wl-title{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:var(--ink,#1A1814);letter-spacing:-0.5px;}
.wl-btn-new{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;background:linear-gradient(135deg,var(--brand-gold),var(--brand-gold2));color:#fff;transition:all 0.2s;box-shadow:0 2px 10px rgba(184,146,42,0.25);}
.wl-btn-new:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(184,146,42,0.35);}
.wl-filters{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.wl-search{display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;border:1px solid var(--bdr,rgba(26,24,20,0.10));background:var(--card-bg,#fff);flex:1;min-width:200px;max-width:360px;}
.wl-search input{border:none;outline:none;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);background:transparent;flex:1;min-width:0;}
.wl-search input::placeholder{color:var(--ink3,#7A7670);}
.wl-filter-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border-radius:7px;font-size:12px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;border:1px solid var(--bdr,rgba(26,24,20,0.10));background:var(--card-bg,#fff);color:var(--ink3,#7A7670);transition:all 0.16s;}
.wl-filter-btn:hover,.wl-filter-btn.active{border-color:var(--gold,#B8922A);color:var(--gold,#B8922A);background:rgba(184,146,42,0.05);}
.wl-view-toggle{display:flex;border:1px solid var(--bdr,rgba(26,24,20,0.10));border-radius:7px;overflow:hidden;}
.wl-view-btn{padding:7px 10px;background:var(--card-bg,#fff);border:none;cursor:pointer;color:var(--ink3,#7A7670);display:flex;align-items:center;transition:all 0.14s;}
.wl-view-btn.active{background:var(--cream,#F7F4EF);color:var(--gold,#B8922A);}
.wl-view-btn+.wl-view-btn{border-left:1px solid var(--bdr,rgba(26,24,20,0.10));}
.wl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px;}
.wl-card{background:var(--card-bg,#fff);border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:22px 24px;cursor:pointer;transition:all 0.22s;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:14px;box-shadow:0 2px 10px rgba(26,24,20,0.04);}
.wl-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold,#B8922A),var(--gold2,#D4A843));transform:scaleX(0);transform-origin:left;transition:transform 0.22s;}
.wl-card:hover::before{transform:scaleX(1);}
.wl-card:hover{box-shadow:0 8px 30px rgba(26,24,20,0.10);transform:translateY(-2px);}
.wl-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.wl-card-name{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:var(--ink,#1A1814);line-height:1.2;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
.wl-card-client{font-size:12px;color:var(--ink3,#7A7670);margin-top:3px;}
.wl-card-meta{display:flex;flex-direction:column;gap:8px;margin-top:4px;}
.wl-card-meta-row{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--ink3,#7A7670);}
.wl-card-progress{display:flex;align-items:center;gap:10px;}
.wl-card-progress-bar{flex:1;height:6px;border-radius:10px;background:rgba(26,24,20,0.06);overflow:hidden;}
.wl-card-progress-fill{height:100%;border-radius:10px;transition:width 0.5s ease;}
.wl-card-footer{display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid rgba(26,24,20,0.06);}
.wl-card-cost{font-family:var(--font-numeric);font-size:14px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink,#1A1814);}
.wl-card-cost-label{font-family:var(--font-numeric);font-size:10.5px;color:var(--ink3,#7A7670);font-weight:400;font-variant-numeric:tabular-nums;}
.wl-card-arrow{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--gold,#B8922A);font-weight:500;}
.wl-empty{text-align:center;padding:60px 20px;color:var(--ink3,#7A7670);}
@media(max-width:640px){.wl-grid{grid-template-columns:1fr;}}
`;

type FilterKey = 'todas' | WorkStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'em_andamento', label: 'Em andamento' },
  { key: 'atrasada', label: 'Atrasadas' },
  { key: 'concluida', label: 'Concluídas' },
];

function formatAddress(address: AddressDto | string): string {
  if (!address) return '—';
  if (typeof address === 'string') return address || '—';
  const { street, number, neighborhood, city, state } = address;
  const parts = [street, number ? `nº ${number}` : null, neighborhood, city, state]
    .filter(Boolean)
    .join(', ');
  return parts || '—';
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

// Formata "YYYY-MM-DD" → "DD/MM/YYYY" sem usar o construtor Date(),
// evitando conversão de fuso horário que causaria exibir um dia a menos no Brasil.
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = dateStr.substring(0, 10);
  const [year, month, day] = d.split('-');
  return `${day}/${month}/${year}`;
}

function getProgressColor(pct: number) {
  if (pct >= 70) return '#1E8449';
  if (pct >= 40) return '#B8922A';
  return '#E67E22';
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function WorksListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('todas');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    WorksService.list()
      .then(setWorks)
      .catch(() => setWorks([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--gold, #B8922A)' }} />
      </div>
    );
  }

  const filtered = works.filter(w => {
    const addressStr = formatAddress(w.address).toLowerCase();
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
      addressStr.includes(search.toLowerCase());
    const matchFilter = filter === 'todas' || w.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <style>{CSS}</style>
      <div className="wl">
        {/* Header */}
        <div className="wl-header">
          <div className="wl-title-wrap">
            <div className="wl-tag">Portfolio</div>
            <h1 className="wl-title">Obras</h1>
          </div>
          <button className="wl-btn-new" onClick={() => navigate('/works/new')}>
            <Plus size={15} /> Nova Obra
          </button>
        </div>

        {/* Filtros */}
        <div className="wl-filters">
          <div className="wl-search">
            <Search size={14} color="var(--ink3)" />
            <input
              placeholder="Buscar obra ou cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`wl-filter-btn${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          <div className="wl-view-toggle">
            <button className={`wl-view-btn${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')}>
              <LayoutGrid size={14} />
            </button>
            <button className={`wl-view-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}>
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Resultados */}
        {filtered.length === 0 ? (
          <div className="wl-empty">
            <Building2 size={40} color="var(--cream2)" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>Nenhuma obra encontrada</div>
            <div style={{ fontSize: 12.5, marginTop: 4 }}>Tente ajustar os filtros ou adicione uma nova obra.</div>
          </div>
        ) : (
          <div className="wl-grid">
            {filtered.map((work, i) => (
              <WorkCard key={work.id} work={work} index={i} onClick={() => navigate(`/works/${work.id}`)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function WorkCard({ work, index, onClick }: { work: Work; index: number; onClick: () => void }) {
  const statusCfg = STATUS_CONFIG[work.status] ?? STATUS_CONFIG.planejada;
  const marginPct = work.marginPercent ?? (work.totalBudget > 0 ? (work.margin / work.totalBudget) * 100 : 0);
  const executionPct = work.totalBudget > 0 ? Math.min(100, Math.round((work.currentCost / work.totalBudget) * 100)) : 0;

  return (
    <motion.div
      className="wl-card"
      onClick={onClick}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <div className="wl-card-top">
        <div>
          <div className="wl-card-name">{work.name}</div>
          <div className="wl-card-client">{work.customerId ? `Cliente: ${work.customerId}` : ''}</div>
        </div>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 10.5,
          fontWeight: 500,
          background: statusCfg.bg,
          color: statusCfg.color,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          ● {statusCfg.label}
        </span>
      </div>

      <div className="wl-card-meta">
        <div className="wl-card-meta-row">
          <MapPin size={12} /> {formatAddress(work.address)}
        </div>
        <div className="wl-card-meta-row">
          <Calendar size={12} /> Início: {formatDate(work.startDate)}
        </div>
        {work.expectedEndDate && (
          <div className="wl-card-meta-row">
            <Calendar size={12} /> Prazo: {formatDate(work.expectedEndDate)}
          </div>
        )}
      </div>

      {/* Execução (custo executado vs orçamento) */}
      <div className="wl-card-progress">
        <div className="wl-card-progress-bar">
          <div
            className="wl-card-progress-fill"
            style={{
              width: `${executionPct}%`,
              background: getProgressColor(100 - executionPct),
            }}
          />
        </div>
        <span style={{ fontFamily: 'var(--font-numeric)', fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>{executionPct}%</span>
      </div>

      {/* Footer */}
      <div className="wl-card-footer">
        <div>
          <div className="wl-card-cost">{formatCurrency(work.currentCost)}</div>
          <div className="wl-card-cost-label">de {formatCurrency(work.totalBudget)} previsto</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 9.5,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 8,
            background: marginPct >= 20 ? '#E8F5E9' : marginPct >= 0 ? '#FFF8E1' : '#FDEDEC',
            color: marginPct >= 20 ? '#1E8449' : marginPct >= 0 ? '#B7770D' : '#C0392B',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            Margem {marginPct.toFixed(0)}%
          </span>
          <div className="wl-card-arrow">
            Detalhe <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
