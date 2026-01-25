import { toast } from "@/hooks/use-toast";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
}

/**
 * Helper para mostrar toast de sucesso
 */
export const showSuccessToast = (message: string, options?: Omit<ToastOptions, "variant">) => {
  toast({
    title: options?.title || "Sucesso!",
    description: message,
    duration: options?.duration || 3000,
    variant: "success",
  });
};

/**
 * Helper para mostrar toast de erro
 */
export const showErrorToast = (message: string, options?: Omit<ToastOptions, "variant">) => {
  toast({
    title: options?.title || "Erro",
    description: message,
    duration: options?.duration || 5000,
    variant: "destructive",
  });
};

/**
 * Helper para mostrar toast de aviso
 */
export const showWarningToast = (message: string, options?: Omit<ToastOptions, "variant">) => {
  toast({
    title: options?.title || "Aviso",
    description: message,
    duration: options?.duration || 4000,
    variant: "warning",
  });
};

/**
 * Helper para mostrar toast de informação
 */
export const showInfoToast = (message: string, options?: Omit<ToastOptions, "variant">) => {
  toast({
    title: options?.title || "Informação",
    description: message,
    duration: options?.duration || 3000,
    variant: "info",
  });
};
