import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para monitorar mudanças de rota e aplicar limpeza de sessão
 * quando necessário, garantindo segurança adicional
 */
export function useRouteSecurity() {
  const location = useLocation();

  useEffect(() => {
    const publicRoutes = ['/', '/login', '/cadastro', '/cadastros', '/forgot-password', '/validate-code', '/reset-password'];
    const currentPath = location.pathname;

    // Se está em uma rota pública, limpa dados de autenticação
    if (publicRoutes.includes(currentPath)) {
      const hasAuthData = localStorage.getItem('@Liderum:token') || 
                         localStorage.getItem('@Liderum:refreshToken') || 
                         localStorage.getItem('@Liderum:user');

      if (hasAuthData) {
        localStorage.removeItem('@Liderum:token');
        localStorage.removeItem('@Liderum:refreshToken');
        localStorage.removeItem('@Liderum:user');
        
        console.log(`Sessão limpa - acesso à rota pública: ${currentPath}`);
      }
    }
  }, [location.pathname]);
}
