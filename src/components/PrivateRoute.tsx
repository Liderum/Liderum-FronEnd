import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, refreshToken } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Verifica autenticação no localStorage primeiro (mais rápido)
      const token = localStorage.getItem('@Liderum:token');
      const storedUser = localStorage.getItem('@Liderum:user');
      const hasLocalAuth = !!token && !!storedUser;
      
      // Se tem autenticação no localStorage, permite acesso imediatamente
      // Não precisa fazer refresh token se já está autenticado
      if (hasLocalAuth) {
        setIsCheckingAuth(false);
        return;
      }
      
      // Só tenta refresh token se:
      // 1. Não está autenticado no contexto
      // 2. Não tem autenticação local
      // 3. Tem refresh token disponível
      if (!isAuthenticated && !hasLocalAuth && localStorage.getItem('@Liderum:refreshToken')) {
        try {
          const refreshed = await refreshToken();
          if (!refreshed) {
            setIsCheckingAuth(false);
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          setIsCheckingAuth(false);
          return;
        }
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [isAuthenticated, refreshToken]); // Re-executa quando isAuthenticated muda

  const token = localStorage.getItem('@Liderum:token');
  const storedUser = localStorage.getItem('@Liderum:user');
  const hasLocalAuth = !!token && !!storedUser;

  if (isCheckingAuth && !hasLocalAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (hasLocalAuth) {
    return <>{children}</>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 