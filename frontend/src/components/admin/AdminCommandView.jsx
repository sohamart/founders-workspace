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
  Calendar
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

  // Strike Form State
  const [selectedFounderId, setSelectedFounderId] = useState('');
  const [strikeRule, setStrikeRule] = useState('02');
  const [strikeReason, setStrikeReason] = useState('');

  // Password Override State
  const [overrideUserId, setOverrideUserId] = useState('');
  const [newOverridePass, setNewOverridePass] = useState('');

  const handleCreateFounder = async (e) => {
    e.preventDefault();
    if (!name || !email) return;
    const res = await createFounder({ name, email, designation, phone, tempPassword });
    if (res.success) {
      setName('');
      setEmail('');
      setDesignation('');
      setPhone('');
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
          <form onSubmit={handleCreateFounder} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in text-xs">
            <h4 className="font-bold text-slate-800">Provision New Founder Account</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@weblets.bond"
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Growth & Marketing"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-sm transition-all"
            >
              Generate Founder Account & Temp Password
            </button>
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
            <input
              type="password"
              value={newOverridePass}
              onChange={(e) => setNewOverridePass(e.target.value)}
              placeholder="New password (min 6 chars)..."
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold transition-all shadow-md shadow-orange-600/20"
            >
              Apply Instant Password Override
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
