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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070B14] text-white px-4 transition-all duration-700 select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-orange-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      {/* Central Content Box */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full space-y-7">
        
        {/* Animated Brand Emblem */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Neon Ring */}
          <div className="absolute w-28 h-28 rounded-3xl bg-gradient-to-tr from-orange-500/30 to-cyan-500/30 blur-md animate-spin-slow" />
          <div className="absolute w-24 h-24 rounded-2xl border border-orange-500/40 animate-ping opacity-25" />
          
          {/* Core Icon Platter */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-700/80 shadow-2xl flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/40">
              <Zap className="w-6 h-6 text-white animate-bounce" />
            </div>
          </div>
        </div>

        {/* Brand Names & Tagline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] font-mono tracking-widest text-slate-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Executive Portal v2.0</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Weblets®
            </span>
            <span className="text-orange-500 font-light">×</span>
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              StackAdda™
            </span>
          </h1>

          <p className="text-xs font-medium text-slate-400 tracking-wide">
            Three Founders. Two Brands. One Standard.
          </p>
        </div>

        {/* Dynamic Progress Bar & Status Text */}
        <div className="w-full space-y-2.5 pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 line-clamp-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow shrink-0" />
              <span>{statusText}</span>
            </span>
            <span className="text-orange-400 font-bold ml-2 shrink-0">{progress}%</span>
          </div>

          {/* Glowing Track */}
          <div className="w-full h-2 rounded-full bg-slate-800/80 p-0.5 border border-slate-700/50 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-400 transition-all duration-150 ease-out shadow-lg shadow-orange-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Skip / Enter Action */}
        <button
          onClick={handleSkip}
          className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 pt-2 cursor-pointer font-mono"
        >
          <span>Skip initialization</span>
          <ArrowRight className="w-3 h-3" />
        </button>

      </div>
    </div>
  );
};

export default SplashScreen;
