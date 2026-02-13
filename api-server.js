const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const path = require('path');

// ─── Firebase Init ───────────────────────────────────────────────────────────
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'blaze-enterprise-os'
});
const db = admin.firestore();

// ─── Express Setup ───────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

const PORT = process.env.PORT || 3000;

// ─── Config ──────────────────────────────────────────────────────────────────
const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY || 'gutxuny6z7abcijjhr16yqazqltx43z5gqcl8jpo12mibokr31js1hfc0ed8i8k2';
const SYSTEME_BASE = 'https://api.systeme.io/api';

// ═══════════════════════════════════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/leads — fetch all leads
app.get('/api/leads', async (req, res) => {
  try {
    const snapshot = await db.collection('leads')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();
    const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: leads });
  } catch (err) {
    console.error('GET /api/leads error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/leads — add a new lead
app.post('/api/leads', async (req, res) => {
  try {
    const { name, company, email, score, tier, source } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email required' });
    }
    const lead = {
      name: name || '',
      company: company || '',
      email: email || '',
      score: Number(score) || 0,
      tier: tier || 'COLD',
      source: source || 'manual',
      date: new Date().toISOString().split('T')[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('leads').add(lead);
    res.json({ success: true, data: { id: docRef.id, ...lead } });
  } catch (err) {
    console.error('POST /api/leads error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/leads/:id
app.delete('/api/leads/:id', async (req, res) => {
  try {
    await db.collection('leads').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/leads error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/leads/:id — update lead
app.put('/api/leads/:id', async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await db.collection('leads').doc(req.params.id).update(updates);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/leads error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/stats', async (req, res) => {
  try {
    const leadsSnap = await db.collection('leads').get();
    const agentsSnap = await db.collection('agents').get();
    const tasksSnap = await db.collection('tasks').get();
    const storesSnap = await db.collection('stores').get();

    const leads = leadsSnap.docs.map(d => d.data());
    const hotLeads = leads.filter(l => l.tier === 'HOT').length;
    const warmLeads = leads.filter(l => l.tier === 'WARM').length;

    // Estimated revenue from lead tiers
    const revenue = hotLeads * 5000 + warmLeads * 2000 + (leads.length - hotLeads - warmLeads) * 500;

    res.json({
      success: true,
      data: {
        totalLeads: leads.length,
        hotLeads,
        warmLeads,
        revenue,
        totalStores: storesSnap.size || 0,
        totalAgents: agentsSnap.size || 4,
        totalTasks: tasksSnap.size || 0,
        pendingTasks: tasksSnap.docs.filter(d => d.data().status !== 'done').length || 0
      }
    });
  } catch (err) {
    console.error('GET /api/stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// AGENTS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/agents', async (req, res) => {
  try {
    const snapshot = await db.collection('agents').get();
    if (snapshot.empty) {
      // Return defaults
      return res.json({
        success: true,
        data: [
          { id: 'hunter', name: 'Hunter Agent', role: 'Finds leads via scraping & enrichment', status: 'idle', leadsFound: 0, icon: '🎯' },
          { id: 'outreach', name: 'Outreach Agent', role: 'Sends emails & DMs', status: 'idle', messagesSent: 0, icon: '📧' },
          { id: 'creator', name: 'Creator Agent', role: 'Generates content & creatives', status: 'idle', contentCreated: 0, icon: '🎨' },
          { id: 'whatsapp', name: 'WhatsApp Brain', role: 'Manages WhatsApp conversations', status: 'idle', conversations: 0, icon: '💬' }
        ]
      });
    }
    const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: agents });
  } catch (err) {
    console.error('GET /api/agents error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/agents/:id — toggle agent status
app.put('/api/agents/:id', async (req, res) => {
  try {
    await db.collection('agents').doc(req.params.id).set(req.body, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/tasks', async (req, res) => {
  try {
    const snapshot = await db.collection('tasks')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: tasks });
  } catch (err) {
    console.error('GET /api/tasks error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = {
      ...req.body,
      status: req.body.status || 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('tasks').add(task);
    res.json({ success: true, data: { id: docRef.id, ...task } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    await db.collection('tasks').doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await db.collection('tasks').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEME.IO INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

const systemeHeaders = {
  'X-API-Key': SYSTEME_API_KEY,
  'Content-Type': 'application/json'
};

// GET /api/systeme/contacts — pull contacts from Systeme.io
app.get('/api/systeme/contacts', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const response = await fetch(`${SYSTEME_BASE}/contacts?page=${page}&limit=100`, {
      headers: systemeHeaders
    });
    const data = await response.json();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Systeme.io GET error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/systeme/contacts — push contact to Systeme.io
app.post('/api/systeme/contacts', async (req, res) => {
  try {
    const response = await fetch(`${SYSTEME_BASE}/contacts`, {
      method: 'POST',
      headers: systemeHeaders,
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Systeme.io POST error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/systeme/contacts/:id — update contact on Systeme.io
app.put('/api/systeme/contacts/:id', async (req, res) => {
  try {
    const response = await fetch(`${SYSTEME_BASE}/contacts/${req.params.id}`, {
      method: 'PUT',
      headers: systemeHeaders,
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/systeme/contacts/:id
app.delete('/api/systeme/contacts/:id', async (req, res) => {
  try {
    await fetch(`${SYSTEME_BASE}/contacts/${req.params.id}`, {
      method: 'DELETE',
      headers: systemeHeaders
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/systeme/sync — full two-way sync
app.post('/api/systeme/sync', async (req, res) => {
  try {
    // 1) Pull from Systeme.io
    let page = 1;
    let allContacts = [];
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`${SYSTEME_BASE}/contacts?page=${page}&limit=100`, {
        headers: systemeHeaders
      });
      const data = await response.json();
      const items = data.items || data.data || [];
      allContacts = allContacts.concat(items);
      hasMore = items.length === 100;
      page++;
      if (page > 10) break; // safety cap
    }

    let imported = 0;
    let skipped = 0;

    // 2) Upsert into Firestore
    const batch = db.batch();
    for (const contact of allContacts) {
      const email = contact.email || contact.fields?.email;
      if (!email) { skipped++; continue; }

      // Check if exists
      const existing = await db.collection('leads')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (existing.empty) {
        const docRef = db.collection('leads').doc();
        batch.set(docRef, {
          name: contact.fields?.firstName || contact.firstName || contact.name || 'Unknown',
          company: contact.fields?.company || '',
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

    // 3) Push Firestore leads missing from Systeme.io (that have no systemeId)
    const localSnap = await db.collection('leads')
      .where('source', '!=', 'systeme.io')
      .get();

    let pushed = 0;
    for (const doc of localSnap.docs) {
      const lead = doc.data();
      if (lead.systemeId) continue;
      try {
        const pushRes = await fetch(`${SYSTEME_BASE}/contacts`, {
          method: 'POST',
          headers: systemeHeaders,
          body: JSON.stringify({
            email: lead.email,
            fields: [
              { slug: 'first_name', value: lead.name },
              { slug: 'company_name', value: lead.company || '' }
            ]
          })
        });
        const pushData = await pushRes.json();
        if (pushData.id) {
          await db.collection('leads').doc(doc.id).update({
            systemeId: pushData.id.toString()
          });
          pushed++;
        }
      } catch (e) {
        // skip individual failures
      }
    }

    res.json({
      success: true,
      data: {
        pulled: allContacts.length,
        imported,
        skipped,
        pushed
      }
    });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/seed', async (req, res) => {
  try {
    const batch = db.batch();

    // Seed agents
    const agents = [
      { name: 'Hunter Agent', role: 'Finds leads via scraping & enrichment', status: 'running', leadsFound: 234, icon: '🎯' },
      { name: 'Outreach Agent', role: 'Sends emails & DMs', status: 'idle', messagesSent: 1847, icon: '📧' },
      { name: 'Creator Agent', role: 'Generates content & creatives', status: 'running', contentCreated: 89, icon: '🎨' },
      { name: 'WhatsApp Brain', role: 'Manages WhatsApp conversations', status: 'idle', conversations: 156, icon: '💬' }
    ];
    agents.forEach(a => {
      batch.set(db.collection('agents').doc(a.name.toLowerCase().replace(/\s+/g, '-')), a);
    });

    // Seed sample leads
    const sampleLeads = [
      { name: 'Thabo Mbeki', company: 'TechnoServe SA', email: 'thabo@technoserve.co.za', score: 85, tier: 'HOT', source: 'linkedin', date: '2026-02-10' },
      { name: 'Naledi Khoza', company: 'Glow Digital', email: 'naledi@glowdigital.co.za', score: 72, tier: 'WARM', source: 'referral', date: '2026-02-11' },
      { name: 'James van der Merwe', company: 'Cape Eats', email: 'james@capeeats.com', score: 55, tier: 'WARM', source: 'website', date: '2026-02-09' },
      { name: 'Ayanda Dlamini', company: 'Dlamini Logistics', email: 'ayanda@dlamini.co.za', score: 90, tier: 'HOT', source: 'systeme.io', date: '2026-02-12' },
      { name: 'Pieter Botha', company: 'Botha Wines', email: 'pieter@bothawines.com', score: 40, tier: 'COLD', source: 'scraper', date: '2026-02-08' },
      { name: 'Fatima Hassan', company: 'FH Marketing', email: 'fatima@fhmarketing.co.za', score: 65, tier: 'WARM', source: 'instagram', date: '2026-02-12' },
      { name: 'Sipho Nkosi', company: 'Nkosi Clothing', email: 'sipho@nkosi.co.za', score: 20, tier: 'ICE', source: 'cold-email', date: '2026-02-07' },
      { name: 'Lerato Molefe', company: 'Molefe Beauty', email: 'lerato@molefebeauty.co.za', score: 88, tier: 'HOT', source: 'referral', date: '2026-02-13' },
    ];
    sampleLeads.forEach(l => {
      const ref = db.collection('leads').doc();
      batch.set(ref, { ...l, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    });

    // Seed tasks
    const tasks = [
      { title: 'Follow up with Lerato Molefe', priority: 'high', status: 'pending', agent: 'outreach' },
      { title: 'Generate Instagram carousel for Glow Digital', priority: 'medium', status: 'in-progress', agent: 'creator' },
      { title: 'Audit Botha Wines Shopify store', priority: 'low', status: 'pending', agent: 'hunter' },
      { title: 'Send onboarding docs to Ayanda', priority: 'high', status: 'done', agent: 'whatsapp' },
      { title: 'Scrape 50 new Cape Town e-commerce leads', priority: 'medium', status: 'pending', agent: 'hunter' },
    ];
    tasks.forEach(t => {
      const ref = db.collection('tasks').doc();
      batch.set(ref, { ...t, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    });

    await batch.commit();
    res.json({ success: true, message: 'Database seeded with agents, leads, and tasks' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Catch-all: serve index.html ─────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🔥 Blaze Business OS API running on port ${PORT}`);
});
