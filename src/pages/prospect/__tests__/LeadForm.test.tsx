import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosError } from 'axios';
import { LeadForm, formatPhone, validateLead } from '../LeadForm';
import { LeadService, rateLimitMessage } from '@/services/leadService';

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return { ...actual, default: { ...actual.default, post: vi.fn(), isAxiosError: actual.default.isAxiosError } };
});

const post = vi.mocked(axios.post);

function axiosError(status: number | undefined, data?: unknown, headers: Record<string, string> = {}) {
  const response = status ? ({ status, data, headers, statusText: '', config: {} } as never) : undefined;
  return new AxiosError('boom', undefined, undefined, undefined, response);
}

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Seu nome'), 'Maria Souza');
  await user.type(screen.getByLabelText('Empresa'), 'Construtora Aurora');
  await user.type(screen.getByLabelText('E-mail'), 'maria@aurora.com.br');
  await user.type(screen.getByLabelText('Telefone / WhatsApp'), '11912345678');
}

beforeEach(() => post.mockReset());

describe('formatPhone / validateLead', () => {
  it('formata celular e fixo', () => {
    expect(formatPhone('11912345678')).toBe('(11) 91234-5678');
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
    expect(formatPhone('(11) 9')).toBe('(11) 9');
    expect(formatPhone('')).toBe('');
  });

  it('exige nome, empresa, e-mail válido e telefone com DDD', () => {
    const errors = validateLead({ nome: '', empresa: '', email: 'x', telefone: '123', porte: '', mensagem: '', website: '' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'empresa', 'nome', 'telefone']);
    expect(validateLead({ nome: 'Ma', empresa: 'Ab', email: 'a@b.co', telefone: '(11) 3333-4444', porte: '', mensagem: '', website: '' })).toEqual({});
  });
});

describe('LeadForm', () => {
  it('não chama a API com campos inválidos e mostra os motivos', async () => {
    const user = userEvent.setup();
    render(<LeadForm />);

    await user.click(screen.getByRole('button', { name: /quero conversar/i }));

    expect(post).not.toHaveBeenCalled();
    expect(screen.getByText('Como podemos te chamar?')).toBeInTheDocument();
    expect(screen.getByText('Confira o e-mail.')).toBeInTheDocument();
  });

  it('envia o lead sem campos opcionais vazios e mostra a confirmação', async () => {
    post.mockResolvedValueOnce({ data: { message: 'ok' } });
    const user = userEvent.setup();
    render(<LeadForm />);

    await fill(user);
    await user.click(screen.getByRole('button', { name: /quero conversar/i }));

    expect(await screen.findByText('Recebemos seu contato.')).toBeInTheDocument();
    expect(post).toHaveBeenCalledTimes(1);
    const [url, body] = post.mock.calls[0];
    expect(String(url)).toMatch(/\/contact\/lead$/);
    expect(body).toEqual({
      nome: 'Maria Souza', empresa: 'Construtora Aurora', email: 'maria@aurora.com.br', telefone: '(11) 91234-5678',
      porte: undefined, mensagem: undefined, website: undefined,
    });
  });

  it('manda o honeypot quando um robô o preenche (o backend descarta)', async () => {
    post.mockResolvedValueOnce({ data: {} });
    const user = userEvent.setup();
    render(<LeadForm />);

    await fill(user);
    await user.type(screen.getByLabelText('Não preencha este campo'), 'http://spam.example');
    await user.click(screen.getByRole('button', { name: /quero conversar/i }));

    await waitFor(() => expect(post).toHaveBeenCalled());
    expect(post.mock.calls[0][1]).toMatchObject({ website: 'http://spam.example' });
  });

  it('429: avisa quanto esperar, usando o Retry-After, e mantém o que foi digitado', async () => {
    post.mockRejectedValueOnce(axiosError(429, { code: 'RATE_LIMITED' }, { 'retry-after': '1800' }));
    const user = userEvent.setup();
    render(<LeadForm />);

    await fill(user);
    await user.click(screen.getByRole('button', { name: /quero conversar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('30 min');
    expect(screen.getByLabelText('Seu nome')).toHaveValue('Maria Souza');
  });

  it('erro de validação do backend vira mensagem legível', async () => {
    post.mockRejectedValueOnce(axiosError(400, { errors: { Email: ['Formato de e-mail inválido.'] } }));
    const user = userEvent.setup();
    render(<LeadForm />);

    await fill(user);
    await user.click(screen.getByRole('button', { name: /quero conversar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Formato de e-mail inválido.');
  });

  it('sem resposta do servidor, orienta a verificar a conexão', async () => {
    post.mockRejectedValueOnce(axiosError(undefined));
    const user = userEvent.setup();
    render(<LeadForm />);

    await fill(user);
    await user.click(screen.getByRole('button', { name: /quero conversar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('conexão');
  });
});

describe('rateLimitMessage', () => {
  it('converte segundos em minutos ou horas', () => {
    expect(rateLimitMessage(90)).toContain('2 min');
    expect(rateLimitMessage(7200)).toContain('2 h');
    expect(rateLimitMessage(null)).toContain('mais tarde');
  });
});

describe('LeadService', () => {
  it('429 sem header usa o retryAfterSeconds do corpo', async () => {
    post.mockRejectedValueOnce(axiosError(429, { retryAfterSeconds: 600 }));
    await expect(LeadService.send({ nome: 'a', empresa: 'b', email: 'c@d.ef', telefone: '11999999999' })).rejects.toMatchObject({ retryAfterSeconds: 600 });
  });
});
