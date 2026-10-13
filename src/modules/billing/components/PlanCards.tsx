import { useId, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, MessageCircle } from 'lucide-react';
import type { Plan } from '@/services/billing';
import { withEnterprise } from '@/services/billing';
import { ENTERPRISE_CONTACT_PATH, HIGHLIGHT_LABEL, formatStorage, getCatalogPlan } from '@/constants/plans';
import { formatBRL } from '../lib';

interface Props {
  plans: Plan[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  disabled?: boolean;
  currentCode?: string | null;
}

// Limites ganham destaque próprio; não repetimos a mesma informação na lista de benefícios.
const LIMIT_FEATURE_RE = /^(até \d+ obras ativas|obras ilimitadas|(até )?\d+ usuários( \(.*\))?|obras e usuários ilimitados|\d+ gb de fotos e anexos|armazenamento sob contrato)$/i;

export const worksLimitLabel = (n: number | null) => (n === null ? 'Ilimitadas' : String(n));
export const worksLimitCaption = (n: number | null) => (n === 1 ? 'obra ativa' : 'obras ativas');

function Limits({ plan }: { plan: Plan }) {
  const { maxActiveWorks: w, maxMembers: m, maxStorageMb: s } = plan.limits;
  return (
    <div className="bl-pc-limits">
      <div className="bl-pc-limit"><b className="bl-num">{worksLimitLabel(w)}</b><small>{w === null ? 'obras ativas' : worksLimitCaption(w)}</small></div>
      <div className="bl-pc-limit"><b className="bl-num">{m === null ? 'Ilimitados' : m}</b><small>{m === 1 ? 'usuário' : 'usuários'}</small></div>
      <div className="bl-pc-limit"><b className="bl-num">{s === null ? 'Sob contrato' : formatStorage(s)}</b><small>de fotos e anexos</small></div>
    </div>
  );
}

function Features({ plan }: { plan: Plan }) {
  const items = plan.purchasable ? plan.features.filter((f) => !LIMIT_FEATURE_RE.test(f.trim())) : plan.features;
  const excluded = getCatalogPlan(plan.code)?.excluded ?? [];
  return (
    <>
      <ul className="bl-pc-list" aria-label={`Inclui no plano ${plan.name}`}>
        {items.map((f) => <li key={f}><Check size={15} aria-hidden /><span>{f}</span></li>)}
      </ul>
      {excluded.length > 0 && (
        <>
          <div className="bl-pc-sub">Não inclui</div>
          <ul className="bl-pc-list no" aria-label={`Não inclui no plano ${plan.name}`}>
            {excluded.map((f) => <li key={f}><Minus size={15} aria-hidden /><span>{f}</span></li>)}
          </ul>
        </>
      )}
    </>
  );
}

/**
 * Escolha de plano em cards. Compráveis = radios nativos (setas/Tab/Espaço de graça, leitor de tela anuncia
 * "n de N"); Enterprise não é comprável e só leva ao contato.
 */
export function PlanCards({ plans, selectedCode, onSelect, disabled = false, currentCode }: Props) {
  const uid = useId();
  const all = useMemo(() => withEnterprise(plans), [plans]);
  const buyable = all.filter((p) => p.purchasable);
  const contactOnly = all.filter((p) => !p.purchasable);

  return (
    <div className="bl-pc-wrap">
      <div role="radiogroup" aria-label="Planos disponíveis" className="bl-pc-group">
        {buyable.map((p) => {
          const selected = selectedCode === p.code;
          const nameId = `${uid}-${p.code}-name`;
          return (
            <label key={p.id} className="bl-pc" data-hl={p.highlighted} data-selected={selected} data-disabled={disabled}>
              <input
                type="radio" name={`${uid}-plan`} value={p.code} className="bl-sr"
                checked={selected} disabled={disabled} aria-labelledby={nameId}
                onChange={() => onSelect(p.code)}
              />
              {p.highlighted && <span className="bl-pc-badge">{HIGHLIGHT_LABEL}</span>}
              <div className="bl-pc-top">{currentCode === p.code && <span className="bl-tag">Plano atual</span>}</div>
              <div>
                <h3 className="bl-pc-name" id={nameId}>{p.name}</h3>
                {p.tagline && <p className="bl-pc-tag">{p.tagline}</p>}
              </div>
              <div className="bl-pc-price bl-num">
                {p.listPriceInCents > p.priceInCents && (
                  <s aria-label={`Preço de tabela ${formatBRL(p.listPriceInCents)}`} style={{ color: 'var(--ink3)', fontSize: 14, marginRight: 8 }}>{formatBRL(p.listPriceInCents)}</s>
                )}
                <strong>{formatBRL(p.priceInCents)}</strong><span>por mês · pagamento por PIX</span>
                {p.listPriceInCents > p.priceInCents && <span className="bl-tag" style={{ marginLeft: 8 }}>Preço de lançamento</span>}
              </div>
              <Limits plan={p} />
              <Features plan={p} />
              <span className="bl-pc-pick" aria-hidden>{selected ? (<><Check size={15} /> Selecionado</>) : 'Escolher este plano'}</span>
            </label>
          );
        })}
      </div>

      {contactOnly.map((p) => (
        <section key={p.id} className="bl-pc bl-pc-ent" aria-labelledby={`${uid}-${p.code}-name`}>
          <div className="bl-pc-top" />
          <div>
            <h3 className="bl-pc-name" id={`${uid}-${p.code}-name`}>{p.name}</h3>
            {p.tagline && <p className="bl-pc-tag">{p.tagline}</p>}
          </div>
          <div className="bl-pc-price"><strong style={{ fontSize: 24 }}>Sob consulta</strong></div>
          <Features plan={p} />
          <Link to={ENTERPRISE_CONTACT_PATH} className="bl-btn">
            <MessageCircle size={15} aria-hidden /> Falar com a equipe
          </Link>
        </section>
      ))}
    </div>
  );
}
