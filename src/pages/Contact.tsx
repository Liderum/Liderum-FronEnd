import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader2, Mail, MapPin, Menu, Phone, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSessionCleanup } from '@/hooks/useSessionCleanup';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.1);}
.la-root{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);min-height:100vh;line-height:1.6;}
.la-root*,.la-root *::before,.la-root *::after{box-sizing:border-box;}
.la-nav{position:fixed;top:0;left:0;right:0;z-index:100;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 48px;background:rgba(247,244,239,0.97);backdrop-filter:blur(14px);border-bottom:1px solid var(--bdr);}
.la-logo{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink);background:none;border:none;cursor:pointer;letter-spacing:-0.5px;}
.la-logo span{color:var(--gold);}
.la-nav-links{display:flex;gap:8px;align-items:center;}
.la-nav-links-mobile{display:none;}
.la-nav-l,.la-nav-r{display:flex;align-items:center;}
.la-nav-c{position:absolute;left:50%;transform:translateX(-50%);}
.la-back-btn{background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink2);display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:6px;transition:all 0.2s;letter-spacing:0.1px;}
.la-back-btn:hover{color:var(--gold);background:var(--gold-light);}
.la-btn{padding:9px 20px;border-radius:6px;font-size:13px;font-weight:500;border:none;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:6px;}
.la-btn-dark{background:var(--ink);color:#fff;}
.la-btn-dark:hover:not(:disabled){background:var(--gold);}
.la-btn-ghost{background:transparent;color:var(--ink);border:1px solid transparent;}
.la-btn-ghost:hover:not(:disabled){border-color:var(--bdr);}
.la-btn-outline{background:transparent;color:var(--ink);border:1px solid var(--bdr);}
.la-btn-outline:hover:not(:disabled){border-color:var(--ink);}
.la-btn:disabled{opacity:0.55;cursor:not-allowed;}
.la-btn-full{width:100%;height:44px;justify-content:center;font-size:14px;}
.la-btn-icon{padding:8px;border-radius:6px;background:transparent;border:none;cursor:pointer;display:flex;align-items:center;color:var(--ink);transition:background 0.2s;}
.la-btn-icon:hover{background:var(--cream2);}
.la-mobile-menu{background:rgba(247,244,239,0.97);border-top:1px solid var(--bdr);padding:12px 20px 16px;display:flex;flex-direction:column;gap:4px;}
.la-main{padding-top:64px;}
/* HERO */
.la-hero{background:#fff;border-bottom:1px solid var(--bdr);padding:80px 48px;}
.la-hero-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
.la-tag{font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin-bottom:16px;}
.la-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(34px,4vw,52px);font-weight:700;line-height:1.1;letter-spacing:-1px;margin-bottom:16px;}
.la-h1 em{font-style:italic;color:var(--gold);}
.la-sub{font-size:16px;color:var(--ink3);line-height:1.75;font-weight:300;margin-bottom:0;max-width:440px;}
.la-cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px;}
/* CONTACT CARD */
.la-contact-card{background:var(--cream2);border:1px solid var(--bdr);border-radius:14px;padding:32px;}
.la-contact-tag{font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:var(--ink3);margin-bottom:20px;display:block;}
.la-channel{display:flex;align-items:flex-start;gap:14px;padding:16px 0;border-bottom:1px solid var(--bdr);}
.la-channel:last-child{border-bottom:none;padding-bottom:0;}
.la-channel-ico{width:36px;height:36px;border-radius:8px;background:var(--gold-light);border:1px solid rgba(184,146,42,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--gold);}
.la-channel-ttl{font-size:13px;font-weight:500;color:var(--ink);margin-bottom:3px;}
.la-channel-val{font-size:13px;color:var(--ink3);line-height:1.6;}
/* FORM SECTION */
.la-form-section{padding:80px 48px;background:var(--cream);}
.la-form-inner{max-width:720px;margin:0 auto;}
.la-h2{font-family:'Cormorant Garamond',serif;font-size:clamp(26px,3vw,36px);font-weight:700;line-height:1.15;letter-spacing:-0.8px;margin-bottom:4px;}
.la-h2 em{font-style:italic;color:var(--gold);}
.la-section-sub{font-size:13px;color:var(--ink3);margin-bottom:28px;}
.la-card{background:#fff;border-radius:16px;padding:40px;border:1px solid var(--bdr);box-shadow:0 4px 40px rgba(26,24,20,0.07);position:relative;overflow:hidden;}
.la-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
/* FIELDS */
.la-field{margin-bottom:18px;}
.la-lbl{display:block;font-size:12px;font-weight:500;color:var(--ink2);margin-bottom:5px;letter-spacing:0.2px;}
.la-inp{width:100%;height:44px;padding:0 12px;border:1px solid rgba(26,24,20,0.14);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--ink);background:#fff;outline:none;transition:border 0.2s,box-shadow 0.2s;}
.la-inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(184,146,42,0.1);}
.la-inp.err{border-color:#C0392B;}
.la-textarea{width:100%;padding:12px;border:1px solid rgba(26,24,20,0.14);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--ink);background:#fff;outline:none;transition:border 0.2s,box-shadow 0.2s;resize:none;line-height:1.6;}
.la-textarea:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(184,146,42,0.1);}
.la-textarea.err{border-color:#C0392B;}
.la-err{display:flex;align-items:center;gap:4px;font-size:11px;color:#C0392B;margin-top:4px;}
/* FOOTER */
.la-footer{border-top:1px solid var(--bdr);background:var(--cream2);padding:28px 48px;}
.la-footer-inner{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;}
.la-footer-logo{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;color:var(--ink);background:none;border:none;cursor:pointer;letter-spacing:-0.5px;}
.la-footer-logo span{color:var(--gold);}
.la-footer-copy{font-size:12px;color:var(--ink3);}
@keyframes la-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.la-anim-1{animation:la-in 0.5s cubic-bezier(0.22,1,0.36,1) both;}
.la-anim-2{animation:la-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both;}
@media(max-width:900px){
  .la-nav{padding:0 20px;}
  .la-nav-links{display:none;}
  .la-nav-links-mobile{display:flex;}
  .la-nav-c{display:none;}
  .la-hero{padding:60px 20px;}
  .la-hero-inner{grid-template-columns:1fr;gap:36px;}
  .la-form-section{padding:60px 20px;}
  .la-card{padding:28px 24px;}
  .la-footer{padding:24px 20px;}
  .la-footer-inner{flex-direction:column;text-align:center;}
}
`;

interface ContactForm {
  nome: string;
  telefone: string;
  email: string;
  mensagem: string;
}

export function Contact() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useSessionCleanup();

  const [form, setForm] = useState<ContactForm>({ nome: '', telefone: '', email: '', mensagem: '' });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!form.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
    if (!form.email.trim()) { newErrors.email = 'E-mail é obrigatório'; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { newErrors.email = 'E-mail inválido'; }
    if (!form.mensagem.trim()) newErrors.mensagem = 'Mensagem é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Erro', description: 'Revise os campos obrigatórios do formulário.', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ title: 'Mensagem enviada', description: 'Recebemos seu contato e retornaremos em breve.' });
      setForm({ nome: '', telefone: '', email: '', mensagem: '' });
    } catch (err) {
      toast({ title: 'Erro', description: 'Não foi possível enviar sua mensagem.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="la-root">
        <nav className="la-nav">
          <div className="la-nav-l">
            <button type="button" className="la-back-btn" onClick={() => navigate('/')}>
              ← Voltar
            </button>
          </div>
          <div className="la-nav-c">
            <button type="button" className="la-logo" onClick={() => navigate('/')}>
              Lide<span>rum</span>
            </button>
          </div>
          <div className="la-nav-r">
            <div className="la-nav-links">
              <button type="button" className="la-btn la-btn-ghost" onClick={() => navigate('/login')}>
                Entrar
              </button>
              <button type="button" className="la-btn la-btn-dark" onClick={() => navigate('/cadastro')}>
                Teste gratuito
              </button>
            </div>
            <button
              type="button"
              className="la-btn-icon la-nav-links-mobile"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="la-mobile-menu" style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 99 }}>
            <button type="button" className="la-btn la-btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/')}>Voltar</button>
            <button type="button" className="la-btn la-btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/login')}>Entrar</button>
            <button type="button" className="la-btn la-btn-dark" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/cadastro')}>Teste gratuito</button>
          </div>
        )}

        <main className="la-main">
          <section className="la-hero">
            <div className="la-hero-inner">
              <div className="la-anim-1">
                <div className="la-tag">Fale conosco</div>
                <h1 className="la-h1">Converse com o time <em>comercial</em> da Liderum.</h1>
                <p className="la-sub">
                  Tire dúvidas sobre módulos, implantação e aderência ao seu processo. Nossa equipe retorna com orientação objetiva para avaliação da plataforma.
                </p>
                <div className="la-cta-row">
                  <button type="button" className="la-btn la-btn-dark" onClick={() => navigate('/cadastro')}>
                    Criar conta teste <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    className="la-btn la-btn-outline"
                    onClick={() => document.getElementById('formulario-contato')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Enviar mensagem
                  </button>
                </div>
              </div>

              <div className="la-anim-2">
                <div className="la-contact-card">
                  <span className="la-contact-tag">Canais de atendimento</span>
                  <div className="la-channel">
                    <div className="la-channel-ico"><Phone size={16} /></div>
                    <div>
                      <div className="la-channel-ttl">Telefone</div>
                      <div className="la-channel-val">(11) 99386-6659<br />Segunda a sexta, 08h às 17h</div>
                    </div>
                  </div>
                  <div className="la-channel">
                    <div className="la-channel-ico"><Mail size={16} /></div>
                    <div>
                      <div className="la-channel-ttl">E-mail</div>
                      <div className="la-channel-val">liderumsuporte@gmail.com.br<br />Resposta em até 24 horas úteis</div>
                    </div>
                  </div>
                  <div className="la-channel">
                    <div className="la-channel-ico"><MapPin size={16} /></div>
                    <div>
                      <div className="la-channel-ttl">Localização</div>
                      <div className="la-channel-val">São Paulo, SP — Brasil</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="la-form-section" id="formulario-contato">
            <div className="la-form-inner">
              <div className="la-tag" style={{ textAlign: 'center' }}>Formulário de contato</div>
              <h2 className="la-h2" style={{ textAlign: 'center' }}>Envie sua <em>mensagem</em></h2>
              <p className="la-section-sub" style={{ textAlign: 'center' }}>
                Preencha os dados abaixo para receber retorno do nosso time.
              </p>

              <div className="la-card">
                <form onSubmit={handleSubmit}>
                  <div className="la-field">
                    <label className="la-lbl" htmlFor="nome">Nome *</label>
                    <input
                      id="nome"
                      className={`la-inp${errors.nome ? ' err' : ''}`}
                      placeholder="Seu nome completo"
                      value={form.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      disabled={loading}
                    />
                    {errors.nome && <p className="la-err"><AlertCircle size={11} />{errors.nome}</p>}
                  </div>

                  <div className="la-field">
                    <label className="la-lbl" htmlFor="telefone">Telefone *</label>
                    <input
                      id="telefone"
                      className={`la-inp${errors.telefone ? ' err' : ''}`}
                      placeholder="(11) 99999-9999"
                      value={form.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      disabled={loading}
                    />
                    {errors.telefone && <p className="la-err"><AlertCircle size={11} />{errors.telefone}</p>}
                  </div>

                  <div className="la-field">
                    <label className="la-lbl" htmlFor="email">E-mail *</label>
                    <input
                      id="email"
                      type="email"
                      className={`la-inp${errors.email ? ' err' : ''}`}
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={loading}
                    />
                    {errors.email && <p className="la-err"><AlertCircle size={11} />{errors.email}</p>}
                  </div>

                  <div className="la-field">
                    <label className="la-lbl" htmlFor="mensagem">Mensagem *</label>
                    <textarea
                      id="mensagem"
                      className={`la-textarea${errors.mensagem ? ' err' : ''}`}
                      placeholder="Descreva seu contexto e o que você precisa para gestão das suas obras."
                      value={form.mensagem}
                      onChange={(e) => handleInputChange('mensagem', e.target.value)}
                      disabled={loading}
                      rows={6}
                    />
                    {errors.mensagem && <p className="la-err"><AlertCircle size={11} />{errors.mensagem}</p>}
                  </div>

                  <button type="submit" className="la-btn la-btn-dark la-btn-full" disabled={loading}>
                    {loading ? (
                      <><Loader2 size={15} className="animate-spin" />Enviando...</>
                    ) : (
                      <><Send size={14} />Enviar mensagem</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>

        <footer className="la-footer">
          <div className="la-footer-inner">
            <button type="button" className="la-footer-logo" onClick={() => navigate('/')}>
              Lide<span>rum</span>
            </button>
            <p className="la-footer-copy">© {new Date().getFullYear()} Liderum. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
