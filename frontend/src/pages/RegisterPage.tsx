// frontend/src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { axiosClient } from '../api/axiosClient';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationDetails, setValidationDetails] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setValidationDetails([]);
    setIsSubmitting(true);

    try {
      const response = await axiosClient.post('/auth/register', {
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        register(token, user);
        navigate('/catalog');
      }
    } catch (err: any) {
      const errorObj = err.response?.data?.error;
      setErrorMsg(errorObj?.message || 'Registration failed. Please check your data.');
      if (errorObj?.details) {
        setValidationDetails(errorObj.details);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center -mt-4 mb-4">
      <div className="w-full bg-white border border-[#e7e5e4] rounded-lg shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Editorial Banner */}
        <div
          className="lg:col-span-5 bg-[#064e3b] text-white p-6 lg:p-8 flex flex-col justify-between relative min-h-[260px] lg:min-h-[540px] bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(6, 78, 59, 0.85), rgba(2, 44, 34, 0.94)), url("https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1000&auto=format&fit=crop")',
          }}
        >
          <div className="space-y-1.5">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/20 text-[#b0f0d6]">
              Patron Privé
            </span>
            <p className="text-[11px] text-stone-200 tracking-wider uppercase font-medium">
              Barcelona Atelier Registration
            </p>
          </div>

          <div className="space-y-3 my-6">
            <blockquote className="font-serif text-xl lg:text-2xl font-light italic leading-snug text-stone-100">
              "A flower is a botanical sculpture, ephemeral yet deeply rooted in Catalan terroir."
            </blockquote>
            <p className="text-[11px] text-stone-300 leading-relaxed max-w-sm">
              Passatge dels Joncs • El Born, Barcelona
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded border border-white/20 text-[11px] text-stone-200 space-y-1">
            <p className="font-semibold text-white uppercase text-[10px] tracking-wider">
              The Blossom Circle Privilege:
            </p>
            <p>✓ Automatic 10% discount applied to your inaugural order.</p>
            <p>✓ Direct delivery tracking across Barcelona metropolitan region.</p>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="lg:col-span-7 p-6 lg:p-10 bg-[#fafaf9] flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-5">
            {/* Header */}
            <div>
              <span 
                className="text-[10px] uppercase tracking-[0.12em] font-semibold block mb-1"
                style={{ color: '#404944' }}
              >
                Atelier Boutique • Patron Registry
              </span>
              <h1 
                className="font-serif text-3xl font-normal leading-tight"
                style={{ color: '#1a1c1c' }}
              >
                Join Blossom & Stem
              </h1>
              <p 
                className="text-xs mt-1.5 leading-relaxed"
                style={{ color: '#404944' }}
              >
                Create your account for personalized floral orders and 10% first-order discount.
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#eeeeed] rounded border border-[#e2e2e2] text-xs font-semibold text-center">
              <Link to="/login" className="py-1.5 text-[#404944] hover:text-[#1a1c1c] transition">
                ➔ Sign In
              </Link>
              <span className="py-1.5 bg-white text-[#1a1c1c] rounded shadow-sm border border-[#e2e2e2]">
                ✏ Create Account
              </span>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 bg-[#fff1f2] border border-[#fecdd3] rounded text-xs text-[#9f1239] space-y-1">
                <p className="font-semibold">⚠️ {errorMsg}</p>
                {validationDetails.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {validationDetails.map((item, idx) => (
                      <li key={idx}>
                        <span className="capitalize">{item.field}</span>: {item.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label 
                    className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: '#1a1c1c' }}
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Clara"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-[#bfc9c3] rounded text-xs focus:outline-none focus:border-[#064e3b]"
                    style={{ color: '#1a1c1c' }}
                  />
                </div>
                <div>
                  <label 
                    className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: '#1a1c1c' }}
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Vidal"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-[#bfc9c3] rounded text-xs focus:outline-none focus:border-[#064e3b]"
                    style={{ color: '#1a1c1c' }}
                  />
                </div>
              </div>

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
                  placeholder="clara.vidal@atelier.cat"
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
                  Mobile Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+34 612 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#bfc9c3] rounded text-xs focus:outline-none focus:border-[#064e3b]"
                  style={{ color: '#1a1c1c' }}
                />
              </div>

              <div>
                <label 
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: '#1a1c1c' }}
                >
                  Passcode (Min 8 Chars) *
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
                {isSubmitting ? 'Creating Account...' : '➔ Create Patron Account'}
              </button>
            </form>

            <div className="pt-2 border-t border-[#e2e2e2] text-center text-[11px]" style={{ color: '#404944' }}>
              Already registered?{' '}
              <Link to="/login" className="text-[#064e3b] font-semibold hover:underline">
                Sign in to Atelier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};