import { useState, useCallback } from 'react';

interface ToastState {
  isVisible: boolean;
  message: string;
  countdown: number;
  type: 'success' | 'info' | 'warning' | 'error';
}

export function useSimpleToast() {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: '',
    countdown: 0,
    type: 'success'
  });

  const showToast = useCallback((
    message: string, 
    type: ToastState['type'] = 'success',
    duration: number = 0
  ) => {
    setToast({
      isVisible: true,
      message,
      countdown: duration,
      type
    });

    // Auto-hide após duração especificada
    if (duration > 0) {
      setTimeout(() => {
        hideToast();
      }, duration * 1000);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  const updateCountdown = useCallback((countdown: number) => {
    setToast(prev => ({ ...prev, countdown }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    updateCountdown
  };
}
