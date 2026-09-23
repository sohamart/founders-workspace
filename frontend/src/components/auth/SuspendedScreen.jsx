import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { ShieldAlert, AlertTriangle, LogOut, PhoneCall } from 'lucide-react';

export const SuspendedScreen = () => {
  const { currentUser, logout } = usePortal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 text-slate-100 backdrop-blur-xl animate-fade-in">
      <div className="max-w-lg w-full bg-slate-900 border border-red-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-center">
        
        {/* Red Warning Shield */}
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-500 mx-auto flex items-center justify-center shadow-lg animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            Account Suspended • 2 Strikes Accumulated
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-3">
            Access Revoked by Operating Protocol
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            In accordance with <strong>Rule 27 (One Chance Policy)</strong> and <strong>Rule 28 (Removal from Team)</strong>, this account has been automatically suspended due to multiple active violations.
          </p>
        </div>

        {/* Violation History Ledger */}
        <div className="text-left bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-800 pb-2">
            <span>Recorded Violation Strikes</span>
            <span className="text-red-400 font-bold">{currentUser?.strikes || 2} Active Strikes</span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {currentUser?.strikeHistory && currentUser.strikeHistory.length > 0 ? (
              currentUser.strikeHistory.map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/30 text-xs space-y-1">
                  <div className="flex items-center justify-between text-red-400 font-semibold text-[11px]">
                    <span>Violation: Rule {s.ruleNumber || 'Charter'}</span>
                    <span className="text-slate-500">{new Date(s.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{s.reason}</p>
                </div>
              ))
            ) : (
              <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/30 text-xs text-slate-300">
                Multiple unnotified deadline misses or administrative action.
              </div>
            )}
          </div>
        </div>

        {/* Resolution Instructions */}
        <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 text-left flex items-start gap-2.5">
          <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            To petition for review or account reactivation, contact <strong>Lead Admin (SSA TEAM)</strong>. Only the Super Admin possesses clearance to pardon strikes or reactivate accounts.
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-700"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Switch Account</span>
        </button>

      </div>
    </div>
  );
};
