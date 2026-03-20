import { Shield, Lock } from 'lucide-react';

export function PaymentFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium">SSL 256-bit</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-primary" />
              <span className="font-medium">PCI DSS</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>© 2025 Liderum. Todos os direitos reservados.</p>
            <p className="mt-1">Pagamentos processados com segurança máxima</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
