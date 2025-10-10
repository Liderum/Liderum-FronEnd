// Exemplo de uso do SimpleToast em toda a aplicação

import { SimpleToast } from '@/components/SimpleToast';
import { useSimpleToast } from '@/hooks/useSimpleToast';

// Exemplo 1: Toast simples de sucesso
function ExampleSuccessToast() {
  const { toast, showToast, hideToast } = useSimpleToast();

  const handleSuccess = () => {
    showToast('Operação realizada com sucesso!', 'success', 3);
  };

  return (
    <>
      <button onClick={handleSuccess}>Mostrar Toast</button>
      <SimpleToast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onCancel={hideToast}
      />
    </>
  );
}

// Exemplo 2: Toast com countdown e ações
function ExampleRedirectToast() {
  const { toast, showToast, hideToast, updateCountdown } = useSimpleToast();

  const handleRedirect = () => {
    showToast('Redirecionando para dashboard...', 'info', 5);
    // Simular countdown
    let count = 5;
    const timer = setInterval(() => {
      count--;
      updateCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        hideToast();
      }
    }, 1000);
  };

  return (
    <>
      <button onClick={handleRedirect}>Redirecionar</button>
      <SimpleToast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        countdown={toast.countdown}
        onCancel={hideToast}
        onGoNow={() => {
          hideToast();
          // Redirecionar imediatamente
        }}
      />
    </>
  );
}

// Exemplo 3: Toast de erro
function ExampleErrorToast() {
  const { toast, showToast, hideToast } = useSimpleToast();

  const handleError = () => {
    showToast('Erro ao processar solicitação', 'error', 0);
  };

  return (
    <>
      <button onClick={handleError}>Mostrar Erro</button>
      <SimpleToast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onCancel={hideToast}
        showActions={false} // Sem ações para erros
      />
    </>
  );
}
