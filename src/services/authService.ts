import axios from 'axios';
import { authApiInstance } from './api/apiFactory';
import { usersApi, rbacApi } from './api/apiFactory';
import { API_CONFIG } from '@/config/api';
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ValidateCodeRequest,
  ResetPasswordRequest,
  RegisterUserRequest,
  UserProfile,
  RefreshResponse,
  RbacPermissions,
} from '@/types/auth';

/**
 * AUTH  base: /liderum/api/login
 * USERS base: /liderum/api/user
 * RBAC  base: /liderum/api/rbac
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
};

export const RbacService = {
  async getMyPermissions(): Promise<RbacPermissions> {
    const response = await rbacApi.get<RbacPermissions>('/my-permissions');
    return response.data;
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
};
