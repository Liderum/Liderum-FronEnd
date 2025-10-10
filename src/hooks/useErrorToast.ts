import { useState, useCallback } from 'react';

interface ErrorToastState {
  isVisible: boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export function useErrorToast() {
  const [errorToast, setErrorToast] = useState<ErrorToastState>({
    isVisible: false,
    message: '',
    type: 'error'
  });

  const showError = useCallback((message: string, type: ErrorToastState['type'] = 'error') => {
    setErrorToast({
      isVisible: true,
      message,
      type
    });

    // Auto-hide após 5 segundos
    setTimeout(() => {
      hideError();
    }, 5000);
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
