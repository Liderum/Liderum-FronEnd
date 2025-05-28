import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import CadastroERP from './pages/CadastroERP';
import { Dashboard } from './pages/Dashboard';
import { Financial } from './pages/financial/Financial';
import { Billing } from './pages/billing/Billing';
import { Inventory } from './pages/inventory/Inventory';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/cadastros" element={<CadastroERP />} />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="financial/*" element={<Financial />} />
            <Route path="billing/*" element={<Billing />} />
            <Route path="inventory/*" element={<Inventory />} />
          </Route>

          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
