import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseRedirectOptions {
  delay?: number;
  destination?: string;
  onRedirect?: () => void;
}

export function useRedirect(options: UseRedirectOptions = {}) {
  const { delay = 3000, destination = '/dashboard', onRedirect } = options;
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(delay / 1000));

  const startRedirect = useCallback((customDestination?: string) => {
    setIsRedirecting(true);
    const targetDestination = customDestination || destination;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Se tem onRedirect callback, usa ele (caso ValidateCode)
          if (onRedirect) {
            onRedirect();
          } else {
            // Caso contrário, navega diretamente (caso Login)
            navigate(targetDestination, { replace: true });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [delay, destination, navigate, onRedirect]);

  const cancelRedirect = useCallback(() => {
    setIsRedirecting(false);
    setCountdown(Math.ceil(delay / 1000));
  }, [delay]);

  const redirectNow = useCallback((customDestination?: string) => {
    const targetDestination = customDestination || destination;
    // Se tem onRedirect callback, usa ele (caso ValidateCode)
    if (onRedirect) {
      onRedirect();
    } else {
      // Caso contrário, navega diretamente (caso Login)
      navigate(targetDestination, { replace: true });
    }
  }, [destination, navigate, onRedirect]);

  return {
    isRedirecting,
    countdown,
    startRedirect,
    cancelRedirect,
    redirectNow
  };
}
