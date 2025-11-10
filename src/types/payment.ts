export interface PaymentMethod {
  id: string;
  name: string;
  type: 'pix' | 'credit_card';
  icon: string;
  description: string;
}

export interface CreditCardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export interface PaymentData {
  method: PaymentMethod;
  creditCard?: CreditCardData;
  amount: number;
  planId: string;
  planName: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  error?: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}
