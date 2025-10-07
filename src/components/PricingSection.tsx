import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Users, Package, ShoppingCart, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const PricingSection = () => {
  const pricingPlans = [
    {
      name: "Cadastros",
      price: "R$ 29",
      period: "/mês",
      description: "Gerencie usuários, clientes, fornecedores e produtos",
      icon: <Users className="w-8 h-8 text-blue-500" />,
      color: "border-blue-200 hover:border-blue-300",
      badge: null,
      features: [
        "Cadastro de Usuários",
        "Cadastro de Produtos", 
        "Perfis de Acesso",
        "Importação em Massa",
        "Relatórios Básicos",
        "Suporte por Email"
      ],
      buttonText: "Começar Agora",
      popular: false
    },
    {
      name: "Vendas",
      price: "R$ 49",
      period: "/mês",
      description: "Controle todo o processo de vendas e emissão de notas fiscais",
      icon: <ShoppingCart className="w-8 h-8 text-green-500" />,
      color: "border-green-200 hover:border-green-300",
      badge: "Mais Popular",
      features: [
        "Pedidos de Vendas",
        "Orçamentos",
        "Notas Fiscais",
        "Dashboard de Vendas",
        "Integração com Marketplaces",
        "Relatórios Avançados",
        "Suporte Prioritário"
      ],
      buttonText: "Escolher Plano",
      popular: true
    },
    {
      name: "Estoque",
      price: "R$ 39",
      period: "/mês",
      description: "Acompanhe seu estoque em tempo real com alertas inteligentes",
      icon: <Package className="w-8 h-8 text-orange-500" />,
      color: "border-orange-200 hover:border-orange-300",
      badge: null,
      features: [
        "Controle de Estoque",
        "Entradas e Saídas",
        "Inventário Automático",
        "Alertas de Nível Baixo",
        "Relatórios de Movimentação",
        "Integração com Vendas",
        "Suporte por Email"
      ],
      buttonText: "Começar Agora",
      popular: false
    },
    {
      name: "Financeiro",
      price: "Em Breve",
      period: "",
      description: "Visualize a saúde financeira e automatize tarefas de pagamento",
      icon: <Wallet className="w-8 h-8 text-purple-500" />,
      color: "border-purple-200 hover:border-purple-300",
      badge: "Em Desenvolvimento",
      features: [
        "Contas a Pagar",
        "Contas a Receber", 
        "Fluxo de Caixa",
        "Relatórios Financeiros",
        "Integração Bancária",
        "Dashboard Financeiro",
        "Suporte Premium"
      ],
      buttonText: "Avisar Lançamento",
      popular: false,
      comingSoon: true
    }
  ];

  const bundlePlans = [
    {
      name: "Pacote Completo",
      price: "R$ 99",
      period: "/mês",
      originalPrice: "R$ 117",
      description: "Todos os módulos disponíveis com desconto especial",
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      color: "border-yellow-200 hover:border-yellow-300",
      badge: "Economia de 15%",
      features: [
        "Todos os módulos de Cadastros",
        "Todos os módulos de Vendas", 
        "Todos os módulos de Estoque",
        "Módulo Financeiro (quando disponível)",
        "Suporte Premium",
        "Treinamento Personalizado",
        "Integração Completa"
      ],
      buttonText: "Escolher Pacote",
      popular: false,
      bundle: true
    }
  ];

  return (
    <div className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50" id="precos">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Planos e Preços dos Módulos
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Escolha o módulo ideal para sua empresa ou aproveite nosso pacote completo com desconto especial.
          </p>
          
          {/* Badge de destaque */}
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 mr-2" />
            Sem taxa de instalação • Cancelamento a qualquer momento
          </div>
        </motion.div>

        {/* Módulos Individuais */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">Módulos Individuais</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <Card className={`h-full ${plan.color} ${plan.popular ? 'ring-2 ring-green-500 shadow-lg' : ''}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge 
                        variant={plan.popular ? "default" : "secondary"}
                        className={plan.popular ? "bg-green-500" : "bg-purple-100 text-purple-800"}
                      >
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-full w-fit">
                      {plan.icon}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center pb-4">
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    
                    <ul className="space-y-3 text-left">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-green-500 hover:bg-green-600' : ''}`}
                      variant={plan.popular ? "default" : "outline"}
                      disabled={plan.comingSoon}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pacote Completo */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">Pacote Completo</h3>
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-md"
            >
              <Card className={`h-full ${bundlePlans[0].color} ring-2 ring-yellow-500 shadow-xl`}>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default" className="bg-yellow-500">
                    {bundlePlans[0].badge}
                  </Badge>
                </div>
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-yellow-50 rounded-full w-fit">
                    {bundlePlans[0].icon}
                  </div>
                  <CardTitle className="text-2xl">{bundlePlans[0].name}</CardTitle>
                  <CardDescription className="text-base">{bundlePlans[0].description}</CardDescription>
                </CardHeader>
                
                <CardContent className="text-center pb-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-4xl font-bold text-gray-900">{bundlePlans[0].price}</span>
                      <span className="text-gray-600">{bundlePlans[0].period}</span>
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      {bundlePlans[0].originalPrice}/mês
                    </div>
                  </div>
                  
                  <ul className="space-y-3 text-left">
                    {bundlePlans[0].features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                    {bundlePlans[0].buttonText}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-white rounded-lg p-8 shadow-sm border">
            <h4 className="text-xl font-semibold mb-4 text-gray-900">Por que escolher a Liderum?</h4>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Sem taxa de instalação</span>
              </div>
              <div className="flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Cancelamento a qualquer momento</span>
              </div>
              <div className="flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span>Suporte especializado</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingSection;
