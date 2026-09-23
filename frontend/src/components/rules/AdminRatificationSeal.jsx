import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Award, ShieldCheck, CheckCircle2, Stamp, Sparkles } from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const AdminRatificationSeal = () => {
  const { adminRatification, ratifyCharter, currentUser } = usePortal();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSeal, setSelectedSeal] = useState(adminRatification?.sealType || 'gold_crest');

  const isAdmin = currentUser?.role === 'superadmin';

  const handleApplySeal = async (type) => {
    setSelectedSeal(type);
    await ratifyCharter(type, 'SSA TEAM LEAD ADMIN');
    setShowPicker(false);
    sound.playChime();
  };

  return (
    <div className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border border-amber-500/30 shadow-2xl space-y-6 overflow-hidden">
      
      {/* Decorative Gold Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 font-mono">
              Official Executive Seal
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Lead Admin Witness & Legal Ratification
            </h3>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Stamp className="w-4 h-4" />
            <span>Switch Branded Stamp</span>
          </button>
        )}
      </div>

      {/* Quote */}
      <blockquote className="text-sm md:text-base italic text-slate-300 font-serif leading-relaxed pl-4 border-l-2 border-amber-400">
        "{adminRatification?.quote || "I, Lead Admin, hereby ratify, execute and officially enforce the Founders' Strict Rules & Agreement (Version 2.0) across Weblets and StackAdda."}"
      </blockquote>

      {/* Seal Display & Ratification Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
        <div>
          <div className="text-xs text-slate-400 font-mono">Ratified Authority</div>
          <div className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
            <span>{adminRatification?.ratifiedBy || 'SSA TEAM'}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-[11px] text-amber-400/90 font-mono mt-1">
            Effective Date: 19 September 2026 • Verified v2.0 STRICT
          </div>
        </div>

        {/* 3D Embossed Golden Stamp */}
        <div className="relative group">
          <div className="w-28 h-28 rounded-full border-4 border-double border-amber-400/80 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/30 p-2 shadow-2xl flex flex-col items-center justify-center text-center backdrop-blur-md animate-pulse-slow">
            <Sparkles className="w-5 h-5 text-amber-300 mb-1" />
            <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase font-mono">
              {adminRatification?.sealType === 'dual_brand' 
                ? 'WEBLETS × STACKADDA'
                : adminRatification?.sealType === 'protocol'
                  ? 'OPERATING PROTOCOL'
                  : 'SSA TEAM'}
            </span>
            <span className="text-[8px] font-bold text-amber-200/90 tracking-tighter mt-0.5 font-mono">
              ★ RATIFIED ★
            </span>
            <span className="text-[7px] text-amber-400 font-mono">2026 • v2.0</span>
          </div>
        </div>
      </div>

      {/* Stamp Picker Modal for Admin */}
      {showPicker && (
        <div className="pt-4 border-t border-slate-800 space-y-3 animate-fade-in text-xs">
          <p className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Select Branded Embossed Seal</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <button
              onClick={() => handleApplySeal('gold_crest')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedSeal === 'gold_crest' 
                  ? 'border-amber-400 bg-amber-500/20 text-white font-bold' 
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-amber-300">1. SSA TEAM Gold Crest</div>
              <p className="text-[10px] text-slate-400 mt-1">Official Executive Lead Ratification Badge</p>
            </button>

            <button
              onClick={() => handleApplySeal('dual_brand')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedSeal === 'dual_brand' 
                  ? 'border-amber-400 bg-amber-500/20 text-white font-bold' 
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-cyan-300">2. Dual Brand Seal</div>
              <p className="text-[10px] text-slate-400 mt-1">Weblets® × StackAdda™ verified partnership</p>
            </button>

            <button
              onClick={() => handleApplySeal('protocol')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedSeal === 'protocol' 
                  ? 'border-amber-400 bg-amber-500/20 text-white font-bold' 
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-emerald-300">3. Operating Protocol Seal</div>
              <p className="text-[10px] text-slate-400 mt-1">Founders Strict Charter Protocol</p>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
