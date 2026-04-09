export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  identifier: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface ApiErrorResponse {
  success?: boolean;
  errors?: string[];
  message?: string;
}

export interface User {
  identifier: string;
  name: string;
  email: string;
}

// Tipos para recuperação de senha
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ValidateCodeRequest {
  email: string;
  code: string;
}

export interface ValidateCodeResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  cnpj: string;
}

export interface UserProfile {
  identifier: string;
  name: string;
  email: string;
  phone?: string;
  cnpj?: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface RbacPermissions {
  roles: string[];
  modules: string[];
  permissions: string[];
}