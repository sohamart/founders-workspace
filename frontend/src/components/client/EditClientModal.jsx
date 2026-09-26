import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../../context/PortalContext';
import { X, Briefcase, Sparkles, Globe, DollarSign, User, ShieldCheck, Edit3, Trash2 } from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const EditClientModal = ({ project, onClose, onDelete }) => {
  const { updateClientProject, founders, currentUser } = usePortal();

  const [projectType, setProjectType] = useState(project.projectType || 'client');
  const [name, setName] = useState(project.name || '');
  const [brand, setBrand] = useState(project.brand || 'Weblets®');
  const [leadFounder, setLeadFounder] = useState(project.leadFounder || 'Sayantan Ghosh');
  const [clientName, setClientName] = useState(project.clientName || '');
  const [domain, setDomain] = useState(project.domain || '');
  const [budget, setBudget] = useState(project.budget || '$3,500');
  const [category, setCategory] = useState(project.category || 'Core Product Engineering');
  const [scope, setScope] = useState(project.scope || '');
  const [status, setStatus] = useState(project.status || 'in_progress');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'superadmin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const res = await updateClientProject(project.id, {
      name: name.trim(),
      projectType,
      category: projectType === 'client' ? 'Client Web Delivery' : category,
      scope,
      clientName: projectType === 'client' ? clientName.trim() : `${brand} Internal Initiative`,
      brand,
      leadFounder,
      domain: projectType === 'client' ? domain.trim() : '',
      budget: projectType === 'client' ? budget : 'Internal Initiative',
      status
    });
    setIsSubmitting(false);

    if (res?.success) {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in text-slate-800">
      <div className="bg-white w-full max-w-lg rounded-3xl flex flex-col shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-center shadow-xs">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Edit Project Specifications</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  Admin Authority
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Modify deliverables, budget, domain, and leads
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Project Type Switcher */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Project Nature</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { sound.playPop(); setProjectType('client'); }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                  projectType === 'client'
                    ? 'border-orange-500 bg-orange-50/60 text-orange-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Briefcase className="w-4 h-4 text-orange-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Client Web Delivery</p>
                  <p className="text-[10px] text-slate-500">Commercial client work</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { sound.playPop(); setProjectType('internal'); }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                  projectType === 'internal'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs">Internal Initiative</p>
                  <p className="text-[10px] text-slate-500">Weblets brand product</p>
                </div>
              </button>
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Urban Kicks E-Commerce Portal"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Brand & Lead Founder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Executing Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="Weblets®">Weblets®</option>
                <option value="StackAdda™">StackAdda™</option>
                <option value="Joint Weblets × StackAdda">Joint Initiative</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lead Founder</label>
              <select
                value={leadFounder}
                onChange={(e) => setLeadFounder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                {founders.map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name} ({f.designation.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client Specific Fields */}
          {projectType === 'client' ? (
            <div className="space-y-3 p-3.5 rounded-2xl bg-orange-50/40 border border-orange-200/60">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client / Company Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Apex Tech Ltd."
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commercial Budget</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="$3,500 or ₹2,50,000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Live Staging Domain</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="urbankicks.weblets.io"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/60">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Engineering Domain / Track</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Core Product Engineering">Core Product Engineering</option>
                  <option value="SaaS Architecture & Microservices">SaaS Architecture & Microservices</option>
                  <option value="Agency Brand Systems">Agency Brand Systems</option>
                  <option value="DevOps & Cloud Infrastructure">DevOps & Cloud Infrastructure</option>
                </select>
              </div>
            </div>
          )}

          {/* Project Status */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Project Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="in_progress">🟢 In Progress / Active Sprints</option>
              <option value="completed">✅ Completed / Delivered</option>
              <option value="on_hold">⏸️ On Hold / Client Review</option>
              <option value="pending_approval">⏳ Pending Admin Approval</option>
            </select>
          </div>

          {/* Scope / Deliverables */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Scope & Key Directives</label>
            <textarea
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              rows={2}
              placeholder="Brief summary of requirements, tech stack, and goals..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Submit & Delete Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to permanently delete project "${project.name}"? This action cannot be undone.`)) {
                    onDelete(project.id);
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Project</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold shadow-md shadow-orange-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Updates'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
};
