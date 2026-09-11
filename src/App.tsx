import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './components/PrivateRoute';
import { PublicRoute } from './components/PublicRoute';
import { useRouteSecurity } from './hooks/useRouteSecurity';
import { Toaster } from './components/ui/toaster';

// Layouts — lazy: puxa framer-motion, só precisa carregar após o login
const DashboardLayout = lazy(() =>
  import('./layouts/DashboardLayout').then((m) => ({ default: m.DashboardLayout })),
);

// Public Pages — ficam no bundle inicial (primeira tela que o usuário vê)
import { LandingPage } from './pages/LandingPage';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Index from './pages/Index';
import { Contact } from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import ValidateCode from './pages/ValidateCode';
import ResetPassword from './pages/ResetPassword';
import { PaymentRoutes } from './pages/payments';

// Rotas protegidas — lazy: só carregam depois do login, tirando
// recharts/framer-motion e o código de cada módulo do caminho crítico
// de carregamento da tela pública/login.
const DashboardPage = lazy(() => import('./modules/dashboard/pages/DashboardPage'));

const WorksListPage = lazy(() => import('./modules/works/pages/WorksListPage'));
const NewWorkPage = lazy(() => import('./modules/works/pages/NewWorkPage'));
const WorkLayout = lazy(() =>
  import('./modules/works/components/WorkLayout').then((m) => ({ default: m.WorkLayout })),
);
const WorkOverviewPage = lazy(() => import('./modules/works/pages/WorkOverviewPage'));

const SchedulePage = lazy(() => import('./modules/schedule/pages/SchedulePage'));
const BudgetPage = lazy(() => import('./modules/budget/pages/BudgetPage'));
const ExtrasPage = lazy(() => import('./modules/extras/pages/ExtrasPage'));
const DailyLogPage = lazy(() => import('./modules/daily-log/pages/DailyLogPage'));
const IncidentsPage = lazy(() => import('./modules/incidents/pages/IncidentsPage'));

const Users = lazy(() => import('./pages/users/Users'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Companies = lazy(() =>
  import('./pages/management/Companies').then((m) => ({ default: m.Companies })),
);
const Customers = lazy(() =>
  import('./pages/management/Customers').then((m) => ({ default: m.Customers })),
);
const Suppliers = lazy(() =>
  import('./pages/management/Suppliers').then((m) => ({ default: m.Suppliers })),
);
const RbacAdmin = lazy(() => import('./pages/management/RbacAdmin'));

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
}

function AppContent() {
  useRouteSecurity();

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
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
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
