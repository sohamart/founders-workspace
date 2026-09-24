const bcrypt = require('bcryptjs');
const { getStore, saveStore } = require('../config/localStore');

// @desc Get All Founders & Team
// @route GET /api/admin/founders
exports.getFounders = async (req, res) => {
  const store = getStore();
  const founders = store.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    designation: u.designation,
    avatar: u.avatar,
    phone: u.phone,
    status: u.status,
    strikes: u.strikes || 0,
    strikeHistory: u.strikeHistory || [],
    signature: u.signature,
    mustChangePassword: u.mustChangePassword,
    isOnboarded: u.isOnboarded,
    createdAt: u.createdAt
  }));

  res.json({
    success: true,
    count: founders.length,
    founders
  });
};

// @desc Create Founder with Temporary Password
// @route POST /api/admin/founders
exports.createFounder = async (req, res) => {
  const { name, email, designation, phone, tempPassword } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }

  const store = getStore();
  const existing = store.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
  }

  const passwordToUse = tempPassword || 'Temp#Pass2026';
  const passwordHash = bcrypt.hashSync(passwordToUse, 10);

  const newFounder = {
    id: `founder_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: 'founder',
    designation: designation || 'Executive Founder',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    phone: phone || '',
    status: 'active',
    strikes: 0,
    strikeHistory: [],
    mustChangePassword: true, // Forces first-time onboarding
    isOnboarded: false,
    signature: { signed: false },
    passwordHash,
    createdAt: new Date().toISOString()
  };

  store.users.push(newFounder);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'FOUNDER_CREATED',
    details: `Super Admin created founder account for ${newFounder.name} (${newFounder.email}) with temporary password.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  res.status(201).json({
    success: true,
    message: `Founder account created for ${newFounder.name}. Temporary password: ${passwordToUse}`,
    founder: newFounder,
    tempPassword: passwordToUse
  });
};

