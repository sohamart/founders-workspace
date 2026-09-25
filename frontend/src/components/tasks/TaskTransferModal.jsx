import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../../context/PortalContext';
import { X, RefreshCw, AlertCircle, ArrowRight, UserCheck, ShieldCheck, Zap } from 'lucide-react';

export const TaskTransferModal = ({ task, onClose }) => {
  const { requestTransfer, adminDirectTransfer, founders, currentUser } = usePortal();

  const isAdmin = currentUser?.role === 'superadmin';

  const [targetFounderId, setTargetFounderId] = useState('');
  const [workDoneSoFar, setWorkDoneSoFar] = useState('');
  const [currentProgressPercent, setCurrentProgressPercent] = useState(task.progress || 0);
  const [remainingWork, setRemainingWork] = useState('');
  const [reason, setReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Target founders list
  // If admin: can transfer to any active founder
  // If founder: can transfer to other active founders
  const eligibleFounders = founders.filter(f => 
    f.role === 'founder' && 
    f.status === 'active' && 
    (isAdmin ? true : f.id !== currentUser?.id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetFounderId) {
      setError('Please select a target founder.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    if (isAdmin) {
      // Direct Admin Transfer: No request or approval needed!
      const res = await adminDirectTransfer(task.id, targetFounderId, adminNote);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      }
    } else {
      // Founder 2-Step Protocol: Handover request sent to recipient founder, then admin approves
      if (!workDoneSoFar.trim() || !reason.trim()) {
        setError('Handover Brief (Work Done So Far) and Reason are required.');
        setIsSubmitting(false);
        return;
      }

      const res = await requestTransfer(task.id, {
        targetFounderId,
        workDoneSoFar: workDoneSoFar.trim(),
        currentProgressPercent,
        remainingWork: remainingWork.trim(),
        reason: reason.trim()
      });
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in text-slate-800">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-lg rounded-none sm:rounded-3xl flex flex-col shadow-2xl border-0 sm:border sm:border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sm:bg-slate-50/70">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              {isAdmin ? (
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold font-mono uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-orange-600" />
                  <span>Admin Direct Action</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold font-mono">
                  Rule 10: 2-Step Handover
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isAdmin ? 'Direct Task Transfer & Reassignment' : 'Request Task Handover Transfer'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isAdmin 
                ? 'Immediate reassignment • No request or approvals needed' 
                : 'Step 1: Recipient founder accepts • Step 2: Lead Admin ratifies'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-4 sm:mx-6 mt-3 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* Target Task Brief */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Task</span>
            <p className="text-xs font-bold text-slate-800 leading-snug">{task.title}</p>
          </div>

          {/* Recipient Founder Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isAdmin ? 'Assign New Owner (Founder)' : 'Transfer To (Recipient Founder)'}
            </label>
            <select
              value={targetFounderId}
              onChange={(e) => setTargetFounderId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="">Select recipient founder...</option>
              {eligibleFounders.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>
              ))}
            </select>
          </div>

          {isAdmin ? (
            /* ADMIN DIRECT TRANSFER FIELDS */
            <div className="space-y-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Transfer Note / Instructions (Optional)</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Reassigned per client sprint priorities..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>As Lead Admin, transferring this task executes immediately without waiting for founder acceptance or request approvals.</span>
              </div>
            </div>
          ) : (
            /* FOUNDER 2-STEP PROTOCOL FIELDS */
            <div className="space-y-3 pt-1">
              {/* Work Done So Far */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Done So Far (Mandatory Handover Brief)</label>
                <textarea
                  value={workDoneSoFar}
                  onChange={(e) => setWorkDoneSoFar(e.target.value)}
                  rows={3}
                  placeholder="Detail what parts of the task are completed, files created, and current progress state..."
                  required
                  className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
                />
              </div>

              {/* Remaining Work */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Remaining Work Left to Finish</label>
                <textarea
                  value={remainingWork}
                  onChange={(e) => setRemainingWork(e.target.value)}
                  rows={2}
                  placeholder="Explain what the recipient needs to complete..."
                  className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Transfer</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Technical bottleneck, workload balancing, client priority..."
                  required
                  className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed flex items-start gap-2">
                <span className="shrink-0 font-bold text-blue-600">📋 Protocol:</span>
                <span>The recipient founder must first accept this transfer. Once accepted, Lead Admin will review and provide final ratification to complete ownership transfer.</span>
              </div>
            </div>
          )}

          {/* Footer Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>
                {isSubmitting 
                  ? 'Processing...' 
                  : isAdmin 
                  ? 'Transfer Task Immediately ⚡' 
                  : 'Send Handover Request to Founder 🔄'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};

export default TaskTransferModal;
