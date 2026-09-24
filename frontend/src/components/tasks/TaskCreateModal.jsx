import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../../context/PortalContext';
import { X, Plus, Trash2, Link as LinkIcon, CheckSquare, Users, User, Copy, AlertCircle, ShieldAlert, Layers } from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const TaskCreateModal = ({ onClose, initialProjectId }) => {
  const { createTask, founders, clientProjects, currentUser } = usePortal();

  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId || clientProjects[0]?.id || 'proj_general');
  const [topic, setTopic] = useState('Frontend & Motion');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('high');
  const [assigneeType, setAssigneeType] = useState('single'); // single | team | cloned
  const [selectedFounders, setSelectedFounders] = useState([]);
  const [deadline, setDeadline] = useState('');

  // Dynamic Pipeline Stage State
  const [selectedStageId, setSelectedStageId] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [isCreatingNewStage, setIsCreatingNewStage] = useState(false);

  const selectedProj = clientProjects.find(p => p.id === projectId);
  const availableStages = selectedProj?.pipelineStages || [];

  useEffect(() => {
    if (availableStages.length > 0 && !selectedStageId) {
      setSelectedStageId(availableStages[0].id);
    }
  }, [projectId, availableStages]);

  // Reference links dynamic list
  const [referenceLinks, setReferenceLinks] = useState([]);
  const [refTitle, setRefTitle] = useState('');
  const [refUrl, setRefUrl] = useState('');

  // Checklist dynamic list
  const [checklist, setChecklist] = useState([]);
  const [checkItemText, setCheckItemText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeFounders = founders.filter(f => f.role === 'founder' && f.status === 'active');

  const handleAddRefLink = () => {
    if (!refUrl) return;
    setReferenceLinks([...referenceLinks, {
      title: refTitle || 'Reference Material',
      url: refUrl,
      type: 'external'
    }]);
    setRefTitle('');
    setRefUrl('');
    sound.playPop();
  };

  const handleRemoveRefLink = (idx) => {
    setReferenceLinks(referenceLinks.filter((_, i) => i !== idx));
  };

  const handleAddChecklistItem = () => {
    if (!checkItemText) return;
    setChecklist([...checklist, {
      id: `chk_${Date.now()}_${Math.random()}`,
      text: checkItemText,
      completed: false
    }]);
    setCheckItemText('');
    sound.playPop();
  };

  const handleRemoveChecklistItem = (id) => {
    setChecklist(checklist.filter(c => c.id !== id));
  };

  const toggleFounderSelect = (id) => {
    if (selectedFounders.includes(id)) {
      setSelectedFounders(selectedFounders.filter(fId => fId !== id));
    } else {
      setSelectedFounders([...selectedFounders, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !deadline) return;

    setIsSubmitting(true);

    const project = clientProjects.find(p => p.id === projectId);
    const matchedStage = project?.pipelineStages?.find(s => s.id === selectedStageId);

    await createTask({
      title,
      projectId,
      projectName: project ? project.name : 'General Agency Sprint',
      topic,
      pipelineStageId: isCreatingNewStage ? null : selectedStageId,
      pipelineStageName: isCreatingNewStage ? newStageName.trim() : (matchedStage?.name || topic),
      newPipelineStage: isCreatingNewStage && newStageName.trim() ? newStageName.trim() : undefined,
      description,
      priority,
      assigneeType,
      assignedTo: selectedFounders.length > 0 ? selectedFounders : [activeFounders[0]?.id],
      deadline,
      referenceLinks,
      checklist
    });

    setIsSubmitting(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in text-slate-800">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-3xl flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Create & Assign Task</h3>
            <p className="text-[11px] text-slate-500">Multi-mode assignment with reference materials</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 text-xs">
          
          {/* Founder Governance Protocol Alert */}
          {currentUser?.role !== 'superadmin' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Founder Task Creation Protocol</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  As per portal governance rules, tasks submitted by founders require Super Admin approval before being activated on the live Kanban board.
                </p>
              </div>
            </div>
          )}

          {/* Assignment Mode Pills */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Assignment Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAssigneeType('single')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  assigneeType === 'single'
                    ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <User className="w-3.5 h-3.5" />
                  <span>Single Founder</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Assigned to 1 person</p>
              </button>

              <button
                type="button"
                onClick={() => setAssigneeType('cloned')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  assigneeType === 'cloned'
                    ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Copy className="w-3.5 h-3.5" />
                  <span>Cloned Tasks</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Separate for each person</p>
              </button>

              <button
                type="button"
                onClick={() => setAssigneeType('team')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  assigneeType === 'team'
                    ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>Team Task</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Joint shared initiative</p>
              </button>
            </div>
          </div>

          {/* Select Founder(s) if not team */}
          {assigneeType !== 'team' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {assigneeType === 'cloned' ? 'Select Multiple Founders (Spawns independent tasks)' : 'Select Assignee'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {activeFounders.map((f) => {
                  const isSelected = selectedFounders.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={() => toggleFounderSelect(f.id)}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold' 
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <img src={f.avatar} alt={f.name} className="w-6 h-6 min-w-[24px] max-w-[24px] aspect-square shrink-0 rounded-full object-cover" />
                      <div className="truncate">
                        <p className="text-[11px] truncate leading-tight">{f.name}</p>
                        <p className="text-[9px] text-slate-400 truncate">{f.designation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build Weblets Auth & Onboarding Flow"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Project & Topic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-xs font-semibold text-slate-800"
              >
                <optgroup label="💼 Client Web Projects">
                  {clientProjects.filter(p => p.projectType !== 'internal').map((p) => (
                    <option key={p.id} value={p.id}>💼 {p.name} ({p.clientName})</option>
                  ))}
                </optgroup>

                <optgroup label="🚀 Brand & Internal Initiatives">
                  {clientProjects.filter(p => p.projectType === 'internal').map((p) => (
                    <option key={p.id} value={p.id}>🚀 {p.name} [{p.brand}]</option>
                  ))}
                </optgroup>

                <option value="proj_general">⚡ General Founders Sprint</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Topic / Category</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="UI/UX, Backend, Client Work"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Pipeline Stage Linking */}
          {projectId && projectId !== 'proj_general' && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/80 via-white to-amber-50/60 border border-orange-200/90 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-600" />
                  <span>Pipeline Stage Linking</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNewStage(!isCreatingNewStage);
                    sound.playPop();
                  }}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isCreatingNewStage ? 'Select Existing Stage' : 'Create New Stage'}</span>
                </button>
              </div>

              {!isCreatingNewStage ? (
                <div>
                  <select
                    value={selectedStageId}
                    onChange={(e) => setSelectedStageId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
                  >
                    {availableStages.map((s) => (
                      <option key={s.id} value={s.id}>
                        ⚡ Stage: {s.name} {s.lead ? `(Lead: ${s.lead})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    When this task completes, this specific pipeline stage will advance its independent progress bar.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 animate-fade-in">
                  <input
                    type="text"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="Enter new pipeline stage name (e.g. Mobile App Dev, Payment Gateway, DevOps)..."
                    className="w-full px-3 py-2 rounded-xl border border-orange-400 bg-white font-semibold text-slate-800 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
                    required={isCreatingNewStage}
                  />
                  <p className="text-[10px] text-orange-700 font-medium">
                    ✨ This will create a dynamic new pipeline stage on the project and link this task to it!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Priority & Strict Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white font-medium"
              >
                <option value="urgent">🔴 Urgent Priority</option>
                <option value="high">🟠 High Priority</option>
                <option value="medium">🔵 Medium Priority</option>
                <option value="low">⚪ Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Strict Deadline (Date & Time)</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description (Links will be highlighted)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Outline deliverables, constraints, and instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
            />
          </div>

          {/* Reference Materials Input */}
          <div className="space-y-2 p-3 rounded-2xl bg-orange-50/50 border border-orange-100">
            <label className="block font-bold text-slate-800">Attach Reference Links (Figma, GitHub, Drive)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={refTitle}
                onChange={(e) => setRefTitle(e.target.value)}
                placeholder="Title (e.g. Figma Prototype)"
                className="w-1/3 px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
              />
              <input
                type="url"
                value={refUrl}
                onChange={(e) => setRefUrl(e.target.value)}
                placeholder="URL (https://...)"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
              />
              <button
                type="button"
                onClick={handleAddRefLink}
                className="px-3 py-1.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 cursor-pointer shadow-xs"
              >
                Add
              </button>
            </div>

            {referenceLinks.length > 0 && (
              <div className="space-y-1 pt-1">
                {referenceLinks.map((rf, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                    <span className="font-semibold truncate max-w-[200px]">{rf.title}: <span className="font-mono text-orange-700">{rf.url}</span></span>
                    <button type="button" onClick={() => handleRemoveRefLink(idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deliverables Checklist Input */}
          <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="block font-bold text-slate-800">Deliverables & Topics Checklist</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={checkItemText}
                onChange={(e) => setCheckItemText(e.target.value)}
                placeholder="e.g. Finish Wireframe with reference to Weblets UI kit"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900"
              >
                Add Item
              </button>
            </div>

            {checklist.length > 0 && (
              <div className="space-y-1 pt-1">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                    <span>{item.text}</span>
                    <button type="button" onClick={() => handleRemoveChecklistItem(item.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-600/20 hover:shadow-xl transition-all cursor-pointer"
          >
            {isSubmitting
              ? 'Submitting...'
              : currentUser?.role === 'superadmin'
                ? 'Create & Direct Assign Task 🚀'
                : 'Submit Task for Admin Approval 🛡️'}
          </button>
        </form>

      </div>
    </div>,
    document.body
  );
};
