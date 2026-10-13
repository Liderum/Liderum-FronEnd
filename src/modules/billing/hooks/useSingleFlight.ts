import { useCallback, useRef, useState } from 'react';

/**
 * Guarda single-flight: ignora chamadas enquanto uma anterior não terminou.
 * O ref bloqueia cliques no MESMO tick (antes do re-render aplicar `disabled`);
 * o state só serve para a UI (spinner/disabled).
 */
export function useSingleFlight<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (...args: A): Promise<R | undefined> => {
      if (inFlight.current) return undefined;
      inFlight.current = true;
      setPending(true);
      try {
        return await fn(...args);
      } finally {
        inFlight.current = false;
        setPending(false);
      }
    },
    [fn],
  );

  return { run, pending };
}
