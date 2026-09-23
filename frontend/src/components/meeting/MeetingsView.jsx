import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  Radio,
  Check,
  X,
  History,
  Lock,
  Users
} from 'lucide-react';
import { formatCountdown, formatDateTime } from '../../utils/formatters';
import { sound } from '../../utils/soundFx';
import { MeetingScheduleModal } from './MeetingScheduleModal';

export const MeetingsView = () => {
  const { 
    meeting, 
    meetings, 
    currentUser, 
    founders, 
    confirmMeetingRsvp, 
    cancelMeeting 
  } = usePortal();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleHostMode, setScheduleHostMode] = useState(false);
  const [selectedMeetingForHostSubmit, setSelectedMeetingForHostSubmit] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming | past
  const [isProcessingId, setIsProcessingId] = useState(null);

  const isAdmin = currentUser?.role === 'superadmin';

  // Ensure meetings is an array
  const allMeetings = Array.isArray(meetings) && meetings.length > 0
    ? meetings
    : (meeting ? [meeting] : []);

  // Filter active/upcoming vs past/cancelled
  const now = Date.now();
  const upcomingMeetings = allMeetings.filter(m => {
    if (m.isCancelled || m.status === 'cancelled') return false;
    if (m.status === 'pending_host_submission') return true;
    if (!m.scheduledTime) return true;
    const target = new Date(m.scheduledTime).getTime();
    return (now - target) <= 90 * 60 * 1000; // active up to 90 min after start
  }).sort((a, b) => {
    const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : (a.hostDeadline ? new Date(a.hostDeadline).getTime() : 0);
    const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : (b.hostDeadline ? new Date(b.hostDeadline).getTime() : 0);
    return timeA - timeB;
  });

  const pastMeetings = allMeetings.filter(m => {
    if (m.isCancelled || m.status === 'cancelled') return true;
    if (m.scheduledTime) {
      const target = new Date(m.scheduledTime).getTime();
      return (now - target) > 90 * 60 * 1000;
    }
    return false;
  });

  // Handler for RSVP
  const handleRsvp = async (meetingId) => {
    setIsProcessingId(meetingId);
    await confirmMeetingRsvp(meetingId);
    setIsProcessingId(null);
  };

  // Handler for Cancellation
  const handleCancel = async (m) => {
    // Check permission before prompting
    if (!isAdmin) {
      if (m.delegatedByAdmin || m.createdByRole === 'superadmin') {
        sound.playWarning();
        window.alert('Rule 06 & Admin Protocol: Meetings assigned by Super Admin cannot be cancelled by founders.');
        return;
      }
      if (m.createdBy && m.createdBy !== currentUser?.id) {
        sound.playWarning();
        window.alert('You can only cancel meetings that you personally created.');
        return;
      }
    }

    const confirm = window.confirm(`Are you sure you want to cancel "${m.title}"?`);
    if (confirm) {
      setIsProcessingId(m.id);
      await cancelMeeting(m.id);
      setIsProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-[1700px] mx-auto pb-28 md:pb-16 text-slate-800">
      
      {/* Top Header Card */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Meetings & Executive Sync Radar
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200 text-[11px] font-bold font-mono">
              {upcomingMeetings.length} Scheduled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Realtime multi-meeting queue • Earliest upcoming call auto-broadcasted to top banner • Rule 06 host ownership & RSVP verification
          </p>
        </div>

        {/* Action Button: Visible to BOTH Founders and Admin */}
        <button
          onClick={() => {
            sound.playPop();
            setScheduleHostMode(false);
            setSelectedMeetingForHostSubmit(null);
            setShowScheduleModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Meeting</span>
        </button>
      </div>

      {/* LIVE BANNER SPOTLIGHT (PORTAL LIGHT THEME - FULL WIDTH) */}
      {meeting && !meeting.isCancelled && meeting.status !== 'cancelled' ? (
        <div className="w-full relative overflow-hidden p-5 sm:p-6 md:p-7 rounded-3xl bg-white border-2 border-orange-500/70 shadow-lg shadow-orange-500/5 space-y-4">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Banner Tag Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 font-mono">
                Currently Broadcasting on Top Banner (Earliest Sync)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {meeting.delegatedByAdmin ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  🛡️ Admin Assigned
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  👤 Founder Scheduled
                </span>
              )}
            </div>
          </div>

          {/* Meeting Title & Details - Spanning Across Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative z-10">
            <div className="lg:col-span-2 space-y-2.5">
              <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {meeting.title}
              </h3>
              {meeting.agenda && (
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {meeting.agenda}
                </p>
              )}

              {/* Host & Date info pills */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  {meeting.hostAvatar ? (
                    <img src={meeting.hostAvatar} alt={meeting.hostName} className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {meeting.hostName?.charAt(0)}
                    </div>
                  )}
                  <span className="text-slate-500">Host:</span>
                  <span className="font-bold text-slate-900">{meeting.hostName}</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>
                    {meeting.scheduledTime ? formatDateTime(meeting.scheduledTime) : 'Date pending host submission'}
                  </span>
                </div>

                {meeting.scheduledTime && (
                  <div className="text-[11px] font-mono px-3 py-1 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>{formatCountdown(meeting.scheduledTime).label}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions for Banner Meeting */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-end">
              {/* If meeting is pending host submission and current user is host */}
              {meeting.status === 'pending_host_submission' && (meeting.hostId === currentUser?.id || isAdmin) ? (
                <button
                  onClick={() => {
                    sound.playPop();
                    setSelectedMeetingForHostSubmit(meeting);
                    setScheduleHostMode(true);
                    setShowScheduleModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Finalize Date & Meet Link (Host Mode)</span>
                </button>
              ) : null}

              {/* Join Link Button */}
              {meeting.meetLink && (
                <a
                  href={meeting.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sound.playChime()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Video Call</span>
                </a>
              )}

              {/* RSVP Button */}
              {(() => {
                const userRsvp = meeting.attendees?.find(a => a.userId === currentUser?.id);
                const isConfirmed = userRsvp?.status === 'confirmed';

                return (
                  <button
                    onClick={() => handleRsvp(meeting.id)}
                    disabled={isProcessingId === meeting.id}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isConfirmed
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isConfirmed ? 'RSVP Attendance Confirmed ✓' : 'Confirm Attendance (RSVP)'}</span>
                  </button>
                );
              })()}

              {/* Cancel Button */}
              {(() => {
                const canCancel = isAdmin || (meeting.createdBy === currentUser?.id && !meeting.delegatedByAdmin && meeting.createdByRole !== 'superadmin');

                if (canCancel) {
                  return (
                    <button
                      onClick={() => handleCancel(meeting)}
                      disabled={isProcessingId === meeting.id}
                      className="w-full py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Meeting</span>
                    </button>
                  );
                } else {
                  return (
                    <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 bg-slate-50 py-2 px-3 rounded-xl border border-slate-200 text-center font-medium">
                      <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Admin Assigned — Only Super Admin can cancel</span>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full p-8 rounded-3xl bg-white border border-slate-200/90 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Active Meeting in Session</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Schedule a strategy sync using the button above. The earliest upcoming call will automatically populate the live workspace banner.
          </p>
        </div>
      )}

      {/* Filter Tabs: Upcoming Queue vs History */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 w-fit text-xs font-semibold">
        <button
          onClick={() => { sound.playPop(); setActiveTab('upcoming'); }}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'upcoming'
              ? 'bg-slate-900 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming Queue ({upcomingMeetings.length})
        </button>

        <button
          onClick={() => { sound.playPop(); setActiveTab('past'); }}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'past'
              ? 'bg-slate-900 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Past / Cancelled Archive ({pastMeetings.length})
        </button>
      </div>

      {/* UPCOMING MEETINGS QUEUE - FULL WIDTH CARDS */}
      {activeTab === 'upcoming' && (
        <div className="w-full space-y-4">
          {upcomingMeetings.length === 0 ? (
            <div className="w-full p-12 text-center rounded-3xl bg-white border border-slate-200/90 text-slate-400 text-xs">
              No upcoming meetings in the queue.
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {upcomingMeetings.map((m, index) => {
                const isBannerMeeting = meeting && meeting.id === m.id;
                const canCancel = isAdmin || (m.createdBy === currentUser?.id && !m.delegatedByAdmin && m.createdByRole !== 'superadmin');
                const userRsvp = m.attendees?.find(a => a.userId === currentUser?.id);
                const isConfirmed = userRsvp?.status === 'confirmed';

                return (
                  <div
                    key={m.id}
                    className={`w-full p-5 sm:p-6 rounded-3xl bg-white border transition-all space-y-4 shadow-sm hover:shadow-md ${
                      isBannerMeeting 
                        ? 'border-orange-500/80 ring-2 ring-orange-500/20' 
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          {isBannerMeeting ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500 text-white shadow-xs">
                              Live on Banner
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                              Queue Position #{index + 1}
                            </span>
                          )}

                          {m.delegatedByAdmin ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              Admin Assigned
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              By {m.createdByName || 'Founder'}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {m.title}
                        </h4>
                      </div>

                      {m.scheduledTime && (
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-orange-600" />
                            <span>{formatCountdown(m.scheduledTime).label}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Agenda */}
                    {m.agenda && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {m.agenda}
                      </p>
                    )}

                    {/* Full-Width Host, Date & Action Row */}
                    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
                      
                      {/* Left: Host & Timing strip */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          {m.hostAvatar ? (
                            <img src={m.hostAvatar} alt={m.hostName} className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {m.hostName?.charAt(0)}
                            </div>
                          )}
                          <span className="font-bold text-slate-900">{m.hostName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">(Host)</span>
                        </div>

                        <span className="text-slate-300 hidden sm:inline">•</span>

                        <div className="flex items-center gap-1.5 font-mono text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-orange-600" />
                          <span>{m.scheduledTime ? formatDateTime(m.scheduledTime) : 'Date Pending'}</span>
                        </div>

                        <span className="text-slate-300 hidden sm:inline">•</span>

                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>RSVP: <strong className="text-emerald-700">{m.attendees?.filter(a => a.status === 'confirmed').length || 0}</strong> confirmed</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {m.meetLink && (
                          <a
                            href={m.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Call</span>
                          </a>
                        )}

                        <button
                          onClick={() => handleRsvp(m.id)}
                          disabled={isProcessingId === m.id}
                          className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isConfirmed ? 'RSVP ✓' : 'Confirm RSVP'}</span>
                        </button>

                        {canCancel ? (
                          <button
                            onClick={() => handleCancel(m)}
                            disabled={isProcessingId === m.id}
                            className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                            title="Cancel meeting"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span 
                            className="p-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                            title="Rule 06: Admin-assigned meetings cannot be cancelled by founders."
                          >
                            <Lock className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PAST / CANCELLED ARCHIVE */}
      {activeTab === 'past' && (
        <div className="w-full space-y-3">
          {pastMeetings.length === 0 ? (
            <div className="w-full p-12 text-center rounded-3xl bg-white border border-slate-200/90 text-slate-400 text-xs">
              No past or cancelled meetings recorded in archive.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {pastMeetings.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-3xl bg-white border border-slate-200/90 opacity-75 hover:opacity-100 transition-all space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                      {m.title}
                    </h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      m.isCancelled || m.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {m.isCancelled || m.status === 'cancelled' ? 'Cancelled' : 'Concluded'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono">
                    Host: {m.hostName} • {m.scheduledTime ? new Date(m.scheduledTime).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <MeetingScheduleModal
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedMeetingForHostSubmit(null);
            setScheduleHostMode(false);
          }}
          isHostMode={scheduleHostMode}
          targetMeeting={selectedMeetingForHostSubmit}
        />
      )}

    </div>
  );
};

export default MeetingsView;
