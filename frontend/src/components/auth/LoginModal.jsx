import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Lock, Mail, ShieldCheck, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const LoginModal = ({ onBack }) => {
  const { login } = usePortal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError('');

    const res = await login(email.trim(), password);
    setIsLoading(false);
    if (!res.success) {
      sound.playWarning();
      setError(res.message || 'Invalid credentials.');
    } else {
      sound.playChime();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in text-slate-800">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3 py-1 rounded-lg text-xs font-mono font-bold shadow-xs">
              Weblets®
            </span>
            <span className="text-slate-400 font-light text-xs">×</span>
            <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-mono font-bold shadow-xs">
              StackAdda™
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Founders Workspace Login</h2>
          <p className="text-xs text-slate-500">Sign in with your executive email and secure password</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {onBack && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              ← Back to Launch Countdown
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginModal;