// @desc Delete Founder Account
// @route DELETE /api/admin/founders/:id
exports.deleteFounder = async (req, res) => {
  const { id } = req.params;
  const store = getStore();

  const userIndex = store.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Founder not found.' });
  }

  if (store.users[userIndex].role === 'superadmin') {
    return res.status(400).json({ success: false, message: 'Cannot delete the Super Admin account.' });
  }

  const removedName = store.users[userIndex].name;
  store.users.splice(userIndex, 1);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'FOUNDER_DELETED',
    details: `Super Admin permanently removed founder account for ${removedName}.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  res.json({
    success: true,
    message: `Founder ${removedName} removed successfully.`
  });
};

// @desc Issue Direct Warning / Strike (Selecting Rules 01-30)
// @route POST /api/admin/founders/:id/strike
exports.issueStrike = async (req, res) => {
  const { id } = req.params;
  const { ruleNumber, reason } = req.body;

  const store = getStore();
  const founder = store.users.find(u => u.id === id);

  if (!founder) {
    return res.status(404).json({ success: false, message: 'Founder not found.' });
  }

  if (founder.role === 'superadmin') {
    return res.status(400).json({ success: false, message: 'Super Admin is immune to strikes.' });
  }

  founder.strikes = (founder.strikes || 0) + 1;
  const strikeEntry = {
    id: `strike_${Date.now()}`,
    ruleNumber: ruleNumber || '26',
    reason: reason || 'Formal warning issued by Lead Admin.',
    issuedBy: req.user.name,
    date: new Date().toISOString()
  };

  if (!founder.strikeHistory) founder.strikeHistory = [];
  founder.strikeHistory.unshift(strikeEntry);

  // 2-Strike Automated Suspension Rule
  if (founder.strikes >= 2) {
    founder.status = 'suspended';
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'STRIKE_ISSUED',
    details: `Lead Admin issued Strike ${founder.strikes} to ${founder.name} (Rule ${ruleNumber || '26'}: ${reason}). ${founder.strikes >= 2 ? 'ACCOUNT INSTANTLY SUSPENDED.' : ''}`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  });

  // 1. Create high-urgency disciplinary notification
  const strikeNotif = {
    id: `notif_strike_${Date.now()}`,
    type: 'strike_issued',
    title: `🚨 CRITICAL DISCIPLINARY STRIKE #${founder.strikes} ISSUED`,
    message: `ATTENTION ${founder.name}: Rule ${ruleNumber || '26'} infraction recorded. Reason: "${reason || 'Formal warning issued by Lead Admin.'}". ${founder.strikes >= 2 ? '⛔ IMMEDIATE ACCOUNT SUSPENSION ACTIVE!' : '⚠️ Warning: A 2nd strike will trigger automated account suspension.'}`,
    priority: 'urgent',
    read: false,
    recipientId: founder.id,
    timestamp: new Date().toISOString()
  };
  if (!store.notifications) store.notifications = [];
  store.notifications.unshift(strikeNotif);

  // 2. Broadcast official warning announcement in Founders Group chat
  const strikeMessage = {
    id: `msg_strike_${Date.now()}`,
    channelId: 'founders_group',
    senderId: 'system_governance',
    senderName: 'PORTAL GOVERNANCE RADAR',
    senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    type: 'system_strike_alert',
    text: `🚨 OFFICIAL DISCIPLINARY ENFORCEMENT: Strike #${founder.strikes} issued to @${founder.name} for Rule ${ruleNumber || '26'} infraction (${reason || 'Protocol non-compliance'}). ${founder.strikes >= 2 ? '⛔ ACCOUNT SUSPENDED IMMEDIATELY.' : '⚠️ Warning: Strict 2-strike maximum enforced under Rule 28.'}`,
    timestamp: new Date().toISOString()
  };
  if (!store.messages) store.messages = [];
  store.messages.unshift(strikeMessage);

  const strikeLog = {
    id: `log_${Date.now()}`,
    action: 'STRIKE_ISSUED',
    details: `Lead Admin issued Strike #${founder.strikes} to ${founder.name} for Rule ${ruleNumber || '26'}. Reason: "${reason || 'Protocol infraction'}"`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(strikeLog);

  if (req.io) {
    req.io.emit('STRIKE_ISSUED', {
      founderId: founder.id,
      founderName: founder.name,
      strikes: founder.strikes,
      ruleNumber: ruleNumber || '26',
      reason: reason || 'Formal warning issued by Lead Admin.',
      status: founder.status
    });
    req.io.emit('new_activity', strikeLog);
    req.io.emit('new_message', strikeMessage);
    req.io.emit('new_notification', strikeNotif);
  }

  saveStore(store);

  res.json({
    success: true,
    message: `Strike issued to ${founder.name}. Current strikes: ${founder.strikes}.${founder.strikes >= 2 ? ' Account suspended.' : ''}`,
    founder
  });
};

