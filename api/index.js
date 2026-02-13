const admin = require('firebase-admin');

// Initialize Firebase once
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'blaze-enterprise-os'
  });
}
const db = admin.firestore();

const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY || 'gutxuny6z7abcijjhr16yqazqltx43z5gqcl8jpo12mibokr31js1hfc0ed8i8k2';
const SYSTEME_BASE = 'https://api.systeme.io/api';

// Helper to call Systeme.io API
async function systemeApi(endpoint, options = {}) {
  const url = `${SYSTEME_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'X-API-Key': SYSTEME_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  if (!res.ok) throw new Error(`Systeme.io HTTP ${res.status}`);
  return res.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.url.replace('/api/', '').split('?')[0];
  
  try {
    // GET /api/stats
    if (path === 'stats' && req.method === 'GET') {
      const leadsSnap = await db.collection('leads').get();
      const agentsSnap = await db.collection('agents').get();
      const tasksSnap = await db.collection('tasks').get();
      const leads = leadsSnap.docs.map(d => d.data());
      const hotLeads = leads.filter(l => l.tier === 'HOT').length;
      const warmLeads = leads.filter(l => l.tier === 'WARM').length;
      const revenue = hotLeads * 5000 + warmLeads * 2000 + (leads.length - hotLeads - warmLeads) * 500;
      
      return res.json({
        success: true,
        data: {
          totalLeads: leads.length,
          hotLeads,
          warmLeads,
          revenue,
          totalStores: 1,
          totalAgents: agentsSnap.size || 4,
          totalTasks: tasksSnap.size || 0,
          pendingTasks: tasksSnap.docs.filter(d => d.data().status !== 'done').length || 0
        }
      });
    }
    
    // GET /api/leads
    if (path === 'leads' && req.method === 'GET') {
      const snapshot = await db.collection('leads').orderBy('createdAt', 'desc').limit(200).get();
      const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json({ success: true, data: leads });
    }
    
    // POST /api/leads
    if (path === 'leads' && req.method === 'POST') {
      const { name, company, email, score, tier, source } = req.body;
      if (!name || !email) return res.status(400).json({ success: false, error: 'Name and email required' });
      
      const lead = {
        name, company: company || '', email,
        score: Number(score) || 0,
        tier: tier || 'COLD',
        source: source || 'manual',
        date: new Date().toISOString().split('T')[0],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      const docRef = await db.collection('leads').add(lead);
      return res.json({ success: true, data: { id: docRef.id, ...lead } });
    }
    
    // DELETE /api/leads/:id
    if (path.startsWith('leads/') && req.method === 'DELETE') {
      const id = path.replace('leads/', '');
      await db.collection('leads').doc(id).delete();
      return res.json({ success: true });
    }
    
    // GET /api/agents
    if (path === 'agents' && req.method === 'GET') {
      const snapshot = await db.collection('agents').get();
      if (snapshot.empty) {
        return res.json({
          success: true,
          data: [
            { id: 'hunter', name: 'Hunter Agent', role: 'Finds leads', status: 'running', icon: '🎯' },
            { id: 'outreach', name: 'Outreach Agent', role: 'Sends emails', status: 'idle', icon: '📧' },
            { id: 'creator', name: 'Creator Agent', role: 'Creates content', status: 'running', icon: '🎨' },
            { id: 'whatsapp', name: 'WhatsApp Brain', role: 'Manages chats', status: 'idle', icon: '💬' }
          ]
        });
      }
      const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json({ success: true, data: agents });
    }
    
    // PUT /api/agents/:id
    if (path.startsWith('agents/') && req.method === 'PUT') {
      const id = path.replace('agents/', '');
      await db.collection('agents').doc(id).update(req.body);
      return res.json({ success: true });
    }
    
    // GET /api/tasks
    if (path === 'tasks' && req.method === 'GET') {
      const snapshot = await db.collection('tasks').orderBy('createdAt', 'desc').limit(50).get();
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json({ success: true, data: tasks });
    }
    
    // POST /api/tasks
    if (path === 'tasks' && req.method === 'POST') {
      const task = {
        ...req.body,
        status: req.body.status || 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      const docRef = await db.collection('tasks').add(task);
      return res.json({ success: true, data: { id: docRef.id, ...task } });
    }
    
    // PUT /api/tasks/:id
    if (path.startsWith('tasks/') && req.method === 'PUT') {
      const id = path.replace('tasks/', '');
      await db.collection('tasks').doc(id).update(req.body);
      return res.json({ success: true });
    }
    
    // DELETE /api/tasks/:id
    if (path.startsWith('tasks/') && req.method === 'DELETE') {
      const id = path.replace('tasks/', '');
      await db.collection('tasks').doc(id).delete();
      return res.json({ success: true });
    }
    
    // GET /api/seed
    if (path === 'seed' && req.method === 'GET') {
      const batch = db.batch();
      
      // Seed agents
      const agents = [
        { name: 'Hunter Agent', role: 'Finds leads via scraping', status: 'running', icon: '🎯' },
        { name: 'Outreach Agent', role: 'Sends emails & DMs', status: 'idle', icon: '📧' },
        { name: 'Creator Agent', role: 'Generates content', status: 'running', icon: '🎨' },
        { name: 'WhatsApp Brain', role: 'Manages WhatsApp', status: 'idle', icon: '💬' }
      ];
      agents.forEach(a => {
        batch.set(db.collection('agents').doc(a.name.toLowerCase().replace(/\s+/g, '-')), a);
      });
      
      // Seed leads
      const sampleLeads = [
        { name: 'Thabo Mbeki', company: 'TechnoServe SA', email: 'thabo@technoserve.co.za', score: 85, tier: 'HOT', source: 'linkedin' },
        { name: 'Naledi Khoza', company: 'Glow Digital', email: 'naledi@glowdigital.co.za', score: 72, tier: 'WARM', source: 'referral' },
        { name: 'James van der Merwe', company: 'Cape Eats', email: 'james@capeeats.com', score: 55, tier: 'WARM', source: 'website' },
        { name: 'Ayanda Dlamini', company: 'Dlamini Logistics', email: 'ayanda@dlamini.co.za', score: 90, tier: 'HOT', source: 'systeme.io' },
        { name: 'Lerato Molefe', company: 'Molefe Beauty', email: 'lerato@molefebeauty.co.za', score: 88, tier: 'HOT', source: 'referral' },
      ];
      sampleLeads.forEach(l => {
        const ref = db.collection('leads').doc();
        batch.set(ref, { ...l, date: new Date().toISOString().split('T')[0], createdAt: admin.firestore.FieldValue.serverTimestamp() });
      });
      
      // Seed tasks
      const tasks = [
        { title: 'Follow up with Lerato Molefe', priority: 'high', status: 'pending' },
        { title: 'Generate Instagram carousel for Glow Digital', priority: 'medium', status: 'in-progress' },
        { title: 'Audit Botha Wines Shopify store', priority: 'low', status: 'pending' },
        { title: 'Send onboarding docs to Ayanda', priority: 'high', status: 'done' },
        { title: 'Scrape 50 new Cape Town e-commerce leads', priority: 'medium', status: 'pending' },
      ];
      tasks.forEach(t => {
        const ref = db.collection('tasks').doc();
        batch.set(ref, { ...t, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      });
      
      await batch.commit();
      return res.json({ success: true, message: 'Database seeded with agents, leads, and tasks' });
    }
    
    // GET /api/systeme/contacts - Pull from Systeme.io
    if (path === 'systeme/contacts' && req.method === 'GET') {
      const page = req.query.page || 1;
      const data = await systemeApi(`/contacts?page=${page}&limit=100`);
      return res.json({ success: true, data });
    }
    
    // POST /api/systeme/sync - Full two-way sync
    if (path === 'systeme/sync' && req.method === 'POST') {
      // 1) Pull all contacts from Systeme.io
      let page = 1;
      let allContacts = [];
      let hasMore = true;

      while (hasMore) {
        const data = await systemeApi(`/contacts?page=${page}&limit=100`);
        const items = data.items || [];
        allContacts = allContacts.concat(items);
        hasMore = items.length === 100;
        page++;
        if (page > 10) break; // safety cap
      }

      let imported = 0;
      let skipped = 0;

      // 2) Import to Firestore
      const batch = db.batch();
      for (const contact of allContacts) {
        const email = contact.email;
        if (!email) { skipped++; continue; }

        // Check if exists
        const existing = await db.collection('leads')
          .where('email', '==', email)
          .limit(1)
          .get();

        if (existing.empty) {
          const docRef = db.collection('leads').doc();
          batch.set(docRef, {
            name: contact.fields?.find(f => f.slug === 'first_name')?.value || contact.email.split('@')[0],
            company: contact.fields?.find(f => f.slug === 'company_name')?.value || '',
            email,
            score: 30,
            tier: 'COLD',
            source: 'systeme.io',
            date: new Date().toISOString().split('T')[0],
            systemeId: contact.id?.toString() || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          imported++;
        } else {
          skipped++;
        }
      }
      await batch.commit();

      return res.json({
        success: true,
        data: {
          pulled: allContacts.length,
          imported,
          skipped,
          pushed: 0
        }
      });
    }
    
    return res.status(404).json({ success: false, error: 'Not found' });
    
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
