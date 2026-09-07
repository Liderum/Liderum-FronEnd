import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Phone, Building, Lock, Shield, AlertCircle, Loader2, Eye, EyeOff, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForceLightTheme } from '@/contexts/ThemeContext';
import { validateEmail } from '@/lib/emailValidation';
import { UserService } from '@/services/authService';

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
.la-main{padding-top:64px;}
.la-wrap{max-width:1100px;margin:0 auto;width:100%;padding:48px 48px 64px;}
.la-grid-2{display:grid;grid-template-columns:0.9fr 1.1fr;gap:72px;align-items:start;}
.la-tag{font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin-bottom:16px;}
.la-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(34px,3.8vw,50px);font-weight:700;line-height:1.12;letter-spacing:-1px;margin-bottom:16px;}
.la-h1 em{font-style:italic;color:var(--gold);}
.la-sub{font-size:15px;color:var(--ink3);line-height:1.75;font-weight:300;margin-bottom:28px;max-width:380px;}
.la-trust{display:flex;flex-direction:column;gap:12px;}
.la-trust-item{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--ink2);line-height:1.5;}
.la-trust-check{width:20px;height:20px;border-radius:50%;background:var(--gold-light);border:1px solid rgba(184,146,42,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--gold);flex-shrink:0;margin-top:1px;}
.la-card{background:var(--card-bg, #fff);border-radius:16px;padding:36px 40px;border:1px solid var(--bdr);box-shadow:0 4px 40px rgba(26,24,20,0.07);position:relative;overflow:hidden;}
.la-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.la-card-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink);margin-bottom:4px;}
.la-card-sub{font-size:13px;color:var(--ink3);margin-bottom:24px;}
.la-field{margin-bottom:14px;}
.la-field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.la-lbl{display:block;font-size:12px;font-weight:500;color:var(--ink2);margin-bottom:5px;letter-spacing:0.2px;}
.la-inp-wrap{position:relative;}
.la-inp-ico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none;}
.la-inp{width:100%;height:44px;padding:0 12px 0 36px;border:1px solid rgba(26,24,20,0.14);border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;color:var(--ink);background:var(--card-bg, #fff);outline:none;transition:border 0.2s,box-shadow 0.2s;}
.la-inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(184,146,42,0.1);}
.la-inp.err{border-color:#C0392B;}
.la-inp-sfx{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--ink3);padding:2px;transition:color 0.2s;display:flex;align-items:center;}
.la-inp-sfx:hover{color:var(--ink);}
.la-err{display:flex;align-items:center;gap:4px;font-size:11px;color:#C0392B;margin-top:4px;}
.la-notice{display:flex;align-items:flex-start;gap:10px;background:var(--cream);border:1px solid var(--bdr);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--ink3);line-height:1.6;margin-bottom:16px;}
.la-notice a{color:var(--gold);text-decoration:none;}
.la-notice a:hover{text-decoration:underline;}
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
@media(max-width:900px){.la-nav{padding:0 20px;}.la-wrap{padding:36px 20px 60px;}.la-grid-2{grid-template-columns:1fr;gap:32px;}.la-field-row{grid-template-columns:1fr;}.la-card{padding:28px 24px;}.la-nav-c{display:none;}}
`;

const Cadastro = () => {
  useForceLightTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cnpj: '',
    senha: '',
    confirmaSenha: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const getCleanPhone = (phone: string) => phone.replace(/\D/g, '');
  const getCleanCNPJ = (cnpj: string) => cnpj.replace(/\D/g, '');

  const processValidationErrors = (errs: string[]) => {
    const fieldErrors: Record<string, string> = {};
    errs.forEach(error => {
      const lowerError = error.toLowerCase();
      if (lowerError.includes('cnpj')) { fieldErrors.cnpj = error; }
      else if (lowerError.includes('e-mail') || lowerError.includes('email') || lowerError.includes('registrado')) { fieldErrors.email = error; }
      else if (lowerError.includes('telefone') || lowerError.includes('phone') || lowerError.includes('formato válido')) { fieldErrors.telefone = error; }
      else if (lowerError.includes('nome') || lowerError.includes('name')) { fieldErrors.nome = error; }
      else if (lowerError.includes('senha') || lowerError.includes('password')) { fieldErrors.senha = error; }
    });
    return fieldErrors;
  };

  useEffect(() => {
    if (formData.email && !validateEmail(formData.email)) {
      const timer = setTimeout(() => {
        setErrors(prev => ({ ...prev, email: 'Por favor, insira um email válido' }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (formData.email && validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }, [formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'telefone') formattedValue = formatPhone(value);
    else if (name === 'cnpj') formattedValue = formatCNPJ(value);
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.email) { newErrors.email = 'Email é obrigatório'; }
    else if (!validateEmail(formData.email)) { newErrors.email = 'Por favor, insira um email válido'; }
    if (!formData.telefone) { newErrors.telefone = 'Telefone é obrigatório'; }
    else if (getCleanPhone(formData.telefone).length !== 11) { newErrors.telefone = 'Telefone deve ter 11 dígitos'; }
    if (!formData.cnpj) { newErrors.cnpj = 'CNPJ é obrigatório'; }
    else if (getCleanCNPJ(formData.cnpj).length !== 14) { newErrors.cnpj = 'CNPJ deve ter 14 dígitos'; }
    if (!formData.senha) { newErrors.senha = 'Senha é obrigatória'; }
    else if (formData.senha.length < 8) { newErrors.senha = 'Senha deve ter pelo menos 8 caracteres'; }
    if (!formData.confirmaSenha) { newErrors.confirmaSenha = 'Confirmação de senha é obrigatória'; }
    else if (formData.senha !== formData.confirmaSenha) { newErrors.confirmaSenha = 'As senhas não coincidem'; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        await UserService.register({
          name: formData.nome,
          email: formData.email,
          password: formData.senha,
          phone: getCleanPhone(formData.telefone),
          cnpj: getCleanCNPJ(formData.cnpj),
        });
        toast({
          title: '🎉 Cadastro realizado com sucesso!',
          description: `Bem-vindo, ${formData.nome}! Você será redirecionado para a página de login em alguns segundos.`,
          className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800 shadow-lg animate-in slide-in-from-top-2 duration-500',
          duration: 5000,
        });
        setErrors({});
        setTimeout(() => { navigate('/login'); }, 3000);
      } catch (error: unknown) {
        let errorMessage = 'Ocorreu um erro ao tentar criar sua conta';
        if (error && typeof error === 'object') {
          const errorObj = error as Record<string, unknown>;
          if (errorObj.response && typeof errorObj.response === 'object') {
            const response = errorObj.response as Record<string, unknown>;
            if (response.data && typeof response.data === 'object') {
              const data = response.data as Record<string, unknown>;
              if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                const fieldErrors = processValidationErrors(data.errors as string[]);
                setErrors(fieldErrors);
                errorMessage = data.errors.length === 1 ? String(data.errors[0]) : `Múltiplos erros encontrados:\n• ${(data.errors as string[]).join('\n• ')}`;
              } else if (data.message && typeof data.message === 'string') {
                errorMessage = data.message;
              }
            }
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        const hasFieldErrors = Object.keys(errors).length > 0;
        toast({
          title: '❌ Erro ao realizar cadastro',
          description: hasFieldErrors ? 'Verifique os campos destacados abaixo' : errorMessage,
          className: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800 shadow-lg animate-in slide-in-from-top-2 duration-500',
          duration: 6000
        });
      } finally {
        setIsLoading(false);
      }
    }
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
            <button type="button" className="la-btn la-btn-ghost" onClick={() => navigate('/login')}>
              Entrar
            </button>
          </div>
        </nav>

        <main className="la-main">
          <div className="la-wrap">
            <div className="la-grid-2">
              <div className="la-anim-1" style={{ paddingTop: '16px' }}>
                <div className="la-tag">Teste grátis por 14 dias</div>
                <h1 className="la-h1">Comece a operar com <em>controle real</em></h1>
                <p className="la-sub">
                  Cadastro direto, sem excesso. Tudo pronto para centralizar vendas, financeiro, estoque e segurança desde o primeiro acesso.
                </p>
                <div className="la-trust">
                  <div className="la-trust-item">
                    <span className="la-trust-check">✓</span>
                    Todos os módulos disponíveis no período de teste
                  </div>
                  <div className="la-trust-item">
                    <span className="la-trust-check">✓</span>
                    Validação automática dos campos em tempo real
                  </div>
                  <div className="la-trust-item">
                    <span className="la-trust-check">✓</span>
                    Ambiente seguro — dados criptografados em repouso
                  </div>
                  <div className="la-trust-item">
                    <span className="la-trust-check">✓</span>
                    Sem cartão de crédito obrigatório
                  </div>
                </div>
              </div>

              <div className="la-anim-2">
                <div className="la-card">
                  <div className="la-card-title">Criar conta</div>
                  <div className="la-card-sub">Preencha os dados para ativar seu acesso</div>

                  <form onSubmit={handleSubmit}>
                    <div className="la-field">
                      <label className="la-lbl" htmlFor="nome">Nome completo</label>
                      <div className="la-inp-wrap">
                        <User size={15} className="la-inp-ico" />
                        <input
                          id="nome"
                          name="nome"
                          placeholder="Seu nome completo"
                          className={`la-inp${errors.nome ? ' err' : ''}`}
                          value={formData.nome}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.nome && <p className="la-err"><AlertCircle size={11} />{errors.nome}</p>}
                    </div>

                    <div className="la-field-row la-field">
                      <div>
                        <label className="la-lbl" htmlFor="email">Email</label>
                        <div className="la-inp-wrap">
                          <Mail size={15} className="la-inp-ico" />
                          <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="seu@email.com"
                            className={`la-inp${errors.email ? ' err' : ''}`}
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email && <p className="la-err"><AlertCircle size={11} />{errors.email}</p>}
                      </div>
                      <div>
                        <label className="la-lbl" htmlFor="telefone">Telefone</label>
                        <div className="la-inp-wrap">
                          <Phone size={15} className="la-inp-ico" />
                          <input
                            id="telefone"
                            name="telefone"
                            placeholder="(00) 00000-0000"
                            className={`la-inp${errors.telefone ? ' err' : ''}`}
                            value={formData.telefone}
                            onChange={handleChange}
                            disabled={isLoading}
                            maxLength={15}
                          />
                        </div>
                        {errors.telefone && <p className="la-err"><AlertCircle size={11} />{errors.telefone}</p>}
                      </div>
                    </div>

                    <div className="la-field">
                      <label className="la-lbl" htmlFor="cnpj">CNPJ</label>
                      <div className="la-inp-wrap">
                        <Building size={15} className="la-inp-ico" />
                        <input
                          id="cnpj"
                          name="cnpj"
                          placeholder="00.000.000/0000-00"
                          className={`la-inp${errors.cnpj ? ' err' : ''}`}
                          value={formData.cnpj}
                          onChange={handleChange}
                          disabled={isLoading}
                          maxLength={18}
                        />
                      </div>
                      {errors.cnpj && <p className="la-err"><AlertCircle size={11} />{errors.cnpj}</p>}
                    </div>

                    <div className="la-field-row la-field">
                      <div>
                        <label className="la-lbl" htmlFor="senha">Criar senha</label>
                        <div className="la-inp-wrap">
                          <Lock size={15} className="la-inp-ico" />
                          <input
                            id="senha"
                            name="senha"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={`la-inp${errors.senha ? ' err' : ''}`}
                            style={{ paddingRight: '36px' }}
                            value={formData.senha}
                            onChange={handleChange}
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
                        {errors.senha && <p className="la-err"><AlertCircle size={11} />{errors.senha}</p>}
                      </div>
                      <div>
                        <label className="la-lbl" htmlFor="confirmaSenha">Confirmar senha</label>
                        <div className="la-inp-wrap">
                          <Lock size={15} className="la-inp-ico" />
                          <input
                            id="confirmaSenha"
                            name="confirmaSenha"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={`la-inp${errors.confirmaSenha ? ' err' : ''}`}
                            style={{ paddingRight: '36px' }}
                            value={formData.confirmaSenha}
                            onChange={handleChange}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            className="la-inp-sfx"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                            aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                          >
                            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {errors.confirmaSenha && <p className="la-err"><AlertCircle size={11} />{errors.confirmaSenha}</p>}
                      </div>
                    </div>

                    <div className="la-notice">
                      <Shield size={14} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }} />
                      <p>
                        Ao criar uma conta, você concorda com os{' '}
                        <a href="#">Termos de Serviço</a>{' '}
                        e a{' '}
                        <a href="#">Política de Privacidade</a>.
                      </p>
                    </div>

                    <button type="submit" className="la-btn la-btn-dark la-btn-full" disabled={isLoading}>
                      {isLoading ? (
                        <><Loader2 size={15} className="animate-spin" />Criando conta...</>
                      ) : (
                        <>Criar conta <Check size={15} /></>
                      )}
                    </button>
                  </form>

                  <hr className="la-divider" />
                  <p className="la-link-footer">
                    Já tem uma conta?{' '}
                    <Link to="/login">Entrar</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Cadastro;
