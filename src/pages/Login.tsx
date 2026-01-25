import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, ArrowRight, AlertCircle, ArrowLeft, Loader2, Eye, EyeOff, BarChart, Menu, X, Shield, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from "framer-motion";
import { validateEmail } from '@/lib/emailValidation';
import { Redirecting } from '@/components/Redirecting';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string, password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, errorToast, hideError, isAuthenticated } = useAuth();

  useEffect(() => {
    if (errorToast.isVisible && errorToast.message) {
      toast({
        title: "Erro no login",
        description: errorToast.message,
        variant: "destructive",
        duration: 5000,
      });
      setTimeout(() => {
        hideError();
      }, 0);
    }
  }, [errorToast.isVisible, errorToast.message, toast, hideError]);

  // Verifica se o usuário já está autenticado e redireciona automaticamente
  useEffect(() => {
    const token = localStorage.getItem('@Liderum:token');
    const storedUser = localStorage.getItem('@Liderum:user');
    
    if (token && storedUser && isAuthenticated) {
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const from = location.state?.from?.pathname || '/home';

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (email && !validateEmail(email)) {
      const timer = setTimeout(() => {
        setErrors(prev => ({ ...prev, email: "Por favor, insira um email válido" }));
      }, 1000);

      return () => clearTimeout(timer);
    } else if (email && validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação completa
    const newErrors: { email?: string, password?: string } = {};

    if (!email) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(email)) {
      newErrors.email = "Por favor, insira um email válido";
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, password);

      const token = localStorage.getItem('@Liderum:token');
      const storedUser = localStorage.getItem('@Liderum:user');

      if (!token || !storedUser) {
        throw new Error('Erro ao salvar dados de autenticação');
      }

      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
        variant: "success",
        duration: 2000,
      });

      const finalDestination = from || '/home';

      console.log('Login bem-sucedido! Token:', !!token, 'User:', !!storedUser, 'Destino:', finalDestination);

      // Aguarda um pouco para garantir que o contexto atualizou
      // e então redireciona
      setIsRedirecting(true);

      // Usa requestAnimationFrame + setTimeout para garantir que o React atualizou
      requestAnimationFrame(() => {
        setTimeout(() => {
          console.log('Redirecionando para:', finalDestination);
          // Força o redirecionamento usando window.location se navigate falhar
          try {
            navigate(finalDestination, { replace: true });
            
            // Fallback: se após 1 segundo ainda estiver em /login, força redirecionamento
            setTimeout(() => {
              if (window.location.pathname === '/login') {
                console.log('Fallback: Forçando redirecionamento via window.location');
                window.location.href = finalDestination;
              }
            }, 1000);
          } catch (error) {
            console.error('Erro ao navegar:', error);
            window.location.href = finalDestination;
          }
        }, 300);
      });
    } catch (error) {

      setPassword('');

      if (error instanceof Error && error.message.toLowerCase().includes('email')) {
        setEmail('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) {
    const destination = from === '/home' ? 'página inicial' : from === '/index' ? 'página inicial' : 'dashboard';
    return (
      <Redirecting
        message="Preparando seu ambiente de trabalho..."
        destination={destination}
        countdown={1}
      />
    );
  }

  return (
    <>

      <div className="min-h-screen bg-white">
        { }
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200"
        >
          <div className="container mx-auto px-6 h-16">
            <div className="flex items-center justify-between h-full">
              <motion.div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <BarChart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Liderum
                </span>
              </motion.div>

              <nav className="hidden lg:flex items-center gap-1">
              </nav>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate('/cadastro')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm px-5 shadow-lg"
                >
                  Criar Conta
                </Button>
                <Button
                  variant="ghost"
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden bg-white border-t border-gray-200"
              >
                <nav className="container mx-auto px-6 py-4 space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/cadastro')}
                    className="w-full justify-start"
                  >
                    Criar Conta
                  </Button>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        <main className="pt-16 min-h-screen flex items-center">
          <section className="relative w-full py-20 bg-white overflow-hidden">

            <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-md mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-8"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block mb-4"
                  >
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      <Shield className="h-3 w-3 mr-2" />
                      Acesso Seguro
                    </Badge>
                  </motion.div>

                  <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    <span className="block text-gray-900 mb-2">Bem-vindo de Volta</span>
                    <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Acesse sua Conta
                    </span>
                  </h1>

                  <p className="text-lg text-gray-600 leading-relaxed">
                    Entre com suas credenciais para acessar o ERP Liderum
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Card className="border-2 border-gray-200 shadow-xl bg-white">
                    <div className="p-8">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email
                          </Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                              <Mail size={18} />
                            </div>
                            <Input
                              id="email"
                              type="email"
                              placeholder="seu@email.com"
                              className={`h-12 pl-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) {
                                  setErrors({ ...errors, email: undefined });
                                }
                              }}
                              disabled={isLoading}
                            />
                          </div>
                          {errors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-red-500 flex items-center gap-1.5 mt-1"
                            >
                              <AlertCircle size={14} />
                              {errors.email}
                            </motion.p>
                          )}
                        </div>

                        {/* Senha */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                              Senha
                            </Label>
                            <Link
                              to="/forgot-password"
                              className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
                            >
                              Esqueceu a senha?
                            </Link>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                              <Lock size={18} />
                            </div>
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className={`h-12 pl-11 pr-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                              }}
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {errors.password && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-red-500 flex items-center gap-1.5 mt-1"
                            >
                              <AlertCircle size={14} />
                              {errors.password}
                            </motion.p>
                          )}
                        </div>

                        {/* Botão Submit */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all group"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Entrando...
                              </>
                            ) : (
                              <>
                                Entrar
                                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </form>

                      {/* Divisor */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-4 text-sm text-gray-500">ou</span>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="space-y-3 text-center">
                        <p className="text-sm text-gray-600">
                          Não possui uma conta?{" "}
                          <Link
                            to="/cadastro"
                            className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
                          >
                            Criar nova conta
                          </Link>
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Footer */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-xs text-gray-500 mt-8"
                >
                  © {new Date().getFullYear()} Liderum. Todos os direitos reservados.
                </motion.p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Login;
