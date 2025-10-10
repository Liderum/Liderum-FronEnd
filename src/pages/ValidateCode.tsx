import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, Loader2, CheckCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { ValidateCodeRequest, ValidateCodeResponse } from '@/types/auth';
import api from '@/services/api/axios';

const ValidateCode = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<{code?: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = location.state?.email;

  // Redireciona se não houver email
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleInputChange = (index: number, value: string) => {
    // Permite apenas números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move para o próximo campo se digitou um número
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Limpa erros quando usuário digita
    if (errors.code) {
      setErrors({});
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Volta para o campo anterior se pressionou backspace e o campo está vazio
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      
      // Move para o último campo
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      setErrors({ code: 'Código deve ter 6 dígitos' });
      return;
    }

    setIsLoading(true);
    setIsValidating(true);
    setErrors({});

    try {
      const response = await api.post<ValidateCodeResponse>('/validate-code', {
        email,
        code: codeString
      } as ValidateCodeRequest, {
        timeout: 15000 // 15 segundos para validação
      });

      if (response.data.success) {
        toast({
          title: "Código válido!",
          description: "Redirecionando para redefinição de senha...",
          variant: "default",
          duration: 3000,
          className: "bg-green-50 border-green-200",
        });

        // Redireciona para a tela de redefinição de senha
        setTimeout(() => {
          navigate('/reset-password', { 
            state: { email, code: codeString } 
          });
        }, 1500);
      } else {
        const errorMessage = response.data.errors?.[0] || response.data.message || 'Código inválido';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Erro ao validar código:', error);
      
      let errorMessage = "Código inválido. Tente novamente.";
      
      if (error.response?.data?.errors) {
        errorMessage = Array.isArray(error.response.data.errors) 
          ? error.response.data.errors[0] 
          : error.response.data.errors;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Código inválido",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
        className: "bg-red-50 border-red-200",
      });

      // Limpa o código em caso de erro
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
      const response = await api.post('/forgot-password', { email }, {
        timeout: 30000 // 30 segundos para reenvio de email
      });
      
      if (response.data.success) {
        toast({
          title: "Código reenviado!",
          description: "Verifique seu email para o novo código.",
          variant: "default",
          duration: 5000,
          className: "bg-green-50 border-green-200",
        });
        
        // Limpa o código atual
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast({
        title: "Erro ao reenviar",
        description: "Não foi possível reenviar o código. Tente novamente.",
        variant: "destructive",
        duration: 5000,
        className: "bg-red-50 border-red-200",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null; // Será redirecionado pelo useEffect
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
            <Shield className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Validar Código
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite o código de 6 dígitos enviado para <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campos de código */}
          <div className="flex justify-center space-x-2">
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
                  className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  } ${isValidating ? 'border-blue-500 bg-blue-50' : ''}`}
                  disabled={isLoading}
                />
            ))}
          </div>

          {errors.code && (
            <p className="text-sm text-red-500 text-center">{errors.code}</p>
          )}

          {/* Status de validação */}
          {isValidating && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Validando código...</span>
            </div>
          )}

          {/* Botão de reenviar */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reenviar código
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={handleSubmit}
            className="w-full"
            disabled={isLoading || code.join('').length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              'Validar Código'
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/forgot-password', { state: { email } })}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ValidateCode;
