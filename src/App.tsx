import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { useRouteSecurity } from './hooks/useRouteSecurity';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import CadastroERP from './pages/CadastroERP';
import Index from './pages/Index';
import WelcomePage from './pages/WelcomePage';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/sales/Sales';
import { Billing } from './pages/billing/Billing';
import { Inventory } from './pages/inventory/Inventory';
import ForgotPassword from './pages/ForgotPassword';
import ValidateCode from './pages/ValidateCode';
import ResetPassword from './pages/ResetPassword';

function AppContent() {
  // Monitora mudanças de rota para segurança
  useRouteSecurity();

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/cadastros" element={<CadastroERP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/validate-code" element={<ValidateCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rotas protegidas */}
      <Route
        path="/welcome"
        element={
          <PrivateRoute>
            <WelcomePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/index"
        element={
          <PrivateRoute>
            <Index />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="sales/*" element={<Sales />} />
        <Route path="billing/*" element={<Billing />} />
        <Route path="inventory/*" element={<Inventory />} />
      </Route>

      {/* Rota padrão */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
