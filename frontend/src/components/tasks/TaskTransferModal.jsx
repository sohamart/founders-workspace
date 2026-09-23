import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { X, RefreshCw, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export const TaskTransferModal = ({ task, onClose }) => {
  const { requestTransfer, founders, currentUser } = usePortal();

  const [targetFounderId, setTargetFounderId] = useState('');
  const [workDoneSoFar, setWorkDoneSoFar] = useState('');
  const [currentProgressPercent, setCurrentProgressPercent] = useState(task.progress);
  const [remainingWork, setRemainingWork] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Other active founders
  const otherFounders = founders.filter(f => f.role === 'founder' && f.id !== currentUser?.id && f.status === 'active');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetFounderId || !workDoneSoFar || !reason) {
      setError('Target founder, Handover Brief (Work Done So Far), and Reason are required.');
      return;
    }

    setIsSubmitting(true);
    const res = await requestTransfer(task.id, {
      targetFounderId,
      workDoneSoFar,
      currentProgressPercent,
      remainingWork,
      reason
    });
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Request Task Handover Transfer</h3>
            <p className="text-[11px] text-slate-500">Provide handover details so recipient can review before accepting</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Target Founder */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Transfer To (Recipient Founder)</label>
            <select
              value={targetFounderId}
              onChange={(e) => setTargetFounderId(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="">Select recipient founder...</option>
              {otherFounders.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.designation})</option>
              ))}
            </select>
          </div>

          {/* Work Done So Far */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Work Done So Far (Mandatory Handover Brief)</label>
            <textarea
              value={workDoneSoFar}
              onChange={(e) => setWorkDoneSoFar(e.target.value)}
              rows={3}
              placeholder="Detail what parts of the task are completed, files created, and current progress state..."
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
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
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
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
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Dispatching Request...' : 'Send Handover Request to Founder'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
