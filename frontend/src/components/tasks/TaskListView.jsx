import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Search,
  Check,
  X,
  User,
  FolderGit2,
  Sparkles,
  Inbox
} from 'lucide-react';
import { formatCountdown } from '../../utils/formatters';
import { sound } from '../../utils/soundFx';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const TaskListView = ({ onSelectTask, onOpenCreateModal }) => {
  const { 
    tasks, 
    currentUser, 
    clientProjects, 
    approveTaskCreation, 
    rejectTaskCreation,
    founders,
    isLoading
  } = usePortal();

  const [activeFilter, setActiveFilter] = useState('all'); // all | my_tasks | urgent | review_pending
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [isProcessingId, setIsProcessingId] = useState(null);

  if (isLoading) {
    return <SkeletonLoader type="kanban" />;
  }

  const isSuperAdmin = currentUser?.role === 'superadmin';

  // Separate tasks: Pending Creation Approval vs Active Board Tasks
  const pendingCreationTasks = tasks.filter(t => t.status === 'pending_approval' || t.approvalStatus === 'pending');
  const myPendingTasks = pendingCreationTasks.filter(t => 
    t.requesterId === currentUser?.id || 
    t.assignedBy === currentUser?.id || 
    (Array.isArray(t.assignedTo) && t.assignedTo.includes(currentUser?.id))
  );

  const activeTasks = tasks.filter(t => t.status !== 'pending_approval' && t.approvalStatus !== 'pending');

  const filteredTasks = activeTasks.filter(t => {
    // Search query filter
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.topic && t.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (t.projectName && t.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    // Project filter
    if (selectedProject !== 'all' && t.projectId !== selectedProject) return false;

    // Tab filter
    if (activeFilter === 'my_tasks') return Array.isArray(t.assignedTo) && t.assignedTo.includes(currentUser?.id);
    if (activeFilter === 'urgent') return t.priority === 'urgent';
    if (activeFilter === 'review_pending') return t.status === 'review_pending';
    return true;
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-slate-200/80 bg-slate-50/40' },
    { id: 'in_progress', title: 'In Progress', color: 'border-orange-200/70 bg-orange-50/30' },
    { id: 'review_pending', title: 'Pending Review', color: 'border-amber-200/70 bg-amber-50/20' },
    { id: 'completed', title: 'Completed', color: 'border-emerald-200/70 bg-emerald-50/20' }
  ];

  const handleApprove = async (e, taskId) => {
    e.stopPropagation();
    setIsProcessingId(taskId);
    await approveTaskCreation(taskId);
    setIsProcessingId(null);
  };

  const handleReject = async (e, taskId) => {
    e.stopPropagation();
    const reason = window.prompt('Specify reason for rejecting task creation:', 'Not aligned with current sprint priorities.');
    if (reason !== null) {
      setIsProcessingId(taskId);
      await rejectTaskCreation(taskId, reason);
      setIsProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1700px] mx-auto pb-28 md:pb-16">
      
      {/* 1. SUPER ADMIN: Task Creation Requests Approval Queue */}
      {isSuperAdmin && pendingCreationTasks.length > 0 && (
        <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-300/80 shadow-md backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm md:text-base font-bold text-slate-900">
                    Founder Task Creation Approvals
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-bold">
                    {pendingCreationTasks.length} Pending
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tasks submitted by Founders. Review and approve to activate onto the live Kanban sprint board.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {pendingCreationTasks.map((task) => (
              <div 
                key={task.id}
                className="p-4 rounded-2xl bg-white border border-amber-200/90 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 truncate">
                      {task.projectName || 'Project'}
                    </span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      {task.priority || 'medium'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>By: <strong className="text-slate-700">{task.requesterName || 'Founder'}</strong></span>
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={(e) => handleApprove(e, task.id)}
                    disabled={isProcessingId === task.id}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Activate</span>
                  </button>

                  <button
                    onClick={(e) => handleReject(e, task.id)}
                    disabled={isProcessingId === task.id}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. FOUNDER: Pending Creation Notice */}
      {!isSuperAdmin && myPendingTasks.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50/80 border border-amber-200/90 shadow-xs flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                You have {myPendingTasks.length} task request{myPendingTasks.length > 1 ? 's' : ''} awaiting Lead Admin approval
              </h4>
              <p className="text-[11px] text-slate-600">
                Once reviewed and accepted by Super Admin, your tasks will appear on the live Kanban board.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold shrink-0">
            Pending Review
          </span>
        </div>
      )}

      {/* Top Controls & Filter Bar */}
      <div data-tour="tasks-radar-header" className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 bg-white p-4 md:p-5 rounded-3xl border border-slate-200/90 shadow-sm backdrop-blur-md">
        
        {/* Search & Project Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, deliverables, topics..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50 text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="relative sm:w-56 shrink-0">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs bg-slate-50 text-slate-700 font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="all">📁 All Projects ({activeTasks.length})</option>
              {clientProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectType === 'internal' ? '🚀' : '💼'} {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills & Create Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs font-medium">
            <button
              onClick={() => { sound.playPop(); setActiveFilter('all'); }}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              All ({activeTasks.length})
            </button>

            <button
              onClick={() => { sound.playPop(); setActiveFilter('my_tasks'); }}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeFilter === 'my_tasks'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              My Tasks
            </button>

            <button
              onClick={() => { sound.playPop(); setActiveFilter('review_pending'); }}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeFilter === 'review_pending'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-amber-700 hover:bg-amber-100/60'
              }`}
            >
              Proof Queue
            </button>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:shadow-lg transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isSuperAdmin ? 'Create Task' : 'Request Task Creation'}</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div key={col.id} className="flex flex-col space-y-3">
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs font-bold text-slate-800 shadow-xs">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    col.id === 'todo' ? 'bg-slate-400' :
                    col.id === 'in_progress' ? 'bg-orange-500 animate-pulse' :
                    col.id === 'review_pending' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <span>{col.title}</span>
                </span>
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] border border-slate-200 font-mono font-bold">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Column Container */}
              <div className={`flex-1 p-2.5 rounded-3xl border ${col.color} space-y-3 min-h-[380px]`}>
                {colTasks.map((task) => {
                  const isCompleted = task.status === 'completed' || task.progress >= 100;
                  const countdown = formatCountdown(task.deadline, isCompleted);
                  const isOverdue = !isCompleted && countdown.isOverdue;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`p-4 rounded-3xl transition-all duration-300 cursor-pointer space-y-3 relative group shadow-sm ${
                        isCompleted
                          ? 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 border-2 border-emerald-400/90 shadow-emerald-500/10 hover:shadow-xl hover:border-emerald-500 hover:-translate-y-0.5'
                          : 'bg-white border border-slate-200/90 hover:border-orange-500/80 hover:shadow-xl hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full truncate max-w-[140px] ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {task.projectName || task.topic}
                        </span>

                        {isCompleted ? (
                          <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xs flex items-center gap-1 border border-emerald-400/40">
                            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                            <span>Delivered ✓</span>
                          </span>
                        ) : (
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            task.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                            task.priority === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className={`text-xs font-bold line-clamp-2 leading-snug transition-colors flex items-start gap-1.5 ${
                        isCompleted
                          ? 'text-slate-900 group-hover:text-emerald-700'
                          : 'text-slate-900 group-hover:text-orange-600'
                      }`}>
                        {isCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <span>{task.title}</span>
                      </h4>

                      {/* Blocker Alert Tag (Rule 08) - only if NOT completed */}
                      {!isCompleted && task.isBlocked && (
                        <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                          <span className="truncate">Blocked: {task.blockerReason || 'Rule 08 help signal'}</span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className={isCompleted ? 'font-bold text-emerald-800' : 'text-slate-500'}>
                            {isCompleted ? 'Milestone Completed' : 'Progress'}
                          </span>
                          <span className={`font-bold ${isCompleted ? 'text-emerald-700 font-extrabold' : 'text-orange-600'}`}>
                            {task.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shadow-2xs' : 'bg-gradient-to-r from-orange-600 to-amber-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Bottom Footer */}
                      <div className={`pt-2.5 border-t flex items-center justify-between text-[10px] ${
                        isCompleted ? 'border-emerald-100/90' : 'border-slate-100'
                      }`}>
                        {isCompleted ? (
                          <div className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.8 rounded-xl border border-emerald-300/80 shadow-2xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Verified & Signed Off ✓</span>
                          </div>
                        ) : (
                          <div className={`flex items-center gap-1.5 font-mono font-medium ${
                            isOverdue ? 'text-rose-600 font-bold animate-pulse' :
                            countdown.urgent ? 'text-amber-600 font-bold' : 'text-slate-500'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{countdown.label}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {task.checklist?.length > 0 && (
                            <span className={`text-[10px] font-mono ${
                              isCompleted
                                ? 'font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200'
                                : 'text-slate-500'
                            }`}>
                              {task.checklist.filter(c => c.completed).length}/{task.checklist.length}
                              {isCompleted && ' ✓'}
                            </span>
                          )}

                          {task.referenceLinks?.length > 0 && (
                            <span className={`text-[10px] flex items-center gap-0.5 font-medium ${
                              isCompleted ? 'text-emerald-700' : 'text-blue-600'
                            }`}>
                              <span>{task.referenceLinks.length} refs</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs italic space-y-1">
                    <Inbox className="w-5 h-5 opacity-40" />
                    <span>No tasks in this stage</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
