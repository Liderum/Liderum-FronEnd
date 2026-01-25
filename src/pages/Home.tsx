import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  ArrowRight, 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Dashboard",
      description: "Visão geral do seu sistema",
      icon: BarChart3,
      path: "/dashboard",
      color: "bg-blue-500"
    },
    {
      title: "Vendas",
      description: "Gerencie suas vendas online",
      icon: ShoppingCart,
      path: "/sales",
      color: "bg-green-500"
    },
    {
      title: "Estoque",
      description: "Controle de inventário",
      icon: Package,
      path: "/inventory",
      color: "bg-orange-500"
    },
    {
      title: "Faturamento",
      description: "Gestão de vendas",
      icon: Users,
      path: "/billing",
      color: "bg-purple-500"
    }
  ];

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Bem-vindo ao Liderum!</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Olá <span className="font-semibold text-primary">{user?.name}</span>! 
          Seu login foi realizado com sucesso. Escolha uma das opções abaixo para começar.
        </p>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 shadow-md"
              onClick={() => handleQuickAction(action.path)}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAction(action.path);
                  }}
                >
                  Acessar
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Integrações de Vendas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-2 hover:border-primary/50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Integrações de Vendas Online
            </CardTitle>
            <CardDescription>
              Conecte suas lojas online e gerencie todas as vendas em um só lugar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mercado Livre */}
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 font-bold text-sm">ML</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Mercado Livre</h3>
                      <p className="text-sm text-gray-500">Marketplace líder</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Conectado</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Produtos:</span>
                    <span className="font-medium">24 ativos</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Vendas hoje:</span>
                    <span className="font-medium text-green-600">R$ 1.250,00</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Gerenciar Produtos
                </Button>
              </div>

              {/* Amazon */}
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">AZ</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Amazon</h3>
                      <p className="text-sm text-gray-500">Marketplace global</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-yellow-600 font-medium">Pendente</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Produtos:</span>
                    <span className="font-medium">0 ativos</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Configuração:</span>
                    <span className="font-medium text-blue-600">Necessária</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Configurar Integração
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>           

      {/* Footer Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center"
      >
        <p className="text-sm text-gray-500 mb-4">
          Precisa de ajuda? Consulte nossa documentação ou entre em contato com o suporte.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="sm">
            Documentação
          </Button>
          <Button variant="outline" size="sm">
            Suporte
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
