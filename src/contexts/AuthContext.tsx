import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api/axios';
import { User, LoginRequest, ResponseRegisteredUser } from '../types/auth';
import { API_CONFIG } from '@/config/api';
import { useErrorToast } from '@/hooks/useErrorToast';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshToken: () => Promise<boolean>;
  errorToast: {
    isVisible: boolean;
    message: string;
    type: 'error' | 'warning' | 'info';
    details?: string;
    errorCode?: string;
    timestamp?: string;
  };
  showError: (error: string | Error | { message: string; type?: 'error' | 'warning' | 'info'; details?: string; errorCode?: string }) => void;
  hideError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('@Liderum:user');
    const storedToken = localStorage.getItem('@Liderum:token');
    
    // Verifica se existe tanto o usuário quanto o token
    if (storedUser && storedToken) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Erro ao fazer parse do usuário armazenado:', error);
        // Limpa dados corrompidos
        localStorage.removeItem('@Liderum:user');
        localStorage.removeItem('@Liderum:token');
        localStorage.removeItem('@Liderum:refreshToken');
        return null;
      }
    }
    
    return null;
  });

  const isAuthenticated = !!user && !!localStorage.getItem('@Liderum:token');
  
  // Hook para gerenciar toasts de erro
  const { errorToast, showError, hideError } = useErrorToast();

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post('/doLogin', {
        email,
        password
      });

      const { success, identifier, name, tokens, errors } = response.data as ResponseRegisteredUser;

      if (!success || errors) {
        const errorMessage = Array.isArray(errors) ? errors[0] : errors || 'Erro no login';
        throw new Error(errorMessage);
      }

      // Estrutura do usuário baseada na resposta da API
      const userData: User = {
        identifier,
        name,
        email
      };

      // Salvando dados reais no localStorage
      localStorage.setItem('@Liderum:token', tokens.accessToken);
      localStorage.setItem('@Liderum:refreshToken', tokens.refreshToken);
      localStorage.setItem('@Liderum:user', JSON.stringify(userData));

      setUser(userData);
      
      console.log('Login realizado com sucesso:', {
        user: userData,
        token: tokens.accessToken
      });
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Mostra o toast de erro com detecção automática de tipo
      showError(error);
      
      // Limpa dados em caso de erro
      localStorage.removeItem('@Liderum:token');
      localStorage.removeItem('@Liderum:refreshToken');
      localStorage.removeItem('@Liderum:user');
      setUser(null);
      
      throw error;
    }
  }

  async function refreshToken(): Promise<boolean> {
    try {
      const storedRefreshToken = localStorage.getItem('@Liderum:refreshToken');
      
      if (!storedRefreshToken) {
        return false;
      }

      const response = await api.post('/refresh', {
        refreshToken: storedRefreshToken
      });

      const { success, tokens, errors } = response.data as ResponseRegisteredUser;

      if (!success || errors) {
        const errorMessage = Array.isArray(errors) ? errors[0] : errors || 'Erro ao renovar token';
        throw new Error(errorMessage);
      }

      localStorage.setItem('@Liderum:token', tokens.accessToken);
      localStorage.setItem('@Liderum:refreshToken', tokens.refreshToken);

      return true;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      signOut();
      return false;
    }
  }

  function signOut() {
    localStorage.removeItem('@Liderum:token');
    localStorage.removeItem('@Liderum:refreshToken');
    localStorage.removeItem('@Liderum:user');
    setUser(null);
    
    console.log('Logout realizado com sucesso');
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      signIn, 
      signOut, 
      refreshToken,
      errorToast,
      showError,
      hideError
    }}>
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