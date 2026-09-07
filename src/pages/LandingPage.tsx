import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionCleanup } from '@/hooks/useSessionCleanup';

const PRICES = { p1: [97, 77], p2: [197, 157] } as const;

const features = [
  { icon: 'plan', title: 'Gestão de Obras', text: 'Acompanhe todas as suas obras em tempo real — etapas, prazos, progresso e responsáveis em uma visão única e centralizada.' },
  { icon: 'ruler', title: 'Orçamento & Custos', text: 'Previsto versus realizado por item. Controle de materiais, mão de obra e serviços com alertas automáticos de desvio orçamentário.' },
  { icon: 'compass', title: 'Cronograma Inteligente', text: 'Timeline visual por etapa com dependências, marcos e indicadores de risco de atraso — para agir antes do problema aparecer.' },
  { icon: 'notebook', title: 'Diário de Obra', text: 'Registro diário com fotos, problemas, ações corretivas e condições climáticas. Histórico completo e rastreável de cada dia no canteiro.' },
  { icon: 'stamp', title: 'Gestão de Extras', text: 'Fluxo completo de aprovação de aditivos — impacto no prazo, impacto financeiro e histórico de decisões para proteger sua margem.' },
  { icon: 'alert', title: 'Alertas de Risco', text: 'Monitoramento contínuo de prazos, custos e qualidade com alertas classificados por severidade para que nenhum problema passe despercebido.' }
];

const earlyBenefits = [
  { icon: 'lock', title: 'Acesso completo desde o início', text: 'Todos os módulos disponíveis já no primeiro dia — sem bloqueio de funcionalidades durante o período de acesso antecipado.' },
  { icon: 'chat', title: 'Canal direto com os fundadores', text: 'Reporte o que falta, o que incomoda, o que poderia ser melhor. Seu feedback molda diretamente o roadmap da plataforma.' },
  { icon: 'pin', title: 'Preço travado para sempre', text: 'Quem entrar agora garante o preço atual independente dos reajustes futuros — enquanto a plataforma cresce, o seu custo não.' }
];

const painItems = [
  'Cada obra controlada em planilha diferente, sem visão consolidada',
  'Desvios de orçamento descobertos tarde demais para corrigir',
  'Diário de obra em papel — impossível de rastrear ou consultar',
  'Extras e aditivos sem aprovação formal, corroendo a margem',
  'Cronograma desatualizado, sem visibilidade de dependências e riscos',
  'Equipe gastando horas em relatórios manuais em vez de gerenciar'
];

const gainItems = [
  'Dashboard executivo com todas as obras, custos e prazos em tempo real',
  'Orçamento previsto × realizado com alertas automáticos de desvio',
  'Diário de obra digital com fotos, problemas e ações rastreáveis',
  'Fluxo formal de extras com impacto no prazo e custo documentado',
  'Cronograma visual com dependências, marcos e alertas de atraso',
  'Relatórios automáticos — sua equipe foca em executar, não em reportar'
];

const heroRooms = [
  { x: 40, y: 40, w: 260, h: 130, lx: 60, ly: 70, sx: 60, sy: 82, name: 'Cronograma', sub: 'dependências · marcos · risco', desc: 'Timeline visual com marcos e alertas de atraso — para agir antes do problema aparecer.' },
  { x: 300, y: 40, w: 260, h: 130, lx: 320, ly: 70, sx: 320, sy: 82, name: 'Orçamento', sub: 'previsto × realizado', desc: 'Previsto versus realizado por item, com alertas automáticos de desvio orçamentário.' },
  { x: 40, y: 170, w: 260, h: 130, lx: 60, ly: 200, sx: 60, sy: 212, name: 'Diário de obra', sub: 'fotos · ocorrências', desc: 'Registro diário com fotos, problemas e condições climáticas — rastreável a qualquer momento.' },
  { x: 300, y: 170, w: 260, h: 130, lx: 320, ly: 200, sx: 320, sy: 212, name: 'Extras', sub: 'aprovação formal', desc: 'Fluxo completo de aprovação de aditivos, com impacto no prazo e na margem.' }
];

