// frontend/src/router/AppRouter.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleGuard } from '../components/RoleGuard';

import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { HomePage } from '../pages/HomePage';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';

import { FloristWorkspacePage } from '../pages/FloristWorkspacePage';
import { CourierWorkspacePage } from '../pages/CourierWorkspacePage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminCatalogPage } from '../pages/AdminCatalogPage';
import { AdminSuppliesPage } from '../pages/AdminSuppliesPage';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { ProfilePage } from '../pages/ProfilePage';

import {
  AdminAnalyticsPage,
} from '../pages/DummyPages';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Storefront Routes */}
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

          {/* Admin / Owner Dashboard Routes */}
          <Route element={<RoleGuard allowedRoles={['ADMIN', 'OWNER']} />}>
            <Route path="/workspace/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/catalog" element={<AdminCatalogPage />} />
            <Route path="/admin/supplies" element={<AdminSuppliesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          {/* Exclusive Owner Analytics */}
          <Route element={<RoleGuard allowedRoles={['OWNER']} />}>
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};