export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResponseTokens {
  accessToken: string;
  refreshToken?: string;
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