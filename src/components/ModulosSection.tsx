
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, CalendarClock, DollarSign, BookOpen } from "lucide-react";

const ModulosSection = () => {
  const modulos = [
    {
      title: "Obras",
      description: "Centralize obras, clientes, responsáveis e status em um único painel operacional.",
      icon: <Building2 className="w-10 h-10 text-primary" />,
      features: ["Listagem e filtros", "Indicadores de prazo e custo", "Alertas de risco", "Visão executiva"]
    },
    {
      title: "Cronograma",
      description: "Acompanhe etapas, dependências e bloqueios com linha do tempo clara para a equipe.",
      icon: <CalendarClock className="w-10 h-10 text-primary" />,
      features: ["Timeline por obra", "Progresso por etapa", "Tarefas bloqueadas", "Risco de atraso"]
    },
    {
      title: "Orçamento",
      description: "Compare previsto x realizado por categoria e mantenha a margem sob controle.",
      icon: <DollarSign className="w-10 h-10 text-primary" />,
      features: ["Itens por categoria", "Variação e margem", "Mão de obra e materiais", "Visão consolidada"]
    },
    {
      title: "Diário de obra",
      description: "Registre o dia a dia com fotos, problemas e responsáveis — histórico auditável.",
      icon: <BookOpen className="w-10 h-10 text-primary" />,
      features: ["Linha do tempo por data", "Fotos e descrições", "Problemas e ações", "Rastreabilidade"]
    }
  ];

  return (
    <div className="py-20 px-6 bg-white" id="modulos">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Módulos para gestão de obras</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A Liderum reúne o que importa na obra: planejamento, execução, custos e registro diário,
            com uma visão única para sua equipe.
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
