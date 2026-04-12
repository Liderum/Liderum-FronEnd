import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

const HOME_PATH = '/home';

export function PrivateRoute({ children, requiredPermission, requiredRole }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, permissions, roles } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const missingPermission = !!requiredPermission && !permissions.includes(requiredPermission);
  const missingRole = !!requiredRole && !roles.includes(requiredRole);

  if (missingPermission || missingRole) {
    // Se já estamos em /home e mesmo assim algum filho pede permissão,
    // renderizamos os filhos para não entrar em loop — a ausência do widget
    // fica como responsabilidade de quem o usa dentro da página.
    if (location.pathname === HOME_PATH) {
      return <>{children}</>;
    }
    return <Navigate to={HOME_PATH} replace />;
  }

  return <>{children}</>;
}
