import { useState, useCallback } from 'react';

interface ErrorToastState {
  isVisible: boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
  details?: string;
  errorCode?: string;
  timestamp?: string;
}

interface ErrorDetails {
  message: string;
  type?: 'error' | 'warning' | 'info';
  details?: string;
  errorCode?: string;
}

export function useErrorToast() {
  const [errorToast, setErrorToast] = useState<ErrorToastState>({
    isVisible: false,
    message: '',
    type: 'error'
  });

  const showError = useCallback((error: string | Error | ErrorDetails, type: ErrorToastState['type'] = 'error') => {
    let message = '';
    let details = '';
    let errorCode = '';
    let toastType = type;

    // Processa diferentes tipos de entrada
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message || 'Erro desconhecido';
      
      // Detecta tipos específicos de erro
      if (error.message.includes('timeout') || error.message.includes('ECONNABORTED')) {
        message = '⏱️ Timeout na conexão';
        details = 'A requisição demorou mais que o esperado. Verifique sua conexão e tente novamente.';
        errorCode = 'TIMEOUT';
        toastType = 'error';
      } else if (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK')) {
        message = '🌐 Erro de rede';
        details = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
        errorCode = 'NETWORK_ERROR';
        toastType = 'error';
      } else if (error.message.includes('404')) {
        message = '🔍 Recurso não encontrado';
        details = 'O recurso solicitado não foi encontrado no servidor.';
        errorCode = 'NOT_FOUND';
        toastType = 'warning';
      } else if (error.message.includes('500')) {
        message = '⚠️ Erro interno do servidor';
        details = 'Ocorreu um erro no servidor. Tente novamente em alguns minutos.';
        errorCode = 'SERVER_ERROR';
        toastType = 'error';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        message = '🔐 Acesso negado';
        details = 'Sua sessão expirou. Faça login novamente.';
        errorCode = 'UNAUTHORIZED';
        toastType = 'warning';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        message = '🚫 Acesso proibido';
        details = 'Você não tem permissão para realizar esta ação.';
        errorCode = 'FORBIDDEN';
        toastType = 'warning';
      }
    } else if (typeof error === 'object' && error !== null) {
      message = error.message || 'Erro desconhecido';
      details = error.details || '';
      errorCode = error.errorCode || '';
      toastType = error.type || type;
    }

    setErrorToast({
      isVisible: true,
      message,
      type: toastType,
      details,
      errorCode,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    });

    // Auto-hide após 8 segundos para erros com detalhes
    const hideDelay = details ? 8000 : 5000;
    setTimeout(() => {
      hideError();
    }, hideDelay);
  }, []);

  const hideError = useCallback(() => {
    setErrorToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    errorToast,
    showError,
    hideError
  };
}
