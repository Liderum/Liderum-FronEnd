import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PricingSection from '@/components/PricingSection';
import { useSessionCleanup } from '@/hooks/useSessionCleanup';
import { 
  ArrowRight, 
  CheckCircle, 
  BarChart, 
  Shield, 
  Zap, 
  Users, 
  ClipboardList, 
  ShoppingCart, 
  Package, 
  DollarSign,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  Award,
  Menu,
  X,
  Sparkles,
  Rocket,
  Target,
  Brain,
  LineChart,
  PieChart,
  Activity,
  Globe,
  Lock,
  FileText,
  Bell,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Play,
  ArrowDown,
  Lightbulb,
  Gauge,
  Layers,
  Database,
  Cloud,
  Server,
  Code,
  Settings,
  BarChart3,
  TrendingDown,
  ArrowUpRight,
  AlertCircle,
  Eye,
  UserPlus
} from 'lucide-react';

// Componente de contador animado
const AnimatedCounter = ({ value, suffix = '', duration = 2, prefix = '' }: { value: number; suffix?: string; duration?: number; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

// Componente de timeline vertical
const TimelineItem = ({ year, title, description, delay = 0 }: { year: string; title: string; description: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="relative pl-8 pb-8 border-l-2 border-blue-200"
    >
      <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg" />
      <div className="text-sm font-bold text-blue-600 mb-2">{year}</div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );
};

// Componente de métrica destacada
const MetricCard = ({ icon: Icon, value, label, trend, delay = 0 }: { icon: React.ComponentType<{ className?: string }>; value: string | React.ReactNode; label: string; trend?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-50 rounded-xl">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        {trend && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </Badge>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  );
};

// Componente de processo step-by-step
const ProcessStep = ({ number, title, description, icon: Icon, delay = 0 }: { number: number; title: string; description: string; icon: React.ComponentType<{ className?: string }>; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="relative"
    >
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 hover:border-blue-300 transition-colors">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {number}
          </div>
          <div className="p-2 bg-white rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
      {number < 4 && (
        <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
          <ChevronRight className="h-8 w-8 text-blue-300" />
        </div>
      )}
    </motion.div>
  );
};

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  
  useSessionCleanup();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimalista */}
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
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
              {[
                { id: 'solucao', label: 'Solução' },
                { id: 'como-funciona', label: 'Como Funciona' },
                { id: 'resultados', label: 'Resultados' },
                { id: 'precos', label: 'Preços' }
              ].map((item) => (
                <Button 
                  key={item.id}
                  variant="ghost" 
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  {item.label}
                </Button>
              ))}
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
              className="lg:hidden bg-white border-t border-gray-200"
            >
              <nav className="container mx-auto px-6 py-4 space-y-2">
                {['solucao', 'como-funciona', 'resultados', 'precos'].map((id) => (
                  <Button
                    key={id}
                    variant="ghost"
                    onClick={() => scrollToSection(id)}
                    className="w-full justify-start capitalize"
                  >
                    {id === 'solucao' ? 'Solução' :
                     id === 'como-funciona' ? 'Como Funciona' :
                     id === 'resultados' ? 'Resultados' : 'Preços'}
                  </Button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="pt-16">
        {/* Hero Section - Layout Assimétrico */}
        <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
          
          <motion.div 
            style={{ y: heroY }}
            className="container mx-auto px-6 py-20 relative z-10"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Conteúdo Principal */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>ERP Completo para Pequenas e Médias Empresas</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="block text-gray-900"
                  >
                    O ERP que seu negócio
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    realmente precisa
                  </motion.span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl"
                >
                  ERP completo com módulos integrados de <span className="font-semibold text-gray-900">Vendas</span>, 
                  <span className="font-semibold text-gray-900"> Estoque</span>, 
                  <span className="font-semibold text-gray-900"> Financeiro</span> e 
                  <span className="font-semibold text-gray-900"> Gestão</span>. 
                  Tudo conectado, automatizado e em tempo real.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-4"
                >
                <Button 
                  size="lg" 
                  onClick={() => navigate('/cadastro')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-base font-semibold shadow-xl hover:shadow-2xl transition-all"
                >
                    Começar Agora - Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                    variant="outline"
                    onClick={() => scrollToSection('como-funciona')}
                    className="px-8 py-6 text-base font-semibold border-2"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Ver Demonstração
                  </Button>
                </motion.div>

                {/* Métricas Rápidas */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-3 gap-4 md:gap-6 pt-6 border-t border-gray-200"
                >
                  {[
                    { value: 4, suffix: ' Módulos', label: 'Completos' },
                    { value: 100, suffix: '%', label: 'Integrado' },
                    { value: 24, suffix: '/7', label: 'Disponível' }
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Visual Destaque */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-20" />
                  
                  {/* Dashboard Preview Simulado */}
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">Dashboard ao Vivo</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { icon: TrendingUp, value: 'R$ 2.4M', label: 'Faturamento', color: 'blue' },
                        { icon: Users, value: '1.2K', label: 'Clientes', color: 'green' },
                        { icon: Package, value: '856', label: 'Produtos', color: 'orange' }
                      ].map((metric, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200"
                        >
                          <metric.icon className={`h-5 w-5 text-${metric.color}-600 mb-2`} />
                          <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                          <div className="text-xs text-gray-600">{metric.label}</div>
                        </motion.div>
                      ))}
              </div>

                    <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-center">
                      <BarChart3 className="h-16 w-16 text-blue-400" />
                </div>
                </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-gray-400 cursor-pointer"
              onClick={() => scrollToSection('solucao')}
            >
              <span className="text-xs font-medium">Role para explorar</span>
              <ArrowDown className="h-5 w-5" />
            </motion.div>
          </motion.div>
        </section>

        {/* Seção: O Problema que Resolvemos */}
        <section id="solucao" className="py-20 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 max-w-3xl mx-auto"
            >
              <Badge className="mb-4 bg-red-50 text-red-700 border-red-200">
                O Problema
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Você está perdendo dinheiro e tempo com planilhas?
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                A maioria das empresas ainda gerencia seu negócio em planilhas desconectadas, 
                perdendo oportunidades e tomando decisões baseadas em dados desatualizados.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Dados Desconectados",
                  description: "Informações espalhadas em múltiplas planilhas, sem integração real",
                  icon: Database,
                  color: "red"
                },
                {
                  title: "Decisões Atrasadas",
                  description: "Relatórios demoram dias para serem gerados, perdendo oportunidades",
                  icon: Clock,
                  color: "orange"
                },
                {
                  title: "Erros Manuais",
                  description: "Digitação incorreta e falta de validação causam prejuízos",
                  icon: AlertCircle,
                  color: "yellow"
                },
                {
                  title: "Falta de Visibilidade",
                  description: "Impossível ter uma visão completa do negócio em tempo real",
                  icon: Eye,
                  color: "blue"
                }
              ].map((problem, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border-2 border-gray-200 hover:border-red-200 transition-colors"
                >
                  <div className={`w-12 h-12 bg-${problem.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                    <problem.icon className={`h-6 w-6 text-${problem.color}-600`} />
              </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
                  <p className="text-gray-600 text-sm">{problem.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Seção: Nossa Solução */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 max-w-3xl mx-auto"
            >
              <Badge className="mb-4 bg-green-50 text-green-700 border-green-200">
                A Solução Liderum
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ERP Completo e Integrado
              </h2>
              <p className="text-lg text-gray-600">
                Todos os módulos conversam entre si. Quando você vende, o estoque atualiza automaticamente 
                e o financeiro registra a movimentação. Tudo em tempo real.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
              {[
                {
                  icon: Zap,
                  title: "Automação Inteligente",
                  description: "Processos repetitivos executados automaticamente, liberando sua equipe",
                  stat: "85% menos tempo em tarefas manuais"
                },
                {
                  icon: Brain,
                  title: "IA Preditiva",
                  description: "Previsões de demanda, sugestões de compra e alertas inteligentes",
                  stat: "92% de precisão nas previsões"
                },
                {
                  icon: Globe,
                  title: "Acesso de Qualquer Lugar",
                  description: "Trabalhe de onde estiver, com sincronização em tempo real",
                  stat: "100% na nuvem, zero instalação"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="text-sm font-semibold text-blue-600">{feature.stat}</div>
                </motion.div>
              ))}
                </div>

            {/* Módulos do ERP */}
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Os 4 Módulos Principais do ERP
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Cada módulo funciona de forma independente, mas todos se integram perfeitamente para dar uma visão completa do seu negócio.
                </p>
              </motion.div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { 
                    icon: ShoppingCart, 
                    name: "Vendas", 
                    bgColor: "bg-green-100",
                    bgHoverColor: "group-hover:bg-green-200",
                    iconColor: "text-green-600",
                    description: "Pedidos, orçamentos, notas fiscais e controle completo do processo de vendas"
                  },
                  { 
                    icon: Package, 
                    name: "Estoque", 
                    bgColor: "bg-orange-100",
                    bgHoverColor: "group-hover:bg-orange-200",
                    iconColor: "text-orange-600",
                    description: "Controle de entrada, saída, inventário e alertas de reposição automáticos"
                  },
                  { 
                    icon: DollarSign, 
                    name: "Financeiro", 
                    bgColor: "bg-purple-100",
                    bgHoverColor: "group-hover:bg-purple-200",
                    iconColor: "text-purple-600",
                    description: "Contas a pagar, receber, fluxo de caixa e relatórios financeiros completos"
                  },
                  { 
                    icon: ClipboardList, 
                    name: "Gestão", 
                    bgColor: "bg-blue-100",
                    bgHoverColor: "group-hover:bg-blue-200",
                    iconColor: "text-blue-600",
                    description: "Cadastros, usuários, permissões e configurações gerais do sistema"
                  }
                ].map((module, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer group h-full flex flex-col"
                  >
                    <div className={`w-14 h-14 ${module.bgColor} ${module.bgHoverColor} rounded-xl flex items-center justify-center mb-4 transition-colors shadow-sm`}>
                      <module.icon className={`h-7 w-7 ${module.iconColor}`} />
                  </div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">{module.name}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed flex-grow">{module.description}</p>
                  </motion.div>
                ))}
                </div>
            </div>
          </div>
        </section>

        {/* Seção: Como Funciona - Processo */}
        <section id="como-funciona" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Em 4 Passos Simples
              </h2>
              <p className="text-lg text-gray-600">
                Comece a usar hoje mesmo, sem complicação
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <ProcessStep
                number={1}
                title="Cadastre-se Grátis"
                description="Crie sua conta em menos de 2 minutos, sem necessidade de cartão de crédito"
                icon={UserPlus}
                delay={0}
              />
              <ProcessStep
                number={2}
                title="Configure Seu Negócio"
                description="Importe seus dados ou comece do zero. Nossa equipe ajuda você na configuração"
                icon={Settings}
                delay={0.1}
              />
              <ProcessStep
                number={3}
                title="Treine Sua Equipe"
                description="Acesso a vídeos tutoriais, webinars e suporte especializado para sua equipe"
                icon={Users}
                delay={0.2}
              />
              <ProcessStep
                number={4}
                title="Veja os Resultados"
                description="Em menos de 30 dias, você já verá aumento de produtividade e redução de custos"
                icon={TrendingUp}
                delay={0.3}
              />
            </div>
                </div>
        </section>

        {/* Seção: Resultados Reais */}
        <section id="resultados" className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-30" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                Resultados Comprovados
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Números que Falam por Si
              </h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Resultados reais que nossos clientes alcançam com o ERP Liderum
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <MetricCard
                icon={TrendingUp}
                value={<><AnimatedCounter value={45} suffix="%" /> redução</>}
                label="em custos operacionais"
                trend="+12% vs mês anterior"
                delay={0}
              />
              <MetricCard
                icon={Clock}
                value={<><AnimatedCounter value={67} suffix="%" /> menos tempo</>}
                label="em processos manuais"
                trend="Economia de 20h/semana"
                delay={0.1}
              />
              <MetricCard
                icon={DollarSign}
                value={<><AnimatedCounter value={38} suffix="%" /> aumento</>}
                label="na margem de lucro"
                trend="Decisões mais assertivas"
                delay={0.2}
              />
              <MetricCard
                icon={Users}
                value={<><AnimatedCounter value={92} suffix="%" /> satisfação</>}
                label="dos nossos clientes"
                trend="NPS: 72"
                delay={0.3}
              />
                </div>

            {/* Nossa Visão */}
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-6">
                  Começamos em 2025 com uma Missão
                </h3>
                <p className="text-lg text-blue-100 leading-relaxed mb-8">
                  Nascemos para ser o ERP mais completo e acessível do Brasil. 
                  Queremos crescer junto com nossos clientes, oferecendo soluções que realmente 
                  transformam a gestão empresarial.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                    <div className="text-3xl font-bold mb-1">2025</div>
                    <div className="text-sm text-blue-200">Ano de Lançamento</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                    <div className="text-3xl font-bold mb-1">Crescimento</div>
                    <div className="text-sm text-blue-200">Contínuo e Sustentável</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <div id="precos">
          <PricingSection />
        </div>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                className="inline-block mb-6"
              >
                <Rocket className="h-14 w-14 text-yellow-400" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para Transformar Seu Negócio?
              </h2>
              <p className="text-lg text-blue-100 mb-10 leading-relaxed">
                Teste grátis por 14 dias, sem cartão de crédito. 
                <br />
                <span className="font-semibold text-white">Todos os módulos disponíveis para você experimentar.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/cadastro')}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-2xl"
                >
                  Começar Teste Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/contact')}
                  className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 px-10 py-6 text-lg font-semibold backdrop-blur-sm"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Falar com Vendas
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-blue-100 flex-wrap">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Sem compromisso
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Suporte 24/7
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Cancelamento fácil
                </span>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white text-gray-900 border-t border-gray-200">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BarChart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Liderum</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                A plataforma completa de gestão empresarial que conecta todas as áreas do seu negócio.
              </p>
              <div className="flex gap-3">
                {[Globe, Mail, Phone].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 bg-white/80 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer">
                    <Icon className="h-5 w-5 text-gray-700" />
            </div>
                ))}
            </div>
            </div>
            
            {[
              { 
                title: "Produto", 
                items: ["Módulos", "Funcionalidades", "Preços", "Atualizações", "Roadmap"] 
              },
              { 
                title: "Empresa", 
                items: ["Sobre Nós", "Carreiras", "Imprensa", "Parceiros", "Contato"] 
              },
              { 
                title: "Recursos", 
                items: ["Blog", "Documentação", "API", "Integrações", "Suporte"] 
              }
            ].map((section, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer text-sm">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Liderum. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Termos</span>
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacidade</span>
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 
