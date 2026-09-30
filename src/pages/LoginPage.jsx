import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/authContext';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@kevalontechnology.in');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#021c33] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs with Kevalon Brand Palette */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#0a4b7c]/40 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#34b3d6]/25 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100 max-w-[240px] mx-auto">
            <img src="/logo.png" alt="Kevalon Technology Logo" className="h-12 w-full object-contain mx-auto" />
          </div>
          <p className="text-xs text-slate-500 font-medium pt-1">Outreach CRM & Lead Management Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="admin@kevalontechnology.in"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="bg-brand-50 p-3 rounded-xl border border-brand-100 text-[11px] text-brand-800 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              Default Admin Credentials:
            </p>
            <p>Email: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">admin@kevalontechnology.in</code></p>
            <p>Password: <code className="font-mono bg-white px-1.5 py-0.5 rounded border">Admin@123456</code></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                Sign In to CRM
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-[11px] text-slate-400">
          © 2026 Kevalon Technology. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
