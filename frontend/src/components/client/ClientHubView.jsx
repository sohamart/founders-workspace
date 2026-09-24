import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  Briefcase, 
  Plus, 
  ExternalLink, 
  KeyRound, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  User,
  CheckSquare,
  Clock,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Check,
  X,
  Code,
  Terminal,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const ClientHubView = ({ onOpenVault, onOpenNewClientModal, onOpenCreateTaskUnderProject }) => {
  const { clientProjects, tasks, currentUser, founders, addPipelineStage } = usePortal();

  const [activeCategory, setActiveCategory] = useState('all'); // all | client | internal
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  // Quick Stage Creation state
  const [addingStageProjectId, setAddingStageProjectId] = useState(null);
  const [newStageName, setNewStageName] = useState('');
  const [isSubmittingStage, setIsSubmittingStage] = useState(false);

  const clientProjectsList = clientProjects.filter(p => p.projectType !== 'internal');
  const internalProjectsList = clientProjects.filter(p => p.projectType === 'internal');

  const displayedProjects = clientProjects.filter(p => {
    if (activeCategory === 'client') return p.projectType !== 'internal';
    if (activeCategory === 'internal') return p.projectType === 'internal';
    return true;
  });

  const toggleExpand = (projectId) => {
    sound.playPop();
    setExpandedProjectId(prev => prev === projectId ? null : projectId);
  };

  const handleCreateStage = async (projectId) => {
    if (!newStageName.trim()) return;
    setIsSubmittingStage(true);
    await addPipelineStage(projectId, { 
      stageName: newStageName.trim(),
      lead: currentUser?.name || 'Founder'
    });
    setIsSubmittingStage(false);
    setNewStageName('');
    setAddingStageProjectId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1700px] mx-auto pb-28 md:pb-16">
      
      {/* Top Banner with Navigation Tabs */}
      <div data-tour="projects-hub" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Projects & Dynamic Pipelines Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Client web deliverables, dynamic multi-stage pipelines (Wireframing, Frontend, Backend, QA) & internal brand engineering
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenNewClientModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Tabs: All vs Client Projects vs Brand Initiatives */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 w-full sm:w-fit text-xs font-semibold">
        <button
          onClick={() => { sound.playPop(); setActiveCategory('all'); }}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Projects ({clientProjects.length})
        </button>

        <button
          onClick={() => { sound.playPop(); setActiveCategory('client'); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            activeCategory === 'client'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Client Web Projects ({clientProjectsList.length})</span>
        </button>

        <button
          onClick={() => { sound.playPop(); setActiveCategory('internal'); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
            activeCategory === 'internal'
              ? 'bg-amber-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Brand & Personal ({internalProjectsList.length})</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {displayedProjects.map((project) => {
          const isClient = project.projectType !== 'internal';
          const approvedCredsCount = project.credentials?.filter(c => c.status === 'approved').length || 0;
          const pendingCredsCount = project.credentials?.filter(c => c.status === 'pending_approval').length || 0;

          // Tasks linked to this project
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const activeTasksCount = projectTasks.filter(t => t.status !== 'completed').length;
          const isExpanded = expandedProjectId === project.id;

          // Default fallback pipeline stages if not yet stored
          const stages = Array.isArray(project.pipelineStages) && project.pipelineStages.length > 0
            ? project.pipelineStages
            : [
                { id: 'stage_wireframing', name: isClient ? 'Wireframing & UI/UX' : 'Architecture & Specs', lead: project.leadFounder || 'Sayantan Ghosh', order: 1 },
                { id: 'stage_frontend', name: isClient ? 'Frontend & Dynamic Motion' : 'Core Engineering', lead: 'Soham Dutta', order: 2 },
                { id: 'stage_backend', name: isClient ? 'Backend, CMS & API' : 'Integration & API', lead: 'Soham Dutta', order: 3 },
                { id: 'stage_qa', name: isClient ? 'Client QA & Handover' : 'Launch & Operations', lead: 'Achinta Bej', order: 4 }
              ];

          // Compute overall project progress from stages
          let totalProgressSum = 0;

          return (
            <div
              key={project.id}
              className={`p-5 md:p-6 rounded-3xl transition-all duration-300 space-y-4 shadow-sm flex flex-col justify-between ${
                isClient 
                  ? 'bg-white border border-slate-200/90 hover:border-orange-400 hover:shadow-xl'
                  : 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/80 border border-amber-500/40 text-slate-100 hover:border-amber-400 shadow-md'
              }`}
            >
              <div className="space-y-4">
                {/* Project Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                        isClient 
                          ? 'bg-orange-50 text-orange-700 border-orange-200' 
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {isClient ? `💼 Client Project • ${project.brand}` : `🚀 Internal • ${project.brand}`}
                      </span>
                      {(project.status === 'pending_approval' || project.approvalStatus === 'pending') && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs animate-pulse">
                          ⏳ Pending Admin Approval (Rule 04)
                        </span>
                      )}
                      <span className="text-xs text-slate-400">•</span>
                      <span className={`text-xs font-semibold ${isClient ? 'text-slate-500' : 'text-slate-300'}`}>
                        {project.clientName}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold leading-snug ${isClient ? 'text-slate-900' : 'text-white'}`}>
                      {project.name}
                    </h3>

                    {project.scope && (
                      <p className={`text-[11px] line-clamp-2 ${isClient ? 'text-slate-500' : 'text-slate-400'}`}>
                        {project.scope}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border shadow-xs ${
                      isClient 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                        : 'text-amber-300 bg-amber-950/60 border-amber-500/40'
                    }`}>
                      {project.budget}
                    </span>
                  </div>
                </div>

                {/* DYNAMIC PIPELINE TRACKER */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isClient 
                    ? 'bg-slate-50 border-slate-200/80' 
                    : 'bg-black/40 border-amber-500/20'
                }`}>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={`flex items-center gap-1.5 ${isClient ? 'text-slate-700' : 'text-amber-200'}`}>
                      <Layers className="w-3.5 h-3.5 text-orange-500" />
                      <span>{isClient ? 'Development Pipeline' : 'Milestone Track (Sprints)'}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 font-mono text-[11px]">
                        {stages.length} Stages
                      </span>
                      <button
                        onClick={() => {
                          setAddingStageProjectId(addingStageProjectId === project.id ? null : project.id);
                          sound.playPop();
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all flex items-center gap-0.5 cursor-pointer ${
                          isClient 
                            ? 'bg-white text-orange-700 border-orange-200 hover:border-orange-400' 
                            : 'bg-amber-500/20 text-amber-200 border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Stage</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline New Stage Input */}
                  {addingStageProjectId === project.id && (
                    <div className="p-2.5 rounded-xl bg-white border border-orange-300 space-y-2 animate-fade-in shadow-xs text-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">Add New Pipeline Stage</span>
                        <button 
                          onClick={() => setAddingStageProjectId(null)} 
                          className="text-slate-400 hover:text-slate-700 text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newStageName}
                          onChange={(e) => setNewStageName(e.target.value)}
                          placeholder="e.g. Mobile App Dev, Payment Gateway, SEO Engine"
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleCreateStage(project.id)}
                          disabled={isSubmittingStage || !newStageName.trim()}
                          className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Pipeline Stages Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {stages.map((stage) => {
                      // Find tasks attached to this stage
                      const stageTasks = projectTasks.filter(t => 
                        t.pipelineStageId === stage.id || 
                        t.pipelineStageName === stage.name ||
                        (t.topic && t.topic.toLowerCase().includes(stage.name.toLowerCase().split(' ')[0]))
                      );

                      // Calculate stage progress
                      const stagePercent = stageTasks.length > 0
                        ? Math.round(stageTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / stageTasks.length)
                        : (project.phaseProgress?.[`phase${stage.order}`]?.percent || 0);

                      const isDone = stageTasks.length > 0
                        ? stageTasks.every(t => t.status === 'completed' || t.progress >= 100)
                        : (project.phaseProgress?.[`phase${stage.order}`]?.status === 'completed');

                      const isInProgress = stageTasks.length > 0
                        ? stageTasks.some(t => t.status === 'in_progress' || t.progress > 0 || t.status === 'review_pending')
                        : (project.phaseProgress?.[`phase${stage.order}`]?.status === 'in_progress');

                      // Identify assigned founders for this stage
                      const assignedUserIds = Array.from(new Set(stageTasks.flatMap(t => Array.isArray(t.assignedTo) ? t.assignedTo : [])));
                      const stageFounders = founders.filter(f => assignedUserIds.includes(f.id));

                      return (
                        <div
                          key={stage.id}
                          className={`p-2.5 rounded-xl border transition-all space-y-1.5 ${
                            isClient
                              ? 'bg-white border-slate-200/90 shadow-2xs hover:border-orange-200'
                              : 'bg-white/5 border-white/10 hover:border-amber-400/40'
                          }`}
                        >
                          {/* Stage Title, Progress & Badge */}
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className={`font-bold truncate max-w-[130px] ${isClient ? 'text-slate-800' : 'text-white'}`}>
                              {stage.name}
                            </span>
                            <span className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded-md ${
                              isDone ? 'bg-emerald-100 text-emerald-800' :
                              isInProgress ? 'bg-orange-100 text-orange-800' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {stagePercent}%
                            </span>
                          </div>

                          {/* Individual Dynamic Progress Bar */}
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isClient ? 'bg-slate-100' : 'bg-white/10'}`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isDone ? 'bg-emerald-500' : isInProgress ? 'bg-gradient-to-r from-orange-600 to-amber-500' : 'bg-slate-300'
                              }`} 
                              style={{ width: `${stagePercent}%` }} 
                            />
                          </div>

                          {/* Stage Assigned Founders & Task Count */}
                          <div className="flex items-center justify-between text-[10px] pt-0.5">
                            <div className="flex items-center -space-x-1.5">
                              {stageFounders.length > 0 ? (
                                stageFounders.map((f) => (
                                  <img
                                    key={f.id}
                                    src={f.avatar}
                                    alt={f.name}
                                    title={`${f.name} (${stage.name})`}
                                    className="w-5 h-5 min-w-[20px] max-w-[20px] aspect-square shrink-0 rounded-full object-cover ring-1 ring-white"
                                  />
                                ))
                              ) : (
                                <span className={`text-[10px] truncate max-w-[100px] ${isClient ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Lead: {stage.lead?.split(' ')[0] || 'Unassigned'}
                                </span>
                              )}
                            </div>

                            <span className={`font-mono text-[9px] ${isClient ? 'text-slate-400' : 'text-slate-400'}`}>
                              {stageTasks.length} task{stageTasks.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Staging URL & Lead Founder */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`p-2.5 rounded-2xl border space-y-1 ${
                    isClient ? 'border-slate-200/90 bg-slate-50' : 'border-white/10 bg-white/5'
                  }`}>
                    <span className={`text-[10px] block font-medium ${isClient ? 'text-slate-500' : 'text-slate-400'}`}>
                      Lead Founder
                    </span>
                    <span className={`font-bold text-xs flex items-center gap-1 ${isClient ? 'text-slate-800' : 'text-white'}`}>
                      <User className="w-3 h-3 text-orange-500" />
                      <span>{project.leadFounder || 'Sayantan Ghosh'}</span>
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-2xl border space-y-1 ${
                    isClient ? 'border-slate-200/90 bg-slate-50' : 'border-white/10 bg-white/5'
                  }`}>
                    <span className={`text-[10px] block font-medium ${isClient ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isClient ? 'Live Staging Domain' : 'Architecture Engine'}
                    </span>
                    {isClient ? (
                      project.domain ? (
                        <a
                          href={`https://${project.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-500 font-mono text-[11px] font-semibold hover:underline flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{project.domain}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No domain configured</span>
                      )
                    ) : (
                      <span className="font-semibold text-amber-300 text-xs flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-amber-400" />
                        <span>{project.category || 'Product Engineering'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Tasks Under this Project Section */}
                <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  isClient ? 'bg-slate-50/70 border-slate-200/90' : 'bg-black/30 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                        isClient ? 'text-slate-800 hover:text-orange-600' : 'text-slate-200 hover:text-amber-300'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-orange-500" />
                      <span>Project Tasks ({projectTasks.length})</span>
                      {activeTasksCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-mono">
                          {activeTasksCount} active
                        </span>
                      )}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => onOpenCreateTaskUnderProject(project.id)}
                      className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all shadow-xs cursor-pointer ${
                        isClient 
                          ? 'text-orange-600 hover:text-orange-700 bg-white border border-orange-200 hover:border-orange-400' 
                          : 'text-amber-300 hover:text-white bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Task</span>
                    </button>
                  </div>

                  {/* Expanded Task Preview */}
                  {isExpanded && (
                    <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
                      {projectTasks.length > 0 ? (
                        projectTasks.map(t => (
                          <div 
                            key={t.id} 
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-xs ${
                              isClient ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/10 border-white/10 text-white'
                            }`}
                          >
                            <div className="truncate flex-1">
                              <p className="font-semibold truncate">{t.title}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                {t.pipelineStageName && (
                                  <span className="px-1.5 py-0.2 rounded bg-orange-50 text-orange-700 border border-orange-200">
                                    {t.pipelineStageName}
                                  </span>
                                )}
                                <span>Due: {new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                              t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              t.status === 'review_pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-orange-50 text-orange-700'
                            }`}>
                              {t.status.replace('_', ' ')}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 text-[11px] italic py-2 text-center">
                          No tasks created under this project yet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions: Credential Vault Trigger (for Client Projects) */}
              <div className={`pt-3 border-t flex items-center justify-between ${
                isClient ? 'border-slate-100' : 'border-white/10'
              }`}>
                {isClient ? (
                  <button
                    onClick={() => onOpenVault(project)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-semibold border border-orange-200 transition-all shadow-xs cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-orange-600" />
                    <span>Client Vault ({approvedCredsCount} Active)</span>
                    {pendingCredsCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Pending Verification" />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenVault(project)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-500/40 transition-all shadow-xs cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5 text-amber-400" />
                    <span>Technical Assets & Secrets ({approvedCredsCount + pendingCredsCount})</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenCreateTaskUnderProject(project.id)}
                  className={`flex items-center gap-1 text-xs font-bold ${
                    isClient ? 'text-orange-600 hover:text-orange-700' : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Task</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
