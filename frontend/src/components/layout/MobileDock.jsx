import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Plus, 
  MessageSquare, 
  MoreHorizontal, 
  Briefcase, 
  Calendar, 
  BookOpen, 
  ShieldCheck, 
  LogOut, 
  X,
  Sparkles,
  UserCheck,
  GitPullRequest
} from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const MobileDock = ({ onOpenCreateTask, onOpenNewClient, onOpenScheduleModal }) => {
  const { currentTab, setCurrentTab, currentUser, messages, logout, unreadMessagesCount, pendingRequestsCount } = usePortal();

  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  // When in Chat view, the dock auto-hides for 100% WhatsApp immersion
  const isHidden = currentTab === 'chat';

  const handleTabClick = (tabId) => {
    sound.playPop();
    setCurrentTab(tabId);
    setShowMoreDrawer(false);
    setShowActionSheet(false);
  };

  return (
    <>
      {/* Floating Minimal Light Mobile Dock */}
      <div 
        className={`md:hidden fixed bottom-3 left-0 right-0 z-40 flex justify-center px-4 transition-all duration-300 pointer-events-none ${
          isHidden ? 'translate-y-28 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <nav className="pointer-events-auto flex items-center justify-around bg-white/95 backdrop-blur-2xl px-2 py-1.5 rounded-full shadow-dock border border-slate-200/90 max-w-sm w-full">
          
          {/* Tab 1: Home / Dashboard */}
          <button
            data-tour="dock-home"
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
              currentTab === 'dashboard'
                ? 'text-orange-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] tracking-tight mt-0.5">Home</span>
          </button>

          {/* Tab 2: Tasks */}
          <button
            data-tour="dock-tasks"
            onClick={() => handleTabClick('tasks')}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
              currentTab === 'tasks'
                ? 'text-orange-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CheckSquare className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] tracking-tight mt-0.5">Tasks</span>
          </button>

          {/* CENTER: Floating Premium Circle PLUS (+) Button */}
          <button
            data-tour="action-create"
            onClick={() => {
              sound.unlockAudio();
              sound.playPop();
              setShowActionSheet(true);
            }}
            aria-label="Quick Actions"
            className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl shadow-orange-600/30 ring-4 ring-white flex items-center justify-center -translate-y-3 active:scale-90 transition-all cursor-pointer group"
          >
            <Plus className="w-6 h-6 stroke-[2.2] group-hover:rotate-90 transition-transform duration-200" />
          </button>

          {/* Tab 3: Chat with Unread Badge */}
          <button
            data-tour="dock-chat"
            onClick={() => handleTabClick('chat')}
            className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
              currentTab === 'chat'
                ? 'text-orange-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 stroke-[1.8]" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-bold ring-2 ring-white shadow-xs animate-pulse font-mono">
                  {unreadMessagesCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Chat</span>
          </button>

          {/* Tab 4: More (•••) */}
          <button
            data-tour="dock-more"
            onClick={() => {
              sound.unlockAudio();
              sound.playPop();
              setShowMoreDrawer(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
              showMoreDrawer
                ? 'text-orange-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] tracking-tight mt-0.5">More</span>
          </button>

        </nav>
      </div>

      {/* Quick Action Bottom Sheet (Triggered by Center Plus Button) */}
      {showActionSheet && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Quick Creator Actions</h3>
              </div>
              <button 
                onClick={() => setShowActionSheet(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setShowActionSheet(false);
                  onOpenCreateTask && onOpenCreateTask();
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition-all"
              >
                <CheckSquare className="w-5 h-5 text-blue-600 mb-1" />
                <p className="text-xs font-bold text-slate-800">New Task</p>
                <p className="text-[10px] text-slate-400">Sprint deliverable</p>
              </button>

              <button
                onClick={() => {
                  setShowActionSheet(false);
                  onOpenNewClient && onOpenNewClient();
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition-all"
              >
                <Briefcase className="w-5 h-5 text-emerald-600 mb-1" />
                <p className="text-xs font-bold text-slate-800">Client Project</p>
                <p className="text-[10px] text-slate-400">Vault & pipeline</p>
              </button>

              <button
                onClick={() => {
                  setShowActionSheet(false);
                  setCurrentTab('chat');
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left transition-all"
              >
                <MessageSquare className="w-5 h-5 text-indigo-600 mb-1" />
                <p className="text-xs font-bold text-slate-800">Send Direct DM</p>
                <p className="text-[10px] text-slate-400">1-on-1 private chat</p>
              </button>

              <button
                onClick={() => {
                  setShowActionSheet(false);
                  onOpenScheduleModal && onOpenScheduleModal();
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-left transition-all"
              >
                <Calendar className="w-5 h-5 text-amber-600 mb-1" />
                <p className="text-xs font-bold text-slate-800">Sync Schedule</p>
                <p className="text-[10px] text-slate-400">Delegate meet host</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* More Options Bottom Drawer (Triggered by More Tab) */}
      {showMoreDrawer && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 space-y-4 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Executive Portals</h3>
                <p className="text-[10px] text-slate-400">Weblets® × StackAdda™ Charter v2.0</p>
              </div>
              <button 
                onClick={() => setShowMoreDrawer(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => handleTabClick('profile')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-orange-50/80 hover:bg-orange-100 text-left text-xs font-bold text-orange-900 transition-colors border border-orange-200 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser?.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-orange-400"
                  />
                  <span>My Executive Profile & Settings</span>
                </div>
                <span className="text-[10px] text-orange-700 font-mono font-bold">Edit →</span>
              </button>

              <button
                onClick={() => handleTabClick('requests')}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GitPullRequest className="w-4 h-4 text-amber-600" />
                  <span>Requests Hub (Approvals & Proofs)</span>
                </div>
                {pendingRequestsCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs font-mono">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('projects')}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Client Projects Hub & Vault</span>
              </button>

              <button
                onClick={() => handleTabClick('meetings')}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 transition-colors"
              >
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Meetings & Host Radar</span>
              </button>

              <button
                onClick={() => handleTabClick('rules')}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-left text-xs font-semibold text-slate-700 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Strict Rules Charter (30 Rules & Seals)</span>
              </button>

              {currentUser?.role === 'superadmin' && (
                <button
                  onClick={() => handleTabClick('admin')}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-blue-50/60 hover:bg-blue-50 text-left text-xs font-semibold text-blue-800 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Admin Command Center</span>
                </button>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowMoreDrawer(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-rose-50 text-left text-xs font-semibold text-rose-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
