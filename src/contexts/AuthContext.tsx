import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api/axios';
import { User, LoginRequest, ResponseRegisteredUser } from '../types/auth';
import { API_CONFIG } from '@/config/api';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('@Liderum:user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = !!user;

  async function signIn(email: string, password: string) {
    try {
      const loginData: LoginRequest = { email, password };
      const apiInstance = api.create({ baseURL: API_CONFIG.AUTH.BASE_URL });
      const response = await apiInstance.post<ResponseRegisteredUser>('/doLogin', loginData);
      
      const { success, identifier, name, tokens, errors } = response.data;

      if (!success && errors && errors.length > 0) {
        throw new Error(errors[0]);
      }

      if (!success) {
        throw new Error('Falha na autenticação');
      }

      if (!tokens?.accessToken || !identifier || !name) {
        throw new Error('Dados de autenticação incompletos');
      }

      const userData: User = {
        identifier,
        name,
        email
      };

      localStorage.setItem('@Liderum:token', tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem('@Liderum:refreshToken', tokens.refreshToken);
      }
      localStorage.setItem('@Liderum:user', JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      if (error.response?.data?.errors?.length > 0) {
        throw new Error(error.response.data.errors[0]);
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Falha na autenticação');
    }
  }

  function signOut() {
    localStorage.removeItem('@Liderum:token');
    localStorage.removeItem('@Liderum:refreshToken');
    localStorage.removeItem('@Liderum:user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 