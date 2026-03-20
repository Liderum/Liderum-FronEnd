import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionCleanup } from '@/hooks/useSessionCleanup';
import { Input } from '@/components/ui/input';

const PRICES = { p1: [299, 239], p2: [699, 559], p3: [1399, 1119] } as const;

const features = [
  { icon: '🛒', title: 'Vendas', text: 'Pedidos, funil comercial, metas por equipe e rastreabilidade de cada negócio — do primeiro contato ao faturamento.' },
  { icon: '💰', title: 'Financeiro', text: 'Contas a pagar e receber, fluxo de caixa, conciliação bancária e visão de resultado em tempo real para tomada de decisão.' },
  { icon: '📦', title: 'Estoque', text: 'Entradas, saídas, reposição automática por mínimo e máximo, rastreabilidade de lote e alertas de ruptura antes que ocorram.' },
  { icon: '🔐', title: 'Segurança', text: 'Controle de acesso por perfil e departamento, trilha de auditoria completa e políticas de permissão granulares por módulo.' },
  { icon: '📊', title: 'Relatórios inteligentes', text: 'Dashboards executivos e operacionais gerados automaticamente — com dados de todos os módulos cruzados em uma só visão.' },
  { icon: '⚙️', title: 'Automação de rotina', text: 'Aprovações, alertas, movimentações e notificações configuráveis para eliminar tarefas manuais repetitivas do seu time.' }
];

const testimonials = [
  { initial: 'M', name: 'Marcos Andrade', role: 'CEO · Grupo Atlas Distribuição', text: 'Unificamos vendas, estoque e financeiro em uma plataforma. A visão integrada mudou como tomamos decisões — antes vivíamos apagando incêndio.' },
  { initial: 'P', name: 'Patrícia Souza', role: 'Diretora de Operações · Fenix Industrial', text: 'O controle de estoque com alerta de ruptura nos poupou prejuízos reais. Hoje o time de compras age antes do problema acontecer.' },
  { initial: 'R', name: 'Ricardo Lemos', role: 'CFO · BRV Logística', text: 'Com o módulo financeiro integrado ao de vendas, fechamos o mês em horas. O fluxo de caixa atualizado em tempo real transformou nossa previsibilidade.' }
];

const painItems = [
  'Vendas, financeiro e estoque em sistemas separados',
  'Dados inconsistentes entre setores e reuniões improdutivas',
  'Decisões baseadas em relatórios com 3 dias de defasagem',
  'Time de TI sobrecarregado integrando ferramentas avulsas',
  'Sem rastreabilidade de quem aprovou ou alterou registros',
  'Processos manuais que escalam mal conforme a empresa cresce'
];

const gainItems = [
  'Todos os módulos integrados e falando a mesma linguagem',
  'Visão única de operação para liderança e time',
  'Dados em tempo real para decisão sem esperar fechamento',
  'Controle de acesso por perfil com trilha de auditoria',
  'Alertas automáticos de ruptura, pendência e divergência',
  'Estrutura modular que cresce com a empresa sem retrabalho'
];

