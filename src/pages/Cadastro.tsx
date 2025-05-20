
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User, Phone, Building, Lock, Shield, Check, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

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
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpa o erro ao editar o campo
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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulação de cadastro bem-sucedido
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua conta foi criada. Você será redirecionado para a página inicial.",
      });
      
      // Redirecionamento após o cadastro
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 py-12 px-4">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-8">
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
        </div>
        
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
                  />
                </div>
                {errors.nome && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={14} /> {errors.nome}
                  </p>
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
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} /> {errors.email}
                    </p>
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
                    />
                  </div>
                  {errors.telefone && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} /> {errors.telefone}
                    </p>
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
                  />
                </div>
                {errors.cnpj && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={14} /> {errors.cnpj}
                  </p>
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
                      type="password" 
                      placeholder="••••••••" 
                      className={`pl-10 ${errors.senha ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={formData.senha}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.senha && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} /> {errors.senha}
                    </p>
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
                      type="password" 
                      placeholder="••••••••" 
                      className={`pl-10 ${errors.confirmaSenha ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={formData.confirmaSenha}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.confirmaSenha && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} /> {errors.confirmaSenha}
                    </p>
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
              
              <Button type="submit" className="w-full gap-2 mt-6 group">
                Criar Conta
                <Check className="w-4 h-4 transition-transform group-hover:scale-125" />
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
        
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Lock size={14} />
            <span>Conexão segura</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Shield size={14} />
            <span>Dados protegidos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
