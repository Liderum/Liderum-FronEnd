import { useErrorToast } from "@/hooks/useErrorToast";
import { createContext, ReactNode, useContext, useState } from "react";
import { AuthService, UserService } from "../services/authService";
import { User, UserProfile } from "../types/auth";

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshToken: () => Promise<boolean>;
  fetchUserProfile: () => Promise<UserProfile | null>;
  errorToast: {
    isVisible: boolean;
    message: string;
    type: "error" | "warning" | "info";
    details?: string;
    errorCode?: string;
    timestamp?: string;
  };
  showError: (
    error:
      | string
      | Error
      | {
          message: string;
          type?: "error" | "warning" | "info";
          details?: string;
          errorCode?: string;
        },
  ) => void;
  hideError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("@Liderum:user");
    const storedToken = localStorage.getItem("@Liderum:token");

    // Verifica se existe tanto o usuário quanto o token
    if (storedUser && storedToken) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Erro ao fazer parse do usuário armazenado:", error);
        // Limpa dados corrompidos
        localStorage.removeItem("@Liderum:user");
        localStorage.removeItem("@Liderum:token");
        localStorage.removeItem("@Liderum:refreshToken");
        return null;
      }
    }

    return null;
  });

  const isAuthenticated = !!user && !!localStorage.getItem("@Liderum:token");

  // Hook para gerenciar toasts de erro
  const { errorToast, showError, hideError } = useErrorToast();

  async function signIn(email: string, password: string) {
    try {
      const data = await AuthService.login({ email, password });

      if (!data.accessToken) {
        throw new Error("Credenciais inválidas");
      }

      const userData: User = {
        identifier: data.identifier,
        name: data.name,
        email,
      };

      localStorage.setItem("@Liderum:token", data.accessToken);
      localStorage.setItem("@Liderum:refreshToken", data.refreshToken);
      localStorage.setItem("@Liderum:user", JSON.stringify(userData));

      setUser(userData);

      fetchUserProfile().catch(() => {});
    } catch (error) {
      console.error("Erro no login:", error);
      showError(error);

      localStorage.removeItem("@Liderum:token");
      localStorage.removeItem("@Liderum:refreshToken");
      localStorage.removeItem("@Liderum:user");
      setUser(null);

      throw error;
    }
  }

  async function refreshToken(): Promise<boolean> {
    try {
      const storedRefreshToken = localStorage.getItem("@Liderum:refreshToken");

      if (!storedRefreshToken) {
        return false;
      }

      const data = await AuthService.refreshToken(storedRefreshToken);

      if (!data.accessToken) {
        throw new Error("Erro ao renovar token");
      }

      localStorage.setItem("@Liderum:token", data.accessToken);
      localStorage.setItem("@Liderum:refreshToken", data.refreshToken);

      return true;
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      signOut();
      return false;
    }
  }

  async function fetchUserProfile(): Promise<UserProfile | null> {
    try {
      const profile = await UserService.getProfile();

      if (profile) {
        const updatedUser: User = {
          identifier: profile.identifier,
          name: profile.name,
          email: profile.email,
        };
        localStorage.setItem("@Liderum:user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return profile;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      return null;
    }
  }

  function signOut() {
    const storedRefreshToken = localStorage.getItem("@Liderum:refreshToken");

    if (storedRefreshToken) {
      AuthService.logout(storedRefreshToken).catch(() => {});
    }

    localStorage.removeItem("@Liderum:token");
    localStorage.removeItem("@Liderum:refreshToken");
    localStorage.removeItem("@Liderum:user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        signIn,
        signOut,
        refreshToken,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
