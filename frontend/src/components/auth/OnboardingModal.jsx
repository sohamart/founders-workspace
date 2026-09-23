import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Lock, Shield, CheckCircle2, User, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/soundFx';

export const OnboardingModal = () => {
  const { completeOnboarding, currentUser } = usePortal();

  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || '');
  const [rulesAcknowledged, setRulesAcknowledged] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80'
  ];

  const handleStep1Next = () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    sound.playPop();
    setStep(2);
  };

  const handleStep2Next = () => {
    sound.playPop();
    setStep(3);
  };

  const handleStep3Next = () => {
    if (!rulesAcknowledged) {
      setError('You must acknowledge and accept the 30 Rules & 2-Strike policy.');
      return;
    }
    setError('');
    sound.playPop();
    setStep(4);
    // Fire celebratory confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    const res = await completeOnboarding({
      newPassword,
      designation,
      phone,
      avatar: selectedAvatar
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in text-slate-800">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Founder Security Onboarding</h2>
            <p className="text-[11px] text-slate-500">Step {step} of 4 • {
              step === 1 ? 'Permanent Password Setup' :
              step === 2 ? 'Profile Customization' :
              step === 3 ? 'Bylaws & 2-Strike Charter' : 'Welcome to Workspace'
            }</p>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-all ${
                  s === step ? 'bg-orange-600 w-8' : s < step ? 'bg-amber-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Security Password Setup */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100 flex items-start gap-3">
              <Shield className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-950 leading-relaxed">
                You logged in using a temporary password. For maximum account security, please create your permanent, encrypted password.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Permanent Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
              />
            </div>

            <button
              type="button"
              onClick={handleStep1Next}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue to Profile Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Profile Customization */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Choose Profile Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {avatars.map((av, idx) => (
                  <img
                    key={idx}
                    src={av}
                    alt="Avatar choice"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-12 h-12 rounded-2xl object-cover cursor-pointer transition-all ${
                      selectedAvatar === av ? 'ring-4 ring-orange-600 scale-105 shadow-md' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Role Title</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Product Lead, UI/UX Lead"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Emergency Sync)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50"
              />
            </div>

            <button
              type="button"
              onClick={handleStep2Next}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Review Operating Charter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Rules & 2-Strike Charter Briefing */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Weblets® × StackAdda™ Strict 2-Strike Policy</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li><strong>Rule 03 & 06</strong>: Missing task deadlines or meeting schedule deadlines triggers an automatic warning.</li>
                <li><strong>Strike 1</strong>: Formal warning logged in portal with high-priority alert.</li>
                <li><strong>Strike 2 (One Chance Policy)</strong>: Accumulating 2 active strikes results in <strong>INSTANT ACCOUNT SUSPENSION</strong> and full lockout until Admin review.</li>
              </ul>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={rulesAcknowledged}
                onChange={(e) => setRulesAcknowledged(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 accent-orange-600"
              />
              <span className="text-xs font-semibold text-slate-800">
                I have read, understood, and solemnly pledge to adhere to the 30 Rules & Regulations.
              </span>
            </label>

            <button
              type="button"
              onClick={handleStep3Next}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Accept Charter & Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 4: Executive Welcome Celebration */}
        {step === 4 && (
          <div className="text-center space-y-4 animate-fade-in py-2">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 mx-auto flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 animate-bounce-subtle" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Welcome to Founders Executive Circle!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your credentials have been securely encrypted and your workspace is fully primed.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-xl shadow-orange-600/25 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Finalizing Setup...' : 'Enter Founders Workspace 🚀'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
