import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, Cpu, Zap, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing secure executive workspace...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const statuses = [
      { at: 15, text: 'Synchronizing Weblets® × StackAdda™ tokens...' },
      { at: 40, text: 'Mounting 30 Constitutional Rules & Protocol v2.0...' },
      { at: 70, text: 'Establishing realtime WebSocket synchronization...' },
      { at: 90, text: 'Verifying Lead Admin governance & radar...' },
      { at: 100, text: 'Workspace operational. Welcome!' }
    ];

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = Math.min(100, prev + 3);
        const match = statuses.filter(s => next >= s.at).pop();
        if (match) setStatusText(match.text);
        return next;
      });
    }, 45);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      sound.playChime();
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 600);
      }, 400);

      return () => clearTimeout(fadeTimer);
    }
  }, [progress, onFinish]);

  const handleSkip = () => {
    sound.playPop();
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-amber-50/95 via-orange-50/85 to-stone-100/95 text-slate-800 px-4 transition-all duration-700 select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-gradient-to-tr from-orange-400/20 to-amber-300/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />
      
      {/* Central Glassmorphic Card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full bg-white/95 backdrop-blur-2xl border border-orange-200/90 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-orange-950/10 space-y-6 my-auto">
        
        {/* Animated Brand Emblem */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Glow */}
          <div className="absolute w-24 h-24 rounded-3xl bg-gradient-to-tr from-orange-500/25 to-amber-400/30 blur-md animate-spin-slow" />
          <div className="absolute w-20 h-20 rounded-2xl border border-orange-400/40 animate-ping opacity-30" />
          
          {/* Core Icon Platter */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white border border-orange-200/90 shadow-lg flex items-center justify-center">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-600/30">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce" />
            </div>
          </div>
        </div>

        {/* Brand Names & Tagline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-100/90 border border-orange-300/80 text-[10px] font-mono tracking-widest text-orange-900 uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Executive Joint Venture Portal</span>
          </div>

          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span className="bg-slate-900 text-white px-3 py-1 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-tight shadow-xs">
              Weblets®
            </span>
            <span className="text-orange-500 font-bold text-xs sm:text-sm">×</span>
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3 py-1 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-tight shadow-xs">
              StackAdda™
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-500 tracking-wide pt-0.5">
            Three Founders. Two Brands. One Standard.
          </p>
        </div>

        {/* Dynamic Progress Bar & Status Text */}
        <div className="w-full space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-600 flex items-center gap-1.5 line-clamp-1 font-medium">
              <Cpu className="w-3.5 h-3.5 text-orange-600 animate-spin-slow shrink-0" />
              <span>{statusText}</span>
            </span>
            <span className="text-orange-600 font-black ml-2 shrink-0">{progress}%</span>
          </div>

          {/* Clean Progress Track */}
          <div className="w-full h-2 rounded-full bg-orange-50 p-0.5 border border-orange-200/80 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 transition-all duration-150 ease-out shadow-sm shadow-orange-500/40"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Skip / Enter Action */}
        <button
          onClick={handleSkip}
          className="text-[11px] text-slate-400 hover:text-orange-700 transition-colors flex items-center gap-1 cursor-pointer font-mono pt-1"
        >
          <span>Skip initialization</span>
          <ArrowRight className="w-3 h-3" />
        </button>

      </div>
    </div>
  );
};

export default SplashScreen;
