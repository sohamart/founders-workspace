import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../api/client';
import { sound } from '../utils/soundFx';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const PortalContext = createContext(null);

export const PortalProvider = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('founders_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('founders_token') || null);
  const [isBypassed, setIsBypassed] = useState(() => {
    try {
      const saved = localStorage.getItem('founders_user');
      const u = saved ? JSON.parse(saved) : null;
      if (u && u.role === 'superadmin') return true;
      const cached = localStorage.getItem('founders_portal_settings');
      if (cached) {
        const s = JSON.parse(cached);
        if (s.comingSoonActive === false) return true;
        if (s.allowBypass !== false && localStorage.getItem('founders_bypassed') === 'true') return true;
        return false;
      }
    } catch (e) {}
    return true; // Default true during initial boot check so Coming Soon never flickers
  });
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(() => {
    return !!localStorage.getItem('founders_portal_settings');
  });
  const [isSuspended, setIsSuspended] = useState(false);
  const [mustOnboard, setMustOnboard] = useState(false);

  // App UI state with persistent tab tracking (URL hash & localStorage sync)
  const [currentTab, setCurrentTabState] = useState(() => {
    try {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['dashboard', 'tasks', 'projects', 'requests', 'rules', 'meetings', 'chat', 'admin', 'profile'];
      if (hash) {
        if (validTabs.includes(hash)) return hash;
        return '404';
      }
      const saved = localStorage.getItem('founders_active_tab');
      if (saved && validTabs.includes(saved)) return saved;
    } catch (e) {}
    return 'dashboard';
  });

  const setCurrentTab = (tab) => {
    setCurrentTabState(tab);
    try {
      localStorage.setItem('founders_active_tab', tab);
      window.location.hash = tab;
    } catch (e) {}
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['dashboard', 'tasks', 'projects', 'requests', 'rules', 'meetings', 'chat', 'admin', 'profile'];
      if (hash) {
        if (validTabs.includes(hash)) {
          setCurrentTabState(hash);
          localStorage.setItem('founders_active_tab', hash);
        } else {
          setCurrentTabState('404');
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  // Portal Gateway & Launch Settings
  const [portalSettings, setPortalSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('founders_portal_settings');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return {
      comingSoonActive: false,
      allowBypass: true,
      targetLaunchDate: '2026-10-01T00:00:00.000Z',
      bypassPasscode: import.meta.env.VITE_BYPASS_PASSCODE || ''
    };
  });

  // Core Data state
  const [tasks, setTasks] = useState([]);
  const [clientProjects, setClientProjects] = useState([]);
  const [meeting, setMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [rules, setRules] = useState([]);
  const [adminRatification, setAdminRatification] = useState(null);
  const [foundersSignatures, setFoundersSignatures] = useState([]);
  const [founders, setFounders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [inactivityRadar, setInactivityRadar] = useState([]);
  const [securityFreeze, setSecurityFreeze] = useState(false);

  // Notification Engine state (synced with backend /api/notifications)
  const [notifications, setNotifications] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const prevMessagesRef = useRef([]);
  const prevPendingTasksRef = useRef([]);
  const prevReviewPendingTasksRef = useRef([]);
  const prevPendingCredsRef = useRef([]);
  const prevNotificationsRef = useRef(null);
  const toastedNotifIdsRef = useRef(new Set());
  const currentUserRef = useRef(currentUser);
  const currentTabRef = useRef(currentTab);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    currentTabRef.current = currentTab;
  }, [currentTab]);

  const recentToastsRef = useRef(new Map());

  const showToast = useCallback((title, message, type = 'info') => {
    // 1. Strict Deduplication: Ignore identical toast within 2500ms
    const key = `${type}:${title}:${message || ''}`;
    const now = Date.now();
    const lastTime = recentToastsRef.current.get(key) || 0;
    if (now - lastTime < 2500) {
      return;
    }
    recentToastsRef.current.set(key, now);
    if (recentToastsRef.current.size > 50) {
      recentToastsRef.current.clear();
    }

    // 2. When a success action occurs, dismiss previous error toasts immediately
    if (type === 'success') {
      toast.dismiss();
    }

    if (type === 'warning' || type === 'error') {
      sound.playWarning();
    } else {
      sound.playPop();
    }

    const toastContent = (
      <div className="text-xs">
        <p className="font-bold text-slate-900 leading-tight">{title}</p>
        {message && <p className="text-slate-600 mt-0.5 leading-snug">{message}</p>}
      </div>
    );

    const toastId = `${type}_${title}_${message || ''}`.replace(/[^a-zA-Z0-9]/g, '_');

    const toastConfig = {
      toastId,
      position: 'top-right',
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'light'
    };

    if (type === 'success') {
      toast.success(toastContent, toastConfig);
    } else if (type === 'error') {
      toast.error(toastContent, toastConfig);
    } else if (type === 'warning') {
      toast.warn(toastContent, toastConfig);
    } else {
      toast.info(toastContent, toastConfig);
    }
  }, []);

  // Single-dispatch toast deduplicator for notifications
  const toastNotificationOnce = useCallback((notif) => {
    if (!notif || !notif.id) return;
    if (toastedNotifIdsRef.current.has(notif.id)) return;
    toastedNotifIdsRef.current.add(notif.id);

    const user = currentUserRef.current;
    const isTargetUser = notif.targetUserId ? (notif.targetUserId === user?.id) : true;
    const isTargetRole = notif.targetRole ? (notif.targetRole === 'all' || notif.targetRole === user?.role) : true;
    if (!isTargetUser || !isTargetRole) return;

    if (notif.type === 'strike_issued' || notif.priority === 'urgent' || notif.type === 'warning') {
      sound.playDangerAlarm();
      showToast(notif.title || '🚨 Alert', notif.message || notif.desc, 'warning');
    } else if (notif.type === 'success') {
      sound.playChime();
      showToast(notif.title || 'Success', notif.message || notif.desc, 'success');
    } else {
      sound.playNotification();
      showToast(notif.title || 'Notification', notif.message || notif.desc, notif.type || 'info');
    }
  }, [showToast]);

  // Fetch all live data from backend API
  const refreshData = useCallback(async () => {
    try {
      const user = currentUserRef.current;

      // 1. Fetch tasks
      const tasksRes = await apiClient.get('/tasks').catch(() => ({ data: { tasks: [] } }));
      if (tasksRes.data && tasksRes.data.tasks) {
        const fetchedTasks = tasksRes.data.tasks;
        setTasks(fetchedTasks);

        // Check for new requests / status changes
        if (user) {
          if (user.role === 'superadmin') {
            // Admin: Check for new task creation requests submitted by founders
            const currentPending = fetchedTasks.filter(t => t.status === 'pending_approval' || t.approvalStatus === 'pending');
            if (prevPendingTasksRef.current.length > 0) {
              const newRequests = currentPending.filter(t => 
                !prevPendingTasksRef.current.some(p => p.id === t.id) &&
                t.requesterId !== user.id
              );

              if (newRequests.length > 0) {
                const latest = newRequests[newRequests.length - 1];
                sound.playNotification();
                showToast(
                  '🛡️ Task Creation Request',
                  `Founder ${latest.requesterName || ''} requested approval for "${latest.title}".`,
                  'info'
                );
                setNotifications(prev => [
                  {
                    id: `notif_${Date.now()}`,
                    title: `Task Request: ${latest.title}`,
                    desc: `Requested by ${latest.requesterName || 'Founder'}`,
                    time: 'Just now',
                    type: 'task',
                    read: false
                  },
                  ...prev
                ]);
              }
            }
            prevPendingTasksRef.current = currentPending;

            // Admin: Check for new Progress Proof Review requests
            const currentProofReview = fetchedTasks.filter(t => t.status === 'review_pending');
            if (prevReviewPendingTasksRef.current.length > 0) {
              const newProofs = currentProofReview.filter(t => 
                !prevReviewPendingTasksRef.current.some(p => p.id === t.id)
              );

              if (newProofs.length > 0) {
                const latestProof = newProofs[newProofs.length - 1];
                sound.playNotification();
                showToast(
                  '📈 Progress Proof Submitted',
                  `Proof review submitted for "${latestProof.title}".`,
                  'info'
                );
              }
            }
            prevReviewPendingTasksRef.current = currentProofReview;
          } else {
            // Founder: Check if my pending task got approved & activated by Admin
            if (prevPendingTasksRef.current.length > 0) {
              const myNewlyApproved = fetchedTasks.filter(t => 
                (t.requesterId === user.id || (Array.isArray(t.assignedTo) && t.assignedTo.includes(user.id))) &&
                (t.status === 'todo' || t.approvalStatus === 'approved') &&
                prevPendingTasksRef.current.some(p => p.id === t.id && (p.status === 'pending_approval' || p.approvalStatus === 'pending'))
              );

              if (myNewlyApproved.length > 0) {
                const approvedTask = myNewlyApproved[myNewlyApproved.length - 1];
                sound.playSuccess();
                showToast(
                  '✅ Task Approved & Activated',
                  `Lead Admin approved "${approvedTask.title}". Now active on the board!`,
                  'success'
                );
              }
            }
            prevPendingTasksRef.current = fetchedTasks.filter(t => t.status === 'pending_approval' || t.approvalStatus === 'pending');
          }
        }
      }

      // 2. Fetch client projects
      const clientsRes = await apiClient.get('/clients').catch(() => ({ data: { projects: [] } }));
      if (clientsRes.data && clientsRes.data.projects) {
        const fetchedProjects = clientsRes.data.projects;
        setClientProjects(fetchedProjects);

        // Admin: Check for new client credential verification requests
        if (user && user.role === 'superadmin') {
          const currentPendingCreds = fetchedProjects.flatMap(p => 
            (p.credentials || []).map(c => ({ ...c, projectName: p.name }))
          ).filter(c => c.status === 'pending_approval');

          if (prevPendingCredsRef.current.length > 0) {
            const newCreds = currentPendingCreds.filter(c => 
              !prevPendingCredsRef.current.some(p => p.id === c.id) &&
              c.submittedBy !== user.name
            );

            if (newCreds.length > 0) {
              const latestCred = newCreds[newCreds.length - 1];
              sound.playNotification();
              showToast(
                '🔐 Credential Approval Request',
                `New credential submitted in "${latestCred.projectName}" awaiting verification.`,
                'info'
              );
            }
          }
          prevPendingCredsRef.current = currentPendingCreds;
        }
      }

      // 3. Fetch current meeting & full queue
      const meetingRes = await apiClient.get('/meetings/current').catch(() => ({ data: { meeting: null, meetings: [] } }));
      if (meetingRes.data) {
        setMeeting(meetingRes.data.meeting);
        if (Array.isArray(meetingRes.data.meetings)) {
          setMeetings(meetingRes.data.meetings);
        }
      }

      // 4. Fetch chat messages
      const chatRes = await apiClient.get('/chat/messages').catch(() => ({ data: { messages: [] } }));
      if (chatRes.data && Array.isArray(chatRes.data.messages)) {
        const fetchedMsgs = chatRes.data.messages;

        // Check for fresh incoming messages from other founders/admin across ANY page
        if (prevMessagesRef.current && prevMessagesRef.current.length > 0) {
          const freshIncoming = fetchedMsgs.filter(m => 
            !prevMessagesRef.current.some(p => p.id === m.id) &&
            m.senderId !== currentUserRef.current?.id
          );

          if (freshIncoming.length > 0) {
            freshIncoming.forEach(latestMsg => {
              // Only alert if user is not in chat tab
              if (currentTabRef.current !== 'chat') {
                sound.playNotification();
                const content = latestMsg.voiceNoteUrl
                  ? '🎙️ Sent a voice note memo'
                  : latestMsg.mediaUrl
                    ? '📎 Sent an attachment'
                    : latestMsg.text;
                showToast(
                  `💬 ${latestMsg.senderName || 'Team Message'}`,
                  content || 'New message in workspace chat',
                  'info'
                );
              }
            });
          }
        }

        prevMessagesRef.current = fetchedMsgs;
        // Merge fetched messages with any currently sending optimistic messages preserving localId
        setMessages(prev => {
          const localIdMap = new Map();
          prev.forEach(m => {
            if (m.localId && m.id) localIdMap.set(m.id, m.localId);
          });

          const sendingMsgs = prev.filter(m => m.status === 'sending' || (m.id && m.id.startsWith('temp_')));
          const combined = fetchedMsgs.map(fm => {
            if (localIdMap.has(fm.id)) {
              return { ...fm, localId: localIdMap.get(fm.id) };
            }
            return fm;
          });

          sendingMsgs.forEach(sm => {
            if (!combined.some(cm => cm.id === sm.id || (cm.text === sm.text && cm.senderId === sm.senderId))) {
              combined.push(sm);
            }
          });
          return combined;
        });
      }

      // Fetch rules book
      const rulesRes = await apiClient.get('/admin/rules').catch(() => ({ data: {} }));
      if (rulesRes.data) {
        if (rulesRes.data.rules) setRules(rulesRes.data.rules);
        if (rulesRes.data.adminRatification) setAdminRatification(rulesRes.data.adminRatification);
        if (rulesRes.data.foundersSignatures) setFoundersSignatures(rulesRes.data.foundersSignatures);
      }

      // Fetch founders list if admin or user
      const foundersRes = await apiClient.get('/admin/founders').catch(() => null);
      if (foundersRes && foundersRes.data && Array.isArray(foundersRes.data.founders)) {
        setFounders(foundersRes.data.founders);
        if (user) {
          const freshSelf = foundersRes.data.founders.find(f => f.id === user.id);
          if (freshSelf && (
            freshSelf.name !== user.name ||
            freshSelf.avatar !== user.avatar ||
            freshSelf.designation !== user.designation ||
            freshSelf.phone !== user.phone ||
            freshSelf.bio !== user.bio ||
            freshSelf.brand !== user.brand ||
            freshSelf.strikes !== user.strikes ||
            freshSelf.status !== user.status
          )) {
            const merged = { ...user, ...freshSelf };
            setCurrentUser(merged);
            localStorage.setItem('founders_user', JSON.stringify(merged));
          }
        }
      }

      // Fetch persistent notifications
      const notifsRes = await apiClient.get('/notifications').catch(() => ({ data: { notifications: [] } }));
      if (notifsRes.data && notifsRes.data.notifications) {
        const fetchedNotifs = notifsRes.data.notifications;

        // If this is the initial load, seed the toasted set with existing notification IDs so they do not toast on reload
        if (prevNotificationsRef.current === null) {
          fetchedNotifs.forEach(n => toastedNotifIdsRef.current.add(n.id));
        } else if (prevNotificationsRef.current && prevNotificationsRef.current.length > 0) {
          const freshNotifs = fetchedNotifs.filter(n => 
            !prevNotificationsRef.current.some(p => p.id === n.id) && !n.read
          );

          freshNotifs.forEach(notif => {
            toastNotificationOnce(notif);
          });
        }

        prevNotificationsRef.current = fetchedNotifs;
        setNotifications(fetchedNotifs);
      }

      // Fetch live activity stream & audit logs for all founders
      const activityRes = await apiClient.get('/activity').catch(() => ({ data: { activity: [] } }));
      if (activityRes.data && activityRes.data.activity) {
        setAuditLogs(activityRes.data.activity);
      }
    } catch (err) {
      console.error('Error refreshing portal data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Strict bypass evaluator: if admin bypass is off, NO localStorage bypass is honored
  const evaluateBypass = useCallback((settings, user = currentUserRef.current) => {
    // 1. Super Admin is always granted access to govern the workspace
    if (user && user.role === 'superadmin') {
      return true;
    }

    // 2. If Coming Soon is inactive globally, access is open to everyone
    if (settings && settings.comingSoonActive === false) {
      return true;
    }

    // 3. Strictest rule: If Admin bypass is off, NO localStorage bypass is honored!
    // "admin bypass off korle kono localstorage a bypass thakleo bypass hobe na coming soon thakbe"
    if (settings && settings.allowBypass === false) {
      try {
        localStorage.removeItem('founders_bypassed');
      } catch (e) {}
      return false;
    }

    // 4. If Coming Soon is active AND allowBypass is ON (true):
    // Allow if user has valid passcode bypass saved in browser
    return localStorage.getItem('founders_bypassed') === 'true';
  }, []);

  const fetchPortalSettings = useCallback(async () => {
    try {
      const res = await apiClient.get('/admin/settings');
      if (res.data && res.data.settings) {
        const s = res.data.settings;
        setPortalSettings(s);
        try {
          localStorage.setItem('founders_portal_settings', JSON.stringify(s));
        } catch (err) {}
        const shouldBypass = evaluateBypass(s, currentUserRef.current);
        setIsBypassed(shouldBypass);
      }
    } catch (e) {
      console.warn('Failed to load portal settings:', e);
    } finally {
      setIsSettingsLoaded(true);
    }
  }, [evaluateBypass]);

  // Check current user session on boot
  useEffect(() => {
    const initAuth = async () => {
      await fetchPortalSettings();
      const storedToken = localStorage.getItem('founders_token');
      if (storedToken) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data.success && res.data.user) {
            let finalUser = res.data.user;
            try {
              const savedUser = JSON.parse(localStorage.getItem('founders_user') || '{}');
              if (savedUser.avatar && savedUser.avatar !== res.data.user.avatar && (savedUser.avatar.includes('cloudinary') || savedUser.avatar.startsWith('data:'))) {
                finalUser = { ...res.data.user, avatar: savedUser.avatar };
                apiClient.put('/auth/profile', { avatar: savedUser.avatar }).catch(() => {});
              }
            } catch (err) {}
            setCurrentUser(finalUser);
            currentUserRef.current = finalUser;
            localStorage.setItem('founders_user', JSON.stringify(finalUser));
            setIsSuspended(finalUser.status === 'suspended');
            setMustOnboard(finalUser.mustChangePassword);
            setIsBypassed(evaluateBypass(portalSettings, finalUser));
          }
        } catch (e) {
          // Token invalid or suspended
          if (e.response && e.response.status === 403 && e.response.data.isSuspended) {
            setIsSuspended(true);
          }
        }
      }
      refreshData();
    };
    initAuth();
  }, [refreshData, fetchPortalSettings, evaluateBypass]);

  // Periodic polling for realtime updates (fast 3.5s for instant chat & task sync)
  useEffect(() => {
    const interval = setInterval(() => {
      if (token) {
        refreshData();
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [token, refreshData]);

  // Real-time WebSocket Connection via Socket.io
  const socketRef = useRef(null);

  useEffect(() => {
    let socketUrl = '';
    const isLocalNetwork = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.startsWith('192.168.') ||
       window.location.hostname.startsWith('10.') ||
       /^172\.(1[6-9]|2\d|3[01])\./.test(window.location.hostname));

    if (isLocalNetwork) {
      socketUrl = `http://${window.location.hostname}:5000`;
    } else {
      // Live production environment (e.g. founderwork.weblets.bond)
      // Must connect to Render backend unless a non-localhost custom socket URL is explicitly given
      const customSocket = (import.meta.env.VITE_SOCKET_URL || '').trim();
      const customApi = (import.meta.env.VITE_API_URL || '').trim();

      if (customSocket && !customSocket.includes('localhost')) {
        socketUrl = customSocket;
      } else if (customApi && !customApi.includes('localhost')) {
        socketUrl = customApi.replace(/\/api\/?$/, '');
      } else {
        socketUrl = 'https://founders-workspace.onrender.com';
      }
    }
    socketUrl = socketUrl.replace(/\/$/, '');

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 25,
      reconnectionDelay: 1500,
      timeout: 10000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Real-time Socket.io connected:', socket.id);
    });

    socket.on('new_message', (newMsg) => {
      if (!newMsg || !newMsg.id) return;

      setMessages(prev => {
        // If already in list with exact ID, don't duplicate
        if (prev.some(m => m.id === newMsg.id)) return prev;

        // If this is the sender's own pending message, replace the temp message preserving localId
        if (newMsg.senderId === currentUserRef.current?.id) {
          const tempIdx = prev.findIndex(m => 
            (m.id && m.id.startsWith('temp_') && m.text === newMsg.text) || 
            (m.localId && m.text === newMsg.text)
          );
          if (tempIdx !== -1) {
            const next = [...prev];
            next[tempIdx] = { ...newMsg, localId: prev[tempIdx].localId || prev[tempIdx].id };
            return next;
          }
        }
        return [...prev, newMsg];
      });

      // Avoid duplicate alert toast during periodic polling
      if (prevMessagesRef.current && !prevMessagesRef.current.some(m => m.id === newMsg.id)) {
        prevMessagesRef.current = [...prevMessagesRef.current, newMsg];
      }

      // If message is from another user
      if (newMsg.senderId !== currentUserRef.current?.id) {
        sound.playNotification();
        // Only show toast if user is NOT currently looking at the chat screen
        if (currentTabRef.current !== 'chat') {
          showToast(
            `💬 ${newMsg.senderName || 'Team Message'}`,
            newMsg.text || (newMsg.mediaUrl ? '📎 Sent media attachment' : 'Sent a chat message'),
            'info'
          );
        }
      }
    });

    socket.on('messages_read', ({ channel, recipientId, readBy }) => {
      setMessages(prev => prev.map(m => {
        if (recipientId) {
          if (m.recipientId === readBy && m.senderId === recipientId) {
            return { ...m, status: 'read' };
          }
        } else if (channel === 'group') {
          if (!m.recipientId && m.senderId !== readBy) {
            return { ...m, status: 'read' };
          }
        }
        return m;
      }));
    });

    const handleIncomingNotification = (notif) => {
      if (!notif) return;
      const user = currentUserRef.current;
      
      // Determine if notification is relevant to current user
      const isTargetUser = notif.targetUserId ? (notif.targetUserId === user?.id) : true;
      const isTargetRole = notif.targetRole ? (notif.targetRole === 'all' || notif.targetRole === user?.role) : true;
      
      if (!isTargetUser || !isTargetRole) return;

      // Add to notifications list without duplicate
      setNotifications(prev => {
        if (prev.some(n => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });

      // Deduplicated single toast dispatch
      toastNotificationOnce(notif);
    };

    socket.on('new_notification', handleIncomingNotification);

    socket.on('new_activity', (newLog) => {
      if (!newLog) return;
      setAuditLogs(prev => {
        const existing = prev || [];
        if (existing.some(l => l.id === newLog.id)) return existing;
        return [newLog, ...existing];
      });
    });

    socket.on('task_updated', (data) => {
      refreshData();
    });

    socket.on('notification_read', ({ id, all }) => {
      setNotifications(prev => prev.map(n => (all || n.id === id ? { ...n, read: true } : n)));
    });

    socket.on('notifications_cleared', () => {
      setNotifications([]);
    });

    socket.on('settings_updated', (newSettings) => {
      setPortalSettings(newSettings);
      const shouldBypass = evaluateBypass(newSettings, currentUserRef.current);
      setIsBypassed(shouldBypass);
      if (!shouldBypass && currentUserRef.current?.role !== 'superadmin') {
        showToast('🔒 Access Restricted', 'Lead Admin has engaged Coming Soon lockdown mode.', 'warning');
      }
    });

    socket.on('USER_UPDATED', (updatedUser) => {
      if (updatedUser.deleted) {
        setFounders(prev => prev.filter(f => f.id !== updatedUser.id));
      } else {
        setFounders(prev => {
          const exists = prev.some(f => f.id === updatedUser.id);
          if (exists) {
            return prev.map(f => f.id === updatedUser.id ? { ...f, ...updatedUser } : f);
          } else {
            return [...prev, updatedUser];
          }
        });
        if (currentUserRef.current?.id === updatedUser.id) {
          const merged = { ...currentUserRef.current, ...updatedUser };
          setCurrentUser(merged);
          localStorage.setItem('founders_user', JSON.stringify(merged));
        }
      }
      refreshData();
    });

    socket.on('FOUNDER_DELETED', ({ id }) => {
      setFounders(prev => prev.filter(f => f.id !== id));
      refreshData();
    });

    socket.on('meeting_updated', (updatedMeeting) => {
      setMeeting(updatedMeeting);
    });

    socket.on('MEETING_UPDATED', (updatedMeeting) => {
      setMeeting(updatedMeeting);
    });

    socket.on('meetings_updated', (updatedMeetings) => {
      if (Array.isArray(updatedMeetings)) {
        setMeetings(updatedMeetings);
      }
    });

    socket.on('projects_updated', (updatedProjects) => {
      if (Array.isArray(updatedProjects)) {
        setClientProjects(updatedProjects);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [refreshData, toastNotificationOnce]);

  // Total Unread Messages Count for current user across all conversations
  const unreadMessagesCount = messages.filter(m => 
    m.senderId !== currentUser?.id && 
    m.status !== 'read'
  ).length;

  // Unread Notifications count (strict: count > 0)
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Pending Requests count for badge (strict: count > 0)
  const pendingRequestsCount = currentUser?.role === 'superadmin'
    ? (
        tasks.filter(t => t.status === 'pending_approval' || t.approvalStatus === 'pending').length +
        tasks.filter(t => t.status === 'review_pending').length +
        clientProjects.flatMap(p => p.credentials || []).filter(c => c.status === 'pending_approval').length +
        clientProjects.filter(p => p.status === 'pending_approval' || p.approvalStatus === 'pending').length
      )
    : (
        tasks.filter(t => 
          (t.requesterId === currentUser?.id || (Array.isArray(t.assignedTo) && t.assignedTo.includes(currentUser?.id))) && 
          (t.status === 'pending_approval' || t.approvalStatus === 'pending')
        ).length +
        clientProjects.filter(p => p.requestedBy === currentUser?.id && (p.status === 'pending_approval' || p.approvalStatus === 'pending')).length
      );

  const markChatAsRead = async (channel = 'group', recipientId = null) => {
    try {
      await apiClient.post('/chat/mark-read', { channel, recipientId });
      setMessages(prev => prev.map(m => {
        if (recipientId) {
          if (m.senderId === recipientId && m.recipientId === currentUser?.id) {
            return { ...m, status: 'read' };
          }
        } else {
          if (!m.recipientId && m.senderId !== currentUser?.id) {
            return { ...m, status: 'read' };
          }
        }
        return m;
      }));

      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('messages_read', { channel, recipientId, readBy: currentUser?.id });
      }
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const markNotificationAsRead = async (id = null) => {
    try {
      await apiClient.post('/notifications/read', { id, all: !id });
      setNotifications(prev => prev.map(n => (!id || n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const clearNotifications = async () => {
    try {
      await apiClient.post('/notifications/clear');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const updatePortalSettings = async (newSettings) => {
    try {
      const res = await apiClient.post('/admin/settings', newSettings);
      if (res.data && res.data.success) {
        const updated = res.data.settings;
        setPortalSettings(updated);
        try {
          localStorage.setItem('founders_portal_settings', JSON.stringify(updated));
        } catch (err) {}
        const shouldBypass = evaluateBypass(updated, currentUserRef.current);
        setIsBypassed(shouldBypass);
        showToast('Settings Saved', 'Portal Gateway access controls updated.', 'success');
        return { success: true, settings: updated };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to update settings', 'error');
      return { success: false };
    }
  };

  // Automatically mark messages as read when user is actively viewing chat
  useEffect(() => {
    if (currentTab === 'chat' && unreadMessagesCount > 0) {
      markChatAsRead();
    }
  }, [currentTab, unreadMessagesCount]);


  // Auth Functions
  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setCurrentUser(user);
        currentUserRef.current = user;
        setIsSuspended(user.status === 'suspended');
        setMustOnboard(user.mustChangePassword);
        localStorage.setItem('founders_token', token);
        localStorage.setItem('founders_user', JSON.stringify(user));

        const shouldBypass = evaluateBypass(portalSettings, user);
        setIsBypassed(shouldBypass);
        if (shouldBypass) {
          localStorage.setItem('founders_bypassed', 'true');
        }

        showToast('Login Successful', `Welcome back, ${user.name}!`, 'success');
        refreshData();
        return { success: true, user };
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.isSuspended) {
        setIsSuspended(true);
        setCurrentUser(err.response.data.user);
        return { success: false, isSuspended: true, message: err.response.data.message };
      }
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast('Login Error', msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('founders_token');
    localStorage.removeItem('founders_user');
    currentUserRef.current = null;
    setToken(null);
    setCurrentUser(null);
    setIsSuspended(false);
    setMustOnboard(false);
    const shouldBypass = evaluateBypass(portalSettings, null);
    setIsBypassed(shouldBypass);
    showToast('Logged Out', 'You have been safely signed out.', 'info');
  };

  const completeOnboarding = async (data) => {
    try {
      const res = await apiClient.post('/auth/onboard', data);
      if (res.data.success) {
        setToken(res.data.token);
        setCurrentUser(res.data.user);
        currentUserRef.current = res.data.user;
        setMustOnboard(false);
        localStorage.setItem('founders_token', res.data.token);
        localStorage.setItem('founders_user', JSON.stringify(res.data.user));
        showToast('Onboarding Completed', 'Welcome to the Founders Workspace!', 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Onboarding Error', err.response?.data?.message || 'Failed to complete onboarding.', 'error');
      return { success: false, message: err.response?.data?.message };
    }
  };

  const verifyBypass = async (passcode) => {
    if (portalSettings?.allowBypass === false) {
      showToast('Access Locked', 'Passcode bypass is currently disabled by Lead Admin.', 'error');
      return { success: false, message: 'Bypass is disabled by Admin' };
    }
    try {
      const res = await apiClient.post('/auth/verify-bypass', { key: passcode });
      if (res.data.success) {
        setIsBypassed(true);
        localStorage.setItem('founders_bypassed', 'true');
        showToast('Access Unlocked', 'Coming soon gateway bypassed.', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid access passcode.';
      showToast('Access Denied', msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Task Actions
  const createTask = async (taskData) => {
    try {
      const res = await apiClient.post('/tasks', taskData);
      if (res.data.success) {
        if (res.data.isPendingApproval) {
          showToast('⏳ Task Request Submitted', 'Sent to Lead Admin for creation approval before activation.', 'info');
        } else {
          showToast('✅ Task Created', 'Task is now live on the Kanban board.', 'success');
        }
        refreshData();
        return { success: true, isPendingApproval: res.data.isPendingApproval };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to create task.', 'error');
      return { success: false };
    }
  };

  const approveTaskCreation = async (taskId) => {
    // 1. Optimistically update local tasks state immediately (no reload required)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, approvalStatus: 'approved', status: 'todo' } : t));
    try {
      const res = await apiClient.post(`/tasks/${taskId}/approve-creation`);
      if (res.data.success) {
        showToast('✅ Task Approved', res.data.message || 'Task approved & activated on Kanban board.', 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      refreshData();
      showToast('Error', err.response?.data?.message || 'Failed to approve task.', 'error');
      return { success: false };
    }
  };

  const rejectTaskCreation = async (taskId, reason) => {
    // 1. Optimistically remove from local tasks state immediately (no reload required)
    const taskToReject = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    // Add local notification instantly
    if (taskToReject) {
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: `Task Rejected: ${taskToReject.title}`,
          message: `Reason: ${reason || 'Not aligned with current sprint priorities.'}`,
          desc: `Reason: ${reason || 'Not aligned with current sprint priorities.'}`,
          type: 'warning',
          time: 'Just now',
          read: false
        },
        ...prev
      ]);
    }

    try {
      const res = await apiClient.post(`/tasks/${taskId}/reject-creation`, { reason });
      if (res.data.success) {
        showToast('Task Request Rejected', res.data.message || 'Task request rejected and recorded.', 'warning');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      refreshData();
      showToast('Error', err.response?.data?.message || 'Failed to reject task.', 'error');
      return { success: false };
    }
  };

  const postDailyUpdate = async (taskId, updateData) => {
    try {
      const res = await apiClient.post(`/tasks/${taskId}/daily-update`, updateData);
      if (res.data.success) {
        showToast('Daily Update Logged', 'Work progress added to timeline instantly.', 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to log update.', 'error');
      return { success: false };
    }
  };

  const requestProgress = async (taskId, progressData) => {
    try {
      const res = await apiClient.post(`/tasks/${taskId}/request-progress`, progressData);
      if (res.data.success) {
        showToast('Proof Submitted', 'Progress increase request forwarded to Lead Admin.', 'info');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to submit progress.', 'error');
      return { success: false };
    }
  };

  const reviewProgress = async (taskId, reviewData) => {
    // Optimistically update progress request in tasks state immediately (no reload required)
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        status: reviewData.decision === 'approve' ? (reviewData.verifiedPercent >= 100 ? 'done' : 'in_progress') : t.status,
        progress: reviewData.decision === 'approve' ? (reviewData.verifiedPercent || t.progress) : t.progress,
        progressRequests: (t.progressRequests || []).map(r => r.id === reviewData.requestId ? { ...r, status: reviewData.decision === 'approve' ? 'approved' : 'rejected' } : r)
      };
    }));

    try {
      const res = await apiClient.post(`/tasks/${taskId}/review-progress`, reviewData);
      if (res.data.success) {
        showToast('Review Executed', res.data.message, reviewData.decision === 'approve' ? 'success' : 'warning');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      refreshData();
      showToast('Error', err.response?.data?.message || 'Failed to review progress.', 'error');
      return { success: false };
    }
  };

  const requestTransfer = async (taskId, transferData) => {
    try {
      const res = await apiClient.post(`/tasks/${taskId}/transfer-request`, transferData);
      if (res.data.success) {
        showToast('Transfer Requested', 'Handover brief sent to recipient founder.', 'info');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Transfer Error', err.response?.data?.message || 'Failed to request transfer.', 'error');
      return { success: false };
    }
  };

  const respondTransfer = async (taskId, responseData) => {
    try {
      const res = await apiClient.post(`/tasks/${taskId}/transfer-respond`, responseData);
      if (res.data.success) {
        showToast('Transfer Updated', res.data.message, responseData.decision === 'accept' ? 'success' : 'info');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to respond to transfer.', 'error');
      return { success: false };
    }
  };

  const requestExtension = async (taskId, extensionData) => {
    try {
      const res = await apiClient.post(`/tasks/${taskId}/request-extension`, extensionData);
      if (res.data.success) {
        showToast('Extension Requested', 'Deadline extension sent to Admin review.', 'info');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to request extension.', 'error');
      return { success: false };
    }
  };

  const reviewExtension = async (taskId, decisionData) => {
    try {
      const res = await apiClient.post(`/tasks/${taskId}/review-extension`, decisionData);
      if (res.data.success) {
        sound.playChime();
        showToast('Extension Decided', res.data.message, decisionData.status === 'approved' ? 'success' : 'info');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to review extension.', 'error');
      return { success: false };
    }
  };

  const toggleBlocker = async (taskId, blockerData) => {
    try {
      const res = await apiClient.post(`/tasks/${taskId}/toggle-blocker`, blockerData);
      if (res.data.success) {
        showToast(blockerData.isBlocked ? 'Blocker Reported' : 'Blocker Cleared', res.data.message, blockerData.isBlocked ? 'warning' : 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to toggle blocker.', 'error');
      return { success: false };
    }
  };

  // Client Hub Actions
  const createClientProject = async (projectData) => {
    try {
      const res = await apiClient.post('/clients', projectData);
      if (res.data.success) {
        showToast('Client Project Created', res.data.message, 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to create project.', 'error');
      return { success: false };
    }
  };

  const addCredential = async (projectId, credData) => {
    try {
      const res = await apiClient.post(`/clients/${projectId}/credentials`, credData);
      if (res.data.success) {
        showToast('Credential Staged', res.data.message, 'info');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to add credential.', 'error');
      return { success: false };
    }
  };

  const approveCredential = async (projectId, credId) => {
    try {
      const res = await apiClient.post(`/clients/${projectId}/credentials/${credId}/approve`);
      if (res.data.success) {
        showToast('Credential Unlocked', 'Verified and accessible to assigned founders.', 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to approve credential.', 'error');
      return { success: false };
    }
  };

  const revealCredential = async (projectId, credId) => {
    try {
      const res = await apiClient.post(`/clients/${projectId}/credentials/${credId}/reveal`);
      if (res.data.success) {
        return { success: true, password: res.data.password, username: res.data.username };
      }
    } catch (err) {
      showToast('Access Denied', err.response?.data?.message || 'Unable to reveal credential.', 'error');
      return { success: false };
    }
  };

  const approveClientProject = async (projectId) => {
    try {
      const res = await apiClient.post(`/clients/${projectId}/approve`);
      if (res.data.success) {
        sound.playChime();
        showToast('Project Approved', res.data.message || 'Workspace is now active.', 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to approve project.', 'error');
      return { success: false };
    }
  };

  const rejectClientProject = async (projectId, reason) => {
    try {
      const res = await apiClient.post(`/clients/${projectId}/reject`, { reason });
      if (res.data.success) {
        showToast('Project Declined', res.data.message || 'Project proposal declined.', 'info');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to reject project.', 'error');
      return { success: false };
    }
  };

  // Meeting Actions
  const scheduleMeeting = async (meetingData) => {
    try {
      const res = await apiClient.post('/meetings/schedule', meetingData);
      if (res.data.success) {
        sound.playChime();
        showToast('Meeting Scheduled', res.data.message, 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Scheduling Failed', err.response?.data?.message || 'Failed to schedule meeting.', 'error');
      return { success: false, message: err.response?.data?.message };
    }
  };

  const hostSubmitMeeting = async (submitData) => {
    try {
      const res = await apiClient.post('/meetings/host-submit', submitData);
      if (res.data.success) {
        sound.playChime();
        showToast('Meeting Finalized', 'Date and link broadcasted to top banner.', 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to finalize meeting.', 'error');
      return { success: false };
    }
  };

  const confirmMeetingRsvp = async (meetingId = null) => {
    try {
      const res = await apiClient.post('/meetings/rsvp', { meetingId });
      if (res.data.success) {
        sound.playChime();
        showToast('RSVP Confirmed', 'Your attendance is verified.', 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to confirm attendance.', 'error');
      return { success: false };
    }
  };

  const cancelMeeting = async (meetingId = null) => {
    try {
      const res = await apiClient.post('/meetings/cancel', { meetingId });
      if (res.data.success) {
        sound.playPop();
        showToast('Meeting Cancelled', res.data.message || 'Meeting cancelled successfully.', 'info');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      sound.playWarning();
      showToast('Cancellation Blocked', err.response?.data?.message || 'Failed to cancel meeting.', 'error');
      return { success: false, message: err.response?.data?.message };
    }
  };

  // Chat Actions with Instant Optimistic UI & Zero-Duplication Real-time Sync
  const sendMessage = async (messageData) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const user = currentUserRef.current;
    const optimisticMsg = {
      id: tempId,
      localId: tempId,
      senderId: user?.id,
      senderName: user?.name,
      senderRole: user?.role,
      senderAvatar: user?.avatar,
      text: messageData.text ? messageData.text.trim() : '',
      voiceNote: messageData.voiceNote || null,
      mediaUrl: messageData.mediaUrl || null,
      mediaType: messageData.mediaType || 'image',
      recipientId: messageData.recipientId || null,
      channelId: messageData.recipientId ? 'dm' : 'group',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    // Instant optimistic render on screen
    setMessages(prev => [...prev, optimisticMsg]);
    sound.playPop();

    try {
      const res = await apiClient.post('/chat/messages', messageData);
      if (res.data.success && res.data.message) {
        const confirmedMsg = { ...res.data.message, localId: tempId };

        setMessages(prev => {
          // Replace temporary message by ID preserving localId
          const hasTemp = prev.some(m => m.id === tempId || m.localId === tempId);
          if (hasTemp) {
            return prev.map(m => (m.id === tempId || m.localId === tempId) ? confirmedMsg : m);
          }
          // Avoid duplicate if socket arrived first
          if (prev.some(m => m.id === confirmedMsg.id)) {
            return prev.map(m => m.id === confirmedMsg.id ? confirmedMsg : m);
          }
          return [...prev, confirmedMsg];
        });

        // Register in prevMessagesRef to avoid duplicate fresh message toast during polling
        if (prevMessagesRef.current && !prevMessagesRef.current.some(m => m.id === confirmedMsg.id)) {
          prevMessagesRef.current = [...prevMessagesRef.current, confirmedMsg];
        }

        // Broadcast to peers via socket if available
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('send_chat_message', confirmedMsg);
        }

        return { success: true, message: confirmedMsg };
      }
      return { success: false };
    } catch (err) {
      // Rollback temporary message on error
      setMessages(prev => prev.filter(m => m.id !== tempId && m.localId !== tempId));
      sound.playWarning();
      showToast('Chat Error', err.response?.data?.message || 'Failed to send message. Please retry.', 'error');
      return { success: false };
    }
  };

  // Rules Book Actions
  const signRulesBook = async (signatureData, hash) => {
    try {
      const res = await apiClient.post('/admin/rules/sign', { signatureData, hash });
      if (res.data.success) {
        showToast('Charter Signed', 'Digital signature recorded and verified.', 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to sign rules.', 'error');
      return { success: false };
    }
  };

  const ratifyCharter = async (sealData, signatureText) => {
    try {
      const payload = typeof sealData === 'object' 
        ? sealData 
        : { sealType: sealData, signatureText };
      const res = await apiClient.post('/admin/rules/ratify', payload);
      if (res.data.success) {
        showToast('Charter Ratified', 'Lead Admin seal & signature updated successfully.', 'success');
        refreshData();
        return { success: true, adminRatification: res.data.adminRatification };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to ratify charter.', 'error');
      return { success: false };
    }
  };

  // Admin Actions
  const createFounder = async (founderData) => {
    try {
      const res = await apiClient.post('/admin/founders', founderData);
      if (res.data.success) {
        showToast('Founder Added', res.data.message, 'success');
        if (res.data.founder) {
          const created = res.data.founder;
          setFounders(prev => {
            const exists = prev.some(f => f.id === created.id);
            if (exists) return prev.map(f => f.id === created.id ? { ...f, ...created } : f);
            return [...prev, created];
          });
        }
        refreshData();
        return { success: true, tempPassword: res.data.tempPassword, founder: res.data.founder };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to add founder.', 'error');
      return { success: false };
    }
  };

  const deleteFounder = async (founderId) => {
    // 1. Optimistically remove from list immediately for responsive UI
    setFounders(prev => prev.filter(f => f.id !== founderId));
    try {
      const res = await apiClient.delete(`/admin/founders/${founderId}`);
      if (res.data.success) {
        sound.playPop();
        showToast('Founder Removed', res.data.message, 'info');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      refreshData();
      showToast('Error', err.response?.data?.message || 'Failed to remove founder.', 'error');
      return { success: false };
    }
  };

  const issueStrike = async (founderId, strikeData) => {
    try {
      const res = await apiClient.post(`/admin/founders/${founderId}/strike`, strikeData);
      if (res.data.success) {
        sound.playDangerAlarm();
        showToast('🚨 Critical Strike Issued', res.data.message, 'error');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to issue strike.', 'error');
      return { success: false };
    }
  };

  const addPipelineStage = async (projectId, stageData) => {
    try {
      const res = await apiClient.post(`/clients/${projectId}/pipeline-stage`, stageData);
      if (res.data.success) {
        sound.playChime();
        showToast('Pipeline Stage Added', `Stage "${stageData.stageName}" created successfully.`, 'success');
        refreshData();
        return { success: true, stage: res.data.stage };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to add pipeline stage.', 'error');
      return { success: false };
    }
  };

  const pardonStrike = async (founderId, pardonNote) => {
    try {
      const res = await apiClient.post(`/admin/founders/${founderId}/pardon`, { pardonNote });
      if (res.data.success) {
        showToast('Strike Pardoned', res.data.message, 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to pardon strike.', 'error');
      return { success: false };
    }
  };

  const adminOverridePassword = async (targetUserId, newPassword) => {
    try {
      const res = await apiClient.post('/auth/admin-override-password', { targetUserId, newPassword });
      if (res.data.success) {
        showToast('Password Updated', res.data.message, 'success');
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to override password.', 'error');
      return { success: false };
    }
  };

  const toggleMuteSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    showToast(
      muted ? '🔇 Sound Muted' : '🔊 Sound Active',
      muted ? 'Sound effects disabled.' : 'Sound effects enabled.',
      'info'
    );
    return muted;
  };

  // Media Upload (Cloudinary with local fallback)
  const uploadFile = async (file, folder = 'founders_workspace', resourceType = 'auto') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('resourceType', resourceType);

      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        return { success: true, url: res.data.url, publicId: res.data.publicId, provider: res.data.provider };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      console.error('File upload error:', err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ success: true, url: e.target.result, provider: 'local_preview' });
        reader.onerror = () => resolve({ success: false, message: 'File read failed' });
        reader.readAsDataURL(file);
      });
    }
  };

  // Profile Update (Avatar, Phone, Designation, Name, Bio, Brand, Password)
  const updateProfile = async (profileData) => {
    try {
      const res = await apiClient.put('/auth/profile', profileData);
      if (res.data.success) {
        sound.playChime();
        const updatedUser = { ...currentUserRef.current, ...res.data.user };
        setCurrentUser(updatedUser);
        localStorage.setItem('founders_user', JSON.stringify(updatedUser));
        setFounders(prev => prev.map(f => f.id === res.data.user.id ? { ...f, ...res.data.user } : f));
        if (res.data.meeting) {
          setMeeting(res.data.meeting);
        } else {
          setMeeting(prev => {
            if (!prev) return prev;
            if (prev.hostId === res.data.user.id || (prev.hostName && prev.hostName.toLowerCase() === res.data.user.name?.toLowerCase())) {
              return { ...prev, hostAvatar: res.data.user.avatar, hostName: res.data.user.name };
            }
            return prev;
          });
        }
        showToast('Profile Updated', 'Your executive profile details and photo have been updated.', 'success');
        refreshData();
        return { success: true };
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Failed to update profile.', 'error');
      return { success: false, message: err.response?.data?.message };
    }
  };

  return (
    <PortalContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser && !!token,
        isSuspended,
        mustOnboard,
        isBypassed,
        isSettingsLoaded,
        currentTab,
        setCurrentTab,
        isLoading,
        isMuted,
        toggleMuteSound,
        tasks,
        clientProjects,
        meeting,
        meetings,
        messages,
        rules,
        adminRatification,
        foundersSignatures,
        founders,
        auditLogs,
        inactivityRadar,
        securityFreeze,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        clearNotifications,
        portalSettings,
        updatePortalSettings,
        pendingRequestsCount,
        toastMessage,
        showToast,
        refreshData,
        unreadMessagesCount,
        markChatAsRead,
        // Actions
        login,
        logout,
        completeOnboarding,
        verifyBypass,
        createTask,
        approveTaskCreation,
        rejectTaskCreation,
        postDailyUpdate,
        requestProgress,
        reviewProgress,
        requestTransfer,
        respondTransfer,
        requestExtension,
        reviewExtension,
        toggleBlocker,
        createClientProject,
        approveClientProject,
        rejectClientProject,
        addCredential,
        approveCredential,
        revealCredential,
        scheduleMeeting,
        hostSubmitMeeting,
        confirmMeetingRsvp,
        cancelMeeting,
        sendMessage,
        signRulesBook,
        ratifyCharter,
        createFounder,
        deleteFounder,
        issueStrike,
        pardonStrike,
        addPipelineStage,
        adminOverridePassword,
        uploadFile,
        updateProfile
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
