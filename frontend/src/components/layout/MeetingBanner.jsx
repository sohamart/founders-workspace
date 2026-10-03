import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Sparkles,
  User,
  Radio,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
  Video
} from 'lucide-react';
import { formatCountdown, formatDateTime, getMeetingLinkWindowStatus } from '../../utils/formatters';
import { MeetingLinkPasteModal } from '../meeting/MeetingLinkPasteModal';

export const MeetingBanner = ({ onOpenHostModal, onOpenScheduleModal }) => {
  const { 
    meeting, 
    currentUser, 
    founders = [],
    confirmMeetingRsvp, 
    cancelMeeting 
  } = usePortal();

  const [isConfirming, setIsConfirming] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPasteLinkModal, setShowPasteLinkModal] = useState(false);
  const [linkWindow, setLinkWindow] = useState(() => 
    meeting ? getMeetingLinkWindowStatus(meeting.scheduledTime, meeting.meetLink) : null
  );

  useEffect(() => {
    if (!meeting) return;
    const update = () => {
      setLinkWindow(getMeetingLinkWindowStatus(meeting.scheduledTime, meeting.meetLink));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [meeting]);

  if (!meeting || meeting.isCancelled || meeting.status === 'cancelled') {
    return null;
  }

  // Check if current user is the host by ID or by Name
  const isHost = Boolean(
    currentUser && (
      currentUser.id === meeting.hostId ||
      (currentUser.name && meeting.hostName && currentUser.name.trim().toLowerCase() === meeting.hostName.trim().toLowerCase())
    )
  );
  const isAdmin = currentUser?.role === 'superadmin';

  // Dynamically resolve host details from founders list (match by ID or Name)
  const hostFounder = founders.find(f => 
    f.id === meeting.hostId || 
    (f.name && meeting.hostName && f.name.trim().toLowerCase() === meeting.hostName.trim().toLowerCase())
  );

  const hostAvatar = (isHost && currentUser?.avatar)
    ? currentUser.avatar
    : (hostFounder?.avatar || meeting.hostAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80');

  const hostName = (isHost && currentUser?.name)
    ? currentUser.name
    : (hostFounder?.name || meeting.hostName || 'Founder Host');

  // Determine stage
  const isPendingHost = meeting.status === 'pending_host_submission';
  const myRsvp = meeting.attendees?.find(a => a.userId === currentUser?.id);
  const isConfirmed = myRsvp?.status === 'confirmed';

  const countdown = isPendingHost 
    ? formatCountdown(meeting.hostDeadline) 
    : formatCountdown(meeting.scheduledTime);

  const handleRsvp = async () => {
    setIsConfirming(true);
    await confirmMeetingRsvp();
    setIsConfirming(false);
  };

  if (isCollapsed) {
    return (
      <div data-tour="meeting-banner" className="shrink-0 relative z-20 w-full bg-gradient-to-r from-orange-50 via-white to-amber-50/80 border-b border-orange-200/80 text-slate-800 px-3 py-1 shadow-2xs">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 truncate">
            <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold text-orange-800">{isPendingHost ? 'Host Schedule' : 'Sync'}:</span>
            <span className="text-slate-600 truncate">{meeting.title}</span>
            <span className="font-mono font-bold text-emerald-700 bg-white px-1.5 py-0.2 rounded border border-orange-200">
              {countdown.label}
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-0.5 text-[10px] font-bold text-orange-600 hover:text-orange-700 px-1.5 py-0.5 rounded hover:bg-orange-100/60 transition-colors"
          >
            <span>Expand</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div data-tour="meeting-banner" className="shrink-0 relative z-20 w-full bg-gradient-to-r from-orange-50 via-white to-amber-50/80 border-b border-orange-200/80 text-slate-800 px-3 sm:px-4 py-1.5 transition-all shadow-xs backdrop-blur-md">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs">
          
          {/* Left: Host Avatar & Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0 w-8 h-8 min-w-[32px] max-w-[32px] aspect-square">
              <img
                key={hostAvatar}
                src={hostAvatar}
                alt={hostName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
                }}
                className="w-8 h-8 min-w-[32px] max-w-[32px] aspect-square rounded-full object-cover ring-2 ring-orange-400 shadow-2xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" title="Active Host" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-orange-700 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                  <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse shrink-0" />
                  {isPendingHost ? 'Host Pending Schedule' : 'Strategic Sync'}
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-slate-500 text-[10px] sm:text-[11px] truncate">
                  Host: <strong className="text-slate-900">{hostName}</strong>
                </span>
              </div>
              <p className="text-slate-800 font-semibold truncate text-[11px] sm:text-xs">
                {meeting.title}
              </p>
            </div>

            {/* Countdown Pill on Mobile */}
            <div className="flex sm:hidden items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-orange-200/80 shadow-2xs shrink-0 text-[10px] font-mono">
              <Clock className="w-3 h-3 text-orange-600 shrink-0" />
              <span className="font-bold text-emerald-700">{countdown.label}</span>
            </div>
          </div>

          {/* Desktop Countdown */}
          <div className="hidden sm:flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-orange-200/80 shadow-2xs shrink-0">
            <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <div className="text-left font-mono text-[11px]">
              {isPendingHost ? (
                <div>
                  <span className="text-slate-500 text-[10px]">Host Deadline: </span>
                  <span className={`font-bold ${countdown.urgent ? 'text-amber-600 animate-pulse' : 'text-orange-700'}`}>
                    {countdown.label}
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-slate-500 text-[10px]">{formatDateTime(meeting.scheduledTime)}: </span>
                  <span className="font-bold text-emerald-700">{countdown.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center justify-end gap-1.5 shrink-0">
            {/* If I am the Host and still pending submission */}
            {isPendingHost && (isHost || isAdmin) && (
              <button
                onClick={onOpenHostModal}
                className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                Confirm Schedule
              </button>
            )}

            {/* If Host & Link window is ACTIVE (10-minute window) and link not submitted yet */}
            {!isPendingHost && linkWindow?.canSubmit && (isHost || isAdmin) && (
              <button
                onClick={() => setShowPasteLinkModal(true)}
                className="flex items-center justify-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md shadow-orange-600/30 animate-pulse transition-all cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                <span>Paste Link ({linkWindow.timerLabel})</span>
              </button>
            )}

            {/* Join Meeting Link (When Link is Available) */}
            {!isPendingHost && linkWindow?.hasLink && (
              <a
                href={meeting.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Meet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Join Button: "Coming Soon" State (when link not available yet) */}
            {!isPendingHost && !linkWindow?.hasLink && !linkWindow?.canSubmit && (
              <div 
                title="Meeting link will unlock 5 minutes prior to scheduled start time"
                className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100/90 text-slate-500 border border-slate-200 text-xs font-semibold cursor-not-allowed select-none"
              >
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Join (Coming Soon)</span>
              </div>
            )}

            {/* Attendance RSVP button */}
            {!isPendingHost && (
              <button
                onClick={handleRsvp}
                disabled={isConfirmed || isConfirming}
                className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  isConfirmed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-white hover:bg-orange-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isConfirmed ? 'Attending ✓' : 'RSVP'}</span>
              </button>
            )}

            {/* Admin-Only Cancel Meeting Control */}
            {isAdmin && (
              <button
                onClick={cancelMeeting}
                title="Admin Only: Cancel Meeting"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Collapse/Minimize Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              title="Minimize Banner"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-orange-100/60 transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Paste Link Modal */}
      {showPasteLinkModal && (
        <MeetingLinkPasteModal
          targetMeeting={meeting}
          onClose={() => setShowPasteLinkModal(false)}
        />
      )}
    </>
  );
};

export default MeetingBanner;
