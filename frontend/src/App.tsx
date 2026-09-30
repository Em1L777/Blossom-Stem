// frontend/src/App.tsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
          <h1 className="text-3xl font-bold text-emerald-800">🌸 Blossom & Stem</h1>
          <p className="mt-2 text-slate-600">Frontend State Layer Initialized Successfully.</p>
        </div>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;