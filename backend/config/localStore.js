const fs = require('fs');
const path = require('path');
const initialSeed = require('./initialSeed');

const dataDir = path.join(__dirname, '../data');
const storeFilePath = path.join(dataDir, 'store.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize store file if not present
if (!fs.existsSync(storeFilePath)) {
  const initialData = {
    isProvisioned: true,
    users: initialSeed.initialUsers,
    rules: initialSeed.initialRules,
    adminRatification: initialSeed.initialAdminRatification,
    clientProjects: initialSeed.initialClientProjects,
    tasks: initialSeed.initialTasks,
    meeting: initialSeed.initialMeeting,
    messages: initialSeed.initialChatMessages,
    sharedExpenses: initialSeed.initialSharedExpenses,
    auditLogs: initialSeed.initialAuditLogs,
    settings: {
      brandName: 'Weblets® × StackAdda™',
      tagline: 'Three Founders. Two Brands. One Standard.',
      comingSoonActive: true,
      securityFreezeActive: false,
      emergencyNotice: 'Notice: Next executive sprint review scheduled for tomorrow 8:00 PM.'
    }
  };
  fs.writeFileSync(storeFilePath, JSON.stringify(initialData, null, 2), 'utf-8');
}

const getStore = () => {
  try {
    const raw = fs.readFileSync(storeFilePath, 'utf-8');
    const data = JSON.parse(raw);
    if (data && !Array.isArray(data.meetings)) {
      data.meetings = data.meeting ? [data.meeting] : [];
    }
    return data;
  } catch (err) {
    console.error('Error reading local store:', err);
    return null;
  }
};

const saveStore = (data) => {
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving local store:', err);
    return false;
  }
};

const resetStoreToBlank = () => {
  const blankData = {
    isProvisioned: false, // Triggers single admin 1-time setup wizard
    users: [],
    rules: initialSeed.initialRules,
    adminRatification: {
      quote: "I, Lead Admin, hereby ratify, execute and officially enforce the Founders' Strict Rules & Agreement (Version 2.0) across Weblets and StackAdda.",
      ratifiedBy: "SSA TEAM",
      date: new Date().toLocaleDateString(),
      sealType: "gold_crest",
      signatureText: "",
      verified: false
    },
    clientProjects: [],
    tasks: [],
    meeting: null,
    messages: [],
    sharedExpenses: [],
    auditLogs: [
      {
        id: `log_${Date.now()}`,
        action: 'FACTORY_RESET',
        details: 'System wiped clean. Ready for single Super Admin provisioning.',
        actor: 'SUPER_ADMIN',
        timestamp: new Date().toISOString()
      }
    ],
    settings: {
      brandName: 'Weblets® × StackAdda™',
      tagline: 'Three Founders. Two Brands. One Standard.',
      comingSoonActive: true,
      securityFreezeActive: false,
      emergencyNotice: 'System initialized. Welcome to Founders Workspace.'
    }
  };
  saveStore(blankData);
  return blankData;
};

module.exports = {
  getStore,
  saveStore,
  resetStoreToBlank,
  storeFilePath
};
