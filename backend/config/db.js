const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

let isMongoConnected = false;
const dataDir = path.join(__dirname, '../data');
const storeFile = path.join(dataDir, 'store.json');

// Ensure local fallback data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Resilient DB Connection
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === '') {
    console.log('ℹ️  MONGODB_URI not configured. Operating in high-performance local persistent JSON store mode.');
    isMongoConnected = false;
    return;
  }

  // Configure high-reliability DNS resolvers (Google 8.8.8.8 & Cloudflare 1.1.1.1)
  // to prevent Windows / local ISP DNS SRV refusal (querySrv ECONNREFUSED)
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (dnsErr) {
    // Keep default resolver if setServers fails
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isMongoConnected = true;
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection failed (${error.message}). Falling back to local persistent store mode.`);
    isMongoConnected = false;
  }
};

const getDBStatus = () => ({
  isMongoConnected,
  storeMode: isMongoConnected ? 'MongoDB (Cloud/Local)' : 'Local File Store (0-Config Mode)',
});

module.exports = { connectDB, getDBStatus, storeFile };
