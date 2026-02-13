const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage (will persist for session, use Firestore later)
let leads = [
  { id: '1', name: 'Yes Friends', company: 'Ethical Clothing', email: 'contact@yesfriends.com', score: 30, tier: 'COLD', source: 'Daily Lead Gen', date: 'Feb 13, 2026' },
  { id: '2', name: 'Glow Skincare', company: 'Glow Skincare Co', email: 'hello@glowskincare.com', score: 85, tier: 'HOT', source: 'Shopify Scraper', date: 'Feb 12, 2026' },
  { id: '3', name: 'Urban Threads', company: 'Urban Threads SA', email: 'info@urbanthreads.co.za', score: 72, tier: 'WARM', source: 'Google Search', date: 'Feb 11, 2026' },
  { id: '4', name: 'FitFuel Nutrition', company: 'FitFuel Supplements', email: 'sales@fitfuel.com', score: 65, tier: 'WARM', source: 'LinkedIn', date: 'Feb 10, 2026' }
];

// GET all leads
app.get('/api/leads', (req, res) => {
  console.log('GET /api/leads - returning', leads.length, 'leads');
  res.json(leads);
});

// POST new lead
app.post('/api/leads', (req, res) => {
  const newLead = {
    id: Date.now().toString(),
    ...req.body,
    date: new Date().toLocaleDateString()
  };
  leads.push(newLead);
  console.log('POST /api/leads - added', newLead.name);
  res.status(201).json(newLead);
});

// DELETE lead
app.delete('/api/leads/:id', (req, res) => {
  leads = leads.filter(l => l.id !== req.params.id);
  console.log('DELETE /api/leads/', req.params.id);
  res.json({ success: true });
});

// GET stats
app.get('/api/stats', (req, res) => {
  res.json({
    contacts: leads.length,
    revenue: 0,
    stores: 1,
    agents: 4,
    tasks: 3
  });
});

// GET tasks
app.get('/api/tasks', (req, res) => {
  res.json([
    { id: '1', title: 'Essora Store: Connect Shopify API', status: 'inprogress', priority: 'high' },
    { id: '2', title: 'Systeme.io: Complete API integration', status: 'todo', priority: 'high' },
    { id: '3', title: 'Deploy Campaign Architect', status: 'todo', priority: 'medium' }
  ]);
});

// GET agents
app.get('/api/agents', (req, res) => {
  res.json([
    { id: 'hunter', name: 'Hunter Agent', status: 'running', stats: { found: 75, qualified: 45 } },
    { id: 'outreach', name: 'Outreach Agent', status: 'idle', stats: { sent: 150, opened: 32 } },
    { id: 'creator', name: 'Creator Agent', status: 'running', stats: { posts: 12, stories: 24 } },
    { id: 'whatsapp', name: 'WhatsApp Brain', status: 'running', stats: { responded: 28, hot: 5 } }
  ]);
});

// GET stores
app.get('/api/stores', (req, res) => {
  res.json([
    { id: 'essora', name: 'Essora Store', platform: 'shopify', status: 'active', orders: 0, revenue: 0 }
  ]);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// For Vercel
module.exports = app;

// For local development
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}
