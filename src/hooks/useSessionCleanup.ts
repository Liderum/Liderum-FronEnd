import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para limpar sessão em páginas públicas
 * Garante que dados de autenticação sejam removidos quando o usuário
 * acessa páginas que não requerem autenticação
 */
export function useSessionCleanup() {
  const { signOut } = useAuth();

  useEffect(() => {
    const clearAuthData = () => {
      localStorage.removeItem('@Liderum:token');
      localStorage.removeItem('@Liderum:refreshToken');
      localStorage.removeItem('@Liderum:user');
      
      signOut();
      
      console.log('Sessão limpa - usuário acessou página pública');
    };

    clearAuthData();
  }, [signOut]);
}
