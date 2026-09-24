import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Smartphone, Laptop, Check, X, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const PwaInstallButton = ({ className = '', variant = 'button' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if already installed / standalone
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // App installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
      sound.playChime();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    sound.playPop();

    if (isInstalled) {
      setShowModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        sound.playChime();
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // If prompt not ready or on iOS/Safari, show the instructions modal
      setShowModal(true);
    }
  };

  // If already installed and variant is subtle, we can render a quiet installed badge or button
  if (variant === 'badge' && isInstalled) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
        <Check className="w-3 h-3" />
        <span>App Installed</span>
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
          isInstalled
            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/20 hover:scale-[1.02]'
        } ${className}`}
        title={isInstalled ? 'Founders App Installed on this device' : 'Install Founders Workspace App on Mobile/PC'}
      >
        {isInstalled ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">App Installed</span>
            <span className="sm:hidden">App ✓</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-amber-200" />
            <span className="hidden sm:inline">Install App</span>
            <span className="sm:hidden">Install</span>
          </>
        )}
      </button>

      {/* PWA Information & Installation Instructions Modal */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in text-slate-800 select-none">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-orange-200/90 space-y-5 text-center relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official App Logo */}
            <div className="flex justify-center pt-2">
              <div className="w-24 h-24 rounded-3xl p-1 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-700 shadow-xl shadow-orange-600/20">
                <img 
                  src="/pwa-192x192.png" 
                  alt="Founders Workspace App Icon" 
                  className="w-full h-full rounded-[22px] object-cover"
                />
              </div>
            </div>

            {/* Title & Brand */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-200">
                  OFFICIAL PWA LAUNCHER
                </span>
                {isInstalled && (
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    INSTALLED
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Founders Workspace App
              </h3>
              <p className="text-xs text-slate-500">
                Weblets® × StackAdda™ • Executive Standalone Experience
              </p>
            </div>

            {/* Features Highlight */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Smartphone className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Runs like a native mobile & desktop app with no browser URL bar</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Laptop className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Instant 1-click launcher from Windows Taskbar / Mac Dock / Home Screen</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Offline caching and ultra-fast real-time team synchronization</span>
              </div>
            </div>

            {/* Instructions based on platform */}
            {isInstalled ? (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                ✓ Founders Workspace is already installed as a standalone web app on this device.
              </div>
            ) : isIOS ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-1.5 text-xs text-amber-950">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <span>📱 How to Install on iPhone / iPad:</span>
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-700">
                  <li>Tap the <strong>Share</strong> button (box with arrow ↑) in Safari.</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong> (+).</li>
                  <li>Tap <strong>"Add"</strong> in the top-right corner.</li>
                </ol>
              </div>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install App on this Device Now</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1 text-xs text-slate-600">
                <p className="font-bold text-slate-800">Desktop & Android Quick Install:</p>
                <p>Click the <strong>Install icon (⊕ or ⬇)</strong> in your browser's address bar (Chrome / Edge), or tap browser menu (⋮) → <strong>"Install app"</strong>.</p>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
