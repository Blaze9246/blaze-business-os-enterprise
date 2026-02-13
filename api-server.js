const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

// Load data from file or use defaults
async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      leads: [
        { id: '1', name: 'Yes Friends', company: 'Ethical Clothing', email: 'contact@yesfriends.com', score: 30, tier: 'COLD', source: 'Daily Lead Gen', date: 'Feb 13, 2026' },
        { id: '2', name: 'Glow Skincare', company: 'Glow Skincare Co', email: 'hello@glowskincare.com', score: 85, tier: 'HOT', source: 'Shopify Scraper', date: 'Feb 12, 2026' },
        { id: '3', name: 'Urban Threads', company: 'Urban Threads SA', email: 'info@urbanthreads.co.za', score: 72, tier: 'WARM', source: 'Google Search', date: 'Feb 11, 2026' },
        { id: '4', name: 'FitFuel Nutrition', company: 'FitFuel Supplements', email: 'sales@fitfuel.com', score: 65, tier: 'WARM', source: 'LinkedIn', date: 'Feb 10, 2026' }
      ],
      agents: [
        { id: 'hunter', name: 'Hunter Agent', status: 'running', stats: { found: 75, qualified: 45 } },
        { id: 'outreach', name: 'Outreach Agent', status: 'idle', stats: { sent: 150, opened: 32 } },
        { id: 'creator', name: 'Creator Agent', status: 'running', stats: { posts: 12, stories: 24 } },
        { id: 'whatsapp', name: 'WhatsApp Brain', status: 'running', stats: { responded: 28, hot: 5 } }
      ],
      tasks: [
        { id: '1', title: 'Essora Store: Connect Shopify API', status: 'inprogress', priority: 'high' },
        { id: '2', title: 'Systeme.io: Complete API integration', status: 'todo', priority: 'high' },
        { id: '3', title: 'Deploy Campaign Architect', status: 'todo', priority: 'medium' }
      ],
      stores: [
        { id: 'essora', name: 'Essora Store', platform: 'shopify', status: 'active', orders: 0, revenue: 0 }
      ]
    };
  }
}

async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

let data = null;

// Initialize
loadData().then(d => { data = d; console.log('Data loaded'); });

// GET leads
app.get('/api/leads', (req, res) => {
  res.json(data.leads);
});

// POST new lead
app.post('/api/leads', async (req, res) => {
  const newLead = {
    id: Date.now().toString(),
    ...req.body,
    date: new Date().toLocaleDateString()
  };
  data.leads.push(newLead);
  await saveData(data);
  res.status(201).json(newLead);
});

// DELETE lead
app.delete('/api/leads/:id', async (req, res) => {
  data.leads = data.leads.filter(l => l.id !== req.params.id);
  await saveData(data);
  res.json({ success: true });
});

// GET stats
app.get('/api/stats', (req, res) => {
  res.json({
    contacts: data.leads.length,
    revenue: 0,
    stores: data.stores.length,
    agents: data.agents.length,
    tasks: data.tasks.length
  });
});

// GET tasks
app.get('/api/tasks', (req, res) => {
  res.json(data.tasks);
});

// GET agents
app.get('/api/agents', (req, res) => {
  res.json(data.agents);
});

// GET stores
app.get('/api/stores', (req, res) => {
  res.json(data.stores);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
