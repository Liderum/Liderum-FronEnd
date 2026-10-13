import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Blueprint } from './Blueprint';
import { LeadForm } from './LeadForm';
import './prospect.css';

const TICKER = ['Cronograma', 'Orçamento', 'Diário de obra', 'Comprovantes', 'Materiais', 'Extras e aditivos', 'Incidentes', 'Alertas de risco', 'Clientes e fornecedores', 'Web e app'];

const delay = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" /></svg>
);

// Marca como visível o que entra na tela; sem IntersectionObserver (ou com movimento reduzido) tudo aparece de uma vez.
function useReveal(root: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const nodes = root.current?.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!nodes?.length) return;
    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach((n) => n.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }),
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [root]);
}

export function ProspectLanding() {
  const root = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  useReveal(root);

  useEffect(() => {
    document.title = 'Liderum — gestão de obras para construtoras';
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // O holofote do hero e o brilho dos cards seguem o ponteiro (variáveis CSS, sem re-render)
  const onHeroMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  const onCardMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--cx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--cy', `${e.clientY - r.top}px`);
  };

  const goContact = () => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="pl" ref={root}>
      <div className="pl-progress" aria-hidden="true" />

      <header className={`pl-nav${stuck ? ' is-stuck' : ''}`}>
        <div className="pl-wrap pl-nav-in">
          <a className="pl-logo" href="#topo" aria-label="Liderum">
            <img src="/logo.svg" alt="" />
            Liderum
          </a>
          <nav className="pl-nav-links" aria-label="Seções">
            <a href="#problema">O problema</a>
            <a href="#recursos">Recursos</a>
            <a href="#app">Web e app</a>
            <a href="#comecar">Como começar</a>
          </nav>
          <a className="pl-btn pl-btn--sm" href="#contato">Falar com a Liderum</a>
        </div>
      </header>

      <main id="topo">
        {/* ───────── hero ───────── */}
        <section className="pl-hero" onPointerMove={onHeroMove}>
          <div className="pl-hero-bg" aria-hidden="true">
            <div className="pl-grid" />
            <div className="pl-spot" />
          </div>
          <div className="pl-wrap pl-hero-grid">
            <div>
              <span className="pl-eyebrow pl-fade" style={delay(0.1)}>Gestão de obras · construção civil</span>
              <h1>
                <span className="line"><span style={delay(0.2)}>Cada obra no prazo,</span></span>
                <span className="line"><span style={delay(0.34)}>no orçamento e</span></span>
                <span className="line"><span style={delay(0.48)}><em>sob o seu olhar.</em></span></span>
              </h1>
              <p className="pl-lead pl-fade" style={delay(0.9)}>
                A Liderum reúne <strong>cronograma, custos, diário de obra e comprovantes</strong> num só lugar —
                do escritório ao canteiro, na web e no celular.
              </p>
              <div className="pl-cta pl-fade" style={delay(1.1)}>
                <button type="button" className="pl-btn" onClick={goContact}>Quero conhecer <Arrow /></button>
                <a className="pl-btn pl-btn--ghost" href="#recursos">Ver o que ela faz</a>
              </div>
            </div>
            <Blueprint />
          </div>
        </section>

        <div className="pl-ticker" aria-hidden="true">
          <div className="pl-ticker-track">
            {[0, 1].map((k) => (
              <span key={k}>{TICKER.map((t) => <b key={t} style={{ fontWeight: 500 }}>{t}</b>)}</span>
            ))}
          </div>
        </div>

        {/* ───────── problema ───────── */}
        <section id="problema" className="pl-sec pl-problem">
          <div className="pl-wrap">
            <div className="pl-head" data-reveal>
              <span className="pl-eyebrow">O problema</span>
              <h2>A obra não atrasa de uma vez. <em>Atrasa em detalhes.</em></h2>
              <p>Quando o prazo estoura ou o custo foge, a causa quase nunca é uma só: é informação espalhada que ninguém consegue juntar a tempo.</p>
            </div>
            <div className="pl-pain">
              <article data-reveal style={delay(0)}>
                <div className="n">01</div>
                <h3><span className="strike">Planilha</span> que ninguém atualiza</h3>
                <p>Cada engenheiro com a sua versão. Quando o número chega à diretoria, já está velho.</p>
              </article>
              <article data-reveal style={delay(0.12)}>
                <div className="n">02</div>
                <h3>Foto perdida no <span className="strike">WhatsApp</span></h3>
                <p>A prova de que o serviço foi feito está numa conversa de três meses atrás — se ainda estiver lá.</p>
              </article>
              <article data-reveal style={delay(0.24)}>
                <div className="n">03</div>
                <h3>Custo descoberto <span className="strike">no fim</span></h3>
                <p>O estouro aparece quando já não dá para corrigir. Sem previsto contra realizado, é sempre tarde.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ───────── recursos ───────── */}
        <section id="recursos" className="pl-sec">
          <div className="pl-wrap">
            <div className="pl-head" data-reveal>
              <span className="pl-eyebrow">O que a Liderum faz</span>
              <h2>Tudo da obra, <em>em ordem</em> e à mão.</h2>
              <p>Pensada para quem executa: o que está acontecendo no canteiro chega ao escritório sem retrabalho.</p>
            </div>

            <div className="pl-feat">
              <article className="pl-card f-a" onPointerMove={onCardMove} data-reveal>
                <span className="tag">Cronograma</span>
                <h3>Prazos por etapa, sem surpresa.</h3>
                <p>Veja o que está no ritmo, o que atrasou e o que vem a seguir — com a data de hoje sempre marcada.</p>
                <div className="demo gantt" data-reveal aria-hidden="true">
                  <div className="gantt-row"><span>Fundação</span><div className="gantt-track"><i className="gantt-bar" style={{ '--l': '0%', '--w': '34%' } as CSSProperties} /></div></div>
                  <div className="gantt-row"><span>Estrutura</span><div className="gantt-track"><i className="gantt-bar" style={{ '--l': '26%', '--w': '40%', '--d': '0.15s' } as CSSProperties} /></div></div>
                  <div className="gantt-row"><span>Alvenaria</span><div className="gantt-track"><i className="gantt-bar late" style={{ '--l': '52%', '--w': '30%', '--d': '0.3s' } as CSSProperties} /></div></div>
                  <div className="gantt-row"><span>Instalações</span><div className="gantt-track"><i className="gantt-bar" style={{ '--l': '66%', '--w': '26%', '--d': '0.45s' } as CSSProperties} /></div></div>
                  <div className="gantt-row"><span>Acabamento</span><div className="gantt-track"><i className="gantt-bar" style={{ '--l': '80%', '--w': '20%', '--d': '0.6s' } as CSSProperties} /><i className="gantt-today" /></div></div>
                </div>
              </article>

              <article className="pl-card f-b" onPointerMove={onCardMove} data-reveal style={delay(0.1)}>
                <span className="tag">Orçamento</span>
                <h3>Previsto × realizado.</h3>
                <p>Saiba, mês a mês, se o custo está onde deveria — e onde está escapando.</p>
                <div className="demo" data-reveal aria-hidden="true">
                  <div className="bars">
                    {[
                      ['Jan', '52%', '48%'], ['Fev', '64%', '70%'], ['Mar', '58%', '55%'], ['Abr', '76%', '73%'], ['Mai', '70%', '78%'],
                    ].map(([m, p, r], i) => (
                      <div className="g" key={m}>
                        <i className="b" style={{ '--h': p, '--d': `${i * 0.1}s` } as CSSProperties} />
                        <i className="b r" style={{ '--h': r, '--d': `${i * 0.1 + 0.08}s` } as CSSProperties} />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                  <div className="legend"><span><i />Previsto</span><span><i className="r" />Realizado</span></div>
                </div>
              </article>

              <article className="pl-card f-c" onPointerMove={onCardMove} data-reveal>
                <span className="tag">Diário de obra</span>
                <h3>A obra registrada, com foto.</h3>
                <p>A equipe registra o dia no próprio celular. Ocorrências e fotos ficam amarradas à obra e à data.</p>
                <div className="demo photos" data-reveal aria-hidden="true">
                  {['SEG 09', 'TER 10', 'QUA 11', 'QUI 12'].map((day, i) => (
                    <div className="photo" key={day} style={{ '--i': i } as CSSProperties}><div className="img" /><small>{day}</small></div>
                  ))}
                </div>
              </article>

              <article className="pl-card f-d" onPointerMove={onCardMove} data-reveal style={delay(0.1)}>
                <span className="tag">Comprovantes</span>
                <h3>Cada gasto com a sua prova.</h3>
                <p>Compras, serviços e recebimentos da obra com o comprovante anexado, no lugar certo e pronto para conferir.</p>
                <div className="demo receipts" data-reveal aria-hidden="true">
                  <div className="receipt" style={delay(0)}><span>Concreto usinado · NF anexada</span><b className="ok">✓ conferido</b></div>
                  <div className="receipt" style={delay(0.15)}><span>Mão de obra · recibo anexado</span><b className="ok">✓ conferido</b></div>
                  <div className="receipt" style={delay(0.3)}><span>Aço CA-50 · aguardando comprovante</span><b>• pendente</b></div>
                </div>
              </article>
            </div>

            <div className="pl-mini" data-reveal>
              <div>
                <svg className="ico" viewBox="0 0 32 32" aria-hidden="true"><path d="M4 26V10l8-5 8 5v16M4 26h24M20 26V14l8 4v8M10 14h4M10 19h4" /></svg>
                <h4>Dashboard executivo</h4>
                <p>Obras ativas, atrasos, custo e margem num painel só.</p>
              </div>
              <div>
                <svg className="ico" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 9h22M5 16h22M5 23h14M25 20v6M22 23h6" /></svg>
                <h4>Materiais e extras</h4>
                <p>Catálogo, necessidades por obra e aditivos que entram no custo.</p>
              </div>
              <div>
                <svg className="ico" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4 4 27h24L16 4ZM16 13v7M16 23.5v.5" /></svg>
                <h4>Incidentes e riscos</h4>
                <p>Registre ocorrências e acompanhe alertas antes que virem prejuízo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── web + app ───────── */}
        <section id="app" className="pl-sec pl-devices">
          <div className="pl-wrap pl-dev-grid">
            <div data-reveal>
              <span className="pl-eyebrow">Web e app</span>
              <div className="pl-head" style={{ marginBottom: 0 }}>
                <h2>No escritório e <em>no canteiro.</em></h2>
                <p>A diretoria acompanha pelo painel. A equipe registra pelo celular. É a mesma informação, atualizada na hora.</p>
              </div>
              <div className="pl-check">
                <ul>
                  <li><svg viewBox="0 0 26 26" aria-hidden="true"><path d="M4 13.5 10 19.5 22 6.5" /></svg><span><b>Quem registra, registra uma vez</b>Foto, ocorrência ou comprovante entram direto na obra certa.</span></li>
                  <li><svg viewBox="0 0 26 26" aria-hidden="true"><path d="M4 13.5 10 19.5 22 6.5" /></svg><span><b>Quem decide, vê na hora</b>Sem esperar o fechamento da planilha para saber como a obra está.</span></li>
                  <li><svg viewBox="0 0 26 26" aria-hidden="true"><path d="M4 13.5 10 19.5 22 6.5" /></svg><span><b>Cada um vê o que precisa</b>Permissões por pessoa, e os dados de uma empresa nunca se misturam com os de outra.</span></li>
                </ul>
              </div>
            </div>
            <div className="pl-phone" data-reveal aria-hidden="true" style={delay(0.15)}>
              <div className="pl-screen">
                <span className="s">Obra · Residencial Aurora</span>
                <span className="t">Hoje na obra</span>
                <div className="row" style={delay(0)}><span>Diário registrado</span><span>08:12</span></div>
                <div className="row" style={delay(0.25)}><span>4 fotos enviadas</span><span>10:40</span></div>
                <div className="row" style={delay(0.5)}><span>Comprovante · concreto</span><span>11:05</span></div>
                <div className="row" style={delay(0.75)}><span>Etapa Estrutura</span><span>82%</span></div>
                <div className="row" style={delay(1)}><span>Custo realizado</span><span>−2,1%</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── passos ───────── */}
        <section id="comecar" className="pl-sec">
          <div className="pl-wrap">
            <div className="pl-head" data-reveal>
              <span className="pl-eyebrow">Como começar</span>
              <h2>Da conversa à primeira obra <em>no ar.</em></h2>
            </div>
            <div className="pl-steps">
              <div className="pl-step" data-reveal><div className="dot">1</div><h3>Conversamos</h3><p>Você conta como toca as obras hoje. Sem apresentação pronta: queremos entender a sua rotina.</p></div>
              <div className="pl-step" data-reveal style={delay(0.15)}><div className="dot">2</div><h3>Configuramos juntos</h3><p>Cadastramos a primeira obra, o cronograma e o orçamento para você já ver a Liderum com dado real.</p></div>
              <div className="pl-step" data-reveal style={delay(0.3)}><div className="dot">3</div><h3>Equipe em campo</h3><p>Sua equipe passa a registrar pelo celular e você acompanha o painel atualizado.</p></div>
            </div>
          </div>
        </section>

        {/* ───────── contato ───────── */}
        <section id="contato" className="pl-sec pl-contact">
          <div className="pl-wrap pl-contact-grid">
            <div className="pl-side" data-reveal>
              <span className="pl-eyebrow">Fale com a Liderum</span>
              <h2>Vamos olhar a <em>sua obra</em> juntos?</h2>
              <p>Deixe seus dados e conte, em uma linha, o que mais pesa na sua rotina. A gente retorna para conversar.</p>
              <div className="pl-pledge">
                <span>Conversa sem compromisso</span>
                <span>Retorno pelo e-mail ou telefone informado</span>
                <span>Feito para construtoras e equipes de obra</span>
              </div>
            </div>
            <div data-reveal style={delay(0.15)}>
              <LeadForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="pl-foot">
        <div className="pl-wrap">
          <span>© {new Date().getFullYear()} Liderum · Gestão de obras</span>
          <span>Feito para quem constrói.</span>
        </div>
      </footer>
    </div>
  );
}

export default ProspectLanding;
