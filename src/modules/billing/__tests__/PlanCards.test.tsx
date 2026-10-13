import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useState } from 'react';
import { PlanCards } from '../components/PlanCards';
import { PLANS } from './planFixtures';

function Harness({ onSelect = (_c: string) => {}, disabled = false, initial = null as string | null }) {
  const [code, setCode] = useState<string | null>(initial);
  return (
    <MemoryRouter>
      <PlanCards plans={PLANS} selectedCode={code} onSelect={(c) => { setCode(c); onSelect(c); }} disabled={disabled} />
    </MemoryRouter>
  );
}

describe('PlanCards', () => {
  it('renderiza os três planos com preço, limites em destaque e benefícios', () => {
    render(<Harness />);
    expect(screen.getByRole('heading', { name: 'Essencial' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Crescimento' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Enterprise' })).toBeInTheDocument();
    expect(screen.getByText(/^R\$\s97,00$/)).toBeInTheDocument();
    expect(screen.getByText(/^R\$\s197,00$/)).toBeInTheDocument();
    expect(screen.getByText('Sob consulta')).toBeInTheDocument();
    const essencial = screen.getByRole('radio', { name: 'Essencial' }).closest('label')!;
    expect(within(essencial).getByText('5')).toBeInTheDocument();
    expect(within(essencial).getByText('obras ativas')).toBeInTheDocument();
    expect(within(essencial).getByText('3')).toBeInTheDocument();
    expect(within(essencial).getByText('Dashboard executivo')).toBeInTheDocument();
    expect(within(essencial).getByText('Extras e aditivos')).toBeInTheDocument(); // em "Não inclui"
    const cresc = screen.getByRole('radio', { name: 'Crescimento' }).closest('label')!;
    expect(within(cresc).getByText('Ilimitadas')).toBeInTheDocument();
  });

  it('mostra o selo "Mais completo" só no Crescimento', () => {
    render(<Harness />);
    const badges = screen.getAllByText('Mais completo');
    expect(badges).toHaveLength(1);
    expect(badges[0].closest('label')).toContainElement(screen.getByRole('radio', { name: 'Crescimento' }));
  });

  it('seleção: clicar marca o radio e avisa o pai; só um fica marcado', () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Essencial' }));
    expect(onSelect).toHaveBeenLastCalledWith('essencial');
    expect(screen.getByRole('radio', { name: 'Essencial' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Crescimento' }));
    expect(screen.getByRole('radio', { name: 'Crescimento' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Essencial' })).not.toBeChecked();
  });

  it('é um radiogroup acessível com radios nativos (teclado)', () => {
    render(<Harness />);
    const group = screen.getByRole('radiogroup', { name: 'Planos disponíveis' });
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(2);
    radios.forEach((r) => expect(r).toHaveAttribute('type', 'radio'));
  });

  it('Enterprise não é comprável: sem radio, só link de contato', () => {
    render(<Harness />);
    expect(screen.queryByRole('radio', { name: 'Enterprise' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Falar com a equipe/ })).toHaveAttribute('href', '/contact');
  });

  it('desabilita a seleção enquanto há envio em andamento', () => {
    render(<Harness disabled />);
    const r = screen.getByRole('radio', { name: 'Essencial' });
    expect(r).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Crescimento' })).toBeDisabled();
  });

  it('completa o Enterprise pelo catálogo local se a API não o listar', () => {
    render(
      <MemoryRouter>
        <PlanCards plans={PLANS.slice(0, 2)} selectedCode={null} onSelect={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Enterprise' })).toBeInTheDocument();
  });
});
