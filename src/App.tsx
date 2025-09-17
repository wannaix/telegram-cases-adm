import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { CasesPage } from './pages/Cases/CasesPage';
import { UsersPage } from './pages/Users/UsersPage';
import { GiftsPage } from './pages/Gifts/GiftsPage';
import { PromocodesPage } from './pages/Promocodes/PromocodesPage';
import { ReferralLinksPage } from './pages/ReferralLinks/ReferralLinksPage';
import { LogsPage } from './pages/Logs/LogsPage';
import { ToastProvider } from './components/Toast';
function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="gifts" element={<GiftsPage />} />
          <Route path="promocodes" element={<PromocodesPage />} />
          <Route path="referral-links" element={<ReferralLinksPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
export default App;