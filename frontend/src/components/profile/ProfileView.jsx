import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  User, 
  Camera, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Phone, 
  Mail, 
  Award, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Save, 
  UploadCloud, 
  RefreshCw, 
  FileText, 
  Hash, 
  Calendar, 
  AlertTriangle,
  ExternalLink,
  Briefcase,
  Layers,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { sound } from '../../utils/soundFx';

export const ProfileView = () => {
  const { 
    currentUser, 
    founders, 
    tasks, 
    updateProfile, 
    uploadFile,
    setCurrentTab 
  } = usePortal();

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [brand, setBrand] = useState(currentUser?.brand || 'Both Brands');

  // Keep form inputs synced whenever currentUser is refreshed or updated
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name !== undefined) setName(currentUser.name || '');
      if (currentUser.email !== undefined) setEmail(currentUser.email || '');
      if (currentUser.avatar !== undefined) setAvatar(currentUser.avatar || '');
      if (currentUser.designation !== undefined) setDesignation(currentUser.designation || '');
      if (currentUser.phone !== undefined) setPhone(currentUser.phone || '');
      if (currentUser.bio !== undefined) setBio(currentUser.bio || '');
      if (currentUser.brand !== undefined) setBrand(currentUser.brand || 'Both Brands');
    }
  }, [currentUser]);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // UI States
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Compute Founder Activity Stats
  const myAssignedTasks = tasks.filter(t => (t.assignedTo || []).includes(currentUser?.id));
  const myCompletedTasks = myAssignedTasks.filter(t => t.status === 'completed');
  const myPendingTasks = myAssignedTasks.filter(t => t.status !== 'completed');

  const strikes = currentUser?.strikes || 0;
  const isSuspended = currentUser?.status === 'suspended' || strikes >= 2;

  // Handle Image File Upload to Cloudinary / Server
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadFile(file, 'founders/avatars', 'image');
      if (res.success && res.url) {
        setAvatar(res.url);
        // Automatically save avatar immediately
        await updateProfile({ avatar: res.url });
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Form Submission
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Full name cannot be blank.');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        alert('Please enter your current password to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
        alert('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        alert('New password and confirm password do not match.');
        return;
      }
    }

    try {
      setIsSaving(true);
      const payload = {
        name: name.trim(),
        avatar: avatar.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        brand: brand
      };

      // Only Lead Admin can modify their email
      if (currentUser?.role === 'superadmin' && email.trim()) {
        payload.email = email.trim();
      }

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await updateProfile(payload);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] w-full mx-auto pb-28 md:pb-16 text-slate-800 overflow-x-hidden">
      
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Executive Profile & Identity
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold font-mono">
              {currentUser?.role === 'superadmin' ? 'Lead Admin' : 'Founding Partner'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your executive credentials, synchronized profile photo, contact details & governance status
          </p>
        </div>

        <button
          onClick={() => {
            sound.playPop();
            setCurrentTab('dashboard');
          }}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Main Grid: Left Column Profile Snapshot, Right Column Detailed Edit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Profile Card & Governance Radar */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Identity Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-orange-50/60 via-white to-white border border-orange-200/80 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden space-y-4">
            
            {/* Top Brand Pill */}
            <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-orange-200 text-orange-800 text-xs font-semibold shadow-2xs mx-auto">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Weblets® × StackAdda™ Executive</span>
            </div>

            {/* Avatar with Upload Action */}
            <div className="relative flex justify-center items-center mx-auto group my-1">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-orange-500/80 shadow-lg mx-auto bg-slate-100 relative">
                <img
                  src={avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                  alt={currentUser?.name}
                  className="w-full h-full object-cover"
                />

                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-semibold space-y-1">
                    <RefreshCw className="w-6 h-6 animate-spin text-orange-400" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              {/* Upload Trigger Badge */}
              <label 
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-all group-hover:ring-2 group-hover:ring-white z-10"
                title="Upload new profile photo"
              >
                <Camera className="w-5 h-5" />
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* Name & Title */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {name || currentUser?.name}
              </h3>
              <p className="text-xs font-semibold text-orange-700 mt-1">
                {designation || currentUser?.designation || 'Founding Executive'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {currentUser?.email}
              </p>
            </div>

            {/* Toggle Image URL Option */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold underline"
              >
                {showUrlInput ? 'Hide Image URL Field' : 'Or paste direct image URL'}
              </button>

              {showUrlInput && (
                <div className="mt-2 text-left space-y-1">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    Changes apply synchronously across all services upon save.
                  </p>
                </div>
              )}
            </div>

            {/* Task Performance Snapshot */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center font-mono">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-sans">Assigned</span>
                <span className="text-base font-bold text-slate-900">{myAssignedTasks.length}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] text-emerald-600 block font-sans">Completed</span>
                <span className="text-base font-bold text-emerald-800">{myCompletedTasks.length}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-orange-50/70 border border-orange-200">
                <span className="text-[10px] text-orange-600 block font-sans">Active</span>
                <span className="text-base font-bold text-orange-800">{myPendingTasks.length}</span>
              </div>
            </div>

          </div>

          {/* Governance & Disciplinary Standing Card */}
          <div className="p-5 md:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Governance & Standing</h4>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Rule 26 / 28
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Disciplinary Strikes</span>
                <span className={`text-base font-extrabold font-mono ${strikes > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {strikes} / 2 Official Strikes
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                strikes === 0 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : strikes === 1 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-rose-600 text-white'
              }`}>
                {strikes === 0 ? 'Clean Record ✓' : strikes === 1 ? 'Strike 1 Warning' : 'Suspended'}
              </span>
            </div>

            {currentUser?.strikeHistory && currentUser.strikeHistory.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Strike History Log:</span>
                {currentUser.strikeHistory.map((sh, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-rose-800 font-bold">
                      <span>{sh.rule || 'Infraction'}</span>
                      <span className="text-[10px] font-mono text-rose-500">{formatDateTime(sh.issuedAt)}</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">{sh.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Digital Signature Preview */}
            {currentUser?.signature && (
              <div className="pt-2 border-t border-slate-100 space-y-2 overflow-hidden max-w-full">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Digital Legal Signature (Rule 01)</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold shrink-0">
                    RATIFIED
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 overflow-hidden max-w-full">
                  <div className="h-10 min-w-0 flex-1 flex items-center overflow-hidden">
                    {currentUser.signature.signatureData?.startsWith('data:') ? (
                      <img 
                        src={currentUser.signature.signatureData} 
                        alt="Digital Signature" 
                        className="max-h-9 max-w-full object-contain pointer-events-none"
                      />
                    ) : currentUser.signature.signatureData?.includes('<svg') ? (
                      <div 
                        className="max-h-9 max-w-full overflow-hidden [&>svg]:max-h-9 [&>svg]:w-auto"
                        dangerouslySetInnerHTML={{ __html: currentUser.signature.signatureData }}
                      />
                    ) : (
                      <span className="font-serif italic font-bold text-slate-800 text-sm tracking-wide truncate">
                        {currentUser.signature.signatureData || currentUser.name}
                      </span>
                    )}
                  </div>
                  <div className="text-right font-mono text-[9px] text-slate-400 shrink-0 min-w-[70px]">
                    <span className="block truncate max-w-[90px]">
                      {currentUser.signature.hash ? (currentUser.signature.hash.startsWith('SHA:') ? currentUser.signature.hash.slice(0, 16) : `SHA: ${currentUser.signature.hash.slice(0, 10)}`) : 'VERIFIED'}
                    </span>
                    <span className="block truncate">{currentUser.signature.date || 'Ratified'}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column (7 cols): Editable Details & Security */}
        <div className="lg:col-span-7 space-y-6">
          
          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Executive Details Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-600" />
                  <h4 className="text-sm font-bold text-slate-900">Personal & Executive Details</h4>
                </div>
                <span className="text-[11px] text-slate-400">Editable</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                {/* Email (Official) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Official Portal Email</label>
                    {currentUser?.role === 'superadmin' ? (
                      <span className="text-[10px] text-amber-700 bg-amber-50 font-bold px-2 py-0.5 rounded border border-amber-200">
                        Lead Admin Exclusive Edit
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-100 font-mono px-1.5 py-0.5 rounded">
                        Locked
                      </span>
                    )}
                  </div>
                  {currentUser?.role === 'superadmin' ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@company.com"
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
                    />
                  ) : (
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono text-slate-500 bg-slate-100 cursor-not-allowed"
                    />
                  )}
                  <p className="text-[10px] text-slate-400">
                    {currentUser?.role === 'superadmin'
                      ? 'Lead Admin can update their administrative login email.'
                      : 'Founder email is managed and locked by Lead Admin.'}
                  </p>
                </div>

                {/* Executive Designation */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Executive Designation / Role</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Product & System Architecture"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                {/* Phone / WhatsApp */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 91234 56789"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                {/* Brand Affiliation */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Primary Brand Responsibility</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
                  >
                    <option value="Both Brands">Weblets® × StackAdda™ (Dual Executive Partner)</option>
                    <option value="Weblets®">Weblets® (Creative Design & Production)</option>
                    <option value="StackAdda™">StackAdda™ (Full-Stack Engineering & Cloud)</option>
                  </select>
                </div>

                {/* Bio / Professional Summary */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Executive Scope & Summary</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your operational domain and sprint oversight..."
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

              </div>
            </div>

            {/* Account Security & Password Change */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-orange-600" />
                  <h4 className="text-sm font-bold text-slate-900">Security & Password Management</h4>
                </div>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      tabIndex={-1}
                      title={showCurrentPass ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      tabIndex={-1}
                      title={showNewPass ? 'Hide password' : 'Show password'}
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      tabIndex={-1}
                      title={showConfirmPass ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <div className="text-xs">
                <p className="font-bold">Sync Across Ecosystem</p>
                <p className="text-[11px] text-slate-400">Changes reflect immediately in meeting banner, chat, and team cards</p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
};
