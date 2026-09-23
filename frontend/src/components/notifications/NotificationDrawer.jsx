import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Clock, 
  CheckCheck, 
  Trash2, 
  ShieldCheck, 
  GitPullRequest,
  MessageSquare
} from 'lucide-react';

export const NotificationDrawer = ({ onClose }) => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    clearNotifications, 
    auditLogs,
    setCurrentTab 
  } = usePortal();

  const [activeTab, setActiveTab] = useState('alerts'); // alerts | audit

  const getIcon = (type) => {
    switch (type) {
      case 'task':
        return <GitPullRequest className="w-4 h-4 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in text-slate-800">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl p-5 flex flex-col justify-between border-l border-slate-200">
        
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">Notifications</h3>
                <p className="text-[11px] text-slate-500">Live portal alerts & approvals</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'alerts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Alerts</span>
              {unreadNotificationsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold font-mono">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Audit Trail
            </button>
          </div>

          {/* Action Bar for Alerts */}
          {activeTab === 'alerts' && notifications.length > 0 && (
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <button
                onClick={() => markNotificationAsRead(null)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
              <button
                onClick={clearNotifications}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            </div>
          )}

          {/* Content Lists */}
          <div className="space-y-2 max-h-[68vh] overflow-y-auto pr-1">
            {activeTab === 'alerts' ? (
              notifications && notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) markNotificationAsRead(notif.id);
                      onClose();
                      if (notif.linkTab) {
                        setCurrentTab(notif.linkTab);
                      } else if (
                        notif.type === 'task' || 
                        notif.type === 'warning' || 
                        notif.title?.includes('Handover') || 
                        notif.title?.includes('Blocker') || 
                        notif.title?.includes('Extension') ||
                        notif.title?.includes('Transfer')
                      ) {
                        setCurrentTab('requests');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                      notif.read
                        ? 'bg-white border-slate-200/80 text-slate-600 opacity-80'
                        : 'bg-orange-50/40 border-orange-200 text-slate-900 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className={`text-xs truncate ${notif.read ? 'font-medium text-slate-800' : 'font-bold text-slate-900'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                          )}
                        </div>
                        {notif.message && (
                          <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                            {notif.message}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                          {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (notif.time || 'Just now')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 space-y-1">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5]" />
                  <p className="text-xs font-semibold">No notifications</p>
                  <p className="text-[11px]">You're completely caught up!</p>
                </div>
              )
            ) : (
              auditLogs && auditLogs.length > 0 ? (
                auditLogs.slice(0, 20).map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="font-bold text-slate-700 uppercase">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-700 text-xs leading-snug">{log.details}</p>
                    <p className="text-[10px] text-slate-400 italic">By: {log.actor}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-10">
                  No recent audit activity logged.
                </p>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
