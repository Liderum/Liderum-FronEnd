import axios from 'axios';
import { CONTACT_API_URL } from '@/config/api';
import { extractErrorMessage } from '@/utils/errorHandler';

export interface ContactRequest {
  nome: string;
  telefone: string;
  email: string;
  mensagem: string;
}

interface ContactResponse {
  message: string;
}

/**
 * Endpoint público (sem autenticação): POST liderum/api/contact.
 * Chamada direta via axios — não passa pelo authApiInstance, já que
 * este não é um fluxo de sessão (sem token, sem interceptor de refresh).
 */
export const ContactService = {
  async send(data: ContactRequest): Promise<string> {
    try {
      const response = await axios.post<ContactResponse>(CONTACT_API_URL, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return response.data.message;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};
