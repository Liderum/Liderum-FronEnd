import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/authService';
import { Redirecting } from '@/components/Redirecting';
import { SimpleToast } from '@/components/SimpleToast';
import { useRedirect } from '@/hooks/useRedirect';
import { useAuth } from '@/contexts/AuthContext';

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
.la-btn-text{background:transparent;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink3);display:inline-flex;align-items:center;gap:6px;padding:6px 0;transition:color 0.2s;}
.la-btn-text:hover:not(:disabled){color:var(--gold);}
.la-btn-text:disabled{opacity:0.5;cursor:not-allowed;}
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
.la-otp{display:flex;gap:10px;justify-content:center;margin:4px 0 20px;}
.la-otp-digit{width:52px;height:60px;border:1px solid rgba(26,24,20,0.14);border-radius:10px;text-align:center;font-family:var(--font-numeric);font-size:26px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--ink);background:#fff;outline:none;transition:border 0.2s,box-shadow 0.2s;}
.la-otp-digit:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(184,146,42,0.1);}
.la-otp-digit.err{border-color:#C0392B;}
.la-otp-digit.validating{border-color:var(--gold);background:var(--gold-light);}
.la-err-center{text-align:center;font-size:12px;color:#C0392B;margin-bottom:12px;}
.la-validating-msg{display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:var(--gold);margin-bottom:12px;}
.la-resend{text-align:center;margin-bottom:20px;}
.la-divider{border:none;border-top:1px solid var(--bdr);margin:16px 0;}
.la-nav-l,.la-nav-r{display:flex;align-items:center;}
.la-nav-c{position:absolute;left:50%;transform:translateX(-50%);}
.la-back-btn{background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink2);display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:6px;transition:all 0.2s;letter-spacing:0.1px;}
.la-back-btn:hover{color:var(--gold);background:var(--gold-light);}
@keyframes la-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.la-anim-1{animation:la-in 0.5s cubic-bezier(0.22,1,0.36,1) both;}
.la-anim-2{animation:la-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both;}
@media(max-width:900px){.la-nav{padding:0 20px;}.la-wrap{padding:40px 20px;}.la-grid-2{grid-template-columns:1fr;gap:36px;}.la-card{padding:28px 24px;}.la-otp-digit{width:44px;height:52px;font-size:24px;}.la-nav-c{display:none;}}
`;

const ValidateCode = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<{ code?: string }>({});
  const { toast } = useToast();
  const { showError, errorToast, hideError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = location.state?.email;

  const { isRedirecting, countdown, startRedirect, cancelRedirect, redirectNow } = useRedirect({
    delay: 3000,
    destination: '/reset-password',
    onRedirect: () => {
      navigate('/reset-password', { state: { email, code: code.join('') } });
    }
  });

  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email, navigate]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (errors.code) setErrors({});
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setCode(pastedData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) { setErrors({ code: 'Código deve ter 6 dígitos' }); return; }

    setIsLoading(true);
    setIsValidating(true);
    setErrors({});
    try {
      await AuthService.validateCode({ email, code: codeString });
      startRedirect('/reset-password');
    } catch (error: unknown) {
      showError(error as Error);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await AuthService.forgotPassword({ email });
      toast({ title: 'Código reenviado!', description: 'Verifique seu email para o novo código.', variant: 'default', duration: 5000, className: 'bg-green-50 border-green-200' });
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null;

  if (isRedirecting) {
    return (
      <>
        <Redirecting message="Preparando redefinição de senha..." destination="redefinição de senha" countdown={countdown} title="Código validado com sucesso!" />
        <SimpleToast isVisible={true} message="Código validado com sucesso!" countdown={countdown} onCancel={cancelRedirect} onGoNow={() => redirectNow()} />
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="la-root">
        <nav className="la-nav">
          <div className="la-nav-l">
            <button type="button" className="la-back-btn" onClick={() => navigate('/forgot-password', { state: { email } })}>
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
                  <div className="la-tag">Verificação</div>
                  <h1 className="la-h1">Valide o código para <em>continuar</em></h1>
                  <p className="la-sub">
                    Digite o código de 6 dígitos enviado para <strong>{email}</strong>.
                  </p>
                </div>

                <div className="la-anim-2">
                  <div className="la-card">
                    <div className="la-card-ico">
                      <Shield size={24} />
                    </div>
                    <div className="la-card-title">Inserir código</div>
                    <div className="la-card-sub">Insira os 6 dígitos exatamente como recebeu</div>

                    <div className="la-otp">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          aria-label={`Dígito ${index + 1} do código`}
                          className={`la-otp-digit${errors.code ? ' err' : ''}${isValidating ? ' validating' : ''}`}
                          disabled={isLoading}
                        />
                      ))}
                    </div>

                    {errors.code && <p className="la-err-center">{errors.code}</p>}

                    {isValidating && (
                      <div className="la-validating-msg">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Validando código...</span>
                      </div>
                    )}

                    <div className="la-resend">
                      <button type="button" className="la-btn-text" onClick={handleResendCode} disabled={isLoading}>
                        <RotateCcw size={13} /> Reenviar código
                      </button>
                    </div>

                    <button
                      type="button"
                      className="la-btn la-btn-dark la-btn-full"
                      onClick={handleSubmit}
                      disabled={isLoading || code.join('').length !== 6}
                    >
                      {isLoading ? (
                        <><Loader2 size={15} className="animate-spin" />Validando...</>
                      ) : (
                        'Validar código'
                      )}
                    </button>

                    <hr className="la-divider" />
                    <button type="button" className="la-btn la-btn-outline la-btn-full" onClick={() => navigate('/forgot-password', { state: { email } })}>
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

export default ValidateCode;
