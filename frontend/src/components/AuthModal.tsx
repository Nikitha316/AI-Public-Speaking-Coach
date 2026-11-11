import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Briefcase, LogIn, UserPlus, KeyRound, CheckCircle2 } from 'lucide-react';
import { api, setToken } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('Professional');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await api.register({
          email,
          password,
          full_name: fullName || 'Public Speaker',
          target_role: targetRole,
        });
        setToken(res.access_token);
        const me = await api.getMe();
        onSuccess(me);
        onClose();
      } else if (mode === 'login') {
        const res = await api.login({
          username: email,
          password,
        });
        setToken(res.access_token);
        const me = await api.getMe();
        onSuccess(me);
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.resetPassword({
          email,
          new_password: newPassword,
        });
        setSuccessMsg(res.message);
        setTimeout(() => {
          setMode('login');
          setPassword(newPassword);
          setSuccessMsg('');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-3xl max-w-md w-full border border-slate-700 bg-dark-900 p-6 sm:p-8 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-2 border border-brand-500/30 shadow-lg">
            {mode === 'register' && <UserPlus className="w-6 h-6" />}
            {mode === 'login' && <LogIn className="w-6 h-6" />}
            {mode === 'forgot' && <KeyRound className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {mode === 'register' && 'Create Speaker Account'}
            {mode === 'login' && 'Welcome Back'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'register' && 'Sign up to track personalized speaking performance'}
            {mode === 'login' && 'Log in to access your practice history & plans'}
            {mode === 'forgot' && 'Enter your registered email and choose a new password'}
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-4 text-center">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="speaker@example.com"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-[11px] font-semibold text-brand-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {mode === 'forgot' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Target Persona / Goal</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="Student">Student (Seminars, Viva, Presentations)</option>
                  <option value="Job Seeker">Job Seeker (Mock Interviews, HR Rounds)</option>
                  <option value="Professional">Professional (Meetings, Pitches, Keynotes)</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg transition-all glow-indigo mt-2"
          >
            {loading ? 'Processing...' : mode === 'register' ? 'Register Account' : mode === 'forgot' ? 'Set New Password' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 pt-4 border-t border-slate-800">
          {mode === 'forgot' ? (
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className="text-brand-400 font-bold hover:underline"
            >
              ← Back to Sign In
            </button>
          ) : mode === 'register' ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="text-brand-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className="text-brand-400 font-bold hover:underline"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
