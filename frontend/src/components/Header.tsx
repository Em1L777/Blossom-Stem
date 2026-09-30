// frontend/src/components/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="font-serif text-xl font-bold text-emerald-950 tracking-tight">
            Blossom & Stem
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700">
          <Link to="/" className="hover:text-emerald-800 transition">
            Home
          </Link>
          <Link to="/catalog" className="hover:text-emerald-800 transition">
            Catalog
          </Link>

          {/* Role Workspaces Links */}
          {user?.role === 'FLORIST' && (
            <Link to="/workspace/florist" className="text-purple-700 font-semibold hover:underline">
              Florist Board
            </Link>
          )}
          {user?.role === 'COURIER' && (
            <Link to="/workspace/courier" className="text-blue-700 font-semibold hover:underline">
              Courier Board
            </Link>
          )}
          {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
            <div className="flex items-center gap-4 border-l border-stone-200 pl-4">
              <Link to="/admin/catalog" className="hover:text-emerald-800">
                Manage Catalog
              </Link>
              <Link to="/admin/supplies" className="hover:text-emerald-800">
                Supplies
              </Link>
              {user.role === 'OWNER' && (
                <Link to="/admin/analytics" className="text-emerald-800 font-semibold">
                  Analytics
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* User Actions & Cart */}
        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="relative p-2 text-stone-700 hover:text-emerald-800 transition flex items-center gap-1"
          >
            <span className="text-xl">🛒</span>
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-l border-stone-200 pl-4">
              <Link to="/profile" className="text-sm font-medium text-stone-800 hover:text-emerald-800">
                {user?.firstName}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-stone-500 hover:text-rose-700 font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-stone-700 hover:text-emerald-800 px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-emerald-800 text-white px-3 py-1.5 rounded-md hover:bg-emerald-900 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};