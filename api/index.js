const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Systeme.io API Config
const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    systemeConfigured: !!SYSTEME_API_KEY
  });
});

// Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  res.json({
    revenue: 0,
    revenueChange: 'Essora pending',
    tasks: 14,
    tasksChange: '14 tools built',
    agents: 6,
    agentsStatus: 'All active',
    stores: 1,
    storesStatus: 'Essora (needs API)',
    contacts: SYSTEME_API_KEY ? 'Connecting...' : 75,
    contactsStatus: SYSTEME_API_KEY ? 'Systeme.io API ready' : '75 leads (fallback)'
  });
});

// Leads
app.get('/api/leads', async (req, res) => {
  // Return sample data for now - Systeme.io integration needs debugging
  res.json([
    { id: '1', name: 'Yes Friends', company: 'Ethical Clothing', email: 'contact@yesfriends.com', score: 30, tier: 'COLD', source: 'Daily Lead Gen', date: 'Feb 13, 2026' },
    { id: '2', name: 'Glow Skincare', company: 'Glow Skincare Co', email: 'hello@glowskincare.com', score: 85, tier: 'HOT', source: 'Shopify Scraper', date: 'Feb 12, 2026' },
    { id: '3', name: 'Urban Threads', company: 'Urban Threads SA', email: 'info@urbanthreads.co.za', score: 72, tier: 'WARM', source: 'Google Search', date: 'Feb 11, 2026' },
    { id: '4', name: 'FitFuel Nutrition', company: 'FitFuel Supplements', email: 'sales@fitfuel.com', score: 65, tier: 'WARM', source: 'LinkedIn', date: 'Feb 10, 2026' }
  ]);
});

// Tasks
app.get('/api/tasks', (req, res) => {
  res.json([
    { id: '1', title: 'Essora Store: Connect Shopify API', status: 'inprogress', priority: 'high' },
    { id: '2', title: 'Systeme.io: Complete API integration', status: 'todo', priority: 'high' },
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

// For Vercel serverless
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
