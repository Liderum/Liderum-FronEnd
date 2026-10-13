import { Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { BILLING_CSS } from '../styles';
import { billingQueryClient } from '../queryClient';

export function BillingShell({ children }: { children?: React.ReactNode }) {
  return (
    <QueryClientProvider client={billingQueryClient}>
      <style>{BILLING_CSS}</style>
      {children ?? <Outlet />}
    </QueryClientProvider>
  );
}
