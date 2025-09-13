import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, ArrowRight, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { motion } from "framer-motion";
import { AxiosError } from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string, password?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples
    const newErrors: {email?: string, password?: string} = {};
    
    if (!email) newErrors.email = "Email é obrigatório";
    if (!password) newErrors.password = "Senha é obrigatória";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await signIn(email, password);
      
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso. Redirecionando...",
        duration: 2000,
        className: "bg-green-50 border-green-200",
      });
      
      // Adiciona um pequeno delay antes do redirecionamento para mostrar a animação
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      // Trata o erro da API
      let errorMessage = "Não foi possível fazer login. Verifique suas credenciais.";
      
      if (error instanceof AxiosError && error.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0];
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
        
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
        className: "bg-red-50 border-red-200",
      });
      
      // Limpa os campos em caso de erro
      setPassword('');
      
      // Se o erro for relacionado ao email, limpa também o campo de email
      if (errorMessage.toLowerCase().includes('email')) {
        setEmail('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          <h1 className="text-3xl font-bold text-primary">Liderum</h1>
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
                        if (errors.email) setErrors({...errors, email: undefined});
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
                    <Link to="/recuperar-senha" className="text-xs text-primary hover:underline">
                      Esqueci minha senha
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <Input 
                      id="password"
                      type="password" 
                      placeholder="••••••••" 
                      className={`pl-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({...errors, password: undefined});
                      }}
                      disabled={isLoading}
                    />
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
  );
};

export default Login;
