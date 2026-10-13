import { useErrorToast } from '@/hooks/useErrorToast';
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  AuthService,
  UserService,
  SafeAuthCalls,
} from '../services/authService';
import { User, UserProfile, RegisterUserRequest } from '../types/auth';
import { tokenStore } from '../services/api/tokenStore';
import { billingQueryClient } from '../modules/billing/queryClient';
import { PaymentRequiredError, parsePaymentRequired } from '../services/api/paymentRequired';

const TENANT_ADMIN_ROLE = 'TenantAdmin';

interface ErrorToastState {
  isVisible: boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
  details?: string;
  errorCode?: string;
  timestamp?: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  roles: string[];
  modules: string[];
  isOnboardingComplete: boolean | null;
  isTenantAdmin: boolean;
  /** Tenant com pagamento pendente: há um token de checkout em memória e a sessão completa está bloqueada. */
  paymentRequired: boolean;
  /** Marca o fim do fluxo de checkout (token descartado) ou o início dele (token já guardado no tokenStore). */
  setPaymentRequired: (value: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  tourSeen: boolean | null;
  setTourSeen: (seen: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  register: (data: RegisterUserRequest) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  fetchUserProfile: () => Promise<UserProfile | null>;
  errorToast: ErrorToastState;
  showError: (
    error:
      | string
      | Error
      | {
          message: string;
          type?: 'error' | 'warning' | 'info';
          details?: string;
          errorCode?: string;
        },
  ) => void;
  hideError: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [tourSeen, setTourSeenState] = useState<boolean | null>(null);
  const [paymentRequired, setPaymentRequired] = useState<boolean>(() => !!tokenStore.getCheckoutToken());
  const bootstrapRef = useRef(false);

  const isAuthenticated = !!user;
  const isTenantAdmin = roles.includes(TENANT_ADMIN_ROLE);

  const { errorToast, showError, hideError } = useErrorToast();

  const setOnboardingComplete = useCallback((complete: boolean) => {
    setIsOnboardingComplete(complete);
  }, []);

  const setTourSeen = useCallback((seen: boolean) => {
    setTourSeenState(seen);
  }, []);

  const clearAuth = useCallback(() => {
    tokenStore.clear();
    billingQueryClient.clear(); // assinatura/checkouts em cache pertencem à sessão que acabou
    setUser(null);
    setPermissions([]);
    setRoles([]);
    setModules([]);
    setIsOnboardingComplete(null);
    setTourSeenState(null);
  }, []);

  // Registra callback para quando o interceptor detectar sessão expirada
  useEffect(() => {
    tokenStore.setOnAuthFailure(() => {
      setUser(null);
      setPermissions([]);
      setRoles([]);
      setModules([]);
      setIsOnboardingComplete(null);
      setTourSeenState(null);
    });
    tokenStore.setOnPaymentRequired(() => {
      setUser(null);
      setPermissions([]);
      setRoles([]);
      setModules([]);
      setIsOnboardingComplete(null);
      setTourSeenState(null);
      setPaymentRequired(true);
    });
    return () => {
      tokenStore.setOnAuthFailure(null);
      tokenStore.setOnPaymentRequired(null);
    };
  }, []);

  const fetchUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const profile = await UserService.getProfile();
      if (profile) {
        setUser({
          identifier: profile.identifier,
          name: profile.name,
          email: profile.email,
        });
        if (typeof profile.tourSeen === 'boolean') setTourSeenState(profile.tourSeen);
        return profile;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const data = await AuthService.refreshToken();
      if (!data.accessToken) return false;

      tokenStore.setAccessToken(data.accessToken);
      if (data.refreshToken) tokenStore.setRefreshToken(data.refreshToken);

      // Chamadas diretas que não passam pelo interceptor de 401, em paralelo
      // — mesmo padrão do signIn, evita 3 RTTs sequenciais em todo bootstrap.
      const [profile, rbac, tenantProfile] = await Promise.all([
        SafeAuthCalls.getProfileDirect(data.accessToken),
        SafeAuthCalls.getMyPermissionsDirect(data.accessToken),
        SafeAuthCalls.getTenantProfileDirect(data.accessToken),
      ]);

      if (profile) {
        setUser({
          identifier: profile.identifier,
          name: profile.name,
          email: profile.email,
        });
        if (typeof profile.tourSeen === 'boolean') setTourSeenState(profile.tourSeen);
      }

      if (rbac) {
        setPermissions(rbac.permissions ?? []);
        setRoles(rbac.roles ?? []);
        setModules(rbac.modules ?? []);
      }

      // Onboarding da PJ — falha é não-fatal, não deve travar o login.
      setIsOnboardingComplete(tenantProfile ? tenantProfile.isOnboardingComplete : null);

      return !!profile;
    } catch (err) {
      clearAuth();
      // 402 no refresh: tenant com pagamento pendente. Guarda o token de checkout (não abre sessão).
      const pr = parsePaymentRequired(err);
      if (pr) {
        tokenStore.setCheckoutToken(pr.checkoutToken, pr.checkoutTokenExpiresAt);
        setPaymentRequired(true);
      }
      return false;
    }
  }, [clearAuth]);

