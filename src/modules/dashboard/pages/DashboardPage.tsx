import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Building2, AlertTriangle, DollarSign, TrendingUp,
  CheckCircle2, Clock, Percent, ArrowRight, Plus,
} from 'lucide-react';
import { KpiCards } from '@/modules/dashboard/components/KpiCards';
import { FinancialChart } from '@/modules/dashboard/components/FinancialChart';
import { WorksEvolutionChart } from '@/modules/dashboard/components/WorksEvolutionChart';
import { WorksStatusTable } from '@/modules/dashboard/components/WorksStatusTable';
import { RiskAlerts } from '@/modules/dashboard/components/RiskAlerts';
import { mockWorks, mockRiskAlerts } from '@/modules/shared/data/mockData';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.10);}
.db{font-family:'DM Sans',sans-serif;color:var(--ink);display:flex;flex-direction:column;gap:22px;}
.db-hero{background:linear-gradient(135deg,var(--ink) 0%,#2C2820 100%);border-radius:14px;padding:32px 36px;position:relative;overflow:hidden;}
.db-hero::after{content:'';position:absolute;top:-60px;right:-60px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(184,146,42,0.15) 0%,transparent 70%);pointer-events:none;}
.db-hero::before{content:'';position:absolute;bottom:-40px;left:30%;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(184,146,42,0.08) 0%,transparent 70%);pointer-events:none;}
.db-hero-tag{font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--gold);display:inline-flex;align-items:center;gap:6px;margin-bottom:14px;}
.db-hero-tag span{width:24px;height:1px;background:var(--gold);display:inline-block;}
.db-hero-h{font-family:'Cormorant Garamond',serif;font-size:clamp(26px,3vw,36px);font-weight:700;color:#fff;line-height:1.1;letter-spacing:-0.5px;margin-bottom:8px;}
.db-hero-h em{font-style:italic;color:var(--gold2);}
.db-hero-sub{font-size:13.5px;color:rgba(255,255,255,0.50);font-weight:300;line-height:1.7;}
.db-hero-actions{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;}
.db-hero-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-size:12.5px;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;border:none;}
.db-hero-btn-primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#fff;}
.db-hero-btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(184,146,42,0.35);}
.db-hero-btn-ghost{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.75);border:1px solid rgba(255,255,255,0.12);}
.db-hero-btn-ghost:hover{background:rgba(255,255,255,0.14);color:#fff;}
.db-section-label{font-size:10px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;color:var(--gold);margin-bottom:6px;}
.db-section-title{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:var(--ink);letter-spacing:-0.3px;}
.db-charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.db-bottom-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:18px;}
@media(max-width:1024px){.db-charts-grid,.db-bottom-grid{grid-template-columns:1fr;}}
`;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const activeWorks = mockWorks.filter(w => w.status === 'em_andamento').length;
  const delayedWorks = mockWorks.filter(w => w.status === 'atrasada').length;
  const completedThisMonth = mockWorks.filter(w => w.status === 'concluida').length;
  const totalPlanned = mockWorks.reduce((sum, w) => sum + w.plannedCost, 0);
  const totalActual = mockWorks.reduce((sum, w) => sum + w.currentCost, 0);
  const avgMargin = mockWorks.reduce((sum, w) => sum + w.margin, 0) / mockWorks.length;
  const pendingExtras = 3;

  const kpis = [
    { label: 'Obras Ativas', value: activeWorks, icon: Building2, color: '#1E8449', bg: '#E8F5E9' },
    { label: 'Obras Atrasadas', value: delayedWorks, icon: Clock, color: '#C0392B', bg: '#FDEDEC' },
    { label: 'Custo Previsto', value: `R$ ${(totalPlanned / 1e6).toFixed(1)}M`, icon: DollarSign, color: '#1A5276', bg: '#EBF5FB' },
    { label: 'Custo Realizado', value: `R$ ${(totalActual / 1e6).toFixed(1)}M`, icon: TrendingUp, color: '#B7770D', bg: '#FFF8E1' },
    { label: 'Margem Média', value: `${avgMargin.toFixed(1)}%`, icon: Percent, color: '#B8922A', bg: '#F0E4C4' },
    { label: 'Extras Pendentes', value: pendingExtras, icon: AlertTriangle, color: '#E67E22', bg: '#FFF3E0' },
    { label: 'Concluídas no Mês', value: completedThisMonth, icon: CheckCircle2, color: '#1E8449', bg: '#E8F5E9' },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="db">
        {/* Hero */}
        <motion.div className="db-hero" custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="db-hero-tag"><span />Gestão de Obras</div>
          <h1 className="db-hero-h">
            Bem-vindo, <em>{user?.name?.split(' ')[0] || 'gestor'}</em>
          </h1>
          <p className="db-hero-sub">
            Visão macro de toda sua operação — acompanhe obras, custos, prazos e riscos em tempo real.
          </p>
          <div className="db-hero-actions">
            <button className="db-hero-btn db-hero-btn-primary" onClick={() => navigate('/works')}>
              <Plus size={14} /> Nova Obra
            </button>
            <button className="db-hero-btn db-hero-btn-ghost" onClick={() => navigate('/works')}>
              Ver Todas as Obras <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <KpiCards kpis={kpis} />
        </motion.div>

        {/* Gráficos */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <div style={{ marginBottom: 12 }}>
            <div className="db-section-label">Análise Financeira</div>
            <div className="db-section-title">Visão Consolidada</div>
          </div>
          <div className="db-charts-grid">
            <FinancialChart />
            <WorksEvolutionChart />
          </div>
        </motion.div>

        {/* Tabela + Alertas */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="db-bottom-grid">
            <div>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="db-section-label">Portfolio</div>
                  <div className="db-section-title">Obras em Andamento</div>
                </div>
                <button
                  onClick={() => navigate('/works')}
                  style={{ fontSize: 12, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  Ver todas <ArrowRight size={12} />
                </button>
              </div>
              <WorksStatusTable works={mockWorks.filter(w => w.status !== 'concluida').slice(0, 5)} />
            </div>
            <div>
              <div style={{ marginBottom: 12 }}>
                <div className="db-section-label">Monitoramento</div>
                <div className="db-section-title">Alertas de Risco</div>
              </div>
              <RiskAlerts alerts={mockRiskAlerts} />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
