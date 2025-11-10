import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentLayout } from '@/layouts/PaymentLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentMethod } from '@/types/payment';
import { CreditCard, Smartphone, Copy, CheckCircle, RotateCcw } from 'lucide-react';
import { CreditCardVisual } from '@/components/CreditCardVisual';

const paymentMethods: PaymentMethod[] = [
  {
    id: 'pix',
    name: 'PIX',
    type: 'pix',
    icon: '📱',
    description: 'Pagamento instantâneo e seguro'
  },
  {
    id: 'credit_card',
    name: 'Cartão de Crédito',
    type: 'credit_card',
    icon: '💳',
    description: 'Visa, Mastercard, Elo e outros'
  }
];

export function PaymentDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const methodId = searchParams.get('method') || 'pix';
  
  // Get plan data from URL params
  const planId = searchParams.get('plan') || 'basic';
  const planPrice = searchParams.get('price') || '99.90';
  const planName = searchParams.get('name') || 'Plano Básico';
  
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [copied, setCopied] = useState(false);
  const [showCardBack, setShowCardBack] = useState(false);

  const selectedMethod = paymentMethods.find(m => m.id === methodId);

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      // Remove non-digits and add spaces every 4 digits
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (field === 'expiry') {
      // Format as MM/YY
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/');
    } else if (field === 'cvv') {
      // Only allow 3-4 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Show card back when CVV field is focused or has content
    if (field === 'cvv') {
      setShowCardBack(value.length > 0);
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText('00020126330014BR.GOV.BCB.PIX0114+551199999999952040000530398654050.005802BR5913LIDERUM LTDA6009SAO PAULO62070503***6304');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayment = () => {
    if (selectedMethod?.type === 'pix') {
      navigate(`/payments/processing?method=pix&plan=${planId}&price=${planPrice}&name=${encodeURIComponent(planName)}`);
    } else {
      // Validate card data
      if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
        alert('Por favor, preencha todos os campos do cartão');
        return;
      }
      navigate(`/payments/processing?method=credit_card&plan=${planId}&price=${planPrice}&name=${encodeURIComponent(planName)}`);
    }
  };

  const isCardValid = cardData.number && cardData.name && cardData.expiry && cardData.cvv;

  return (
    <PaymentLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {selectedMethod?.type === 'pix' ? 'Pagamento via PIX' : 'Dados do Cartão'}
            </h1>
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              {selectedMethod?.type === 'pix' 
                ? 'Escaneie o QR Code ou copie o código PIX' 
                : 'Preencha os dados do seu cartão de crédito'
              }
            </p>
          </div>
        </div>

        {/* Payment Content */}
        {selectedMethod?.type === 'pix' ? (
          <Card className="payment-card max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">PIX Instantâneo</CardTitle>
              <CardDescription>
                Valor: <span className="font-semibold text-lg">R$ {planPrice}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Placeholder */}
              <div className="bg-gray-100 rounded-lg p-8 text-center transition-all duration-300 hover:bg-gray-200">
                <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center transition-all duration-300 hover:border-blue-400 hover:shadow-lg">
                  <div className="text-center">
                    <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-2 transition-transform duration-300 hover:scale-110" />
                    <p className="text-sm text-gray-500">QR Code PIX</p>
                  </div>
                </div>
              </div>

              {/* PIX Code */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Código PIX:</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value="00020126330014BR.GOV.BCB.PIX0114+551199999999952040000530398654050.005802BR5913LIDERUM LTDA6009SAO PAULO62070503***6304"
                    readOnly
                    className="text-xs font-mono transition-all duration-300 hover:bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPixCode}
                    className="flex items-center space-x-1 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </Button>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                size="lg"
                className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Já paguei
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Credit Card Visual */}
            <div className="flex justify-center">
              <CreditCardVisual cardData={cardData} isFlipped={showCardBack} />
            </div>

            {/* Card Form */}
            <Card className="payment-card max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>Dados do Cartão</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCardBack(!showCardBack)}
                    className="flip-trigger"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Virar Cartão
                  </Button>
                </CardTitle>
                <CardDescription>
                  Valor: <span className="font-semibold text-lg">R$ {planPrice}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) => handleCardInputChange('number', e.target.value)}
                      maxLength={19}
                      className="input-animated"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nome do titular</Label>
                    <Input
                      id="cardName"
                      placeholder="João Silva"
                      value={cardData.name}
                      onChange={(e) => handleCardInputChange('name', e.target.value)}
                      className="input-animated"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Validade</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                        maxLength={5}
                        className="input-animated"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cardData.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                        maxLength={4}
                        className="input-animated"
                        onFocus={() => setShowCardBack(true)}
                        onBlur={() => setShowCardBack(cardData.cvv.length > 0)}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={!isCardValid}
                  size="lg"
                  className={`btn-animated w-full ${
                    isCardValid 
                      ? '' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar agora
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Info */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Transação protegida por SSL</span>
          </div>
          <p>Seus dados são criptografados e seguros</p>
        </div>
      </div>
    </PaymentLayout>
  );
}
