import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  Compass, 
  Home, 
  ArrowLeft, 
  Search, 
  Layers, 
  Calendar, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const NotFoundView = ({ onGoHome }) => {
  const { setCurrentTab } = usePortal();

  const handleNavigate = (tab) => {
    sound.playPop();
    if (onGoHome && tab === 'dashboard') {
      onGoHome();
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in text-slate-800">
      {/* Warm Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-tr from-orange-400/15 to-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-300/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-lg w-full bg-white/95 backdrop-blur-2xl border border-orange-200/90 rounded-3xl p-6 sm:p-9 md:p-10 shadow-2xl shadow-orange-950/10 text-center space-y-6 my-auto">
        
        {/* Dual Brand Lockup */}
        <div className="flex items-center justify-center gap-2">
          <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs">
            Weblets®
          </span>
          <span className="text-orange-500 font-bold text-xs">×</span>
          <span className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-xs">
            StackAdda™
          </span>
        </div>

        {/* 404 Floating Emblem */}
        <div className="relative flex items-center justify-center pt-2">
          {/* Outer Pulsing Glow */}
          <div className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-400/25 blur-lg animate-pulse" />
          
          <div className="relative flex flex-col items-center">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 shadow-xl flex items-center justify-center mb-2">
              <Compass className="w-9 h-9 sm:w-10 sm:h-10 text-orange-600 animate-spin-slow" />
            </div>
            <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900">
              4<span className="text-orange-600">0</span>4
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-100/90 border border-orange-300/80 text-[10px] font-mono tracking-widest text-orange-900 uppercase font-bold">
            <span>Coordinate Unresolved</span>
          </div>

          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Lost in the Executive Orbit
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            The workspace protocol, task node, or tab coordinate you requested does not exist or has been relocated by governance.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="pt-1">
          <button
            onClick={() => handleNavigate('dashboard')}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Executive Dashboard</span>
          </button>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Available Workspace Hubs
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              onClick={() => handleNavigate('tasks')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 text-slate-700 hover:text-orange-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              <span>Tasks Board</span>
            </button>

            <button
              onClick={() => handleNavigate('projects')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 text-slate-700 hover:text-orange-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-orange-600" />
              <span>Client Projects</span>
            </button>

            <button
              onClick={() => handleNavigate('meetings')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 text-slate-700 hover:text-orange-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              <span>Meetings</span>
            </button>

            <button
              onClick={() => handleNavigate('rules')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 text-slate-700 hover:text-orange-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Rulebook</span>
            </button>
          </div>
        </div>

        {/* Footer Support Tag */}
        <p className="text-[10px] text-slate-400 font-mono">
          Founders Joint Venture Portal v2.0 • Protocol 404 Handled
        </p>

      </div>
    </div>
  );
};

export default NotFoundView;
