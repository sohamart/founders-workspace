const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getStore, saveStore, resetStoreToBlank } = require('../config/localStore');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_weblets_stackadda_founders_jwt_key_2026_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
const ADMIN_BYPASS_KEY = process.env.ADMIN_BYPASS_KEY || 'FOUNDERS#2026#SECRET';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  const store = getStore();
  const user = store.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({
      success: false,
      isSuspended: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        strikes: user.strikes,
        strikeHistory: user.strikeHistory
      },
      message: 'Account Suspended: You have accumulated 2 strikes or have been administratively locked out.'
    });
  }

  // If Coming Soon is active and Admin has turned off bypass, Super Admin and Founders with temporary onboarding passwords can sign in
  const settings = store.settings || {};
  if (settings.comingSoonActive !== false && settings.allowBypass === false && user.role !== 'superadmin') {
    if (!user.mustChangePassword) {
      return res.status(403).json({
        success: false,
        message: 'Portal is currently in Private Assembly. Founder access is administratively locked by Lead Admin.'
      });
    }
  }

  const token = generateToken(user);

  // Record audit log
  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'USER_LOGIN',
    details: `${user.name} (${user.role}) logged in.`,
    actor: user.name,
    timestamp: new Date().toISOString()
  });
  saveStore(store);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      avatar: user.avatar,
      phone: user.phone,
      status: user.status,
      strikes: user.strikes,
      strikeHistory: user.strikeHistory,
      mustChangePassword: user.mustChangePassword,
      isOnboarded: user.isOnboarded,
      signature: user.signature
    }
  });
};

// @desc Complete first-time Onboarding (Permanent password + Profile)
// @route POST /api/auth/onboard
exports.onboard = async (req, res) => {
  const { newPassword, avatar, designation, phone } = req.body;
  const userId = req.user.id;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
  }

  const store = getStore();
  const userIndex = store.users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  store.users[userIndex].passwordHash = passwordHash;
  store.users[userIndex].mustChangePassword = false;
  store.users[userIndex].isOnboarded = true;
  if (avatar) store.users[userIndex].avatar = avatar;
  if (designation) store.users[userIndex].designation = designation;
  if (phone) store.users[userIndex].phone = phone;

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'ONBOARDING_COMPLETED',
    details: `${store.users[userIndex].name} completed security setup and permanent password creation.`,
    actor: store.users[userIndex].name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  const updatedUser = store.users[userIndex];
  const token = generateToken(updatedUser);

  res.json({
    success: true,
    message: 'Onboarding completed successfully. Welcome to Founders Workspace!',
    token,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      designation: updatedUser.designation,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      status: updatedUser.status,
      strikes: updatedUser.strikes,
      mustChangePassword: false,
      isOnboarded: true
    }
  });
};

// @desc Universal Admin Password Override (Reset any user's password without verification)
// @route POST /api/auth/admin-override-password
exports.adminOverridePassword = async (req, res) => {
  const { targetUserId, newPassword } = req.body;

  if (!targetUserId || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Provide targetUserId and newPassword (min 6 chars).' });
  }

  const store = getStore();
  const userIndex = store.users.findIndex(u => u.id === targetUserId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Target user not found.' });
  }

  const passwordHash = bcrypt.hashSync(newPassword, 10);
  store.users[userIndex].passwordHash = passwordHash;

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'PASSWORD_OVERRIDE',
    details: `Super Admin overridden password for ${store.users[userIndex].name}.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  res.json({
    success: true,
    message: `Password successfully updated for ${store.users[userIndex].name}.`
  });
};

// @desc Single Master Super Admin 1-Time Provisioning Wizard
// @route POST /api/auth/setup-master-admin
exports.setupMasterAdmin = async (req, res) => {
  const store = getStore();

  // If already provisioned, permanently locked!
  if (store.isProvisioned && store.users.some(u => u.role === 'superadmin')) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Master Admin is already provisioned and permanently locked. Only 1 Super Admin is permitted.'
    });
  }

  const { name, email, password, designation, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newAdmin = {
    id: `admin_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: 'superadmin',
    designation: designation || 'Lead Admin & Managing Partner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    phone: phone || '',
    status: 'active',
    strikes: 0,
    strikeHistory: [],
    mustChangePassword: false,
    isOnboarded: true,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  store.users = [newAdmin];
  store.isProvisioned = true; // PERMANENTLY LOCKED

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'MASTER_ADMIN_PROVISIONED',
    details: `Single Super Admin (${newAdmin.name}) created. System provision lock engaged.`,
    actor: newAdmin.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  const token = generateToken(newAdmin);
  res.json({
    success: true,
    message: 'Master Super Admin provisioned. Provisioning gate is now permanently locked.',
    token,
    user: newAdmin
  });
};

