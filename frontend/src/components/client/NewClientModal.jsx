import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../../context/PortalContext';
import { X, Briefcase, Sparkles, Globe, DollarSign, User, ShieldCheck, Layers } from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const NewClientModal = ({ onClose }) => {
  const { createClientProject, founders, currentUser } = usePortal();

  // Project Category Selector: 'client' | 'internal'
  const [projectType, setProjectType] = useState('client');

  // Common Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Weblets®');
  const [leadFounder, setLeadFounder] = useState('Sayantan Ghosh');

  // Client Web Project Specific Fields
  const [clientName, setClientName] = useState('');
  const [domain, setDomain] = useState('');
  const [budget, setBudget] = useState('$3,500');

  // Brand / Internal Specific Fields
  const [category, setCategory] = useState('Core Product Engineering');
  const [scope, setScope] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = currentUser?.role === 'superadmin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    if (projectType === 'client' && !clientName) return;

    setIsSubmitting(true);
    await createClientProject({
      name,
      projectType,
      category: projectType === 'client' ? 'Client Web Delivery' : category,
      scope,
      clientName: projectType === 'client' ? clientName : `${brand} Internal Initiative`,
      brand,
      leadFounder,
      domain: projectType === 'client' ? domain : '',
      budget: projectType === 'client' ? budget : 'Internal Initiative'
    });
    setIsSubmitting(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in text-slate-800">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-3xl flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">Initialize New Project</h3>
            <p className="text-[11px] text-slate-500">
              {isAdmin ? 'Configure workspace environment & client pipeline' : 'Submit project proposal for Lead Admin verification'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* Classification Selector: Client Project vs Brand / Internal */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Project Classification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => { sound.playPop(); setProjectType('client'); }}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  projectType === 'client'
                    ? 'border-orange-600 bg-orange-50/70 text-orange-950 font-bold shadow-xs ring-1 ring-orange-600'
                    : 'border-slate-200/90 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-orange-600 text-white flex items-center justify-center text-xs shrink-0">
                    <Briefcase className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold">Client Web Project</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  External client accounts. 4-phase dev pipeline, live staging domain, budget tracking & vault.
                </p>
              </button>

              <button
                type="button"
                onClick={() => { sound.playPop(); setProjectType('internal'); }}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  projectType === 'internal'
                    ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-bold shadow-xs ring-1 ring-amber-600'
                    : 'border-slate-200/90 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xs shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold">Brand / Personal</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  Weblets® / StackAdda™ core tools, internal platform tooling, or founder personal R&D.
                </p>
              </button>
            </div>
          </div>

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} id="new-project-form" className="space-y-3.5 text-xs">
            
            <div>
              <label className="block font-bold text-slate-700 mb-1">Project / Initiative Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={projectType === 'client' ? "e.g. Aura Modern E-Commerce Platform" : "e.g. StackAdda Automated Invoice Generator"}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium bg-slate-50/50"
              />
            </div>

            {/* Conditional: Client Name if Client Project */}
            {projectType === 'client' ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Client / Company Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Aura Lifestyle Pvt Ltd"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Initiative Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium"
                >
                  <option value="Core Product Engineering">Core Product Engineering</option>
                  <option value="Design System & UI Kit">Design System & UI Kit</option>
                  <option value="Marketing & Growth">Marketing & Growth</option>
                  <option value="Automation & AI Workflows">Automation & AI Workflows</option>
                  <option value="Personal Founder R&D">Personal Founder R&D</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Entity</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium truncate"
                >
                  <option value="Weblets®">Weblets® (weblets.bond)</option>
                  <option value="StackAdda™">StackAdda™ (stackadda.me)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lead Founder</label>
                <select
                  value={leadFounder}
                  onChange={(e) => setLeadFounder(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-white font-medium truncate"
                >
                  {founders && founders.length > 0 ? (
                    founders.map(f => (
                      <option key={f.id} value={f.name}>{f.name} ({f.roleTitle || f.role})</option>
                    ))
                  ) : (
                    <>
                      <option value="Sayantan Ghosh">Sayantan Ghosh</option>
                      <option value="Soham Dutta">Soham Dutta</option>
                      <option value="Achinta Bej">Achinta Bej</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Conditional: Budget and Domain for Client Projects */}
            {projectType === 'client' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract Budget</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="$2,500 or ₹40,000"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Staging / Preview Domain</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="preview.weblets.bond/aura"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono bg-slate-50/50"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Goal / Scope Summary (Optional)</label>
                <input
                  type="text"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="e.g. Build reusable client portal components & deployment automations"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            )}

            {/* Protocol Notice for Founders */}
            {!isAdmin && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                <span className="shrink-0 text-amber-600 font-bold">📋 Rule 04:</span>
                <span>Founder-initiated projects require Super Admin verification in Requests Hub before entering active sprint delivery.</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 shrink-0">
          <button
            type="submit"
            form="new-project-form"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>
              {isSubmitting 
                ? 'Processing...' 
                : !isAdmin 
                ? 'Submit Project Request to Admin 📋' 
                : projectType === 'client' 
                ? 'Launch Client Workspace 💼' 
                : 'Launch Brand Initiative 🚀'}
            </span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default NewClientModal;
