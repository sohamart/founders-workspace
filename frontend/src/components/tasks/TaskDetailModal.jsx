import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  X, 
  Clock, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Send, 
  FileText, 
  RefreshCw, 
  ArrowRight,
  Mic,
  Calendar,
  AlertTriangle,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { LinkHighlighter } from '../common/LinkHighlighter';
import { VoiceNoteRecorder } from '../common/VoiceNoteRecorder';
import { formatCountdown, formatDateTime } from '../../utils/formatters';
import { sound } from '../../utils/soundFx';

export const TaskDetailModal = ({ task, onClose, onOpenProofReview, onOpenTransferModal }) => {
  const { 
    currentUser, 
    postDailyUpdate, 
    requestProgress, 
    requestExtension, 
    toggleBlocker,
    uploadFile,
    founders
  } = usePortal();

  const [activeTab, setActiveTab] = useState('overview'); // overview | daily_update | request_progress | extension
  
  // Daily Update form
  const [dailyText, setDailyText] = useState('');
  const [dailyStatusTag, setDailyStatusTag] = useState('Developing');
  const [dailyVoiceNote, setDailyVoiceNote] = useState(null); // { blob, previewUrl, duration }
  
  // Progress Request form
  const [targetProgress, setTargetProgress] = useState(task.progress + 15 > 100 ? 100 : task.progress + 15);
  const [proofUrl, setProofUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [progressVoiceNote, setProgressVoiceNote] = useState(null);

  // Project Credentials Sync form (Auto-syncs to Project Client Vault)
  const [includeCredentials, setIncludeCredentials] = useState(false);
  const [credTitle, setCredTitle] = useState('');
  const [credService, setCredService] = useState('cPanel / Staging Admin');
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credUrl, setCredUrl] = useState('');

  // Extension form
  const [extDeadline, setExtDeadline] = useState('');
  const [extReason, setExtReason] = useState('');

  // Blocker form
  const [blockerReason, setBlockerReason] = useState('');
  const [showBlockerInput, setShowBlockerInput] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'superadmin';
  const isAssignee = task.assignedTo.includes(currentUser?.id);
  const isCompleted = task.status === 'completed' || task.progress >= 100;
  const countdown = formatCountdown(task.deadline, isCompleted);

  // Submit Daily Update with optional Voice Note (Rule 09)
  const handleDailyUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!dailyText.trim() && !dailyVoiceNote) return;
    setIsSubmitting(true);
    let voiceNoteUrl = null;
    if (dailyVoiceNote?.blob) {
      try {
        const upRes = await uploadFile(dailyVoiceNote.blob, 'founders/voice_notes', 'video');
        if (upRes.success && upRes.url) {
          voiceNoteUrl = upRes.url;
        }
      } catch (err) {
        console.error('Voice note upload failed:', err);
      }
    }

    await postDailyUpdate(task.id, { 
      text: dailyText.trim() || '🎙️ Voice Note Status Update', 
      statusTag: dailyStatusTag,
      voiceNoteUrl,
      voiceNoteDuration: dailyVoiceNote?.duration || 0
    });

    setIsSubmitting(false);
    setDailyText('');
    setDailyVoiceNote(null);
    setActiveTab('overview');
  };

  // Submit Progress Request with optional Voice Note & Proof URL
  const handleProgressRequestSubmit = async (e) => {
    e.preventDefault();
    if (!proofUrl) return;
    setIsSubmitting(true);
    let voiceNoteUrl = null;
    if (progressVoiceNote?.blob) {
      try {
        const upRes = await uploadFile(progressVoiceNote.blob, 'founders/voice_notes', 'video');
        if (upRes.success && upRes.url) {
          voiceNoteUrl = upRes.url;
        }
      } catch (err) {
        console.error('Progress voice note upload failed:', err);
      }
    }

    const credentialData = (includeCredentials && credTitle && credUsername) ? {
      title: credTitle,
      service: credService,
      username: credUsername,
      password: credPassword,
      url: credUrl
    } : null;

    await requestProgress(task.id, { 
      targetProgress, 
      proofUrl, 
      notes: proofNotes,
      voiceNoteUrl,
      voiceNoteDuration: progressVoiceNote?.duration || 0,
      credentialData
    });

    setIsSubmitting(false);
    setProofUrl('');
    setProofNotes('');
    setProgressVoiceNote(null);
    setIncludeCredentials(false);
    setCredTitle('');
    setCredUsername('');
    setCredPassword('');
    setCredUrl('');
    setActiveTab('overview');
  };

  // Submit Extension Request
  const handleExtensionSubmit = async (e) => {
    e.preventDefault();
    if (!extDeadline || !extReason) return;
    setIsSubmitting(true);
    await requestExtension(task.id, { requestedDeadline: extDeadline, reason: extReason });
    setIsSubmitting(false);
    setActiveTab('overview');
  };

  // Toggle Blocker
  const handleToggleBlocker = async () => {
    if (!task.isBlocked) {
      if (!showBlockerInput) {
        setShowBlockerInput(true);
        return;
      }
      await toggleBlocker(task.id, { isBlocked: true, reason: blockerReason || 'Rule 08 Blocker escalation' });
      setShowBlockerInput(false);
    } else {
      await toggleBlocker(task.id, { isBlocked: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[94vh] sm:max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-5 md:p-6 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/70">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-orange-100 text-orange-800'
              }`}>
                {task.topic || task.projectName}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                task.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {isCompleted ? 'Completed' : `${task.priority} Priority`}
              </span>
              {isCompleted ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xs flex items-center gap-1 border border-emerald-400/40">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  <span>Delivered & Ratified ✓</span>
                </span>
              ) : (
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                  countdown.isOverdue ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
                }`}>
                  {countdown.label}
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-snug break-words">
              {task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation - Mobile-Optimized Horizontal Scroll */}
        <div className="flex items-center gap-1 px-3 sm:px-6 pt-2 sm:pt-3 border-b border-slate-200/80 bg-white text-xs font-semibold text-slate-500 overflow-x-auto no-scrollbar flex-nowrap shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-xs ${
              activeTab === 'overview' ? 'border-orange-600 text-orange-700 font-bold bg-orange-50/60 rounded-t-lg' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>Overview</span>
            <span className="hidden sm:inline">& Deliverables</span>
          </button>

          <button
            onClick={() => setActiveTab('daily_update')}
            className={`pb-2.5 px-3 border-b-2 transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-xs ${
              activeTab === 'daily_update' ? 'border-orange-600 text-orange-700 font-bold bg-orange-50/60 rounded-t-lg' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <span>📝 Work Logs</span>
            <span className="hidden sm:inline">& History</span>
          </button>

          {!isCompleted && (
            <>
              <button
                onClick={() => setActiveTab('request_progress')}
                className={`pb-2.5 px-3 border-b-2 transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-xs ${
                  activeTab === 'request_progress' ? 'border-orange-600 text-orange-700 font-bold bg-orange-50/60 rounded-t-lg' : 'border-transparent hover:text-slate-800'
                }`}
              >
                <span>🚀 Request %</span>
                <span className="hidden sm:inline">with Proof</span>
              </button>

              <button
                onClick={() => setActiveTab('extension')}
                className={`pb-2.5 px-3 border-b-2 transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-xs ${
                  activeTab === 'extension' ? 'border-orange-600 text-orange-700 font-bold bg-orange-50/60 rounded-t-lg' : 'border-transparent hover:text-slate-800'
                }`}
              >
                <span>⏳ Extension</span>
                <span className="hidden sm:inline">Request</span>
              </button>
            </>
          )}
        </div>

        {/* Content Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Premium Success Hero Banner for Completed Deliverable */}
              {isCompleted && (
                <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg relative overflow-hidden flex items-center justify-between gap-4 border border-emerald-400/40">
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-100">Deliverable Ratified</span>
                    </div>
                    <h3 className="text-base font-black tracking-tight">100% Executed & Officially Verified ✓</h3>
                    <p className="text-xs text-emerald-100/90 leading-snug max-w-lg">
                      This agency deliverable has been fully completed, progress proofs verified, and sealed. No further actions or pending work required.
                    </p>
                  </div>
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-inner">
                    <ShieldCheck className="w-7 h-7 text-emerald-200" />
                  </div>
                </div>
              )}

              {/* Official Progress Bar & Status */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Official Admin-Approved Progress</span>
                  <span className={`font-mono font-bold ${isCompleted ? 'text-emerald-700 text-sm' : 'text-slate-800'}`}>
                    {task.progress}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shadow-2xs' : 'bg-gradient-to-r from-orange-600 to-amber-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  {isCompleted 
                    ? '✓ Full milestones ratified and sealed in the executive audit record.'
                    : 'Note: Daily updates post instantly. Official progress bar advances only after Super Admin verifies proof.'
                  }
                </p>
              </div>

              {/* Blocker Alert (Rule 08) - only if NOT completed */}
              {!isCompleted && task.isBlocked && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Active Blocker Reported (Rule 08: Seek Help)</h5>
                    <p className="mt-0.5 text-red-700">{task.blockerReason}</p>
                  </div>
                </div>
              )}

              {/* Description with Highlighted Links */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</h4>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <LinkHighlighter text={task.description || 'No description provided.'} />
                </div>
              </div>

              {/* Dedicated Reference Links Section */}
              {task.referenceLinks && task.referenceLinks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Reference Materials & Benchmarks
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.referenceLinks.map((ref, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-orange-100 bg-orange-50/50 flex items-center justify-between text-xs"
                      >
                        <div className="truncate mr-2">
                          <p className="font-semibold text-slate-800 truncate">{ref.title}</p>
                          <p className="text-[10px] text-orange-700 truncate font-mono">{ref.url}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(ref.url);
                              sound.playPop();
                            }}
                            className="p-1 rounded text-orange-700 hover:bg-orange-100 cursor-pointer"
                            title="Copy link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-orange-700 hover:bg-orange-100"
                            title="Open link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverables Checklist */}
              {task.checklist && task.checklist.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Deliverables & Checkpoints
                  </h4>
                  <div className="space-y-1.5">
                    {task.checklist.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5 text-xs text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          readOnly
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 accent-orange-600"
                        />
                        <span className={item.completed ? 'line-through text-slate-400' : 'font-medium'}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Progress Reviews (For Admin) */}
              {isAdmin && task.progressRequests?.some(r => r.status === 'pending') && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>⚠️ Progress Proof Pending Your Review</span>
                  </div>
                  {task.progressRequests.filter(r => r.status === 'pending').map((pr) => (
                    <div key={pr.id} className="p-3 rounded-xl bg-white border border-amber-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{pr.requesterName} requested: {pr.targetProgress}%</span>
                        <a
                          href={pr.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-orange-600 hover:underline font-medium"
                        >
                          <span>Inspect Proof Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-slate-600 text-[11px]">{pr.notes || 'No review notes provided.'}</p>
                      
                      {pr.voiceNoteUrl && (
                        <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 flex items-center gap-2">
                          <Mic className="w-4 h-4 text-orange-600 shrink-0" />
                          <audio controls src={pr.voiceNoteUrl} className="h-7 w-full max-w-xs" />
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onOpenProofReview(task, pr)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm"
                        >
                          Review & Decide
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Daily Updates Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Daily Work Log & Standup Feed (with Voice Notes)
                </h4>
                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {task.dailyUpdates && task.dailyUpdates.length > 0 ? (
                    task.dailyUpdates.map((du) => (
                      <div key={du.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{du.authorName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{formatDateTime(du.timestamp)}</span>
                        </div>
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 font-mono">
                          {du.statusTag}
                        </span>
                        <p className="text-slate-700 text-xs mt-0.5">{du.text}</p>

                        {/* Interactive Voice Note Audio Player */}
                        {du.voiceNoteUrl && (
                          <div className="mt-2 p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-xs">
                            <Mic className="w-4 h-4 text-orange-600 shrink-0" />
                            <audio controls src={du.voiceNoteUrl} className="h-7 w-full max-w-sm" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No daily updates posted yet.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* DAILY UPDATE TAB (Instant Submit - No Admin Confirmation) */}
          {activeTab === 'daily_update' && (
            <form onSubmit={handleDailyUpdateSubmit} className="space-y-4 animate-fade-in text-xs">
              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 leading-relaxed">
                Daily updates post immediately to the workspace standup feed and task history. You can submit text, record a voice note, or both!
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Work Tag</label>
                <input
                  type="text"
                  value={dailyStatusTag}
                  onChange={(e) => setDailyStatusTag(e.target.value)}
                  placeholder="e.g. Polishing UI, Fixing API, Testing"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  What did you complete today? {!dailyVoiceNote && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  value={dailyText}
                  onChange={(e) => setDailyText(e.target.value)}
                  rows={3}
                  placeholder={dailyVoiceNote ? "Optional notes (voice note attached)..." : "Summarize your progress, deliverables completed, or tests run..."}
                  required={!dailyVoiceNote}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 text-slate-800"
                />
              </div>

              {/* Voice Note Recorder (Rule 09) */}
              <VoiceNoteRecorder
                onRecorded={setDailyVoiceNote}
                onDiscard={() => setDailyVoiceNote(null)}
                isUploading={isSubmitting}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Posting Update...' : 'Post Daily Update Instantly'}</span>
              </button>
            </form>
          )}

          {/* REQUEST PROGRESS WITH PROOF TAB */}
          {activeTab === 'request_progress' && (
            <form onSubmit={handleProgressRequestSubmit} className="space-y-4 animate-fade-in text-xs">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                Official task progress advances once Super Admin verifies your proof link and voice explanation.
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Target Progress Percentage</label>
                  <span className="font-mono font-bold text-orange-600 text-sm">{targetProgress}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={targetProgress}
                  onChange={(e) => setTargetProgress(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandatory Proof Link</label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or staging link"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Completion Notes for Admin</label>
                <textarea
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  rows={2}
                  placeholder="Explain what is ready for verification..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 text-slate-800"
                />
              </div>

              {/* Voice Note Recorder for Progress Proof */}
              <VoiceNoteRecorder
                onRecorded={setProgressVoiceNote}
                onDiscard={() => setProgressVoiceNote(null)}
                isUploading={isSubmitting}
              />

              {/* Auto-Sync Deliverable Credentials into Project Vault */}
              {task.projectId && task.projectId !== 'proj_general' && (
                <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs select-none">
                      <input
                        type="checkbox"
                        checked={includeCredentials}
                        onChange={(e) => setIncludeCredentials(e.target.checked)}
                        className="rounded accent-orange-600 w-4 h-4 cursor-pointer"
                      />
                      <span>🔐 Auto-Sync Credentials to Project Vault</span>
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold">
                      Vault Sync
                    </span>
                  </div>

                  {includeCredentials && (
                    <div className="space-y-2 pt-1 animate-fade-in">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Credential Title</label>
                          <input
                            type="text"
                            value={credTitle}
                            onChange={(e) => setCredTitle(e.target.value)}
                            placeholder="e.g. WP Admin, cPanel, DB"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                            required={includeCredentials}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Service</label>
                          <input
                            type="text"
                            value={credService}
                            onChange={(e) => setCredService(e.target.value)}
                            placeholder="e.g. Hostinger, AWS, Stripe"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Username / Access Key</label>
                          <input
                            type="text"
                            value={credUsername}
                            onChange={(e) => setCredUsername(e.target.value)}
                            placeholder="Username / Token"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                            required={includeCredentials}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Password / Secret</label>
                          <input
                            type="text"
                            value={credPassword}
                            onChange={(e) => setCredPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Target / Login URL</label>
                        <input
                          type="url"
                          value={credUrl}
                          onChange={(e) => setCredUrl(e.target.value)}
                          placeholder="https://preview.weblets.bond/...:2083"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                        />
                      </div>

                      <p className="text-[10px] text-orange-800 leading-tight">
                        ✨ These credentials will appear directly in the project's Client Vault for Super Admin verification.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Submitting with Voice Note...' : 'Submit for Admin Proof Verification'}</span>
              </button>
            </form>
          )}

          {/* EXTENSION TAB */}
          {activeTab === 'extension' && (
            <form onSubmit={handleExtensionSubmit} className="space-y-4 animate-fade-in text-xs">
              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 text-orange-950 leading-relaxed">
                If at risk of missing a deadline, request an extension in advance to avoid an automated strike.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requested New Deadline (Date & Time)</label>
                <input
                  type="datetime-local"
                  value={extDeadline}
                  onChange={(e) => setExtDeadline(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Justification Reason</label>
                <textarea
                  value={extReason}
                  onChange={(e) => setExtReason(e.target.value)}
                  rows={3}
                  placeholder="Detail the technical or operational bottleneck..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Forwarding...' : 'Request Extension from Admin'}
              </button>
            </form>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs">
          
          {/* Blocker Action / Completed Seal */}
          <div className="flex flex-wrap items-center gap-2">
            {!isCompleted ? (
              <>
                <button
                  onClick={handleToggleBlocker}
                  className={`px-3 py-2 rounded-xl font-semibold transition-all text-xs flex items-center gap-1 cursor-pointer ${
                    task.isBlocked 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  {task.isBlocked ? '✓ Clear Blocker' : '🚨 Flag Blocker (Rule 08)'}
                </button>

                {/* Task Transfer Button (Strict Self-Ownership) */}
                {isAssignee && (
                  <button
                    onClick={() => onOpenTransferModal(task)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>🔄 Transfer Task</span>
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-100/90 px-3 py-2 rounded-xl border border-emerald-300 shadow-2xs text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deliverable 100% Completed</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-200 transition-colors text-xs ml-auto cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
