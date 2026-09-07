import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from 'react';

type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'liderum:theme';

interface ThemeContextData {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  reapplyTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // localStorage indisponível (modo privado, etc.) — cai no default.
  }
  return 'system';
}

function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    preference === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : preference,
  );

  useEffect(() => {
    const resolved = preference === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : preference;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [preference]);

  // Acompanha mudança de preferência do SO em tempo real quando o usuário está em "system".
  useEffect(() => {
    if (preference !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = media.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Não bloqueia a troca de tema se localStorage falhar.
    }
  }, []);

  // Reaplica o tema resolvido no <html> sem mudar a preferência salva — usado
  // por telas que forçam modo claro temporariamente (ex.: login, cadastro) para
  // restaurar o tema real do usuário ao sair delas.
  const reapplyTheme = useCallback(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference, reapplyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Força o modo claro enquanto o componente estiver montado, independente da
// preferência salva/do SO — usado nas telas públicas de autenticação (login,
// cadastro), que devem sempre abrir claras. Restaura o tema real ao desmontar.
// eslint-disable-next-line react-refresh/only-export-components
export function useForceLightTheme() {
  const { reapplyTheme } = useTheme();
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      reapplyTheme();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
