import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentProps } from 'react';
import { PlanChooser } from '../components/PlanChooser';
import { PLANS } from './planFixtures';

function setup(props: Partial<ComponentProps<typeof PlanChooser>> = {}) {
  const onSubmit = props.onSubmit ?? vi.fn(() => new Promise<void>(() => {}));
  render(
    <MemoryRouter>
      <PlanChooser plans={PLANS} loading={false} loadError={null} onRetry={() => {}} onSubmit={onSubmit} {...props} />
    </MemoryRouter>,
  );
  return { onSubmit };
}

describe('PlanChooser', () => {
  it('sem seleção: botão de pagar não aparece e pede para escolher', () => {
    setup();
    expect(screen.getByText(/Selecione um plano/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gerar PIX/ })).not.toBeInTheDocument();
  });

  it('?plan= válido pré-seleciona o plano', () => {
    setup({ initialCode: 'crescimento' });
    expect(screen.getByRole('radio', { name: 'Crescimento' })).toBeChecked();
    expect(screen.getByRole('button', { name: /Gerar PIX/ })).toBeInTheDocument();
  });

  it('Enterprise (ou plano inexistente) em ?plan= é ignorado', () => {
    setup({ initialCode: 'enterprise' });
    expect(screen.getByRole('radio', { name: 'Essencial' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Crescimento' })).not.toBeChecked();
    expect(screen.queryByRole('button', { name: /Gerar PIX/ })).not.toBeInTheDocument();
  });

  it('o usuário pode trocar o plano pré-selecionado', () => {
    setup({ initialCode: 'essencial' });
    fireEvent.click(screen.getByRole('radio', { name: 'Crescimento' }));
    expect(screen.getByRole('radio', { name: 'Crescimento' })).toBeChecked();
  });

  it('duplo clique em Gerar PIX dispara uma única criação, só com o planCode', async () => {
    const { onSubmit } = setup({ initialCode: 'essencial' });
    const btn = screen.getByRole('button', { name: /Gerar PIX/ });
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('essencial', 0);
    await waitFor(() => expect(screen.getByRole('button', { name: /Gerando pagamento/ })).toBeDisabled());
    expect(screen.getByRole('radio', { name: 'Crescimento' })).toBeDisabled();
  });

  it('avisa que os dias restantes não são creditados ao trocar de plano', () => {
    setup({ initialCode: 'crescimento', currentCode: 'essencial' });
    expect(screen.getByText(/dias restantes do plano atual não são creditados/)).toBeInTheDocument();
    expect(screen.getByText('Plano atual')).toBeInTheDocument();
  });

  it('sem permissão de criar: botão desabilitado', () => {
    setup({ initialCode: 'essencial', canCreate: false });
    expect(screen.getByRole('button', { name: /Gerar PIX/ })).toBeDisabled();
  });

  it('usuários extras: stepper soma ao total e vai no submit', () => {
    const { onSubmit } = setup({ initialCode: 'essencial' });
    const more = screen.getByRole('button', { name: 'Mais um usuário extra' });
    fireEvent.click(more);
    fireEvent.click(more);
    // R$ 97 + 2 x R$ 29 = R$ 155
    expect(screen.getByText(/155/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Gerar PIX/ }));
    expect(onSubmit).toHaveBeenCalledWith('essencial', 2);
  });

  it('usuários extras respeitam o teto do plano', () => {
    setup({ initialCode: 'essencial' });
    const more = screen.getByRole('button', { name: 'Mais um usuário extra' });
    for (let i = 0; i < 10; i++) fireEvent.click(more);
    expect(more).toBeDisabled(); // Essencial: até 3 extras
    expect(screen.getByRole('button', { name: 'Menos um usuário extra' })).not.toBeDisabled();
  });

  it('renovação do mesmo plano pré-preenche os usuários extras atuais', () => {
    setup({ initialCode: 'crescimento', currentCode: 'crescimento', currentExtraSeats: 4 });
    expect(screen.getByRole('group', { name: /Usuários extras/ })).toHaveTextContent('4');
  });

  it('não promete trial, cartão nem gratuidade', () => {
    setup({ initialCode: 'essencial' });
    expect(document.body.textContent ?? '').not.toMatch(/trial|cartão|grátis|gratuit/i);
  });
});
