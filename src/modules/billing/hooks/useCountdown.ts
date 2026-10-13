import { useEffect, useState } from 'react';

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** Milissegundos restantes até `target` (atualiza a cada segundo; para ao zerar). */
export function useCountdown(target: Date | null): number | null {
  const [now, setNow] = useState(() => Date.now());
  const targetMs = target?.getTime() ?? null;

  useEffect(() => {
    if (targetMs === null) return;
    setNow(Date.now());
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= targetMs) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [targetMs]);

  return targetMs === null ? null : Math.max(0, targetMs - now);
}
