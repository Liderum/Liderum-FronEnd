import { QueryClientProvider } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Receipt, Wallet } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { PAYMENTS_CSS } from '@/modules/payments/paymentStyles';
import { PaymentsContent, paymentsQueryClient } from '@/modules/payments/pages/WorkPaymentsPage';
import { ExpensesPanel } from '../components/ExpensesPanel';

type Mode = 'receipts' | 'expenses';

function VouchersContent() {
  const canReceipts = usePermission('workpayments.read');
  const canExpenses = usePermission('workvouchers.read');
  const [sp, setSp] = useSearchParams();

  const requested = sp.get('mode') === 'expenses' ? 'expenses' : 'receipts';
  const mode: Mode | null =
    requested === 'expenses' ? (canExpenses ? 'expenses' : canReceipts ? 'receipts' : null)
      : canReceipts ? 'receipts' : canExpenses ? 'expenses' : null;

  function switchMode(next: Mode) {
    if (next === mode) return;
    // Filtros são específicos de cada modo: troca de modo começa limpo.
    setSp(next === 'expenses' ? { mode: 'expenses' } : {}, { replace: true });
  }

  if (!mode) {
    return <div className="pg-empty">Você não tem permissão para ver comprovantes desta obra.</div>;
  }

  const modes: { id: Mode; label: string; icon: typeof Wallet; allowed: boolean }[] = [
    { id: 'receipts', label: 'Recebimentos do cliente', icon: Wallet, allowed: canReceipts },
    { id: 'expenses', label: 'Compras e serviços', icon: Receipt, allowed: canExpenses },
  ];
  const visible = modes.filter((m) => m.allowed);

  return (
    <div className="pg">
      {visible.length > 1 && (
        <div className="pg-seg" role="radiogroup" aria-label="Tipo de comprovante">
          {visible.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" role="radio" aria-checked={mode === id} onClick={() => switchMode(id)}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      )}
      {mode === 'receipts' ? <PaymentsContent /> : <ExpensesPanel />}
    </div>
  );
}

export default function WorkVouchersPage() {
  return (
    <QueryClientProvider client={paymentsQueryClient}>
      <style>{PAYMENTS_CSS}</style>
      <VouchersContent />
    </QueryClientProvider>
  );
}
