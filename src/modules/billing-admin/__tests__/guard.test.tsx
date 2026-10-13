import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

let perms: string[] = [];
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false, permissions: perms, roles: ['TenantAdmin'], isOnboardingComplete: true }),
}));

import { PaymentsAdminGuard } from '../guard';

function renderAt(p: string[]) {
  perms = p;
  return render(
    <MemoryRouter initialEntries={['/billing/admin']}>
      <Routes>
        <Route path="/billing/admin" element={<PaymentsAdminGuard><div>PAINEL SECRETO</div></PaymentsAdminGuard>} />
        <Route path="/home" element={<div>HOME</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('guard do dashboard de pagamentos', () => {
  it('redireciona para /home sem payments.admin, mesmo com permissões de tenant', () => {
    renderAt(['payments.plans.read', 'payments.checkouts.read', 'payments.subscription.read']);
    expect(screen.getByText('HOME')).toBeInTheDocument();
    expect(screen.queryByText('PAINEL SECRETO')).not.toBeInTheDocument();
  });
  it('renderiza com payments.admin', () => {
    renderAt(['payments.admin']);
    expect(screen.getByText('PAINEL SECRETO')).toBeInTheDocument();
  });
});
