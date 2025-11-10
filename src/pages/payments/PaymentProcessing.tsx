import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentLayout } from '@/layouts/PaymentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Smartphone } from 'lucide-react';

export function PaymentProcessing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method') || 'pix';
  const planPrice = searchParams.get('price') || '99.90';
  const planName = searchParams.get('name') || 'Plano Básico';
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Simulate random success/failure
          const success = Math.random() > 0.2; // 80% success rate
          navigate(`/payments/result?success=${success}&method=${method}&price=${planPrice}&name=${encodeURIComponent(planName)}`);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [navigate, method]);

  const getMethodIcon = () => {
    return method === 'pix' ? <Smartphone className="h-8 w-8" /> : <CreditCard className="h-8 w-8" />;
  };

  const getMethodName = () => {
    return method === 'pix' ? 'PIX' : 'Cartão de Crédito';
  };

  return (
    <PaymentLayout showBackButton={false}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Processando pagamento
            </h1>
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              Aguarde enquanto processamos seu pagamento via {getMethodName()}
            </p>
          </div>
        </div>

        {/* Processing Card */}
        <Card className="payment-card max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full animate-pulse">
                {getMethodIcon()}
              </div>
            </div>
            <CardTitle className="text-xl">Processando...</CardTitle>
            <CardDescription>
              Valor: <span className="font-semibold text-lg">R$ {planPrice}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Loading Animation */}
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <div className="absolute inset-0 h-8 w-8 border-2 border-blue-200 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Status Messages */}
            <div className="space-y-2 text-center text-sm text-gray-600">
              <div className="transition-all duration-500">
                {progress < 30 && <p className="animate-fade-in">Validando dados...</p>}
                {progress >= 30 && progress < 60 && <p className="animate-fade-in">Conectando com o banco...</p>}
                {progress >= 60 && progress < 90 && <p className="animate-fade-in">Processando transação...</p>}
                {progress >= 90 && <p className="animate-fade-in">Finalizando pagamento...</p>}
              </div>
            </div>

            {/* Security Info */}
            <div className="text-center text-xs text-gray-500 bg-gray-50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-100">
              <p className="flex items-center justify-center space-x-2">
                <span className="animate-pulse">🔒</span>
                <span>Transação protegida por SSL 256-bit</span>
              </p>
              <p>Não feche esta página durante o processamento</p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Este processo pode levar alguns segundos</p>
          <p>Você será redirecionado automaticamente</p>
        </div>
      </div>
    </PaymentLayout>
  );
}
