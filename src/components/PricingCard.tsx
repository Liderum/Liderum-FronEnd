import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, ArrowRight } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  planId: string;
}

export function PricingCard({ 
  title, 
  price, 
  description, 
  features, 
  isPopular = false,
  planId 
}: PricingCardProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
    
    // Navigate to payment with plan data
    navigate(`/payments?plan=${planId}&price=${price}&name=${encodeURIComponent(title)}`);
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
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-lg">{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-blue-600">R$ {price.toFixed(2)}</span>
          <span className="text-gray-500 ml-2">/mês</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
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
