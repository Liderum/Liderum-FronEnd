import { useAuth } from '@/contexts/AuthContext';

export function usePermission(permission: string): boolean {
  const { permissions } = useAuth();
  return permissions.includes(permission);
}
