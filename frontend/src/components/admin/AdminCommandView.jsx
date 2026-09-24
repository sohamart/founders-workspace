import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Upload, 
  Lock, 
  Unlock, 
  RefreshCw,
  Radio,
  FileWarning,
  Globe,
  Sliders,
  Calendar,
  Eye,
  EyeOff,
  Copy,
  Check,
  Share2,
  MessageCircle,
  X,
  ExternalLink,
  Sparkles,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const AdminCommandView = () => {
  const { 
    founders, 
    createFounder, 
    deleteFounder, 
    issueStrike, 
    pardonStrike, 
    adminOverridePassword,
    securityFreeze,
    showToast,
    portalSettings,
    updatePortalSettings
  } = usePortal();

  // Portal Gateway & Launch Settings State
  const [comingSoonActive, setComingSoonActive] = useState(portalSettings?.comingSoonActive ?? true);
  const [allowBypass, setAllowBypass] = useState(portalSettings?.allowBypass ?? true);
  const [bypassPasscode, setBypassPasscode] = useState(portalSettings?.bypassPasscode || 'FOUNDER2026');
  const [targetLaunchDate, setTargetLaunchDate] = useState(
    portalSettings?.targetLaunchDate ? portalSettings.targetLaunchDate.slice(0, 16) : '2026-10-01T00:00'
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (portalSettings) {
      setComingSoonActive(portalSettings.comingSoonActive ?? true);
      setAllowBypass(portalSettings.allowBypass ?? true);
      setBypassPasscode(portalSettings.bypassPasscode || 'FOUNDER2026');
      if (portalSettings.targetLaunchDate) {
        setTargetLaunchDate(portalSettings.targetLaunchDate.slice(0, 16));
      }
    }
  }, [portalSettings]);

  const handleSaveGatewaySettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    await updatePortalSettings({
      comingSoonActive,
      allowBypass,
      bypassPasscode,
      targetLaunchDate: new Date(targetLaunchDate).toISOString()
    });
    setIsSavingSettings(false);
  };

  // New Founder Form State
  const [showAddFounder, setShowAddFounder] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [tempPassword, setTempPassword] = useState('Temp#Pass2026');
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showModalTempPassword, setShowModalTempPassword] = useState(false);
  const [createdFounderData, setCreatedFounderData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Strike Form State
  const [selectedFounderId, setSelectedFounderId] = useState('');
  const [strikeRule, setStrikeRule] = useState('02');
  const [strikeReason, setStrikeReason] = useState('');

  // Password Override State
  const [overrideUserId, setOverrideUserId] = useState('');
  const [newOverridePass, setNewOverridePass] = useState('');
  const [showOverridePass, setShowOverridePass] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Temp#';
    for (let i = 0; i < 5; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '!';
    setTempPassword(pass);
    sound.playPop();
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    sound.playPop();
    setTimeout(() => {
      setCopiedField((prev) => (prev === fieldName ? null : prev));
    }, 2500);
  };

  const getDispatchMessage = (data) => {
    if (!data) return '';
    return `🚀 SSA TEAM • FOUNDER WORKSPACE INVITATION

Dear ${data.name},
You have been formally provisioned as ${data.designation} on the SSA TEAM Founders Portal.

🔑 ACCESS CREDENTIALS:
• Portal URL: ${data.portalUrl}
• Login Email: ${data.email}
• Temporary Password: ${data.tempPassword}
${data.phone ? `• Registered Phone: ${data.phone}\n` : ''}
📋 FIRST-TIME ONBOARDING INSTRUCTIONS:
1. Open the Portal URL and sign in using your Login Email and Temporary Password.
2. Set your private, permanent security password.
3. Configure your executive profile.
4. Read and ratify the Founders Bylaws & 2-Strike Charter.

Welcome aboard! Let's build with speed, accountability, and excellence.`;
  };

  const getWhatsAppShareUrl = (data) => {
    if (!data) return '';
    const text = encodeURIComponent(getDispatchMessage(data));
    const cleanPhone = data.phone ? data.phone.replace(/[^0-9]/g, '') : '';
    if (cleanPhone) {
      return `https://wa.me/${cleanPhone}?text=${text}`;
    }
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  const handleCreateFounder = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const res = await createFounder({ 
      name: name.trim(), 
      email: email.trim(), 
      designation: designation.trim() || 'Co-Founder', 
      phone: phone.trim(), 
      tempPassword 
    });
    if (res && res.success) {
      const generatedPass = res.tempPassword || tempPassword;
      setCreatedFounderData({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        designation: designation.trim() || 'Co-Founder',
        phone: phone.trim(),
        tempPassword: generatedPass,
        portalUrl: window.location.origin
      });
      setShowModalTempPassword(true);
      sound.playChime();
      setName('');
      setEmail('');
      setDesignation('');
      setPhone('');
      setTempPassword('Temp#' + Math.random().toString(36).substring(2, 7).toUpperCase() + '!');
      setShowAddFounder(false);
    }
  };

  const handleIssueStrike = async (e) => {
    e.preventDefault();
    if (!selectedFounderId) return;
    await issueStrike(selectedFounderId, { ruleNumber: strikeRule, reason: strikeReason });
    setStrikeReason('');
  };

  const handlePardon = async (fId) => {
    await pardonStrike(fId, 'Executive pardon by Lead Admin upon formal resolution.');
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!overrideUserId || !newOverridePass) return;
    await adminOverridePassword(overrideUserId, newOverridePass);
    setNewOverridePass('');
    setOverrideUserId('');
  };

  const handleBackupDownload = () => {
    window.open('http://localhost:5000/api/admin/backup-export', '_blank');
    sound.playChime();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-28 md:pb-12">
      
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-white text-slate-800 shadow-xs flex items-center justify-between border border-slate-200/90">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 font-mono">
              SSA TEAM Authority
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Super Admin Command Center</h2>
          </div>
        </div>

        <button
          onClick={handleBackupDownload}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md shadow-orange-600/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export 1-Click Backup</span>
        </button>
      </div>

      {/* 0. PORTAL GATEWAY & PUBLIC ACCESS CONTROLS */}
      <div className="p-6 rounded-3xl bg-white border border-orange-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Coming Soon Public Gateway & Access Control</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  comingSoonActive ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                }`}>
                  {comingSoonActive ? 'GATEWAY ACTIVE' : 'OPEN / DIRECT LOGIN'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                When active, visitors see the Warm-Orange countdown gateway. When disabled, portal opens directly to login.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveGatewaySettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Toggle 1: Coming Soon Active / Off */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Coming Soon Gateway</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {comingSoonActive ? 'Locks site behind countdown' : 'Public direct access enabled'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setComingSoonActive(!comingSoonActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  comingSoonActive ? 'bg-orange-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    comingSoonActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Passcode Bypass Allowed */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Passcode Bypass</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {allowBypass ? 'Founders can unlock with code' : 'Passcode unlock disabled'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAllowBypass(!allowBypass)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowBypass ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowBypass ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Input: Bypass Passcode */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <label className="font-bold text-slate-800 block text-xs mb-1">Executive Passcode</label>
              <input
                type="text"
                value={bypassPasscode}
                onChange={(e) => setBypassPasscode(e.target.value)}
                placeholder="e.g. FOUNDER2026"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Input: Target Launch Date */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 md:col-span-2">
              <label className="font-bold text-slate-800 block text-xs mb-1">Target Launch Date & Time</label>
              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={targetLaunchDate}
                  onChange={(e) => setTargetLaunchDate(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full py-2.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all disabled:opacity-50"
              >
                {isSavingSettings ? 'Saving...' : 'Save Gateway Controls'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 1. FOUNDERS LIFECYCLE MANAGEMENT */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Founders Lifecycle & Access Control</h3>
            <p className="text-[11px] text-slate-500">Create accounts with temporary passwords or revoke accounts</p>
          </div>

          <button
            onClick={() => setShowAddFounder(!showAddFounder)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-semibold border border-orange-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Founder</span>
          </button>
        </div>

        {/* Add Founder Form */}
        {showAddFounder && (
          <form onSubmit={handleCreateFounder} className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200/90 space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-orange-100 pb-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-orange-600" />
                <span>Provision New Founder Account</span>
              </h4>
              <span className="text-[10px] text-orange-700 bg-orange-100 font-semibold px-2 py-0.5 rounded-full border border-orange-200">
                Credentials Generated on Submit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@weblets.bond"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Designation / Role <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Growth & Marketing"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number (WhatsApp)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Temporary Password <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 cursor-pointer"
                    title="Generate secure random password"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showTempPassword ? 'text' : 'password'}
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    required
                    className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTempPassword(!showTempPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    tabIndex={-1}
                    title={showTempPassword ? 'Hide password' : 'Show password'}
                  >
                    {showTempPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Founder & Open Dispatch Share Modal</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddFounder(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Founders Table */}
        <div className="space-y-2">
          {founders.map((f) => (
            <div
              key={f.id}
              className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <img src={f.avatar} alt={f.name} className="w-9 h-9 min-w-[36px] max-w-[36px] aspect-square shrink-0 rounded-full object-cover ring-1 ring-slate-200" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{f.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      f.role === 'superadmin' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {f.role === 'superadmin' ? 'Lead Admin' : (f.designation || 'Founder')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{f.email}</p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {f.strikes > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                      {f.strikes} Strike{f.strikes > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => handlePardon(f.id)}
                      className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[10px] border border-emerald-200"
                      title="Pardon 1 Strike"
                    >
                      Pardon Strike
                    </button>
                  </div>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                    0 Strikes (Clean)
                  </span>
                )}

                {f.role !== 'superadmin' && (
                  <button
                    onClick={() => deleteFounder(f.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. DIRECT STRIKE & WARNING DISPATCHER (Rules 01-30) - HIGH DANGER ENFORCEMENT */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-red-50/70 via-white to-rose-50/50 border-2 border-red-300 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-red-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <span>🚨 Formal Disciplinary Strike & Danger Dispatcher</span>
              </h3>
            </div>
            <p className="text-[11px] text-red-700/80 mt-0.5">
              Strict Rule 26 & 28 Enforcement. Strikes immediately trigger siren sound, push urgent notification & post a warning announcement in Founders Group chat.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 shrink-0">
            2-Strike Auto Suspension
          </span>
        </div>

        {/* Active Infractions Watchlist */}
        {founders.some(f => f.strikes > 0) && (
          <div className="p-3.5 rounded-2xl bg-red-100/60 border border-red-300 space-y-2.5 animate-fade-in">
            <span className="text-[10px] font-mono uppercase font-black text-red-800 tracking-wider block">
              ⚠️ Active Infraction Watchlist ({founders.filter(f => f.strikes > 0).length} Founder{founders.filter(f => f.strikes > 0).length > 1 ? 's' : ''})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {founders.filter(f => f.strikes > 0).map(f => (
                <div key={f.id} className="p-3 rounded-xl bg-white border border-red-300 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <img 
                      src={f.avatar} 
                      alt={f.name} 
                      className="w-8 h-8 min-w-[32px] max-w-[32px] aspect-square shrink-0 rounded-full object-cover ring-2 ring-red-500" 
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-900 text-xs truncate">{f.name}</p>
                      <p className="text-[10px] text-red-600 font-bold font-mono">
                        {f.strikes} Strike{f.strikes > 1 ? 's' : ''} ({f.status === 'suspended' ? '⛔ SUSPENDED' : '⚠️ AT RISK'})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePardon(f.id)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300 transition-colors shrink-0"
                  >
                    Pardon Strike ✓
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleIssueStrike} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Founder</label>
            <select
              value={selectedFounderId}
              onChange={(e) => setSelectedFounderId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-red-200 bg-white focus:ring-2 focus:ring-red-500 focus:outline-none font-medium"
            >
              <option value="">Select founder...</option>
              {founders.filter(f => f.role === 'founder').map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.strikes} active strikes)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Violated Rule</label>
            <select
              value={strikeRule}
              onChange={(e) => setStrikeRule(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-red-200 bg-white font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="01">Rule 01: Meeting Attendance</option>
              <option value="02">Rule 02: Communication & Calls</option>
              <option value="03">Rule 03: Tasks & Deadlines</option>
              <option value="05">Rule 05: Active Presence</option>
              <option value="06">Rule 06: Meeting Host Ownership</option>
              <option value="09">Rule 09: Domain Shared Expenses</option>
              <option value="16">Rule 16: Device & Access Security</option>
              <option value="26">Rule 26: General Violation</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Violation Justification</label>
            <input
              type="text"
              value={strikeReason}
              onChange={(e) => setStrikeReason(e.target.value)}
              placeholder="e.g. Unnotified absence / delayed commit"
              required
              className="w-full px-3 py-2 rounded-xl border border-red-200 bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold transition-all shadow-md shadow-red-600/30 cursor-pointer"
            >
              Dispatch Formal Strike 🚨
            </button>
          </div>
        </form>
      </div>

      {/* 3. UNIVERSAL ADMIN PASSWORD OVERRIDE */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Universal Admin Password Override</h3>
          <p className="text-[11px] text-slate-500">Reset your own password or any founder's password without verification delays</p>
        </div>

        <form onSubmit={handleOverrideSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Account</label>
            <select
              value={overrideUserId}
              onChange={(e) => setOverrideUserId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Select account to override...</option>
              {founders.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Encrypted Password</label>
            <div className="relative">
              <input
                type={showOverridePass ? 'text' : 'password'}
                value={newOverridePass}
                onChange={(e) => setNewOverridePass(e.target.value)}
                placeholder="New password (min 6 chars)..."
                required
                className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowOverridePass(!showOverridePass)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                tabIndex={-1}
                title={showOverridePass ? 'Hide password' : 'Show password'}
              >
                {showOverridePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold transition-all shadow-md shadow-orange-600/20 cursor-pointer"
            >
              Apply Instant Password Override
            </button>
          </div>
        </form>
      </div>

      {/* 4. FOUNDER CREDENTIAL SHARE & DISPATCH POPUP MODAL */}
      {createdFounderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in text-slate-800">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-orange-200/90 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Founder Account Provisioned!</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300">
                      DISPATCH READY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Share or copy these login credentials to dispatch to the founder immediately.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedFounderData(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Credentials Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Founder Name:</span>
                <span className="font-bold text-slate-900">{createdFounderData.name}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Designation:</span>
                <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  {createdFounderData.designation}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Login Email:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-800 font-semibold">{createdFounderData.email}</span>
                  <button
                    onClick={() => copyToClipboard(createdFounderData.email, 'email')}
                    className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              {createdFounderData.phone && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <span className="text-slate-500 font-medium">Phone (WhatsApp):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-800">{createdFounderData.phone}</span>
                    <button
                      onClick={() => copyToClipboard(createdFounderData.phone, 'phone')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 font-medium">Temporary Password:</span>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                  <span className="font-mono font-bold text-amber-900 text-xs select-all">
                    {showModalTempPassword ? createdFounderData.tempPassword : '••••••••••••'}
                  </span>
                  <button
                    onClick={() => setShowModalTempPassword(!showModalTempPassword)}
                    className="p-1 text-amber-700 hover:text-amber-900 cursor-pointer"
                    title={showModalTempPassword ? 'Hide password' : 'Show password'}
                  >
                    {showModalTempPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(createdFounderData.tempPassword, 'password')}
                    className="p-1 text-amber-700 hover:text-amber-900 cursor-pointer"
                    title="Copy Password"
                  >
                    {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Formatted Dispatch Message Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-orange-600" />
                  <span>Pre-Formatted Executive Dispatch Message</span>
                </label>
                <span className="text-[10px] text-slate-400">Ready to send</span>
              </div>
              <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-800 select-all">
                {getDispatchMessage(createdFounderData)}
              </pre>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => copyToClipboard(getDispatchMessage(createdFounderData), 'full_message')}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedField === 'full_message' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied Dispatch Message to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Dispatch Message</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={getWhatsAppShareUrl(createdFounderData)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setCreatedFounderData(null)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Done / Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
