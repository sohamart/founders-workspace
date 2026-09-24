import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../utils/soundFx';

export const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // Smooth, steady cinematic boot progress (~1000ms)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  // When progress reaches 100%, smoothly glide open the doors with slow, cinematic easing
  useEffect(() => {
    if (progress >= 100) {
      sound.unlockAudio();
      sound.playPop();

      // Brief pause before doors begin sliding open
      const openTimer = setTimeout(() => {
        setIsOpening(true);

        // Keep mounted until doors have completely and smoothly cleared the viewport
        const finishTimer = setTimeout(() => {
          if (onFinishRef.current) {
            onFinishRef.current();
          }
        }, 1250);

        return () => clearTimeout(finishTimer);
      }, 200);

      return () => clearTimeout(openTimer);
    }
  }, [progress]);

  // Safety fallback
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (onFinishRef.current) {
        onFinishRef.current();
      }
    }, 2800);
    return () => clearTimeout(safetyTimer);
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none select-none overflow-hidden">
      
      {/* LEFT DOOR PANEL (Silky smooth GPU-accelerated slide left) */}
      <div 
        style={{
          transition: 'transform 1.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: 'transform',
          transform: isOpening ? 'translate3d(-101%, 0, 0)' : 'translate3d(0, 0, 0)'
        }}
        className="fixed inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 pointer-events-auto"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-600/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Top seam line - terminates cleanly above center logo card */}
        <div className="absolute right-0 top-8 h-[calc(50%-110px)] max-h-[35vh] w-[1px] bg-gradient-to-b from-transparent via-orange-500/60 to-transparent shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
        
        {/* Bottom seam line - starts below center logo card and stops before footer */}
        <div className="absolute right-0 bottom-16 h-[calc(50%-110px)] max-h-[35vh] w-[1px] bg-gradient-to-t from-transparent via-orange-500/60 to-transparent shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
      </div>

      {/* RIGHT DOOR PANEL (Silky smooth GPU-accelerated slide right) */}
      <div 
        style={{
          transition: 'transform 1.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: 'transform',
          transform: isOpening ? 'translate3d(101%, 0, 0)' : 'translate3d(0, 0, 0)'
        }}
        className="fixed inset-y-0 right-0 w-1/2 bg-gradient-to-l from-slate-950 via-slate-900 to-slate-950 pointer-events-auto"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-600/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Top seam line - terminates cleanly above center logo card */}
        <div className="absolute left-0 top-8 h-[calc(50%-110px)] max-h-[35vh] w-[1px] bg-gradient-to-b from-transparent via-orange-500/60 to-transparent shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
        
        {/* Bottom seam line - starts below center logo card and stops before footer */}
        <div className="absolute left-0 bottom-16 h-[calc(50%-110px)] max-h-[35vh] w-[1px] bg-gradient-to-t from-transparent via-orange-500/60 to-transparent shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
      </div>

      {/* CENTER EXECUTIVE EMBLEM CARD (Discrete card container - no line cuts through it!) */}
      <div 
        style={{
          transition: 'opacity 0.75s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.75s cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: 'opacity, transform',
          opacity: isOpening ? 0 : 1,
          transform: isOpening ? 'scale(0.92)' : 'scale(1)'
        }}
        className="fixed inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
      >
        {/* Ambient radial glow flare */}
        <div className="absolute w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-orange-600/20 via-amber-500/10 to-transparent blur-[110px] animate-pulse" />

        {/* Clean Luxury Center Div / Card */}
        <div className="relative flex flex-col items-center space-y-4 px-8 sm:px-10 py-5 sm:py-6 rounded-3xl bg-[#0c101c]/95 border border-orange-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(249,115,22,0.18)] backdrop-blur-2xl">
          
          {/* Dual Brand Badges */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.06] border border-white/[0.12] shadow-inner">
            <span className="bg-white text-slate-950 font-mono font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl tracking-tight shadow-md">
              Weblets®
            </span>
            <span className="text-orange-500 font-bold text-xs sm:text-sm px-0.5">×</span>
            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white font-mono font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl tracking-tight shadow-lg shadow-orange-500/30">
              StackAdda™
            </span>
          </div>

          {/* Subtitle */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-slate-300 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>FOUNDERS WORKSPACE V2.0</span>
          </div>

          {/* Hairline Progress Beam */}
          <div className="w-48 sm:w-60 h-[2.5px] rounded-full bg-white/[0.1] overflow-hidden relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(249,115,22,0.9)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quiet Footer */}
        <div className="absolute bottom-8 text-[10px] font-mono text-slate-500 tracking-wider">
          DISCIPLINE • EXECUTION • INTEGRITY
        </div>
      </div>

    </div>
  );
};

export default SplashScreen;
