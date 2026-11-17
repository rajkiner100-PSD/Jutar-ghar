import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdminRoute = location.pathname.includes('/admin');

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
        login(res.data.token, res.data.user);
        showToast('Welcome back!', `Logged in as ${res.data.user.full_name}`, 'success');

        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid email or password.';
      setError(msg);
      showToast('Login Failed', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@jutarghor.com');
    setPassword('admin123');
  };

  const fillCustomerCredentials = () => {
    setEmail('rahim@gmail.com');
    setPassword('customer123');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-3xl bg-[#141414] border border-zinc-800 space-y-6 shadow-2xl">
        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange text-black font-black text-xl flex items-center justify-center mx-auto shadow-glow-orange">
            JG
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            {isAdminRoute ? 'Admin Management Login' : 'Sign in to Jutar Ghor'}
          </h1>
          <p className="text-xs text-zinc-400">
            {isAdminRoute
              ? 'Access products, stock tracking, and orders management.'
              : 'Track past orders, save sneakers to wishlist, and checkout faster.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-orange transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Fill Buttons for Fast Reviewer Testing */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block text-center">
            ⚡ Quick Test Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-brand-orange transition-colors"
            >
              Fill Admin
            </button>
            <button
              type="button"
              onClick={fillCustomerCredentials}
              className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-300 transition-colors"
            >
              Fill Customer
            </button>
          </div>
        </div>

        {/* Bottom Switch */}
        <div className="text-center text-xs text-zinc-400 pt-2 border-t border-zinc-800">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="text-brand-orange font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};
