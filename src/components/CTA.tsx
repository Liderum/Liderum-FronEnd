
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <div className="bg-primary py-16 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Pronto para transformar a gestão do seu negócio?
        </h2>
        <p className="text-primary-foreground text-lg mb-8 max-w-2xl mx-auto">
          Crie sua conta, pague por PIX e comece a usar na hora.
          Sem taxa de setup. Escolha o plano que cabe na sua operação.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="gap-2 group">
            Comece agora
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
            Fale com um consultor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CTA;
