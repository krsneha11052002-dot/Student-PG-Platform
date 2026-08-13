import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { DELHI_COLLEGES } from '../context/CollegeContext';
import { UserPlus, Mail, Lock, User, GraduationCap, Building2, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const RegisterPage = ({ setCurrentTab }) => {
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [university, setUniversity] = useState(DELHI_COLLEGES[0].name);
  const [customUniversity, setCustomUniversity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 66, label: 'Medium', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full Name is required';
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
      const selectedUni = university === 'Other College (Not Listed)' ? customUniversity : university;
      const res = await register({ name, email, password, role, university: selectedUni });
      if (res.success) {
        showSuccess(`Welcome aboard, ${name.split(' ')[0]}! 🎉 Account created.`);
        if (role === 'student') setCurrentTab('student-dashboard');
        else if (role === 'owner') setCurrentTab('owner-dashboard');
        else setCurrentTab('home');
      } else {
        showError(res.message || 'Registration failed');
        setErrors({ form: res.message });
      }
    } catch (err) {
      showError('Registration failed. Please check network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-xl shadow-indigo-500/20 mx-auto">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <UserPlus className="w-7 h-7 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Create Account</h1>
        <p className="text-xs text-slate-500 font-medium">Join 2,400+ students & PG owners on StaySmart AI.</p>
      </div>

      {/* Form Card */}
      <div className="glass-card p-8 rounded-3xl space-y-6 shadow-2xl">
        
        {/* Role Selector Chips */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Account Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                role === 'student'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                role === 'owner'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" /> PG Owner
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: null })); }}
                placeholder="Aarav Sharma"
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-medium glass-input ${errors.name ? 'border-rose-500 ring-1 ring-rose-500' : ''}`}
              />
            </div>
            {errors.name && <span className="text-[10px] font-bold text-rose-500">{errors.name}</span>}
          </div>

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

          {/* University (for student) */}
          {role === 'student' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">University / Campus</label>
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full p-3 rounded-xl text-xs font-bold glass-input cursor-pointer"
              >
                {DELHI_COLLEGES.map((college) => (
                  <option key={college.id} value={college.name}>
                    {college.name} ({college.shortName})
                  </option>
                ))}
              </select>
              {university === 'Other College (Not Listed)' && (
                <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                  <input
                    type="text"
                    value={customUniversity}
                    onChange={(e) => setCustomUniversity(e.target.value)}
                    placeholder="Enter your university/college name"
                    className="w-full p-3 rounded-xl text-xs font-medium glass-input"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: null })); }}
                placeholder="At least 6 characters"
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

            {/* Password Strength Meter */}
            {password && (
              <div className="space-y-1 pt-1">
                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Strength: {strength.label}</span>
                  <span>{password.length}/6 chars</span>
                </div>
              </div>
            )}
            {errors.password && <span className="text-[10px] font-bold text-rose-500">{errors.password}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        {/* Login Prompt */}
        <div className="text-center text-xs font-semibold text-slate-500">
          Already have an account?{' '}
          <button onClick={() => setCurrentTab('login')} className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline">
            Log In Here
          </button>
        </div>
      </div>
    </div>
  );
};
