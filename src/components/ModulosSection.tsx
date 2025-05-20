
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Package, ShoppingCart, Wallet } from "lucide-react";

const ModulosSection = () => {
  const modulos = [
    {
      title: "Cadastros",
      description: "Gerencie usuários, clientes, fornecedores e produtos em uma interface intuitiva e organizada.",
      icon: <Users className="w-10 h-10 text-primary" />,
      features: ["Cadastro de Usuários", "Cadastro de Produtos", "Perfis de Acesso", "Importação em Massa"]
    },
    {
      title: "Vendas",
      description: "Controle todo o processo de vendas, desde orçamentos até a emissão de notas fiscais.",
      icon: <ShoppingCart className="w-10 h-10 text-primary" />,
      features: ["Pedidos de Vendas", "Orçamentos", "Notas Fiscais", "Dashboard de Vendas"]
    },
    {
      title: "Estoque",
      description: "Acompanhe seu estoque em tempo real, com alertas de nível baixo e gestão de movimentações.",
      icon: <Package className="w-10 h-10 text-primary" />,
      features: ["Controle de Estoque", "Entradas e Saídas", "Inventário", "Relatórios de Movimentação"]
    },
    {
      title: "Financeiro",
      description: "Visualize a saúde financeira da sua empresa e automatize tarefas de pagamento e recebimento.",
      icon: <Wallet className="w-10 h-10 text-primary" />,
      features: ["Contas a Pagar", "Contas a Receber", "Fluxo de Caixa", "Relatórios Financeiros"]
    }
  ];

  return (
    <div className="py-20 px-6 bg-white" id="modulos">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Módulos Completos para Seu Negócio</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A Liderum oferece módulos integrados que cobrem todas as principais áreas da sua empresa,
            proporcionando uma visão completa e centralizada.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {modulos.map((modulo, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mb-4">{modulo.icon}</div>
                <CardTitle>{modulo.title}</CardTitle>
                <CardDescription className="text-sm">{modulo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {modulo.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Saiba mais</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModulosSection;
