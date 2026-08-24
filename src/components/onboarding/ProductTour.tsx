import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/authService';

const CSS = `
.pt-veil{position:fixed;inset:0;z-index:200;background:rgba(15,13,9,0.62);opacity:0;pointer-events:none;transition:opacity 0.3s ease;}
.pt-veil.on{opacity:1;pointer-events:auto;}
.pt-spot{position:fixed;z-index:201;border-radius:10px;box-shadow:0 0 0 4px rgba(212,168,67,0.4),0 0 0 9999px rgba(15,13,9,0.62);opacity:0;pointer-events:none;transition:top 0.35s cubic-bezier(.22,1,.36,1),left 0.35s cubic-bezier(.22,1,.36,1),width 0.35s cubic-bezier(.22,1,.36,1),height 0.35s cubic-bezier(.22,1,.36,1),opacity 0.2s ease;}
.pt-spot.on{opacity:1;}
.pt-coach{position:fixed;z-index:202;width:280px;background:#fff;border:1px solid rgba(26,24,20,0.14);border-radius:12px;padding:18px 20px;box-shadow:0 16px 44px -10px rgba(0,0,0,0.35);opacity:0;transform:translateY(6px);transition:opacity 0.25s ease,transform 0.25s ease,top 0.35s cubic-bezier(.22,1,.36,1),left 0.35s cubic-bezier(.22,1,.36,1);pointer-events:none;font-family:'DM Sans',sans-serif;}
.pt-coach.on{opacity:1;transform:translateY(0);pointer-events:auto;}
.pt-coach.center{width:340px;text-align:center;}
.pt-coach::before{content:'';position:absolute;width:12px;height:12px;background:#fff;transform:rotate(135deg);}
.pt-coach[data-arrow="left"]::before{left:-7px;top:24px;border-left:1px solid rgba(26,24,20,0.14);border-bottom:1px solid rgba(26,24,20,0.14);}
.pt-coach[data-arrow="top"]::before{top:-7px;left:26px;transform:rotate(-45deg);border-left:1px solid rgba(26,24,20,0.14);border-bottom:1px solid rgba(26,24,20,0.14);}
.pt-step{font-family:'DM Mono','SFMono-Regular',monospace;font-size:10px;color:#8A6A1C;letter-spacing:0.05em;margin-bottom:6px;}
.pt-title{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:18px;color:#1A1814;margin-bottom:6px;}
.pt-body{font-size:12.5px;color:#3D3A34;line-height:1.55;}
.pt-foot{display:flex;align-items:center;justify-content:space-between;margin-top:14px;gap:10px;}
.pt-skip{background:none;border:none;font-size:11.5px;color:#7A7670;cursor:pointer;font-family:'DM Sans',sans-serif;padding:4px 2px;}
.pt-skip:hover{color:#1A1814;text-decoration:underline;}
.pt-actions{display:flex;align-items:center;gap:10px;}
.pt-dots{display:flex;gap:5px;}
.pt-dots span{width:5px;height:5px;border-radius:50%;background:rgba(26,24,20,0.16);transition:background 0.2s,width 0.2s;}
.pt-dots span.active{background:#B8922A;width:14px;border-radius:3px;}
.pt-next{background:#1A1814;color:#fff;border:none;border-radius:7px;padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;}
.pt-next:hover{background:#B8922A;}
`;

interface TourStep {
  key: string;
  title: string;
  body: string;
  targetId?: string;
  arrow?: 'left' | 'top';
  center?: boolean;
  icon?: string;
}

const STEPS: TourStep[] = [
  {
    key: 'welcome',
    title: 'Bem-vindo ao Liderum',
    body: 'Sua empresa já está com o cadastro completo. Antes de começar, um tour rápido pelos módulos principais — você pode pular a qualquer momento.',
    center: true,
    icon: '👋',
  },
  {
    key: 'dashboard',
    title: 'Dashboard',
    body: 'Visão consolidada de todas as suas obras: quantas estão ativas, atrasadas, o custo previsto x realizado e a margem média da operação — tudo em tempo real.',
    targetId: 'dashboard-hero',
    arrow: 'top',
  },
  {
    key: 'kpis',
    title: 'Indicadores no topo',
    body: 'Esses cartões resumem a saúde do seu portfólio de obras num olhar só — é a primeira coisa que você vê ao entrar todo dia.',
    targetId: 'dashboard-kpis',
    arrow: 'top',
  },
  {
    key: 'obras',
    title: 'Obras',
    body: 'A obra é a entidade central do sistema. Cada uma tem seu próprio endereço, orçamento total, prazo e status — e é a partir dela que tudo mais se organiza.',
    targetId: 'nav-obras',
    arrow: 'left',
  },
  {
    key: 'gestao',
    title: 'O fluxo de uma obra',
    body: 'Ao entrar numa obra específica, você navega entre Cronograma (linha do tempo com dependências), Orçamento (previsto x realizado), Extras (aditivos para aprovação) e Diário de Obra (registro diário com fotos e ocorrências).',
    targetId: 'nav-gestao',
    arrow: 'left',
  },
  {
    key: 'cadastros',
    title: 'Cadastros',
    body: 'A base de relacionamento da sua operação: as empresas do grupo, seus clientes e fornecedores — usados em obras, orçamentos e contratos.',
    targetId: 'nav-cadastros',
    arrow: 'left',
  },
  {
    key: 'admin',
    title: 'Administração',
    body: 'Convide colaboradores, defina o que cada um pode acessar em Controle de Acesso, e mantenha os dados da sua empresa sempre atualizados em Configurações.',
    targetId: 'nav-admin',
    arrow: 'left',
  },
  {
    key: 'finish',
    title: 'Pronto pra começar',
    body: 'É isso — o resto você descobre usando. Se precisar de ajuda, os textos e mensagens de erro do sistema sempre explicam o próximo passo.',
    center: true,
    icon: '✓',
  },
];

