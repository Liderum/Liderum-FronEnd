import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { useRouteSecurity } from './hooks/useRouteSecurity';
import { Toaster } from './components/ui/toaster';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Index from './pages/Index';
import Home from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/sales/Sales';
import { Billing } from './pages/billing/Billing';
import { Inventory } from './pages/inventory/Inventory';
import { NewProductPage } from './pages/inventory/NewProductPage';
import ProductView from './pages/inventory/ProductView';
import ProductEdit from './pages/inventory/ProductEdit';
import Users from './pages/users/Users';
import { Contact } from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ValidateCode from './pages/ValidateCode';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/settings/Settings';
import { PaymentRoutes } from './pages/payments';

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
      {/* <Route path="/cadastros" element={<CadastroERP />} /> */}
      <Route path="/contact" element={<Contact />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/validate-code" element={<ValidateCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Payment Routes */}
      <Route path="/payments/*" element={<PaymentRoutes />} />

      {/* Rotas protegidas */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
      </Route>
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
      </Route>

      {/* Gestão / Management */}
      <Route
        path="/management"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="users" element={<Users />} />
      </Route>
      <Route
        path="/sales"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Sales />} />
      </Route>
      <Route
        path="/billing"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Billing />} />
      </Route>
      <Route
        path="/inventory"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Inventory />} />
        <Route path="new-product" element={<NewProductPage />} />
        <Route path="view/:id" element={<ProductView />} />
        <Route path="edit/:id" element={<ProductEdit />} />
      </Route>
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Settings />} />
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
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
