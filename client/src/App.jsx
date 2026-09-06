import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppSidebar from './components/AppSidebar';
import TopHeader from './components/TopHeader';
import AdminPage from './pages/AdminPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BuyerPage from './pages/BuyerPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import LotFormPage from './pages/LotFormPage';
import LotsPage from './pages/LotsPage';
import RegisterPage from './pages/RegisterPage';
import TraceabilityPage from './pages/TraceabilityPage';
import UsersPage from './pages/UsersPage';
import LandingPage from './pages/LandingPage';

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6] text-slate-700">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function AppShell() {
  const { user, logout } = useAuth();
  const isLandingPage = window.location.pathname === '/';

  const breadcrumbMap = {
    '/dashboard': 'DASHBOARD',
    '/lots': 'LOTS',
    '/buyers': 'ENTITIES',
    '/users': 'USERS',
    '/admin': 'VERIFICATION',
    '/traceability': 'TRACEABILITY',
    '/analytics': 'ANALYTICS',
    '/lots/new': 'NEW LOT',
  };

  const currentPath = window.location.pathname;
  const breadcrumb = user ? `${user.role} / ${breadcrumbMap[currentPath] || 'DASHBOARD'}` : 'DASHBOARD';

  if (!user || isLandingPage) {
    return <Outlet />;
  }

  return (
    <div className="app-shell">
      <AppSidebar user={user} />
      <div className="main-panel">
        <TopHeader breadcrumb={breadcrumb} user={user} onLogout={logout} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/lots" element={<LotsPage />} />
              <Route path="/buyers" element={<BuyerPage />} />
              <Route path="/traceability" element={<TraceabilityPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['COLLECTOR', 'AGGREGATOR']} />}>
              <Route path="/lots/new" element={<LotFormPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer position="top-right" theme="dark" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
