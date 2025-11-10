// Exemplo de como integrar o fluxo de pagamento na LandingPage
// Substitua a seção de preços existente por este código:

import { PricingCard } from '@/components/PricingCard';

// Dentro do componente LandingPage, substitua a seção de preços por:

{/_ Pricing Section _/}

<section id="precos" className="py-20 bg-gray-50">
  <div className="container mx-auto px-4">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Escolha seu plano
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Planos flexíveis para empresas de todos os tamanhos. 
        Comece grátis e escale conforme sua necessidade.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <PricingCard
        title="Plano Básico"
        price={99.90}
        description="Ideal para pequenas empresas"
        features={[
          'Até 5 usuários',
          'Módulos básicos',
          'Suporte por email',
          'Relatórios simples'
        ]}
        planId="basic"
      />
      
      <PricingCard
        title="Plano Profissional"
        price={199.90}
        description="Para empresas em crescimento"
        features={[
          'Até 20 usuários',
          'Todos os módulos',
          'Suporte prioritário',
          'Relatórios avançados',
          'Integração com APIs'
        ]}
        isPopular
        planId="professional"
      />
      
      <PricingCard
        title="Plano Enterprise"
        price={399.90}
        description="Para grandes corporações"
        features={[
          'Usuários ilimitados',
          'Todos os módulos',
          'Suporte 24/7',
          'Relatórios personalizados',
          'Integração completa',
          'Treinamento dedicado'
        ]}
        planId="enterprise"
      />
    </div>
    
    <div className="text-center mt-12">
      <p className="text-gray-600 mb-4">
        Precisa de um plano personalizado?
      </p>
      <Button variant="outline" size="lg">
        Fale com nossos especialistas
      </Button>
    </div>
  </div>
</section>
