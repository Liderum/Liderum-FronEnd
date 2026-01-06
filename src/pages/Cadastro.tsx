import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Phone, Building, Lock, Shield, Check, AlertCircle, Loader2, Eye, EyeOff, BarChart, Menu, X, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { validateEmail } from '@/lib/emailValidation';
import { useSessionCleanup } from '@/hooks/useSessionCleanup';
import { usersApi } from '@/services/api/apiFactory';

const Cadastro = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Limpa sessão ao acessar página pública
  useSessionCleanup();
  
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

  // Funções de formatação
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  };

  const getCleanPhone = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const getCleanCNPJ = (cnpj: string) => {
    return cnpj.replace(/\D/g, '');
  };

  // Função para processar erros de validação da API
  const processValidationErrors = (errors: string[]) => {
    const fieldErrors: Record<string, string> = {};
    
    errors.forEach(error => {
      const lowerError = error.toLowerCase();
      
      if (lowerError.includes('cnpj')) {
        fieldErrors.cnpj = error;
      } else if (lowerError.includes('e-mail') || lowerError.includes('email') || lowerError.includes('registrado')) {
        fieldErrors.email = error;
      } else if (lowerError.includes('telefone') || lowerError.includes('phone') || lowerError.includes('formato válido')) {
        fieldErrors.telefone = error;
      } else if (lowerError.includes('nome') || lowerError.includes('name')) {
        fieldErrors.nome = error;
      } else if (lowerError.includes('senha') || lowerError.includes('password')) {
        fieldErrors.senha = error;
      }
    });
    
    return fieldErrors;
  };

  // Validação em tempo real com debounce para email
  useEffect(() => {
    if (formData.email && !validateEmail(formData.email)) {
      const timer = setTimeout(() => {
        setErrors(prev => ({...prev, email: "Por favor, insira um email válido"}));
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (formData.email && validateEmail(formData.email)) {
      setErrors(prev => ({...prev, email: ''}));
    }
  }, [formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'telefone') {
      formattedValue = formatPhone(value);
    } else if (name === 'cnpj') {
      formattedValue = formatCNPJ(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nome) newErrors.nome = "Nome é obrigatório";
    
    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Por favor, insira um email válido";
    }
    
    if (!formData.telefone) {
      newErrors.telefone = "Telefone é obrigatório";
    } else {
      const cleanPhone = getCleanPhone(formData.telefone);
      if (cleanPhone.length !== 11) {
        newErrors.telefone = "Telefone deve ter 11 dígitos";
      }
    }
    
    if (!formData.cnpj) {
      newErrors.cnpj = "CNPJ é obrigatório";
    } else {
      const cleanCNPJ = getCleanCNPJ(formData.cnpj);
      if (cleanCNPJ.length !== 14) {
        newErrors.cnpj = "CNPJ deve ter 14 dígitos";
      }
    }
    
    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 8) {
      newErrors.senha = "Senha deve ter pelo menos 8 caracteres";
    }
    
    if (!formData.confirmaSenha) {
      newErrors.confirmaSenha = "Confirmação de senha é obrigatória";
    } else if (formData.senha !== formData.confirmaSenha) {
      newErrors.confirmaSenha = "As senhas não coincidem";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        const requestData = {
          Name: formData.nome,
          Email: formData.email,
          Password: formData.senha,
          Phone: getCleanPhone(formData.telefone),
          Cnpj: getCleanCNPJ(formData.cnpj)
        };

        const response = await usersApi.post('/created', requestData);
        
        if (response.status === 200 || response.status === 201) {
          const responseData = response.data;
          
          if (responseData.success === true) {
            toast({
              title: "🎉 Cadastro realizado com sucesso!",
              description: `Bem-vindo, ${responseData.name}! Você será redirecionado para a página de login em alguns segundos.`,
              className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800 shadow-lg animate-in slide-in-from-top-2 duration-500",
              duration: 5000,
            });
            
            setErrors({});
            
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } else {
            throw new Error('Cadastro não foi realizado com sucesso');
          }
        }
      } catch (error: unknown) {
        console.error('Erro ao realizar cadastro:', error);
        
        let errorMessage = "Ocorreu um erro ao tentar criar sua conta";
        
        if (error && typeof error === 'object') {
          const errorObj = error as Record<string, unknown>;
          if (errorObj.response && typeof errorObj.response === 'object') {
            const response = errorObj.response as Record<string, unknown>;
            if (response.data && typeof response.data === 'object') {
              const data = response.data as Record<string, unknown>;
              
              if (data.success === false && data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                const fieldErrors = processValidationErrors(data.errors as string[]);
                setErrors(fieldErrors);
                
                if (data.errors.length === 1) {
                  errorMessage = String(data.errors[0]);
                } else {
                  errorMessage = `Múltiplos erros encontrados:\n• ${data.errors.join('\n• ')}`;
                }
              } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
                const fieldErrors = processValidationErrors(data.errors as string[]);
                setErrors(fieldErrors);
                
                if (data.errors.length === 1) {
                  errorMessage = String(data.errors[0]);
                } else {
                  errorMessage = `Múltiplos erros encontrados:\n• ${data.errors.join('\n• ')}`;
                }
              } else if (data.message && typeof data.message === 'string') {
                errorMessage = data.message;
              } else if (data.errors && !Array.isArray(data.errors)) {
                errorMessage = String(data.errors);
              }
            }
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        const hasFieldErrors = Object.keys(errors).length > 0;
        
        toast({
          title: "❌ Erro ao realizar cadastro",
          description: hasFieldErrors 
            ? "Verifique os campos destacados abaixo" 
            : errorMessage,
          className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800 shadow-lg animate-in slide-in-from-top-2 duration-500",
          duration: 6000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header com mesmo padrão da LandingPage */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100"
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
              {/* Logo já funciona como voltar */}
            </nav>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="hidden md:flex text-sm"
              >
                Entrar
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
              className="lg:hidden bg-white border-t border-gray-100"
            >
              <nav className="container mx-auto px-6 py-4 space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="w-full justify-start"
                >
                  Entrar
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="pt-16 min-h-screen flex items-center">
        {/* Hero Section com gradiente */}
        <section className="relative w-full py-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block mb-4"
                >
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Sparkles className="h-3 w-3 mr-2" />
                    Comece Agora
                  </Badge>
                </motion.div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  <span className="block text-gray-900 mb-2">Crie sua Conta</span>
                  <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Teste Grátis por 14 Dias
                  </span>
                </h1>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  Preencha os dados abaixo para criar sua conta e começar a usar o ERP Liderum
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="border-2 border-gray-100 shadow-xl bg-white">
                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Nome */}
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                          Nome completo
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                            <User size={18} />
                          </div>
                          <Input 
                            id="nome"
                            name="nome"
                            placeholder="Seu nome completo" 
                            className={`h-12 pl-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.nome ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            value={formData.nome}
                            onChange={handleChange}
                            disabled={isLoading}
                          />
                        </div>
                        {errors.nome && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 flex items-center gap-1.5 mt-1"
                          >
                            <AlertCircle size={14} /> {errors.nome}
                          </motion.p>
                        )}
                      </div>
                      
                      {/* Email e Telefone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              name="email"
                              type="email" 
                              placeholder="seu@email.com" 
                              className={`h-12 pl-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              value={formData.email}
                              onChange={handleChange}
                              disabled={isLoading}
                            />
                          </div>
                          {errors.email && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-red-500 flex items-center gap-1.5 mt-1"
                            >
                              <AlertCircle size={14} /> {errors.email}
                            </motion.p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                            Telefone
                          </Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                              <Phone size={18} />
                            </div>
                            <Input 
                              id="telefone"
                              name="telefone"
                              placeholder="(00) 00000-0000" 
                              className={`h-12 pl-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.telefone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              value={formData.telefone}
                              onChange={handleChange}
                              disabled={isLoading}
                              maxLength={15}
                            />
                          </div>
                          {errors.telefone && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-red-500 flex items-center gap-1.5 mt-1"
                            >
                              <AlertCircle size={14} /> {errors.telefone}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      
                      {/* CNPJ */}
                      <div className="space-y-2">
                        <Label htmlFor="cnpj" className="text-sm font-medium text-gray-700">
                          CNPJ
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                            <Building size={18} />
                          </div>
                          <Input 
                            id="cnpj"
                            name="cnpj"
                            placeholder="00.000.000/0000-00" 
                            className={`h-12 pl-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.cnpj ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            value={formData.cnpj}
                            onChange={handleChange}
                            disabled={isLoading}
                            maxLength={18}
                          />
                        </div>
                        {errors.cnpj && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 flex items-center gap-1.5 mt-1"
                          >
                            <AlertCircle size={14} /> {errors.cnpj}
                          </motion.p>
                        )}
                      </div>
                      
                      {/* Senhas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="senha" className="text-sm font-medium text-gray-700">
                            Criar Senha
                          </Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                              <Lock size={18} />
                            </div>
                            <Input 
                              id="senha"
                              name="senha"
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className={`h-12 pl-11 pr-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.senha ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              value={formData.senha}
                              onChange={handleChange}
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
                          {errors.senha && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-red-500 flex items-center gap-1.5 mt-1"
                            >
                              <AlertCircle size={14} /> {errors.senha}
                            </motion.p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmaSenha" className="text-sm font-medium text-gray-700">
                            Confirmar Senha
                          </Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                              <Lock size={18} />
                            </div>
                            <Input 
                              id="confirmaSenha"
                              name="confirmaSenha"
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className={`h-12 pl-11 pr-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.confirmaSenha ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              value={formData.confirmaSenha}
                              onChange={handleChange}
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={isLoading}
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {errors.confirmaSenha && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-red-500 flex items-center gap-1.5 mt-1"
                            >
                              <AlertCircle size={14} /> {errors.confirmaSenha}
                            </motion.p>
                          )}
                        </div>
                      </div>
                      
                      {/* Termos */}
                      <div className="flex items-start gap-3 pt-2">
                        <div className="pt-1">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Ao criar uma conta, você está de acordo com nossos{" "}
                          <a href="#" className="text-blue-600 hover:underline font-medium">Termos de Serviço</a>{" "}
                          e{" "}
                          <a href="#" className="text-blue-600 hover:underline font-medium">Política de Privacidade</a>.
                        </p>
                      </div>
                      
                      {/* Botão Submit */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="pt-2"
                      >
                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all group"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Criando conta...
                            </>
                          ) : (
                            <>
                              Criar Conta
                              <Check className="w-5 h-5 ml-2 transition-transform group-hover:scale-125" />
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

                    {/* Link para Login */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Já tem uma conta?{" "}
                        <Link 
                          to="/login" 
                          className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
                        >
                          Entrar
                        </Link>
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500"
              >
                <div className="flex items-center gap-1.5">
                  <Lock size={14} />
                  <span>Conexão segura</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={14} />
                  <span>Dados protegidos</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Cadastro;
