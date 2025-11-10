import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react';
import { PaymentFooter } from '@/components/PaymentFooter';

interface PaymentLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  backTo?: string;
}

export function PaymentLayout({ children, showBackButton = true, backTo = '/' }: PaymentLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(backTo)}
                  className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:bg-blue-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">Liderum</span>
                  <span className="text-sm text-gray-500 ml-2">Pagamentos</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-full">
              <Smartphone className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-700">Pagamento Seguro</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <PaymentFooter />
    </div>
  );
}
