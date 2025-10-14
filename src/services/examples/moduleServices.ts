// Exemplo de serviço para módulo Financeiro
import { financialApi } from '../services/api/apiFactory';

export class FinancialService {
  static async getTransactions() {
    try {
      const response = await financialApi.get('/api/transactions');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw new Error('Falha ao carregar transações');
    }
  }
}

// Exemplo de serviço para módulo de Faturamento
import { billingApi } from '../services/api/apiFactory';

export class BillingService {
  static async getInvoices() {
    try {
      const response = await billingApi.get('/api/invoices');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar faturas:', error);
      throw new Error('Falha ao carregar faturas');
    }
  }
}

// Exemplo de serviço para módulo de Usuários
import { usersApi } from '../services/api/apiFactory';

export class UsersService {
  static async getUsers() {
    try {
      const response = await usersApi.get('/api/users');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw new Error('Falha ao carregar usuários');
    }
  }
}
