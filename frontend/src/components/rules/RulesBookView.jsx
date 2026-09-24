import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  BookOpen, 
  ShieldAlert, 
  CheckCircle2, 
  FileCheck, 
  ChevronDown, 
  ChevronUp, 
  Award,
  Sparkles,
  Lock,
  PenTool
} from 'lucide-react';
import { SignatureCanvas } from './SignatureCanvas';
import { AdminRatificationSeal } from './AdminRatificationSeal';
import { sound } from '../../utils/soundFx';

export const RulesBookView = () => {
  const { 
    rules, 
    foundersSignatures, 
    signRulesBook, 
    currentUser, 
    founders 
  } = usePortal();

  const [activeChapter, setActiveChapter] = useState('all');
  const [expandedRules, setExpandedRules] = useState({});
  const [signingFounderId, setSigningFounderId] = useState(null);

  const toggleExpand = (num) => {
    setExpandedRules(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const handleSaveSignature = async (signatureData) => {
    const hash = `SHA:${Date.now().toString(16).toUpperCase()}${Math.random().toString(16).substr(2, 6).toUpperCase()}`;
    await signRulesBook(signatureData, hash);
    setSigningFounderId(null);
  };

  const chapters = [
    'Operational Baseline',
    'Host Ownership & Logistics',
    'Team Governance & Decisions',
    'Assets, Security & Finances',
    'Client & Brand Excellence',
    'Enforcement & Warning System'
  ];

  const filteredRules = activeChapter === 'all' 
    ? rules 
    : rules.filter(r => r.chapter === activeChapter);

  // Active founders only for the signature block
  const activeFounders = founders.filter(f => f.role === 'founder');

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-28 md:pb-12">
      
      {/* Official Charter Cover Header */}
      <div data-tour="rules-charter" className="p-6 md:p-10 rounded-3xl bg-white text-slate-800 border border-slate-200/90 shadow-xs relative overflow-hidden space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
              WEBLETS.BOND
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              STACKADDA.ME
            </span>
          </div>

          <div className="font-mono text-slate-500 text-[11px] font-medium">
            VERSION 2.0 STRICT • EFFECTIVE 19 SEPT 2026
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600 font-mono">
            Three Founders. Two Brands. One Standard.
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            FOUNDERS' STRICT RULES & AGREEMENT
          </h1>
          <p className="text-xs md:text-sm font-medium tracking-wide text-slate-500">
            DISCIPLINE • ACCOUNTABILITY • COMMUNICATION • EXECUTION • GROWTH
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
            <div className="text-xs font-bold text-orange-700">PEOPLE</div>
            <p className="text-[10px] text-slate-500">A strong team builds everything.</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
            <div className="text-xs font-bold text-orange-700">PURPOSE</div>
            <p className="text-[10px] text-slate-500">Ideas turn into meaningful work.</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
            <div className="text-xs font-bold text-amber-700">PROGRESS</div>
            <p className="text-[10px] text-slate-500">Small steps, every single day.</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
            <div className="text-xs font-bold text-amber-700">IMPACT</div>
            <p className="text-[10px] text-slate-500">Build something that matters.</p>
          </div>
        </div>

        {/* Equal Standard Box */}
        <div className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200 text-xs text-orange-950">
          <strong>EQUAL STANDARD — NO EXCEPTIONS</strong>: These rules apply equally to all three founders, regardless of role or seniority. No founder is above the rules.
        </div>
      </div>

      {/* Chapter Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs font-medium">
        <button
          onClick={() => { sound.playPop(); setActiveChapter('all'); }}
          className={`px-3.5 py-1.5 rounded-xl shrink-0 transition-all ${
            activeChapter === 'all'
              ? 'bg-slate-900 text-white font-bold shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All 30 Rules
        </button>

        {chapters.map((ch, idx) => (
          <button
            key={idx}
            onClick={() => { sound.playPop(); setActiveChapter(ch); }}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all ${
              activeChapter === ch
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {ch}
          </button>
        ))}
      </div>

      {/* 30 Rules Accordion / Cards List */}
      <div className="space-y-4">
        {filteredRules.map((rule) => {
          const isExpanded = expandedRules[rule.number];

          return (
            <div
              key={rule.number}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-orange-400 hover:shadow-md transition-all space-y-3"
            >
              {/* Rule Card Header */}
              <div 
                onClick={() => toggleExpand(rule.number)}
                className="flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 font-mono font-bold text-orange-700 flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                    {rule.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">
                      {rule.title}
                    </h3>
                    <p className="text-[11px] font-mono font-bold text-orange-600 tracking-wide mt-0.5">
                      {rule.tagline}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 p-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-orange-600" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Bullet Points */}
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 leading-relaxed pt-1">
                {rule.points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>

              {/* Warning Alert Box */}
              {rule.warning && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">
                    {rule.warning}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOUNDERS' EXECUTED SIGNATURES BLOCK (Founders Only) */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
        
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base md:text-lg font-bold text-slate-800">
              Founders' Executed Signatures
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly for active founders: Soham Dutta, Sayantan Ghosh, and Achinta Bej. (Admin excluded).
          </p>
        </div>

        {/* 3 Active Founder Signature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeFounders.map((f, idx) => {
            const isMe = currentUser?.id === f.id;
            const isSuspended = f.status === 'suspended';
            const isSigned = f.signature && f.signature.signed;

            return (
              <div
                key={f.id}
                className={`p-5 rounded-2xl border space-y-3 transition-all relative ${
                  isSuspended 
                    ? 'bg-rose-50 border-rose-200 opacity-60' 
                    : isSigned 
                      ? 'bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-100' 
                      : 'bg-slate-50 border-slate-200'
                }`}
              >
                {/* Founder Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={f.avatar} alt={f.name} className="w-8 h-8 min-w-[32px] max-w-[32px] aspect-square shrink-0 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{f.name}</h4>
                      <p className="text-[10px] text-slate-400">{f.designation}</p>
                    </div>
                  </div>

                  {isSuspended ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                      Suspended
                    </span>
                  ) : isSigned ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      SIGNED ✓
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  )}
                </div>

                {/* Signature Display Canvas Box */}
                <div className="h-24 rounded-xl border border-slate-200 bg-white flex items-center justify-center p-2 overflow-hidden shadow-inner relative">
                  {isSigned && f.signature.signatureData ? (
                    <img 
                      src={f.signature.signatureData} 
                      alt={`${f.name}'s signature`} 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-slate-300 text-xs italic font-serif">
                      {isSuspended ? 'Ineligible: Account Suspended' : 'Unsigned'}
                    </span>
                  )}
                </div>

                {/* Signature Metadata */}
                {isSigned && (
                  <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-1 border-t border-slate-100">
                    <div>Date: <strong className="text-slate-700">{f.signature.date}</strong></div>
                    <div className="truncate">Hash: <span className="text-orange-700">{f.signature.hash}</span></div>
                  </div>
                )}

                {/* Trigger Signature Sketchpad if this is ME */}
                {isMe && !isSuspended && (
                  <div className="pt-2">
                    {signingFounderId === f.id ? (
                      <div className="space-y-2 animate-fade-in">
                        <SignatureCanvas onSave={handleSaveSignature} />
                        <button
                          type="button"
                          onClick={() => setSigningFounderId(null)}
                          className="w-full py-1 text-slate-400 hover:text-slate-600 text-[10px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setSigningFounderId(f.id);
                        }}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>{isSigned ? 'Re-Draw Signature' : 'Sign on Sketchpad'}</span>
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* LEAD ADMIN WITNESS & RATIFICATION SEAL (SSA TEAM) */}
      <AdminRatificationSeal />

    </div>
  );
};
