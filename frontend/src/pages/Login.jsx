import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back to RecipeBox!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-lg space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight dark:text-white">Welcome Back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-455">
            Log in to cook, rate, and plan your weekly meals!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-brand-500 transition-all dark:text-white"
              />
              <FiMail className="absolute left-3.5 top-3.5 text-slate-450 w-4 h-4" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-brand-500 transition-all dark:text-white"
              />
              <FiLock className="absolute left-3.5 top-3.5 text-slate-450 w-4 h-4" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            <FiLogIn /> {loading ? 'Logging in...' : 'Sign In'}
          </button>

        </form>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 font-bold hover:underline">
              Create one now
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
export default Login;
