import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { parsePlanLimit, PlanLimitError } from '../planLimit';
import { PlanLimitDialog, planLimitMessage, upgradePath, usePlanLimitDialog } from '@/modules/billing/components/PlanLimitDialog';

// Função simples (não vi.fn): o vi.fn rastreia promises rejeitadas e gera unhandled rejection espúria.
let postImpl: () => Promise<unknown> = () => Promise.resolve();
const post = (..._a: unknown[]) => postImpl();
vi.mock('@/services/api/apiFactory', () => ({
  worksApi: { post: (...a: unknown[]) => post(...a) },
  usersApi: { post: (...a: unknown[]) => post(...a) },
}));

const axiosErr = (status: number, data: unknown) =>
  new AxiosError('x', 'ERR', undefined, undefined, { status, data, statusText: '', headers: {}, config: {} } as unknown as AxiosResponse);

const LIMIT_BODY = { title: 'Forbidden', status: 403, code: 'PLAN_LIMIT_REACHED', resource: 'works', limit: 5, current: 5, planCode: 'essencial' };

describe('parsePlanLimit', () => {
  it('lê o ProblemDetails 403 com code no topo', () => {
    expect(parsePlanLimit(axiosErr(403, LIMIT_BODY))).toEqual({ resource: 'works', limit: 5, current: 5, planCode: 'essencial' });
  });
  it('lê também extensions.code', () => {
    const e = axiosErr(403, { extensions: { code: 'PLAN_LIMIT_REACHED', resource: 'members', limit: 3, current: 3, planCode: 'essencial' } });
    expect(parsePlanLimit(e)).toMatchObject({ resource: 'members', limit: 3 });
  });
  it('ignora 403 comum, outros status e erros não-axios', () => {
    const storage = axiosErr(403, { ...LIMIT_BODY, resource: 'storage', limit: 10240, current: 10240 });
    expect(parsePlanLimit(storage)).toEqual({ resource: 'storage', limit: 10240, current: 10240, planCode: 'essencial' });
    expect(parsePlanLimit(axiosErr(403, { code: 'FORBIDDEN' }))).toBeNull();
    expect(parsePlanLimit(axiosErr(422, LIMIT_BODY))).toBeNull();
    expect(parsePlanLimit(new Error('x'))).toBeNull();
  });
});

describe('services lançam PlanLimitError', () => {
  beforeEach(() => { postImpl = () => Promise.resolve(); });
  it('WorksService.create', async () => {
    postImpl = () => Promise.reject(axiosErr(403, LIMIT_BODY));
    const { WorksService } = await import('@/services/works/worksService');
    await expect(WorksService.create({} as never)).rejects.toBeInstanceOf(PlanLimitError);
  });
  it('UserService.create (membro)', async () => {
    postImpl = () => Promise.reject(axiosErr(403, { ...LIMIT_BODY, resource: 'members', limit: 3 }));
    const { UserService } = await import('@/services/userService');
    const err = await UserService.create({} as never).catch((e) => e);
    expect(err).toBeInstanceOf(PlanLimitError);
    expect(err.info.resource).toBe('members');
  });
  it('403 sem código de plano continua erro normal', async () => {
    postImpl = () => Promise.reject(axiosErr(403, { code: 'FORBIDDEN' }));
    const { UserService } = await import('@/services/userService');
    const err = await UserService.create({} as never).catch((e) => e);
    expect(err).not.toBeInstanceOf(PlanLimitError);
  });
});

describe('mensagem e diálogo', () => {
  it('texto com nome do plano, limite e recurso', () => {
    expect(planLimitMessage({ resource: 'works', limit: 5, current: 5, planCode: 'essencial' })).toMatch(/Seu plano Essencial permite 5 obras ativas\. Faça upgrade/);
    expect(planLimitMessage({ resource: 'members', limit: 3, current: 3, planCode: 'essencial' })).toMatch(/permite 3 usuários/);
    expect(planLimitMessage({ resource: 'members', limit: 15, current: 15, planCode: 'crescimento' })).toMatch(/Crescimento permite 15 usuários/);
  });
  it('upgrade sugerido: Essencial -> Crescimento', () => {
    expect(upgradePath({ resource: 'works', limit: 5, current: 5, planCode: 'essencial' })).toBe('/billing/plans?plan=crescimento');
    // usuário: ambos os planos pagos vendem usuário extra, então leva ao plano atual (stepper)
    expect(upgradePath({ resource: 'members', limit: 15, current: 15, planCode: 'crescimento' })).toBe('/billing/plans?plan=crescimento');
    expect(upgradePath({ resource: 'members', limit: null, current: null, planCode: 'enterprise' })).toBe('/billing/plans');
  });
  it('armazenamento: mensagem em GB e upgrade Essencial -> Crescimento', () => {
    const info = { resource: 'storage' as const, limit: 10240, current: 10240, planCode: 'essencial' };
    expect(planLimitMessage(info)).toMatch(/Essencial inclui 10 GB de fotos e anexos/);
    expect(upgradePath(info)).toBe('/billing/plans?plan=crescimento');
  });
  it('usuário no plano com usuário extra sugere contratar extras', () => {
    expect(planLimitMessage({ resource: 'members', limit: 3, current: 3, planCode: 'essencial' })).toMatch(/Contrate usuários extras/);
  });

  function Where() { const l = useLocation(); return <div data-testid="where">{l.pathname + l.search}</div>; }
  function Page({ err, onOther }: { err: unknown; onOther: () => void }) {
    const pl = usePlanLimitDialog();
    return <><button onClick={() => { if (!pl.handle(err)) onOther(); }}>criar</button>{pl.dialog}</>;
  }
  const mount = (err: unknown, onOther = () => {}) => render(
    <MemoryRouter initialEntries={['/works/new']}>
      <Routes>
        <Route path="/works/new" element={<Page err={err} onOther={onOther} />} />
        <Route path="/billing/plans" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );

  it('PLAN_LIMIT_REACHED abre o diálogo e o CTA leva ao checkout de upgrade', async () => {
    mount(new PlanLimitError({ resource: 'works', limit: 5, current: 5, planCode: 'essencial' }));
    fireEvent.click(screen.getByText('criar'));
    expect(await screen.findByText(/Seu plano Essencial permite 5 obras ativas/)).toBeInTheDocument();
    expect(screen.getByText(/dias restantes do plano atual não são creditados/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fazer upgrade' }));
    expect(await screen.findByTestId('where')).toHaveTextContent('/billing/plans?plan=crescimento');
  });

  it('outros erros não abrem o diálogo', () => {
    const other = vi.fn();
    mount(new Error('falhou'), other);
    fireEvent.click(screen.getByText('criar'));
    expect(other).toHaveBeenCalled();
    expect(screen.queryByText(/Limite do plano atingido/)).not.toBeInTheDocument();
  });

  it('PlanLimitDialog fechado não renderiza', () => {
    render(<MemoryRouter><PlanLimitDialog info={null} onClose={() => {}} /></MemoryRouter>);
    expect(screen.queryByText(/Limite do plano/)).not.toBeInTheDocument();
  });
});
