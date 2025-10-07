import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api/axios';
import { User, LoginRequest, ResponseRegisteredUser } from '../types/auth';
import { API_CONFIG } from '@/config/api_config_dsv';

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
      // Simulando delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Login mockado - sempre retorna sucesso
      const mockUserData: User = {
        identifier: 'user_' + Date.now(),
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: email
      };

      // Token fake para desenvolvimento
      const fakeToken = 'fake_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const fakeRefreshToken = 'fake_refresh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // Salvando dados mockados no localStorage
      localStorage.setItem('@Liderum:token', fakeToken);
      localStorage.setItem('@Liderum:refreshToken', fakeRefreshToken);
      localStorage.setItem('@Liderum:user', JSON.stringify(mockUserData));

      setUser(mockUserData);
      
      console.log('Login mockado realizado com sucesso:', {
        user: mockUserData,
        token: fakeToken,
        refreshToken: fakeRefreshToken
      });
    } catch (error) {
      console.error('Erro no login mockado:', error);
      throw new Error('Erro interno do sistema');
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