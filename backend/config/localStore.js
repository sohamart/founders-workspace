const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const initialSeed = require('./initialSeed');

const dataDir = path.join(__dirname, '../data');
const storeFilePath = path.join(dataDir, 'store.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Mongoose Schema for resilient Cloud Persistence across serverless/ephemeral deploys
const StoreSchema = new mongoose.Schema({
  key: { type: String, default: 'workspace_store', unique: true },
  data: { type: Object, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const StoreModel = mongoose.models.StoreModel || mongoose.model('StoreModel', StoreSchema);

// In-memory reference for ultra-low latency reads
let inMemoryStore = null;

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

const syncFromMongo = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const doc = await StoreModel.findOne({ key: 'workspace_store' });
      if (doc && doc.data && Array.isArray(doc.data.users) && doc.data.users.length > 0) {
        inMemoryStore = doc.data;
        fs.writeFileSync(storeFilePath, JSON.stringify(doc.data, null, 2), 'utf-8');
        console.log(`☁️  Synced ${doc.data.users.length} users & workspace data from MongoDB Atlas!`);
        return true;
      } else {
        // Seed MongoDB from current store.json
        const currentData = getStore();
        if (currentData) {
          await StoreModel.findOneAndUpdate(
            { key: 'workspace_store' },
            { data: currentData, updatedAt: new Date() },
            { upsert: true, new: true }
          );
          console.log(`☁️  Initialized MongoDB Atlas with current store data (${currentData.users.length} users).`);
        }
      }
    }
  } catch (err) {
    console.error('⚠️  Could not sync from MongoDB:', err.message);
  }
  return false;
};

const getStore = () => {
  try {
    if (inMemoryStore) {
      if (!Array.isArray(inMemoryStore.meetings)) {
        inMemoryStore.meetings = inMemoryStore.meeting ? [inMemoryStore.meeting] : [];
      }
      return inMemoryStore;
    }
    const raw = fs.readFileSync(storeFilePath, 'utf-8');
    const data = JSON.parse(raw);
    if (data && !Array.isArray(data.meetings)) {
      data.meetings = data.meeting ? [data.meeting] : [];
    }
    inMemoryStore = data;
    return data;
  } catch (err) {
    console.error('Error reading local store:', err);
    return null;
  }
};

const saveStore = (data) => {
  try {
    inMemoryStore = data;
    fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), 'utf-8');

    // Asynchronously save to MongoDB Atlas so ephemeral hosting never loses data
    if (mongoose.connection.readyState === 1) {
      StoreModel.findOneAndUpdate(
        { key: 'workspace_store' },
        { data, updatedAt: new Date() },
        { upsert: true, new: true }
      ).catch(err => console.error('⚠️ MongoDB persist error:', err.message));
    }
    return true;
  } catch (err) {
    console.error('Error saving local store:', err);
    return false;
  }
};

const resetStoreToBlank = () => {
  const blankData = {
    isProvisioned: false,
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
  syncFromMongo,
  resetStoreToBlank,
  storeFilePath
};
