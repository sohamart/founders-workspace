import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';
import { KeyRound, Sparkles, Lock, Calendar, ExternalLink } from 'lucide-react';

import { LoginModal } from './LoginModal';

export const ComingSoonModal = () => {
  const { verifyBypass, portalSettings } = usePortal();
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const isBypassAllowed = portalSettings?.allowBypass !== false;

  // Target Launch Date countdown calculation
  const targetDateStr = portalSettings?.targetLaunchDate || '2026-10-01T00:00:00.000Z';
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDateStr).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  const handleBypassSubmit = async (e) => {
    e.preventDefault();
    if (!passcode) return;
    setIsVerifying(true);
    setError('');

    const res = await verifyBypass(passcode);
    setIsVerifying(false);
    if (!res.success) {
      setError('Invalid access passcode. Hint: Use FOUNDERS#2026#SECRET');
    }
  };

  const formattedDate = (() => {
    try {
      return new Date(targetDateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'October 1, 2026 • 00:00 UTC';
    }
  })();

  if (showAdminLogin) {
    return <LoginModal onBack={() => setShowAdminLogin(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-gradient-to-br from-amber-50/95 via-orange-50/85 to-stone-100/95 backdrop-blur-xl text-slate-800 animate-fade-in overflow-y-auto">
      {/* Warm Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] md:w-[650px] h-[320px] sm:h-[500px] md:h-[650px] bg-gradient-to-tr from-orange-400/20 to-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-48 sm:w-80 h-48 sm:h-80 bg-amber-300/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-lg w-full bg-white/95 backdrop-blur-2xl border border-orange-200/90 rounded-3xl p-4 sm:p-7 md:p-9 shadow-2xl shadow-orange-950/10 text-center space-y-4 sm:space-y-6 my-auto max-h-[96vh] overflow-y-auto">
        
        {/* Dual Brand Lockup - Fully Responsive & Mobile-Wrapped */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 max-w-full">
            <a
              href="https://weblets.bond"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-bold tracking-tight shadow transition-colors shrink-0"
            >
              <span>Weblets®</span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal">weblets.bond</span>
            </a>
            <span className="text-orange-500 font-bold text-xs sm:text-sm">×</span>
            <a
              href="https://stackadda.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-mono font-bold tracking-tight shadow transition-colors shrink-0"
            >
              <span>StackAdda™</span>
              <span className="text-[9px] sm:text-[10px] text-orange-200 font-normal">stackadda.me</span>
            </a>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-orange-600/90 font-mono text-center">
            Executive Joint Venture Portal
          </span>
        </div>

        {/* Hero Title & Vision - No Overflow */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-orange-100/90 border border-orange-300/80 text-orange-800 text-[10px] sm:text-[11px] font-bold max-w-full">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-600 shrink-0" />
            <span className="truncate">Under Private Assembly • Launch Countdown</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 break-words leading-tight">
            Founders' Work Portal
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            "Three Founders. Two Brands. One Standard." Private command center for agency execution, accountability, client projects, and executive governance.
          </p>
        </div>

        {/* Animated Countdown Timer Flip-Cards - Responsive Grid */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 max-w-xs sm:max-w-sm mx-auto">
            <div className="flex flex-col items-center bg-orange-50/90 border border-orange-200/90 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-sm">
              <span className="font-mono font-black text-xl sm:text-2xl md:text-3xl text-orange-700 tracking-tight">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Days</span>
            </div>
            <div className="flex flex-col items-center bg-orange-50/90 border border-orange-200/90 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-sm">
              <span className="font-mono font-black text-xl sm:text-2xl md:text-3xl text-orange-700 tracking-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Hours</span>
            </div>
            <div className="flex flex-col items-center bg-orange-50/90 border border-orange-200/90 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-sm">
              <span className="font-mono font-black text-xl sm:text-2xl md:text-3xl text-orange-700 tracking-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Mins</span>
            </div>
            <div className="flex flex-col items-center bg-orange-50/90 border border-orange-200/90 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-sm">
              <span className="font-mono font-black text-xl sm:text-2xl md:text-3xl text-orange-700 tracking-tight">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Secs</span>
            </div>
          </div>

          {/* Launch Date & Time Pill - Fully Wrapping */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-slate-600 text-[10px] sm:text-xs font-medium max-w-full text-center">
            <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>Public Launch: <strong className="text-slate-900 font-bold">{formattedDate}</strong></span>
          </div>
        </div>

        {/* Action Button: Bypass Passcode or Disabled Notice */}
        <div className="pt-0.5 space-y-2.5">
          {isBypassAllowed ? (
            <>
              <button
                onClick={() => setShowPasscodeModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20 active:scale-[0.99] transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Founder & Admin Passcode Unlock</span>
              </button>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                Authorized personnel only • All bypass attempts logged
              </p>
            </>
          ) : (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Passcode Bypass Disabled</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Portal unlock is currently disabled by the Lead Admin. Please await the official launch.
              </p>
            </div>
          )}

          {/* Lead Admin Sign In Direct Option */}
          <button
            type="button"
            onClick={() => setShowAdminLogin(true)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <KeyRound className="w-3.5 h-3.5 text-orange-600" />
            <span>Lead Admin Sign In</span>
          </button>
        </div>

        {/* Passcode Modal Overlay */}
        {showPasscodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-md animate-fade-in">
            <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-7 max-w-sm w-full shadow-2xl border border-orange-200 text-left space-y-3.5 sm:space-y-4 my-auto">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">Executive Passcode</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">Enter passcode to bypass coming soon</p>
                </div>
              </div>

              <form onSubmit={handleBypassSubmit} className="space-y-3.5 sm:space-y-4">
                <div>
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter bypass passcode..."
                    className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-orange-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50/30"
                    autoFocus
                  />
                  {error && <p className="text-[10px] sm:text-[11px] text-rose-600 mt-1.5 font-medium">{error}</p>}
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowPasscodeModal(false)}
                    className="flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="flex-1 py-2 sm:py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-600/20 disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Unlock Portal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
