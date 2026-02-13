// Storage module - supports both file-based (local/Railway) and memory-based (Vercel)
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// Detect if running on Vercel (serverless, read-only fs)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV || !fs.access;

// In-memory storage for Vercel
let memoryData = null;

// Initialize data structure
function getInitialData() {
  return {
    leads: [],
    agents: [
      { id: 'hunter', name: 'Hunter Agent', role: 'Finds leads via scraping', status: 'running', icon: '🎯', stats: { found: 234 } },
      { id: 'outreach', name: 'Outreach Agent', role: 'Sends emails & DMs', status: 'idle', icon: '📧', stats: { sent: 1847 } },
      { id: 'creator', name: 'Creator Agent', role: 'Generates content', status: 'running', icon: '🎨', stats: { posts: 89 } },
      { id: 'whatsapp', name: 'WhatsApp Brain', role: 'Manages WhatsApp', status: 'idle', icon: '💬', stats: { responded: 156 } }
    ],
    tasks: [
      { id: '1', title: 'Follow up with Lerato Molefe', priority: 'high', status: 'pending', agent: 'outreach', createdAt: new Date().toISOString() },
      { id: '2', title: 'Generate Instagram carousel for Glow Digital', priority: 'medium', status: 'in-progress', agent: 'creator', createdAt: new Date().toISOString() },
      { id: '3', title: 'Audit Botha Wines Shopify store', priority: 'low', status: 'pending', agent: 'hunter', createdAt: new Date().toISOString() },
      { id: '4', title: 'Send onboarding docs to Ayanda', priority: 'high', status: 'done', agent: 'whatsapp', createdAt: new Date().toISOString() },
      { id: '5', title: 'Scrape 50 new Cape Town e-commerce leads', priority: 'medium', status: 'pending', agent: 'hunter', createdAt: new Date().toISOString() }
    ],
    stores: [{ id: 'essora', name: 'Essora Store', platform: 'shopify', status: 'active' }],
    version: 1,
    lastUpdated: new Date().toISOString(),
    storageMode: isVercel ? 'memory' : 'file'
  };
}

// Initialize storage
async function initStorage() {
  if (isVercel) {
    // Use in-memory storage for Vercel
    if (!memoryData) {
      memoryData = getInitialData();
      console.log('✅ Using in-memory storage (Vercel mode)');
    }
    return;
  }
  
  // Use file storage for local/Railway
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify(getInitialData(), null, 2));
      console.log('✅ Created initial database file');
    }
  } catch (err) {
    console.error('Storage init error:', err);
    // Fallback to memory
    if (!memoryData) memoryData = getInitialData();
  }
}

// Load data
async function loadData() {
  if (isVercel || memoryData) {
    return memoryData || getInitialData();
  }
  
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Load data error:', err);
    return getInitialData();
  }
}

// Save data
async function saveData(data) {
  data.lastUpdated = new Date().toISOString();
  data.version = (data.version || 0) + 1;
  
  if (isVercel) {
    // Save to memory on Vercel
    memoryData = data;
    return true;
  }
  
  // Save to file with backup
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
    
    try {
      await fs.copyFile(DATA_FILE, backupFile);
      const backups = await fs.readdir(BACKUP_DIR);
      if (backups.length > 10) {
        const sorted = backups.sort();
        for (let i = 0; i < sorted.length - 10; i++) {
          await fs.unlink(path.join(BACKUP_DIR, sorted[i]));
        }
      }
    } catch (e) {
      // No existing file to backup
    }
    
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Save data error:', err);
    // Fallback to memory
    memoryData = data;
    return true;
  }
}

// Generate ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

module.exports = {
  initStorage,
  loadData,
  saveData,
  generateId,
  isVercel,
  DATA_FILE,
  BACKUP_DIR
};
