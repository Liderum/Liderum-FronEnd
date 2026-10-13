import { QueryClient } from '@tanstack/react-query';

// O app não tem QueryClientProvider global; o módulo de cobrança usa o próprio (banner, checkout, planos, assinatura).
export const billingQueryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: true, staleTime: 15_000 } },
});
