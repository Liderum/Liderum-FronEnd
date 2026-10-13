import { useEffect } from 'react';

/** Pede confirmação do navegador ao fechar/recarregar a aba enquanto `active` (ex.: criando cobrança). */
export function useBeforeUnloadGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active]);
}
