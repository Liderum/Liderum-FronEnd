# Fluxo de Pagamento - Liderum

Este documento descreve o fluxo de pagamento implementado no projeto Liderum.

## Visão Geral

O fluxo de pagamento é uma simulação completa de um processo de pagamento online, incluindo seleção de método de pagamento, coleta de dados, processamento e resultado final.

## Estrutura de Arquivos

```
src/
├── types/
│   └── payment.ts                 # Tipos TypeScript para pagamento
├── layouts/
│   └── PaymentLayout.tsx          # Layout específico para páginas de pagamento
├── pages/
│   └── payments/
│       ├── index.tsx              # Rotas do fluxo de pagamento
│       ├── PaymentMethodSelection.tsx  # Tela 1: Seleção de método
│       ├── PaymentDetails.tsx     # Tela 2: Dados de pagamento
│       ├── PaymentProcessing.tsx  # Tela 3: Processamento
│       └── PaymentResult.tsx      # Tela 4: Resultado
└── components/
    └── PaymentPlansShowcase.tsx   # Componente para exibir planos
```

## Fluxo de Navegação

1. **Seleção de Método** (`/payments`)

   - Usuário escolhe entre PIX ou Cartão de Crédito
   - Exibe informações do plano selecionado

2. **Dados de Pagamento** (`/payments/details`)

   - **PIX**: Exibe QR Code e código PIX para cópia
   - **Cartão**: Formulário com campos do cartão (número, nome, validade, CVV)

3. **Processamento** (`/payments/processing`)

   - Animação de carregamento com barra de progresso
   - Simula processamento do pagamento
   - Redireciona automaticamente após alguns segundos

4. **Resultado** (`/payments/result`)
   - **Sucesso**: Confirmação do pagamento com opções para ver detalhes ou voltar
   - **Erro**: Mensagem de falha com opção de tentar novamente

## Parâmetros de URL

O fluxo aceita os seguintes parâmetros via URL:

- `plan`: ID do plano (basic, professional, enterprise)
- `price`: Preço do plano
- `name`: Nome do plano
- `method`: Método de pagamento (pix, credit_card)
- `success`: Resultado do pagamento (true/false)

### Exemplo de URL:

```
/payments?plan=professional&price=199.90&name=Plano%20Profissional
```

## Componentes Principais

### PaymentLayout

Layout específico para páginas de pagamento com:

- Header com logo e informações de segurança
- Footer com informações de segurança SSL
- Design responsivo e moderno

### PaymentMethodSelection

- Exibe métodos de pagamento disponíveis (PIX e Cartão)
- Mostra informações do plano selecionado
- Validação de seleção antes de continuar

### PaymentDetails

- **PIX**: QR Code simulado e código PIX para cópia
- **Cartão**: Formulário completo com validação
- Formatação automática dos campos do cartão

### PaymentProcessing

- Barra de progresso animada
- Simulação de diferentes etapas do processamento
- Taxa de sucesso de 80% (simulação)

### PaymentResult

- Exibe resultado do pagamento (sucesso/erro)
- Informações da transação
- Opções de ação baseadas no resultado

## Integração com Planos

O componente `PaymentPlansShowcase` pode ser usado para integrar o fluxo de pagamento com a seleção de planos:

```tsx
import { PaymentPlansShowcase } from "@/components/PaymentPlansShowcase";

// Use em qualquer página para exibir planos com botões de pagamento
<PaymentPlansShowcase />;
```

## Personalização

### Cores e Estilo

O fluxo usa o sistema de design do projeto com:

- Cores principais: azul (#2563eb)
- Gradientes suaves
- Animações e transições suaves
- Design responsivo

### Validações

- Campos obrigatórios do cartão
- Formatação automática de números
- Validação de CVV (3-4 dígitos)
- Validação de validade (MM/AA)

## Segurança

- Simulação de SSL 256-bit
- Dados não são persistidos (apenas simulação)
- Validações client-side básicas
- Mensagens de segurança em todas as telas

## Testes

Para testar o fluxo:

1. Acesse `/payments` diretamente
2. Ou use o componente `PaymentPlansShowcase` para simular seleção de plano
3. Teste ambos os métodos de pagamento (PIX e Cartão)
4. Observe o comportamento de sucesso/erro aleatório

## Próximos Passos

Para implementação real:

1. Integrar com gateway de pagamento real
2. Implementar validações server-side
3. Adicionar persistência de dados
4. Implementar webhooks para confirmação
5. Adicionar logs de transações
6. Implementar sistema de reembolsos
