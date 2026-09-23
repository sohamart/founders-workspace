const { getStore, saveStore } = require('../config/localStore');

// @desc Get Chat Messages (filter by channel or recipient if specified)
// @route GET /api/chat/messages
exports.getMessages = async (req, res) => {
  const store = getStore();
  const { channel = 'group', recipientId } = req.query;
  const currentUserId = req.user.id;

  // Filter messages
  let messages = store.messages || [];

  if (recipientId) {
    // 1-on-1 Direct Messages between current user and recipient
    messages = messages.filter(m => 
      (m.senderId === currentUserId && m.recipientId === recipientId) ||
      (m.senderId === recipientId && m.recipientId === currentUserId)
    );
  } else if (channel === 'group') {
    // Group messages (all messages without recipientId or with channelId === 'group')
    messages = messages.filter(m => !m.recipientId || m.channelId === 'group');
  }

  res.json({
    success: true,
    count: messages.length,
    messages
  });
};

// @desc Mark Messages as Read (Explicitly called when user views chat)
// @route POST /api/chat/mark-read
exports.markAsRead = async (req, res) => {
  const { channel = 'group', recipientId } = req.body;
  const currentUserId = req.user.id;
  const store = getStore();

  let updated = false;
  if (store.messages) {
    store.messages.forEach(m => {
      if (m.status !== 'read') {
        if (recipientId) {
          if (m.senderId === recipientId && m.recipientId === currentUserId) {
            m.status = 'read';
            updated = true;
          }
        } else {
          if (!m.recipientId && m.senderId !== currentUserId) {
            m.status = 'read';
            updated = true;
          }
        }
      }
    });
  }

  if (updated) saveStore(store);

  res.json({ success: true, message: 'Messages marked as read.' });
};

// @desc Post Chat Message (Group or Direct Message, with optional Cloudinary media)
// @route POST /api/chat/messages
exports.sendMessage = async (req, res) => {
  const { text, voiceNote, recipientId, mediaUrl, mediaType } = req.body;

  if ((!text || text.trim() === '') && !voiceNote && !mediaUrl) {
    return res.status(400).json({ success: false, message: 'Message content, attachment or voice note required.' });
  }

  const store = getStore();
  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    senderId: req.user.id,
    senderName: req.user.name,
    senderRole: req.user.role,
    senderAvatar: req.user.avatar,
    text: text ? text.trim() : '',
    voiceNote: voiceNote || null,
    mediaUrl: mediaUrl || null,
    mediaType: mediaType || 'image',
    recipientId: recipientId || null,
    channelId: recipientId ? 'dm' : 'group',
    timestamp: new Date().toISOString(),
    status: 'delivered' // sent | delivered | read
  };

  if (!store.messages) store.messages = [];
  store.messages.push(newMessage);
  saveStore(store);

  // Broadcast via Socket.io if available
  if (req.app.get('io')) {
    req.app.get('io').emit('new_message', newMessage);
  }

  res.status(201).json({
    success: true,
    message: newMessage
  });
};