  useEffect(() => {
    if (bootstrapRef.current) return;
    bootstrapRef.current = true;

    (async () => {
      await refreshSession();
      setIsLoading(false);
    })();
  }, [refreshSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      let data;
      try {
        data = await AuthService.login({ email, password });
      } catch (err) {
        // 402 PAYMENT_REQUIRED: credenciais OK, mas o tenant precisa pagar. Retoma o checkout com o token recebido.
        const pr = parsePaymentRequired(err);
        if (pr) {
          tokenStore.setCheckoutToken(pr.checkoutToken, pr.checkoutTokenExpiresAt);
          setPaymentRequired(true);
          throw new PaymentRequiredError(pr);
        }
        throw err;
      }
      if (!data.accessToken) throw new Error('Credenciais inválidas');
      tokenStore.clearCheckoutToken();
      setPaymentRequired(false);

      tokenStore.setAccessToken(data.accessToken);
      tokenStore.setRefreshToken(data.refreshToken);

      // Hidratação de perfil e RBAC em paralelo — não bloqueia a autenticação
      // básica. Falha em qualquer um é não-fatal; o usuário ainda entra com os
      // dados retornados pelo /doLogin e a home fica acessível pelo fallback
      // do PrivateRoute.
      const [profile, rbac, tenantProfile] = await Promise.all([
        SafeAuthCalls.getProfileDirect(data.accessToken),
        SafeAuthCalls.getMyPermissionsDirect(data.accessToken),
        SafeAuthCalls.getTenantProfileDirect(data.accessToken),
      ]);

      if (rbac) {
        setPermissions(rbac.permissions ?? []);
        setRoles(rbac.roles ?? []);
        setModules(rbac.modules ?? []);
      } else {
        // RBAC não carregou — limpa quaisquer valores antigos para não
        // autorizar rotas por engano com dados de uma sessão anterior.
        setPermissions([]);
        setRoles([]);
        setModules([]);
      }

      // Onboarding da PJ — falha é não-fatal, não deve travar o login.
      setIsOnboardingComplete(tenantProfile ? tenantProfile.isOnboardingComplete : null);
      if (profile && typeof profile.tourSeen === 'boolean') setTourSeenState(profile.tourSeen);

      // setUser é o ÚLTIMO passo: é ele que dispara isAuthenticated=true e a
      // transição de rotas. Chamar por último garante que permissions/roles já
      // estão no estado antes do PrivateRoute reavaliar.
      setUser(
        profile
          ? {
              identifier: profile.identifier,
              name: profile.name,
              email: profile.email,
            }
          : { identifier: data.identifier, name: data.name, email },
      );
    },
    [],
  );

  const signOut = useCallback(() => {
    // Dispara antes de limpar o estado local: o endpoint exige o access token
    // (ainda válido neste ponto) e revoga o refresh token via cookie HttpOnly.
    AuthService.logout().catch(() => {});
    clearAuth();
  }, [clearAuth]);

  const register = useCallback(async (data: RegisterUserRequest) => {
    await UserService.register(data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        permissions,
        roles,
        modules,
        isOnboardingComplete,
        isTenantAdmin,
        paymentRequired,
        setPaymentRequired,
        setOnboardingComplete,
        tourSeen,
        setTourSeen,
        signIn,
        signOut,
        register,
        refreshSession,
        fetchUserProfile,
        errorToast,
        showError,
        hideError,
      }}
    >
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
