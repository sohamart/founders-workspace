import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Compass, 
  Radio, 
  CheckSquare, 
  Briefcase, 
  ShieldCheck, 
  Calendar, 
  FileText,
  Zap,
  Users
} from 'lucide-react';
import { sound } from '../../utils/soundFx';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Founders Workspace',
    subtitle: 'Weblets® × StackAdda™ Executive Operating System',
    icon: Sparkles,
    badgeColor: 'from-orange-500 to-amber-500',
    description: 'This is the unified operating environment for founders. Everything from client delivery and sprint tasks to emergency broadcasts and constitutional rules is managed here with zero excuses.',
    highlights: [
      'Dual Brand Architecture: Weblets® Client Accounts & StackAdda™ Internal Initiatives.',
      'Strict Rule Enforcement: Automated watchdog strikes and deadline tracking.',
      'Realtime WebSocket Synchronization across all active founders.'
    ]
  },
  {
    id: 'banner',
    title: 'Live Workspace Banner & Broadcasts',
    subtitle: 'Always On Top • Zero Missed Agendas',
    icon: Radio,
    badgeColor: 'from-red-500 to-orange-500',
    description: 'The top workspace banner highlights the earliest upcoming meeting call or urgent admin emergency directive in realtime.',
    highlights: [
      'Earliest upcoming meeting is automatically queued to the banner.',
      'Direct one-click Google Meet / Zoom launch.',
      'Instant RSVP attendance confirmation toggle.'
    ]
  },
  {
    id: 'tasks',
    title: 'Tasks Radar & Blocker Flagging',
    subtitle: 'Sprint Milestones, Progress Proofs & Rule 08',
    icon: CheckSquare,
    badgeColor: 'from-blue-600 to-cyan-600',
    description: 'Track urgent deliverables, daily sprint updates, and escalate technical roadblocks immediately.',
    highlights: [
      'Submit progress verification proofs with URLs or file attachments.',
      'Flag active blockers (Rule 08) for immediate team assistance.',
      'Request deadline extensions with verified justification before expiry.'
    ]
  },
  {
    id: 'projects',
    title: 'Client Web Projects & Dynamic Pipelines',
    subtitle: 'Wireframing, Frontend, Backend & QA Handover',
    icon: Briefcase,
    badgeColor: 'from-amber-600 to-orange-600',
    description: 'End-to-end delivery tracking for external client accounts and internal brand tooling with staging URLs.',
    highlights: [
      '4-Phase Dynamic dev pipelines with custom stage additions.',
      'Encrypted client credential vault with Super Admin access verification.',
      'Milestone payment tracking and technical launch checklists.'
    ]
  },
  {
    id: 'requests',
    title: 'Requests & Governance Hub',
    subtitle: 'Rule 04 & 06 Operational Oversight Center',
    icon: ShieldCheck,
    badgeColor: 'from-emerald-600 to-teal-600',
    description: 'All founder project initialization proposals, task creation approvals, deadline extensions, and transfer handovers are reviewed here.',
    highlights: [
      'Rule 04 Compliance: Founder-created projects require Super Admin sign-off before entering active dev.',
      'One-click approval and rejection with audit logging.',
      'Full chronological decision log.'
    ]
  },
  {
    id: 'meetings',
    title: 'Meetings & Sync Radar',
    subtitle: 'Chronological Multi-Meeting Queue & Host Ownership',
    icon: Calendar,
    badgeColor: 'from-indigo-600 to-purple-600',
    description: 'Schedule strategy syncs directly on the Meetings page. The earliest upcoming call automatically broadcasts to the live banner.',
    highlights: [
      'Founders can schedule directly with host locked to their account.',
      'Super Admin can schedule or delegate host responsibility with deadlines.',
      'Admin-assigned meetings cannot be cancelled by founders (Rule 06).'
    ]
  },
  {
    id: 'charter',
    title: '30 Constitutional Rules Charter',
    subtitle: 'Inviolable Principles & Digital Canvas Ratification',
    icon: FileText,
    badgeColor: 'from-slate-800 to-slate-950',
    description: 'The foundation of Weblets® × StackAdda™. Every founder signs the charter with a digital pen canvas that computes a cryptographic verification hash.',
    highlights: [
      '30 rules divided into 6 operational chapters.',
      'Interactive digital signature pad with SHA verification fingerprint.',
      'Strict 2-strike system: 2 strikes result in automatic account suspension.'
    ]
  }
];

export const WorkspaceTourModal = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStepIndex];
  const StepIcon = step.icon;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    sound.playPop();
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    sound.playPop();
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    sound.playChime();
    localStorage.setItem('founders_tour_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in text-slate-800 select-none">
      <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col space-y-6">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold font-mono">
              Step {currentStepIndex + 1} of {TOUR_STEPS.length}
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Workspace Interactive Tour</span>
          </div>

          <button
            onClick={handleComplete}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Skip Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Visual Banner & Icon */}
        <div className="relative z-10 flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.badgeColor} text-white flex items-center justify-center shadow-lg shrink-0`}>
            <StepIcon className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {step.title}
            </h3>
            <p className="text-xs font-semibold text-orange-600 font-mono">
              {step.subtitle}
            </p>
          </div>
        </div>

        {/* Step Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed relative z-10">
          {step.description}
        </p>

        {/* Bullet Highlights Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 relative z-10">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Key Highlights:
          </div>
          <div className="space-y-2">
            {step.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 relative z-10">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  sound.playPop();
                  setCurrentStepIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex 
                    ? 'w-6 bg-orange-600' 
                    : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isLast ? 'Complete Tour & Enter' : 'Next Step'}</span>
              {isLast ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkspaceTourModal;
