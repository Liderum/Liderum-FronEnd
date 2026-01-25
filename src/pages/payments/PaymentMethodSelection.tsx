import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentLayout } from '@/layouts/PaymentLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentMethod } from '@/types/payment';
import { CreditCard, Smartphone, CheckCircle } from 'lucide-react';

const paymentMethods: PaymentMethod[] = [
  {
    id: 'pix',
    name: 'PIX',
    type: 'pix',
    icon: '📱',
    description: 'Pagamento instantâneo e seguro'
  }
  // {
  //   id: 'credit_card',
  //   name: 'Cartão de Crédito',
  //   type: 'credit_card',
  //   icon: '💳',
  //   description: 'Visa, Mastercard, Elo e outros'
  // }
];

export function PaymentMethodSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  // Get plan data from URL params
  const planId = searchParams.get('plan') || 'basic';
  const planPrice = searchParams.get('price') || '99.90';
  const planName = searchParams.get('name') || 'Plano Básico';

  const handleContinue = () => {
    if (selectedMethod) {
      navigate(`/payments/details?method=${selectedMethod}&plan=${planId}&price=${planPrice}&name=${encodeURIComponent(planName)}`);
    }
  };

  return (
    <PaymentLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Escolha a forma de pagamento
            </h1>
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              Selecione como você deseja pagar pelo seu plano
            </p>
          </div>
          
          {/* Plan Info */}
          <div className="bg-white rounded-2xl p-6 max-w-md mx-auto border border-gray-200 shadow-lg">
            <h3 className="font-bold text-blue-900 text-lg">{planName}</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">R$ {planPrice}</p>
            <p className="text-sm text-blue-700 font-medium">por mês</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {paymentMethods.map((method, index) => (
            <Card
              key={method.id}
              className={`payment-method-card cursor-pointer ${
                selectedMethod === method.id
                  ? 'selected pulse-glow'
                  : 'hover:border-blue-300'
              }`}
              onClick={() => setSelectedMethod(method.id)}
              style={{
                animationDelay: `${index * 200}ms`,
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4 float-animation">
                  {method.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{method.name}</CardTitle>
                <CardDescription className="text-base">{method.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                {selectedMethod === method.id && (
                  <div className="flex items-center justify-center text-blue-600 font-medium animate-pulse">
                    <CheckCircle className="h-6 w-6 mr-2" />
                    <span className="text-lg">Selecionado</span>
                  </div>
                )}
                {!selectedMethod && (
                  <div className="text-gray-400 text-sm">
                    Clique para selecionar
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleContinue}
            disabled={!selectedMethod}
            size="lg"
            className={`btn-animated px-12 py-3 text-lg font-semibold ${
              selectedMethod 
                ? 'animate-pulse-glow' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Continuar
          </Button>
        </div>

        {/* Security Info */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>Pagamento 100% seguro</span>
          </div>
          <p>Seus dados são protegidos com criptografia SSL</p>
        </div>
      </div>
    </PaymentLayout>
  );
}
