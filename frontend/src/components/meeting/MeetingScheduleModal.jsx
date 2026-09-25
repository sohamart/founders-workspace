import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../../context/PortalContext';
import { X, Calendar, Clock, Link as LinkIcon, User, Sparkles, ShieldAlert, Video } from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const MeetingScheduleModal = ({ onClose, isHostMode = false, targetMeeting = null }) => {
  const { 
    meeting, 
    scheduleMeeting, 
    hostSubmitMeeting, 
    founders, 
    currentUser 
  } = usePortal();

  const isAdmin = currentUser?.role === 'superadmin';
  const meetingToEdit = targetMeeting || meeting;

  const [title, setTitle] = useState(
    meetingToEdit?.title || (isAdmin ? 'Executive Founders Strategy Sync' : `${currentUser?.name}'s Strategy Sync`)
  );
  const [agenda, setAgenda] = useState(meetingToEdit?.agenda || '');
  const [delegatedHostId, setDelegatedHostId] = useState(
    isAdmin ? (meetingToEdit?.hostId || '') : currentUser?.id
  );
  const [hostDeadline, setHostDeadline] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [meetLink, setMeetLink] = useState(meetingToEdit?.meetLink || 'https://meet.google.com/');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeFounders = founders.filter(f => f.role === 'founder' && f.status === 'active');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isHostMode) {
      // Host founder submits date and link
      await hostSubmitMeeting({
        meetingId: meetingToEdit?.id,
        scheduledTime,
        meetLink,
        agenda
      });
    } else {
      // Admin delegates host OR founder schedules with themselves as host
      const res = await scheduleMeeting({
        title,
        agenda,
        delegatedHostId: isAdmin ? delegatedHostId : currentUser?.id,
        hostDeadline: isAdmin ? hostDeadline : null,
        scheduledTime,
        meetLink
      });
      if (res && res.success === false) {
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in text-slate-800">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg rounded-none sm:rounded-3xl flex flex-col shadow-2xl border-0 sm:border sm:border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isHostMode 
                ? 'Finalize Meeting Schedule (Host Mode)' 
                : isAdmin 
                ? 'Schedule Meeting / Delegate Host' 
                : 'Schedule Executive Meeting'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isHostMode 
                ? 'Input meeting date, time, and Google Meet/Zoom URL' 
                : isAdmin 
                ? 'Delegate host founder with deadline or schedule directly' 
                : 'Host locked to your account • Queues to top banner automatically'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="meeting-schedule-form" onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* Meeting Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Meeting Topic / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Deliverables, Pipeline & Milestone Review"
              required
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50 font-medium"
            />
          </div>

          {/* Agenda Summary */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Agenda Summary</label>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              rows={2}
              placeholder="Bullet points of key decisions, deliverables and sprint roadblocks..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Host Assignment Section */}
          {isAdmin && !isHostMode ? (
            <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-600" />
                  <span>Host Responsibility (Rule 06)</span>
                </label>
                <span className="text-[10px] font-mono text-orange-700 uppercase font-bold">Admin Delegation</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-slate-600 text-[10px] block mb-1 font-semibold">Assign Host Founder</span>
                  <select
                    value={delegatedHostId}
                    onChange={(e) => setDelegatedHostId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="">Admin as Host (SSA TEAM)</option>
                    {activeFounders.map((f) => (
                      <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-slate-600 text-[10px] block mb-1 font-semibold">Host Submission Deadline (Optional)</span>
                  <input
                    type="datetime-local"
                    value={hostDeadline}
                    onChange={(e) => setHostDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : !isAdmin && !isHostMode ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Assigned Meeting Host:</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  Self-Hosted
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser?.name?.charAt(0)}
                  </div>
                )}
                <span className="font-bold text-slate-900">{currentUser?.name}</span>
                <span className="text-slate-500 text-[11px]">({currentUser?.designation || 'Executive Founder'})</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Founders schedule meetings directly as Host. Host delegation to others is reserved for Super Admin.
              </p>
            </div>
          ) : null}

          {/* Date, Time & Meeting Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Meeting Date & Time</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required={isHostMode || !isAdmin}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-slate-500" />
                <span>Meet / Zoom URL</span>
              </label>
              <input
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                required={isHostMode || !isAdmin}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Rule 06 Reminder */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
            <span className="shrink-0 text-amber-600 font-bold">📋 Rule 06:</span>
            <span>Meeting Host holds end-to-end responsibility. Multiple meetings are queued chronologically, and the earliest upcoming call populates the live workspace banner automatically.</span>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 shrink-0">
          <button
            type="submit"
            form="meeting-schedule-form"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>
              {isSubmitting 
                ? 'Processing...' 
                : isHostMode 
                ? 'Finalize Meeting & Update Top Banner 📡' 
                : 'Schedule Meeting & Queue to Banner 🚀'}
            </span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default MeetingScheduleModal;
