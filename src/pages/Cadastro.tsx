import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User, Phone, Building, Lock, Shield, Check, AlertCircle, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { validateEmail } from '@/lib/emailValidation';

const Cadastro = () => {
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
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    if (!formData.telefone) newErrors.telefone = "Telefone é obrigatório";
    
    if (formData.cnpj && formData.cnpj.length !== 14 && formData.cnpj.length !== 18) {
      newErrors.cnpj = "CNPJ inválido";
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
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você será redirecionado para a página de login.",
          className: "bg-green-50 border-green-200",
          duration: 3000,
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } catch (error) {
        toast({
          title: "Erro ao realizar cadastro",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar criar sua conta",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 py-12 px-4"
    >
      <div className="w-full max-w-xl">
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
              <CardTitle className="text-2xl font-semibold text-center">Criar nova conta</CardTitle>
              <CardDescription className="text-center">
                Preencha os dados abaixo para criar sua conta
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <User size={18} />
                    </div>
                    <Input 
                      id="nome"
                      name="nome"
                      placeholder="Seu nome completo" 
                      className={`pl-10 ${errors.nome ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={formData.nome}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.nome && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-1 mt-1"
                    >
                      <AlertCircle size={14} /> {errors.nome}
                    </motion.p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Mail size={18} />
                      </div>
                      <Input 
                        id="email"
                        name="email"
                        type="email" 
                        placeholder="seu@email.com" 
                        className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
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
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Phone size={18} />
                      </div>
                      <Input 
                        id="telefone"
                        name="telefone"
                        placeholder="(00) 00000-0000" 
                        className={`pl-10 ${errors.telefone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        value={formData.telefone}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.telefone && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1 mt-1"
                      >
                        <AlertCircle size={14} /> {errors.telefone}
                      </motion.p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cnpj">
                    CNPJ <span className="text-xs text-gray-500">(opcional)</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Building size={18} />
                    </div>
                    <Input 
                      id="cnpj"
                      name="cnpj"
                      placeholder="00.000.000/0000-00" 
                      className={`pl-10 ${errors.cnpj ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={formData.cnpj}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.cnpj && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-1 mt-1"
                    >
                      <AlertCircle size={14} /> {errors.cnpj}
                    </motion.p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senha">Criar Senha</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Lock size={18} />
                      </div>
                      <Input 
                        id="senha"
                        name="senha"
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className={`pl-10 pr-10 ${errors.senha ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        value={formData.senha}
                        onChange={handleChange}
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
                    {errors.senha && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1 mt-1"
                      >
                        <AlertCircle size={14} /> {errors.senha}
                      </motion.p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmaSenha">Confirmar Senha</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Lock size={18} />
                      </div>
                      <Input 
                        id="confirmaSenha"
                        name="confirmaSenha"
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className={`pl-10 pr-10 ${errors.confirmaSenha ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        value={formData.confirmaSenha}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
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
                        className="text-sm text-red-500 flex items-center gap-1 mt-1"
                      >
                        <AlertCircle size={14} /> {errors.confirmaSenha}
                      </motion.p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-2 mt-2">
                  <div className="pt-1">
                    <Shield size={18} className="text-primary" />
                  </div>
                  <p className="text-xs text-gray-600">
                    Ao criar uma conta, você está de acordo com nossos <a href="#" className="text-primary hover:underline">Termos de Serviço</a> e <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gap-2 mt-6 group relative"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar Conta
                      <Check className="w-4 h-4 transition-transform group-hover:scale-125" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center pt-2">
              <p className="text-center text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Entrar
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Lock size={14} />
            <span>Conexão segura</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Shield size={14} />
            <span>Dados protegidos</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Cadastro;
