
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Simplifique a gestão do seu negócio com a <span className="text-primary">Liderum</span>
            </h1>
            <p className="text-lg text-gray-600">
              Uma plataforma completa para gerenciar cadastros, vendas, estoque e finanças em um único lugar.
              Tenha total controle sobre seus processos e tome decisões baseadas em dados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2 group">
                Comece agora
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg">
                Agende uma demonstração
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-auto mt-6 md:mt-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg transform rotate-3"></div>
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1000" 
              alt="ERP Dashboard" 
              className="rounded-lg shadow-xl relative z-0 object-cover w-full h-full transform -rotate-2 transition-transform hover:rotate-0 duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
