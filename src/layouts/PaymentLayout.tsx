import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, ShieldCheck } from 'lucide-react';
import { PaymentFooter } from '@/components/PaymentFooter';

interface PaymentLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  backTo?: string;
}

export function PaymentLayout({ children, showBackButton = true, backTo = '/' }: PaymentLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(backTo)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
                aria-label="Voltar para a página inicial"
              >
                <span className="rounded-md border border-border p-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight">Liderum</span>
                  <span className="text-xs text-muted-foreground">Pagamentos</span>
                </div>
              </button>
            </div>
            
            <div className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground sm:flex">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Pagamento seguro</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </div>
      </main>

      <PaymentFooter />
    </div>
  );
}
