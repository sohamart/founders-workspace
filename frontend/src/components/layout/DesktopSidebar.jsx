import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Lock,
  Layers,
  GitPullRequest
} from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const DesktopSidebar = () => {
  const { currentTab, setCurrentTab, currentUser, messages, tasks, meeting, unreadMessagesCount, pendingRequestsCount } = usePortal();

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Executive Overview' },
    { id: 'tasks', label: 'Tasks & Sprints', icon: CheckSquare, desc: 'Kanban & Proofs' },
    { id: 'requests', label: 'Requests Hub', icon: GitPullRequest, desc: currentUser?.role === 'superadmin' ? 'Approve & Activate' : 'My Approvals & Proofs' },
    { id: 'projects', label: 'Client Projects', icon: Briefcase, desc: 'Folders & Vault' },
    { id: 'meetings', label: 'Meetings & Sync', icon: Calendar, desc: 'Host Radar' },
    { id: 'chat', label: 'WhatsApp Chat', icon: MessageSquare, desc: 'Real-time Circle' },
    { id: 'rules', label: 'Strict Rules Charter', icon: BookOpen, desc: '30 Rules & Seals' },
  ];

  if (currentUser?.role === 'superadmin') {
    menuItems.push({
      id: 'admin',
      label: 'Admin Command',
      icon: ShieldCheck,
      badge: 'Admin',
      desc: 'Enforcement & Brand'
    });
  }

  const handleTabClick = (tabId) => {
    sound.playPop();
    setCurrentTab(tabId);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r border-slate-200/90 bg-white/95 backdrop-blur-xl h-full p-4 select-none overflow-y-auto shadow-sm">
      
      {/* Workspace Unified Context & Brand Lockup */}
      <div className="mb-4 p-3.5 rounded-2xl bg-orange-50/50 border border-orange-200/70 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          {/* Dual Brand Mini Pills */}
          <div className="flex items-center gap-1 font-bold tracking-tight">
            <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md text-xs font-mono shadow-xs">
              Weblets®
            </span>
            <span className="text-orange-500 font-bold text-xs">×</span>
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-2 py-0.5 rounded-md text-xs font-mono shadow-xs">
              StackAdda™
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 border-t border-orange-200/60">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Executive Portal</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-orange-700 bg-white px-1.5 py-0.5 rounded border border-orange-200">
            v2.0 STRICT
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-orange-600/70 font-mono mb-2">Main Portals</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 hover:bg-orange-50/70 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-600 transition-colors'}`} />
                <div className="text-left">
                  <div className="font-semibold leading-tight">{item.label}</div>
                  <div className={`text-[10px] ${isActive ? 'text-orange-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </div>
              </div>

              {/* Strict Zero-Phantom Badge */}
              {item.id === 'chat' && unreadMessagesCount > 0 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs animate-pulse">
                  {unreadMessagesCount}
                </span>
              ) : item.id === 'requests' && pendingRequestsCount > 0 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs animate-pulse">
                  {pendingRequestsCount}
                </span>
              ) : item.badge !== undefined && item.badge !== null && item.badge !== 0 ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : item.badge === 'Admin'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Bottom Founder Status Widget */}
      {currentUser && (
        <div className="mt-4 pt-3 border-t border-slate-200/80">
          <div 
            onClick={() => handleTabClick('profile')}
            className={`p-3 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
              currentTab === 'profile'
                ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500/20'
                : 'bg-slate-50 border-slate-200/80 hover:bg-orange-50/50 hover:border-orange-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 min-w-[32px] max-w-[32px] aspect-square rounded-full object-cover ring-1 ring-slate-200 shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-orange-600 font-semibold">View Profile →</span>
                </div>
              </div>
            </div>

            {currentUser.strikes === 0 ? (
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                0 Strikes 🛡️
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200">
                {currentUser.strikes} Strike{currentUser.strikes > 1 ? 's' : ''} ⚠️
              </span>
            )}
          </div>
        </div>
      )}

    </aside>
  );
};
