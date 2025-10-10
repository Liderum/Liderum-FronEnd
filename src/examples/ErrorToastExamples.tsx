// Exemplo de uso do sistema de toast de erro em toda a aplicação

import { useAuth } from '@/contexts/AuthContext';
import { SimpleToast } from '@/components/SimpleToast';

// Exemplo 1: Usando o toast de erro do AuthContext
function ExampleWithAuthError() {
  const { signIn, errorToast, hideError } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn('user@example.com', 'password');
    } catch (error) {
      // O erro já é tratado automaticamente no AuthContext
      // e mostrado via toast
    }
  };

  return (
    <>
      <button onClick={handleLogin}>Fazer Login</button>
      
      {/* Toast de erro automático */}
      <SimpleToast
        isVisible={errorToast.isVisible}
        message={errorToast.message}
        type={errorToast.type}
        onCancel={hideError}
        showActions={false}
      />
    </>
  );
}

// Exemplo 2: Usando o toast de erro manualmente
function ExampleManualError() {
  const { showError, errorToast, hideError } = useAuth();

  const handleError = () => {
    // Mostra erro personalizado
    showError('Erro personalizado do backend', 'error');
  };

  const handleWarning = () => {
    // Mostra aviso
    showError('Atenção: dados podem estar desatualizados', 'warning');
  };

  const handleInfo = () => {
    // Mostra informação
    showError('Sistema em manutenção programada', 'info');
  };

  return (
    <>
      <button onClick={handleError}>Mostrar Erro</button>
      <button onClick={handleWarning}>Mostrar Aviso</button>
      <button onClick={handleInfo}>Mostrar Info</button>
      
      {/* Toast de erro */}
      <SimpleToast
        isVisible={errorToast.isVisible}
        message={errorToast.message}
        type={errorToast.type}
        onCancel={hideError}
        showActions={false}
      />
    </>
  );
}

// Exemplo 3: Tratamento de erro em chamadas de API
function ExampleApiError() {
  const { showError, errorToast, hideError } = useAuth();

  const handleApiCall = async () => {
    try {
      // Simula chamada de API que pode falhar
      const response = await fetch('/api/data');
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Mostra erro específico do backend
        showError(errorData.message || 'Erro na API', 'error');
        return;
      }
      
      // Processa dados...
    } catch (error) {
      // Mostra erro genérico
      showError('Erro de conexão com o servidor', 'error');
    }
  };

  return (
    <>
      <button onClick={handleApiCall}>Chamar API</button>
      
      {/* Toast de erro */}
      <SimpleToast
        isVisible={errorToast.isVisible}
        message={errorToast.message}
        type={errorToast.type}
        onCancel={hideError}
        showActions={false}
      />
    </>
  );
}
