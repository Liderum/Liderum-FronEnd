import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail } from '@/lib/emailValidation';
import { Redirecting } from '@/components/Redirecting';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream2:#EDE9E1;--gold-light:#F0E4C4;}
.la-root{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--ink);min-height:100vh;line-height:1.6;}
.la-root*,.la-root *::before,.la-root *::after{box-sizing:border-box;}
.la-nav{position:fixed;top:0;left:0;right:0;z-index:100;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 48px;background:rgb(var(--cream-rgb, 247 244 239) / 0.97);backdrop-filter:blur(14px);border-bottom:1px solid var(--bdr);}
.la-logo{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:var(--ink);background:none;border:none;cursor:pointer;letter-spacing:-0.5px;}
.la-logo span{color:var(--gold);}
.la-btn{padding:9px 20px;border-radius:6px;font-size:13px;font-weight:500;border:none;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:6px;}
.la-btn-dark{background:var(--ink);color:#fff;}
.la-btn-dark:hover:not(:disabled){background:var(--gold);}
.la-btn-ghost{background:transparent;color:var(--ink);border:1px solid var(--bdr);}
.la-btn-ghost:hover:not(:disabled){border-color:var(--ink);}
.la-btn:disabled{opacity:0.55;cursor:not-allowed;}
.la-btn-full{width:100%;height:44px;justify-content:center;font-size:14px;}
.la-main{padding-top:64px;min-height:100vh;}
.la-centered{display:flex;align-items:center;min-height:calc(100vh - 64px);}
.la-wrap{max-width:1100px;margin:0 auto;width:100%;padding:60px 48px;}
.la-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
.la-tag{font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin-bottom:16px;}
.la-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(36px,4vw,52px);font-weight:700;line-height:1.1;letter-spacing:-1px;margin-bottom:16px;}
.la-h1 em{font-style:italic;color:var(--gold);}
.la-sub{font-size:15px;color:var(--ink3);line-height:1.75;font-weight:300;margin-bottom:28px;max-width:400px;}
.la-trust{display:flex;flex-direction:column;gap:12px;}
.la-trust-item{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--ink2);line-height:1.5;}
.la-trust-check{width:20px;height:20px;border-radius:50%;background:var(--gold-light);border:1px solid rgba(184,146,42,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--gold);flex-shrink:0;margin-top:1px;}
.la-card{background:var(--card-bg, #fff);border-radius:16px;padding:40px;border:1px solid var(--bdr);box-shadow:0 4px 40px rgba(26,24,20,0.07);position:relative;overflow:hidden;}
.la-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.la-card-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink);margin-bottom:4px;}
.la-card-sub{font-size:13px;color:var(--ink3);margin-bottom:28px;}
.la-field{margin-bottom:16px;}
.la-lbl{display:block;font-size:12px;font-weight:500;color:var(--ink2);margin-bottom:5px;letter-spacing:0.2px;}
.la-lbl-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;}
.la-inp-wrap{position:relative;}
.la-inp-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none;}
.la-inp{width:100%;height:44px;padding:0 12px 0 36px;border:1px solid rgba(26,24,20,0.14);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--ink);background:var(--card-bg, #fff);outline:none;transition:border 0.2s,box-shadow 0.2s;}
.la-inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(184,146,42,0.1);}
.la-inp.err{border-color:#C0392B;}
.la-inp-sfx{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--ink3);padding:2px;transition:color 0.2s;display:flex;align-items:center;}
.la-inp-sfx:hover{color:var(--ink);}
.la-err{display:flex;align-items:center;gap:4px;font-size:11px;color:#C0392B;margin-top:4px;}
.la-forgot{font-size:12px;color:var(--gold);text-decoration:none;}
.la-forgot:hover{text-decoration:underline;}
.la-divider{border:none;border-top:1px solid var(--bdr);margin:20px 0;}
.la-link-footer{text-align:center;font-size:13px;color:var(--ink3);}
.la-link-footer a{color:var(--gold);text-decoration:none;font-weight:500;}
.la-link-footer a:hover{text-decoration:underline;}
.la-nav-l,.la-nav-r{display:flex;align-items:center;}
.la-nav-c{position:absolute;left:50%;transform:translateX(-50%);}
.la-back-btn{background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink2);display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:6px;transition:all 0.2s;letter-spacing:0.1px;}
.la-back-btn:hover{color:var(--gold);background:var(--gold-light);}
@keyframes la-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.la-anim-1{animation:la-in 0.5s cubic-bezier(0.22,1,0.36,1) both;}
.la-anim-2{animation:la-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both;}
@media(max-width:900px){.la-nav{padding:0 20px;}.la-wrap{padding:40px 20px;}.la-grid-2{grid-template-columns:1fr;gap:36px;}.la-card{padding:28px 24px;}.la-nav-c{display:none;}}
`;

const LOCKOUT_THRESHOLD = 3;
const LOCKOUT_DURATION_S = 30;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const lockoutTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLockout = useCallback(() => {
    setLockoutCountdown(LOCKOUT_DURATION_S);
    lockoutTimer.current = setInterval(() => {
      setLockoutCountdown((prev) => {
        if (prev <= 1) {
          if (lockoutTimer.current) clearInterval(lockoutTimer.current);
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (lockoutTimer.current) clearInterval(lockoutTimer.current);
    };
  }, []);

  const from = location.state?.from?.pathname || '/home';

  const [isRedirecting, setIsRedirecting] = useState(false);

  // Se o usuário já está autenticado (ex.: refreshSession bootou uma sessão
  // existente), sai da tela de login imediatamente — evita ficar "preso" aqui
  // após um refresh manual com token vivo.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, from]);

  useEffect(() => {
    if (email && !validateEmail(email)) {
      const timer = setTimeout(() => {
        setErrors(prev => ({ ...prev, email: 'Por favor, insira um email válido' }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (email && validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutCountdown > 0) return;

    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Por favor, insira um email válido';
    }
    if (!password) newErrors.password = 'Senha é obrigatória';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.', variant: 'success', duration: 2000 });
      // Navegação imediata — o signIn já hidratou user/permissions antes de
      // setar isAuthenticated. Sem setTimeout para evitar race com PublicRoute.
      setIsRedirecting(true);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setPassword('');
      // Distingue erro de rede/servidor de credenciais inválidas — antes
      // qualquer falha caía em "Credenciais inválidas" e mascarava problemas
      // como porta errada, CORS ou API offline.
      const e = err as { response?: { status?: number; data?: { title?: string; detail?: string } }; code?: string; message?: string };
      const status = e?.response?.status;
      const isNetworkError = !e?.response && (e?.code === 'ERR_NETWORK' || e?.message?.includes('Network'));

      if (isNetworkError) {
        toast({
          title: 'Sem conexão com o servidor',
          description: 'Não foi possível alcançar a API de segurança. Verifique se o serviço está rodando.',
          variant: 'destructive',
          duration: 6000,
        });
      } else if (status && status >= 500) {
        toast({
          title: 'Erro no servidor',
          description: e?.response?.data?.title || 'Tente novamente em instantes.',
          variant: 'destructive',
          duration: 5000,
        });
      } else {
        const next = failedAttempts + 1;
        setFailedAttempts(next);
        if (next >= LOCKOUT_THRESHOLD) {
          startLockout();
        }
        toast({ title: 'Erro no login', description: 'Credenciais inválidas. Verifique seus dados.', variant: 'destructive', duration: 5000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    const destination = from === '/home' ? 'página inicial' : from === '/index' ? 'página inicial' : 'dashboard';
    return <Redirecting message="Preparando seu ambiente de trabalho..." destination={destination} countdown={1} />;
  }

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
            <button type="button" className="la-btn la-btn-ghost" onClick={() => navigate('/cadastro')}>
              Criar conta
            </button>
          </div>
        </nav>

        <main className="la-main">
          <div className="la-centered">
            <div className="la-wrap">
              <div className="la-grid-2">
                <div className="la-anim-1">
                  <div className="la-tag">Acesso seguro</div>
                  <h1 className="la-h1">Entre na sua <em>operação</em></h1>
                  <p className="la-sub">
                    Gerencie obras, cronogramas, orçamentos e diário de obra — tudo integrado em uma plataforma.
                  </p>
                  <div className="la-trust">
                    <div className="la-trust-item">
                      <span className="la-trust-check">✓</span>
                      Sessão protegida e validação em tempo real
                    </div>
                    <div className="la-trust-item">
                      <span className="la-trust-check">✓</span>
                      Interface direta para acesso rápido
                    </div>
                    <div className="la-trust-item">
                      <span className="la-trust-check">✓</span>
                      Dados criptografados end-to-end
                    </div>
                  </div>
                </div>

                <div className="la-anim-2">
                  <div className="la-card">
                    <div className="la-card-title">Entrar</div>
                    <div className="la-card-sub">Acesse sua conta Liderum</div>

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
                            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email && (
                          <p className="la-err"><AlertCircle size={11} />{errors.email}</p>
                        )}
                      </div>

                      <div className="la-field">
                        <div className="la-lbl-row">
                          <label className="la-lbl" htmlFor="password" style={{ margin: 0 }}>Senha</label>
                          <Link to="/forgot-password" className="la-forgot">Esqueceu a senha?</Link>
                        </div>
                        <div className="la-inp-wrap">
                          <Lock size={15} className="la-inp-ico" />
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={`la-inp${errors.password ? ' err' : ''}`}
                            style={{ paddingRight: '36px' }}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="la-inp-sfx"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="la-err"><AlertCircle size={11} />{errors.password}</p>
                        )}
                      </div>

                      {lockoutCountdown > 0 && (
                        <p className="la-err" style={{ justifyContent: 'center', marginBottom: '10px' }}>
                          <AlertCircle size={13} />
                          Muitas tentativas. Tente novamente em {lockoutCountdown}s
                        </p>
                      )}

                      <button type="submit" className="la-btn la-btn-dark la-btn-full" disabled={isLoading || lockoutCountdown > 0}>
                        {isLoading ? (
                          <><Loader2 size={15} className="animate-spin" />Entrando...</>
                        ) : lockoutCountdown > 0 ? (
                          <>Aguarde {lockoutCountdown}s</>
                        ) : (
                          <>Entrar <ArrowRight size={15} /></>
                        )}
                      </button>
                    </form>

                    <hr className="la-divider" />
                    <p className="la-link-footer">
                      Não possui conta?{' '}
                      <Link to="/cadastro">Criar nova conta</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Login;
