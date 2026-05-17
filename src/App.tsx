import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { PublicRoute } from './components/PublicRoute';
import { useRouteSecurity } from './hooks/useRouteSecurity';
import { Toaster } from './components/ui/toaster';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Index from './pages/Index';
import { Contact } from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ValidateCode from './pages/ValidateCode';
import ResetPassword from './pages/ResetPassword';
import { PaymentRoutes } from './pages/payments';

// Modules — Dashboard
import DashboardPage from './modules/dashboard/pages/DashboardPage';

// Modules — Works
import WorksListPage from './modules/works/pages/WorksListPage';
import NewWorkPage from './modules/works/pages/NewWorkPage';
import { WorkLayout } from './modules/works/components/WorkLayout';
import WorkOverviewPage from './modules/works/pages/WorkOverviewPage';

// Modules — Schedule, Budget, Extras, Daily Log
import SchedulePage from './modules/schedule/pages/SchedulePage';
import BudgetPage from './modules/budget/pages/BudgetPage';
import ExtrasPage from './modules/extras/pages/ExtrasPage';
import DailyLogPage from './modules/daily-log/pages/DailyLogPage';
import IncidentsPage from './modules/incidents/pages/IncidentsPage';

import Users from './pages/users/Users';
import Settings from './pages/settings/Settings';
import { Companies } from './pages/management/Companies';
import { Customers } from './pages/management/Customers';
import { Suppliers } from './pages/management/Suppliers';
import RbacAdmin from './pages/management/RbacAdmin';

function AppContent() {
  useRouteSecurity();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/validate-code" element={<PublicRoute><ValidateCode /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/payments/*" element={<PaymentRoutes />} />

      {/* ===== Protected routes ===== */}

      {/* Dashboard — sempre acessível para usuários autenticados.
          Checks de permissão granular ficam nos widgets/abas do Dashboard,
          nunca na rota raiz de home (evita loop de redirecionamento). */}
      <Route
        path="/home"
        element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
      >
        <Route index element={<DashboardPage />} />
      </Route>

      <Route
        path="/index"
        element={<PrivateRoute><Index /></PrivateRoute>}
      />
      <Route path="/dashboard" element={<Navigate to="/home" replace />} />

      {/* Works — List */}
      <Route
        path="/works"
        element={<PrivateRoute requiredPermission="works.read"><DashboardLayout /></PrivateRoute>}
      >
        <Route index element={<WorksListPage />} />
      </Route>

      {/* Works — New (antes de :id para não colidir) */}
      <Route
        path="/works/new"
        element={<PrivateRoute requiredPermission="works.create"><DashboardLayout /></PrivateRoute>}
      >
        <Route index element={<NewWorkPage />} />
      </Route>

      {/* Works — Detail with tabs */}
      <Route
        path="/works/:id"
        element={<PrivateRoute requiredPermission="works.read"><DashboardLayout /></PrivateRoute>}
      >
        <Route element={<WorkLayout />}>
          <Route index element={<WorkOverviewPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="extras" element={<ExtrasPage />} />
          <Route path="daily-log" element={<DailyLogPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
        </Route>
      </Route>

      {/* Management */}
      <Route
        path="/management"
        element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
      >
        <Route path="companies" element={<PrivateRoute requiredPermission="companies.read"><Companies /></PrivateRoute>} />
        <Route path="customers" element={<PrivateRoute requiredPermission="customers.read"><Customers /></PrivateRoute>} />
        <Route path="suppliers" element={<PrivateRoute requiredPermission="suppliers.read"><Suppliers /></PrivateRoute>} />
        <Route path="users" element={<PrivateRoute requiredPermission="users.view"><Users /></PrivateRoute>} />
        <Route path="rbac" element={<PrivateRoute requiredPermission="users.rbac.manage"><RbacAdmin /></PrivateRoute>} />
      </Route>

      <Route
        path="/settings"
        element={<PrivateRoute requiredPermission="settings.view"><DashboardLayout /></PrivateRoute>}
      >
        <Route index element={<Settings />} />
      </Route>

      {/* Fallback */}
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
