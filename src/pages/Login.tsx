import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, ArrowRight, AlertCircle, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { motion } from "framer-motion";
import { AxiosError } from 'axios';
import { validateEmail } from '@/lib/emailValidation';
import { Redirecting } from '@/components/Redirecting';
import { SimpleToast } from '@/components/SimpleToast';
import { useRedirect } from '@/hooks/useRedirect';
import { useSessionCleanup } from '@/hooks/useSessionCleanup';
import { useSimpleToast } from '@/hooks/useSimpleToast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string, password?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, errorToast, hideError } = useAuth();

  // Pega a página de origem para redirecionar após login
  const from = location.state?.from?.pathname || '/welcome';
  
  // Limpa sessão apenas se não veio de uma página protegida
  useEffect(() => {
    if (!location.state?.from) {
      // Se acessou diretamente a página de login, limpa sessão
      localStorage.removeItem('@Liderum:token');
      localStorage.removeItem('@Liderum:refreshToken');
      localStorage.removeItem('@Liderum:user');
      console.log('Sessão limpa - acesso direto à página de login');
    }
  }, [location.state]);
  
  // Hook para gerenciar redirecionamento
  const { 
    isRedirecting, 
    countdown, 
    startRedirect, 
    cancelRedirect, 
    redirectNow 
  } = useRedirect({
    delay: 3000,
    destination: from
  });


  useEffect(() => {
    if (email && !validateEmail(email)) {
      const timer = setTimeout(() => {
        setErrors(prev => ({...prev, email: "Por favor, insira um email válido"}));
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (email && validateEmail(email)) {
      setErrors(prev => ({...prev, email: undefined}));
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação completa
    const newErrors: {email?: string, password?: string} = {};
    
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
      
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
        duration: 2000,
        className: "bg-green-50 border-green-200",
      });
      
      // Inicia o redirecionamento
      startRedirect();
    } catch (error) {
      // O erro já é tratado no AuthContext e mostrado via toast
      // Aqui apenas limpamos os campos se necessário
      setPassword('');
      
      // Se o erro menciona email, limpa o campo de email também
      if (error instanceof Error && error.message.toLowerCase().includes('email')) {
        setEmail('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Hook para toast simples
  const { toast: simpleToast, showToast, hideToast, updateCountdown } = useSimpleToast();

  // Se está redirecionando, mostra apenas o componente de redirecionamento
  if (isRedirecting) {
    const destination = from === '/welcome' ? 'painel de boas-vindas' : 'dashboard';
    return (
      <>
        <Redirecting 
          message="Preparando seu ambiente de trabalho..."
          destination={destination}
          countdown={countdown}
        />
        <SimpleToast
          isVisible={true}
          message="Login realizado com sucesso!"
          countdown={countdown}
          onCancel={cancelRedirect}
          onGoNow={() => redirectNow()}
        />
        
        {/* Toast de erro do AuthContext */}
        <SimpleToast
          isVisible={errorToast.isVisible}
          message={errorToast.message}
          type={errorToast.type}
          onCancel={hideError}
          showActions={false}
        />
      </>
    );
  }

  return (
    <>
      {/* Toast de erro do AuthContext */}
      <SimpleToast
        isVisible={errorToast.isVisible}
        message={errorToast.message}
        type={errorToast.type}
        onCancel={hideError}
        showActions={false}
      />
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4"
    >
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-8"
        >
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10 border-2 shadow-sm hover:shadow-md transition-all" 
            asChild
          >
            <Link to="/">
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Link>
          </Button>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-primary">Liderum</h1>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-semibold text-center">Entrar</CardTitle>
              <CardDescription className="text-center">
                Acesse sua conta para gerenciar seu negócio
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="seu@email.com" 
                      className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Remove erro quando usuário começa a digitar
                        if (errors.email) {
                          setErrors({...errors, email: undefined});
                        }
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-1 mt-1"
                    >
                      <AlertCircle size={14} /> {errors.email}
                    </motion.p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Senha</Label>
                    {/* <Link to="/recuperar-senha" className="text-xs text-primary hover:underline">
                      Esqueci minha senha
                    </Link> */}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({...errors, password: undefined});
                      }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
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
                      className="text-sm text-red-500 flex items-center gap-1 mt-1"
                    >
                      <AlertCircle size={14} /> {errors.password}
                    </motion.p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gap-2 mt-6 group relative"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-0">
              <div className="relative w-full py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-4 text-sm text-gray-500">ou</span>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-600">
                Não possui uma conta?{" "}
                <Link to="/cadastro" className="text-primary font-medium hover:underline">
                  Criar nova conta
                </Link>
              </p>
              
              <p className="text-center text-sm text-gray-600">
                Esqueceu sua senha?{" "}
                <Link to="/forgot-password" className="text-primary font-medium hover:underline">
                  Recuperar senha
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-500 mt-8"
        >
          © {new Date().getFullYear()} Liderum. Todos os direitos reservados.
        </motion.p>
      </div>
    </motion.div>
    </>
  );
};

export default Login;
