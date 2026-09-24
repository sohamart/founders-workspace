import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../../context/PortalContext';
import { 
  X, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Radio, 
  CheckSquare, 
  Briefcase, 
  Calendar, 
  BookOpen, 
  Volume2, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { sound } from '../../utils/soundFx';

const TOUR_STEPS = [
  {
    id: 'brand',
    tab: 'dashboard',
    targets: ['[data-tour="brand-logo"]'],
    title: 'Weblets® × StackAdda™ Hub',
    desc: 'Unified ecosystem combining client deliverables (Weblets) & internal tooling (StackAdda).',
    icon: Sparkles
  },
  {
    id: 'banner',
    tab: 'dashboard',
    targets: ['[data-tour="meeting-banner"]', '[data-tour="dashboard-hero"]'],
    title: 'Strategic Meeting Radar',
    desc: 'Persistent live broadcast for upcoming strategy calls, RSVP attendance & urgent directives.',
    icon: Radio
  },
  {
    id: 'kpis',
    tab: 'dashboard',
    targets: ['[data-tour="dashboard-kpis"]', '[data-tour="dashboard-hero"]'],
    title: 'Executive Velocity Radar',
    desc: 'Real-time counters for active sprint tasks, client projects, scheduled syncs & strikes.',
    icon: Zap
  },
  {
    id: 'tasks',
    tab: 'tasks',
    targets: ['[data-tour="tasks-radar-header"]', '[data-tour="dock-tasks"]', '[data-tour="nav-tasks"]'],
    title: 'Tasks & Sprints Kanban',
    desc: 'Track daily deliverables, submit proof links/files, and flag active technical blockers.',
    icon: CheckSquare
  },
  {
    id: 'projects',
    tab: 'projects',
    targets: ['[data-tour="projects-hub"]', '[data-tour="nav-projects"]'],
    title: 'Client Web Projects & Vault',
    desc: 'Manage staging environments, dev pipelines & encrypted client credentials.',
    icon: Briefcase
  },
  {
    id: 'meetings',
    tab: 'meetings',
    targets: ['[data-tour="meetings-radar"]', '[data-tour="nav-meetings"]'],
    title: 'Meetings & Sync Queue',
    desc: 'Schedule strategy syncs chronologically with host delegation and Google Meet launch.',
    icon: Calendar
  },
  {
    id: 'rules',
    tab: 'rules',
    targets: ['[data-tour="rules-charter"]', '[data-tour="nav-rules"]'],
    title: '30 Strict Rules Charter',
    desc: 'Constitutional agreements signed with cryptographic digital SHA pen verification.',
    icon: BookOpen
  },
  {
    id: 'sound',
    tab: 'dashboard',
    targets: ['[data-tour="header-sound"]'],
    title: 'Web Audio Soundscapes',
    desc: 'Synthesized zero-latency sound effects for chats, approvals, tasks & notifications.',
    icon: Volume2
  },
  {
    id: 'profile',
    tab: 'dashboard',
    targets: ['[data-tour="header-profile"]'],
    title: 'Executive Profile & Settings',
    desc: 'Upload Cloudinary avatar, manage designations, inspect compliance & sign out.',
    icon: ShieldCheck
  }
];

export const WorkspaceTourModal = ({ isOpen, onClose }) => {
  const { currentTab, setCurrentTab } = usePortal();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  }));

  const step = TOUR_STEPS[currentStepIndex];

  // Robust selector that finds the VISIBLE element (ignoring hidden mobile/desktop duplicates)
  const findVisibleTarget = useCallback((selectors) => {
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const b = el.getBoundingClientRect();
        if (b.width > 0 && b.height > 0) {
          const style = window.getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            return { element: el, rect: b };
          }
        }
      }
    }
    return null;
  }, []);

  const measureTarget = useCallback(() => {
    if (!isOpen) return;
    const currentStep = TOUR_STEPS[currentStepIndex];
    if (!currentStep) return;

    const match = findVisibleTarget(currentStep.targets);
    if (match) {
      match.element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      const b = match.element.getBoundingClientRect();
      setTargetRect({
        top: b.top,
        left: b.left,
        width: b.width,
        height: b.height,
        bottom: b.bottom,
        right: b.right
      });
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStepIndex, findVisibleTarget]);

  useEffect(() => {
    if (!isOpen) return;

    sound.unlockAudio();
    const currentStep = TOUR_STEPS[currentStepIndex];
    if (currentStep?.tab && currentTab !== currentStep.tab) {
      setCurrentTab(currentStep.tab);
    }

    measureTarget();
    const t1 = setTimeout(measureTarget, 140);
    const t2 = setTimeout(measureTarget, 380);

    const onResizeOrScroll = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      measureTarget();
    };
    window.addEventListener('resize', onResizeOrScroll, { passive: true });
    window.addEventListener('scroll', onResizeOrScroll, { passive: true, capture: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', onResizeOrScroll);
      window.removeEventListener('scroll', onResizeOrScroll, true);
    };
  }, [isOpen, currentStepIndex, currentTab, setCurrentTab, measureTarget]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const StepIcon = step.icon;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    sound.unlockAudio();
    sound.playPop();
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    sound.unlockAudio();
    sound.playPop();
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    sound.unlockAudio();
    sound.playSuccess();
    localStorage.setItem('founders_tour_completed', 'true');
    setCurrentTab('dashboard');
    onClose();
  };

  const padding = 8;
  const isMobile = viewport.width < 768;
  const cardWidth = isMobile ? Math.min(420, viewport.width - 24) : 380;
  const cardHeight = 160;

  // SMART BULLETPROOF VIEWPORT POSITIONING
  let popoverStyle = {};
  if (isMobile) {
    // Mobile / Tablet: Bulletproof horizontal centering using left: 12, right: 12, margin: 0 auto
    // NEVER uses transform: translateX(-50%) which gets overridden by CSS animations!
    const targetTop = targetRect ? targetRect.top : 0;
    const placeAtTop = targetRect && targetTop > 220;

    popoverStyle = {
      position: 'fixed',
      ...(placeAtTop ? { top: 16 } : { bottom: 84 }),
      left: 12,
      right: 12,
      margin: '0 auto',
      maxWidth: 380,
      width: 'auto',
      boxSizing: 'border-box',
      zIndex: 99995
    };
  } else {
    // Desktop: Clamped smartly near focused target
    if (!targetRect) {
      popoverStyle = {
        position: 'fixed',
        bottom: 28,
        left: 24,
        right: 24,
        margin: '0 auto',
        maxWidth: 380,
        zIndex: 99995
      };
    } else {
      const spaceBelow = viewport.height - targetRect.bottom;
      const spaceAbove = targetRect.top;

      let topPos;
      if (spaceBelow > cardHeight + 20) {
        topPos = targetRect.bottom + 12;
      } else if (spaceAbove > cardHeight + 20) {
        topPos = targetRect.top - cardHeight - 12;
      } else {
        topPos = viewport.height - cardHeight - 24;
      }
      topPos = Math.max(16, Math.min(viewport.height - cardHeight - 16, topPos));

      let leftPos = targetRect.left + targetRect.width / 2 - 190;
      leftPos = Math.max(16, Math.min(viewport.width - 396, leftPos));

      popoverStyle = {
        position: 'fixed',
        top: topPos,
        left: leftPos,
        width: 380,
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 99995
      };
    }
  }

  const tourContent = (
    <div className="fixed inset-0 z-[99990] select-none">
      
      {/* 1. TRUE SVG CUTOUT MASK: 100% CLEAR, UN-DIMMED HOLE OVER FOCUSED TARGET */}
      <svg 
        className="fixed inset-0 w-full h-full z-[99990] transition-opacity duration-300 pointer-events-auto"
        onClick={handleComplete}
      >
        <defs>
          <mask id={`spotlight-mask-step-${currentStepIndex}`}>
            {/* White fills entire screen with dark overlay */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cuts out an exact 100% transparent crystal-clear window over targetRect */}
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - padding)}
                y={Math.max(0, targetRect.top - padding)}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="16"
                ry="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.78)"
          mask={targetRect ? `url(#spotlight-mask-step-${currentStepIndex})` : undefined}
          className="cursor-pointer"
        />
      </svg>

      {/* 2. GLOWING AMBER PULSE RING OVER TARGET ELEMENT */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: Math.max(0, targetRect.top - padding),
            left: Math.max(0, targetRect.left - padding),
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            zIndex: 99992,
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="pointer-events-none rounded-2xl ring-4 ring-orange-500 shadow-[0_0_35px_rgba(249,115,22,0.8),inset_0_0_15px_rgba(255,255,255,0.15)] animate-pulse"
        >
          {/* Tactical crosshair corners */}
          <span className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl" />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr" />
          <span className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl" />
          <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-white rounded-br" />
        </div>
      )}

      {/* 3. COMPACT & MINIMAL INFORMATION CARD (Clamped, never overflows screen) */}
      <div 
        style={popoverStyle}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-orange-200/90 text-slate-800 flex flex-col justify-between transition-all duration-300 ease-out pointer-events-auto box-border max-h-[45vh] overflow-hidden"
      >
        {/* Header: Step Badge + Title + Close */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-bold font-mono tracking-wider shadow-xs shrink-0">
              {currentStepIndex + 1}/{TOUR_STEPS.length}
            </span>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <StepIcon className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                {step.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Exit Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Description (1 concise sentence) */}
        <p className="text-[11px] sm:text-xs text-slate-600 leading-snug py-2">
          {step.desc}
        </p>

        {/* Compact Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
          {/* Dot progress */}
          <div className="flex items-center gap-1 shrink-0">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  sound.unlockAudio();
                  sound.playPop();
                  setCurrentStepIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex 
                    ? 'w-4 bg-orange-600' 
                    : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Go to ${s.title}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-[11px] shadow-sm shadow-orange-600/25 hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{isLast ? 'Done 🚀' : 'Next →'}</span>
              {isLast ? <Check className="w-3 h-3" /> : null}
            </button>
          </div>
        </div>

      </div>

    </div>
  );

  return typeof document !== 'undefined' ? createPortal(tourContent, document.body) : null;
};

export default WorkspaceTourModal;
