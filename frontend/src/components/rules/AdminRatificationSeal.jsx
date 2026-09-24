import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../../context/PortalContext';
import { 
  Award, 
  ShieldCheck, 
  Stamp, 
  Sparkles, 
  PenTool, 
  Edit3, 
  RotateCcw, 
  Undo, 
  Check, 
  X, 
  Lock,
  FileCheck2,
  Calendar,
  Key
} from 'lucide-react';
import { ExecutiveSealArt } from './ExecutiveSealArt';
import { sound } from '../../utils/soundFx';

export const AdminRatificationSeal = ({ onTriggerPrint }) => {
  const { adminRatification, ratifyCharter, currentUser } = usePortal();
  const isAdmin = currentUser?.role === 'superadmin';

  // Modal Studio State
  const [showStudio, setShowStudio] = useState(false);
  const [selectedSeal, setSelectedSeal] = useState(adminRatification?.sealType || 'gold_crest');
  const [ratifiedBy, setRatifiedBy] = useState(adminRatification?.ratifiedBy || 'SSA TEAM LEAD ADMIN');
  const [quote, setQuote] = useState(
    adminRatification?.quote || 
    "I, Lead Admin, hereby ratify, execute and officially enforce the Founders' Strict Rules & Agreement (Version 2.0) across Weblets and StackAdda."
  );

  // Signature Canvas Drawing State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState([]);
  const [penColor, setPenColor] = useState('#1e3a8a'); // Royal blue default for executive ink
  const [penWidth, setPenWidth] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (adminRatification) {
      if (adminRatification.sealType) setSelectedSeal(adminRatification.sealType);
      if (adminRatification.ratifiedBy) setRatifiedBy(adminRatification.ratifiedBy);
      if (adminRatification.quote) setQuote(adminRatification.quote);
    }
  }, [adminRatification]);

  // Canvas setup when Studio opens
  useEffect(() => {
    if (!showStudio) return;
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Load existing signature if already signed
      if (adminRatification?.signatureData) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasDrawn(true);
        };
        img.src = adminRatification.signatureData;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [showStudio]);

  // Update pen settings on color/width change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  }, [penColor, penWidth]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setHistory(prev => [...prev, canvas.toDataURL()]);
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setHistory([]);
    sound.playPop();
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const prevState = history[history.length - 1];
    setHistory(history.slice(0, -1));

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
    };
    img.src = prevState;
  };

  const handleSaveRatification = async () => {
    const canvas = canvasRef.current;
    let signatureData = adminRatification?.signatureData || null;

    if (canvas && hasDrawn) {
      signatureData = canvas.toDataURL('image/png');
    }

    setIsSubmitting(true);
    const hash = `SHA:ADMIN_${Date.now().toString(16).toUpperCase()}${Math.random().toString(16).substr(2, 6).toUpperCase()}`;

    await ratifyCharter({
      sealType: selectedSeal,
      signatureText: ratifiedBy.trim() || 'SSA TEAM LEAD ADMIN',
      signatureData,
      signatureHash: hash,
      ratifiedBy: ratifiedBy.trim() || 'SSA TEAM LEAD ADMIN',
      quote: quote.trim()
    });

    setIsSubmitting(false);
    setShowStudio(false);
    sound.playChime();
  };

  const currentSeal = adminRatification?.sealType || 'gold_crest';
  const hasSignature = !!adminRatification?.signatureData;

  const sealList = [
    {
      id: 'gold_crest',
      name: 'SSA TEAM Gold Crest',
      tagline: 'Imperial 24K Gold • Council Ratification',
      desc: 'Double beaded starburst with 3 founder stars & heraldic shield'
    },
    {
      id: 'dual_brand',
      name: 'Weblets® × StackAdda™',
      tagline: 'Presidential Crimson & Amber Duo',
      desc: 'Dual-brand corporate insignia & 30-Rule constitutional ring'
    },
    {
      id: 'protocol',
      name: 'Operating Protocol v2.0',
      tagline: 'Emerald & Gold Security Guilloche',
      desc: 'Cryptographic padlock emblem for strict 2-strike compliance'
    },
    {
      id: 'royal_onyx',
      name: 'Royal Onyx & Platinum',
      tagline: 'Midnight Onyx • Chief Executor',
      desc: 'Diamond-cut chrome bevel with crown crest & perpetual mandate'
    }
  ];

  return (
    <div className="relative p-6 md:p-8 rounded-3xl bg-white text-slate-800 border-2 border-amber-300 shadow-md space-y-6 overflow-hidden">
      
      {/* Decorative Gold & Amber Ambient Corner Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/60 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-100/50 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

      {/* Header Bar */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 font-mono bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                OFFICIAL EXECUTIVE SEAL & WITNESS
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                ACTIVE CHARTER
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
              Lead Admin Authority Ratification & Permanent Witness
            </h3>
          </div>
        </div>

        {/* Lead Admin Edit Controls - ALWAYS AVAILABLE TO SUPER ADMIN, NO DELETE */}
        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                sound.playPop();
                setShowStudio(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
              title="Edit Lead Admin Signature & Seal (Always Editable)"
            >
              <Edit3 className="w-4 h-4" />
              <span>{hasSignature ? 'Edit Lead Admin Signature & Seal' : '✍️ Sign as Lead Admin & Set Seal'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Quote / Declaration Box */}
      <blockquote className="relative text-xs sm:text-sm italic text-slate-700 font-serif leading-relaxed pl-4 border-l-4 border-amber-500 bg-amber-50/40 p-3.5 rounded-r-2xl border-y border-r border-amber-100">
        "{adminRatification?.quote || "I, Lead Admin, hereby ratify, execute and officially enforce the Founders' Strict Rules & Agreement (Version 2.0) across Weblets and StackAdda."}"
      </blockquote>

      {/* Main Dual Showcase: Seal + Handwritten Signature */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-1">
        
        {/* Left: Authority Credentials & Handwritten Signature Card */}
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Ratifying Lead Authority
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 mt-0.5">
              <span>{adminRatification?.ratifiedBy || 'SSA TEAM LEAD ADMIN'}</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-[11px] text-amber-800 font-mono mt-0.5">
              Effective Date: {adminRatification?.date || '19 September 2026'} • Protocol v2.0 STRICT
            </div>
          </div>

          {/* Handwritten Signature Block */}
          <div className="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              <span>Lead Admin Handwritten Signature:</span>
              <span className={`px-2 py-0.5 rounded-full ${hasSignature ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {hasSignature ? 'DIGITALLY RECORDED ✓' : 'PENDING DRAW'}
              </span>
            </div>

            <div className="h-28 rounded-xl border border-slate-200 bg-white flex items-center justify-center p-2 shadow-inner relative overflow-hidden">
              {hasSignature ? (
                <img 
                  src={adminRatification.signatureData} 
                  alt="Lead Admin Signature" 
                  className="max-h-full max-w-full object-contain filter drop-shadow-xs"
                />
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-xs text-slate-400 italic font-serif">No manual signature recorded yet</p>
                  {isAdmin && (
                    <button
                      onClick={() => setShowStudio(true)}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                    >
                      Click here to sign manually
                    </button>
                  )}
                </div>
              )}
            </div>

            {hasSignature && (
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5 truncate">
                <span className="truncate">Hash: <strong className="text-orange-700">{adminRatification?.signatureHash || 'SHA:ADMIN_VERIFIED'}</strong></span>
                <span className="text-emerald-700 font-semibold shrink-0">Permanent & Immutable</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: The Chosen High-End Seal Showcase */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-amber-50/40 via-white to-slate-50 border border-amber-200/80 text-center">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <ExecutiveSealArt type={currentSeal} size="lg" />
          </div>

          <div className="mt-3 space-y-0.5">
            <h4 className="text-xs font-black tracking-wider uppercase text-slate-800">
              {sealList.find(s => s.id === currentSeal)?.name || 'SSA TEAM Gold Crest'}
            </h4>
            <p className="text-[11px] text-amber-800 font-medium">
              {sealList.find(s => s.id === currentSeal)?.tagline || 'Official Executive Seal'}
            </p>
          </div>
        </div>

      </div>

      {/* IMMUTABLE CONSTITUTIONAL CLAUSE FOOTER NOTE */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Constitutional Legal Precedent</strong>: This official seal & Lead Admin signature is permanently registered to the Founders' Charter. It can be re-signed or updated at any time by the Lead Admin, but cannot be erased or deleted.
          </span>
        </div>
      </div>

      {/* LEAD ADMIN SIGNATURE & SEAL STUDIO MODAL */}
      {showStudio && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in select-none">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200/90 space-y-5 max-h-[92vh] overflow-y-auto text-slate-800"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <Stamp className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      Lead Admin Seal & Signature Studio
                    </h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      EXECUTIVE EDIT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Draw your authentic handwritten signature and select the official executive seal.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowStudio(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Select Official Seal */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>1. Select Branded Executive Seal:</span>
                <span className="text-[10px] text-amber-700 font-mono font-semibold">4 High-Resolution Vector Badges</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sealList.map((seal) => {
                  const isSelected = selectedSeal === seal.id;
                  return (
                    <div
                      key={seal.id}
                      onClick={() => {
                        sound.playPop();
                        setSelectedSeal(seal.id);
                      }}
                      className={`p-3 rounded-2xl border-2 text-center cursor-pointer transition-all flex flex-col items-center justify-between gap-2 ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-400/30' 
                          : 'border-slate-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <ExecutiveSealArt type={seal.id} size="sm" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-900 leading-tight">{seal.name}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">{seal.tagline}</div>
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[9px] font-bold">
                          Selected ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Draw Handwritten Signature Pad */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-amber-700" />
                  <span>2. Draw Lead Admin Handwritten Signature:</span>
                </label>

                {/* Ink Colors & Thickness Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPenColor('#1e3a8a')}
                      className={`w-5 h-5 rounded-full bg-blue-900 border-2 transition-all ${penColor === '#1e3a8a' ? 'border-amber-400 scale-110 shadow-xs' : 'border-transparent'}`}
                      title="Royal Blue Ink"
                    />
                    <button
                      type="button"
                      onClick={() => setPenColor('#0f172a')}
                      className={`w-5 h-5 rounded-full bg-slate-900 border-2 transition-all ${penColor === '#0f172a' ? 'border-amber-400 scale-110 shadow-xs' : 'border-transparent'}`}
                      title="Deep Black Ink"
                    />
                    <button
                      type="button"
                      onClick={() => setPenColor('#b45309')}
                      className={`w-5 h-5 rounded-full bg-amber-700 border-2 transition-all ${penColor === '#b45309' ? 'border-amber-400 scale-110 shadow-xs' : 'border-transparent'}`}
                      title="Bullion Gold Ink"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPenWidth(2)}
                      className={`px-1.5 py-0.5 rounded-lg ${penWidth === 2 ? 'bg-white shadow-xs text-amber-700' : 'text-slate-500'}`}
                    >
                      Fine
                    </button>
                    <button
                      type="button"
                      onClick={() => setPenWidth(3)}
                      className={`px-1.5 py-0.5 rounded-lg ${penWidth === 3 ? 'bg-white shadow-xs text-amber-700' : 'text-slate-500'}`}
                    >
                      Med
                    </button>
                    <button
                      type="button"
                      onClick={() => setPenWidth(4.5)}
                      className={`px-1.5 py-0.5 rounded-lg ${penWidth === 4.5 ? 'bg-white shadow-xs text-amber-700' : 'text-slate-500'}`}
                    >
                      Bold
                    </button>
                  </div>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="relative rounded-2xl border-2 border-dashed border-amber-300 bg-white overflow-hidden shadow-inner touch-none">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 cursor-crosshair"
                />

                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs italic">
                    Draw your Lead Admin signature here with mouse or finger...
                  </div>
                )}
              </div>

              {/* Canvas Action Bar */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1.5 px-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Canvas</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className="p-1.5 px-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1 text-[11px] font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    <Undo className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {hasDrawn ? 'Signature Ready' : 'Draw inside the dashed area'}
                </span>
              </div>
            </div>

            {/* Step 3: Ratified By & Custom Declaration Quote */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lead Admin Name / Title</label>
                <input
                  type="text"
                  value={ratifiedBy}
                  onChange={(e) => setRatifiedBy(e.target.value)}
                  placeholder="e.g. Soham Dutta (Lead Admin Authority)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Legal Statement</label>
                <input
                  type="text"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Official ratification quote..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400 italic">
                * Note: Lead Admin signature is permanently registered and cannot be deleted.
              </p>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowStudio(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSaveRatification}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sealing...' : 'Save & Ratify Charter'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
