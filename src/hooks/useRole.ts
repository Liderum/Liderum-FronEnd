import { useAuth } from '@/contexts/AuthContext';

export function useRole(role: string): boolean {
  const { roles } = useAuth();
  return roles.includes(role);
}