const SPOT_PAD = 6;

// A sidebar é renderizada mais de uma vez no DOM (versão desktop, versão mobile
// escondida via CSS/display:none) — pega o primeiro elemento com o data-tour-id
// que esteja realmente visível, não só o primeiro que existir no DOM.
function findVisibleTarget(id: string): Element | null {
  const candidates = document.querySelectorAll(`[data-tour-id="${id}"]`);
  for (const el of Array.from(candidates)) {
    if (el instanceof HTMLElement && el.offsetParent !== null) return el;
  }
  return candidates[0] ?? null;
}

export function ProductTour() {
  const { isAuthenticated, isOnboardingComplete, isTenantAdmin, tourSeen, setTourSeen } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const finishingRef = useRef(false);

  // Dispara uma única vez: onboarding da PJ completo + usuário ainda não viu o
  // tour. Colaboradores não-admin também veem — o tour é sobre navegação, não
  // sobre o formulário de onboarding em si.
  useEffect(() => {
    if (!isAuthenticated || active || finishingRef.current) return;
    if (isOnboardingComplete === true && tourSeen === false) {
      if (location.pathname !== '/home') navigate('/home');
      setStep(0);
      setActive(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOnboardingComplete, tourSeen]);

  const measure = useCallback(() => {
    const current = STEPS[step];
    if (!current || current.center || !current.targetId) {
      setRect(null);
      return;
    }
    const el = findVisibleTarget(current.targetId);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useEffect(() => {
    if (!active) return;
    // Pequeno atraso pra dar tempo do DOM assentar após navegação/transição de rota.
    const t = setTimeout(measure, 120);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, measure]);

  // Se o alvo do passo não existe no DOM (ex.: usuário sem a permissão daquele
  // módulo), pula automaticamente pro próximo em vez de travar num spotlight vazio.
  useEffect(() => {
    if (!active) return;
    const current = STEPS[step];
    if (!current.center && current.targetId && !findVisibleTarget(current.targetId)) {
      const t = setTimeout(() => {
        if (step < STEPS.length - 1) setStep((s) => s + 1);
        else finish(false);
      }, 200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step]);

  const finish = async (skipped: boolean) => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setActive(false);
    setTourSeen(true);
    try {
      await UserService.updateTourStatus(skipped);
    } catch {
      // Não bloqueia a experiência — na pior hipótese o tour aparece de novo
      // no próximo login, o que é preferível a travar a navegação por causa disso.
    }
  };

  if (!active) return null;

  const current = STEPS[step];
  const isCenter = !!current.center || !rect;

  const coachStyle: React.CSSProperties = isCenter
    ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    : current.arrow === 'top'
      ? { top: rect!.top + rect!.height + 16, left: Math.max(16, rect!.left) }
      : { top: Math.max(16, rect!.top - 4), left: rect!.left + rect!.width + 18 };

  return (
    <>
      <style>{CSS}</style>
      <div className={`pt-veil${active ? ' on' : ''}`} />
      {rect && !isCenter && (
        <div
          className="pt-spot on"
          style={{
            top: rect.top - SPOT_PAD,
            left: rect.left - SPOT_PAD,
            width: rect.width + SPOT_PAD * 2,
            height: rect.height + SPOT_PAD * 2,
          }}
        />
      )}
      <div
        className={`pt-coach on${isCenter ? ' center' : ''}`}
        data-arrow={isCenter ? 'none' : current.arrow}
        style={coachStyle}
      >
        <div className="pt-step">Passo {step + 1} de {STEPS.length}</div>
        <div className="pt-title">{current.icon ? `${current.icon}  ` : ''}{current.title}</div>
        <div className="pt-body">
          {current.key === 'admin' && !isTenantAdmin
            ? 'Convide colaboradores e gerencie o que cada um pode acessar — disponível para o administrador da conta.'
            : current.body}
        </div>
        <div className="pt-foot">
          <button className="pt-skip" onClick={() => finish(true)}>Pular tour</button>
          <div className="pt-actions">
            <div className="pt-dots">
              {STEPS.map((s, idx) => (
                <span key={s.key} className={idx === step ? 'active' : ''} />
              ))}
            </div>
            <button
              className="pt-next"
              onClick={() => (step < STEPS.length - 1 ? setStep((s) => s + 1) : finish(false))}
            >
              {step < STEPS.length - 1 ? 'Próximo →' : 'Concluir'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
