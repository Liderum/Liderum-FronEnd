import axios, { AxiosInstance } from 'axios';
import { API_CONFIG, ApiModule } from '@/config/api';
import { ResponseRegisteredUser } from '@/types/auth';

// Instância base para autenticação
const authApi = axios.create({
  baseURL: API_CONFIG.AUTH.BASE_URL,
  timeout: 15000, // Aumentado para 15 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Factory para criar instâncias de API por módulo
class ApiFactory {
  private static instances: Map<ApiModule, AxiosInstance> = new Map();

  static getInstance(module: ApiModule): AxiosInstance {
    if (!this.instances.has(module)) {
      const instance = axios.create({
        baseURL: API_CONFIG[module].BASE_URL,
        timeout: 15000, // Aumentado para 15 segundos
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Adiciona interceptors de autenticação para todas as instâncias
      this.addAuthInterceptors(instance);
      this.instances.set(module, instance);
    }

    return this.instances.get(module)!;
  }

  private static addAuthInterceptors(instance: AxiosInstance) {
    // Request interceptor para adicionar token
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('@Liderum:token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para renovar token e tratamento de erros
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Não faz refresh token se a requisição original já foi para /refresh
        // Isso evita loops infinitos
        if (originalRequest?.url?.includes('/refresh')) {
          return Promise.reject(error);
        }
        
        // Só loga erros que não são 401 (401 será tratado abaixo)
        // Isso reduz logs desnecessários
        if (error.response?.status !== 401) {
          console.error('Erro na API:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            url: originalRequest?.url,
            method: originalRequest?.method,
            timeout: error.code === 'ECONNABORTED'
          });
        }
        
        // Só tenta refresh token se:
        // 1. Recebeu 401 (não autorizado)
        // 2. A requisição ainda não foi tentada novamente (_retry)
        // 3. Não é uma requisição de refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('@Liderum:refreshToken');
            
            if (refreshToken) {
              console.log('Tentando renovar token automaticamente...');
              const response = await authApi.post('/refresh', {
                refreshToken: refreshToken
              });
              
              const { success, tokens, errors } = response.data as ResponseRegisteredUser;
              
              if (success && tokens) {
                localStorage.setItem('@Liderum:token', tokens.accessToken);
                localStorage.setItem('@Liderum:refreshToken', tokens.refreshToken);
                
                originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
                return instance(originalRequest);
              } else {
                const errorMessage = Array.isArray(errors) ? errors[0] : errors || 'Erro ao renovar token';
                throw new Error(errorMessage);
              }
            }
          } catch (refreshError) {
            console.error('Erro ao renovar token:', refreshError);
            localStorage.removeItem('@Liderum:token');
            localStorage.removeItem('@Liderum:refreshToken');
            localStorage.removeItem('@Liderum:user');
            window.location.href = '/login';
          }
        }
        
        // Melhora a mensagem de erro para timeouts
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          error.message = `Timeout na requisição para ${originalRequest?.url || 'servidor'}`;
        }
        
        return Promise.reject(error);
      }
    );
  }
}

// Instâncias específicas para cada módulo
export const authApiInstance = authApi;
export const inventoryApi = ApiFactory.getInstance('INVENTORY');
export const financialApi = ApiFactory.getInstance('FINANCIAL');
export const billingApi = ApiFactory.getInstance('BILLING');
export const usersApi = ApiFactory.getInstance('USERS');
export const managementApi = ApiFactory.getInstance('MANAGEMENT');

// Exporta a instância de autenticação como padrão para compatibilidade
export default authApiInstance;
