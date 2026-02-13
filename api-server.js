const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json'))
});

const db = admin.firestore();

// GET leads
app.get('/api/leads', async (req, res) => {
  try {
    const snapshot = await db.collection('leads').orderBy('createdAt', 'desc').get();
    const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new lead
app.post('/api/leads', async (req, res) => {
  try {
    const newLead = { ...req.body, createdAt: admin.firestore.FieldValue.serverTimestamp() };
    const docRef = await db.collection('leads').add(newLead);
    res.status(201).json({ id: docRef.id, ...newLead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats
app.get('/api/stats', async (req, res) => {
  try {
    const leadsSnap = await db.collection('leads').count().get();
    res.json({ contacts: leadsSnap.data().count, revenue: 0, stores: 1, agents: 4, tasks: 3 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const snapshot = await db.collection('tasks').get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET agents
app.get('/api/agents', async (req, res) => {
  try {
    const snapshot = await db.collection('agents').get();
    const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed data
app.get('/api/seed', async (req, res) => {
  try {
    const existing = await db.collection('leads').limit(1).get();
    if (!existing.empty) return res.json({ message: 'Already seeded' });
    
    const leads = [
      { name: 'Yes Friends', company: 'Ethical Clothing', email: 'contact@yesfriends.com', score: 30, tier: 'COLD', source: 'Daily Lead Gen', date: 'Feb 13, 2026', createdAt: new Date() },
      { name: 'Glow Skincare', company: 'Glow Skincare Co', email: 'hello@glowskincare.com', score: 85, tier: 'HOT', source: 'Shopify Scraper', date: 'Feb 12, 2026', createdAt: new Date() },
      { name: 'Urban Threads', company: 'Urban Threads SA', email: 'info@urbanthreads.co.za', score: 72, tier: 'WARM', source: 'Google Search', date: 'Feb 11, 2026', createdAt: new Date() },
      { name: 'FitFuel Nutrition', company: 'FitFuel Supplements', email: 'sales@fitfuel.com', score: 65, tier: 'WARM', source: 'LinkedIn', date: 'Feb 10, 2026', createdAt: new Date() }
    ];
    
    for (const lead of leads) await db.collection('leads').add(lead);
    
    const agents = [
      { id: 'hunter', name: 'Hunter Agent', status: 'running', stats: { found: 75, qualified: 45 } },
      { id: 'outreach', name: 'Outreach Agent', status: 'idle', stats: { sent: 150, opened: 32 } },
      { id: 'creator', name: 'Creator Agent', status: 'running', stats: { posts: 12, stories: 24 } },
      { id: 'whatsapp', name: 'WhatsApp Brain', status: 'running', stats: { responded: 28, hot: 5 } }
    ];
    for (const agent of agents) await db.collection('agents').doc(agent.id).set(agent);
    
    const tasks = [
      { title: 'Essora Store: Connect Shopify API', status: 'inprogress', priority: 'high' },
      { title: 'Systeme.io: Complete API integration', status: 'todo', priority: 'high' },
      { title: 'Deploy Campaign Architect', status: 'todo', priority: 'medium' }
    ];
    for (const task of tasks) await db.collection('tasks').add(task);
    
    res.json({ success: true, message: 'Database seeded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
