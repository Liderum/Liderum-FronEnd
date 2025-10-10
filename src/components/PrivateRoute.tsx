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
      // Se não está autenticado mas tem refresh token, tenta renovar
      if (!isAuthenticated && localStorage.getItem('@Liderum:refreshToken')) {
        try {
          const refreshed = await refreshToken();
          if (!refreshed) {
            // Se não conseguiu renovar, redireciona para login
            setIsCheckingAuth(false);
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [isAuthenticated, refreshToken]);

  // Mostra loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 