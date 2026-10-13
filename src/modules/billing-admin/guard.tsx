import { PrivateRoute } from '@/components/PrivateRoute';
import { PAYMENTS_PERMISSIONS } from '@/constants/permissions';

/** Rota exclusiva de plataforma: exige `payments.admin` no JWT do login (a API continua sendo a barreira final). */
export function PaymentsAdminGuard({ children }: { children: React.ReactNode }) {
  return <PrivateRoute requiredPermission={PAYMENTS_PERMISSIONS.ADMIN}>{children}</PrivateRoute>;
}
