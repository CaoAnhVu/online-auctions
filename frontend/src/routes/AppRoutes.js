import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProfilePage from '../pages/ProfilePage';
import AuctionsPage from '../pages/AuctionsPage';
import AuctionDetailPage from '../pages/AuctionDetailPage';
import CreateAuction from '../pages/CreateAuction';
import PaymentPage from '../pages/PaymentPage';
import NotificationsPage from '../pages/NotificationsPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import MyAuctionsPage from '../pages/MyAuctionsPage';
import MyBidsPage from '../pages/MyBidsPage';
import PaymentHistoryPage from '../pages/PaymentHistoryPage';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import EditAuctionPage from '../pages/EditAuctionPage';

// Admin Routes
import AdminRoutes from './AdminRoutes';

// Layout
import MainLayout from '../layouts/MainLayout';

function AppRoutes() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public routes - KHÔNG bọc MainLayout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Các route cần layout */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="auctions" element={<AuctionsPage />} />
        <Route path="auctions/:id" element={<AuctionDetailPage />} />
        <Route path="my-auctions" element={<MyAuctionsPage />} />
        <Route path="my-bids" element={isAuthenticated ? <MyBidsPage /> : <Navigate to="/login" replace />} />
        <Route path="payment/history" element={isAuthenticated ? <PaymentHistoryPage /> : <Navigate to="/login" replace />} />
        <Route path="payment/success" element={isAuthenticated ? <PaymentSuccessPage /> : <Navigate to="/login" replace />} />
        <Route path="profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />} />
        <Route path="create-auction" element={isAuthenticated ? <CreateAuction /> : <Navigate to="/login" replace />} />
        <Route path="edit-auction/:id" element={isAuthenticated ? <EditAuctionPage /> : <Navigate to="/login" replace />} />
        <Route path="payment/:orderCode" element={isAuthenticated ? <PaymentPage /> : <Navigate to="/login" replace />} />
        <Route path="notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" replace />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
