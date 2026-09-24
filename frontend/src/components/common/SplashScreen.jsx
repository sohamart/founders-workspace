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
      
      {/* LEFT DOOR PANEL (Silky smooth GPU-accelerated slide left - Single Flush Meeting Seam) */}
      <div 
        style={{
          transition: 'transform 1.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: 'transform',
          transform: isOpening ? 'translate3d(-101%, 0, 0)' : 'translate3d(0, 0, 0)',
          backgroundColor: '#f8fafc'
        }}
        className="fixed inset-y-0 left-0 w-1/2 bg-[#f8fafc] bg-gradient-to-r from-slate-100 via-slate-50 to-[#f8fafc] pointer-events-auto backdrop-blur-3xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Single clean 1px hairline seam (only on one door, stops cleanly above center card) */}
        <div className="absolute right-0 top-10 h-[calc(50%-115px)] max-h-[35vh] w-[1px] bg-gradient-to-b from-transparent via-orange-400/50 to-transparent pointer-events-none" />
        
        {/* Single clean 1px hairline seam (stops cleanly before footer) */}
        <div className="absolute right-0 bottom-16 h-[calc(50%-115px)] max-h-[35vh] w-[1px] bg-gradient-to-t from-transparent via-orange-400/50 to-transparent pointer-events-none" />
      </div>

      {/* RIGHT DOOR PANEL (Silky smooth GPU-accelerated slide right - Flush Meeting Surface) */}
      <div 
        style={{
          transition: 'transform 1.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: 'transform',
          transform: isOpening ? 'translate3d(101%, 0, 0)' : 'translate3d(0, 0, 0)',
          backgroundColor: '#f8fafc'
        }}
        className="fixed inset-y-0 right-0 w-1/2 bg-[#f8fafc] bg-gradient-to-l from-slate-100 via-slate-50 to-[#f8fafc] pointer-events-auto backdrop-blur-3xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* CENTER EXECUTIVE EMBLEM CARD (Discrete light card container - no line cuts through it!) */}
      <div 
        style={{
          transition: 'opacity 0.75s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.75s cubic-bezier(0.2, 0.8, 0.2, 1)',
          willChange: 'opacity, transform',
          opacity: isOpening ? 0 : 1,
          transform: isOpening ? 'scale(0.92)' : 'scale(1)'
        }}
        className="fixed inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
      >
        {/* Ambient warm radial glow flare */}
        <div className="absolute w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-orange-400/20 via-amber-300/15 to-transparent blur-[100px] animate-pulse" />

        {/* Clean Luxury Center Div / Card in Light Theme */}
        <div className="relative flex flex-col items-center space-y-4 px-8 sm:px-10 py-5 sm:py-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.08),0_4px_20px_rgba(249,115,22,0.12)] backdrop-blur-2xl">
          
          {/* Dual Brand Badges */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-inner">
            <span className="bg-slate-900 text-white font-mono font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl tracking-tight shadow-md">
              Weblets®
            </span>
            <span className="text-orange-500 font-bold text-xs sm:text-sm px-0.5">×</span>
            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white font-mono font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl tracking-tight shadow-md shadow-orange-500/25">
              StackAdda™
            </span>
          </div>

          {/* Subtitle */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-slate-600 font-semibold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>FOUNDERS WORKSPACE V2.0</span>
          </div>

          {/* Hairline Progress Beam */}
          <div className="w-48 sm:w-60 h-[3px] rounded-full bg-slate-100 border border-slate-200/60 overflow-hidden relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(249,115,22,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quiet Footer */}
        <div className="absolute bottom-8 text-[10px] font-mono text-slate-500 tracking-wider font-medium">
          DISCIPLINE • EXECUTION • INTEGRITY
        </div>
      </div>

    </div>
  );
};

export default SplashScreen;
