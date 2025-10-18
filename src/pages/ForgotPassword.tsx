import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { validateEmail } from '@/lib/emailValidation';
import { ForgotPasswordRequest, ForgotPasswordResponse } from '@/types/auth';
import api from '@/services/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import { SimpleToast } from '@/components/SimpleToast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{email?: string}>({});
  const { toast } = useToast();
  const { showError, errorToast, hideError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação do email
    if (!email) {
      setErrors({ email: 'Email é obrigatório' });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: 'Email inválido' });
      return;
    }

    setIsLoading(true);
    setErrors({});

      try {
        const response = await api.post<ForgotPasswordResponse>('/forgot-password', {
          email
        } as ForgotPasswordRequest, {
          timeout: 30000
        });
        response.data.success = true;
      if (response.data.success) {
        setIsSuccess(true);
        toast({
          title: "Código enviado!",
          description: "Verifique seu email para o código de recuperação.",
          variant: "default",
          duration: 5000,
          className: "bg-green-50 border-green-200",
        });
      } else {
        const errorMessage = response.data.errors?.[0] || response.data.message || 'Erro ao enviar código';
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      console.error('Erro ao solicitar recuperação:', error);
      
      // Usa o novo sistema de toast melhorado que detecta automaticamente o tipo de erro
      showError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    // Redireciona para a tela de validação do código
    navigate('/validate-code', { 
      state: { email } 
    });
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Código Enviado!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enviamos um código de 6 dígitos para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Próximos passos:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Verifique sua caixa de entrada</li>
                <li>• Procure por emails da Liderum</li>
                <li>• Insira o código de 6 dígitos</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={handleContinue}
              className="w-full"
            >
              Inserir Código
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite seu email para receber um código de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Código'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Login
          </Button>
        </CardFooter>
      </Card>
      
      {/* Toast de erro melhorado */}
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
    </motion.div>
  );
};

export default ForgotPassword;
