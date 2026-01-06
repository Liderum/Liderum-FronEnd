import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Loader2,
  Phone,
  Mail,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  BarChart,
  Menu,
  X,
  MessageSquare,
  HeadphonesIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useSessionCleanup } from '@/hooks/useSessionCleanup';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef(null);
  const isFormInView = useInView(formRef, { once: true, margin: "-100px" });
  
  useSessionCleanup();
  
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
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
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Voltar
              </Button>
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
                onClick={() => navigate('/cadastro')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm px-5 shadow-lg"
              >
                Teste Grátis
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
                  onClick={() => navigate('/')}
                  className="w-full justify-start"
                >
                  Voltar
                </Button>
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

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
          
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block mb-4"
              >
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  <MessageSquare className="h-3 w-3 mr-2" />
                  Fale Conosco
                </Badge>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                <span className="block text-gray-900 mb-2">Entre em Contato</span>
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Estamos Aqui para Ajudar
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mt-4">
                Tem dúvidas sobre o ERP Liderum? Quer saber mais sobre nossos módulos? 
                Entre em contato e nossa equipe responderá o mais rápido possível.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Conteúdo Principal */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Informações de Contato */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Informações de Contato
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Escolha a forma de contato que preferir. Estamos disponíveis para ajudar.
                  </p>
                </div>

                <div className="space-y-4">
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-6 border-2 border-gray-100 hover:border-blue-300 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Phone className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Telefone</h3>
                          <p className="text-gray-600">(11) 99386-6659</p>
                          <p className="text-sm text-gray-500 mt-1">Segunda a Sexta, 8h às 17h</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-6 border-2 border-gray-100 hover:border-green-300 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Mail className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">E-mail</h3>
                          <p className="text-gray-600">liderumSuporte@gmail.com.br</p>
                          <p className="text-sm text-gray-500 mt-1">Resposta em até 24 horas</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-6 border-2 border-gray-100 hover:border-purple-300 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Localização</h3>
                          <p className="text-gray-600">São Paulo, SP</p>
                          <p className="text-sm text-gray-500 mt-1">Brasil</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-6 border-2 border-gray-100 hover:border-orange-300 transition-all bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Horário de Atendimento</h3>
                          <p className="text-gray-600">Segunda - Sexta</p>
                          <p className="text-sm text-gray-500 mt-1">08:00 - 17:00</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>

              {/* Formulário */}
              <motion.div
                ref={formRef}
                initial={{ opacity: 0, x: 30 }}
                animate={isFormInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="p-8 border-2 border-gray-100 shadow-lg">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Send className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Envie sua Mensagem
                      </h2>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Preencha o formulário abaixo e entraremos em contato o mais rápido possível.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nome */}
                    <div>
                      <Label htmlFor="nome" className="text-sm font-medium text-gray-700 mb-2 block">
                        Nome *
                      </Label>
                      <Input
                        id="nome"
                        placeholder="Seu nome completo"
                        value={form.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        disabled={loading}
                        className={`h-11 ${errors.nome ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                      />
                      {errors.nome && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.nome}
                        </motion.p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <Label htmlFor="telefone" className="text-sm font-medium text-gray-700 mb-2 block">
                        Telefone *
                      </Label>
                      <Input
                        id="telefone"
                        placeholder="(11) 99999-9999"
                        value={form.telefone}
                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                        disabled={loading}
                        className={`h-11 ${errors.telefone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                      />
                      {errors.telefone && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.telefone}
                        </motion.p>
                      )}
                    </div>

                    {/* E-mail */}
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                        E-mail *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={loading}
                        className={`h-11 ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                      />
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.email}
                        </motion.p>
                      )}
                    </div>

                    {/* Mensagem */}
                    <div>
                      <Label htmlFor="mensagem" className="text-sm font-medium text-gray-700 mb-2 block">
                        Mensagem *
                      </Label>
                      <Textarea
                        id="mensagem"
                        placeholder="Como podemos ajudar você?"
                        value={form.mensagem}
                        onChange={(e) => handleInputChange('mensagem', e.target.value)}
                        disabled={loading}
                        rows={6}
                        className={`resize-none ${errors.mensagem ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                      />
                      {errors.mensagem && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 mt-2 flex items-center gap-1"
                        >
                          <AlertCircle className="h-4 w-4" />
                          {errors.mensagem}
                        </motion.p>
                      )}
                    </div>

                    {/* Botão */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Enviar Mensagem
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold">Liderum</span>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Liderum. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