function IconGlyph({ name }: { name: string }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'plan':
      return (<svg {...p}><rect x="3.5" y="4.5" width="17" height="15" /><path d="M12 4.5v15M3.5 12h8.5" /></svg>);
    case 'ruler':
      return (<svg {...p}><rect x="2.5" y="10" width="19" height="5" /><path d="M6.5 10v2.2M10.5 10v3M14.5 10v2.2M18.5 10v3" /></svg>);
    case 'compass':
      return (<svg {...p}><circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" /><path d="M12 6.4L5.5 20M12 6.4L18.5 20" /><path d="M8.3 14h7.4" strokeDasharray="1.6 2.2" /></svg>);
    case 'notebook':
      return (<svg {...p}><rect x="4.5" y="3.5" width="15" height="17" /><path d="M8 8.5h8M8 12.5h8M8 16.5h5" /></svg>);
    case 'stamp':
      return (<svg {...p}><rect x="5.5" y="4.5" width="13" height="12" /><path d="M9 20.5h6M12 16.5v4" /><path d="M8.3 9.8l2.3 2.3 4.6-4.6" /></svg>);
    case 'alert':
      return (<svg {...p}><path d="M12 3.5l9 16H3z" /><path d="M12 10v4M12 17h.01" /></svg>);
    case 'lock':
      return (<svg {...p}><rect x="5.5" y="10.5" width="13" height="9.5" /><path d="M8.5 10.5V7.5a3.5 3.5 0 017 0v3" /></svg>);
    case 'chat':
      return (<svg {...p}><path d="M4.5 5.5h15v11h-8l-4 3.5v-3.5h-3z" /></svg>);
    case 'pin':
      return (<svg {...p}><path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.3" /></svg>);
    default:
      return null;
  }
}

function CheckDraw() {
  return (
    <svg className="ldr-check-draw" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path d="M3 8.4l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [activeRoom, setActiveRoom] = useState(0);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const blueprintRef = useRef<HTMLDivElement>(null);

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

  const handleBlueprintMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = blueprintRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const price = (key: keyof typeof PRICES) => `R$${PRICES[key][annual ? 1 : 0]}`;
  const period = annual ? '/mês · cobrado anualmente' : '/mês · cobrado mensalmente';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        :root {
          --cream:#F7F4EF; --cream2:#EDE9E1; --ink:#1A1814; --ink2:#3D3A34; --ink3:#7A7670;
          --gold:#B8922A; --gold2:#D4A843; --gold-light:#F0E4C4;
          --bdr:rgba(26,24,20,0.1); --sh:0 2px 24px rgba(26,24,20,0.08); --sh-lg:0 8px 48px rgba(26,24,20,0.12);
        }
        .ldr-root { font-family:'DM Sans',sans-serif; background:var(--cream); color:var(--ink); line-height:1.7; overflow-x:hidden; }
        .ldr-root *, .ldr-root *::before, .ldr-root *::after { box-sizing:border-box; }
        .ldr-mono { font-family:'IBM Plex Mono',monospace; }
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
        .ldr-hero { min-height:100vh;display:flex;align-items:center;padding:120px 48px 80px;position:relative;overflow:hidden; }
        .ldr-hero-bg { position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 60% 50% at 70% 50%,rgba(184,146,42,0.08) 0%,transparent 70%),radial-gradient(ellipse 40% 60% at 20% 80%,rgba(184,146,42,0.05) 0%,transparent 60%); }
        .ldr-hero-grid { position:absolute;inset:0;z-index:0;opacity:0.5;background-image:linear-gradient(rgba(184,146,42,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(184,146,42,0.05) 1px,transparent 1px),linear-gradient(var(--bdr) 1px,transparent 1px),linear-gradient(90deg,var(--bdr) 1px,transparent 1px);background-size:15px 15px,15px 15px,60px 60px,60px 60px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%); }
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
        .ldr-visual { position:relative;animation:ldr-float 6s ease-in-out infinite; }
        @keyframes ldr-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .ldr-blueprint { background:#fff;border-radius:16px;box-shadow:var(--sh-lg),0 0 0 1px var(--bdr);overflow:hidden;position:relative;padding:26px 24px 18px;cursor:crosshair; }
        .ldr-bp-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:14px; }
        .ldr-bp-eyebrow { font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);font-weight:500; }
        .ldr-bp-eyebrow::before { content:'§ '; }
        .ldr-bp-scale { font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--ink3);letter-spacing:0.5px; }
        .ldr-bp-corner { position:absolute;width:12px;height:12px;border:1px solid rgba(184,146,42,0.4);pointer-events:none; }
        .ldr-bp-corner.tl { top:10px;left:10px;border-right:none;border-bottom:none; }
        .ldr-bp-corner.tr { top:10px;right:10px;border-left:none;border-bottom:none; }
        .ldr-bp-corner.bl { bottom:10px;left:10px;border-right:none;border-top:none; }
        .ldr-bp-corner.br { bottom:10px;right:10px;border-left:none;border-top:none; }
        .ldr-bp-draw { fill:none;stroke:var(--ink);stroke-width:1.6;stroke-dasharray:1400;stroke-dashoffset:1400;animation:ldr-draw 2.4s cubic-bezier(0.65,0,0.35,1) forwards; }
        .ldr-bp-draw-thin { fill:none;stroke:var(--gold);stroke-width:1;stroke-dasharray:400;stroke-dashoffset:400;animation:ldr-draw 1.4s ease forwards; }
        @keyframes ldr-draw { to { stroke-dashoffset:0; } }
        .ldr-bp-fill { fill:rgba(184,146,42,0.07);opacity:0;animation:ldr-fadein 0.6s ease forwards;transition:fill 0.25s ease;cursor:pointer; }
        .ldr-bp-fill.active { fill:rgba(184,146,42,0.2); }
        @keyframes ldr-fadein { to { opacity:1; } }
        .ldr-bp-label { font-family:'DM Sans',sans-serif;font-size:9px;font-weight:500;letter-spacing:0.4px;fill:var(--ink2);text-transform:uppercase;opacity:0;animation:ldr-fadein 0.5s ease forwards;pointer-events:none; }
        .ldr-bp-sub { font-family:'DM Sans',sans-serif;font-size:7px;fill:var(--ink3);opacity:0;animation:ldr-fadein 0.5s ease forwards;pointer-events:none; }
        .ldr-bp-dim { font-family:'IBM Plex Mono',monospace;font-size:7.5px;fill:var(--ink3);opacity:0;animation:ldr-fadein 0.5s ease forwards; }
        .ldr-bp-node { fill:var(--gold);opacity:0;animation:ldr-fadein 0.4s ease forwards; }
        .ldr-bp-pen { fill:var(--gold2);filter:drop-shadow(0 0 3px rgba(212,168,67,0.6));offset-path:path('M40,40 L560,40 L560,300 L40,300 Z');animation:ldr-pen 9s linear infinite; }
        @keyframes ldr-pen { from { offset-distance:0%; } to { offset-distance:100%; } }
        .ldr-bp-highlight { pointer-events:none; }
        .ldr-bp-cross-h { position:absolute;left:0;right:0;height:0;border-top:1px dashed rgba(184,146,42,0.55);pointer-events:none;z-index:4; }
        .ldr-bp-cross-v { position:absolute;top:0;bottom:0;width:0;border-left:1px dashed rgba(184,146,42,0.55);pointer-events:none;z-index:4; }
        .ldr-bp-coord { position:absolute;background:var(--ink);color:#fff;font-family:'IBM Plex Mono',monospace;font-size:10px;padding:4px 9px;border-radius:4px;white-space:nowrap;pointer-events:none;z-index:5;letter-spacing:0.3px; }
        .ldr-bp-caption { display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:14px;padding-top:12px;border-top:1px dashed var(--bdr); }
        .ldr-bp-caption-text { flex:1; }
        .ldr-bp-caption-name { font-family:'IBM Plex Mono',monospace;font-size:12.5px;font-weight:600;color:var(--ink);display:block; }
        .ldr-bp-caption-desc { font-size:12px;color:var(--ink3);margin-top:2px;display:block; }
        .ldr-bp-caption-hint { font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--ink3);opacity:0.7;white-space:nowrap; }
        .ldr-proof { background:#fff;padding:48px;border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr); }
        .ldr-proof-inner { max-width:1200px;margin:0 auto; }
        .ldr-proof-metrics { display:flex;gap:64px;justify-content:center;flex-wrap:wrap;margin-bottom:40px; }
        .ldr-metric { text-align:center; }
        .ldr-metric-val { font-family:var(--font-numeric);font-size:42px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;color:var(--ink);line-height:1;display:block; }
        .ldr-metric-val span { color:var(--gold); }
        .ldr-metric-label { font-size:13px;color:var(--ink3);margin-top:4px; }
        .ldr-section { padding:100px 48px; }
        .ldr-section-inner { max-width:1200px;margin:0 auto; }
        .ldr-section-tag { font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin-bottom:12px; }
        .ldr-h2 { font-family:'Cormorant Garamond',serif;font-size:clamp(34px,4vw,52px);font-weight:700;line-height:1.1;letter-spacing:-1px;margin-bottom:16px; }
        .ldr-h2 em { font-style:italic;color:var(--gold); }
        .ldr-section-sub { font-size:17px;color:var(--ink3);max-width:540px;font-weight:300; }
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
        .ldr-features-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:56px; }
        .ldr-fcard { background:#fff;border-radius:6px;padding:34px 30px;border:1px solid var(--bdr);transition:all 0.3s;position:relative;overflow:hidden; }
        .ldr-fcard::before { content:'';position:absolute;top:12px;left:12px;width:11px;height:11px;border-left:1px solid rgba(184,146,42,0.45);border-top:1px solid rgba(184,146,42,0.45); }
        .ldr-fcard::after { content:'';position:absolute;bottom:12px;right:12px;width:11px;height:11px;border-right:1px solid rgba(184,146,42,0.45);border-bottom:1px solid rgba(184,146,42,0.45); }
        .ldr-fcard:hover { transform:translateY(-4px);box-shadow:var(--sh-lg); }
        .ldr-fnum { font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--gold);letter-spacing:1px;margin-bottom:16px; }
        .ldr-ficon { width:46px;height:46px;border-radius:4px;background:var(--gold-light);display:flex;align-items:center;justify-content:center;color:var(--gold);margin-bottom:20px;border:1px dashed rgba(184,146,42,0.35); }
        .ldr-fcard h4 { font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;margin-bottom:4px; }
        .ldr-fdim { height:1px;width:0;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width 0.45s ease;margin:14px 0; }
        .ldr-fcard:hover .ldr-fdim { width:100%; }
        .ldr-fcard p { font-size:14px;color:var(--ink3);line-height:1.65; }
        .ldr-steps { display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:56px;position:relative; }
        .ldr-steps::before { content:'';position:absolute;top:28px;left:calc(16.66% + 28px);right:calc(16.66% + 28px);height:1px;background:linear-gradient(90deg,var(--gold),var(--gold2),var(--gold));z-index:0; }
        .ldr-steps-pen { position:absolute;top:24px;width:8px;height:8px;border-radius:50%;background:var(--gold2);box-shadow:0 0 0 3px var(--cream),0 0 8px rgba(184,146,42,0.5);animation:ldr-pen-travel 4.5s ease-in-out infinite;z-index:1; }
        @keyframes ldr-pen-travel { 0%,100%{left:16.66%;} 50%{left:83.33%;} }
        .ldr-step { text-align:center;padding:0 32px; }
        .ldr-step-num { width:56px;height:56px;border-radius:50%;background:var(--ink);color:#fff;font-family:var(--font-numeric);font-size:22px;font-weight:600;font-variant-numeric:tabular-nums;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;position:relative;z-index:1;border:3px solid var(--cream);box-shadow:0 0 0 2px var(--gold); }
        .ldr-step h4 { font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;margin-bottom:10px; }
        .ldr-step p { font-size:14px;color:var(--ink3); }
        .ldr-tgrid { display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:56px; }
        .ldr-tcard { background:#fff;border-radius:14px;padding:32px;border:1px solid var(--bdr);position:relative; }
        .ldr-tname { font-size:14px;font-weight:500;color:var(--ink); }
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
        .ldr-plan-price { font-family:var(--font-numeric);font-size:48px;font-weight:600;font-variant-numeric:tabular-nums lining-nums;line-height:1;margin-bottom:4px; }
        .ldr-plan.featured .ldr-plan-price { color:#fff; }
        .ldr-plan-period { font-size:13px;color:var(--ink3);margin-bottom:28px; }
        .ldr-plan.featured .ldr-plan-period { color:rgba(255,255,255,0.4); }
        .ldr-plan-features { list-style:none;margin-bottom:32px;display:flex;flex-direction:column;gap:10px; }
        .ldr-plan-features li { font-size:14px;display:flex;gap:10px;align-items:flex-start; }
        .ldr-plan.featured .ldr-plan-features li { color:rgba(255,255,255,0.8); }
        .ldr-check-wrap { color:var(--gold);display:inline-flex;margin-top:3px;flex-shrink:0; }
        .ldr-plan.featured .ldr-check-wrap { color:var(--gold2); }
        .ldr-check-draw path { stroke-dasharray:16;stroke-dashoffset:16;transition:stroke-dashoffset 0.5s ease; }
        .ldr-plan.ldr-visible .ldr-check-draw path { stroke-dashoffset:0;transition-delay:calc(var(--i,0) * 0.07s); }
        .ldr-plan-btn { display:block;text-align:center;padding:14px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif;width:100%; }
        .ldr-plan-btn.light { background:transparent;color:var(--ink);border:2px solid var(--ink); }
        .ldr-plan-btn.light:hover { background:var(--ink);color:#fff; }
        .ldr-plan-btn.gold { background:var(--gold);color:#fff;border:2px solid var(--gold); }
        .ldr-plan-btn.gold:hover { background:var(--gold2);border-color:var(--gold2);transform:translateY(-1px); }
        .ldr-cta-final { background:var(--ink);text-align:center;padding:100px 48px; }
        .ldr-cta-final .ldr-h2 { color:#fff;max-width:700px;margin:0 auto 16px; }
        .ldr-cta-final .ldr-section-tag { text-align:center; }
        .ldr-cta-final p { color:rgba(255,255,255,0.5);font-size:17px;max-width:500px;margin:0 auto 40px;font-weight:300; }
        .ldr-stamp { color:var(--gold2);width:104px;margin:0 auto 20px; }
        .ldr-stamp-svg { animation:ldr-stamp-spin 24s linear infinite;display:block; }
        @keyframes ldr-stamp-spin { to { transform:rotate(360deg); } }
        .ldr-cta-form { display:flex;gap:12px;justify-content:center;max-width:420px;margin:0 auto; }
        .ldr-cta-input { flex:1;padding:14px 18px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border 0.2s; }
        .ldr-cta-input::placeholder { color:rgba(255,255,255,0.3); }
        .ldr-cta-input:focus { border-color:var(--gold); }
        .ldr-btn-gold { background:var(--gold);color:#fff;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:500;border:none;cursor:pointer;transition:all 0.25s;white-space:nowrap;font-family:'DM Sans',sans-serif; }
        .ldr-btn-gold:hover { background:var(--gold2);transform:translateY(-2px);box-shadow:0 8px 24px rgba(184,146,42,0.4); }
        .ldr-footer { background:var(--cream2);padding:48px;border-top:1px solid var(--bdr); }
        .ldr-footer-inner { max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px; }
        .ldr-footer-logo { font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink);background:none;border:none;cursor:pointer; }
        .ldr-footer-logo span { color:var(--gold); }
        .ldr-footer-links { display:flex;gap:28px;list-style:none; }
        .ldr-footer-links button { background:none;border:none;font-size:13px;color:var(--ink3);cursor:pointer;transition:color 0.2s;font-family:'DM Sans',sans-serif; }
        .ldr-footer-links button:hover { color:var(--gold); }
        .ldr-footer-copy { font-size:12px;color:var(--ink3); }
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
          .ldr-steps::before, .ldr-steps-pen { display:none; }
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
            {[['ldr-features', 'Produto'], ['ldr-how', 'Como funciona'], ['ldr-pricing', 'Preços']].map(([id, label]) => (
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
              <div className="ldr-hero-tag">Gestão de Obras</div>
              <h1 className="ldr-h1">Todas as suas obras sob <em>controle total.</em></h1>
              <p className="ldr-hero-sub">Cronograma, orçamento, diário de obra e extras integrados — com visibilidade em tempo real para entregar no prazo, no custo e com margem protegida.</p>
              <div className="ldr-ctas">
                <button type="button" className="ldr-btn-primary" onClick={() => navigate('/contact')}>Começar grátis →</button>
                <button type="button" className="ldr-btn-secondary" onClick={() => scrollTo('ldr-how')}>▶ Ver demonstração</button>
              </div>
            </div>

            <div className="ldr-visual">
              <div
                className="ldr-blueprint"
                ref={blueprintRef}
                role="img"
                aria-label="Planta interativa do painel Liderum — clique em cada cômodo para ver o módulo correspondente"
                onMouseMove={handleBlueprintMove}
                onMouseLeave={() => setCursorPos(null)}
              >
                <div className="ldr-bp-corner tl" />
                <div className="ldr-bp-corner tr" />
                <div className="ldr-bp-corner bl" />
                <div className="ldr-bp-corner br" />
                <div className="ldr-bp-header">
                  <span className="ldr-bp-eyebrow">Planta do painel Liderum</span>
                  <span className="ldr-bp-scale">Escala 1:100 · Rev. 03</span>
                </div>
                <svg viewBox="0 0 640 400" width="100%" height="300">
                  <rect className="ldr-bp-draw" x="40" y="40" width="520" height="260" />
                  <path className="ldr-bp-draw" style={{ animationDelay: '0.5s' }} d="M300,40 L300,300" />
                  <path className="ldr-bp-draw" style={{ animationDelay: '0.7s' }} d="M40,170 L300,170" />
                  <path className="ldr-bp-draw" style={{ animationDelay: '0.9s' }} d="M300,170 L560,170" />

                  {heroRooms.map((r, i) => (
                    <rect
                      key={r.name}
                      className={`ldr-bp-fill${activeRoom === i ? ' active' : ''}`}
                      style={{ animationDelay: `${1.3 + i * 0.2}s` }}
                      x={r.x} y={r.y} width={r.w} height={r.h}
                      onClick={() => setActiveRoom(i)}
                      onMouseEnter={() => setActiveRoom(i)}
                    />
                  ))}

                  {heroRooms.map((r, i) => activeRoom === i && (
                    <rect key={`hl-${r.name}`} className="ldr-bp-highlight" x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="var(--gold)" strokeWidth={1.5} />
                  ))}

                  <path className="ldr-bp-draw-thin" style={{ animationDelay: '1.2s' }} d="M300,90 A40,40 0 0,1 260,130" />
                  <path className="ldr-bp-draw-thin" style={{ animationDelay: '1.4s' }} d="M300,220 A40,40 0 0,0 340,260" />
                  <path className="ldr-bp-draw-thin" style={{ animationDelay: '1.6s' }} d="M180,170 A20,20 0 0,1 200,190" />

                  {heroRooms.map((r, i) => (
                    <g key={`lbl-${r.name}`} style={{ pointerEvents: 'none' }}>
                      <text className="ldr-bp-label" style={{ animationDelay: `${1.6 + i * 0.15}s` }} x={r.lx} y={r.ly}>{r.name}</text>
                      <text className="ldr-bp-sub" style={{ animationDelay: `${1.7 + i * 0.15}s` }} x={r.sx} y={r.sy}>{r.sub}</text>
                    </g>
                  ))}

                  <circle className="ldr-bp-node" style={{ animationDelay: '2.4s' }} cx="40" cy="40" r="2.5" />
                  <circle className="ldr-bp-node" style={{ animationDelay: '2.45s' }} cx="560" cy="40" r="2.5" />
                  <circle className="ldr-bp-node" style={{ animationDelay: '2.5s' }} cx="560" cy="300" r="2.5" />
                  <circle className="ldr-bp-node" style={{ animationDelay: '2.55s' }} cx="40" cy="300" r="2.5" />
                  <circle className="ldr-bp-node" style={{ animationDelay: '2.6s' }} cx="300" cy="170" r="2.5" />

                  <path className="ldr-bp-draw-thin" style={{ animationDelay: '2.6s' }} d="M40,24 L560,24" />
                  <path className="ldr-bp-draw-thin" style={{ animationDelay: '2.6s' }} d="M40,18 L40,30 M560,18 L560,30" />
                  <text className="ldr-bp-dim" style={{ animationDelay: '2.9s' }} x="270" y="18">18.40 m</text>

                  <path className="ldr-bp-draw-thin" style={{ animationDelay: '2.6s' }} d="M22,40 L22,300" />
                  <path className="ldr-bp-draw-thin" style={{ animationDelay: '2.6s' }} d="M16,40 L28,40 M16,300 L28,300" />
                  <text className="ldr-bp-dim" style={{ animationDelay: '2.9s' }} x="-4" y="172" transform="rotate(-90 8 172)">12.10 m</text>

                  <g style={{ opacity: 0, animation: 'ldr-fadein 0.5s ease forwards', animationDelay: '3s' }} transform="translate(590,50)">
                    <path className="ldr-bp-draw-thin" style={{ animationDelay: '0s', strokeDasharray: 60, strokeDashoffset: 0 }} d="M0,20 L0,-4 M-5,3 L0,-4 L5,3" />
                    <text className="ldr-bp-dim" style={{ animationDelay: '0s', opacity: 1 }} x="-4" y="34">N</text>
                  </g>

                  <g style={{ opacity: 0, animation: 'ldr-fadein 0.6s ease forwards', animationDelay: '3.1s' }}>
                    <rect x="380" y="316" width="180" height="52" fill="none" stroke="var(--bdr)" strokeWidth={1} />
                    <line x1={380} y1={334} x2={560} y2={334} stroke="var(--bdr)" strokeWidth={0.6} />
                    <line x1={470} y1={334} x2={470} y2={368} stroke="var(--bdr)" strokeWidth={0.6} />
                    <text className="ldr-bp-dim" style={{ opacity: 1 }} x="388" y="328">LIDERUM — PAINEL DE OBRAS</text>
                    <text className="ldr-bp-dim" style={{ opacity: 1 }} x="388" y="350">ESCALA 1:100</text>
                    <text className="ldr-bp-dim" style={{ opacity: 1 }} x="478" y="350">REV. 03</text>
                  </g>

                  <circle className="ldr-bp-pen" r={3.4} cx={0} cy={0} />
                </svg>

                {cursorPos && (
                  <>
                    <div className="ldr-bp-cross-h" style={{ top: cursorPos.y }} />
                    <div className="ldr-bp-cross-v" style={{ left: cursorPos.x }} />
                    <div
                      className="ldr-bp-coord"
                      style={{
                        left: Math.min(cursorPos.x + 12, (blueprintRef.current?.clientWidth ?? 400) - 96),
                        top: Math.min(cursorPos.y + 12, (blueprintRef.current?.clientHeight ?? 300) - 24)
                      }}
                    >
                      X {(cursorPos.x / (blueprintRef.current?.clientWidth || 1) * 18.4).toFixed(2)}m · Y {(cursorPos.y / (blueprintRef.current?.clientHeight || 1) * 12.1).toFixed(2)}m
                    </div>
                  </>
                )}

                <div className="ldr-bp-caption">
                  <div className="ldr-bp-caption-text">
                    <span className="ldr-bp-caption-name">{heroRooms[activeRoom].name}</span>
                    <span className="ldr-bp-caption-desc">{heroRooms[activeRoom].desc}</span>
                  </div>
                  <span className="ldr-bp-caption-hint">clique nos cômodos →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="ldr-proof">
          <div className="ldr-proof-inner">
            <div className="ldr-proof-metrics">
              {[
                { val: '', num: '6', label: 'módulos integrados nativamente', suffix: '' },
                { val: '', num: '100%', label: 'isolamento de dados por empresa (multi-tenant)', suffix: '' },
                { val: '', num: 'RBAC', label: 'permissões granulares por usuário e papel', suffix: '' },
                { val: '', num: '< 1h', label: 'para cadastrar sua primeira obra', suffix: '' }
              ].map((m, i) => (
                <div key={m.label} className={`ldr-metric ldr-reveal${i > 0 ? ` ldr-d${i}` : ''}`}>
                  <span className="ldr-metric-val">{m.val}<span>{m.num}</span>{m.suffix}</span>
                  <div className="ldr-metric-label">{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <span style={{ display: 'inline-block', background: 'var(--gold-light)', color: 'var(--gold)', border: '1px solid rgba(184,146,42,0.25)', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 500 }}>
                ✦ Plataforma em acesso antecipado — entre agora e trave seu preço para sempre
              </span>
            </div>
          </div>
        </div>

        <section className="ldr-split">
          <div className="ldr-split-grid">
            <div className="ldr-split-side ldr-split-before">
              <div className="ldr-split-label">✕ Sem a Liderum</div>
              <h3 className="ldr-h3">Obras no escuro, margem evaporando</h3>
              <ul className="ldr-pain-list">
                {painItems.map((item) => (
                  <li key={item}><span className="ldr-pain-x">✕</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="ldr-split-side ldr-split-after">
              <div className="ldr-split-label">✓ Com a Liderum</div>
              <h3 className="ldr-h3" style={{ color: '#fff' }}>Controle total, margem protegida</h3>
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
            <div className="ldr-section-tag">Folha A-101 · Módulos</div>
            <h2 className="ldr-h2">Seis módulos.<br /><em>Uma obra sob controle.</em></h2>
            <p className="ldr-section-sub">Da fundação à entrega — cronograma, orçamento, extras e diário de obra integrados nativamente, sem planilhas paralelas.</p>
            <div className="ldr-features-grid">
              {features.map((f, i) => (
                <div key={f.title} className={`ldr-fcard ldr-reveal${i % 3 !== 0 ? ` ldr-d${i % 3}` : ''}`}>
                  <div className="ldr-fnum">MÓD. {String(i + 1).padStart(2, '0')}</div>
                  <div className="ldr-ficon"><IconGlyph name={f.icon} /></div>
                  <h4>{f.title}</h4>
                  <div className="ldr-fdim" aria-hidden="true" />
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ldr-section" id="ldr-how" style={{ background: '#fff' }}>
          <div className="ldr-section-inner">
            <div className="ldr-section-tag">Folha A-102 · Como funciona</div>
            <h2 className="ldr-h2">Três passos para<br /><em>obras sob controle</em></h2>
            <p className="ldr-section-sub">Implantação rápida sem TI dedicado. Sua equipe operando na primeira semana.</p>
            <div className="ldr-steps">
              <div className="ldr-steps-pen" aria-hidden="true" />
              {[
                { n: '1', title: 'Cadastre suas obras', text: 'Adicione obras, defina etapas, responsáveis e orçamentos. Importe dados existentes com a planilha modelo inclusa.' },
                { n: '2', title: 'Acompanhe em tempo real', text: 'Monitore progresso, custos, cronograma e riscos no dashboard executivo. Receba alertas automáticos de desvio.' },
                { n: '3', title: 'Proteja sua margem', text: 'Gerencie extras com fluxo formal de aprovação, mantenha o diário de obra digital e tome decisões com dados reais.' }
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

        <section className="ldr-section" id="ldr-early" style={{ background: 'var(--ink)' }}>
          <div className="ldr-section-inner">
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div className="ldr-section-tag" style={{ color: 'var(--gold2)' }}>Folha A-103 · Acesso antecipado</div>
              <h2 className="ldr-h2" style={{ color: '#fff' }}>Seja um dos primeiros a controlar<br /><em>obras com inteligência</em></h2>
              <p className="ldr-section-sub" style={{ margin: '0 auto', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                A Liderum está crescendo. Não temos dezenas de clientes para mostrar — temos um produto sólido e honesto, construído para durar. Estamos procurando as primeiras construtoras que querem crescer junto com a gente.
              </p>
            </div>
            <div className="ldr-tgrid">
              {earlyBenefits.map((b, i) => (
                <div key={b.title} className={`ldr-tcard ldr-reveal${i > 0 ? ` ldr-d${i + 1}` : ''}`} style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 4, background: 'rgba(212,168,67,0.12)', border: '1px dashed rgba(212,168,67,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold2)', marginBottom: 16 }}>
                    <IconGlyph name={b.icon} />
                  </div>
                  <div className="ldr-tname" style={{ fontSize: '16px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, marginBottom: '10px', color: '#fff' }}>{b.title}</div>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{b.text}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <button type="button" className="ldr-btn-gold" onClick={() => navigate('/contact')}>
                Quero ser um early adopter →
              </button>
            </div>
          </div>
        </section>

        <section className="ldr-section" id="ldr-pricing" style={{ background: 'var(--cream2)' }}>
          <div className="ldr-section-inner">
            <div style={{ textAlign: 'center' }}>
              <div className="ldr-section-tag">Folha A-104 · Preços</div>
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
              <div className="ldr-plan ldr-reveal">
                <div className="ldr-plan-name">Essencial</div>
                <div className="ldr-plan-desc">Para construtoras com até 5 obras simultâneas</div>
                <div className="ldr-plan-price">{price('p1')}</div>
                <div className="ldr-plan-period">{period}</div>
                <ul className="ldr-plan-features">
                  {['Até 5 obras ativas', 'Dashboard executivo', 'Cronograma por etapas', 'Orçamento previsto × realizado', 'Diário de obra com fotos', 'Suporte via chat'].map((f, idx) => (
                    <li key={f} style={{ '--i': idx } as React.CSSProperties}><span className="ldr-check-wrap"><CheckDraw /></span>{f}</li>
                  ))}
                </ul>
                <button type="button" className="ldr-plan-btn light" onClick={() => navigate('/contact')}>Começar grátis</button>
              </div>

              <div className="ldr-plan featured ldr-reveal ldr-d2">
                <div className="ldr-plan-badge">✦ Mais completo</div>
                <div className="ldr-plan-name">Crescimento</div>
                <div className="ldr-plan-desc"><span style={{ color: 'rgba(255,255,255,0.5)' }}>Para construtoras que gerenciam múltiplos projetos</span></div>
                <div className="ldr-plan-price">{price('p2')}</div>
                <div className="ldr-plan-period">{period}</div>
                <ul className="ldr-plan-features">
                  {['Obras ilimitadas', 'Todos os módulos do Essencial', 'Gestão de extras e aditivos', 'Registro de incidentes e ocorrências', 'Múltiplos usuários com perfis de acesso', 'Suporte prioritário'].map((f, idx) => (
                    <li key={f} style={{ '--i': idx } as React.CSSProperties}><span className="ldr-check-wrap"><CheckDraw /></span>{f}</li>
                  ))}
                </ul>
                <button type="button" className="ldr-plan-btn gold" onClick={() => navigate('/contact')}>Começar grátis</button>
              </div>

              <div className="ldr-plan ldr-reveal ldr-d3">
                <div className="ldr-plan-name">Enterprise</div>
                <div className="ldr-plan-desc">Para grupos com múltiplas empresas e obras</div>
                <div className="ldr-plan-price" style={{ fontSize: '28px', paddingTop: '10px' }}>Sob consulta</div>
                <div className="ldr-plan-period" style={{ marginBottom: '28px' }}>Preço personalizado para sua operação</div>
                <ul className="ldr-plan-features">
                  {['Tudo do Crescimento', 'Multi-empresa (multi-tenant)', 'RBAC — permissões granulares por papel', 'Integração via API', 'Implantação assistida', 'Gerente de conta dedicado'].map((f, idx) => (
                    <li key={f} style={{ '--i': idx } as React.CSSProperties}><span className="ldr-check-wrap"><CheckDraw /></span>{f}</li>
                  ))}
                </ul>
                <button type="button" className="ldr-plan-btn light" onClick={() => navigate('/contact')}>Falar com a equipe</button>
              </div>
            </div>
          </div>
        </section>

        <section className="ldr-cta-final" id="ldr-cta">
          <div className="ldr-stamp" aria-hidden="true">
            <svg className="ldr-stamp-svg" viewBox="0 0 120 120" width="100" height="100">
              <defs>
                <path id="ldrStampPath" d="M60,12 a48,48 0 1,1 -0.1,0" />
              </defs>
              <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
              <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
              <text fontSize="7.4" letterSpacing="2" fill="currentColor">
                <textPath href="#ldrStampPath">LIDERUM • ACESSO ANTECIPADO • PRONTO PARA CONSTRUIR •</textPath>
              </text>
              <path d="M40 60l14 14 26-30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="ldr-section-tag">Folha A-105 · Pronto para começar?</div>
          <h2 className="ldr-h2">Sua construtora merece operar com <em>visibilidade total.</em></h2>
          <p>14 dias grátis. Sem cartão de crédito. Todos os módulos disponíveis no período de teste.</p>
          <form className="ldr-cta-form" onSubmit={handleLead}>
            <label htmlFor="ldr-lead-email" className="sr-only">E-mail corporativo</label>
            <input
              id="ldr-lead-email"
              type="email"
              className="ldr-cta-input"
              placeholder="seu@construtora.com.br"
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
