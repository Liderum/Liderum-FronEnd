import { useState, useEffect } from 'react';
import { validateEmail, getEmailValidationError } from '@/lib/emailValidation';

/**
 * Hook personalizado para validação de email em tempo real
 * @param initialEmail - Email inicial (opcional)
 * @param debounceMs - Tempo de debounce em milissegundos (padrão: 1000)
 * @returns Objeto com email, setEmail, error e isValid
 */
export const useEmailValidation = (initialEmail: string = '', debounceMs: number = 1000) => {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (email) {
      const timer = setTimeout(() => {
        const validationError = getEmailValidationError(email);
        setError(validationError);
        setIsValid(validationError === '');
      }, debounceMs);
      
      return () => clearTimeout(timer);
    } else {
      setError('');
      setIsValid(false);
    }
  }, [email, debounceMs]);

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    // Limpa erro imediatamente quando usuário começa a digitar
    if (error) {
      setError('');
    }
  };

  return {
    email,
    setEmail: handleEmailChange,
    error,
    isValid,
    validateEmail: () => {
      const validationError = getEmailValidationError(email);
      setError(validationError);
      setIsValid(validationError === '');
      return validationError === '';
    }
  };
};
