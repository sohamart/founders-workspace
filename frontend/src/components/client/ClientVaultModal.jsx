import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  X, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Copy, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Plus, 
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const ClientVaultModal = ({ project, onClose }) => {
  const { 
    currentUser, 
    addCredential, 
    approveCredential, 
    revealCredential 
  } = usePortal();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [service, setService] = useState('cPanel Hosting');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revealed passwords state: { [credId]: string }
  const [revealedPasswords, setRevealedPasswords] = useState({});

  const isAdmin = currentUser?.role === 'superadmin';

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!title || !username || !password) return;
    setIsSubmitting(true);
    await addCredential(project.id, { title, service, username, password, url });
    setIsSubmitting(false);
    setTitle('');
    setUsername('');
    setPassword('');
    setUrl('');
    setShowAddForm(false);
  };

  const handleReveal = async (credId) => {
    if (revealedPasswords[credId]) {
      // Toggle off
      const copy = { ...revealedPasswords };
      delete copy[credId];
      setRevealedPasswords(copy);
      return;
    }

    const res = await revealCredential(project.id, credId);
    if (res.success) {
      sound.playPop();
      setRevealedPasswords({ ...revealedPasswords, [credId]: res.password });
      // Auto-mask after 12 seconds for high security
      setTimeout(() => {
        setRevealedPasswords(prev => {
          const updated = { ...prev };
          delete updated[credId];
          return updated;
        });
      }, 12000);
    }
  };

  const handleCopyPassword = async (credId) => {
    const res = await revealCredential(project.id, credId);
    if (res.success) {
      navigator.clipboard.writeText(res.password);
      sound.playChime();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-center shadow-sm">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {project.name} • Credential Vault
              </h3>
              <p className="text-[11px] text-slate-500">
                Encrypted cPanel, WordPress, & API Logins (Rule 18 Compliant)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 text-xs">
          
          {/* Security Alert Notice */}
          <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200/80 text-orange-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Security Protocol</strong>: New credentials require Super Admin verification before they can be unlocked for assigned founders. Password reveals are masked and automatically cleared after 12 seconds.
            </p>
          </div>

          {/* Add Credential Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-orange-400 bg-orange-50/30 hover:bg-orange-50 text-orange-800 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Stage New Client Credential to Vault</span>
            </button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">New Vault Entry</span>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Production cPanel"
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="cPanel, WordPress, Stripe"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username / Identifier</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin or key ID"
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password / Secret Key</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Login URL (Optional)</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold transition-all shadow-md shadow-orange-600/20 cursor-pointer"
              >
                {isSubmitting ? 'Staging Credential...' : 'Save to Vault'}
              </button>
            </form>
          )}

          {/* Credentials List */}
          <div className="space-y-2.5">
            {project.credentials && project.credentials.length > 0 ? (
              project.credentials.map((cred) => {
                const isApproved = cred.status === 'approved';
                const isRevealed = !!revealedPasswords[cred.id];

                return (
                  <div
                    key={cred.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 transition-all space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{cred.title}</h4>
                        <span className="text-[10px] text-orange-700 font-medium">{cred.service}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isApproved ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Pending Admin Verification</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Username & URL */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-sans">Username</span>
                        <span className="font-semibold text-slate-800 truncate">{cred.username}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-sans">Login Link</span>
                        {cred.url ? (
                          <a href={cred.url} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline flex items-center gap-1 truncate font-sans">
                            <span className="truncate">Open Portal</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic font-sans">None</span>
                        )}
                      </div>
                    </div>

                    {/* Password Field with Masking */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="font-mono text-xs font-semibold text-slate-800">
                        {isRevealed ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {revealedPasswords[cred.id]}
                          </span>
                        ) : (
                          <span className="tracking-widest text-slate-400">••••••••••••</span>
                        )}
                      </div>

                      {isApproved ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleReveal(cred.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                            title={isRevealed ? "Hide Password" : "Show Password (12s)"}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(cred.id)}
                            className="p-1.5 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-800 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                            title="Copy Password"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>
                        </div>
                      ) : (
                        isAdmin && (
                          <button
                            type="button"
                            onClick={() => approveCredential(project.id, cred.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-sm"
                          >
                            Approve & Unlock
                          </button>
                        )
                      )}
                    </div>

                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">
                No credentials staged for this client yet.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
