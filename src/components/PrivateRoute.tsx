import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

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

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredRole && !roles.includes(requiredRole)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
