import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para monitorar mudanças de rota e aplicar limpeza de sessão
 * quando necessário, garantindo segurança adicional
 */
export function useRouteSecurity() {
  const location = useLocation();

  useEffect(() => {
    const publicRoutes = ['/', '/cadastro', '/cadastros', '/forgot-password', '/validate-code', '/reset-password'];
    const currentPath = location.pathname;

    // NÃO limpa sessão em /login - permite que o usuário seja redirecionado após login
    // Se está em uma rota pública (exceto /login), limpa dados de autenticação
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
