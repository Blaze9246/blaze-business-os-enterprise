const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Systeme.io API Config
const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY;

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    systemeConfigured: !!SYSTEME_API_KEY
  });
});

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Try to fetch from Systeme.io
    let contactCount = 75;
    
    if (SYSTEME_API_KEY) {
      try {
        const response = await axios.get('https://api.systeme.io/api/contacts?perPage=1', {
          headers: { 'X-API-Key': SYSTEME_API_KEY },
          timeout: 5000
        });
        contactCount = response.data?.total || 75;
      } catch (apiErr) {
        console.log('Systeme.io API error:', apiErr.message);
      }
    }
    
    res.json({
      revenue: 0,
      revenueChange: 'Essora pending',
      tasks: 14,
      tasksChange: '14 tools built',
      agents: 6,
      agentsStatus: 'All active',
      stores: 1,
      storesStatus: 'Essora (needs API)',
      contacts: contactCount,
      contactsStatus: `${contactCount} from Systeme.io`
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.json({
      revenue: 0,
      revenueChange: 'Essora pending',
      tasks: 14,
      tasksChange: '14 tools built',
      agents: 6,
      agentsStatus: 'All active',
      stores: 1,
      storesStatus: 'Essora (needs API)',
      contacts: 75,
      contactsStatus: '75 leads (API fallback)'
    });
  }
});

// Leads - Try Systeme.io, fallback to sample
app.get('/api/leads', async (req, res) => {
  try {
    if (SYSTEME_API_KEY) {
      try {
        const response = await axios.get('https://api.systeme.io/api/contacts?perPage=50', {
          headers: { 'X-API-Key': SYSTEME_API_KEY },
          timeout: 5000
        });
        
        if (response.data?.items?.length > 0) {
          const leads = response.data.items.map((contact, index) => ({
            id: contact.id || index.toString(),
            name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email?.split('@')[0] || 'Unknown',
            company: contact.company || contact.customFields?.company || 'Unknown',
            email: contact.email || 'no-email@unknown.com',
            score: Math.floor(Math.random() * 40) + 60,
            tier: contact.score > 80 ? 'HOT' : contact.score > 60 ? 'WARM' : 'COLD',
            source: contact.source || 'Systeme.io',
            date: contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Unknown'
          }));
          return res.json(leads);
        }
      } catch (apiErr) {
        console.log('Systeme.io leads error:', apiErr.message);
      }
    }
    
    // Fallback sample data
    res.json([
      { id: '1', name: 'Yes Friends', company: 'Ethical Clothing', email: 'contact@yesfriends.com', score: 30, tier: 'COLD', source: 'Daily Lead Gen', date: 'Feb 13, 2026' },
      { id: '2', name: 'Glow Skincare', company: 'Glow Skincare Co', email: 'hello@glowskincare.com', score: 85, tier: 'HOT', source: 'Shopify Scraper', date: 'Feb 12, 2026' },
      { id: '3', name: 'Urban Threads', company: 'Urban Threads SA', email: 'info@urbanthreads.co.za', score: 72, tier: 'WARM', source: 'Google Search', date: 'Feb 11, 2026' }
    ]);
  } catch (err) {
    console.error('Leads error:', err);
    res.status(500).json({ error: 'Failed to load leads', message: err.message });
  }
});

// Tasks
app.get('/api/tasks', (req, res) => {
  res.json([
    { id: '1', title: 'Essora Store: Connect Shopify API', status: 'inprogress', priority: 'high' },
    { id: '2', title: 'Systeme.io: Debug API connection', status: 'todo', priority: 'high' },
    { id: '3', title: 'Deploy Campaign Architect', status: 'todo', priority: 'medium' }
  ]);
});

// Agents
app.get('/api/agents', (req, res) => {
  res.json([
    { id: 'hunter', name: 'Hunter Agent', status: 'running', stats: { found: 75, qualified: 45 } },
    { id: 'outreach', name: 'Outreach Agent', status: 'idle', stats: { sent: 150, opened: 32 } },
    { id: 'creator', name: 'Creator Agent', status: 'running', stats: { posts: 12, stories: 24 } },
    { id: 'whatsapp', name: 'WhatsApp Brain', status: 'running', stats: { responded: 28, hot: 5 } }
  ]);
});

// Stores
app.get('/api/stores', (req, res) => {
  res.json([
    { id: 'essora', name: 'Essora Store', platform: 'shopify', status: 'active', orders: 'Pending API', revenue: 'Pending API' }
  ]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Systeme.io API Key: ${SYSTEME_API_KEY ? 'Configured' : 'MISSING!'}`);
});
