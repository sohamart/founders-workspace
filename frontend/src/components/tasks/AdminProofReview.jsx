import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { X, ExternalLink, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export const AdminProofReview = ({ task, request, onClose }) => {
  const { reviewProgress } = usePortal();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDecision = async (decision) => {
    setIsSubmitting(true);
    await reviewProgress(task.id, {
      requestId: request.id,
      decision,
      verifiedPercent: request.targetProgress,
      feedback: feedback || (decision === 'approve' ? 'Approved by Lead Admin.' : 'Proof insufficient. Progress reverted.')
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Admin Proof Verification</h3>
              <p className="text-[11px] text-slate-500">Gatekeeper verification for official task progress</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Details */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">Task Title</span>
            <span className="font-bold text-slate-900">{task.title}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">Requester</span>
            <span className="font-bold text-slate-800">{request.requesterName}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="font-semibold text-slate-600">Requested Jump</span>
            <span className="font-mono text-xs">
              <span className="text-slate-400 line-through mr-1">{request.currentProgress}%</span>
              ➔ <strong className="text-orange-600 text-sm ml-1">{request.targetProgress}%</strong>
            </span>
          </div>

          <div>
            <span className="font-semibold text-slate-600 block mb-1">Submitted Proof Link</span>
            <a
              href={request.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 p-2 rounded-xl bg-orange-100/70 border border-orange-300 text-orange-950 font-mono text-xs font-semibold hover:bg-orange-200 transition-colors w-full justify-between"
            >
              <span className="truncate">{request.proofUrl}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>

          {request.notes && (
            <div>
              <span className="font-semibold text-slate-600 block mb-0.5">Founder Completion Notes</span>
              <p className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs italic">
                "{request.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Feedback Input */}
        <div className="text-xs">
          <label className="block font-semibold text-slate-700 mb-1">Admin Feedback / Reason (Required on Rejection)</label>
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Verified test output / need additional unit tests..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
          />
        </div>

        {/* Decision Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDecision('reject')}
            className="flex-1 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject & Rollback %</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDecision('approve')}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve Progress</span>
          </button>
        </div>

      </div>
    </div>
  );
};
