import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ChartShowcase from '@/components/ChartShowcase';
import PricingSection from '@/components/PricingSection';
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
  Award
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-blue-100/50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 h-20">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-12">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-blue-600">Liderum</span>
              </div>
              <nav className="hidden md:flex items-center justify-center space-x-8">
                <Button 
                  variant="ghost" 
                  onClick={() => scrollToSection('funcionalidades')}
                  className="text-gray-700 hover:text-blue-600 text-base font-medium transition-colors duration-200 h-10 flex items-center"
                >
                  Funcionalidades
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => scrollToSection('modulos')}
                  className="text-gray-700 hover:text-blue-600 text-base font-medium transition-colors duration-200 h-10 flex items-center"
                >
                  Módulos
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => scrollToSection('beneficios')}
                  className="text-gray-700 hover:text-blue-600 text-base font-medium transition-colors duration-200 h-10 flex items-center"
                >
                  Benefícios
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => scrollToSection('precos')}
                  className="text-gray-700 hover:text-blue-600 text-base font-medium transition-colors duration-200 h-10 flex items-center"
                >
                  Preços
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-blue-600 text-base font-medium transition-colors duration-200"
              >
                Entrar
              </Button>
              <Button 
                variant="default" 
                onClick={() => navigate('/cadastro')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Comece Agora
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-28">
        <section className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                  Transforme a Gestão do seu 
                  <span className="text-blue-600"> Negócio</span>
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Solução completa para gestão empresarial, transformando dados em resultados para o seu negócio com dashboards interativos e relatórios em tempo real.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/cadastro')}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold"
                >
                  Comece Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/cadastro')}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  Fale com um Consultor
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Empresas Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600">Suporte</div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative rounded-2xl shadow-2xl border-4 border-white/90 group-hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1000"
                  alt="Dashboard Preview" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* ChartShowcase Section */}
        <div id="funcionalidades">
          <ChartShowcase />
        </div>

        {/* Modules Section */}
        <section id="modulos" className="py-20 bg-gray-50 border-y-2 border-gray-200">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Módulos Principais</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Uma solução completa com todos os módulos necessários para gerenciar seu negócio
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white group hover:-translate-y-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                    <ClipboardList className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Cadastros</h3>
                </div>
                <ul className="space-y-3 text-gray-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Cadastro de Usuários
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Cadastro de Produtos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Perfis de Acesso
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Importação em Massa
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 transition-all duration-300"
                >
                  Saiba mais <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white group hover:-translate-y-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                    <ShoppingCart className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Vendas</h3>
                </div>
                <ul className="space-y-3 text-gray-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Pedidos de Vendas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Orçamentos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Notas Fiscais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dashboard de Vendas
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-green-50 group-hover:border-green-300 transition-all duration-300"
                >
                  Saiba mais <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white group hover:-translate-y-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-300">
                    <Package className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Estoque</h3>
                </div>
                <ul className="space-y-3 text-gray-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Controle de Estoque
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Entradas e Saídas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Inventário
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Relatórios de Movimentação
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-orange-50 group-hover:border-orange-300 transition-all duration-300"
                >
                  Saiba mais <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 bg-white group hover:-translate-y-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-300">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Financeiro</h3>
                </div>
                <ul className="space-y-3 text-gray-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Contas a Pagar
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Contas a Receber
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Fluxo de Caixa
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Relatórios Financeiros
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-purple-50 group-hover:border-purple-300 transition-all duration-300"
                >
                  Saiba mais <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section id="beneficios" className="py-20 bg-white border-y-2 border-gray-200">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Por Que Escolher o Liderum?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Descubra as vantagens que fazem do Liderum a escolha certa para sua empresa
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-300 group">
                <div className="p-4 bg-blue-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Decisões Baseadas em Dados</h3>
                <p className="text-gray-700">
                  Dashboards interativos que permitem análises completas para tomar decisões estratégicas com confiança.
                </p>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-300 group">
                <div className="p-4 bg-green-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Aumento de Produtividade</h3>
                <p className="text-gray-700">
                  Automatize processos repetitivos e libere sua equipe para focar no que realmente importa para o crescimento.
                </p>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-300 group">
                <div className="p-4 bg-purple-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Sistema Escalável</h3>
                <p className="text-gray-700">
                  Acompanha o crescimento do seu negócio com flexibilidade para adicionar novos módulos conforme necessário.
                </p>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-all duration-300 border-2 border-red-200 hover:border-red-300 group">
                <div className="p-4 bg-red-600 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Segurança Avançada</h3>
                <p className="text-gray-700">
                  Proteção total dos seus dados com controle de acesso baseado em perfis de usuário e criptografia.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <div id="precos">
          <PricingSection />
        </div>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                O que nossos clientes dizem
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Mais de 500 empresas já transformaram sua gestão com o Liderum
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 bg-white hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "O Liderum revolucionou nossa gestão. Os dashboards são incríveis e nos ajudam a tomar decisões muito mais assertivas."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">MR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Maria Rodrigues</div>
                    <div className="text-sm text-gray-600">CEO, TechCorp</div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-white hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-green-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "A integração entre os módulos é perfeita. Economizamos 40% do tempo em processos administrativos."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">JS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">João Silva</div>
                    <div className="text-sm text-gray-600">Diretor, Inovação Ltda</div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-white hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "Suporte excepcional e sistema muito intuitivo. Nossa equipe se adaptou rapidamente à plataforma."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">AC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Ana Costa</div>
                    <div className="text-sm text-gray-600">Gerente, Solutions Inc</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-y-2 border-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <Award className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pronto para transformar a gestão do seu negócio?
              </h2>
              <p className="text-xl mb-12 text-blue-100 leading-relaxed">
                Comece agora com nossa versão de teste gratuita por 14 dias. Sem compromisso e com acesso a todos os módulos e suporte completo.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/cadastro')}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <TrendingUp className="mr-2 h-6 w-6" />
                  Comece agora
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/cadastro')}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Clock className="mr-2 h-6 w-6" />
                  Fale com um consultor
                </Button>
              </div>
              <div className="mt-8 text-blue-200">
                <p className="text-sm">✓ Sem cartão de crédito • ✓ Suporte 24/7 • ✓ Cancelamento a qualquer momento</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t-2 border-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-white text-xl">Liderum</h4>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Solução completa para gestão empresarial, transformando dados em resultados para o seu negócio.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-white text-lg">Módulos</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Cadastros</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Vendas</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Estoque</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Financeiro</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-white text-lg">Recursos</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Demonstração</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Documentação</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Suporte</li>
                <li className="hover:text-white transition-colors duration-200 cursor-pointer">Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-white text-lg">Contato</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-white transition-colors duration-200">(11) 9999-9999</li>
                <li className="hover:text-white transition-colors duration-200">contato@liderum.com</li>
                <li className="hover:text-white transition-colors duration-200">São Paulo, SP</li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300">
              © {new Date().getFullYear()} Liderum. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Button variant="link" className="text-gray-300 hover:text-white transition-colors duration-300">Termos</Button>
              <Button variant="link" className="text-gray-300 hover:text-white transition-colors duration-300">Privacidade</Button>
              <Button variant="link" className="text-gray-300 hover:text-white transition-colors duration-300">Cookies</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 