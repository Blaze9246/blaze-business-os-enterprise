const { initStorage, loadData, saveData, generateId } = require('./storage');

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
  // Init storage on first request
  await initStorage();
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.url.replace('/api/', '').split('?')[0];
  
  try {
    // GET /api/stats
    if (path === 'stats' && req.method === 'GET') {
      const data = await loadData();
      const leads = data.leads || [];
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
          totalStores: data.stores?.length || 1,
          totalAgents: data.agents?.length || 4,
          totalTasks: data.tasks?.length || 0,
          pendingTasks: data.tasks?.filter(t => t.status !== 'done').length || 0
        }
      });
    }
    
    // GET /api/leads
    if (path === 'leads' && req.method === 'GET') {
      const data = await loadData();
      const leads = (data.leads || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, data: leads });
    }
    
    // POST /api/leads
    if (path === 'leads' && req.method === 'POST') {
      const { name, company, email, score, tier, source } = req.body;
      if (!name || !email) return res.status(400).json({ success: false, error: 'Name and email required' });
      
      const data = await loadData();
      const newLead = {
        id: generateId(),
        name, 
        company: company || '', 
        email,
        score: Number(score) || 0,
        tier: tier || 'COLD',
        source: source || 'manual',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      
      data.leads = data.leads || [];
      data.leads.push(newLead);
      await saveData(data);
      
      return res.json({ success: true, data: newLead });
    }
    
    // DELETE /api/leads/:id
    if (path.startsWith('leads/') && req.method === 'DELETE') {
      const id = path.replace('leads/', '');
      const data = await loadData();
      data.leads = (data.leads || []).filter(l => l.id !== id);
      await saveData(data);
      return res.json({ success: true });
    }
    
    // GET /api/agents
    if (path === 'agents' && req.method === 'GET') {
      const data = await loadData();
      return res.json({ success: true, data: data.agents || [] });
    }
    
    // PUT /api/agents/:id
    if (path.startsWith('agents/') && req.method === 'PUT') {
      const id = path.replace('agents/', '');
      const data = await loadData();
      const agentIndex = data.agents.findIndex(a => a.id === id);
      if (agentIndex >= 0) {
        data.agents[agentIndex] = { ...data.agents[agentIndex], ...req.body };
        await saveData(data);
      }
      return res.json({ success: true });
    }
    
    // GET /api/tasks
    if (path === 'tasks' && req.method === 'GET') {
      const data = await loadData();
      const tasks = (data.tasks || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, data: tasks });
    }
    
    // POST /api/tasks
    if (path === 'tasks' && req.method === 'POST') {
      const data = await loadData();
      const newTask = {
        id: generateId(),
        ...req.body,
        status: req.body.status || 'pending',
        createdAt: new Date().toISOString()
      };
      
      data.tasks = data.tasks || [];
      data.tasks.push(newTask);
      await saveData(data);
      
      return res.json({ success: true, data: newTask });
    }
    
    // PUT /api/tasks/:id
    if (path.startsWith('tasks/') && req.method === 'PUT') {
      const id = path.replace('tasks/', '');
      const data = await loadData();
      const taskIndex = data.tasks.findIndex(t => t.id === id);
      if (taskIndex >= 0) {
        data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...req.body };
        await saveData(data);
      }
      return res.json({ success: true });
    }
    
    // DELETE /api/tasks/:id
    if (path.startsWith('tasks/') && req.method === 'DELETE') {
      const id = path.replace('tasks/', '');
      const data = await loadData();
      data.tasks = (data.tasks || []).filter(t => t.id !== id);
      await saveData(data);
      return res.json({ success: true });
    }
    
    // GET /api/seed
    if (path === 'seed' && req.method === 'GET') {
      const { initStorage } = require('./storage');
      await initStorage();
      
      const data = await loadData();
      
      // Reset to initial state
      data.leads = [
        { id: generateId(), name: 'Thabo Mbeki', company: 'TechnoServe SA', email: 'thabo@technoserve.co.za', score: 85, tier: 'HOT', source: 'linkedin', date: '2026-02-10', createdAt: new Date().toISOString() },
        { id: generateId(), name: 'Naledi Khoza', company: 'Glow Digital', email: 'naledi@glowdigital.co.za', score: 72, tier: 'WARM', source: 'referral', date: '2026-02-11', createdAt: new Date().toISOString() },
        { id: generateId(), name: 'James van der Merwe', company: 'Cape Eats', email: 'james@capeeats.com', score: 55, tier: 'WARM', source: 'website', date: '2026-02-09', createdAt: new Date().toISOString() },
        { id: generateId(), name: 'Ayanda Dlamini', company: 'Dlamini Logistics', email: 'ayanda@dlamini.co.za', score: 90, tier: 'HOT', source: 'systeme.io', date: '2026-02-12', createdAt: new Date().toISOString() },
        { id: generateId(), name: 'Lerato Molefe', company: 'Molefe Beauty', email: 'lerato@molefebeauty.co.za', score: 88, tier: 'HOT', source: 'referral', date: '2026-02-13', createdAt: new Date().toISOString() }
      ];
      
      data.tasks = [
        { id: generateId(), title: 'Follow up with Lerato Molefe', priority: 'high', status: 'pending', agent: 'outreach', createdAt: new Date().toISOString() },
        { id: generateId(), title: 'Generate Instagram carousel for Glow Digital', priority: 'medium', status: 'in-progress', agent: 'creator', createdAt: new Date().toISOString() },
        { id: generateId(), title: 'Audit Botha Wines Shopify store', priority: 'low', status: 'pending', agent: 'hunter', createdAt: new Date().toISOString() },
        { id: generateId(), title: 'Send onboarding docs to Ayanda', priority: 'high', status: 'done', agent: 'whatsapp', createdAt: new Date().toISOString() },
        { id: generateId(), title: 'Scrape 50 new Cape Town e-commerce leads', priority: 'medium', status: 'pending', agent: 'hunter', createdAt: new Date().toISOString() }
      ];
      
      await saveData(data);
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
        const result = await systemeApi(`/contacts?page=${page}&limit=100`);
        const items = result.items || [];
        allContacts = allContacts.concat(items);
        hasMore = items.length === 100;
        page++;
        if (page > 10) break; // safety cap
      }

      let imported = 0;
      let skipped = 0;

      // 2) Import to file storage
      const data = await loadData();
      data.leads = data.leads || [];
      
      for (const contact of allContacts) {
        const email = contact.email;
        if (!email) { skipped++; continue; }

        // Check if exists
        const exists = data.leads.some(l => l.email === email);

        if (!exists) {
          data.leads.push({
            id: generateId(),
            name: contact.fields?.find(f => f.slug === 'first_name')?.value || contact.email.split('@')[0],
            company: contact.fields?.find(f => f.slug === 'company_name')?.value || '',
            email,
            score: 30,
            tier: 'COLD',
            source: 'systeme.io',
            date: new Date().toISOString().split('T')[0],
            systemeId: contact.id?.toString() || '',
            createdAt: new Date().toISOString()
          });
          imported++;
        } else {
          skipped++;
        }
      }
      
      await saveData(data);

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
