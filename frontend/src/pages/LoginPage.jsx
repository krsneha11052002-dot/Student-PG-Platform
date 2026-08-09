import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles, Building2, UserCheck, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage = ({ setCurrentTab }) => {
  const { login, loginAsDemo } = useAuth();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';

    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showSuccess(`Welcome back, ${res.user.name.split(' ')[0]}! 👋`);
        if (res.user.role === 'student') setCurrentTab('student-dashboard');
        else if (res.user.role === 'owner') setCurrentTab('owner-dashboard');
        else if (res.user.role === 'admin') setCurrentTab('admin-dashboard');
        else setCurrentTab('home');
      } else {
        showError(res.message || 'Invalid email or password');
        setErrors({ form: res.message });
      }
    } catch (err) {
      showError('Login failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    await loginAsDemo(role);
    showSuccess(`Logged in as Demo ${role.toUpperCase()}`);
    if (role === 'student') setCurrentTab('student-dashboard');
    else if (role === 'owner') setCurrentTab('owner-dashboard');
    else if (role === 'admin') setCurrentTab('admin-dashboard');
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-xl shadow-indigo-500/20 mx-auto">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Building2 className="w-7 h-7 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Welcome Back</h1>
        <p className="text-xs text-slate-500 font-medium">Log in to manage your PG wishlist, reviews, and community posts.</p>
      </div>

      {/* Main Login Card */}
      <div className="glass-card p-8 rounded-3xl space-y-6 shadow-2xl">
        
        {errors.form && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })); }}
                placeholder="student@university.edu"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-medium glass-input ${errors.email ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
              />
            </div>
            {errors.email && <span className="text-[10px] font-bold text-rose-500">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
              <button type="button" onClick={() => showSuccess('Demo Password: password123')} className="text-[10px] text-indigo-500 font-bold hover:underline">Forgot?</button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: null })); }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 rounded-xl text-xs font-medium glass-input ${errors.password ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-[10px] font-bold text-rose-500">{errors.password}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Log In to Account'}
          </button>
        </form>

        {/* Demo Fast Login Strip */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Instant Demo Sign-In</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('owner')}
              className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px] font-bold hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5" /> Owner
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
          </div>
        </div>

        {/* Register Prompt */}
        <div className="text-center text-xs font-semibold text-slate-500">
          Don't have an account?{' '}
          <button onClick={() => setCurrentTab('register')} className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline">
            Register Free
          </button>
        </div>
      </div>
    </div>
  );
};
