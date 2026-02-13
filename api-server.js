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

// Health check
app.get('/', (req, res) => {
  res.json({ status: '✅ Blaze Enterprise API is running', timestamp: new Date().toISOString() });
});

// GET /api/stats - Dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const leadsSnap = await db.collection('leads').get();
    const agentsSnap = await db.collection('agents').get();
    const tasksSnap = await db.collection('tasks').get();
    
    res.json({
      contacts: leadsSnap.size,
      revenue: 0,
      agents: agentsSnap.size || 4,
      tasks: tasksSnap.size,
      stores: 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads - Get all leads
app.get('/api/leads', async (req, res) => {
  try {
    const snapshot = await db.collection('leads').orderBy('createdAt', 'desc').get();
    const leads = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        company: data.company || '',
        email: data.email || '',
        score: data.score || 0,
        tier: data.tier || 'COLD',
        source: data.source || '',
        date: data.date || new Date().toLocaleDateString(),
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      };
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads - Add new lead
app.post('/api/leads', async (req, res) => {
  try {
    const newLead = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      date: new Date().toLocaleDateString()
    };
    const docRef = await db.collection('leads').add(newLead);
    res.status(201).json({ id: docRef.id, ...newLead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id - Delete lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    await db.collection('leads').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/agents - Get all agents
app.get('/api/agents', async (req, res) => {
  try {
    const snapshot = await db.collection('agents').get();
    const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/agents/:id - Update agent status
app.put('/api/agents/:id', async (req, res) => {
  try {
    await db.collection('agents').doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks - Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const snapshot = await db.collection('tasks').orderBy('createdAt', 'desc').get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks - Add new task
app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('tasks').add(newTask);
    res.status(201).json({ id: docRef.id, ...newTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    await db.collection('tasks').doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await db.collection('tasks').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/systeme/contacts - Pull from Systeme.io
app.get('/api/systeme/contacts', async (req, res) => {
  try {
    // In production, this would call Systeme.io API
    // For now, return leads as mock Systeme.io contacts
    const snapshot = await db.collection('leads').limit(10).get();
    const contacts = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        email: d.email,
        name: d.name,
        tags: [d.tier, d.source].filter(Boolean)
      };
    });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/systeme/sync - Two-way sync
app.post('/api/systeme/sync', async (req, res) => {
  try {
    // Mock sync - in production would sync with Systeme.io API
    const leadsSnap = await db.collection('leads').get();
    res.json({
      pulled: 0,
      imported: 0,
      skipped: leadsSnap.size,
      pushed: 0,
      message: 'Sync completed (mock - Systeme.io integration pending)'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/seed - Seed database with sample data
app.get('/api/seed', async (req, res) => {
  try {
    // Check if already seeded
    const existing = await db.collection('leads').limit(1).get();
    if (!existing.empty) {
      return res.json({ message: 'Already seeded', count: (await db.collection('leads').get()).size });
    }
    
    // Seed leads
    const leads = [
      { name: 'Yes Friends', company: 'Ethical Clothing', email: 'contact@yesfriends.com', score: 30, tier: 'COLD', source: 'Daily Lead Gen', date: 'Feb 13, 2026' },
      { name: 'Glow Skincare', company: 'Glow Skincare Co', email: 'hello@glowskincare.com', score: 85, tier: 'HOT', source: 'Shopify Scraper', date: 'Feb 12, 2026' },
      { name: 'Urban Threads', company: 'Urban Threads SA', email: 'info@urbanthreads.co.za', score: 72, tier: 'WARM', source: 'Google Search', date: 'Feb 11, 2026' },
      { name: 'FitFuel Nutrition', company: 'FitFuel Supplements', email: 'sales@fitfuel.com', score: 65, tier: 'WARM', source: 'LinkedIn', date: 'Feb 10, 2026' }
    ];
    
    for (const lead of leads) {
      await db.collection('leads').add({...lead, createdAt: admin.firestore.FieldValue.serverTimestamp()});
    }
    
    // Seed agents
    const agents = [
      { id: 'hunter', name: 'Hunter Agent', status: 'running', stats: { found: 75, qualified: 45 } },
      { id: 'outreach', name: 'Outreach Agent', status: 'idle', stats: { sent: 150, opened: 32 } },
      { id: 'creator', name: 'Creator Agent', status: 'running', stats: { posts: 12, stories: 24 } },
      { id: 'whatsapp', name: 'WhatsApp Brain', status: 'running', stats: { responded: 28, hot: 5 } }
    ];
    
    for (const agent of agents) {
      await db.collection('agents').doc(agent.id).set(agent);
    }
    
    // Seed tasks
    const tasks = [
      { title: 'Essora Store: Connect Shopify API', status: 'inprogress', priority: 'high', createdAt: admin.firestore.FieldValue.serverTimestamp() },
      { title: 'Systeme.io: Complete API integration', status: 'todo', priority: 'high', createdAt: admin.firestore.FieldValue.serverTimestamp() },
      { title: 'Deploy Campaign Architect', status: 'todo', priority: 'medium', createdAt: admin.firestore.FieldValue.serverTimestamp() }
    ];
    
    for (const task of tasks) {
      await db.collection('tasks').add(task);
    }
    
    res.json({ success: true, message: 'Database seeded with sample data' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Blaze Enterprise API running on port ${PORT}`));
