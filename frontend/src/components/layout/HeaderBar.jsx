import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  LogOut, 
  ShieldCheck, 
  AlertTriangle,
  Radio,
  UserCheck,
  MessageSquare,
  Sparkles,
  Compass
} from 'lucide-react';

export const HeaderBar = ({ onOpenNotifications, onStartTour }) => {
  const { 
    currentUser, 
    currentTab,
    setCurrentTab,
    logout, 
    isMuted, 
    toggleMuteSound, 
    notifications,
    unreadNotificationsCount,
    uploadFile, 
    updateProfile,
    unreadMessagesCount
  } = usePortal();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      const res = await uploadFile(file, 'founders/avatars', 'image');
      if (res.success && res.url) {
        await updateProfile({ avatar: res.url });
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const tabLabels = {
    dashboard: 'Executive Dashboard',
    tasks: 'Tasks & Sprints Radar',
    requests: 'Requests Hub',
    projects: 'Client Web Projects Hub',
    meetings: 'Meetings & Sync Radar',
    chat: 'WhatsApp Team Chat',
    rules: 'Strict Rules Charter v2.0',
    admin: 'Admin Command Center',
    profile: 'Executive Profile & Settings'
  };

  return (
    <header className="shrink-0 relative z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 md:px-6 py-2.5 transition-all shadow-xs">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Mobile Brand or Desktop Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile Only Brand Lockup */}
          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="flex md:hidden items-center gap-1.5 cursor-pointer font-bold tracking-tight"
          >
            <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md text-xs font-mono shadow-xs">
              Weblets®
            </span>
            <span className="text-orange-500 font-bold text-xs">×</span>
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-2 py-0.5 rounded-md text-xs font-mono shadow-xs">
              StackAdda™
            </span>
          </div>

          {/* Desktop Breadcrumb & Current Portal Title */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Founders Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
              {tabLabels[currentTab] || 'Command Center'}
            </span>
          </div>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* Interactive Workspace Tour Button */}
          <button
            onClick={onStartTour}
            title="Take Guided Product Tour"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 hover:border-orange-400 text-orange-900 transition-all text-xs font-bold cursor-pointer shadow-xs hover:shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-spin-slow shrink-0" />
            <span className="hidden sm:inline">Tour</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleMuteSound}
            title={isMuted ? "Sound Muted (Click to Unmute)" : "Sound Active"}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-orange-50 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-orange-600" />}
          </button>

          {/* WhatsApp Chat Quick Launch with Live Unread Badge */}
          <button
            onClick={() => setCurrentTab('chat')}
            className={`relative p-2 rounded-xl transition-all ${
              currentTab === 'chat'
                ? 'bg-orange-50 text-orange-600'
                : 'text-slate-500 hover:text-slate-800 hover:bg-orange-50'
            }`}
            title="Open WhatsApp Chat"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold ring-2 ring-white shadow-xs animate-pulse font-mono">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-orange-50 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold ring-2 ring-white shadow-xs animate-pulse font-mono">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2.5 rounded-full border border-slate-200 bg-white hover:border-orange-300 transition-all shadow-xs"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 flex items-center justify-end gap-1">
                    {currentUser.name}
                    {currentUser.role === 'superadmin' ? (
                      <ShieldCheck className="w-3 h-3 text-orange-600" />
                    ) : (
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize font-medium">
                    {currentUser.role === 'superadmin' ? 'Lead Admin' : (currentUser.designation || 'Founder')}
                  </div>
                </div>

                <div className="relative">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 min-w-[28px] max-w-[28px] aspect-square rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        currentUser.role === 'superadmin' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {currentUser.role === 'superadmin' ? 'Super Admin' : 'Active Founder'}
                      </span>
                      {currentUser.strikes > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {currentUser.strikes} Strike{currentUser.strikes > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cloudinary Profile Avatar Upload */}
                  <div className="p-2 border-b border-slate-100">
                    <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold cursor-pointer border border-slate-200 transition-colors">
                      <span>📷 Upload Cloudinary Avatar</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarChange}
                        disabled={isUploadingAvatar}
                      />
                    </label>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setCurrentTab('profile');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-orange-800 bg-orange-50/80 hover:bg-orange-100 rounded-xl transition-colors flex items-center gap-2 mb-1"
                    >
                      <span>👤 View & Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setCurrentTab('rules');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <span>📜 View Signed Charter</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onStartTour) onStartTour();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-orange-700 hover:bg-orange-50 rounded-xl transition-colors flex items-center gap-2 font-medium"
                    >
                      <span>✨ Take Interactive Tour</span>
                    </button>
                    {currentUser.role === 'superadmin' && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setCurrentTab('admin');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <span>⚙️ Admin Command Center</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setCurrentTab('login')}
              className="text-xs font-semibold px-4 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
            >
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
