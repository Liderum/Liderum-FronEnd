
import React from 'react';
import { ChartPie, ArrowRight, Users, Clock, ShieldCheck, Gauge } from "lucide-react";
import { Button } from '@/components/ui/button';

const Beneficios = () => {
  const beneficios = [
    {
      icon: <ChartPie className="w-10 h-10 text-primary" />,
      title: "Decisões Baseadas em Dados",
      description: "Dashboards interativos que permitem análises completas para tomar decisões estratégicas."
    },
    {
      icon: <Clock className="w-10 h-10 text-primary" />,
      title: "Aumento de Produtividade",
      description: "Automatize processos repetitivos e libere sua equipe para focar no que realmente importa."
    },
    {
      icon: <Gauge className="w-10 h-10 text-primary" />,
      title: "Sistema Escalável",
      description: "Acompanha o crescimento do seu negócio com flexibilidade para adicionar novos módulos."
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-primary" />,
      title: "Segurança Avançada",
      description: "Proteção total dos seus dados com controle de acesso baseado em perfis de usuário."
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: "Facilidade de Uso",
      description: "Interface intuitiva que permite rápida adaptação e treinamento da sua equipe."
    },
  ];

  return (
    <div className="py-20 px-6 bg-gradient-to-b from-white to-blue-50" id="beneficios">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Por Que Escolher a Liderum?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Descubra como nossa solução pode transformar a gestão do seu negócio e proporcionar
            resultados reais em pouco tempo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {beneficios.map((beneficio, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="mb-4">{beneficio.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{beneficio.title}</h3>
              <p className="text-gray-600">{beneficio.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Button size="lg" className="gap-2 group">
            Solicite uma proposta
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Beneficios;
