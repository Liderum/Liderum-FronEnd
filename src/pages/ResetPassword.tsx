import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResetPasswordRequest, ResetPasswordResponse } from '@/types/auth';
import api from '@/services/api/axios';
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
.la-sub{font-size:15px;color:var(--ink3);line-height:1.75;font-weight:300;max-width:400px;}
.la-card{background:#fff;border-radius:16px;padding:40px;border:1px solid var(--bdr);box-shadow:0 4px 40px rgba(26,24,20,0.07);position:relative;overflow:hidden;}
.la-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.la-card-ico{width:56px;height:56px;border-radius:50%;background:var(--gold-light);border:2px solid rgba(184,146,42,0.25);display:flex;align-items:center;justify-content:center;margin-bottom:20px;color:var(--gold);}
.la-card-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink);margin-bottom:4px;}
.la-card-sub{font-size:13px;color:var(--ink3);margin-bottom:28px;}
.la-field{margin-bottom:16px;}
.la-lbl{display:block;font-size:12px;font-weight:500;color:var(--ink2);margin-bottom:5px;letter-spacing:0.2px;}
.la-inp-wrap{position:relative;}
.la-inp{width:100%;height:44px;padding:0 36px 0 12px;border:1px solid rgba(26,24,20,0.14);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--ink);background:#fff;outline:none;transition:border 0.2s,box-shadow 0.2s;}
.la-inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(184,146,42,0.1);}
.la-inp.err{border-color:#C0392B;}
.la-inp-sfx{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--ink3);padding:2px;transition:color 0.2s;display:flex;align-items:center;}
.la-inp-sfx:hover{color:var(--ink);}
.la-err{display:flex;align-items:center;gap:4px;font-size:11px;color:#C0392B;margin-top:4px;}
.la-pwd-req{background:var(--cream);border:1px solid var(--bdr);border-radius:8px;padding:12px 14px;margin-top:8px;}
.la-pwd-req-hd{font-size:10px;letter-spacing:0.8px;text-transform:uppercase;color:var(--ink3);margin-bottom:8px;display:block;}
.la-pwd-item{font-size:12px;padding:2px 0;display:flex;align-items:center;gap:6px;transition:color 0.2s;}
.la-pwd-item.met{color:var(--gold);}
.la-pwd-item.unmet{color:var(--ink3);}
.la-pwd-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0;}
.la-err-box{background:#FEF2F2;border:1px solid rgba(192,57,43,0.2);border-radius:8px;padding:10px 12px;font-size:13px;color:#C0392B;margin-bottom:16px;}
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

const ResetPassword = () => {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; general?: string }>({});
  const { toast } = useToast();
  const { showError, errorToast, hideError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const code = location.state?.code;

  useEffect(() => {
    if (!email || !code) navigate('/forgot-password');
  }, [email, code, navigate]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return { minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!formData.newPassword) { newErrors.newPassword = 'Nova senha é obrigatória'; }
    else if (!validatePassword(formData.newPassword).isValid) { newErrors.newPassword = 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial'; }
    if (!formData.confirmPassword) { newErrors.confirmPassword = 'Confirmação de senha é obrigatória'; }
    else if (formData.newPassword !== formData.confirmPassword) { newErrors.confirmPassword = 'Senhas não coincidem'; }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    setErrors({});
    try {
      const response = await api.post<ResetPasswordResponse>('/reset-password', { email, code, newPassword: formData.newPassword, confirmPassword: formData.confirmPassword } as ResetPasswordRequest, { timeout: 20000 });
      if (response.data) {
        setIsSuccess(true);
        toast({ title: 'Senha redefinida!', description: 'Sua senha foi alterada com sucesso.', variant: 'default', duration: 5000, className: 'bg-green-50 border-green-200' });
      } else {
        const errorMessage = response.data.errors?.[0] || response.data.message || 'Erro ao redefinir senha';
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      showError(error as Error);
      setErrors({ general: 'Erro ao redefinir senha' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => navigate('/login');

  if (!email || !code) return null;

  if (isSuccess) {
    return (
      <>
        <style>{CSS}</style>
        <div className="la-root">
          <nav className="la-nav">
            <div className="la-nav-l">
              <button type="button" className="la-back-btn" onClick={handleGoToLogin}>
                ← Ir para login
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
                    <div className="la-tag">Recuperação concluída</div>
                    <h1 className="la-h1">Sua senha foi <em>redefinida</em></h1>
                    <p className="la-sub">
                      Agora você pode acessar sua conta com a nova senha e retomar sua operação.
                    </p>
                  </div>
                  <div className="la-anim-2">
                    <div className="la-card">
                      <div className="la-card-ico">
                        <CheckCircle2 size={26} />
                      </div>
                      <div className="la-card-title">Processo concluído</div>
                      <div className="la-card-sub">Sua senha foi atualizada com sucesso</div>
                      <div className="la-steps-box">
                        <div className="la-step-li"><span className="la-step-num">1</span>Faça login com sua nova senha</div>
                        <div className="la-step-li"><span className="la-step-num">2</span>Evite compartilhar credenciais</div>
                        <div className="la-step-li"><span className="la-step-num">3</span>Atualize seu gerenciador de senhas</div>
                      </div>
                      <button type="button" className="la-btn la-btn-dark la-btn-full" onClick={handleGoToLogin}>
                        Ir para login →
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

  const pwdVal = validatePassword(formData.newPassword);

  return (
    <>
      <style>{CSS}</style>
      <div className="la-root">
        <nav className="la-nav">
          <div className="la-nav-l">
            <button type="button" className="la-back-btn" onClick={() => navigate('/validate-code', { state: { email, code } })}>
              ← Voltar
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
                  <div className="la-tag">Nova senha</div>
                  <h1 className="la-h1">Defina uma senha <em>forte</em></h1>
                  <p className="la-sub">
                    Use uma combinação segura de letras, números e caracteres especiais para proteger sua conta.
                  </p>
                </div>

                <div className="la-anim-2">
                  <div className="la-card">
                    <div className="la-card-ico">
                      <Lock size={24} />
                    </div>
                    <div className="la-card-title">Redefinir senha</div>
                    <div className="la-card-sub">Atualize sua senha para concluir a recuperação</div>

                    <form onSubmit={handleSubmit}>
                      <div className="la-field">
                        <label className="la-lbl" htmlFor="newPassword">Nova senha</label>
                        <div className="la-inp-wrap">
                          <input
                            id="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Digite sua nova senha"
                            className={`la-inp${errors.newPassword ? ' err' : ''}`}
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
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
                        {errors.newPassword && <p className="la-err">{errors.newPassword}</p>}

                        {formData.newPassword && (
                          <div className="la-pwd-req">
                            <span className="la-pwd-req-hd">Requisitos da senha</span>
                            <div className={`la-pwd-item${pwdVal.minLength ? ' met' : ' unmet'}`}>
                              <span className="la-pwd-dot" />Pelo menos 8 caracteres
                            </div>
                            <div className={`la-pwd-item${pwdVal.hasUpperCase ? ' met' : ' unmet'}`}>
                              <span className="la-pwd-dot" />Uma letra maiúscula
                            </div>
                            <div className={`la-pwd-item${pwdVal.hasLowerCase ? ' met' : ' unmet'}`}>
                              <span className="la-pwd-dot" />Uma letra minúscula
                            </div>
                            <div className={`la-pwd-item${pwdVal.hasNumbers ? ' met' : ' unmet'}`}>
                              <span className="la-pwd-dot" />Um número
                            </div>
                            <div className={`la-pwd-item${pwdVal.hasSpecialChar ? ' met' : ' unmet'}`}>
                              <span className="la-pwd-dot" />Um caractere especial
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="la-field">
                        <label className="la-lbl" htmlFor="confirmPassword">Confirmar senha</label>
                        <div className="la-inp-wrap">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirme sua nova senha"
                            className={`la-inp${errors.confirmPassword ? ' err' : ''}`}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="la-inp-sfx"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                            aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                          >
                            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="la-err">{errors.confirmPassword}</p>}
                      </div>

                      {errors.general && (
                        <div className="la-err-box">{errors.general}</div>
                      )}

                      <button
                        type="submit"
                        className="la-btn la-btn-dark la-btn-full"
                        disabled={isLoading || !pwdVal.isValid || formData.newPassword !== formData.confirmPassword}
                      >
                        {isLoading ? (
                          <><Loader2 size={15} className="animate-spin" />Redefinindo...</>
                        ) : (
                          'Redefinir senha'
                        )}
                      </button>
                    </form>

                    <hr className="la-divider" />
                    <button type="button" className="la-btn la-btn-outline la-btn-full" onClick={() => navigate('/validate-code', { state: { email, code } })}>
                      <ArrowLeft size={14} /> Voltar
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

export default ResetPassword;
