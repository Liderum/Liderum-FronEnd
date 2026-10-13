import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Clock, X } from 'lucide-react';
import { BillingService } from '@/services/billing';
import { useAuth } from '@/contexts/AuthContext';
import { PAYMENTS_PERMISSIONS } from '@/constants/permissions';
import { billingQueryClient } from '../queryClient';
import { BILLING_CSS } from '../styles';
import { bannerMessage } from '../lib';

const RENEWAL_WARNING_DAYS = 7;
const DISMISS_KEY = 'liderum.billing.banner.dismissed';

function Inner() {
  const { permissions } = useAuth();
  const allowed = permissions.includes(PAYMENTS_PERMISSIONS.SUBSCRIPTION_READ);
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
  });
  const q = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => BillingService.getSubscription(),
    enabled: allowed,
  });
  const sub = q.data;
  if (!allowed || dismissed || !sub || sub.daysRemaining === null || sub.daysRemaining > RENEWAL_WARNING_DAYS) return null;
  const overdue = sub.daysRemaining < 0;

  return (
    <div className={`bl-alert ${overdue ? 'bl-alert-err' : 'bl-alert-gold'}`} role="status" data-testid="subscription-banner" style={{ marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>
      <Clock size={18} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        {bannerMessage(sub.daysRemaining, sub.graceEndsAt)}{' '}
        <Link to={`/billing/plans?plan=${encodeURIComponent(sub.planCode)}`} className="bl-btn bl-btn-primary" style={{ marginLeft: 8, minHeight: 32, padding: '5px 14px' }}>
          Renovar agora
        </Link>
      </div>
      <button
        type="button" aria-label="Dispensar aviso" className="bl-btn bl-btn-ghost" style={{ minHeight: 28, padding: 4 }}
        onClick={() => { setDismissed(true); try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* conveniência */ } }}
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}

/** Aviso "sua assinatura vence em N dias" (daysRemaining <= 7). Traz o próprio provider de queries. */
export function SubscriptionBanner() {
  return (
    <QueryClientProvider client={billingQueryClient}>
      <style>{BILLING_CSS}</style>
      <Inner />
    </QueryClientProvider>
  );
}
