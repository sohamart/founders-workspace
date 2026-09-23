import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Clock, 
  UserX,
  Volume2,
  X
} from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const StrikeAlertBanner = () => {
  const { currentUser, setCurrentTab } = usePortal();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!currentUser || (!currentUser.strikes && currentUser.status !== 'suspended')) {
    return null;
  }

  const strikes = currentUser.strikes || 0;
  const isSuspended = currentUser.status === 'suspended' || strikes >= 2;
  const latestStrike = currentUser.strikeHistory?.[0] || null;

  if (isDismissed && !isSuspended) {
    return null;
  }

  return (
    <aside 
      aria-label="Disciplinary Warning Banner"
      className="w-full bg-gradient-to-r from-red-950 via-rose-950 to-red-950 border-b border-red-500/80 text-white shadow-md shadow-red-950/30 relative z-10 transition-all animate-fade-in"
    >
      <div className="max-w-[1700px] mx-auto px-3 sm:px-4 py-1.5 md:py-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          
          {/* Left: Sleek Danger Alert Strip */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="shrink-0 w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
              {isSuspended ? <UserX className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            </span>

            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-red-600/90 text-white font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">
                {isSuspended ? 'SUSPENDED' : `STRIKE #${strikes}`}
              </span>
              <span className="text-[11px] font-bold text-red-100 truncate">
                {isSuspended 
                  ? 'Rule 28 Enforcement: Account Suspension' 
                  : (latestStrike?.rule ? `Warning: ${latestStrike.rule}` : 'Disciplinary Warning Recorded')}
              </span>
              <span className="hidden lg:inline text-red-300 text-[10px] truncate">
                {isSuspended ? 'Contact Super Admin' : '2 strikes trigger automated suspension'}
              </span>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 rounded-lg bg-red-900/80 hover:bg-red-800 text-white font-medium text-[10px] sm:text-xs border border-red-600/50 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpanded ? 'Hide' : 'Details'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setCurrentTab('rules');
              }}
              className="px-2 py-1 rounded-lg bg-white text-red-950 font-bold text-[10px] sm:text-xs hover:bg-red-50 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3 h-3 text-red-600" />
              <span>Rules</span>
            </button>

            {!isSuspended && (
              <button
                onClick={() => setIsDismissed(true)}
                title="Dismiss alert banner from view"
                className="p-1 rounded-lg text-red-300 hover:text-white hover:bg-red-900/80 transition-colors ml-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Collapsible Infraction Details Card */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-red-800/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs animate-fade-in">
            <div className="p-2.5 rounded-xl bg-black/40 border border-red-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-red-400 block font-mono">Infraction Reason</span>
              <p className="text-red-100 text-[11px] leading-relaxed">
                {latestStrike?.reason || 'Rule infraction recorded by Lead Admin.'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-red-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-red-400 block font-mono">Compliance & Remedy</span>
              <p className="text-red-200 text-[11px] leading-relaxed">
                Refer to Rule 26 & 28 in the Charter. You can petition the Lead Admin for review or executive pardon once the required deliverable is resolved.
              </p>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};
