import { Shield, Lock } from 'lucide-react';

export function PaymentFooter() {
  return (
    <footer className="bg-white/70 backdrop-blur-md border-t border-gray-200/50 mt-auto">
      <div className="container mx-auto px-6 py-6">
        <div className="text-center space-y-4">
          {/* Security badges */}
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="font-medium">SSL 256-bit</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="h-4 w-4 text-blue-600" />
              <span className="font-medium">PCI DSS</span>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-sm text-gray-600">
            <p>© 2025 Liderum. Todos os direitos reservados.</p>
            <p className="mt-1">Pagamentos processados com segurança máxima</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