export function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');

  useSessionCleanup();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('ldr-visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.ldr-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLead = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/contact');
  };

  const price = (key: keyof typeof PRICES) => `R$${PRICES[key][annual ? 1 : 0]}`;
  const period = annual ? '/mês · cobrado anualmente' : '/mês · cobrado mensalmente';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --cream:#F7F4EF; --cream2:#EDE9E1; --ink:#1A1814; --ink2:#3D3A34; --ink3:#7A7670;
          --gold:#B8922A; --gold2:#D4A843; --gold-light:#F0E4C4;
          --bdr:rgba(26,24,20,0.1); --sh:0 2px 24px rgba(26,24,20,0.08); --sh-lg:0 8px 48px rgba(26,24,20,0.12);
        }
        .ldr-root { font-family:'DM Sans',sans-serif; background:var(--cream); color:var(--ink); line-height:1.7; overflow-x:hidden; }
        .ldr-root *, .ldr-root *::before, .ldr-root *::after { box-sizing:border-box; }

        /* NAVBAR */
        .ldr-nav { position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 48px;display:flex;align-items:center;justify-content:space-between;transition:all 0.4s; }
        .ldr-nav.ldr-scrolled { background:rgba(247,244,239,0.96);backdrop-filter:blur(14px);padding:14px 48px;border-bottom:1px solid var(--bdr);box-shadow:var(--sh); }
        .ldr-logo { font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink);text-decoration:none;letter-spacing:-0.5px;cursor:pointer;background:none;border:none; }
        .ldr-logo span { color:var(--gold); }
        .ldr-navlinks { display:flex;gap:36px;list-style:none; }
        .ldr-navlinks button { background:none;border:none;color:var(--ink2);font-size:14px;font-weight:400;letter-spacing:0.3px;cursor:pointer;transition:color 0.2s;font-family:'DM Sans',sans-serif; }
        .ldr-navlinks button:hover { color:var(--gold); }
        .ldr-nav-right { display:flex;align-items:center;gap:8px; }
        .ldr-nav-login { background:transparent;color:var(--ink2);padding:8px 18px;border-radius:6px;font-size:14px;font-weight:400;border:1px solid var(--bdr);cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif; }
        .ldr-nav-login:hover { color:var(--gold);border-color:rgba(184,146,42,0.4); }
        .ldr-navcta { background:var(--ink);color:#fff;padding:10px 24px;border-radius:6px;font-size:14px;font-weight:500;border:none;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif; }
        .ldr-navcta:hover { background:var(--gold);transform:translateY(-1px); }

        /* HERO */
        .ldr-hero { min-height:100vh;display:flex;align-items:center;padding:120px 48px 80px;position:relative;overflow:hidden; }
        .ldr-hero-bg { position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 60% 50% at 70% 50%,rgba(184,146,42,0.08) 0%,transparent 70%),radial-gradient(ellipse 40% 60% at 20% 80%,rgba(184,146,42,0.05) 0%,transparent 60%); }
        .ldr-hero-grid { position:absolute;inset:0;z-index:0;opacity:0.4;background-image:linear-gradient(var(--bdr) 1px,transparent 1px),linear-gradient(90deg,var(--bdr) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%); }
        .ldr-hero-inner { position:relative;z-index:1;max-width:1200px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center; }
        .ldr-hero-tag { display:inline-flex;align-items:center;gap:8px;background:var(--gold-light);color:var(--gold);padding:6px 14px;border-radius:100px;font-size:12px;font-weight:500;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:24px;border:1px solid rgba(184,146,42,0.2); }
        .ldr-hero-tag::before { content:'';width:6px;height:6px;border-radius:50%;background:var(--gold); }
        .ldr-h1 { font-family:'Cormorant Garamond',serif;font-size:clamp(44px,5vw,68px);font-weight:700;line-height:1.08;letter-spacing:-1.5px;color:var(--ink);margin-bottom:24px; }
        .ldr-h1 em { font-style:italic;color:var(--gold); }
        .ldr-hero-sub { font-size:17px;color:var(--ink3);line-height:1.7;margin-bottom:40px;max-width:440px;font-weight:300; }
        .ldr-ctas { display:flex;gap:14px;flex-wrap:wrap; }
        .ldr-btn-primary { background:var(--ink);color:#fff;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:500;border:2px solid var(--ink);display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif; }
        .ldr-btn-primary:hover { background:var(--gold);border-color:var(--gold);transform:translateY(-2px);box-shadow:0 8px 24px rgba(184,146,42,0.3); }
        .ldr-btn-secondary { background:transparent;color:var(--ink);padding:14px 32px;border-radius:8px;font-size:15px;font-weight:500;border:2px solid var(--bdr);display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif; }
        .ldr-btn-secondary:hover { border-color:var(--ink);transform:translateY(-2px); }

        /* DASHBOARD */
        .ldr-visual { position:relative;animation:ldr-float 6s ease-in-out infinite; }
        @keyframes ldr-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .ldr-dashboard { background:#fff;border-radius:16px;box-shadow:var(--sh-lg),0 0 0 1px var(--bdr);overflow:hidden; }
        .ldr-dash-header { background:var(--ink);padding:14px 20px;display:flex;align-items:center;gap:8px; }
        .ldr-dash-dot { width:10px;height:10px;border-radius:50%; }
        .ldr-dash-title { font-size:12px;color:rgba(255,255,255,0.5);margin-left:auto;letter-spacing:0.5px; }
        .ldr-dash-body { padding:20px; }
        .ldr-dash-row { display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px; }
        .ldr-dash-card { background:var(--cream);border-radius:10px;padding:14px;border:1px solid var(--bdr); }
        .ldr-dash-label { font-size:10px;color:var(--ink3);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px; }
        .ldr-dash-val { font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink); }
        .ldr-dash-val.green { color:#2D7A47; }
        .ldr-dash-val.amber { color:var(--gold); }
        .ldr-dash-table { background:var(--cream);border-radius:10px;overflow:hidden;border:1px solid var(--bdr); }
        .ldr-dash-trow { display:grid;grid-template-columns:1fr 80px 80px;padding:10px 14px;font-size:11px;border-bottom:1px solid var(--bdr);align-items:center; }
        .ldr-dash-trow:last-child { border-bottom:none; }
        .ldr-dash-trow.hd { background:var(--cream2);font-weight:500;color:var(--ink3);font-size:10px;text-transform:uppercase;letter-spacing:0.5px; }
        .ldr-badge { display:inline-block;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:500; }
        .ldr-badge.ok { background:#D4EDDA;color:#2D7A47; }
        .ldr-badge.warn { background:var(--gold-light);color:var(--gold); }
        .ldr-badge.err { background:#FDECEA;color:#C0392B; }

        /* PROOF */
        .ldr-proof { background:#fff;padding:48px;border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr); }
        .ldr-proof-inner { max-width:1200px;margin:0 auto; }
        .ldr-proof-metrics { display:flex;gap:64px;justify-content:center;flex-wrap:wrap;margin-bottom:40px; }
        .ldr-metric { text-align:center; }
        .ldr-metric-val { font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:700;color:var(--ink);line-height:1;display:block; }
        .ldr-metric-val span { color:var(--gold); }
        .ldr-metric-label { font-size:13px;color:var(--ink3);margin-top:4px; }
        .ldr-proof-logos { display:flex;gap:32px;justify-content:center;flex-wrap:wrap;align-items:center; }
        .ldr-logo-pill { background:var(--cream);border:1px solid var(--bdr);padding:10px 24px;border-radius:8px;font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:600;color:var(--ink3);letter-spacing:0.5px; }

        /* SECTIONS */
        .ldr-section { padding:100px 48px; }
        .ldr-section-inner { max-width:1200px;margin:0 auto; }
        .ldr-section-tag { font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin-bottom:12px; }
        .ldr-h2 { font-family:'Cormorant Garamond',serif;font-size:clamp(34px,4vw,52px);font-weight:700;line-height:1.1;letter-spacing:-1px;margin-bottom:16px; }
        .ldr-h2 em { font-style:italic;color:var(--gold); }
        .ldr-section-sub { font-size:17px;color:var(--ink3);max-width:540px;font-weight:300; }

        /* SPLIT */
        .ldr-split { background:#fff;padding:0; }
        .ldr-split-grid { display:grid;grid-template-columns:1fr 1fr;gap:2px; }
        .ldr-split-side { padding:64px; }
        .ldr-split-before { background:var(--cream2); }
        .ldr-split-after { background:var(--ink); }
        .ldr-split-label { font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:500;margin-bottom:28px;display:flex;align-items:center;gap:8px; }
        .ldr-split-before .ldr-split-label { color:var(--ink3); }
        .ldr-split-after .ldr-split-label { color:var(--gold); }
        .ldr-h3 { font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;margin-bottom:24px; }
        .ldr-pain-list,.ldr-gain-list { list-style:none;display:flex;flex-direction:column;gap:14px; }
        .ldr-pain-list li { display:flex;gap:12px;align-items:flex-start;color:var(--ink2);font-size:15px; }
        .ldr-gain-list li { display:flex;gap:12px;align-items:flex-start;color:rgba(255,255,255,0.85);font-size:15px; }
        .ldr-pain-x { color:#C0392B;font-size:12px;margin-top:4px;flex-shrink:0; }
        .ldr-gain-check { color:var(--gold2);font-size:12px;margin-top:4px;flex-shrink:0; }

        /* FEATURES */
        .ldr-features-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:56px; }
        .ldr-fcard { background:#fff;border-radius:14px;padding:36px 32px;border:1px solid var(--bdr);transition:all 0.3s;position:relative;overflow:hidden; }
        .ldr-fcard::before { content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));transform:scaleX(0);transition:transform 0.3s;transform-origin:left; }
        .ldr-fcard:hover { transform:translateY(-4px);box-shadow:var(--sh-lg); }
        .ldr-fcard:hover::before { transform:scaleX(1); }
        .ldr-ficon { width:48px;height:48px;border-radius:12px;background:var(--gold-light);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px; }
        .ldr-fcard h4 { font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;margin-bottom:10px; }
        .ldr-fcard p { font-size:14px;color:var(--ink3);line-height:1.65; }

        /* STEPS */
        .ldr-steps { display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:56px;position:relative; }
        .ldr-steps::before { content:'';position:absolute;top:28px;left:calc(16.66% + 28px);right:calc(16.66% + 28px);height:1px;background:linear-gradient(90deg,var(--gold),var(--gold2),var(--gold));z-index:0; }
        .ldr-step { text-align:center;padding:0 32px; }
        .ldr-step-num { width:56px;height:56px;border-radius:50%;background:var(--ink);color:#fff;font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;position:relative;z-index:1;border:3px solid var(--cream);box-shadow:0 0 0 2px var(--gold); }
        .ldr-step h4 { font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;margin-bottom:10px; }
        .ldr-step p { font-size:14px;color:var(--ink3); }

        /* TESTIMONIALS */
        .ldr-tgrid { display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:56px; }
        .ldr-tcard { background:#fff;border-radius:14px;padding:32px;border:1px solid var(--bdr);position:relative; }
        .ldr-tquote { font-family:'Cormorant Garamond',serif;font-size:64px;line-height:0.8;color:var(--gold-light);position:absolute;top:20px;right:24px; }
        .ldr-ttext { font-size:15px;color:var(--ink2);line-height:1.7;margin-bottom:24px;font-style:italic; }
        .ldr-tauthor { display:flex;align-items:center;gap:12px; }
        .ldr-tavatar { width:42px;height:42px;border-radius:50%;background:var(--gold-light);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;color:var(--gold);flex-shrink:0; }
        .ldr-tname { font-size:14px;font-weight:500;color:var(--ink); }
        .ldr-trole { font-size:12px;color:var(--ink3); }

        /* PRICING */
        .ldr-ptoggle { display:flex;align-items:center;gap:12px;justify-content:center;margin:32px 0;font-size:14px;color:var(--ink3); }
        .ldr-toggle-track { width:44px;height:24px;background:var(--bdr);border-radius:100px;position:relative;cursor:pointer;transition:background 0.2s;border:1px solid var(--bdr); }
        .ldr-toggle-track.on { background:var(--ink); }
        .ldr-toggle-thumb { width:18px;height:18px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:transform 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.15); }
        .ldr-toggle-track.on .ldr-toggle-thumb { transform:translateX(20px); }
        .ldr-save-badge { background:var(--gold-light);color:var(--gold);padding:2px 10px;border-radius:100px;font-size:11px;font-weight:500;border:1px solid rgba(184,146,42,0.2); }
        .ldr-plans { display:grid;grid-template-columns:repeat(3,1fr);gap:24px; }
        .ldr-plan { background:#fff;border-radius:16px;padding:40px 32px;border:1px solid var(--bdr);position:relative;transition:all 0.3s; }
        .ldr-plan:hover { transform:translateY(-4px);box-shadow:var(--sh-lg); }
        .ldr-plan.featured { background:var(--ink);border-color:var(--ink); }
        .ldr-plan-badge { position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--gold);color:#fff;padding:4px 16px;border-radius:100px;font-size:11px;font-weight:500;letter-spacing:0.5px;white-space:nowrap; }
        .ldr-plan-name { font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;margin-bottom:8px; }
        .ldr-plan.featured .ldr-plan-name { color:#fff; }
        .ldr-plan-desc { font-size:13px;color:var(--ink3);margin-bottom:24px; }
        .ldr-plan.featured .ldr-plan-desc { color:rgba(255,255,255,0.5); }
        .ldr-plan-price { font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:700;line-height:1;margin-bottom:4px; }
        .ldr-plan.featured .ldr-plan-price { color:#fff; }
        .ldr-plan-period { font-size:13px;color:var(--ink3);margin-bottom:28px; }
        .ldr-plan.featured .ldr-plan-period { color:rgba(255,255,255,0.4); }
        .ldr-plan-features { list-style:none;margin-bottom:32px;display:flex;flex-direction:column;gap:10px; }
        .ldr-plan-features li { font-size:14px;display:flex;gap:10px;align-items:flex-start; }
        .ldr-plan-features li::before { content:'✓';color:var(--gold);font-size:12px;margin-top:3px;flex-shrink:0; }
        .ldr-plan.featured .ldr-plan-features li { color:rgba(255,255,255,0.8); }
        .ldr-plan-btn { display:block;text-align:center;padding:14px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif;width:100%; }
        .ldr-plan-btn.light { background:transparent;color:var(--ink);border:2px solid var(--ink); }
        .ldr-plan-btn.light:hover { background:var(--ink);color:#fff; }
        .ldr-plan-btn.gold { background:var(--gold);color:#fff;border:2px solid var(--gold); }
        .ldr-plan-btn.gold:hover { background:var(--gold2);border-color:var(--gold2);transform:translateY(-1px); }

        /* CTA FINAL */
        .ldr-cta-final { background:var(--ink);text-align:center;padding:100px 48px; }
        .ldr-cta-final .ldr-h2 { color:#fff;max-width:700px;margin:0 auto 16px; }
        .ldr-cta-final .ldr-section-tag { text-align:center; }
        .ldr-cta-final p { color:rgba(255,255,255,0.5);font-size:17px;max-width:500px;margin:0 auto 40px;font-weight:300; }
        .ldr-cta-form { display:flex;gap:12px;justify-content:center;max-width:420px;margin:0 auto; }
        .ldr-cta-input { flex:1;padding:14px 18px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border 0.2s; }
        .ldr-cta-input::placeholder { color:rgba(255,255,255,0.3); }
        .ldr-cta-input:focus { border-color:var(--gold); }
        .ldr-btn-gold { background:var(--gold);color:#fff;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:500;border:none;cursor:pointer;transition:all 0.25s;white-space:nowrap;font-family:'DM Sans',sans-serif; }
        .ldr-btn-gold:hover { background:var(--gold2);transform:translateY(-2px);box-shadow:0 8px 24px rgba(184,146,42,0.4); }

        /* FOOTER */
        .ldr-footer { background:var(--cream2);padding:48px;border-top:1px solid var(--bdr); }
        .ldr-footer-inner { max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px; }
        .ldr-footer-logo { font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink);background:none;border:none;cursor:pointer; }
        .ldr-footer-logo span { color:var(--gold); }
        .ldr-footer-links { display:flex;gap:28px;list-style:none; }
        .ldr-footer-links button { background:none;border:none;font-size:13px;color:var(--ink3);cursor:pointer;transition:color 0.2s;font-family:'DM Sans',sans-serif; }
        .ldr-footer-links button:hover { color:var(--gold); }
        .ldr-footer-copy { font-size:12px;color:var(--ink3); }

        /* SCROLL REVEAL */
        .ldr-reveal { opacity:0;transform:translateY(28px);transition:all 0.7s cubic-bezier(0.22,1,0.36,1); }
        .ldr-reveal.ldr-visible { opacity:1;transform:translateY(0); }
        .ldr-d1 { transition-delay:0.1s; }
        .ldr-d2 { transition-delay:0.2s; }
        .ldr-d3 { transition-delay:0.3s; }
        .ldr-d4 { transition-delay:0.4s; }

        @media (max-width:900px) {
          .ldr-nav { padding:16px 24px; }
          .ldr-navlinks { display:none; }
          .ldr-hero { padding:100px 24px 60px; }
          .ldr-hero-inner { grid-template-columns:1fr;gap:48px; }
          .ldr-section { padding:72px 24px; }
          .ldr-features-grid,.ldr-tgrid,.ldr-plans,.ldr-steps { grid-template-columns:1fr; }
          .ldr-split-grid { grid-template-columns:1fr; }
          .ldr-proof { padding:48px 24px; }
          .ldr-steps::before { display:none; }
          .ldr-cta-form { flex-direction:column; }
          .ldr-footer-inner { flex-direction:column;text-align:center; }
          .ldr-proof-metrics { gap:32px; }
        }
      `}</style>

      <div className="ldr-root">
        <nav className={`ldr-nav${scrolled ? ' ldr-scrolled' : ''}`}>
          <button type="button" className="ldr-logo" onClick={() => scrollTo('ldr-top')}>
            Lide<span>rum</span>
          </button>
          <ul className="ldr-navlinks">
            {[['ldr-features', 'Produto'], ['ldr-how', 'Como funciona'], ['ldr-pricing', 'Preços'], ['ldr-testi', 'Clientes']].map(([id, label]) => (
              <li key={id}><button type="button" onClick={() => scrollTo(id)}>{label}</button></li>
            ))}
          </ul>
          <div className="ldr-nav-right">
            <button type="button" className="ldr-nav-login" onClick={() => navigate('/login')}>Entrar</button>
            <button type="button" className="ldr-navcta" onClick={() => navigate('/contact')}>Começar grátis →</button>
          </div>
        </nav>

        <section className="ldr-hero" id="ldr-top">
          <div className="ldr-hero-bg" aria-hidden="true" />
          <div className="ldr-hero-grid" aria-hidden="true" />
          <div className="ldr-hero-inner">
            <div>
              <div className="ldr-hero-tag">ERP Completo</div>
              <h1 className="ldr-h1">Sua operação inteira em <em>uma</em> plataforma.</h1>
              <p className="ldr-hero-sub">Vendas, financeiro, estoque e segurança integrados — com visibilidade total, automação de rotina e controle real para fazer sua empresa crescer sem perder o controle.</p>
              <div className="ldr-ctas">
                <button type="button" className="ldr-btn-primary" onClick={() => navigate('/contact')}>Começar grátis →</button>
                <button type="button" className="ldr-btn-secondary" onClick={() => scrollTo('ldr-how')}>▶ Ver demonstração</button>
              </div>
            </div>

            <div className="ldr-visual">
              <div className="ldr-dashboard" role="img" aria-label="Painel ERP Liderum">
                <div className="ldr-dash-header">
                  <div className="ldr-dash-dot" style={{ background: '#FF5F57' }} />
                  <div className="ldr-dash-dot" style={{ background: '#FFBD2E' }} />
                  <div className="ldr-dash-dot" style={{ background: '#28CA41' }} />
                  <span className="ldr-dash-title">Liderum ERP · Visão geral · Mar 2026</span>
                </div>
                <div className="ldr-dash-body">
                  <div className="ldr-dash-row">
                    <div className="ldr-dash-card"><div className="ldr-dash-label">Receita (mês)</div><div className="ldr-dash-val green">R$482k</div></div>
                    <div className="ldr-dash-card"><div className="ldr-dash-label">Estoque (itens)</div><div className="ldr-dash-val">3.841</div></div>
                    <div className="ldr-dash-card"><div className="ldr-dash-label">Pedidos abertos</div><div className="ldr-dash-val amber">27</div></div>
                  </div>
                  <div className="ldr-dash-table">
                    <div className="ldr-dash-trow hd"><span>Módulo</span><span>Alertas</span><span>Status</span></div>
                    <div className="ldr-dash-trow"><span>🛒 Vendas</span><span>0</span><span><span className="ldr-badge ok">Normal</span></span></div>
                    <div className="ldr-dash-trow"><span>💰 Financeiro</span><span>2</span><span><span className="ldr-badge warn">Atenção</span></span></div>
                    <div className="ldr-dash-trow"><span>📦 Estoque</span><span>1 ruptura</span><span><span className="ldr-badge err">Alerta</span></span></div>
                    <div className="ldr-dash-trow"><span>🔐 Segurança</span><span>0</span><span><span className="ldr-badge ok">Normal</span></span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="ldr-proof">
          <div className="ldr-proof-inner">
            <div className="ldr-proof-metrics">
              {[
                { val: '+', num: '1.200', label: 'empresas usando o ERP' },
                { val: '+', num: '4', label: 'módulos integrados nativamente' },
                { val: '', num: '99,8', label: 'de uptime garantido', suffix: '%' },
                { val: '-', num: '70%', label: 'de tarefas manuais eliminadas' }
              ].map((m, i) => (
                <div key={m.label} className={`ldr-metric ldr-reveal${i > 0 ? ` ldr-d${i}` : ''}`}>
                  <span className="ldr-metric-val">{m.val}<span>{m.num}</span>{m.suffix ?? ''}</span>
                  <div className="ldr-metric-label">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="ldr-proof-logos">
              {['Grupo Atlas', 'Fenix Industrial', 'BRV Logística', 'Distribuidora Nova', 'Tecnova Sistemas'].map((name) => (
                <div key={name} className="ldr-logo-pill">{name}</div>
              ))}
            </div>
          </div>
        </div>

        <section className="ldr-split">
          <div className="ldr-split-grid">
            <div className="ldr-split-side ldr-split-before">
              <div className="ldr-split-label">✕ Antes da Liderum</div>
              <h3 className="ldr-h3">Setores isolados, decisões no escuro</h3>
              <ul className="ldr-pain-list">
                {painItems.map((item) => (
                  <li key={item}><span className="ldr-pain-x">✕</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="ldr-split-side ldr-split-after">
              <div className="ldr-split-label">✓ Com a Liderum</div>
              <h3 className="ldr-h3" style={{ color: '#fff' }}>Operação integrada, visão em tempo real</h3>
              <ul className="ldr-gain-list">
                {gainItems.map((item) => (
                  <li key={item}><span className="ldr-gain-check">✓</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="ldr-section" id="ldr-features" style={{ background: 'var(--cream)' }}>
          <div className="ldr-section-inner">
            <div className="ldr-section-tag">Módulos</div>
            <h2 className="ldr-h2">Quatro módulos.<br /><em>Uma operação coesa.</em></h2>
            <p className="ldr-section-sub">Vendas, financeiro, estoque e segurança nativamente integrados — sem planilhas de ligação, sem dados duplicados.</p>
            <div className="ldr-features-grid">
              {features.map((f, i) => (
                <div key={f.title} className={`ldr-fcard ldr-reveal${i % 3 !== 0 ? ` ldr-d${i % 3}` : ''}`}>
                  <div className="ldr-ficon">{f.icon}</div>
                  <h4>{f.title}</h4>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ldr-section" id="ldr-how" style={{ background: '#fff' }}>
          <div className="ldr-section-inner">
            <div className="ldr-section-tag">Como funciona</div>
            <h2 className="ldr-h2">Três passos para<br /><em>operar com clareza</em></h2>
            <p className="ldr-section-sub">Implantação guiada, sem IT dedicado. Sua equipe operando em produção na primeira semana.</p>
            <div className="ldr-steps">
              {[
                { n: '1', title: 'Configure sua empresa', text: 'Cadastre usuários, defina perfis de acesso por módulo e importe cadastros de produtos, clientes e fornecedores com planilha modelo.' },
                { n: '2', title: 'Ative os módulos', text: 'Habilite vendas, financeiro, estoque ou segurança conforme sua necessidade. Os dados fluem automaticamente entre eles sem configuração adicional.' },
                { n: '3', title: 'Gerencie e expanda', text: 'Acompanhe KPIs no dashboard executivo, configure alertas da operação e ative novos módulos conforme a empresa cresce.' }
              ].map((s, i) => (
                <div key={s.n} className={`ldr-step ldr-reveal${i > 0 ? ` ldr-d${i * 2}` : ''}`}>
                  <div className="ldr-step-num">{s.n}</div>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ldr-section" id="ldr-testi" style={{ background: 'var(--cream)' }}>
          <div className="ldr-section-inner">
            <div className="ldr-section-tag">Depoimentos</div>
            <h2 className="ldr-h2">Quem unificou, <em>não volta</em><br />ao sistema fragmentado</h2>
            <div className="ldr-tgrid">
              {testimonials.map((t, i) => (
                <div key={t.name} className={`ldr-tcard ldr-reveal${i > 0 ? ` ldr-d${i + 1}` : ''}`}>
                  <div className="ldr-tquote">"</div>
                  <p className="ldr-ttext">"{t.text}"</p>
                  <div className="ldr-tauthor">
                    <div className="ldr-tavatar">{t.initial}</div>
                    <div><div className="ldr-tname">{t.name}</div><div className="ldr-trole">{t.role}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ldr-section" id="ldr-pricing" style={{ background: 'var(--cream2)' }}>
          <div className="ldr-section-inner">
            <div style={{ textAlign: 'center' }}>
              <div className="ldr-section-tag">Preços</div>
              <h2 className="ldr-h2">Simples, <em>transparente,</em> justo</h2>
              <p className="ldr-section-sub" style={{ margin: '0 auto', textAlign: 'center' }}>Sem taxa de setup. Cancele quando quiser. Comece grátis por 14 dias.</p>
              <div className="ldr-ptoggle">
                <span>Mensal</span>
                <div
                  className={`ldr-toggle-track${annual ? ' on' : ''}`}
                  onClick={() => setAnnual((v) => !v)}
                  role="switch"
                  aria-checked={annual}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setAnnual((v) => !v); }}
                  aria-label="Alternar entre plano mensal e anual"
                >
                  <div className="ldr-toggle-thumb" />
                </div>
                <span>Anual</span>
                <span className="ldr-save-badge">Economize 20%</span>
              </div>
            </div>
            <div className="ldr-plans">
              {[
                {
                  key: 'p1' as const,
                  name: 'Essencial',
                  desc: 'Para pequenas empresas iniciando a gestão integrada',
                  items: ['Até 10 usuários', 'Módulos: Financeiro + Estoque', 'Relatórios padrão exportáveis', 'Alertas por e-mail', 'Suporte via chat'],
                  btnClass: 'light',
                  btnLabel: 'Começar grátis'
                },
                {
                  key: 'p2' as const,
                  name: 'Crescimento',
                  desc: '',
                  featured: true,
                  items: ['Até 50 usuários', 'Todos os 4 módulos ativos', 'Dashboard executivo e operacional', 'Alertas e automações configuráveis', 'API para integrações externas', 'Suporte prioritário'],
                  btnClass: 'gold',
                  btnLabel: 'Começar grátis'
                },
                {
                  key: 'p3' as const,
                  name: 'Enterprise',
                  desc: 'Para operações de médio e grande porte',
                  items: ['Usuários ilimitados', 'Multi-empresa (multi-tenant)', 'Permissões granulares por módulo', 'SLA 99,9% com uptime garantido', 'Implantação assistida dedicada', 'Gerente de conta exclusivo'],
                  btnClass: 'light',
                  btnLabel: 'Falar com vendas'
                }
              ].map((plan, i) => (
                <div key={plan.key} className={`ldr-plan ldr-reveal${plan.featured ? ' featured' : ''}${i > 0 ? ` ldr-d${i + 1}` : ''}`}>
                  {plan.featured && <div className="ldr-plan-badge">✦ Mais popular</div>}
                  <div className="ldr-plan-name">{plan.name}</div>
                  <div className="ldr-plan-desc">{plan.featured ? <span style={{ color: 'rgba(255,255,255,0.5)' }}>Para PMEs com volume médio</span> : plan.desc}</div>
                  <div className="ldr-plan-price">{price(plan.key)}</div>
                  <div className="ldr-plan-period">{period}</div>
                  <ul className="ldr-plan-features">
                    {plan.items.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  <button type="button" className={`ldr-plan-btn ${plan.btnClass}`} onClick={() => navigate('/contact')}>
                    {plan.btnLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ldr-cta-final" id="ldr-cta">
          <div className="ldr-section-tag">Pronto para começar?</div>
          <h2 className="ldr-h2">Sua empresa merece operar como uma <em>máquina.</em></h2>
          <p>14 dias grátis. Sem cartão de crédito. Todos os módulos disponíveis no período de teste.</p>
          <form className="ldr-cta-form" onSubmit={handleLead}>
            <label htmlFor="ldr-lead-email" className="sr-only">E-mail corporativo</label>
            <input
              id="ldr-lead-email"
              type="email"
              className="ldr-cta-input"
              placeholder="seu@email.com.br"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
            />
            <button type="submit" className="ldr-btn-gold">Começar agora →</button>
          </form>
        </section>

        <footer className="ldr-footer">
          <div className="ldr-footer-inner">
            <button type="button" className="ldr-footer-logo" onClick={() => scrollTo('ldr-top')}>
              Lide<span>rum</span>
            </button>
            <ul className="ldr-footer-links">
              {[['ldr-features', 'Produto'], ['ldr-pricing', 'Preços']].map(([id, label]) => (
                <li key={id}><button type="button" onClick={() => scrollTo(id)}>{label}</button></li>
              ))}
              <li><button type="button" onClick={() => navigate('/contact')}>Política de Privacidade</button></li>
              <li><button type="button" onClick={() => navigate('/contact')}>Termos de Uso</button></li>
            </ul>
            <div className="ldr-footer-copy">© {new Date().getFullYear()} Liderum · CNPJ 00.000.000/0001-00</div>
          </div>
        </footer>
      </div>
    </>
  );
}