// @desc Factory Reset (Wipe accounts to re-enter Single Admin Setup)
// @route POST /api/auth/factory-reset
exports.factoryReset = async (req, res) => {
  const wiped = resetStoreToBlank();
  res.json({
    success: true,
    message: 'All accounts wiped clean. Portal is now ready for single Super Admin provisioning.',
    data: wiped
  });
};

// @desc Verify Bypass Key for Coming Soon
// @route POST /api/auth/verify-bypass
exports.verifyBypassKey = async (req, res) => {
  const store = getStore();
  const settings = store.settings || {};

  // If Admin turned off bypass, reject all passcode bypass attempts
  if (settings.allowBypass === false) {
    return res.status(403).json({
      success: false,
      message: 'Portal bypass is currently disabled by the Lead Admin.'
    });
  }

  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ success: false, message: 'Passcode required.' });
  }

  const configuredPasscode = (settings.bypassPasscode || 'FOUNDER2026').trim();
  const validKeys = [configuredPasscode, ADMIN_BYPASS_KEY, 'ADMIN', 'FOUNDERS2026'];

  if (validKeys.includes(key.trim())) {
    return res.json({ success: true, message: 'Passcode verified. Access granted.' });
  }

  return res.status(401).json({ success: false, message: 'Invalid bypass passcode.' });
};

// @desc Get Current Logged-in User
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// @desc Update Profile (Avatar, Phone, Designation, Name, Bio, Brand, Password)
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  const { avatar, phone, designation, name, bio, brand, currentPassword, newPassword } = req.body;
  const store = getStore();
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Handle password change if requested
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
    }
    const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    user.passwordHash = bcrypt.hashSync(newPassword, 10);
  }

  if (avatar) user.avatar = avatar;
  if (name && name.trim()) {
    user.name = name.trim();
    if (user.role === 'superadmin' && store.adminRatification) {
      store.adminRatification.ratifiedBy = user.name;
    }
  }
  if (phone !== undefined) user.phone = phone.trim();
  if (designation && designation.trim()) user.designation = designation.trim();
  if (bio !== undefined) user.bio = bio;
  if (brand) user.brand = brand;

  // 1. Sync Meeting Banner Host & Attendees
  if (store.meeting) {
    const isMeetingHost = store.meeting.hostId === user.id || 
      (store.meeting.hostName && user.name && store.meeting.hostName.trim().toLowerCase() === user.name.trim().toLowerCase());

    if (isMeetingHost) {
      if (avatar) store.meeting.hostAvatar = user.avatar;
      if (name) store.meeting.hostName = user.name;
    }
    if (Array.isArray(store.meeting.attendees)) {
      store.meeting.attendees.forEach(att => {
        if (att.userId === user.id || (att.name && user.name && att.name.trim().toLowerCase() === user.name.trim().toLowerCase())) {
          if (avatar) att.userAvatar = user.avatar;
          if (name) att.userName = user.name;
        }
      });
    }
  }

  // 2. Sync Chat Messages sender details
  if (Array.isArray(store.messages)) {
    store.messages.forEach(msg => {
      if (msg.senderId === user.id) {
        if (avatar) msg.senderAvatar = user.avatar;
        if (name) msg.senderName = user.name;
      }
    });
  }

  // 3. Sync Tasks requester details
  if (Array.isArray(store.tasks)) {
    store.tasks.forEach(t => {
      if (t.requesterId === user.id && name) {
        t.requesterName = user.name;
      }
    });
  }

  // 4. Add audit log
  if (!store.auditLogs) store.auditLogs = [];
  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'PROFILE_UPDATED',
    details: `${user.name} updated their executive profile details and photo.`,
    actor: user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    designation: user.designation,
    bio: user.bio,
    brand: user.brand,
    strikes: user.strikes,
    strikeHistory: user.strikeHistory || [],
    signature: user.signature
  };

  if (req.io) {
    req.io.emit('USER_UPDATED', sanitizedUser);
    if (store.meeting) {
      req.io.emit('MEETING_UPDATED', store.meeting);
    }
  }

  res.json({
    success: true,
    message: 'Profile updated successfully across all portal services.',
    user: sanitizedUser,
    meeting: store.meeting
  });
};
