import { beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LandingPage } from '../LandingPage';
import { PLAN_CATALOG } from '@/constants/plans';

beforeAll(() => {
  class IO { observe() {} disconnect() {} unobserve() {} }
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IO;
});

function Where() { const l = useLocation(); return <div data-testid="where">{l.pathname + l.search}</div>; }
const mount = () => render(
  <MemoryRouter initialEntries={['/']}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/cadastro" element={<Where />} />
      <Route path="/contact" element={<Where />} />
    </Routes>
  </MemoryRouter>,
);
const card = (code: string) => document.querySelector(`[data-plan="${code}"]`) as HTMLElement;

describe('Landing — seção de preços', () => {
  it('textos alinhados ao catálogo: preços, limites e benefícios de cada plano', () => {
    mount();
    for (const plan of PLAN_CATALOG) {
      const c = within(card(plan.code));
      expect(c.getByText(plan.name)).toBeInTheDocument();
      plan.features.forEach((f) => expect(c.getByText(f)).toBeInTheDocument());
      plan.excluded.forEach((f) => expect(c.getByText(f)).toBeInTheDocument());
    }
    expect(within(card('essencial')).getByText('Até 5 obras ativas')).toBeInTheDocument();
    expect(within(card('essencial')).getByText(/97/)).toBeInTheDocument();
    expect(within(card('crescimento')).getByText('Obras ilimitadas')).toBeInTheDocument();
    expect(within(card('crescimento')).getByText(/197/)).toBeInTheDocument();
    expect(within(card('enterprise')).getByText('Sob consulta')).toBeInTheDocument();
  });

  it('selo "Mais completo" no Crescimento', () => {
    mount();
    expect(within(card('crescimento')).getByText(/Mais completo/)).toBeInTheDocument();
    expect(within(card('essencial')).queryByText(/Mais completo/)).not.toBeInTheDocument();
  });

  it('sem toggle anual, "Economize 20%", trial, cartão ou "grátis"', () => {
    mount();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('style').forEach((el) => el.remove());
    const text = clone.textContent ?? '';
    expect(text).not.toMatch(/Economize|anual|trial|cartão|grátis|gratuit/i);
  });

  it('"Começar agora" do Essencial e do Crescimento vão ao cadastro com ?plan=', () => {
    mount();
    fireEvent.click(within(card('essencial')).getByRole('button', { name: 'Começar agora' }));
    expect(screen.getByTestId('where')).toHaveTextContent('/cadastro?plan=essencial');
  });

  it('Crescimento -> /cadastro?plan=crescimento', () => {
    mount();
    fireEvent.click(within(card('crescimento')).getByRole('button', { name: 'Começar agora' }));
    expect(screen.getByTestId('where')).toHaveTextContent('/cadastro?plan=crescimento');
  });

  it('Enterprise continua indo ao contato', () => {
    mount();
    fireEvent.click(within(card('enterprise')).getByRole('button', { name: 'Falar com a equipe' }));
    expect(screen.getByTestId('where')).toHaveTextContent('/contact');
  });
});
