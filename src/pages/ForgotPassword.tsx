import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateEmail } from '@/lib/emailValidation';
import { AuthService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { SimpleToast } from '@/components/SimpleToast';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.1);}
.la-root{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);min-height:100vh;line-height:1.6;}
.la-root*,.la-root *::before,.la-root *::after{box-sizing:border-box;}
.la-nav{position:fixed;top:0;left:0;right:0;z-index:100;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 48px;background:rgba(247,244,239,0.97);backdrop-filter:blur(14px);border-bottom:1px solid var(--bdr);}
.la-logo{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink);background:none;border:none;cursor:pointer;letter-spacing:-0.5px;}
.la-logo span{color:var(--gold);}
.la-btn{padding:9px 20px;border-radius:6px;font-size:13px;font-weight:500;border:none;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:6px;}
.la-btn-dark{background:var(--ink);color:#fff;}
.la-btn-dark:hover:not(:disabled){background:var(--gold);}
.la-btn-ghost{background:transparent;color:var(--ink);border:1px solid var(--bdr);}
.la-btn-ghost:hover:not(:disabled){border-color:var(--ink);}
.la-btn-outline{background:transparent;color:var(--ink);border:1px solid rgba(26,24,20,0.15);}
.la-btn-outline:hover:not(:disabled){border-color:var(--ink);}
.la-btn:disabled{opacity:0.55;cursor:not-allowed;}
.la-btn-full{width:100%;height:44px;justify-content:center;font-size:14px;}
.la-main{padding-top:64px;min-height:100vh;}
.la-centered{display:flex;align-items:center;min-height:calc(100vh - 64px);}
.la-wrap{max-width:1100px;margin:0 auto;width:100%;padding:60px 48px;}
.la-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
.la-tag{font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin-bottom:16px;}
.la-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(34px,4vw,50px);font-weight:700;line-height:1.1;letter-spacing:-1px;margin-bottom:16px;}
.la-h1 em{font-style:italic;color:var(--gold);}
.la-sub{font-size:15px;color:var(--ink3);line-height:1.75;font-weight:300;margin-bottom:0;max-width:400px;}
.la-card{background:#fff;border-radius:16px;padding:40px;border:1px solid var(--bdr);box-shadow:0 4px 40px rgba(26,24,20,0.07);position:relative;overflow:hidden;}
.la-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.la-card-ico{width:56px;height:56px;border-radius:50%;background:var(--gold-light);border:2px solid rgba(184,146,42,0.25);display:flex;align-items:center;justify-content:center;margin-bottom:20px;color:var(--gold);}
.la-card-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink);margin-bottom:4px;}
.la-card-sub{font-size:13px;color:var(--ink3);margin-bottom:28px;}
.la-field{margin-bottom:18px;}
.la-lbl{display:block;font-size:12px;font-weight:500;color:var(--ink2);margin-bottom:5px;letter-spacing:0.2px;}
.la-inp-wrap{position:relative;}
.la-inp-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none;}
.la-inp{width:100%;height:44px;padding:0 12px 0 36px;border:1px solid rgba(26,24,20,0.14);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--ink);background:#fff;outline:none;transition:border 0.2s,box-shadow 0.2s;}
.la-inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(184,146,42,0.1);}
.la-inp.err{border-color:#C0392B;}
.la-err{display:flex;align-items:center;gap:4px;font-size:11px;color:#C0392B;margin-top:4px;}
.la-steps-box{background:var(--cream);border:1px solid var(--bdr);border-radius:10px;padding:16px 20px;font-size:13px;color:var(--ink2);display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
.la-step-li{display:flex;align-items:flex-start;gap:8px;}
.la-step-num{width:20px;height:20px;border-radius:50%;background:var(--gold-light);border:1px solid rgba(184,146,42,0.3);font-size:10px;font-weight:700;color:var(--gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
.la-divider{border:none;border-top:1px solid var(--bdr);margin:16px 0;}
.la-nav-l,.la-nav-r{display:flex;align-items:center;}
.la-nav-c{position:absolute;left:50%;transform:translateX(-50%);}
.la-back-btn{background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink2);display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:6px;transition:all 0.2s;letter-spacing:0.1px;}
.la-back-btn:hover{color:var(--gold);background:var(--gold-light);}
@keyframes la-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.la-anim-1{animation:la-in 0.5s cubic-bezier(0.22,1,0.36,1) both;}
.la-anim-2{animation:la-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both;}
@media(max-width:900px){.la-nav{padding:0 20px;}.la-wrap{padding:40px 20px;}.la-grid-2{grid-template-columns:1fr;gap:36px;}.la-card{padding:28px 24px;}.la-nav-c{display:none;}}
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const { toast } = useToast();
  const { showError, errorToast, hideError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setErrors({ email: 'Email é obrigatório' }); return; }
    if (!validateEmail(email)) { setErrors({ email: 'Email inválido' }); return; }

    setIsLoading(true);
    setErrors({});
    try {
      await AuthService.forgotPassword({ email });
      setIsSuccess(true);
      toast({ title: 'Código enviado!', description: 'Verifique seu email para o código de recuperação.', variant: 'default', duration: 5000, className: 'bg-green-50 border-green-200' });
    } catch (error: unknown) {
      showError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/validate-code', { state: { email } });
  };

  if (isSuccess) {
    return (
      <>
        <style>{CSS}</style>
        <div className="la-root">
          <nav className="la-nav">
            <div className="la-nav-l">
              <button type="button" className="la-back-btn" onClick={() => navigate('/login')}>
                ← Voltar ao login
              </button>
            </div>
            <div className="la-nav-c">
              <button type="button" className="la-logo" onClick={() => navigate('/')}>
                Lide<span>rum</span>
              </button>
            </div>
            <div className="la-nav-r" />
          </nav>
          <main className="la-main">
            <div className="la-centered">
              <div className="la-wrap">
                <div className="la-grid-2">
                  <div className="la-anim-1">
                    <div className="la-tag">Recuperação de acesso</div>
                    <h1 className="la-h1">Código enviado com <em>sucesso</em></h1>
                    <p className="la-sub">
                      Enviamos um código de 6 dígitos para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
                    </p>
                  </div>

                  <div className="la-anim-2">
                    <div className="la-card">
                      <div className="la-card-ico">
                        <CheckCircle2 size={26} />
                      </div>
                      <div className="la-card-title">Verifique seu email</div>
                      <div className="la-card-sub">Siga os passos para redefinir sua senha</div>

                      <div className="la-steps-box">
                        <div className="la-step-li"><span className="la-step-num">1</span>Abra o email enviado pela Liderum</div>
                        <div className="la-step-li"><span className="la-step-num">2</span>Copie o código de 6 dígitos</div>
                        <div className="la-step-li"><span className="la-step-num">3</span>Insira o código para redefinir sua senha</div>
                      </div>

                      <button type="button" className="la-btn la-btn-dark la-btn-full" onClick={handleContinue}>
                        Inserir código →
                      </button>
                      <hr className="la-divider" />
                      <button type="button" className="la-btn la-btn-outline la-btn-full" onClick={() => navigate('/login')}>
                        <ArrowLeft size={14} /> Voltar ao login
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="la-root">
        <nav className="la-nav">
          <div className="la-nav-l">
            <button type="button" className="la-back-btn" onClick={() => navigate('/login')}>
              ← Voltar ao login
            </button>
          </div>
          <div className="la-nav-c">
            <button type="button" className="la-logo" onClick={() => navigate('/')}>
              Lide<span>rum</span>
            </button>
          </div>
          <div className="la-nav-r" />
        </nav>

        <main className="la-main">
          <div className="la-centered">
            <div className="la-wrap">
              <div className="la-grid-2">
                <div className="la-anim-1">
                  <div className="la-tag">Recuperação de senha</div>
                  <h1 className="la-h1">Redefina seu <em>acesso</em></h1>
                  <p className="la-sub">
                    Informe o email da sua conta. Enviaremos um código de validação para continuar o processo de recuperação.
                  </p>
                </div>

                <div className="la-anim-2">
                  <div className="la-card">
                    <div className="la-card-ico">
                      <Mail size={24} />
                    </div>
                    <div className="la-card-title">Recuperar senha</div>
                    <div className="la-card-sub">Digite seu email para receber o código de recuperação</div>

                    <form onSubmit={handleSubmit}>
                      <div className="la-field">
                        <label className="la-lbl" htmlFor="email">Email</label>
                        <div className="la-inp-wrap">
                          <Mail size={15} className="la-inp-ico" />
                          <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            className={`la-inp${errors.email ? ' err' : ''}`}
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({}); }}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email && <p className="la-err"><AlertCircle size={11} />{errors.email}</p>}
                      </div>

                      <button type="submit" className="la-btn la-btn-dark la-btn-full" disabled={isLoading || !email}>
                        {isLoading ? (
                          <><Loader2 size={15} className="animate-spin" />Enviando...</>
                        ) : (
                          'Enviar código'
                        )}
                      </button>
                    </form>

                    <hr className="la-divider" />
                    <button type="button" className="la-btn la-btn-outline la-btn-full" onClick={() => navigate('/login')}>
                      <ArrowLeft size={14} /> Voltar ao login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <SimpleToast
          isVisible={errorToast.isVisible}
          message={errorToast.message}
          type={errorToast.type}
          onCancel={hideError}
          showActions={false}
          details={errorToast.details}
          errorCode={errorToast.errorCode}
          timestamp={errorToast.timestamp}
        />
      </div>
    </>
  );
};

export default ForgotPassword;
