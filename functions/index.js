const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(require('../serviceAccountKey.json'))
});

const db = admin.firestore();

// CORS middleware
const cors = require('cors')({ origin: true });

// GET /api/leads - Get all leads
exports.getLeads = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const leadsSnapshot = await db.collection('leads').orderBy('createdAt', 'desc').get();
      const leads = leadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(leads);
    } catch (error) {
      console.error('Error getting leads:', error);
      res.status(500).json({ error: 'Failed to get leads' });
    }
  });
});

// POST /api/leads - Add new lead
exports.addLead = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      const newLead = {
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await db.collection('leads').add(newLead);
      res.status(201).json({ id: docRef.id, ...newLead });
    } catch (error) {
      console.error('Error adding lead:', error);
      res.status(500).json({ error: 'Failed to add lead' });
    }
  });
});

// DELETE /api/leads/:id - Delete lead
exports.deleteLead = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      const leadId = req.path.split('/').pop();
      await db.collection('leads').doc(leadId).delete();
      res.json({ success: true, id: leadId });
    } catch (error) {
      console.error('Error deleting lead:', error);
      res.status(500).json({ error: 'Failed to delete lead' });
    }
  });
});

// GET /api/stats - Get dashboard stats
exports.getStats = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const [leadsSnap, storesSnap] = await Promise.all([
        db.collection('leads').count().get(),
        db.collection('stores').count().get()
      ]);
      
      res.json({
        contacts: leadsSnap.data().count,
        revenue: 0,
        stores: storesSnap.data().count || 1,
        agents: 4,
        tasks: 3
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  });
});

// GET /api/tasks - Get all tasks
exports.getTasks = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const tasksSnapshot = await db.collection('tasks').orderBy('createdAt', 'desc').get();
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(tasks);
    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  });
});

// GET /api/agents - Get all agents
exports.getAgents = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const agentsSnapshot = await db.collection('agents').get();
      const agents = agentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(agents);
    } catch (error) {
      console.error('Error getting agents:', error);
      res.status(500).json({ error: 'Failed to get agents' });
    }
  });
});

// GET /api/stores - Get all stores
exports.getStores = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const storesSnapshot = await db.collection('stores').get();
      const stores = storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(stores);
    } catch (error) {
      console.error('Error getting stores:', error);
      res.status(500).json({ error: 'Failed to get stores' });
    }
  });
});

// Seed data function (run once)
exports.seedData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Seed leads
      const leads = [
        { name: 'Yes Friends', company: 'Ethical Clothing', email: 'contact@yesfriends.com', score: 30, tier: 'COLD', source: 'Daily Lead Gen', date: 'Feb 13, 2026', createdAt: new Date() },
        { name: 'Glow Skincare', company: 'Glow Skincare Co', email: 'hello@glowskincare.com', score: 85, tier: 'HOT', source: 'Shopify Scraper', date: 'Feb 12, 2026', createdAt: new Date() },
        { name: 'Urban Threads', company: 'Urban Threads SA', email: 'info@urbanthreads.co.za', score: 72, tier: 'WARM', source: 'Google Search', date: 'Feb 11, 2026', createdAt: new Date() },
        { name: 'FitFuel Nutrition', company: 'FitFuel Supplements', email: 'sales@fitfuel.com', score: 65, tier: 'WARM', source: 'LinkedIn', date: 'Feb 10, 2026', createdAt: new Date() }
      ];
      
      for (const lead of leads) {
        await db.collection('leads').add(lead);
      }
      
      // Seed agents
      const agents = [
        { id: 'hunter', name: 'Hunter Agent', status: 'running', stats: { found: 75, qualified: 45 }, color: 'from-purple-500 to-pink-500' },
        { id: 'outreach', name: 'Outreach Agent', status: 'idle', stats: { sent: 150, opened: 32 }, color: 'from-blue-500 to-cyan-500' },
        { id: 'creator', name: 'Creator Agent', status: 'running', stats: { posts: 12, stories: 24 }, color: 'from-green-500 to-emerald-500' },
        { id: 'whatsapp', name: 'WhatsApp Brain', status: 'running', stats: { responded: 28, hot: 5 }, color: 'from-orange-500 to-red-500' }
      ];
      
      for (const agent of agents) {
        await db.collection('agents').doc(agent.id).set(agent);
      }
      
      // Seed stores
      await db.collection('stores').doc('essora').set({
        name: 'Essora Store',
        platform: 'shopify',
        status: 'active',
        orders: 0,
        revenue: 0
      });
      
      // Seed tasks
      const tasks = [
        { title: 'Essora Store: Connect Shopify API', status: 'inprogress', priority: 'high', description: 'Integrate Essora store data', createdAt: new Date() },
        { title: 'Systeme.io: Complete API integration', status: 'todo', priority: 'high', description: 'Connect contacts from Systeme.io', createdAt: new Date() },
        { title: 'Deploy Campaign Architect', status: 'todo', priority: 'medium', description: 'Launch campaign generator tool', createdAt: new Date() }
      ];
      
      for (const task of tasks) {
        await db.collection('tasks').add(task);
      }
      
      res.json({ success: true, message: 'Data seeded successfully' });
    } catch (error) {
      console.error('Error seeding data:', error);
      res.status(500).json({ error: 'Failed to seed data' });
    }
  });
});
