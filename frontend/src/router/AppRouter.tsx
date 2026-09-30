// frontend/src/router/AppRouter.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleGuard } from '../components/RoleGuard';
import {
  HomePage,
  CatalogPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  OrderConfirmationPage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  FloristWorkspacePage,
  CourierWorkspacePage,
  AdminCatalogPage,
  AdminSuppliesPage,
  AdminAnalyticsPage,
} from '../pages/DummyPages';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Client Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Florist / Admin / Owner Routes */}
          <Route element={<RoleGuard allowedRoles={['FLORIST', 'ADMIN', 'OWNER']} />}>
            <Route path="/workspace/florist" element={<FloristWorkspacePage />} />
          </Route>

          {/* Courier / Admin / Owner Routes */}
          <Route element={<RoleGuard allowedRoles={['COURIER', 'ADMIN', 'OWNER']} />}>
            <Route path="/workspace/courier" element={<CourierWorkspacePage />} />
          </Route>

          {/* Admin / Owner Routes */}
          <Route element={<RoleGuard allowedRoles={['ADMIN', 'OWNER']} />}>
            <Route path="/admin/catalog" element={<AdminCatalogPage />} />
            <Route path="/admin/supplies" element={<AdminSuppliesPage />} />
          </Route>

          {/* Exclusive Owner Route */}
          <Route element={<RoleGuard allowedRoles={['OWNER']} />}>
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};