import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  PenTool, 
  X,
  Search,
  Printer,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Flame,
  Check
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
    founders,
    adminRatification
  } = usePortal();

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChapter, setActiveChapter] = useState('all');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'strikes_only'
  const [expandedRules, setExpandedRules] = useState({});
  const [activeHighlightRule, setActiveHighlightRule] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [hasPromptedModal, setHasPromptedModal] = useState(false);

  // Active founders only for the signature block
  const activeFounders = founders.filter(f => f.role === 'founder');
  const currentFounderRecord = founders.find(f => f.id === currentUser?.id);
  const isMySignaturePending = currentFounderRecord && !currentFounderRecord.signature?.signed && currentFounderRecord.status !== 'suspended';
  const pendingFounders = activeFounders.filter(f => !f.signature?.signed && f.status !== 'suspended');

  // Auto-launch signature popup on opening Rules if current founder hasn't signed
  useEffect(() => {
    if (isMySignaturePending && !hasPromptedModal) {
      const timer = setTimeout(() => {
        sound.playPop();
        setShowSignatureModal(true);
        setHasPromptedModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isMySignaturePending, hasPromptedModal]);

  const toggleExpand = (num) => {
    setExpandedRules(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const handleExpandAll = () => {
    sound.playPop();
    const allExpanded = {};
    rules.forEach(r => { allExpanded[r.number] = true; });
    setExpandedRules(allExpanded);
  };

  const handleCollapseAll = () => {
    sound.playPop();
    setExpandedRules({});
  };

  // Jump to specific rule number
  const handleQuickJump = (ruleNum) => {
    sound.playPop();
    // Clear filters if this rule would be hidden
    setActiveChapter('all');
    setFilterMode('all');
    setSearchQuery('');
    setExpandedRules(prev => ({ ...prev, [ruleNum]: true }));
    setActiveHighlightRule(ruleNum);

    setTimeout(() => {
      const el = document.getElementById(`rule-card-${ruleNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    setTimeout(() => {
      setActiveHighlightRule(null);
    }, 2800);
  };

  // High-fidelity Print & PDF Export Trigger
  const handlePrint = () => {
    sound.playChime();
    // Expand all rules so full content prints
    const allExpanded = {};
    rules.forEach(r => { allExpanded[r.number] = true; });
    setExpandedRules(allExpanded);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleSaveSignature = async (signatureData) => {
    const hash = `SHA:${Date.now().toString(16).toUpperCase()}${Math.random().toString(16).substr(2, 6).toUpperCase()}`;
    await signRulesBook(signatureData, hash);
    setShowSignatureModal(false);
  };

  const chapters = [
    'Operational Baseline',
    'Host Ownership & Logistics',
    'Team Governance & Decisions',
    'Assets, Security & Finances',
    'Client & Brand Excellence',
    'Enforcement & Warning System'
  ];

  // Filtering Logic
  const filteredRules = rules.filter(r => {
    // 1. Chapter Filter
    if (activeChapter !== 'all' && r.chapter !== activeChapter) return false;

    // 2. Severity / Strikes Only Filter
    if (filterMode === 'strikes_only' && !r.warning) return false;

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const numMatch = r.number.toLowerCase().includes(q);
      const titleMatch = r.title.toLowerCase().includes(q);
      const taglineMatch = (r.tagline || '').toLowerCase().includes(q);
      const warningMatch = (r.warning || '').toLowerCase().includes(q);
      const pointsMatch = (r.points || []).some(pt => pt.toLowerCase().includes(q));
      return numMatch || titleMatch || taglineMatch || warningMatch || pointsMatch;
    }

    return true;
  });

  // Highlight matching search text
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const areAllExpanded = Object.keys(expandedRules).length >= rules.length;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-28 md:pb-12 text-slate-800 rules-book-container">
      
      {/* 1. Official Charter Cover Header */}
      <div data-tour="rules-charter" className="p-6 md:p-9 rounded-3xl bg-white text-slate-800 border-2 border-amber-200/90 shadow-sm relative overflow-hidden space-y-6">
        
        {/* Top Badges & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
              WEBLETS.BOND
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              STACKADDA.ME
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-500 text-[11px] font-medium hidden sm:inline">
              VERSION 2.0 STRICT • 19 SEPT 2026
            </span>
          </div>

          {/* Print & PDF Export Button (Top) */}
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold text-xs shadow-md shadow-slate-900/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
              title="Print Charter or Save as Official PDF with Signatures"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print Official Charter (PDF)</span>
            </button>
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
          <p className="text-xs md:text-sm font-semibold tracking-wide text-slate-500">
            DISCIPLINE • ACCOUNTABILITY • COMMUNICATION • EXECUTION • GROWTH
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-100 text-center space-y-1">
            <div className="text-xs font-bold text-orange-700">PEOPLE</div>
            <p className="text-[10px] text-slate-500">A strong team builds everything.</p>
          </div>

          <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-100 text-center space-y-1">
            <div className="text-xs font-bold text-orange-700">PURPOSE</div>
            <p className="text-[10px] text-slate-500">Ideas turn into meaningful work.</p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-center space-y-1">
            <div className="text-xs font-bold text-amber-700">PROGRESS</div>
            <p className="text-[10px] text-slate-500">Small steps, every single day.</p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-center space-y-1">
            <div className="text-xs font-bold text-amber-700">IMPACT</div>
            <p className="text-[10px] text-slate-500">Build something that matters.</p>
          </div>
        </div>

        {/* Equal Standard Notice */}
        <div className="p-3.5 rounded-2xl bg-orange-50/90 border border-orange-200 text-xs text-orange-950 flex items-center justify-between gap-3">
          <div>
            <strong>EQUAL STANDARD — NO EXCEPTIONS</strong>: These rules apply equally to all three founders, regardless of role or seniority. No founder is above the rules.
          </div>
          <span className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-orange-200/80 text-orange-900 font-bold shrink-0">
            2-STRIKE POLICY
          </span>
        </div>
      </div>

      {/* Urgent Signature Alert Banner for Current Founder */}
      {isMySignaturePending && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm no-print">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
              <PenTool className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-amber-950">
                  Your Signature is Required on the Founders' Charter
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold font-mono uppercase tracking-wider">
                  Mandatory Action
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                Operating Protocol v2.0 requires every active Founder's verified digital signature to validate full constitutional compliance.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playPop();
              setShowSignatureModal(true);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/25 shrink-0 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <PenTool className="w-4 h-4" />
            <span>Sign Charter Now ✍️</span>
          </button>
        </div>
      )}

      {/* Global Pending Signatures Notice */}
      {!isMySignaturePending && pendingFounders.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs no-print">
          <div className="flex items-center gap-2.5 text-slate-800">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>{pendingFounders.length} Founder{pendingFounders.length > 1 ? 's' : ''}</strong> pending constitutional signature: <strong className="text-amber-950">{pendingFounders.map(f => f.name).join(', ')}</strong>
            </span>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold shrink-0">
            Pending Ratification
          </span>
        </div>
      )}

      {/* 2. INTERACTIVE EXPLORER & QUICK-FIND BAR (LIGHT MODE CONTROLS) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 no-print">
        
        {/* Search Input Bar + Expand Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all 30 rules (e.g. '02', 'meeting', 'strike', 'code', 'leave')..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={areAllExpanded ? handleCollapseAll : handleExpandAll}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              {areAllExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Expand All 30</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setFilterMode(filterMode === 'strikes_only' ? 'all' : 'strikes_only');
              }}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                filterMode === 'strikes_only'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Strike Triggers</span>
            </button>
          </div>
        </div>

        {/* Quick Jump 01 to 30 Interactive Number Strip */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Direct Jump to Rule (01–30):</span>
            <span className="text-[10px] text-orange-700 font-mono">
              Showing {filteredRules.length} of {rules.length} Rules
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 pt-0.5">
            {rules.map((r) => {
              const hasWarning = !!r.warning;
              const isSelected = activeHighlightRule === r.number;

              return (
                <button
                  key={r.number}
                  onClick={() => handleQuickJump(r.number)}
                  className={`min-w-[28px] h-7 px-1 rounded-lg font-mono text-[11px] font-bold shrink-0 transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-orange-600 text-white scale-110 shadow-md ring-2 ring-orange-400'
                      : hasWarning
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                  title={`Rule ${r.number}: ${r.title}`}
                >
                  {r.number}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium pt-1 border-t border-slate-100">
          <button
            onClick={() => { sound.playPop(); setActiveChapter('all'); }}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer ${
              activeChapter === 'all'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All 30 Rules
          </button>

          {chapters.map((ch, idx) => (
            <button
              key={idx}
              onClick={() => { sound.playPop(); setActiveChapter(ch); }}
              className={`px-3 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer ${
                activeChapter === ch
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {`Ch ${idx + 1}: ${ch}`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. The 30 Rules Cards List */}
      <div className="space-y-3.5">
        {filteredRules.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No rules matching your filter</h4>
            <p className="text-xs text-slate-500">
              Try searching with a different term, or reset the chapter filter to 'All 30 Rules'.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveChapter('all'); setFilterMode('all'); }}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const isExpanded = expandedRules[rule.number] ?? false;
            const isHighlighted = activeHighlightRule === rule.number;

            return (
              <div
                key={rule.number}
                id={`rule-card-${rule.number}`}
                className={`p-5 rounded-3xl bg-white border transition-all space-y-3 rule-print-card ${
                  isHighlighted 
                    ? 'border-orange-500 ring-4 ring-orange-400/40 shadow-lg scale-[1.01]' 
                    : rule.warning
                      ? 'border-slate-200 hover:border-amber-400 hover:shadow-sm'
                      : 'border-slate-200/90 hover:border-orange-300 hover:shadow-xs'
                }`}
              >
                {/* Rule Card Header */}
                <div 
                  onClick={() => toggleExpand(rule.number)}
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-xl font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs ${
                      rule.warning 
                        ? 'bg-rose-50 border border-rose-200 text-rose-700' 
                        : 'bg-orange-50 border border-orange-200 text-orange-700'
                    }`}>
                      {rule.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {highlightMatch(rule.title, searchQuery)}
                        </h3>
                        {rule.warning && (
                          <span className="hidden sm:inline-flex text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            Strike Trigger
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono font-bold text-orange-600 tracking-wide mt-0.5">
                        {highlightMatch(rule.tagline, searchQuery)}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400 p-1 no-print">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-orange-600" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Bullet Points - Printable always, toggleable on screen */}
                <div className={`${isExpanded ? 'block' : 'hidden'} print:block space-y-2.5 pt-1 rule-content-printable animate-fade-in`}>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 leading-relaxed">
                    {rule.points.map((pt, i) => (
                      <li key={i}>{highlightMatch(pt, searchQuery)}</li>
                    ))}
                  </ul>

                  {/* Warning Box */}
                  {rule.warning && (
                    <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed font-semibold">
                        {highlightMatch(rule.warning, searchQuery)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. FOUNDERS' EXECUTED SIGNATURES BLOCK */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-sm space-y-6 signatures-print-block">
        
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base md:text-lg font-bold text-slate-800">
                Founders' Executed Signatures
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Constitutionally ratified by all 3 active founding partners (Version 2.0 Strict).
            </p>
          </div>

          <div className="no-print">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              3 FOUNDERS RATIFIED
            </span>
          </div>
        </div>

        {/* 3 Active Founder Signature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeFounders.map((f) => {
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

                {/* Trigger Signature Sketchpad Modal if this is ME */}
                {isMe && !isSuspended && (
                  <div className="pt-2 no-print">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setShowSignatureModal(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:shadow-lg"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>{isSigned ? 'Re-Draw Signature (Open Sketchpad)' : 'Sign on Sketchpad (Open Popup)'}</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* 5. LEAD ADMIN WITNESS, MANUAL SIGNATURE & RATIFICATION SEAL */}
      <AdminRatificationSeal onTriggerPrint={handlePrint} />

      {/* Bottom Print / PDF Export Full Action Strip */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-slate-900/10 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Export Official Charter Document (PDF)</h4>
            <p className="text-[11px] text-slate-400">
              Generates clean, print-ready pages with all 30 rules, official seals, and verified signatures.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* 6. MANDATORY CONSTITUTIONAL SIGNATURE MODAL POPUP FOR FOUNDERS */}
      {showSignatureModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99995] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md select-none transition-opacity duration-300 no-print">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/90 space-y-4 max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/80 text-orange-600 flex items-center justify-center shrink-0 shadow-xs">
                  <PenTool className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Sign Founders' Charter
                    </h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Mandatory
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Operating Protocol v2.0 • Rule 00 Constitutional Verification
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSignatureModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Review Rules First"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Founder Profile Badge */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img 
                  src={currentFounderRecord?.avatar || currentUser?.avatar} 
                  alt={currentUser?.name} 
                  className="w-9 h-9 min-w-[36px] max-w-[36px] aspect-square rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{currentUser?.name}</h4>
                  <p className="text-[10px] text-slate-500">{currentFounderRecord?.designation || currentUser?.designation || 'Active Founder'}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-orange-700 bg-orange-100/70 border border-orange-200 px-2 py-0.5 rounded-lg">
                Constitutional Seal
              </span>
            </div>

            {/* Explanatory Legal Notice */}
            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/70 text-[11px] text-orange-950 leading-relaxed space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-orange-900">
                <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>Constitutional & Operational Commitment:</span>
              </p>
              <p className="text-slate-600">
                By drawing your signature below, you confirm that you have read, understood, and agreed to all 30 Rules in this charter. Your signature is digitally sealed with a verified cryptographic hash.
              </p>
            </div>

            {/* Signature Drawing Canvas */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-800">
                Draw Your Signature Below (Finger or Mouse):
              </label>
              <SignatureCanvas onSave={handleSaveSignature} />
            </div>

            {/* Option to Read Rules First */}
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer"
              >
                I want to read the 30 rules first
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
