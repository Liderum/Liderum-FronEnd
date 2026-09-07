import axios from 'axios';
import { authApiInstance } from './api/apiFactory';
import { usersApi, rbacApi, tenantApi } from './api/apiFactory';
import { API_CONFIG } from '@/config/api';
import { extractErrorMessage } from '@/utils/errorHandler';
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ValidateCodeRequest,
  ResetPasswordRequest,
  RegisterUserRequest,
  UserProfile,
  UpdateUserProfileRequest,
  TenantProfile,
  UpdateTenantProfileRequest,
  RefreshResponse,
  RbacPermissions,
} from '@/types/auth';

/**
 * AUTH   base: /liderum/api/login
 * USERS  base: /liderum/api/user
 * RBAC   base: /liderum/api/rbac
 * TENANT base: /liderum/api/tenant
 */
export const AuthService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await authApiInstance.post<LoginResponse>('/doLogin', data);
    return response.data;
  },

  async refreshToken(): Promise<RefreshResponse> {
    const response = await authApiInstance.post<RefreshResponse>('/refresh-token');
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await authApiInstance.post('/logout', { refreshToken });
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await authApiInstance.post('/forgot-password', data);
  },

  async validateCode(data: ValidateCodeRequest): Promise<void> {
    await authApiInstance.post('/validate-code', data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await authApiInstance.post('/reset-password', data);
  },
};

export const UserService = {
  async register(data: RegisterUserRequest): Promise<void> {
    await usersApi.post('/created', data);
  },

  async getProfile(): Promise<UserProfile> {
    const response = await usersApi.get<UserProfile>('/getUserProfile');
    return response.data;
  },

  async updateProfile(payload: UpdateUserProfileRequest): Promise<UserProfile> {
    try {
      const response = await usersApi.put<UserProfile>('/profile', payload);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  // Marca o tour guiado de onboarding como concluído (skipped=false) ou pulado
  // (skipped=true). Idempotente no backend — só a primeira chamada conta.
  async updateTourStatus(skipped: boolean): Promise<UserProfile> {
    try {
      const response = await usersApi.post<UserProfile>('/tour', { skipped });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};

export const RbacService = {
  async getMyPermissions(): Promise<RbacPermissions> {
    const response = await rbacApi.get<RbacPermissions>('/my-permissions');
    return response.data;
  },
};

/**
 * Perfil da PJ / empresa do tenant — compartilhado entre todos os
 * colaboradores do mesmo tenant. Somente TenantAdmin pode atualizar
 * (a API rejeita a chamada de PUT para os demais).
 */
export const TenantService = {
  async getProfile(): Promise<TenantProfile> {
    try {
      const response = await tenantApi.get<TenantProfile>('/profile');
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async updateProfile(payload: UpdateTenantProfileRequest): Promise<TenantProfile> {
    try {
      const response = await tenantApi.put<TenantProfile>('/profile', payload);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },
};

/**
 * Chamadas diretas que NÃO passam pelo interceptor de resposta.
 * Usadas logo após login/refresh para evitar que um 401 dispare
 * a cadeia refresh→redirect e destrua a sessão recém-criada.
 */
export const SafeAuthCalls = {
  async getProfileDirect(accessToken: string): Promise<UserProfile | null> {
    try {
      const response = await axios.get<UserProfile>(
        `${API_CONFIG.USERS.BASE_URL}/getUserProfile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          timeout: 10000,
        },
      );
      return response.data;
    } catch {
      return null;
    }
  },

  async getMyPermissionsDirect(accessToken: string): Promise<RbacPermissions | null> {
    try {
      const response = await axios.get<RbacPermissions>(
        `${API_CONFIG.RBAC.BASE_URL}/my-permissions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          timeout: 10000,
        },
      );
      return response.data;
    } catch {
      return null;
    }
  },

  async getTenantProfileDirect(accessToken: string): Promise<TenantProfile | null> {
    try {
      const response = await axios.get<TenantProfile>(
        `${API_CONFIG.TENANT.BASE_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          timeout: 10000,
        },
      );
      return response.data;
    } catch {
      return null;
    }
  },
};
