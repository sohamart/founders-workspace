import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  CheckSquare, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck,
  AlertCircle,
  Users,
  Activity,
  GitPullRequest,
  ArrowRightLeft,
  Timer,
  AlertTriangle,
  Video,
  PhoneCall,
  CheckCircle2,
  XCircle,
  KeyRound
} from 'lucide-react';
import { formatCountdown } from '../../utils/formatters';
import { sound } from '../../utils/soundFx';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const DashboardView = ({ onOpenCreateTask, onOpenNewClient }) => {
  const { 
    currentUser, 
    tasks, 
    clientProjects, 
    meeting, 
    setCurrentTab, 
    founders,
    auditLogs = [],
    isLoading
  } = usePortal();

  const [activityFilter, setActivityFilter] = React.useState('all');
  const [showAllActivities, setShowAllActivities] = React.useState(false);

  if (isLoading) {
    return <SkeletonLoader type="cards" count={4} />;
  }

  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.progress < 100);
  const myTasks = tasks.filter(t => t.assignedTo.includes(currentUser?.id) && t.status !== 'completed' && t.progress < 100);
  const activeFounders = founders.filter(f => f.role === 'founder' && f.status === 'active');
  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.progress < 100 && formatCountdown(t.deadline).isOverdue);

  const filteredLogs = (auditLogs || []).filter(log => {
    if (!log || !log.action) return false;
    const action = log.action.toUpperCase();
    if (activityFilter === 'transfers') return action.includes('TRANSFER');
    if (activityFilter === 'meetings') return action.includes('MEETING') || action.includes('CALL') || action.includes('RSVP');
    if (activityFilter === 'tasks') return action.includes('TASK') || action.includes('PROOF') || action.includes('DAILY') || action.includes('PROGRESS');
    if (activityFilter === 'blockers') return action.includes('BLOCK') || action.includes('STRIKE') || action.includes('WARNING');
    if (activityFilter === 'requests') return action.includes('TRANSFER') || action.includes('EXTENSION') || action.includes('REQUEST') || action.includes('APPROVED') || action.includes('REJECTED') || action.includes('CREDENTIAL');
    return true;
  });

  const displayedLogs = showAllActivities ? filteredLogs : filteredLogs.slice(0, 30);

  return (
    <div className="space-y-6 animate-fade-in max-w-[1700px] mx-auto pb-28 md:pb-16">
      
      {/* Welcome Hero Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50 border border-orange-200/90 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Weblets® × StackAdda™ Executive Suite</span>
          </div>

          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Founder'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-normal leading-relaxed">
            "Discipline today builds the freedom we want tomorrow." Keep pace with ongoing client sprints and operating protocol v2.0.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={onOpenCreateTask}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5"
          >
            <span>+ Create Task</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setCurrentTab('chat');
            }}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-orange-50/60 text-slate-700 font-semibold text-xs border border-orange-200/80 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
            <span>Open Chat & DMs</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: My Pending Tasks */}
        <div 
          onClick={() => { sound.playPop(); setCurrentTab('tasks'); }}
          className="p-4 md:p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer space-y-2 group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">My Action Items</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {myTasks.length}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Assigned directly to you</p>
        </div>

        {/* Card 2: Client Projects */}
        <div 
          onClick={() => { sound.playPop(); setCurrentTab('projects'); }}
          className="p-4 md:p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer space-y-2 group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Client Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {clientProjects.length}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Active web development</p>
        </div>

        {/* Card 3: Active Founders */}
        <div 
          onClick={() => { sound.playPop(); setCurrentTab('rules'); }}
          className="p-4 md:p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer space-y-2 group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Active Founders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {activeFounders.length}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Equal standard (Rule 00)</p>
        </div>

        {/* Card 4: Overdue Risks */}
        <div 
          onClick={() => { sound.playPop(); setCurrentTab('tasks'); }}
          className="p-4 md:p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer space-y-2 group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Overdue Radar</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold font-mono ${overdueTasks.length > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
            {overdueTasks.length}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Subject to Rule 26 strike</p>
        </div>

      </div>

      {/* Two-Column Workspace Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 cols): My Assigned Tasks List */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Priority Deliverables</h3>
              <p className="text-[11px] text-slate-500">Tasks requiring your attention and daily update</p>
            </div>
            <button
              onClick={() => setCurrentTab('tasks')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {myTasks.length > 0 ? (
              myTasks.slice(0, 4).map((task) => {
                const countdown = formatCountdown(task.deadline);
                return (
                  <div
                    key={task.id}
                    onClick={() => setCurrentTab('tasks')}
                    className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 hover:bg-orange-50/40 hover:border-orange-200 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {task.topic}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${countdown.isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                          {countdown.label}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 truncate max-w-md">{task.title}</h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-orange-600">{task.progress}%</span>
                      <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full" style={{ width: `${task.progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                All assigned tasks completed. Good work!
              </p>
            )}
          </div>
        </div>

        {/* Right (1 col): Three Founders & Operating Protocol */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Founders Circle</h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              v2.0 STRICT
            </span>
          </div>

          <div className="space-y-3">
            {activeFounders.map((f) => (
              <div key={f.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img src={f.avatar} alt={f.name} className="w-8 h-8 min-w-[32px] max-w-[32px] aspect-square shrink-0 rounded-full object-cover ring-1 ring-slate-200" />
                  <div>
                    <h5 className="font-bold text-slate-800">{f.name}</h5>
                    <p className="text-[10px] text-orange-600 font-medium">{f.designation}</p>
                  </div>
                </div>

                {f.signature?.signed ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Signed ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setCurrentTab('rules')}
              className="w-full py-2.5 rounded-xl bg-orange-50/70 hover:bg-orange-100/80 text-orange-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-orange-200"
            >
              <BookOpen className="w-4 h-4 text-orange-600" />
              <span>Inspect Rules Charter</span>
            </button>
          </div>
        </div>

      </div>

      {/* Live Portal Activity Stream (Rule 00 Universal Operational Visibility) */}
      <div className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Live Portal Activity Stream</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Real-time operational audit trail across Weblets & StackAdda</p>
            </div>
          </div>

          {/* Activity Filters */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'all', label: 'All Activities' },
              { id: 'transfers', label: 'Transfers 🔄' },
              { id: 'meetings', label: 'Calls & Syncs 📅' },
              { id: 'tasks', label: 'Tasks ⚡' },
              { id: 'requests', label: 'Requests 📋' },
              { id: 'blockers', label: 'Blockers 🚨' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => { sound.playPop(); setActivityFilter(f.id); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activityFilter === f.id
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Feed Items */}
        <div className="space-y-2">
          {displayedLogs.length > 0 ? (
            displayedLogs.map((log) => {
              const act = (log.action || '').toUpperCase();
              const isBlocker = act.includes('BLOCK');
              const isTransfer = act.includes('TRANSFER');
              const isMeeting = act.includes('MEETING') || act.includes('CALL') || act.includes('RSVP');
              const isExtension = act.includes('EXTENSION');
              const isStrike = act.includes('STRIKE') || act.includes('WARNING');
              const isApproval = act.includes('APPROVED') || act.includes('ACCEPTED');
              const isRejection = act.includes('REJECTED') || act.includes('DECLINED');
              const isCredential = act.includes('CREDENTIAL');

              return (
                <div
                  key={log.id || `${log.timestamp}-${Math.random()}`}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 text-xs ${
                    isBlocker 
                      ? 'bg-rose-50/60 border-rose-200 text-rose-900' 
                      : isTransfer 
                      ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                      : isMeeting
                      ? 'bg-teal-50/60 border-teal-200 text-teal-900'
                      : isExtension
                      ? 'bg-purple-50/60 border-purple-200 text-purple-900'
                      : isStrike
                      ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                      : isApproval
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : isRejection
                      ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                      : isCredential
                      ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                      : 'bg-slate-50/70 border-slate-200/80 text-slate-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isBlocker ? (
                        <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      ) : isTransfer ? (
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </div>
                      ) : isMeeting ? (
                        <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                          <Video className="w-3.5 h-3.5" />
                        </div>
                      ) : isExtension ? (
                        <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                          <Timer className="w-3.5 h-3.5" />
                        </div>
                      ) : isStrike ? (
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                      ) : isApproval ? (
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : isRejection ? (
                        <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                        </div>
                      ) : isCredential ? (
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                          <KeyRound className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center font-bold">
                          <GitPullRequest className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/80 border border-slate-200 text-slate-600">
                          {log.action}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700">
                          by <strong className="text-slate-900">{log.actor || 'System'}</strong>
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-snug">
                        {log.details}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                    {(isBlocker || isTransfer || isExtension) && (
                      <button
                        onClick={() => {
                          sound.playPop();
                          setCurrentTab('requests');
                        }}
                        className="block mt-1 text-[10px] font-bold text-orange-600 hover:underline"
                      >
                        Inspect →
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No recent activity logs under this category.
            </div>
          )}

          {filteredLogs.length > 30 && (
            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  sound.playPop();
                  setShowAllActivities(prev => !prev);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-orange-50/60 border border-slate-200 text-orange-600 transition-all shadow-xs"
              >
                {showAllActivities ? 'Show Fewer Logs (Top 30)' : `Show All (${filteredLogs.length}) Logs →`}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
