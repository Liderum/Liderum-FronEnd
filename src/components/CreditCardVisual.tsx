import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';

interface CreditCardVisualProps {
  cardData: {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
  };
  isFlipped?: boolean;
}

export function CreditCardVisual({ cardData, isFlipped = false }: CreditCardVisualProps) {
  const [flipped, setFlipped] = useState(isFlipped);

  useEffect(() => {
    setFlipped(isFlipped);
  }, [isFlipped]);

  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').padEnd(19, '•');
  };

  const formatExpiry = (expiry: string) => {
    return expiry || 'MM/AA';
  };

  return (
    <div className="relative w-80 h-48 mx-auto perspective-1000">
      {/* Card Container */}
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          flipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of Card */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="relative w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Card Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-full"></div>
              <div className="absolute top-8 right-8 w-8 h-8 bg-white rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-full"></div>
            </div>
            
            {/* Card Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
              {/* Top Section */}
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-6 w-6" />
                  <span className="font-semibold text-sm">LIDERUM</span>
                </div>
                <div className="text-xs opacity-80">CREDIT</div>
              </div>

              {/* Card Number */}
              <div className="space-y-2">
                <div className="text-lg font-mono tracking-wider">
                  {formatCardNumber(cardData.number)}
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-xs opacity-80">CARDHOLDER NAME</div>
                    <div className="text-sm font-medium uppercase">
                      {cardData.name || 'YOUR NAME'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs opacity-80">EXPIRES</div>
                    <div className="text-sm font-medium">
                      {formatExpiry(cardData.expiry)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="relative w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Magnetic Strip */}
            <div className="absolute top-6 left-0 right-0 h-12 bg-black"></div>
            
            {/* CVV Section */}
            <div className="absolute top-24 left-4 right-4">
              <div className="bg-white rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-600">CVV</div>
                  <div className="text-lg font-mono tracking-wider text-gray-800">
                    {cardData.cvv || '•••'}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Info */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="text-xs text-white opacity-80 text-center">
                This card is property of Liderum. If found, please return to the nearest branch.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
