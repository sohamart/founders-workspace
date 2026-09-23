const { getStore, saveStore } = require('../config/localStore');

// @desc Get Notifications for Current User
// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
  const store = getStore();
  const user = req.user;

  let notifications = store.notifications || [];

  // Filter based on user role and target
  const userNotifications = notifications.filter(n => {
    const target = n.targetUserId || n.recipientId;
    if (target && target !== user.id && target !== 'all') return false;
    if (n.targetRole && n.targetRole !== 'all') {
      if (n.targetRole === 'superadmin' && user.role !== 'superadmin') return false;
      if (n.targetRole === 'founder' && user.role !== 'founder') return false;
    }
    return true;
  }).map(n => ({
    ...n,
    read: (Array.isArray(n.readBy) && n.readBy.includes(user.id)) || (n.readBy && !Array.isArray(n.readBy) && n.readBy === user.id) || (n.read === true && (!n.readBy || n.readBy.includes(user.id)))
  }));

  res.json({
    success: true,
    count: userNotifications.length,
    unreadCount: userNotifications.filter(n => !n.read).length,
    notifications: userNotifications
  });
};

// @desc Mark Notification(s) as Read
// @route POST /api/notifications/read
exports.markAsRead = async (req, res) => {
  const { id, all } = req.body;
  const user = req.user;
  const store = getStore();

  if (!store.notifications) store.notifications = [];

  let updated = false;
  store.notifications.forEach(n => {
    if (!Array.isArray(n.readBy)) n.readBy = [];
    if (all || n.id === id) {
      if (!n.readBy.includes(user.id)) {
        n.readBy.push(user.id);
        updated = true;
      }
    }
  });

  if (updated) saveStore(store);

  res.json({
    success: true,
    message: all ? 'All notifications marked as read.' : 'Notification marked as read.'
  });
};

// @desc Clear Notifications for Current User
// @route POST /api/notifications/clear
exports.clearNotifications = async (req, res) => {
  const user = req.user;
  const store = getStore();

  if (!store.notifications) store.notifications = [];

  // Mark all as read for user
  store.notifications.forEach(n => {
    if (!Array.isArray(n.readBy)) n.readBy = [];
    if (!n.readBy.includes(user.id)) {
      n.readBy.push(user.id);
    }
  });

  saveStore(store);

  res.json({
    success: true,
    message: 'Notifications cleared successfully.'
  });
};
