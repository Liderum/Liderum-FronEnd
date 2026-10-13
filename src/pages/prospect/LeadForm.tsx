import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { LeadRateLimitedError, LeadService, rateLimitMessage } from '@/services/leadService';

const PORTES = [
  'Até 5 obras ao mesmo tempo',
  'De 6 a 20 obras',
  'Mais de 20 obras',
  'Ainda não tenho obras em andamento',
];

type Fields = { nome: string; empresa: string; email: string; telefone: string; porte: string; mensagem: string; website: string };
type Errors = Partial<Record<'nome' | 'empresa' | 'email' | 'telefone', string>>;

const EMPTY: Fields = { nome: '', empresa: '', email: '', telefone: '', porte: '', mensagem: '', website: '' };

/** (11) 91234-5678 — aceita fixo (10 dígitos) e celular (11). */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function validateLead(f: Fields): Errors {
  const e: Errors = {};
  if (f.nome.trim().length < 2) e.nome = 'Como podemos te chamar?';
  if (f.empresa.trim().length < 2) e.empresa = 'Informe o nome da empresa.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Confira o e-mail.';
  const digits = f.telefone.replace(/\D/g, '');
  if (digits.length < 10) e.telefone = 'Informe o DDD e o número.';
  return e;
}

export function LeadForm() {
  const uid = useId();
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [failure, setFailure] = useState<string | null>(null);

  const set = (key: keyof Fields) => (ev: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = key === 'telefone' ? formatPhone(ev.target.value) : ev.target.value;
    setValues((v) => ({ ...v, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    if (status === 'sending') return;

    const found = validateLead(values);
    setErrors(found);
    setFailure(null);
    if (Object.keys(found).length > 0) return;

    setStatus('sending');
    try {
      await LeadService.send({
        nome: values.nome.trim(),
        empresa: values.empresa.trim(),
        email: values.email.trim(),
        telefone: values.telefone.trim(),
        porte: values.porte || undefined,
        mensagem: values.mensagem.trim() || undefined,
        website: values.website || undefined,
      });
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      setFailure(err instanceof LeadRateLimitedError ? rateLimitMessage(err.retryAfterSeconds) : err instanceof Error ? err.message : 'Não foi possível enviar agora.');
    }
  }

  if (status === 'done') {
    return (
      <div className="pl-form">
        <div className="pl-done" role="status">
          <svg viewBox="0 0 84 84" aria-hidden="true">
            <circle cx="42" cy="42" r="38" pathLength={1} />
            <path d="M25 43 L37 55 L60 30" pathLength={1} />
          </svg>
          <h3>Recebemos seu contato.</h3>
          <p>Obrigado, {values.nome.trim().split(' ')[0]}. Vamos falar com você pelo e-mail ou telefone que informou para entender a sua operação.</p>
          <button
            type="button"
            className="pl-btn pl-btn--ghost pl-btn--sm"
            onClick={() => { setValues(EMPTY); setStatus('idle'); }}
          >
            Enviar outro contato
          </button>
        </div>
      </div>
    );
  }

  const id = (name: string) => `${uid}-${name}`;
  const field = (name: 'nome' | 'empresa' | 'email' | 'telefone') => ({
    id: id(name),
    value: values[name],
    onChange: set(name),
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${id(name)}-msg` : undefined,
  });

  return (
    <form className="pl-form" onSubmit={submit} noValidate aria-label="Fale com a Liderum">
      <div className="pl-fields">
        <div className="pl-field" data-invalid={!!errors.nome}>
          <label htmlFor={id('nome')}>Seu nome</label>
          <input {...field('nome')} autoComplete="name" maxLength={150} placeholder="Maria Souza" />
          <span className="msg" id={id('nome-msg')}>{errors.nome}</span>
        </div>
        <div className="pl-field" data-invalid={!!errors.empresa}>
          <label htmlFor={id('empresa')}>Empresa</label>
          <input {...field('empresa')} autoComplete="organization" maxLength={150} placeholder="Construtora Aurora" />
          <span className="msg" id={id('empresa-msg')}>{errors.empresa}</span>
        </div>
        <div className="pl-field" data-invalid={!!errors.email}>
          <label htmlFor={id('email')}>E-mail</label>
          <input {...field('email')} type="email" inputMode="email" autoComplete="email" maxLength={255} placeholder="maria@aurora.com.br" />
          <span className="msg" id={id('email-msg')}>{errors.email}</span>
        </div>
        <div className="pl-field" data-invalid={!!errors.telefone}>
          <label htmlFor={id('telefone')}>Telefone / WhatsApp</label>
          <input {...field('telefone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 91234-5678" />
          <span className="msg" id={id('telefone-msg')}>{errors.telefone}</span>
        </div>
        <div className="pl-field wide">
          <label htmlFor={id('porte')}>Quantas obras você toca hoje?</label>
          <select id={id('porte')} value={values.porte} onChange={set('porte')}>
            <option value="">Prefiro não dizer agora</option>
            {PORTES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="pl-field wide">
          <label htmlFor={id('mensagem')}>O que mais pesa na sua rotina? <span style={{ opacity: 0.6 }}>(opcional)</span></label>
          <textarea id={id('mensagem')} value={values.mensagem} onChange={set('mensagem')} maxLength={2000} placeholder="Ex.: acompanhar custo real, cobrar comprovantes da equipe, prazos…" />
        </div>
      </div>

      {/* Honeypot: fora da tela e fora da ordem de tab. Quem preenche é robô. */}
      <div className="pl-hp" aria-hidden="true">
        <label htmlFor={id('website')}>Não preencha este campo</label>
        <input id={id('website')} name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
      </div>

      <div aria-live="assertive">
        {failure && <div className="pl-alert" role="alert">{failure}</div>}
      </div>

      <div className="pl-form-foot">
        <button type="submit" className="pl-btn" disabled={status === 'sending'}>
          {status === 'sending' ? <><span className="pl-spin" aria-hidden="true" /> Enviando…</> : (
            <>Quero conversar <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" /></svg></>
          )}
        </button>
        <small>Usamos seus dados apenas para retornar este contato.</small>
      </div>
    </form>
  );
}
