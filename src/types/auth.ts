export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResponseTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ResponseRegisteredUser {
  success: boolean;
  identifier?: string;
  name?: string;
  tokens?: ResponseTokens;
  errors?: string[];
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