// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { axiosClient } from '../api/axiosClient';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const response = await axiosClient.post('/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        login(token, user);

        if (user.role === 'FLORIST') navigate('/workspace/florist');
        else if (user.role === 'COURIER') navigate('/workspace/courier');
        else if (user.role === 'ADMIN' || user.role === 'OWNER') navigate('/admin/catalog');
        else navigate('/catalog');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message || 'Invalid email or password combination.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center -mt-4 mb-4">
      <div className="w-full bg-white border border-[#e7e5e4] rounded-lg shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Editorial Banner */}
        <div
          className="lg:col-span-5 bg-[#064e3b] text-white p-6 lg:p-8 flex flex-col justify-between relative min-h-[260px] lg:min-h-[500px] bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(6, 78, 59, 0.8), rgba(2, 44, 34, 0.92)), url("https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=1000&auto=format&fit=crop")',
          }}
        >
          <div className="space-y-1.5">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/20 text-[#b0f0d6]">
              Spring Harvest '26
            </span>
            <p className="text-[11px] text-stone-200 tracking-wider uppercase font-medium">
              Atelier Nº 042 — Barcelona
            </p>
          </div>

          <div className="space-y-3 my-6">
            <blockquote className="font-serif text-xl lg:text-2xl font-light italic leading-snug text-stone-100">
              "The most poetically arranged stems in Catalunya."
            </blockquote>
            <p className="text-[11px] text-stone-300 leading-relaxed max-w-sm">
              Artisanal floral compositions handcrafted in L'Eixample, Barcelona.
            </p>
          </div>

          <div className="border-t border-white/15 pt-3 flex justify-between text-[10px] text-stone-300 tracking-wider">
            <span>100% Provença Mediterrània</span>
            <span>CRÍTICA FLORAL</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-6 lg:p-10 bg-[#fafaf9] flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-5">
            {/* Header */}
            <div>
              <span 
                className="text-[10px] uppercase tracking-[0.12em] font-semibold block mb-1"
                style={{ color: '#404944' }}
              >
                Atelier Floral Barcelona
              </span>
              <h1 
                className="font-serif text-3xl font-normal leading-tight"
                style={{ color: '#1a1c1c' }}
              >
                Welcome Back
              </h1>
              <p 
                className="text-xs mt-1.5 leading-relaxed"
                style={{ color: '#404944' }}
              >
                Sign in to manage your seasonal botanical deliveries and orders.
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#eeeeed] rounded border border-[#e2e2e2] text-xs font-semibold text-center">
              <span className="py-1.5 bg-white text-[#1a1c1c] rounded shadow-sm border border-[#e2e2e2]">
                ➔ Sign In
              </span>
              <Link to="/register" className="py-1.5 text-[#404944] hover:text-[#1a1c1c] transition">
                ✏ Register / Create Account
              </Link>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 bg-[#fff1f2] border border-[#fecdd3] rounded text-xs text-[#9f1239] flex items-start gap-2">
                <span className="text-sm">⚠️</span>
                <div>
                  <p className="font-semibold">Authentication failed</p>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label 
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: '#1a1c1c' }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="patron@atelier.cat"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#bfc9c3] rounded text-xs focus:outline-none focus:border-[#064e3b]"
                  style={{ color: '#1a1c1c' }}
                />
              </div>

              <div>
                <label 
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: '#1a1c1c' }}
                >
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#bfc9c3] rounded text-xs focus:outline-none focus:border-[#064e3b]"
                  style={{ color: '#1a1c1c' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-semibold uppercase tracking-[0.1em] rounded transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-1"
              >
                {isSubmitting ? 'Signing In...' : '➔ Sign In to Atelier'}
              </button>
            </form>

            <div className="pt-2 border-t border-[#e2e2e2] text-center text-[10px] space-y-0.5" style={{ color: '#404944' }}>
              <p>🔒 256-Bit SSL Encrypted Protocol</p>
              <p>Carrer d'Enric Granados, 42, 08008 Barcelona — Serveis de Floristeria d'Autor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};