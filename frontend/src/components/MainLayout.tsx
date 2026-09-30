// frontend/src/components/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-stone-900 text-stone-400 py-8 border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2026 Blossom & Stem Flower Shop. Barcelona, Spain.</p>
        </div>
      </footer>
    </div>
  );
};