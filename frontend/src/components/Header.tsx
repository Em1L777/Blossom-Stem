// frontend/src/components/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-[#e7e5e4] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-serif text-xl font-bold text-[#064e3b]">
          <span>🌸</span>
          <span>Blossom & Stem</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#1a1c1c] tracking-wider uppercase">
          <Link to="/" className="hover:text-[#064e3b] transition">
            Home
          </Link>
          <Link to="/catalog" className="hover:text-[#064e3b] transition">
            Catalog
          </Link>

          {/* Role-Specific Protected Links */}
          {user && ['FLORIST', 'ADMIN', 'OWNER'].includes(user.role) && (
            <Link to="/workspace/florist" className="hover:text-[#064e3b] transition text-[#064e3b]">
              Florist Workspace
            </Link>
          )}

          {user && ['COURIER', 'ADMIN', 'OWNER'].includes(user.role) && (
            <Link to="/workspace/courier" className="hover:text-[#064e3b] transition text-[#075985]">
              Courier Workspace
            </Link>
          )}

          {user && ['ADMIN', 'OWNER'].includes(user.role) && (
            <>
              <Link to="/workspace/admin" className="hover:text-[#064e3b] transition font-bold text-[#064e3b]">
                📊 Dashboard
              </Link>
              <Link to="/admin/catalog" className="hover:text-[#064e3b] transition">
                Manage Catalog
              </Link>
              <Link to="/admin/supplies" className="hover:text-[#064e3b] transition">
                Supplies
              </Link>
            </>
          )}
        </nav>

        {/* User & Cart Controls */}
        <div className="flex items-center gap-4 text-xs font-semibold text-[#1a1c1c]">
          <Link to="/cart" className="relative p-2 text-[#1a1c1c] hover:text-[#064e3b] transition">
            🛒
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#064e3b] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {/* 💡 КЛИКАБЕЛЬНОЕ ИМЯ И ПОЛЬЗОВАТЕЛЬСКАЯ ССЫЛКА НА ПРОФИЛЬ */}
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fafaf9] border border-[#e2e2e2] hover:border-[#064e3b] hover:text-[#064e3b] transition cursor-pointer"
                title="View Personal Profile & History"
              >
                <span>👤</span>
                <span className="font-bold text-[#1a1c1c] hover:text-[#064e3b]">
                  {user.firstName || user.email.split('@')[0]}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-[#9f1239] hover:underline transition text-[11px]"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-1.5 hover:text-[#064e3b]">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 bg-[#064e3b] text-white rounded font-bold hover:bg-[#022c22] transition"
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