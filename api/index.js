const { initStorage, loadData, saveData, generateId } = require('./storage');

const SYSTEME_API_KEY = process.env.SYSTEME_API_KEY || 'gutxuny6z7abcijjhr16yqazqltx43z5gqcl8jpo12mibokr31js1hfc0ed8i8k2';
const SYSTEME_BASE = 'https://api.systeme.io/api';

// Shopify API helper
async function shopifyApi(storeUrl, accessToken, endpoint) {
  const baseUrl = storeUrl.replace(/\/$/, '');
  const url = `${baseUrl}/admin/api/2024-01${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error(`Shopify HTTP ${res.status}`);
  return res.json();
}

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
    
    // GET /api/systeme/contacts - Pull ALL contacts from Systeme.io
    if (path === 'systeme/contacts' && req.method === 'GET') {
      // Pull all pages of contacts
      let page = 1;
      let allContacts = [];
      let hasMore = true;

      while (hasMore && page <= 20) { // Max 2000 contacts (20 pages × 100)
        const result = await systemeApi(`/contacts?page=${page}&limit=100`);
        const items = result.items || [];
        allContacts = allContacts.concat(items);
        hasMore = items.length === 100;
        page++;
      }

      return res.json({
        success: true,
        data: {
          items: allContacts,
          total: allContacts.length
        }
      });
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
    
    // GET /api/stores
    if (path === 'stores' && req.method === 'GET') {
      const data = await loadData();
      return res.json({ success: true, data: data.stores || [] });
    }
    
    // POST /api/stores
    if (path === 'stores' && req.method === 'POST') {
      const data = await loadData();
      const newStore = {
        id: generateId(),
        ...req.body,
        status: req.body.status || 'pending',
        metrics: req.body.metrics || { products: 0, orders: 0, revenue: 0 },
        createdAt: new Date().toISOString()
      };
      
      data.stores = data.stores || [];
      data.stores.push(newStore);
      await saveData(data);
      
      return res.json({ success: true, data: newStore });
    }
    
    // DELETE /api/stores/:id
    if (path.startsWith('stores/') && req.method === 'DELETE') {
      const id = path.replace('stores/', '');
      const data = await loadData();
      data.stores = (data.stores || []).filter(s => s.id !== id);
      await saveData(data);
      return res.json({ success: true });
    }
    
    // POST /api/stores/:id/sync
    if (path.startsWith('stores/') && path.endsWith('/sync') && req.method === 'POST') {
      const id = path.replace('stores/', '').replace('/sync', '');
      const data = await loadData();
      const storeIndex = data.stores.findIndex(s => s.id === id);
      
      if (storeIndex >= 0) {
        const store = data.stores[storeIndex];
        
        // If it's Essora, use real Shopify API
        if (store.url && store.url.includes('essora')) {
          try {
            // Token loaded from environment or secure storage
            const accessToken = process.env.SHOPIFY_ESSORA_TOKEN || '';
            const shopDomain = 'essora-skincare.myshopify.com';
            
            if (!accessToken) {
              return res.json({ success: false, error: 'Store credentials not configured' });
            }
            
            // Fetch products count
            const productsRes = await shopifyApi(`https://${shopDomain}`, accessToken, '/products/count.json');
            const productCount = productsRes.count || 0;
            
            // Fetch orders count (last 60 days)
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            const ordersRes = await shopifyApi(`https://${shopDomain}`, accessToken, `/orders/count.json?created_at_min=${sixtyDaysAgo.toISOString()}&status=any`);
            const orderCount = ordersRes.count || 0;
            
            // Fetch shop info
            const shopRes = await shopifyApi(`https://${shopDomain}`, accessToken, '/shop.json');
            const shop = shopRes.shop || {};
            
            data.stores[storeIndex].metrics = {
              products: productCount,
              orders: orderCount,
              revenue: Math.floor(orderCount * 450), // Estimate R450 avg order
              currency: shop.currency || 'ZAR',
              shopName: shop.name,
              plan: shop.plan_name
            };
            data.stores[storeIndex].lastSync = new Date().toISOString();
            data.stores[storeIndex].status = 'active';
            await saveData(data);
            
            return res.json({ success: true, data: data.stores[storeIndex] });
          } catch (err) {
            console.error('Shopify sync error:', err);
            return res.json({ success: false, error: err.message });
          }
        }
        
        // Fallback to simulated data for other stores
        data.stores[storeIndex].metrics = {
          products: Math.floor(Math.random() * 500) + 50,
          orders: Math.floor(Math.random() * 1000) + 100,
          revenue: Math.floor(Math.random() * 100000) + 10000
        };
        data.stores[storeIndex].lastSync = new Date().toISOString();
        data.stores[storeIndex].status = 'active';
        await saveData(data);
      }
      
      return res.json({ success: true, data: data.stores[storeIndex] });
    }
    
    // GET /api/stores/:id/products
    if (path.startsWith('stores/') && path.endsWith('/products') && req.method === 'GET') {
      const id = path.replace('stores/', '').replace('/products', '');
      const data = await loadData();
      const store = data.stores.find(s => s.id === id);
      
      if (!store) {
        return res.status(404).json({ success: false, error: 'Store not found' });
      }
      
      // If it's Essora, use real Shopify API
      if (store.url && store.url.includes('essora')) {
        try {
          const accessToken = process.env.SHOPIFY_ESSORA_TOKEN || '';
          const shopDomain = 'essora-skincare.myshopify.com';
          
          if (!accessToken) {
            return res.json({ success: true, data: [] });
          }
          
          // Fetch products
          const productsRes = await shopifyApi(`https://${shopDomain}`, accessToken, '/products.json?limit=50');
          const products = (productsRes.products || []).map(p => ({
            id: p.id,
            title: p.title,
            status: p.status,
            image: p.image?.src || null,
            variants: p.variants?.map(v => ({
              id: v.id,
              title: v.title,
              price: v.price,
              inventory: v.inventory_quantity
            })) || []
          }));
          
          return res.json({ success: true, data: products });
        } catch (err) {
          console.error('Shopify products error:', err);
          return res.json({ success: false, error: err.message });
        }
      }
      
      // Return empty for other stores
      return res.json({ success: true, data: [] });
    }
    
    // GET /api/stores/:id/orders
    if (path.startsWith('stores/') && path.endsWith('/orders') && req.method === 'GET') {
      const id = path.replace('stores/', '').replace('/orders', '');
      const data = await loadData();
      const store = data.stores.find(s => s.id === id);
      
      if (!store) {
        return res.status(404).json({ success: false, error: 'Store not found' });
      }
      
      // If it's Essora, use real Shopify API
      if (store.url && store.url.includes('essora')) {
        try {
          const accessToken = process.env.SHOPIFY_ESSORA_TOKEN || '';
          const shopDomain = 'essora-skincare.myshopify.com';
          
          if (!accessToken) {
            return res.json({ success: true, data: [] });
          }
          
          // Fetch recent orders
          const ordersRes = await shopifyApi(`https://${shopDomain}`, accessToken, '/orders.json?limit=20&status=any');
          const orders = (ordersRes.orders || []).map(o => ({
            id: o.id,
            name: o.name,
            order_number: o.order_number,
            total_price: o.total_price,
            currency: o.currency,
            financial_status: o.financial_status,
            created_at: o.created_at,
            customer: o.customer ? {
              first_name: o.customer.first_name,
              last_name: o.customer.last_name,
              email: o.customer.email
            } : null,
            line_items: o.line_items?.map(i => ({
              title: i.title,
              quantity: i.quantity,
              price: i.price
            })) || []
          }));
          
          return res.json({ success: true, data: orders });
        } catch (err) {
          console.error('Shopify orders error:', err);
          return res.json({ success: false, error: err.message });
        }
      }
      
      // Return empty for other stores
      return res.json({ success: true, data: [] });
    }
    
    return res.status(404).json({ success: false, error: 'Not found' });
    
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
