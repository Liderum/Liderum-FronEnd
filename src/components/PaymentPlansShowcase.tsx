import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentPlan } from '@/types/payment';
import { CheckCircle, CreditCard, ArrowRight } from 'lucide-react';

interface PaymentPlanCardProps {
  plan: PaymentPlan;
  isPopular?: boolean;
}

const mockPlans: PaymentPlan[] = [
  {
    id: 'basic',
    name: 'Plano Básico',
    price: 99.90,
    description: 'Ideal para pequenas empresas',
    features: [
      'Até 5 usuários',
      'Módulos básicos',
      'Suporte por email',
      'Relatórios simples'
    ]
  },
  {
    id: 'professional',
    name: 'Plano Profissional',
    price: 199.90,
    description: 'Para empresas em crescimento',
    features: [
      'Até 20 usuários',
      'Todos os módulos',
      'Suporte prioritário',
      'Relatórios avançados',
      'Integração com APIs'
    ]
  },
  {
    id: 'enterprise',
    name: 'Plano Enterprise',
    price: 399.90,
    description: 'Para grandes corporações',
    features: [
      'Usuários ilimitados',
      'Todos os módulos',
      'Suporte 24/7',
      'Relatórios personalizados',
      'Integração completa',
      'Treinamento dedicado'
    ]
  }
];

export function PaymentPlanCard({ plan, isPopular = false }: PaymentPlanCardProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
    
    // Navigate to payment with plan data
    navigate(`/payments?plan=${plan.id}&price=${plan.price}&name=${encodeURIComponent(plan.name)}`);
  };

  return (
    <Card className={`relative transition-all duration-300 hover:shadow-xl ${
      isPopular ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Mais Popular
          </span>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-lg">{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-blue-600">R$ {plan.price.toFixed(2)}</span>
          <span className="text-gray-500 ml-2">/mês</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          size="lg"
          className={`w-full ${
            isPopular 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-900 hover:bg-gray-800'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Assinar Agora
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
        
        <p className="text-center text-sm text-gray-500">
          ✓ Teste grátis por 14 dias<br/>
          ✓ Cancele a qualquer momento
        </p>
      </CardContent>
    </Card>
  );
}

export function PaymentPlansShowcase() {
  return (
    <div className="py-20 bg-gray-50">
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
          <PaymentPlanCard plan={mockPlans[0]} />
          <PaymentPlanCard plan={mockPlans[1]} isPopular />
          <PaymentPlanCard plan={mockPlans[2]} />
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
    </div>
  );
}