// @desc Revoke / Pardon Strike
// @route POST /api/admin/founders/:id/pardon
exports.pardonStrike = async (req, res) => {
  const { id } = req.params;
  const { pardonNote } = req.body;

  const store = getStore();
  const founder = store.users.find(u => u.id === id);

  if (!founder) {
    return res.status(404).json({ success: false, message: 'Founder not found.' });
  }

  if (founder.strikes > 0) {
    founder.strikes -= 1;
  }

  // If brought below 2 strikes and was suspended, reactivate
  if (founder.strikes < 2 && founder.status === 'suspended') {
    founder.status = 'active';
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'STRIKE_PARDONED',
    details: `Lead Admin pardoned 1 strike for ${founder.name}. Note: ${pardonNote || 'Pardoned upon executive review'}. Remaining strikes: ${founder.strikes}`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  res.json({
    success: true,
    message: `Strike pardoned for ${founder.name}. Remaining strikes: ${founder.strikes}.`,
    founder
  });
};

// @desc Suspend or Reactivate Account Directly
// @route POST /api/admin/founders/:id/status
exports.toggleAccountStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' | 'suspended'

  const store = getStore();
  const founder = store.users.find(u => u.id === id);

  if (!founder) {
    return res.status(404).json({ success: false, message: 'Founder not found.' });
  }

  if (founder.role === 'superadmin') {
    return res.status(400).json({ success: false, message: 'Cannot suspend Super Admin.' });
  }

  founder.status = status;
  if (status === 'active' && founder.strikes >= 2) {
    // Reset strikes to 1 on manual reactivation so they have 1 chance left
    founder.strikes = 1;
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: status === 'suspended' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_REACTIVATED',
    details: `Super Admin manually changed ${founder.name}'s status to ${status}.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  res.json({
    success: true,
    message: `Account status for ${founder.name} set to ${status}.`,
    founder
  });
};

// @desc Get Rules Book & Signatures
// @route GET /api/admin/rules
exports.getRulesBook = async (req, res) => {
  const store = getStore();
  res.json({
    success: true,
    rules: store.rules,
    adminRatification: store.adminRatification,
    foundersSignatures: store.users.filter(u => u.role === 'founder').map(f => ({
      userId: f.id,
      name: f.name,
      designation: f.designation,
      status: f.status,
      signature: f.signature
    }))
  });
};

// @desc Founder Signs Rules Book Canvas
// @route POST /api/admin/rules/sign
exports.signRulesBook = async (req, res) => {
  const { signatureData, hash } = req.body;

  if (req.user.role === 'superadmin') {
    return res.status(400).json({ success: false, message: 'Super Admin cannot sign in founder signature block. Use Lead Admin Ratification Seal.' });
  }

  if (req.user.status === 'suspended') {
    return res.status(403).json({ success: false, message: 'Suspended founders are ineligible to sign.' });
  }

  const store = getStore();
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  user.signature = {
    signed: true,
    signatureData: signatureData || '',
    date: new Date().toLocaleDateString(),
    hash: hash || `SHA:${Date.now().toString(16).toUpperCase()}`
  };

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'RULES_SIGNED',
    details: `${user.name} digitally executed signature for Founders Strict Rules & Agreement v2.0.`,
    actor: user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  res.json({
    success: true,
    message: 'Rules Book digitally signed and verified.',
    signature: user.signature
  });
};

// @desc Lead Admin Updates Witness Ratification & Branded Seal
// @route POST /api/admin/rules/ratify
exports.ratifyRulesBook = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only Lead Admin can ratify the official charter.' });
  }

  const { sealType, signatureText, signatureData, signatureHash, quote, ratifiedBy } = req.body;
  const store = getStore();

  const prev = store.adminRatification || {};

  store.adminRatification = {
    quote: quote || prev.quote || "I, Lead Admin, hereby ratify, execute and officially enforce the Founders' Strict Rules & Agreement (Version 2.0) across Weblets and StackAdda.",
    ratifiedBy: ratifiedBy || prev.ratifiedBy || req.user.name || "SSA TEAM LEAD ADMIN",
    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    sealType: sealType || prev.sealType || 'gold_crest',
    signatureText: signatureText || prev.signatureText || 'SSA TEAM LEAD ADMIN',
    signatureData: signatureData !== undefined ? signatureData : (prev.signatureData || null),
    signatureHash: signatureHash || prev.signatureHash || `SHA:ADMIN_${Date.now().toString(16).toUpperCase()}`,
    verified: true,
    updatedAt: new Date().toISOString()
  };

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'CHARTER_RATIFIED',
    details: `Lead Admin (${req.user.name}) updated legal ratification seal to [${store.adminRatification.sealType}] with manual signature.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  res.json({
    success: true,
    message: 'Charter ratified with official SSA TEAM seal and manual signature.',
    adminRatification: store.adminRatification
  });
};

// @desc Get Inactivity Radar (Rule 05)
// @route GET /api/admin/inactivity-radar
exports.getInactivityRadar = async (req, res) => {
  const store = getStore();
  const founders = store.users.filter(u => u.role === 'founder');

  const radar = founders.map(f => {
    // Find latest daily update or login
    const latestUpdate = store.tasks
      .flatMap(t => t.dailyUpdates || [])
      .filter(du => du.authorId === f.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    return {
      userId: f.id,
      name: f.name,
      designation: f.designation,
      avatar: f.avatar,
      status: f.status,
      strikes: f.strikes,
      lastActive: latestUpdate ? latestUpdate.timestamp : f.createdAt,
      lastAction: latestUpdate ? `Updated "${latestUpdate.statusTag}"` : 'Account Provisioned'
    };
  });

  res.json({ success: true, radar });
};

// @desc Emergency Security Freeze Toggle (Rules 16 & 18)
// @route POST /api/admin/security-freeze
exports.toggleSecurityFreeze = async (req, res) => {
  const { active } = req.body;
  const store = getStore();

  store.settings.securityFreezeActive = !!active;

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: active ? 'SECURITY_FREEZE_ENGAGED' : 'SECURITY_FREEZE_LIFTED',
    details: `Super Admin ${active ? 'ENGAGED' : 'LIFTED'} Emergency Security Freeze.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  res.json({
    success: true,
    message: active ? 'Emergency Security Freeze engaged.' : 'Security Freeze lifted.',
    securityFreezeActive: store.settings.securityFreezeActive
  });
};

// @desc 1-Click JSON Backup Export
// @route GET /api/admin/backup-export
exports.exportBackup = async (req, res) => {
  const store = getStore();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=founders_workspace_backup_${Date.now()}.json`);
  res.send(JSON.stringify(store, null, 2));
};

// @desc 1-Click JSON Restore
// @route POST /api/admin/backup-restore
exports.restoreBackup = async (req, res) => {
  const backupData = req.body;
  if (!backupData || !backupData.users) {
    return res.status(400).json({ success: false, message: 'Invalid backup file format.' });
  }

  saveStore(backupData);
  res.json({ success: true, message: 'Workspace restored from backup.' });
};

// @desc Get Portal Settings
// @route GET /api/admin/settings
exports.getSettings = async (req, res) => {
  const store = getStore();
  const settings = store.settings || {};

  res.json({
    success: true,
    settings: {
      brandName: settings.brandName || 'Weblets® × StackAdda™',
      comingSoonActive: settings.comingSoonActive !== false,
      allowBypass: settings.allowBypass !== false,
      targetLaunchDate: settings.targetLaunchDate || '2026-10-01T12:00:00.000Z',
      securityFreezeActive: !!settings.securityFreezeActive,
      emergencyNotice: settings.emergencyNotice || ''
    }
  });
};

// @desc Update Portal Settings (Super Admin Only)
// @route POST /api/admin/settings
exports.updateSettings = async (req, res) => {
  const { comingSoonActive, allowBypass, targetLaunchDate, bypassPasscode, emergencyNotice } = req.body;
  const store = getStore();

  if (!store.settings) store.settings = {};

  if (comingSoonActive !== undefined) store.settings.comingSoonActive = !!comingSoonActive;
  if (allowBypass !== undefined) store.settings.allowBypass = !!allowBypass;
  if (targetLaunchDate !== undefined) store.settings.targetLaunchDate = targetLaunchDate;
  if (bypassPasscode && bypassPasscode.trim()) store.settings.bypassPasscode = bypassPasscode.trim();
  if (emergencyNotice !== undefined) store.settings.emergencyNotice = emergencyNotice;

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'SETTINGS_UPDATED',
    details: `${req.user.name} updated portal settings. Coming Soon: ${store.settings.comingSoonActive ? 'Active' : 'Disabled'}.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  if (req.app.get('io')) {
    req.app.get('io').emit('settings_updated', store.settings);
  }

  res.json({
    success: true,
    message: 'Portal settings updated successfully.',
    settings: store.settings
  });
};

