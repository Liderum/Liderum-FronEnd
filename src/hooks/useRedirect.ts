import { useState, useEffect, useCallback, useRef } from 'react';
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const destinationRef = useRef<string>(destination);

  const startRedirect = useCallback((customDestination?: string) => {
    if (customDestination) {
      destinationRef.current = customDestination;
    }
    setIsRedirecting(true);
    setCountdown(Math.ceil(delay / 1000));
  }, [delay]);

  // Efeito para gerenciar o countdown e navegação
  useEffect(() => {
    if (!isRedirecting) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Navega após a renderização estar completa
          requestAnimationFrame(() => {
            setTimeout(() => {
              if (onRedirect) {
                onRedirect();
              } else {
                navigate(destinationRef.current, { replace: true });
              }
            }, 100);
          });
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRedirecting, navigate, onRedirect]);

  const cancelRedirect = useCallback(() => {
    setIsRedirecting(false);
    setCountdown(Math.ceil(delay / 1000));
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [delay]);

  const redirectNow = useCallback((customDestination?: string) => {
    const targetDestination = customDestination || destinationRef.current;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRedirecting(false);
    
    // Usa setTimeout para garantir que a navegação aconteça após a renderização
    setTimeout(() => {
      if (onRedirect) {
        onRedirect();
      } else {
        navigate(targetDestination, { replace: true });
      }
    }, 0);
  }, [navigate, onRedirect]);

  // Atualiza destinationRef quando destination muda
  useEffect(() => {
    destinationRef.current = destination;
  }, [destination]);

  return {
    isRedirecting,
    countdown,
    startRedirect,
    cancelRedirect,
    redirectNow
  };
}
