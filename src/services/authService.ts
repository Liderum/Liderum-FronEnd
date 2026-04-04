import { authApiInstance } from './api/apiFactory';
import { usersApi } from './api/apiFactory';
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ValidateCodeRequest,
  ResetPasswordRequest,
  LogoutRequest,
  RegisterUserRequest,
  UserProfile,
} from '@/types/auth';

/**
 * Serviço centralizado para todos os endpoints da API de segurança.
 * Baseado no schema: Liderum.Security.API v1
 *
 * AUTH  base: /liderum/api/login
 * USERS base: /liderum/api/user
 */
export const AuthService = {
  // POST /liderum/api/login/doLogin
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await authApiInstance.post<LoginResponse>('/doLogin', data);
    return response.data;
  },

  // POST /liderum/api/login/refresh-token
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await authApiInstance.post<LoginResponse>('/refresh-token', {
      refreshToken,
    });
    return response.data;
  },

  // POST /liderum/api/login/logout
  async logout(refreshToken: string): Promise<void> {
    await authApiInstance.post('/logout', {
      refreshToken,
    } as LogoutRequest);
  },

  // POST /liderum/api/login/forgot-password
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await authApiInstance.post('/forgot-password', data);
  },

  // POST /liderum/api/login/validate-code
  async validateCode(data: ValidateCodeRequest): Promise<void> {
    await authApiInstance.post('/validate-code', data);
  },

  // POST /liderum/api/login/reset-password
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await authApiInstance.post('/reset-password', data);
  },
};

export const UserService = {
  // POST /liderum/api/user/created
  async register(data: RegisterUserRequest): Promise<void> {
    await usersApi.post('/created', data);
  },

  // GET /liderum/api/user/getUserProfile
  async getProfile(): Promise<UserProfile> {
    const response = await usersApi.get<UserProfile>('/getUserProfile');
    return response.data;
  },
};
