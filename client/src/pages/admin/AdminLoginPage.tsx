import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      if (res.data?.token && res.data?.user) {
        if (res.data.user.role !== 'admin') {
          setError('Access Denied: This portal is strictly for Jutar Ghor store administrators.');
          showToast('Access Denied', 'You need administrator privileges to access this portal.', 'error');
          return;
        }

        login(res.data.token, res.data.user);
        showToast('Admin Access Granted', `Welcome back, ${res.data.user.full_name}`, 'success');
        navigate('/admin');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid administrator credentials.';
      setError(msg);
      showToast('Authentication Failed', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@jutarghor.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Storefront Link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-brand-orange transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Store</span>
        </Link>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
          Secure Portal
        </span>
      </div>

      {/* Admin Card */}
      <div className="w-full max-w-md bg-[#121212] border border-zinc-800/90 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-orange-hover text-black flex items-center justify-center mx-auto shadow-glow-orange">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
              ADMIN <span className="text-brand-orange">PORTAL</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Restricted management access for store inventory, orders, and sales analytics.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@jutarghor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-orange transition-all"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Master Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-orange transition-all"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-orange transition-all"
          >
            {loading ? 'Verifying Admin Access...' : 'Login to Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Fill */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-center space-y-2">
          <span className="text-[11px] text-zinc-400 font-semibold block">
            ⚡ Administrator Demo Credentials
          </span>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-brand-orange transition-colors"
          >
            Auto-fill Admin (admin@jutarghor.com)
          </button>
        </div>

        {/* Bottom Notice */}
        <div className="text-center pt-2 border-t border-zinc-800/80">
          <p className="text-[11px] text-zinc-400">
            Looking for customer shopping?{' '}
            <Link to="/login" className="text-zinc-300 hover:text-brand-orange font-semibold underline">
              Customer Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
