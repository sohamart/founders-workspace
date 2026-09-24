import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePortal } from '../../context/PortalContext';
import { sound } from '../../utils/soundFx';
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
  Compass,
  X
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
    <header className="shrink-0 relative z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-2.5 sm:px-4 md:px-6 py-2 sm:py-2.5 transition-all shadow-xs">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-1.5 sm:gap-4 w-full">
        
        {/* Left: Mobile Brand or Desktop Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Only Brand Lockup */}
          <div 
            data-tour="brand-logo"
            onClick={() => setCurrentTab('dashboard')}
            className="flex md:hidden items-center gap-1 cursor-pointer font-bold tracking-tight shrink-0"
          >
            <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded-md text-[10px] font-mono shadow-xs">
              Weblets®
            </span>
            <span className="text-orange-500 font-bold text-[10px]">×</span>
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-1.5 py-0.5 rounded-md text-[10px] font-mono shadow-xs">
              StackAdda™
            </span>
          </div>

          {/* Desktop Breadcrumb & Current Portal Title */}
          <div data-tour="brand-logo" className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Founders Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
              {tabLabels[currentTab] || 'Command Center'}
            </span>
          </div>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
          
          {/* Interactive Workspace Tour Button */}
          <button
            data-tour="header-tour"
            onClick={(e) => {
              e.stopPropagation();
              sound.unlockAudio();
              sound.playPop();
              if (onStartTour) onStartTour();
            }}
            title="Take Guided Product Tour"
            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 hover:border-orange-400 text-orange-900 transition-all text-[11px] sm:text-xs font-bold cursor-pointer shadow-xs hover:shadow-sm shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-spin-slow shrink-0" />
            <span className="hidden sm:inline">Tour</span>
          </button>

          {/* Sound Toggle */}
          <button
            data-tour="header-sound"
            onClick={(e) => {
              e.stopPropagation();
              sound.unlockAudio();
              toggleMuteSound();
            }}
            title={isMuted ? "Sound Muted (Click to Unmute)" : "Sound Active (Click to Mute)"}
            className={`p-1.5 sm:p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
              isMuted
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                : 'text-orange-600 bg-orange-50 border border-orange-200/80 hover:bg-orange-100/80 shadow-xs'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-orange-600" />}
          </button>

          {/* WhatsApp Chat Quick Launch (desktop/tablet; mobile dock already has Chat) */}
          <button
            data-tour="header-chat"
            onClick={() => setCurrentTab('chat')}
            className={`hidden sm:flex relative p-1.5 sm:p-2 rounded-xl transition-all shrink-0 ${
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
            data-tour="header-notifications"
            onClick={onOpenNotifications}
            className="relative p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-orange-50 transition-colors shrink-0"
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
            <div className="relative shrink-0" data-tour="header-profile">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-0.5 sm:p-1 sm:pl-2.5 rounded-full border border-slate-200 bg-white hover:border-orange-300 transition-all shadow-xs"
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

                <div className="relative shrink-0">
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

              {/* Profile Dropdown / Mobile Drawer (Mounted in Portal with Highest Z-Index) */}
              {profileDropdownOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99990] flex items-end sm:items-start justify-center sm:justify-end select-none">
                  {/* High-Z Global Backdrop */}
                  <div 
                    className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200" 
                    onClick={() => setProfileDropdownOpen(false)} 
                  />

                  {/* Drawer Content */}
                  <div className="relative z-[99995] w-full sm:w-72 bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl p-4 sm:p-3 sm:mt-14 sm:mr-4 md:mr-6 animate-slide-up sm:animate-fade-in max-h-[85vh] overflow-y-auto">
                    {/* Mobile Drawer Grab Bar & Close */}
                    <div className="flex sm:hidden items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />
                      <button 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

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
                </div>,
                document.body
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
