import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

const register = vi.fn();
const login = vi.fn();
const refreshToken = vi.fn();
vi.mock('@/services/authService', () => ({
  UserService: { register: (...a: unknown[]) => register(...a), getProfile: vi.fn() },
  AuthService: {
    login: (...a: unknown[]) => login(...a),
    refreshToken: (...a: unknown[]) => refreshToken(...a),
    logout: vi.fn().mockResolvedValue(undefined),
  },
  SafeAuthCalls: { getProfileDirect: vi.fn(), getMyPermissionsDirect: vi.fn(), getTenantProfileDirect: vi.fn() },
}));
vi.mock('@/contexts/ThemeContext', () => ({ useForceLightTheme: () => {} }));

import Cadastro from '../Cadastro';
import Login from '../Login';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/PrivateRoute';
import { tokenStore } from '@/services/api/tokenStore';

function Where() {
  const l = useLocation();
  return <div data-testid="where">{l.pathname}|{(l.state as { email?: string } | null)?.email ?? ''}</div>;
}

const paymentRequired402 = () =>
  new AxiosError('402', '402', undefined, undefined, {
    status: 402, statusText: '', headers: {}, config: {} as never,
    data: { code: 'PAYMENT_REQUIRED', checkoutToken: 'tok.checkout.jwt', checkoutTokenExpiresAt: '2026-10-10T13:00:00Z' },
  });

const renderApp = (initial: string, extra?: React.ReactNode) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/login" element={<><Login /><Where /></>} />
          <Route path="/checkout" element={<Where />} />
          <Route path="/home" element={<PrivateRoute><div>HOME PRIVADA</div></PrivateRoute>} />
        </Routes>
        {extra}
      </MemoryRouter>
    </AuthProvider>,
  );

beforeEach(() => {
  register.mockReset(); login.mockReset(); refreshToken.mockReset();
  refreshToken.mockRejectedValue(new Error('sem sessão'));
  tokenStore.clearCheckoutToken();
  tokenStore.clear();
  localStorage.clear();
});

function fillCadastro() {
  const set = (id: string, value: string) => fireEvent.change(document.getElementById(id)!, { target: { name: id, value } });
  set('nome', 'Maria Silva');
  set('email', 'maria@empresa.com.br');
  set('telefone', '11999998888');
  set('cnpj', '11222333000181');
  set('senha', 'Senha@1234');
  set('confirmaSenha', 'Senha@1234');
  fireEvent.submit(document.querySelector('form')!);
}

describe('Cadastro -> /checkout', () => {
  it('não-bypass (paymentRequired): guarda o token só em memória e vai para /checkout com o e-mail', async () => {
    register.mockResolvedValue({ identifier: 'u1', name: 'Maria', paymentRequired: true, checkoutToken: 'tok.checkout.jwt', checkoutTokenExpiresAt: '2026-10-10T13:00:00Z' });
    renderApp('/cadastro');
    await waitFor(() => expect(document.getElementById('nome')).toBeTruthy());
    fillCadastro();
    expect(await screen.findByTestId('where')).toHaveTextContent('/checkout|maria@empresa.com.br');
    expect(tokenStore.getCheckoutToken()).toBe('tok.checkout.jwt');
    expect(JSON.stringify({ ...localStorage })).not.toContain('tok.checkout');
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('tok.checkout');
  });

  it('bypass (sem paymentRequired): segue o fluxo antigo e não guarda token de checkout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    register.mockResolvedValue({ identifier: 'u1', name: 'Admin', accessToken: 'x' });
    renderApp('/cadastro');
    await waitFor(() => expect(document.getElementById('nome')).toBeTruthy());
    fillCadastro();
    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(3100);
    expect(await screen.findByTestId('where')).toHaveTextContent('/login');
    expect(tokenStore.getCheckoutToken()).toBeNull();
    vi.useRealTimers();
  });
});

describe('Login com 402 PAYMENT_REQUIRED', () => {
  it('guarda o checkoutToken e retoma o /checkout; não conta como credencial inválida', async () => {
    login.mockRejectedValue(paymentRequired402());
    renderApp('/login');
    fireEvent.change(await screen.findByLabelText('Email'), { target: { value: 'joao@empresa.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'Senha@1234' } });
    fireEvent.submit(document.querySelector('form')!);
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/checkout|joao@empresa.com'));
    expect(tokenStore.getCheckoutToken()).toBe('tok.checkout.jwt');
    expect(screen.queryByText(/Credenciais inválidas/)).not.toBeInTheDocument();
  });

  it('401 continua sendo credencial inválida e não abre checkout', async () => {
    login.mockRejectedValue(new AxiosError('401', '401', undefined, undefined, { status: 401, statusText: '', headers: {}, config: {} as never, data: {} }));
    renderApp('/login');
    fireEvent.change(await screen.findByLabelText('Email'), { target: { value: 'joao@empresa.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'errada123' } });
    fireEvent.submit(document.querySelector('form')!);
    await waitFor(() => expect(login).toHaveBeenCalled());
    expect(await screen.findByTestId('where')).toHaveTextContent('/login');
    expect(tokenStore.getCheckoutToken()).toBeNull();
  });

  it('e-mail vem pré-preenchido quando chega do fluxo de checkout', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { email: 'pago@empresa.com' } }]}>
          <Login />
        </MemoryRouter>
      </AuthProvider>,
    );
    expect(await screen.findByLabelText('Email')).toHaveValue('pago@empresa.com');
  });
});

describe('PrivateRoute com pagamento pendente', () => {
  it('não autenticado + token de checkout (402 no refresh do bootstrap) -> /checkout', async () => {
    refreshToken.mockRejectedValue(paymentRequired402());
    renderApp('/home');
    expect(await screen.findByTestId('where')).toHaveTextContent('/checkout');
  });

  it('não autenticado sem pagamento pendente -> /login', async () => {
    renderApp('/home');
    expect(await screen.findByTestId('where')).toHaveTextContent('/login');
  });

  it('o contexto expõe paymentRequired após o 402', async () => {
    refreshToken.mockRejectedValue(paymentRequired402());
    let seen = false;
    function Probe() { seen = useAuth().paymentRequired; return null; }
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(seen).toBe(true));
    expect(axios.isAxiosError(paymentRequired402())).toBe(true);
  });
});
