import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  ShieldCheck, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  FileText, 
  Layers, 
  ExternalLink, 
  Volume2, 
  ArrowRight, 
  KeyRound, 
  CheckCircle2, 
  User, 
  Calendar, 
  Search,
  Filter,
  Inbox,
  Sparkles,
  History,
  TrendingUp,
  Share2,
  AlertTriangle,
  ArrowRightLeft,
  Timer,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { formatCountdown, formatDateTime } from '../../utils/formatters';
import { sound } from '../../utils/soundFx';

export const RequestsView = () => {
  const { 
    tasks, 
    clientProjects, 
    currentUser, 
    founders,
    approveTaskCreation, 
    rejectTaskCreation,
    reviewProgress,
    requestTransfer,
    respondTransfer,
    requestExtension,
    reviewExtension,
    toggleBlocker,
    approveCredential,
    approveClientProject,
    rejectClientProject,
    auditLogs
  } = usePortal();

  const isSuperAdmin = currentUser?.role === 'superadmin';

  // activeTab: all | tasks | projects | proofs | extensions | transfers | blockers | credentials | history
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // 1. Task Creation Requests
  const pendingTaskCreations = tasks.filter(t => t.status === 'pending_approval' || t.approvalStatus === 'pending');

  // 2. Project Initialization Requests (Rule 04)
  const pendingProjects = clientProjects.filter(p => p.status === 'pending_approval' || p.approvalStatus === 'pending');

  // 3. Progress Proof Review Requests
  const pendingProofReviews = tasks.filter(t => 
    t.status === 'review_pending' || 
    (t.progressRequests && t.progressRequests.some(r => r.status === 'pending'))
  );

  // 4. Deadline Extension Requests (Rule 07)
  const pendingExtensions = tasks.filter(t => 
    t.extensionRequest && t.extensionRequest.status === 'pending'
  );

  // 5. Task Transfer Requests (Rule 10)
  const pendingTransfers = tasks.filter(t => 
    t.transferRequests && t.transferRequests.some(tr => tr.status === 'pending')
  );

  // 6. Active Blocker Flags (Rule 08)
  const activeBlockers = tasks.filter(t => t.isBlocked);

  // 7. Client Credential Requests
  const pendingCredentials = clientProjects.flatMap(p => 
    (p.credentials || []).map(c => ({ ...c, projectId: p.id, projectName: p.name }))
  ).filter(c => c.status === 'pending_approval');

  // Total pending count
  const totalPendingCount = 
    pendingTaskCreations.length + 
    pendingProjects.length +
    pendingProofReviews.length + 
    pendingExtensions.length + 
    pendingTransfers.length + 
    activeBlockers.length + 
    pendingCredentials.length;

  // History decision logs
  const decisionLogs = auditLogs.filter(log => 
    log.action.includes('APPROVED') || 
    log.action.includes('REJECTED') || 
    log.action.includes('EXTENSION') || 
    log.action.includes('TRANSFER') || 
    log.action.includes('BLOCKER') || 
    log.action.includes('STRIKE') ||
    log.action.includes('PROJECT')
  );

  // Handlers
  const handleApproveProject = async (projectId) => {
    setProcessingId(projectId);
    await approveClientProject(projectId);
    setProcessingId(null);
  };

  const handleRejectProject = async (projectId) => {
    const reason = window.prompt('Specify reason for declining project initialization:', 'Scope or resource allocation requires review.');
    if (reason !== null) {
      setProcessingId(projectId);
      await rejectClientProject(projectId, reason);
      setProcessingId(null);
    }
  };

  const handleApproveTask = async (taskId) => {
    setProcessingId(taskId);
    await approveTaskCreation(taskId);
    setProcessingId(null);
  };

  const handleRejectTask = async (taskId) => {
    const reason = window.prompt('Specify reason for rejecting task creation:', 'Not aligned with current sprint priorities.');
    if (reason !== null) {
      setProcessingId(taskId);
      await rejectTaskCreation(taskId, reason);
      setProcessingId(null);
    }
  };

  const handleApproveProof = async (task, request) => {
    setProcessingId(task.id);
    await reviewProgress(task.id, {
      requestId: request.id,
      decision: 'approve',
      verifiedPercent: request.targetProgress,
      feedback: 'Approved by Lead Admin verification.'
    });
    setProcessingId(null);
  };

  const handleRejectProof = async (task, request) => {
    const feedback = window.prompt('Specify feedback for rejecting progress proof:', 'Insufficient proof URL / deliverables.');
    if (feedback !== null) {
      setProcessingId(task.id);
      await reviewProgress(task.id, {
        requestId: request.id,
        decision: 'reject',
        feedback
      });
      setProcessingId(null);
    }
  };

  // Extensions
  const handleApproveExtension = async (taskId) => {
    setProcessingId(taskId);
    await reviewExtension(taskId, { decision: 'approve', status: 'approved' });
    setProcessingId(null);
  };

  const handleRejectExtension = async (taskId) => {
    const feedback = window.prompt('Reason for rejecting extension request:', 'Strict sprint deadline must be met without postponement.');
    if (feedback !== null) {
      setProcessingId(taskId);
      await reviewExtension(taskId, { decision: 'reject', status: 'rejected', feedback });
      setProcessingId(null);
    }
  };

  // Transfers
  const handleAcceptTransfer = async (taskId, transferId) => {
    setProcessingId(transferId);
    await respondTransfer(taskId, { transferId, decision: 'accept' });
    setProcessingId(null);
  };

  const handleDeclineTransfer = async (taskId, transferId) => {
    const note = window.prompt('Reason for declining handover transfer:', 'Bandwidth full on current high-priority commitments.');
    if (note !== null) {
      setProcessingId(transferId);
      await respondTransfer(taskId, { transferId, decision: 'decline', note });
      setProcessingId(null);
    }
  };

  // Blockers
  const handleResolveBlocker = async (taskId) => {
    setProcessingId(taskId);
    await toggleBlocker(taskId, { isBlocked: false });
    setProcessingId(null);
  };

  // Credentials
  const handleApproveCred = async (projectId, credId) => {
    setProcessingId(credId);
    await approveCredential(projectId, credId);
    setProcessingId(null);
  };

  const matchesSearch = (title = '', extra = '') => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return title.toLowerCase().includes(q) || extra.toLowerCase().includes(q);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1700px] mx-auto pb-28 md:pb-16 text-slate-800">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${totalPendingCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Requests & Governance Hub
            </h2>
            {totalPendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-xs">
                {totalPendingCount} Action Required
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational oversight center for task creation, progress proofs, deadline extensions, handovers, blocker escalations & credentials
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all requests..."
            className="w-full pl-9 pr-3.5 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
          />
        </div>
      </div>

      {/* Tabs Navigation Pills */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 overflow-x-auto text-xs font-semibold no-scrollbar">
        <button
          onClick={() => { sound.playPop(); setActiveTab('all'); }}
          className={`px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          All Pending ({totalPendingCount})
        </button>

        <button
          onClick={() => { sound.playPop(); setActiveTab('tasks'); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'tasks'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Task Creational ({pendingTaskCreations.length})</span>
        </button>

        <button
          onClick={() => { sound.playPop(); setActiveTab('projects'); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'projects'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Project Proposals ({pendingProjects.length})</span>
        </button>

        <button
          onClick={() => { sound.playPop(); setActiveTab('proofs'); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'proofs'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Progress Proofs ({pendingProofReviews.length})</span>
        </button>

        <button
          onClick={() => { sound.playPop(); setActiveTab('extensions'); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'extensions'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Extensions ({pendingExtensions.length})</span>
        </button>

        <button
          onClick={() => { sound.playPop(); setActiveTab('transfers'); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'transfers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Transfers ({pendingTransfers.length})</span>
        </button>

        <button
          onClick={() => { sound.playPop(); setActiveTab('blockers'); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'blockers'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Active Blockers ({activeBlockers.length})</span>
        </button>

        <button
          onClick={() => { sound.playPop(); setActiveTab('credentials'); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'credentials'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Credentials ({pendingCredentials.length})</span>
        </button>

        <button
          onClick={() => { sound.playPop(); setActiveTab('history'); }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            activeTab === 'history'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Decision Log ({decisionLogs.length})</span>
        </button>
      </div>

      {/* Main Request Cards Feed */}
      <div className="space-y-6">

        {/* SECTION 0: Founder Project Creation Requests (Rule 04) */}
        {(activeTab === 'all' || activeTab === 'projects') && pendingProjects.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Founder Project Initialization Proposals ({pendingProjects.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingProjects
                .filter(p => matchesSearch(p.name, `${p.clientName} ${p.brand}`))
                .map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-amber-400 hover:shadow-lg transition-all space-y-3.5"
                  >
                    {/* Header Tags */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                            {proj.brand || 'Weblets®'}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {proj.projectType === 'client' ? 'Client Web Project' : 'Brand Initiative'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                            Budget: {proj.budget || '$0'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {proj.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Client Account: <span className="font-semibold text-slate-700">{proj.clientName}</span>
                        </p>
                      </div>

                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        Pending Admin Review
                      </span>
                    </div>

                    {/* Request Details */}
                    <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase text-amber-900">
                        <span>Lead Founder: {proj.leadFounder}</span>
                        <span>Requested By: {proj.requestedByName || 'Founder'}</span>
                      </div>
                      {proj.domain && (
                        <div className="font-mono text-[11px] text-slate-600 flex items-center gap-1.5">
                          <span className="text-slate-400">Staging:</span>
                          <span className="font-bold text-slate-800">{proj.domain}</span>
                        </div>
                      )}
                      {proj.scope && (
                        <p className="text-[11px] text-slate-600 italic">
                          Scope: "{proj.scope}"
                        </p>
                      )}
                    </div>

                    {/* Rule 04 Compliance notice */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Rule 04: Project cannot enter active development without Super Admin sign-off.</span>
                    </div>

                    {/* Action Buttons for Super Admin */}
                    {isSuperAdmin ? (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleApproveProject(proj.id)}
                          disabled={processingId === proj.id}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>{processingId === proj.id ? 'Approving...' : 'Approve & Launch Workspace'}</span>
                        </button>
                        <button
                          onClick={() => handleRejectProject(proj.id)}
                          disabled={processingId === proj.id}
                          className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs border border-slate-200 hover:border-rose-200 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-100 text-center text-xs text-slate-500 font-medium">
                        Proposal submitted to Super Admin for verification.
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {/* SECTION 1: Task Creation Requests */}
        {(activeTab === 'all' || activeTab === 'tasks') && pendingTaskCreations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Founder Task Creation Approvals ({pendingTaskCreations.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingTaskCreations
                .filter(t => matchesSearch(t.title, t.requesterName))
                .map((task) => {
                const countdown = formatCountdown(task.deadline);

                return (
                  <div
                    key={task.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-400 hover:shadow-lg transition-all space-y-3.5"
                  >
                    {/* Header Tags & Live Countdown */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-mono">
                            {task.projectName || 'General Sprint'}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            Topic: {task.topic || 'Engineering'}
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            task.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                            task.priority === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {task.priority} Priority
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 ${
                          countdown.isOverdue ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{countdown.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Assigned Founders Pill (Kake Assign) */}
                    <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-orange-900">
                        <span>Assigned Founder(s) for Execution:</span>
                        <span className="font-mono text-orange-700">
                          Mode: {task.assignmentMode === 'team' ? 'Team Sprint' : task.assignmentMode === 'cloned' ? 'Cloned Mode' : 'Single Founder'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 ? (
                          task.assignedTo.map(fId => {
                            const founderObj = founders.find(f => f.id === fId) || {
                              name: fId === 'admin' ? 'SSA Lead Admin' : 'Founder',
                              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                              designation: 'Executive'
                            };

                            return (
                              <div key={fId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-orange-200 shadow-2xs">
                                <img 
                                  src={founderObj.avatar} 
                                  alt={founderObj.name} 
                                  className="w-5 h-5 rounded-full object-cover shrink-0 aspect-square ring-1 ring-orange-300"
                                />
                                <span className="text-xs font-bold text-slate-800">{founderObj.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">({founderObj.designation})</span>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-xs text-slate-500 italic">No founder explicitly mapped.</span>
                        )}
                      </div>
                    </div>

                    {/* Exact Dates & Timeline Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Submitted Date & Time</span>
                        <span className="font-semibold text-slate-800">
                          {formatDateTime(task.createdAt || task.id)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Strict Completion Deadline</span>
                        <span className="font-semibold text-rose-700 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{formatDateTime(task.deadline)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Task Description & Scope */}
                    {task.description && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                        <p className="font-semibold text-slate-900 mb-0.5 text-[11px]">Task Description & Scope:</p>
                        <p className="line-clamp-3">{task.description}</p>
                      </div>
                    )}

                    {/* Deliverables Checklist Items Preview */}
                    {task.checklist && task.checklist.length > 0 && (
                      <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700 text-[11px]">
                          <span>Deliverables & Checkpoints ({task.checklist.length}):</span>
                        </div>
                        <div className="space-y-1">
                          {task.checklist.map((item, idx) => (
                            <div key={item.id || idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                              <span className="truncate">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requester Metadata */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Submitted by: <strong className="text-slate-800">{task.requesterName || 'Founder'}</strong></span>
                      </span>
                    </div>

                    {/* Action Buttons for Super Admin */}
                    {isSuperAdmin ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleApproveTask(task.id)}
                          disabled={processingId === task.id}
                          className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Activate to Kanban</span>
                        </button>

                        <button
                          onClick={() => handleRejectTask(task.id)}
                          disabled={processingId === task.id}
                          className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Submitted for Super Admin approval. You will receive a notification once reviewed.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: Progress Proof Review Requests */}
        {(activeTab === 'all' || activeTab === 'proofs') && pendingProofReviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Progress Proof Verifications ({pendingProofReviews.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingProofReviews
                .filter(t => matchesSearch(t.title))
                .map((task) => {
                const latestRequest = task.progressRequests?.find(r => r.status === 'pending') || {
                  targetProgress: 100,
                  proofUrl: 'Submitted for completion',
                  notes: 'Task completed proof'
                };

                return (
                  <div
                    key={task.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-amber-400 hover:shadow-lg transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono mb-1 inline-block">
                          Proof Review (Rule 09)
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                          {task.progress}% → {latestRequest.targetProgress}%
                        </span>
                      </div>
                    </div>

                    {/* Proof Link & Voice Note */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      {latestRequest.proofUrl && (
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500 block">Deliverable Proof URL:</span>
                          <a
                            href={latestRequest.proofUrl.startsWith('http') ? latestRequest.proofUrl : `https://${latestRequest.proofUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 font-mono text-xs font-semibold hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{latestRequest.proofUrl}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        </div>
                      )}

                      {latestRequest.voiceNoteUrl && (
                        <div className="pt-1">
                          <span className="text-[10px] font-semibold text-slate-500 block mb-1">Attached Voice Note Memo:</span>
                          <audio controls src={latestRequest.voiceNoteUrl} className="w-full h-8" />
                        </div>
                      )}

                      {latestRequest.notes && (
                        <p className="text-slate-600 text-[11px] italic">
                          "{latestRequest.notes}"
                        </p>
                      )}
                    </div>

                    {isSuperAdmin ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleApproveProof(task, latestRequest)}
                          disabled={processingId === task.id}
                          className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve Progress %</span>
                        </button>

                        <button
                          onClick={() => handleRejectProof(task, latestRequest)}
                          disabled={processingId === task.id}
                          className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject Proof</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Proof submitted to Super Admin. Verification in progress.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: Deadline Extension Requests (Rule 07) */}
        {(activeTab === 'all' || activeTab === 'extensions') && pendingExtensions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Deadline Extension Petitions ({pendingExtensions.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingExtensions
                .filter(t => matchesSearch(t.title, t.extensionRequest?.reason))
                .map((task) => {
                const ext = task.extensionRequest;
                const requester = founders.find(f => f.id === ext.requestedBy) || {
                  name: 'Assigned Founder',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                };

                return (
                  <div
                    key={`ext_${task.id}`}
                    className="p-5 rounded-3xl bg-white border border-purple-200/90 shadow-sm hover:border-purple-400 hover:shadow-lg transition-all space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-mono mb-1 inline-block">
                          Rule 07: Deadline Extension
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold font-mono">
                        Awaiting Admin Review
                      </span>
                    </div>

                    {/* Timeline comparison */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Current Deadline</span>
                        <span className="font-semibold text-slate-700 line-through">
                          {formatDateTime(task.deadline)}
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-600 block text-[9px] uppercase font-bold">Proposed Extended Deadline</span>
                        <span className="font-bold text-purple-900 flex items-center gap-1">
                          <Timer className="w-3 h-3 text-purple-600 shrink-0" />
                          <span>{formatDateTime(ext.requestedDeadline)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Reason statement */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                      <p className="font-semibold text-slate-900 mb-0.5 text-[11px]">Justification & Impact Analysis:</p>
                      <p className="italic">"{ext.reason || 'Operational scope adjustment required.'}"</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <img src={requester.avatar} alt={requester.name} className="w-5 h-5 rounded-full object-cover" />
                        <span>Petitioned by: <strong className="text-slate-800">{requester.name}</strong></span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatDateTime(ext.requestedAt)}
                      </span>
                    </div>

                    {/* Super Admin Action Controls */}
                    {isSuperAdmin ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleApproveExtension(task.id)}
                          disabled={processingId === task.id}
                          className="flex-1 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Postpone Deadline</span>
                        </button>

                        <button
                          onClick={() => handleRejectExtension(task.id)}
                          disabled={processingId === task.id}
                          className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-semibold flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>Submitted to Super Admin. You will receive an alert once accepted.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 4: Task Transfer / Handover Requests (Rule 10) */}
        {(activeTab === 'all' || activeTab === 'transfers') && pendingTransfers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Task Handover & Ownership Transfers ({pendingTransfers.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingTransfers
                .filter(t => matchesSearch(t.title))
                .flatMap(task => 
                  task.transferRequests
                    .filter(tr => tr.status === 'pending')
                    .map(tr => ({ task, tr }))
                )
                .map(({ task, tr }) => {
                  const fromFounder = founders.find(f => f.id === tr.fromUserId) || {
                    name: 'Current Owner',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                  };
                  const toFounder = founders.find(f => f.id === tr.toUserId) || {
                    name: 'Target Founder',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  };

                  const canRespond = currentUser?.id === tr.toUserId || isSuperAdmin;

                  return (
                    <div
                      key={`tr_${tr.id}`}
                      className="p-5 rounded-3xl bg-white border border-blue-200/90 shadow-sm hover:border-blue-400 hover:shadow-lg transition-all space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-mono mb-1 inline-block">
                            Rule 10: Task Handover Protocol
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {task.title}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold font-mono">
                          Handover Pending
                        </span>
                      </div>

                      {/* From -> To Founders Flow */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs">
                        <div className="flex items-center gap-2">
                          <img src={fromFounder.avatar} alt={fromFounder.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-300" />
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">From Current Owner</span>
                            <span className="font-bold text-slate-800">{fromFounder.name}</span>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mx-2" />

                        <div className="flex items-center gap-2 text-right">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">To Proposed Owner</span>
                            <span className="font-bold text-blue-900">{toFounder.name}</span>
                          </div>
                          <img src={toFounder.avatar} alt={toFounder.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-400" />
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                        <p className="font-semibold text-slate-900 mb-0.5 text-[11px]">Handover Brief / Reason:</p>
                        <p className="italic">"{tr.reason || 'Reassigning domain workload for sprint balance.'}"</p>
                      </div>

                      {/* Actions */}
                      {canRespond ? (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleAcceptTransfer(task.id, tr.id)}
                            disabled={processingId === tr.id}
                            className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept Ownership</span>
                          </button>

                          <button
                            onClick={() => handleDeclineTransfer(task.id, tr.id)}
                            disabled={processingId === tr.id}
                            className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            <span>Decline Handover</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Awaiting acceptance by {toFounder.name}.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* SECTION 5: Active Blocker Flags (Rule 08) */}
        {(activeTab === 'all' || activeTab === 'blockers') && activeBlockers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600">
                🚨 Rule 08 Active Blocker Escalations ({activeBlockers.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeBlockers
                .filter(t => matchesSearch(t.title, t.blockerReason))
                .map((task) => {
                const assignedFounder = founders.find(f => (task.assignedTo || []).includes(f.id)) || {
                  name: 'Assignee',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                };

                return (
                  <div
                    key={`blocker_${task.id}`}
                    className="p-5 rounded-3xl bg-rose-50/40 border-2 border-rose-300 shadow-sm hover:border-rose-500 hover:shadow-lg transition-all space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-mono mb-1 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Rule 08: Blocker Escalation</span>
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs animate-pulse">
                        BLOCKED
                      </span>
                    </div>

                    {/* Blocker Reason Box */}
                    <div className="p-3.5 rounded-2xl bg-white border border-rose-200 space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                        Reported Obstacle / Blockage:
                      </span>
                      <p className="text-rose-900 font-medium leading-relaxed">
                        {task.blockerReason || 'Critical dependency impediment reported by assignee.'}
                      </p>
                      {task.blockedAt && (
                        <p className="text-[10px] text-slate-400 font-mono pt-1">
                          Reported: {formatDateTime(task.blockedAt)}
                        </p>
                      )}
                    </div>

                    {/* Assignee & Project info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-rose-200/60">
                      <div className="flex items-center gap-1.5">
                        <img src={assignedFounder.avatar} alt={assignedFounder.name} className="w-5 h-5 rounded-full object-cover" />
                        <span>Owner: <strong className="text-slate-800">{assignedFounder.name}</strong></span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-rose-200 text-slate-700">
                        {task.projectName || 'Active Task'}
                      </span>
                    </div>

                    {/* One-Click Blocker Resolution */}
                    <div className="pt-2 border-t border-rose-200/60 flex items-center gap-2">
                      <button
                        onClick={() => handleResolveBlocker(task.id)}
                        disabled={processingId === task.id}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark Obstacle Resolved & Clear Blocker</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 6: Client Credential Upload Requests */}
        {(activeTab === 'all' || activeTab === 'credentials') && pendingCredentials.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-orange-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Client Vault Credential Verifications ({pendingCredentials.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingCredentials
                .filter(c => matchesSearch(c.title, c.projectName))
                .map((cred) => (
                <div
                  key={cred.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-orange-400 hover:shadow-lg transition-all space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200 font-mono">
                        {cred.projectName}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {cred.title} ({cred.service})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Submitted by: <strong className="text-slate-800">{cred.submittedBy}</strong>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                      Pending Security Audit
                    </span>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleApproveCred(cred.projectId, cred.id)}
                        disabled={processingId === cred.id}
                        className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Unlock to Vault</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: Decision Log / Audit Trail */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Governance Decision Trail ({decisionLogs.length})
              </h3>
            </div>

            <div className="space-y-2">
              {decisionLogs.length > 0 ? (
                decisionLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs flex items-center justify-between gap-3 shadow-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{log.action}</span>
                      <p className="text-slate-800 font-medium">{log.details}</p>
                      <p className="text-[10px] text-slate-400 italic">Executed by: {log.actor}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No governance decision logs recorded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalPendingCount === 0 && activeTab !== 'history' && (
          <div className="p-12 rounded-3xl bg-white border border-slate-200/90 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">All Approvals Clear</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                There are no pending task creation requests, proof audits, deadline extensions, transfers, or blocker escalations awaiting review.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
