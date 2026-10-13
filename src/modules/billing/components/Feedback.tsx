import { AlertCircle, Loader2 } from 'lucide-react';
import type { BillingError } from '@/services/billing';

export function ErrorBanner({ error, onRetry }: { error: BillingError | Error | null; onRetry?: () => void }) {
  if (!error) return null;
  return (
    <div className="bl-alert bl-alert-err" role="alert">
      <AlertCircle size={18} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <div>{error.message}</div>
        {onRetry && (
          <button type="button" className="bl-btn bl-btn-ghost" style={{ padding: '6px 0', minHeight: 0, marginTop: 6, color: 'inherit', textDecoration: 'underline' }} onClick={onRetry}>
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <span role="status" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <Loader2 size={15} className="animate-spin" aria-hidden /> {label}
    </span>
  );
}
