const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const initialSeed = require('../config/initialSeed');

const adminPassword = 'Admin12345';
const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync(adminPassword, salt);

const cleanData = {
  isProvisioned: true,
  users: [
    {
      id: 'user_admin_01',
      name: 'Soham Dutta',
      email: 'sohamduttabwn@gmail.com',
      role: 'superadmin',
      designation: 'Managing Partner & Lead Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      phone: '+91 98765 43210',
      status: 'active',
      strikes: 0,
      strikeHistory: [],
      mustChangePassword: false,
      isOnboarded: true,
      signature: {
        signed: true,
        signatureData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-family="cursive" font-size="24" fill="%230f172a">Soham Dutta</text></svg>',
        date: '24/09/2026',
        hash: 'SHA:ADMIN_INIT_RATIFICATION'
      },
      passwordHash: passwordHash,
      createdAt: new Date().toISOString()
    }
  ],
  rules: initialSeed.initialRules,
  adminRatification: {
    ratified: true,
    date: '24/09/2026',
    ratifiedBy: 'Soham Dutta',
    hash: 'SHA:ADMIN_INIT_RATIFICATION'
  },
  foundersSignatures: [],
  clientProjects: [],
  tasks: [],
  meeting: null,
  meetings: [],
  messages: [],
  sharedExpenses: [],
  notifications: [],
  auditLogs: [
    {
      id: 'log_fresh_init',
      action: 'SYSTEM_PROVISIONED',
      details: 'Fresh workspace initialized with Lead Admin Soham Dutta (sohamduttabwn@gmail.com).',
      actor: 'SYSTEM_PROVISION',
      timestamp: new Date().toISOString()
    }
  ],
  settings: {
    brandName: 'Weblets® × StackAdda™',
    tagline: 'Three Founders. Two Brands. One Standard.',
    comingSoonActive: false,
    securityFreezeActive: false,
    emergencyNotice: ''
  }
};

const storePath = path.join(__dirname, '..', 'data', 'store.json');
fs.writeFileSync(storePath, JSON.stringify(cleanData, null, 2), 'utf-8');
console.log('Successfully written clean store with new admin: sohamduttabwn@gmail.com');
