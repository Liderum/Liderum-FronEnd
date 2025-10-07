/**
 * Utilitários para validação de email
 */

/**
 * Valida se um email tem formato válido
 * @param email - O email a ser validado
 * @returns true se o email for válido, false caso contrário
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Valida se um email está vazio ou tem formato inválido
 * @param email - O email a ser validado
 * @returns Mensagem de erro ou string vazia se válido
 */
export const getEmailValidationError = (email: string): string => {
  if (!email) {
    return "Email é obrigatório";
  }
  
  if (!validateEmail(email)) {
    return "Por favor, insira um email válido";
  }
  
  return "";
};

/**
 * Validação mais rigorosa de email (opcional)
 * Inclui verificações adicionais como domínios válidos
 * @param email - O email a ser validado
 * @returns true se o email for válido, false caso contrário
 */
export const validateEmailStrict = (email: string): boolean => {
  // Regex mais rigorosa que exclui alguns casos edge
  const strictEmailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
  
  if (!strictEmailRegex.test(email)) {
    return false;
  }
  
  // Verifica se não há pontos consecutivos
  if (email.includes('..')) {
    return false;
  }
  
  // Verifica se o domínio tem pelo menos um ponto
  const domain = email.split('@')[1];
  if (!domain || !domain.includes('.')) {
    return false;
  }
  
  return true;
};
