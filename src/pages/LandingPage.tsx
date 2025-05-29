import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  ChevronRight
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-blue-100/50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 h-20">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-12">
              <span className="text-2xl font-bold text-blue-600">Liderum</span>
              <nav className="hidden md:flex items-center space-x-8">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 text-base font-medium">Funcionalidades</Button>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 text-base font-medium">Módulos</Button>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 text-base font-medium">Benefícios</Button>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 text-base font-medium">Cadastros</Button>
              </nav>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-blue-600 text-base font-medium"
              >
                Entrar
              </Button>
              <Button 
                variant="default" 
                onClick={() => navigate('/cadastro')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base font-medium shadow-md hover:shadow-lg transition-all duration-300"
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
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Transforme a Gestão do seu Negócio
              </h1>
              <p className="text-xl text-gray-700">
                Solução completa para gestão empresarial, transformando dados em resultados para o seu negócio.
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/cadastro')}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Comece Agora
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-all duration-300"
                >
                  Fale com um Consultor
                </Button>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1000"
                alt="Dashboard Preview" 
                className="relative rounded-lg shadow-2xl border-4 border-white/90 group-hover:scale-[1.02] transition-all duration-500"
              />
            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section className="py-20 bg-gray-50 border-y-2 border-gray-200">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Módulos Principais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="p-8 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 bg-white">
                <div className="flex items-center gap-4 mb-6">
                  <ClipboardList className="h-8 w-8 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Cadastros</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Cadastro de Usuários
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Cadastro de Produtos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Perfis de Acesso
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Importação em Massa
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 h-10 px-4 py-2"
                >
                  Saiba mais <ChevronRight className="h-4 w-4" />
                </Button>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 bg-white">
                <div className="flex items-center gap-4 mb-6">
                  <ShoppingCart className="h-8 w-8 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Vendas</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Pedidos de Vendas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Orçamentos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Notas Fiscais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Dashboard de Vendas
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 h-10 px-4 py-2"
                >
                  Saiba mais <ChevronRight className="h-4 w-4" />
                </Button>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 bg-white">
                <div className="flex items-center gap-4 mb-6">
                  <Package className="h-8 w-8 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Estoque</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Controle de Estoque
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Entradas e Saídas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Inventário
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Relatórios de Movimentação
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 h-10 px-4 py-2"
                >
                  Saiba mais <ChevronRight className="h-4 w-4" />
                </Button>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 bg-white">
                <div className="flex items-center gap-4 mb-6">
                  <DollarSign className="h-8 w-8 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Financeiro</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Contas a Pagar
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Contas a Receber
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Fluxo de Caixa
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                    Relatórios Financeiros
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 h-10 px-4 py-2"
                >
                  Saiba mais <ChevronRight className="h-4 w-4" />
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-20 bg-white border-y-2 border-gray-200">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
              Por Que Escolher o Liderum?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card className="p-8 bg-gray-50 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300">
                <BarChart className="h-12 w-12 text-gray-600 mb-6" />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Decisões Baseadas em Dados</h3>
                <p className="text-gray-700">
                  Dashboards interativos que permitem análises completas para tomar decisões estratégicas.
                </p>
              </Card>

              <Card className="p-8 bg-gray-50 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300">
                <Zap className="h-12 w-12 text-gray-600 mb-6" />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Aumento de Produtividade</h3>
                <p className="text-gray-700">
                  Automatize processos repetitivos e libere sua equipe para focar no que realmente importa.
                </p>
              </Card>

              <Card className="p-8 bg-gray-50 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300">
                <Users className="h-12 w-12 text-gray-600 mb-6" />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Sistema Escalável</h3>
                <p className="text-gray-700">
                  Acompanha o crescimento do seu negócio com flexibilidade para adicionar novos módulos.
                </p>
              </Card>

              <Card className="p-8 bg-gray-50 hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300">
                <Shield className="h-12 w-12 text-gray-600 mb-6" />
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Segurança Avançada</h3>
                <p className="text-gray-700">
                  Proteção total dos seus dados com controle de acesso baseado em perfis de usuário.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-y-2 border-blue-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Pronto para transformar a gestão do seu negócio?
            </h2>
            <p className="text-xl mb-12 text-blue-100">
              Comece agora com nossa versão de teste gratuita por 14 dias. Sem compromisso e com acesso a todos os módulos.
            </p>
            <div className="flex gap-6 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/cadastro')}
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-base font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                Comece agora
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-base font-medium transition-all duration-300"
              >
                Fale com um consultor
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t-2 border-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h4 className="font-semibold mb-6 text-white">Liderum</h4>
              <p className="text-gray-300">
                Solução completa para gestão empresarial, transformando dados em resultados para o seu negócio.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-white">Módulos</h4>
              <ul className="space-y-3 text-gray-300">
                <li>Cadastros</li>
                <li>Vendas</li>
                <li>Estoque</li>
                <li>Financeiro</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-white">Recursos</h4>
              <ul className="space-y-3 text-gray-300">
                <li>Demonstração</li>
                <li>Documentação</li>
                <li>Suporte</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-white">Contato</h4>
              <ul className="space-y-3 text-gray-300">
                <li>(11) 9999-9999</li>
                <li>contato@liderum.com</li>
                <li>São Paulo, SP</li>
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