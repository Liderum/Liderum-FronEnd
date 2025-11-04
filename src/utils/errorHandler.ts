import { AxiosError } from 'axios';

/**
 * Estrutura de erro Problem Details (RFC 7807)
 */
interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  code?: string;
  [key: string]: unknown;
}

/**
 * Extrai mensagem de erro de uma resposta Problem Details ou de um erro genérico
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response;
    
    if (response?.data) {
      const problem = response.data as ProblemDetails;
      
      // Se for um erro de validação (400) com lista de erros por campo
      if (problem.errors && typeof problem.errors === 'object') {
        const errorMessages = Object.values(problem.errors)
          .flat()
          .filter((msg): msg is string => typeof msg === 'string');
        
        if (errorMessages.length > 0) {
          return errorMessages.join(', ');
        }
      }
      
      // Se tiver detail (mensagem principal)
      if (problem.detail && typeof problem.detail === 'string') {
        return problem.detail;
      }
      
      // Se tiver title
      if (problem.title && typeof problem.title === 'string') {
        return problem.title;
      }
    }
    
    // Fallback para mensagens padrão do Axios
    if (error.response?.status === 409) {
      return 'Conflito: O recurso já existe ou foi alterado por outro processo.';
    }
    if (error.response?.status === 404) {
      return 'Recurso não encontrado.';
    }
    if (error.response?.status === 401) {
      return 'Não autorizado. Faça login novamente.';
    }
    if (error.response?.status === 422) {
      return 'Regra de negócio violada.';
    }
    if (error.response?.status === 400) {
      return 'Dados inválidos. Verifique os campos preenchidos.';
    }
    if (error.response?.status === 500) {
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    }
    
    return error.message || 'Erro ao processar requisição';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Erro desconhecido';
}

/**
 * Extrai erros de validação por campo
 */
export function extractValidationErrors(error: unknown): Record<string, string[]> {
  if (error instanceof AxiosError) {
    const response = error.response;
    
    if (response?.data) {
      const problem = response.data as ProblemDetails;
      
      if (problem.errors && typeof problem.errors === 'object') {
        const validationErrors: Record<string, string[]> = {};
        
        for (const [field, messages] of Object.entries(problem.errors)) {
          if (Array.isArray(messages)) {
            validationErrors[field] = messages.filter((msg): msg is string => typeof msg === 'string');
          }
        }
        
        return validationErrors;
      }
    }
  }
  
  return {};
}

/**
 * Verifica se o erro é de um tipo específico
 */
export function isErrorType(error: unknown, statusCode: number): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === statusCode;
  }
  return false;
}

/**
 * Obtém informações completas do erro para debug
 */
export function getErrorInfo(error: unknown): {
  message: string;
  status?: number;
  type?: string;
  code?: string;
  validationErrors?: Record<string, string[]>;
} {
  const message = extractErrorMessage(error);
  const validationErrors = extractValidationErrors(error);
  
  const info: ReturnType<typeof getErrorInfo> = {
    message,
  };
  
  if (error instanceof AxiosError) {
    const response = error.response;
    if (response?.data) {
      const problem = response.data as ProblemDetails;
      info.status = problem.status || response.status;
      info.type = problem.type;
      info.code = problem.code;
    }
    
    if (Object.keys(validationErrors).length > 0) {
      info.validationErrors = validationErrors;
    }
  }
  
  return info;
}

