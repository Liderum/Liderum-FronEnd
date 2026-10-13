import axios from 'axios';
import { LEAD_API_URL } from '@/config/api';
import { extractErrorMessage } from '@/utils/errorHandler';

export interface LeadRequest {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  porte?: string;
  mensagem?: string;
  /** Honeypot: campo escondido no formulário. Humano nunca preenche. */
  website?: string;
}

/** O backend limita por e-mail e por IP; o visitante precisa saber quando pode tentar de novo. */
export class LeadRateLimitedError extends Error {
  constructor(public retryAfterSeconds: number | null) {
    super('Muitas tentativas.');
    this.name = 'LeadRateLimitedError';
  }
}

export function rateLimitMessage(seconds: number | null): string {
  if (!seconds) return 'Você já nos enviou mensagens recentemente. Tente novamente mais tarde.';
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  const wait = minutes >= 60 ? `${Math.ceil(minutes / 60)} h` : `${minutes} min`;
  return `Já recebemos seus contatos recentes. Tente de novo em cerca de ${wait}.`;
}

/**
 * Endpoint público (sem token): POST liderum/api/contact/lead.
 * Chamada direta via axios — não passa pelo interceptor de sessão, porque aqui não existe sessão.
 */
export const LeadService = {
  async send(data: LeadRequest): Promise<void> {
    try {
      await axios.post(LEAD_API_URL, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const header = Number(error.response.headers?.['retry-after']);
        const body = Number((error.response.data as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds);
        throw new LeadRateLimitedError(Number.isFinite(header) && header > 0 ? header : Number.isFinite(body) && body > 0 ? body : null);
      }
      if (axios.isAxiosError(error) && !error.response) {
        throw new Error('Não conseguimos falar com o servidor. Verifique sua conexão e tente de novo.');
      }
      throw new Error(extractErrorMessage(error));
    }
  },
};
