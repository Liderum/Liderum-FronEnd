import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentLayout } from '@/layouts/PaymentLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, CreditCard, Smartphone, ArrowLeft, Home, Receipt, Calendar, Hash } from 'lucide-react';

export function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const success = searchParams.get('success') === 'true';
  const method = searchParams.get('method') || 'pix';
  const planPrice = searchParams.get('price') || '99.90';
  const planName = searchParams.get('name') || 'Plano Básico';
  
  // Generate transaction ID
  const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const transactionDate = new Date().toLocaleString('pt-BR');

  const getMethodIcon = () => {
    return method === 'pix' ? <Smartphone className="h-8 w-8" /> : <CreditCard className="h-8 w-8" />;
  };

  const getMethodName = () => {
    return method === 'pix' ? 'PIX' : 'Cartão de Crédito';
  };

  const handleTryAgain = () => {
    navigate(`/payments/details?method=${method}&price=${planPrice}&name=${encodeURIComponent(planName)}`);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewDetails = () => {
    setIsDetailsModalOpen(true);
  };

  return (
    <PaymentLayout showBackButton={false}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {success ? 'Pagamento confirmado!' : 'Falha no pagamento'}
            </h1>
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              {success 
                ? 'Seu pagamento foi processado com sucesso' 
                : 'Não foi possível processar seu pagamento'
              }
            </p>
          </div>
        </div>

        {/* Result Card */}
        <Card className="payment-card max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full transition-all duration-500 ${
                success ? 'bg-green-100 animate-pulse' : 'bg-red-100 animate-pulse'
              }`}>
                {success ? (
                  <CheckCircle className="h-8 w-8 text-green-600 animate-bounce" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600 animate-bounce" />
                )}
              </div>
            </div>
            <CardTitle className={`text-xl transition-all duration-500 ${
              success ? 'text-green-600' : 'text-red-600'
            }`}>
              {success ? 'Sucesso!' : 'Erro'}
            </CardTitle>
            <CardDescription>
              Valor: <span className="font-semibold text-lg">R$ {planPrice}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 transition-all duration-300 hover:bg-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Método:</span>
                <div className="flex items-center space-x-2">
                  {getMethodIcon()}
                  <span className="font-medium">{getMethodName()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">ID da Transação:</span>
                <span className="font-mono text-xs">
                  {transactionId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Data:</span>
                <span>{transactionDate}</span>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 transition-all duration-300 hover:bg-green-100">
                <p className="text-green-800 text-sm">
                  ✅ Seu plano foi ativado com sucesso!<br/>
                  Você receberá um email de confirmação em breve.
                </p>
              </div>
            )}

            {/* Error Message */}
            {!success && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 transition-all duration-300 hover:bg-red-100">
                <p className="text-red-800 text-sm">
                  ❌ Não foi possível processar o pagamento.<br/>
                  Verifique seus dados e tente novamente.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {success ? (
                <>
                  <Button
                    onClick={handleViewDetails}
                    variant="outline"
                    className="btn-animated w-full"
                  >
                    Ver detalhes da transação
                  </Button>
                  <Button
                    onClick={handleGoHome}
                    size="lg"
                    className="btn-animated w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Voltar ao início
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleTryAgain}
                    size="lg"
                    className="btn-animated w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </Button>
                  <Button
                    onClick={handleGoHome}
                    variant="outline"
                    className="btn-animated w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Voltar ao início
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          {success ? (
            <>
              <p>Obrigado por escolher o Liderum!</p>
              <p>Em caso de dúvidas, entre em contato conosco</p>
            </>
          ) : (
            <>
              <p>Problemas com o pagamento?</p>
              <p>Entre em contato com nosso suporte</p>
            </>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Detalhes da Transação</span>
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre seu pagamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Transaction Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <div className="flex items-center space-x-2">
                {success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {success ? 'Aprovado' : 'Rejeitado'}
                </span>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">ID da Transação:</span>
                </div>
                <span className="font-mono text-sm font-medium">{transactionId}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Método:</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getMethodIcon()}
                  <span className="text-sm font-medium">{getMethodName()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Receipt className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Plano:</span>
                </div>
                <span className="text-sm font-medium">{planName}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💰</span>
                  <span className="text-sm text-gray-600">Valor:</span>
                </div>
                <span className="text-lg font-bold text-blue-600">R$ {planPrice}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Data:</span>
                </div>
                <span className="text-sm font-medium">{transactionDate}</span>
              </div>
            </div>

            {/* Additional Info */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  ✅ Pagamento processado com sucesso!<br/>
                  Seu plano foi ativado e você receberá um email de confirmação.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PaymentLayout>
  );
}
