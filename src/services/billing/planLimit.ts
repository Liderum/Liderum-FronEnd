import axios from 'axios';

export type PlanLimitResource = 'works' | 'members' | 'storage';

export interface PlanLimitInfo {
  resource: PlanLimitResource;
  limit: number | null;
  current: number | null;
  planCode: string | null;
}

/** Erro de domínio para o limite do plano: os services o lançam no lugar do Error genérico. */
export class PlanLimitError extends Error {
  constructor(public info: PlanLimitInfo) {
    super('Limite do plano atingido.');
    this.name = 'PlanLimitError';
  }
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/**
 * Reconhece o 403 `PLAN_LIMIT_REACHED` (ProblemDetails). O ASP.NET serializa `extensions` no topo do
 * corpo, mas aceitamos também `extensions.code` caso o gateway reembale a resposta.
 */
export function parsePlanLimit(err: unknown): PlanLimitInfo | null {
  if (err instanceof PlanLimitError) return err.info;
  if (!axios.isAxiosError(err) || err.response?.status !== 403) return null;
  const body = err.response.data as Record<string, unknown> | undefined;
  if (!body || typeof body !== 'object') return null;
  const ext = (body.extensions && typeof body.extensions === 'object' ? body.extensions : {}) as Record<string, unknown>;
  const pick = (k: string) => body[k] ?? ext[k];
  if (pick('code') !== 'PLAN_LIMIT_REACHED') return null;
  const raw = pick('resource');
  const resource: PlanLimitResource = raw === 'members' ? 'members' : raw === 'storage' ? 'storage' : 'works';
  return {
    resource,
    limit: num(pick('limit')),
    current: num(pick('current')),
    planCode: typeof pick('planCode') === 'string' ? (pick('planCode') as string) : null,
  };
}

/** Use no catch dos services: converte o limite em PlanLimitError; devolve o erro original caso contrário. */
export function rethrowPlanLimit(err: unknown): void {
  const info = parsePlanLimit(err);
  if (info) throw new PlanLimitError(info);
}
