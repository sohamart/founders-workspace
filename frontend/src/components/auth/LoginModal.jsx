import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Lock, Mail, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const LoginModal = () => {
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

    const res = await login(email, password);
    setIsLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login(demoEmail, demoPass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
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
                placeholder="founder@weblets.bond"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50"
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
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Quick 1-Click Executive Access
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@weblets.bond', 'admin123')}
              className="p-2 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-950 font-medium text-left truncate transition-colors cursor-pointer"
            >
              👑 SSA Lead Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('soham@weblets.bond', 'password123')}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-left truncate transition-colors"
            >
              🚀 Soham (Product)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sayantan@weblets.bond', 'password123')}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-left truncate transition-colors"
            >
              🎨 Sayantan (UI/UX)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('achinta@weblets.bond', 'password123')}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium text-left truncate transition-colors"
            >
              🤝 Achinta (Client)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
