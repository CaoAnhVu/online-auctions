import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Admin Pages
import AdminLoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import AuctionsPage from '../pages/admin/AuctionsPage';
import UsersPage from '../pages/admin/UsersPage';
import PaymentsPage from '../pages/admin/PaymentsPage';
import NotificationTemplatesPage from '../pages/admin/NotificationTemplatesPage';

// Layout
import AdminLayout from '../layouts/AdminLayout';

function AdminRoutes() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isAdmin = isAuthenticated && (user?.role === 'ADMIN' || user?.roles?.includes('ROLE_ADMIN'));

  console.log('AdminRoutes:', { isAuthenticated, user });

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="auctions" element={<AuctionsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="notification-templates" element={<NotificationTemplatesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
