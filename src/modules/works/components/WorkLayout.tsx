import { useState, useEffect } from 'react';
import { Outlet, NavLink, useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, CalendarClock, DollarSign, FilePlus2, BookOpen, ShieldAlert,
  ArrowLeft, MapPin, User, Building2, Loader2,
} from 'lucide-react';
import type { Work, AddressDto } from '@/modules/shared/types';
import { STATUS_CONFIG } from '@/modules/shared/types';

function formatAddress(address: AddressDto | string): string {
  if (!address) return '—';
  if (typeof address === 'string') return address || '—';
  const { street, number, neighborhood, city, state } = address;
  return [street, number ? `nº ${number}` : null, neighborhood, city, state]
    .filter(Boolean)
    .join(', ') || '—';
}
import { WorksService } from '@/services/works/worksService';

const CSS = `
.wk{font-family:'DM Sans',sans-serif;color:var(--ink,#1A1814);display:flex;flex-direction:column;gap:20px;}
.wk-back{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--ink3,#7A7670);cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif;padding:0;transition:color 0.14s;}
.wk-back:hover{color:var(--gold,#B8922A);}
.wk-hero{background:linear-gradient(135deg,var(--ink,#1A1814) 0%,#2C2820 100%);border-radius:14px;padding:28px 32px;position:relative;overflow:hidden;}
.wk-hero::after{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(184,146,42,0.15) 0%,transparent 70%);pointer-events:none;}
.wk-hero-top{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.wk-hero-top>div:first-child{min-width:0;flex:1;}
.wk-hero-name{font-family:'Cormorant Garamond',serif;font-size:clamp(22px,2.5vw,30px);font-weight:700;color:#fff;line-height:1.1;letter-spacing:-0.3px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;}
.wk-hero-client{font-size:13px;color:rgba(255,255,255,0.50);margin-top:5px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
.wk-hero-meta{display:flex;gap:16px;margin-top:14px;flex-wrap:wrap;max-width:100%;}
.wk-hero-meta-item{display:flex;align-items:center;gap:5px;font-size:12px;color:rgba(255,255,255,0.55);max-width:100%;min-width:0;}
.wk-hero-meta-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
.wk-hero-progress{display:flex;align-items:center;gap:12px;margin-top:18px;}
.wk-hero-progress-bar{flex:1;max-width:300px;height:6px;border-radius:10px;background:rgba(255,255,255,0.12);overflow:hidden;}
.wk-hero-progress-fill{height:100%;border-radius:10px;background:linear-gradient(90deg,var(--gold,#B8922A),var(--gold2,#D4A843));transition:width 0.5s ease;}
.wk-hero-progress-label{font-size:13px;font-weight:600;color:var(--gold2,#D4A843);}
.wk-tabs{display:flex;gap:2px;background:#fff;border-radius:10px;border:1px solid var(--bdr,rgba(26,24,20,0.10));padding:4px;box-shadow:0 2px 10px rgba(26,24,20,0.04);overflow-x:auto;}
.wk-tab{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:7px;font-size:12.5px;font-weight:400;color:var(--ink3,#7A7670);text-decoration:none;transition:all 0.16s;white-space:nowrap;border:none;background:none;cursor:pointer;font-family:'DM Sans',sans-serif;}
.wk-tab:hover{color:var(--ink,#1A1814);background:var(--cream,#F7F4EF);}
.wk-tab.active{color:var(--gold,#B8922A);background:rgba(184,146,42,0.08);font-weight:500;}
`;

const tabs = [
  { label: 'Visão Geral', path: '', icon: LayoutDashboard },
  { label: 'Cronograma', path: '/schedule', icon: CalendarClock },
  { label: 'Orçamento', path: '/budget', icon: DollarSign },
  { label: 'Extras', path: '/extras', icon: FilePlus2 },
  { label: 'Diário de Obra', path: '/daily-log', icon: BookOpen },
  { label: 'Incidentes', path: '/incidents', icon: ShieldAlert },
];

export function WorkLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    WorksService.getById(id)
      .then((w) => setWork(w ?? null))
      .catch(() => setWork(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--gold, #B8922A)' }} />
      </div>
    );
  }

  if (!work) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink3, #7A7670)' }}>
        <Building2 size={40} style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 14, fontWeight: 500 }}>Obra não encontrada</div>
        <button onClick={() => navigate('/works')} style={{ marginTop: 12, color: 'var(--gold, #B8922A)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          Voltar para obras
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[work.status] ?? STATUS_CONFIG.planejada;
  const executionPct = work.totalBudget > 0 ? Math.min(100, Math.round((work.currentCost / work.totalBudget) * 100)) : 0;

  const basePath = `/works/${id}`;

  return (
    <>
      <style>{CSS}</style>
      <div className="wk">
        <button className="wk-back" onClick={() => navigate('/works')}>
          <ArrowLeft size={13} /> Voltar para obras
        </button>

        {/* Hero */}
        <motion.div
          className="wk-hero"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="wk-hero-top">
            <div>
              <div className="wk-hero-name">{work.name}</div>
              {work.description && <div className="wk-hero-client">{work.description}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 500,
                background: statusCfg.bg,
                color: statusCfg.color,
              }}>
                ● {statusCfg.label}
              </span>
            </div>
          </div>
          <div className="wk-hero-meta">
            <div className="wk-hero-meta-item"><MapPin size={13} /> <span>{formatAddress(work.address)}</span></div>
          </div>
          <div className="wk-hero-progress">
            <div className="wk-hero-progress-bar">
              <div className="wk-hero-progress-fill" style={{ width: `${executionPct}%` }} />
            </div>
            <span className="wk-hero-progress-label">{executionPct}% executado</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="wk-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const fullPath = basePath + tab.path;
            const isActive = tab.path === ''
              ? location.pathname === basePath || location.pathname === basePath + '/'
              : location.pathname.startsWith(fullPath);
            return (
              <NavLink
                key={tab.label}
                to={fullPath}
                end={tab.path === ''}
                className={`wk-tab${isActive ? ' active' : ''}`}
              >
                <Icon size={14} /> {tab.label}
              </NavLink>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </div>
    </>
  );
}
