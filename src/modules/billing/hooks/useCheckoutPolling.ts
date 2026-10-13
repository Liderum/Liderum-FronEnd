import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BillingError, BillingService, isTerminalStatus } from '@/services/billing';
import { MAX_POLL_MS, nextPollInterval } from '../lib';

/**
 * Consulta o checkout com backoff (2s → 5s → 10s) e teto de 10 min.
 * O `refetchInterval` do TanStack Query é desmontado junto com o componente, então o
 * polling é cancelado ao sair da tela; também não roda com a aba em segundo plano.
 */
export function useCheckoutPolling(id: string | undefined) {
  const startedAt = useRef(Date.now());
  const [timedOut, setTimedOut] = useState(false);

  const query = useQuery({
    queryKey: ['billing', 'checkout', id],
    enabled: !!id,
    queryFn: () => BillingService.getCheckout(id!),
    staleTime: 0,
    retry: (failures, err) => failures < 3 && err instanceof BillingError && err.retryable,
    refetchIntervalInBackground: false,
    refetchInterval: (q) => {
      const err = q.state.error;
      // 401/403/404 não se resolvem sozinhos: não adianta insistir.
      if (err instanceof BillingError && !err.retryable) return false;
      return nextPollInterval({ status: q.state.data?.status, elapsedMs: Date.now() - startedAt.current });
    },
  });

  const status = query.data?.status;
  const terminal = !!status && isTerminalStatus(status);

  useEffect(() => {
    if (terminal) return;
    const left = Math.max(0, MAX_POLL_MS - (Date.now() - startedAt.current));
    const t = setTimeout(() => setTimedOut(true), left);
    return () => clearTimeout(t);
  }, [terminal, timedOut]);

  const restart = useCallback(() => {
    startedAt.current = Date.now();
    setTimedOut(false);
    void query.refetch();
  }, [query]);

  return { ...query, terminal, timedOut: timedOut && !terminal, restart };
}
