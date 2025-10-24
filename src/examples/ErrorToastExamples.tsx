// Exemplo de uso do sistema de toast de erro melhorado em toda a aplicação

import React from 'react';
import { SimpleToast } from '@/components/SimpleToast';
import { useAuth } from '@/contexts/AuthContext';

// Exemplo 1: Usando o toast de erro do contexto de autenticação
function ExampleWithAuthError() {
  const { showError, errorToast, hideError } = useAuth();

  const handleLoginError = () => {
    // Simula erro de login
    showError('Credenciais inválidas. Verifique seu email e senha.');
  };

  return (
    <>
      <button onClick={handleLoginError}>Simular Erro de Login</button>
      
      {/* Toast de erro */}
      <SimpleToast
        isVisible={errorToast.isVisible}
        message={errorToast.message}
        type={errorToast.type}
        onCancel={hideError}
        showActions={false}
        details={errorToast.details}
        errorCode={errorToast.errorCode}
        timestamp={errorToast.timestamp}
      />
    </>
  );
}

// Exemplo 2: Usando o toast de erro manualmente com diferentes tipos
function ExampleManualError() {
  const { showError, errorToast, hideError } = useAuth();

  const handleTimeoutError = () => {
    // Simula erro de timeout
    const timeoutError = new Error('ECONNABORTED timeout of 15000ms exceeded');
    showError(timeoutError);
  };

  const handleNetworkError = () => {
    // Simula erro de rede
    const networkError = new Error('Network Error');
    showError(networkError);
  };

  const handleServerError = () => {
    // Simula erro do servidor
    const serverError = new Error('Request failed with status code 500');
    showError(serverError);
  };

  const handleUnauthorizedError = () => {
    // Simula erro de autorização
    const authError = new Error('Request failed with status code 401');
    showError(authError);
  };

  const handleCustomError = () => {
    // Erro personalizado com detalhes
    showError({
      message: 'Erro personalizado do sistema',
      type: 'warning',
      details: 'Este é um exemplo de erro com detalhes adicionais e código de erro.',
      errorCode: 'CUSTOM_ERROR'
    });
  };

  return (
    <>
      <div className="space-y-2">
        <button onClick={handleTimeoutError} className="block w-full p-2 bg-red-100 text-red-800 rounded">
          Simular Timeout
        </button>
        <button onClick={handleNetworkError} className="block w-full p-2 bg-orange-100 text-orange-800 rounded">
          Simular Erro de Rede
        </button>
        <button onClick={handleServerError} className="block w-full p-2 bg-red-100 text-red-800 rounded">
          Simular Erro do Servidor
        </button>
        <button onClick={handleUnauthorizedError} className="block w-full p-2 bg-yellow-100 text-yellow-800 rounded">
          Simular Erro de Autorização
        </button>
        <button onClick={handleCustomError} className="block w-full p-2 bg-blue-100 text-blue-800 rounded">
          Erro Personalizado
        </button>
      </div>
      
      {/* Toast de erro */}
      <SimpleToast
        isVisible={errorToast.isVisible}
        message={errorToast.message}
        type={errorToast.type}
        onCancel={hideError}
        showActions={false}
        details={errorToast.details}
        errorCode={errorToast.errorCode}
        timestamp={errorToast.timestamp}
      />
    </>
  );
}

// Exemplo 3: Tratamento de erro em chamadas de API
function ExampleApiError() {
  const { showError, errorToast, hideError } = useAuth();

  const simulateApiCall = async () => {
    try {
      // Simula uma chamada que pode falhar
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('timeout of 15000ms exceeded'));
        }, 100);
      });
    } catch (error) {
      // O hook automaticamente detecta o tipo de erro
      showError(error);
    }
  };

  return (
    <>
      <button onClick={simulateApiCall}>Simular Chamada de API com Erro</button>
      
      {/* Toast de erro */}
      <SimpleToast
        isVisible={errorToast.isVisible}
        message={errorToast.message}
        type={errorToast.type}
        onCancel={hideError}
        showActions={false}
        details={errorToast.details}
        errorCode={errorToast.errorCode}
        timestamp={errorToast.timestamp}
      />
    </>
  );
}

// Componente principal que demonstra todos os exemplos
export function ErrorToastExamples() {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Exemplos de Toast de Erro Melhorados</h2>
      
      <div className="space-y-6">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">1. Erro de Login</h3>
          <ExampleWithAuthError />
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">2. Diferentes Tipos de Erro</h3>
          <ExampleManualError />
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">3. Erro em Chamada de API</h3>
          <ExampleApiError />
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Recursos dos Toasts Melhorados:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>✅ Detecção automática de tipos de erro (timeout, rede, servidor, etc.)</li>
          <li>✅ Mensagens específicas com emojis para cada tipo de erro</li>
          <li>✅ Detalhes adicionais explicando o problema</li>
          <li>✅ Códigos de erro para facilitar debug</li>
          <li>✅ Timestamp para rastreamento temporal</li>
          <li>✅ Ícones específicos para cada tipo de erro</li>
          <li>✅ Duração ajustada baseada na complexidade do erro</li>
        </ul>
      </div>
    </div>
  );
}