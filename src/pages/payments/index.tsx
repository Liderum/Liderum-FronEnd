import { Routes, Route, Navigate } from 'react-router-dom';
import { PaymentMethodSelection } from './PaymentMethodSelection';
import { PaymentDetails } from './PaymentDetails';
import { PaymentProcessing } from './PaymentProcessing';
import { PaymentResult } from './PaymentResult';

export function PaymentRoutes() {
  return (
    <Routes>
      <Route index element={<PaymentMethodSelection />} />
      <Route path="details" element={<PaymentDetails />} />
      <Route path="processing" element={<PaymentProcessing />} />
      <Route path="result" element={<PaymentResult />} />
      <Route path="*" element={<Navigate to="/payments" replace />} />
    </Routes>
  );
}
