import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Send, 
  Loader2,
  Phone,
  Mail,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface ContactForm {
  nome: string;
  telefone: string;
  email: string;
  mensagem: string;
}

export function Contact() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState<ContactForm>({
    nome: '',
    telefone: '',
    email: '',
    mensagem: ''
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!form.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!form.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!form.mensagem.trim()) {
      newErrors.mensagem = 'Mensagem é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Simula envio da mensagem (aqui você pode integrar com sua API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sucesso",
        description: "Mensagem enviada com sucesso! Entraremos em contato em breve.",
        variant: "default",
      });

      // Limpa o formulário
      setForm({
        nome: '',
        telefone: '',
        email: '',
        mensagem: ''
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Remove erro quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Fale com um Consultor</h1>
                <p className="text-gray-600 mt-1">Entre em contato conosco para mais informações</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações de Contato */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-6 w-6 mr-2 text-blue-500" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Telefone</p>
                    <p className="text-gray-600">(11) 99386-6659</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">E-mail</p>
                    <p className="text-gray-600">liderumSuporte@gmail.com.br</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-green-500" />
                  Horário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Segunda - Sexta</p>
                    <p className="text-gray-600 dark:text-gray-300">08:00 - 17:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-6 w-6 mr-2 text-red-500" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">São Paulo, SP</p>
                    <p className="text-gray-600 dark:text-gray-300">Brasil</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-6 w-6 mr-2 text-blue-500" />
                Preencha o Formulário
              </CardTitle>
              <CardDescription>
                Envie sua mensagem e entraremos em contato em breve
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome"
                    value={form.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    disabled={loading}
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    placeholder="Seu telefone"
                    value={form.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    disabled={loading}
                    className={errors.telefone ? 'border-red-500' : ''}
                  />
                  {errors.telefone && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.telefone}
                    </p>
                  )}
                </div>

                {/* E-mail */}
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Seu e-mail"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={loading}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <Label htmlFor="mensagem">Mensagem *</Label>
                  <Textarea
                    id="mensagem"
                    placeholder="Escreva sua mensagem…"
                    value={form.mensagem}
                    onChange={(e) => handleInputChange('mensagem', e.target.value)}
                    disabled={loading}
                    rows={5}
                    className={errors.mensagem ? 'border-red-500' : ''}
                  />
                  {errors.mensagem && (
                    <p className="text-sm text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.mensagem}
                    </p>
                  )}
                </div>

                {/* Botão */}
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar mensagem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
