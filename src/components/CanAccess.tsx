import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CanAccessProps {
  permission?: string;
  role?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza children apenas se o usuário tiver a permissão/role exigida.
 * IMPORTANTE: isso é apenas UX — a API deve ser a barreira final de autorização.
 */
export function CanAccess({ permission, role, children, fallback = null }: CanAccessProps) {
  const { permissions, roles } = useAuth();

  if (permission && !permissions.includes(permission)) return <>{fallback}</>;
  if (role && !roles.includes(role)) return <>{fallback}</>;

  return <>{children}</>;
}
