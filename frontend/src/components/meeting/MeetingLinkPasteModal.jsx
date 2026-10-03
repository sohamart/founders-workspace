import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../../context/PortalContext';
import { X, Video, Link as LinkIcon, Clock, AlertTriangle, ShieldCheck, CheckCircle2, Clipboard } from 'lucide-react';
import { sound } from '../../utils/soundFx';
import { formatDateTime, getMeetingLinkWindowStatus } from '../../utils/formatters';

export const MeetingLinkPasteModal = ({ onClose, targetMeeting }) => {
  const { meeting, submitMeetingLink, currentUser } = usePortal();
  const activeMeeting = targetMeeting || meeting;

  const [linkInput, setLinkInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [windowInfo, setWindowInfo] = useState(() => 
    getMeetingLinkWindowStatus(activeMeeting?.scheduledTime, activeMeeting?.meetLink)
  );

  const isAdmin = currentUser?.role === 'superadmin';

  // Real-time tick every second to keep the 10-minute countdown accurate
  useEffect(() => {
    const update = () => {
      if (activeMeeting?.scheduledTime) {
        setWindowInfo(getMeetingLinkWindowStatus(activeMeeting.scheduledTime, activeMeeting.meetLink));
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeMeeting]);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setLinkInput(text.trim());
        sound.playPop();
      }
    } catch {
      // Fallback if clipboard permission not granted
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!linkInput.trim()) return;

    if (!linkInput.trim().startsWith('http://') && !linkInput.trim().startsWith('https://')) {
      alert('Please enter a valid URL starting with https:// or http://');
      return;
    }

    setIsSubmitting(true);
    const res = await submitMeetingLink(activeMeeting.id, linkInput.trim());
    setIsSubmitting(false);

    if (res && res.success) {
      onClose();
    }
  };

  if (!activeMeeting) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in text-slate-800">
      <div className="bg-white w-full max-w-lg rounded-3xl flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-700">
                Rule 06 • Live Meeting Dispatch
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Submit Live Meeting Link
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Target Meeting Brief */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Meeting Topic</span>
              <span className="text-[10px] font-mono font-bold text-orange-700">
                {activeMeeting.scheduledTime ? formatDateTime(activeMeeting.scheduledTime) : 'Date Pending'}
              </span>
            </div>
            <p className="font-bold text-slate-800 text-sm truncate">{activeMeeting.title}</p>
          </div>

          {/* Window Timer Status Alert */}
          {windowInfo.status === 'locked' && !isAdmin ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Link Window Locked (Opens 5 Min Before Call)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-700">
                Under the strict meeting security protocol, the live link submission window unlocks at{' '}
                <strong>{windowInfo.openTime ? formatDateTime(new Date(windowInfo.openTime)) : ''}</strong> (5 minutes prior to scheduled start). You will have a 10-minute window to paste the link.
              </p>
            </div>
          ) : windowInfo.status === 'active' || isAdmin ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Submission Window is LIVE!</span>
                </span>
                {windowInfo.timerLabel && (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs shadow-xs">
                    ⏱ {windowInfo.timerLabel} left
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Paste your Google Meet or Zoom link now. As soon as you submit, the <strong>Join Button</strong> will automatically activate for all attending founders.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Mandatory 10-Minute Window Expired</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                The 10-minute submission window for this meeting has elapsed. If you have admin override privileges, you can still paste an emergency link below.
              </p>
            </div>
          )}

          {/* Meeting Link URL Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-orange-600" />
                <span>Google Meet / Zoom URL</span>
              </label>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Clipboard className="w-3 h-3" />
                <span>Paste from Clipboard</span>
              </button>
            </div>

            <input
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij or Zoom URL"
              required
              disabled={windowInfo.status === 'locked' && !isAdmin}
              className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50 font-mono text-xs placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Disciplinary Strike Warning Card */}
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Automated Strike Policy: </span>
              <span>
                Meeting host has a 10-minute window (from 5 minutes before to 5 minutes after scheduled time) to publish the link. If no link is provided, an automatic warning strike is triggered under Rule 06.
              </span>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || (!isAdmin && windowInfo.status === 'locked')}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 hover:from-orange-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting 
                ? 'Verifying & Activating...' 
                : windowInfo.status === 'locked' && !isAdmin
                ? 'Window Locked (Unlocks 5m before meeting)'
                : 'Publish Meeting Link & Activate Join Button 🚀'}
            </span>
          </button>
        </form>

      </div>
    </div>,
    document.body
  );
};

export default MeetingLinkPasteModal;
