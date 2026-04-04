import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
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
import { WorkLayout } from './modules/works/components/WorkLayout';
import WorkOverviewPage from './modules/works/pages/WorkOverviewPage';

// Modules — Schedule, Budget, Extras, Daily Log
import SchedulePage from './modules/schedule/pages/SchedulePage';
import BudgetPage from './modules/budget/pages/BudgetPage';
import ExtrasPage from './modules/extras/pages/ExtrasPage';
import DailyLogPage from './modules/daily-log/pages/DailyLogPage';

// Legacy pages (kept for backward compatibility)
import { Sales } from './pages/sales/Sales';
import { Billing } from './pages/billing/Billing';
import { Inventory } from './pages/inventory/Inventory';
import { NewProductPage } from './pages/inventory/NewProductPage';
import ProductView from './pages/inventory/ProductView';
import ProductEdit from './pages/inventory/ProductEdit';
import Users from './pages/users/Users';
import Settings from './pages/settings/Settings';
import { Companies } from './pages/management/Companies';
import { Customers } from './pages/management/Customers';
import { Suppliers } from './pages/management/Suppliers';
import { Financial } from './pages/financial/Financial';

function AppContent() {
  useRouteSecurity();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/validate-code" element={<ValidateCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/payments/*" element={<PaymentRoutes />} />

      {/* ===== Protected routes ===== */}

      {/* Dashboard */}
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
        element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
      >
        <Route index element={<WorksListPage />} />
      </Route>

      {/* Works — Detail with tabs */}
      <Route
        path="/works/:id"
        element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
      >
        <Route element={<WorkLayout />}>
          <Route index element={<WorkOverviewPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="extras" element={<ExtrasPage />} />
          <Route path="daily-log" element={<DailyLogPage />} />
        </Route>
      </Route>

      {/* Management */}
      <Route
        path="/management"
        element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
      >
        <Route path="companies" element={<Companies />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* Legacy modules */}
      <Route
        path="/sales"
        element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
      >
        <Route index element={<Sales />} />
      </Route>
      <Route
        path="/billing"
        element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
      >
        <Route index element={<Billing />} />
      </Route>
      <Route
        path="/financial"
        element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
      >
        <Route index element={<Financial />} />
      </Route>
      <Route
        path="/inventory"
        element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
      >
        <Route index element={<Inventory />} />
        <Route path="new-product" element={<NewProductPage />} />
        <Route path="view/:id" element={<ProductView />} />
        <Route path="edit/:id" element={<ProductEdit />} />
      </Route>
      <Route
        path="/settings"
        element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
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
