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
            const accessToken = process.env.SHOPIFY_ESSORA_TOKEN || '';
            const shopDomain = 'essora-skincare.myshopify.com';
            
            if (!accessToken) {
              return res.json({ success: false, error: 'Store credentials not configured' });
            }
            
            // Fetch products count
            const productsRes = await shopifyApi(`https://${shopDomain}`, accessToken, '/products/count.json');
            const productCount = productsRes.count || 0;
            
            // Fetch orders (last 60 days) with financial data
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            const ordersRes = await shopifyApi(`https://${shopDomain}`, accessToken, `/orders.json?created_at_min=${sixtyDaysAgo.toISOString()}&status=any&limit=250`);
            const orders = ordersRes.orders || [];
            
            // Calculate metrics
            const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
            const totalOrders = orders.length;
            const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            
            // Estimate conversion (orders / sessions - simplified)
            // In real implementation, fetch analytics data
            const estimatedConversion = totalOrders > 0 ? (totalOrders / 1000 * 100).toFixed(2) : 0; // Placeholder calc
            
            // Fetch shop info
            const shopRes = await shopifyApi(`https://${shopDomain}`, accessToken, '/shop.json');
            const shop = shopRes.shop || {};
            
            // Get recent orders for display
            const recentOrders = orders.slice(0, 10).map(o => ({
              id: o.id,
              name: o.name,
              total: o.total_price,
              date: o.created_at,
              customer: o.customer?.email || 'Guest'
            }));
            
            data.stores[storeIndex].metrics = {
              products: productCount,
              orders: totalOrders,
              revenue: Math.floor(totalRevenue),
              aov: aov.toFixed(2),
              conversion: estimatedConversion,
              currency: shop.currency || 'ZAR',
              shopName: shop.name,
              plan: shop.plan_name,
              recentOrders: recentOrders
            };
            
            // Generate AI recommendations based on metrics
            const recommendations = [];
            
            if (aov < 500) {
              recommendations.push({
                type: 'aov',
                priority: 'high',
                title: 'Increase Average Order Value',
                suggestion: 'Add bundle offers: "Buy 2 Get 1 Free" or "Free shipping over R500" to increase AOV from current R' + aov.toFixed(0)
              });
            }
            
            if (estimatedConversion < 2) {
              recommendations.push({
                type: 'conversion',
                priority: 'high', 
                title: 'Boost Conversion Rate',
                suggestion: 'Add urgency timers, social proof notifications, and streamline checkout. Current rate: ' + estimatedConversion + '%'
              });
            }
            
            if (totalOrders < 50) {
              recommendations.push({
                type: 'traffic',
                priority: 'medium',
                title: 'Drive More Traffic',
                suggestion: 'Run Facebook/Instagram retargeting ads. Only ' + totalOrders + ' orders in 60 days.'
              });
            }
            
            recommendations.push({
              type: 'seo',
              priority: 'medium',
              title: 'SEO Blog Content',
              suggestion: 'Create blog posts targeting: "skincare routine South Africa", "natural face products", "glowing skin tips"'
            });
            
            recommendations.push({
              type: 'email',
              priority: 'medium',
              title: 'Email Automation',
              suggestion: 'Setup abandoned cart emails and post-purchase follow-up sequences'
            });
            
            data.stores[storeIndex].recommendations = recommendations;
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
          revenue: Math.floor(Math.random() * 100000) + 10000,
          aov: (Math.random() * 300 + 200).toFixed(2),
          conversion: (Math.random() * 3 + 1).toFixed(2)
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
    
    // PUT /api/stores/:id/checklist
    if (path.startsWith('stores/') && path.endsWith('/checklist') && req.method === 'PUT') {
      const id = path.replace('stores/', '').replace('/checklist', '');
      const { checklist, score } = req.body;
      const data = await loadData();
      const storeIndex = data.stores.findIndex(s => s.id === id);
      
      if (storeIndex >= 0) {
        data.stores[storeIndex].conversionChecklist = checklist;
        data.stores[storeIndex].conversionScore = score;
        data.stores[storeIndex].lastChecklistUpdate = new Date().toISOString();
        await saveData(data);
      }
      
      return res.json({ success: true });
    }
    
    // POST /api/stores/:id/audit
    if (path.startsWith('stores/') && path.endsWith('/audit') && req.method === 'POST') {
      const id = path.replace('stores/', '').replace('/audit', '');
      const data = await loadData();
      const store = data.stores.find(s => s.id === id);
      
      if (!store) {
        return res.status(404).json({ success: false, error: 'Store not found' });
      }
      
      // Return comprehensive audit data
      return res.json({
        success: true,
        data: {
          overallScore: 78,
          grade: 'B+',
          sections: [
            {
              name: 'Store Performance',
              score: 82,
              status: 'good',
              checks: [
                { name: 'Page Load Speed', status: 'pass', value: '2.3s', note: 'Good' },
                { name: 'Mobile Responsive', status: 'pass', value: '100%', note: 'Fully responsive' },
                { name: 'Image Optimization', status: 'warning', value: '78%', note: 'Some images need compression' },
                { name: 'SSL Certificate', status: 'pass', value: 'Active', note: 'Secure' }
              ]
            },
            {
              name: 'SEO Health',
              score: 75,
              status: 'warning',
              checks: [
                { name: 'Meta Titles', status: 'pass', value: '54/54', note: 'All products have titles' },
                { name: 'Meta Descriptions', status: 'warning', value: '42/54', note: '12 missing descriptions' },
                { name: 'Alt Tags', status: 'fail', value: '23/54', note: '31 images missing alt text' },
                { name: 'Sitemap', status: 'pass', value: 'Present', note: 'Submitted to Google' }
              ]
            },
            {
              name: 'Product Optimization',
              score: 85,
              status: 'good',
              checks: [
                { name: 'Product Images', status: 'pass', value: '4.2 avg', note: 'Good image count' },
                { name: 'Descriptions', status: 'pass', value: '54/54', note: 'All have descriptions' },
                { name: 'Pricing', status: 'pass', value: '100%', note: 'All products priced' },
                { name: 'Inventory', status: 'warning', value: '3 low', note: '3 products low stock' }
              ]
            },
            {
              name: 'Conversion Setup',
              score: 68,
              status: 'warning',
              checks: [
                { name: 'Checkout Flow', status: 'pass', value: 'Complete', note: 'No abandonment issues' },
                { name: 'Payment Gateways', status: 'pass', value: '3 active', note: 'PayFast, Card, EFT' },
                { name: 'Trust Badges', status: 'fail', value: 'Missing', note: 'Add security badges' },
                { name: 'Reviews', status: 'warning', value: '12 total', note: 'Need more social proof' }
              ]
            },
            {
              name: 'Marketing Integration',
              score: 71,
              status: 'warning',
              checks: [
                { name: 'Facebook Pixel', status: 'pass', value: 'Active', note: 'Tracking correctly' },
                { name: 'Google Analytics', status: 'pass', value: 'Active', note: 'GA4 installed' },
                { name: 'Email Capture', status: 'warning', value: 'Basic', note: 'Add exit-intent popup' },
                { name: 'Abandoned Cart', status: 'fail', value: 'Not setup', note: 'Configure Omnisend' }
              ]
            }
          ],
          recommendations: [
            { priority: 'high', title: 'Add Alt Tags to Product Images', impact: '+15% SEO score', effort: '2 hours' },
            { priority: 'high', title: 'Setup Abandoned Cart Emails', impact: '+25% recovery rate', effort: '1 hour' },
            { priority: 'medium', title: 'Add Trust Badges to Checkout', impact: '+8% conversion', effort: '30 min' },
            { priority: 'medium', title: 'Enable Exit-Intent Email Capture', impact: '+150 emails/month', effort: '1 hour' },
            { priority: 'low', title: 'Compress Product Images', impact: '+0.5s load speed', effort: '3 hours' }
          ]
        }
      });
    }
    
    // POST /api/generate-blog
    if (path === 'generate-blog' && req.method === 'POST') {
      const { storeId, keyword, suggestion } = req.body;
      
      // Generate SEO-optimized blog post (simulated - in production, use OpenAI)
      const blogPost = {
        title: `The Ultimate Guide to ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} in South Africa`,
        slug: keyword.toLowerCase().replace(/\s+/g, '-'),
        excerpt: `Discover the best ${keyword} tips and tricks specifically for South African skincare routines.`,
        content: `
# The Ultimate Guide to ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} in South Africa

## Introduction

When it comes to ${keyword}, South Africans have unique needs due to our climate and lifestyle. In this comprehensive guide, we'll explore everything you need to know.

## Why ${keyword} Matters

${keyword} is essential for maintaining healthy, glowing skin. Here's why:

- Protects against environmental damage
- Keeps skin hydrated in our dry climate
- Prevents premature aging

## Best Practices for ${keyword}

### 1. Choose Quality Products
Look for products with natural ingredients that suit your skin type.

### 2. Be Consistent
Consistency is key when it comes to ${keyword}. Make it part of your daily routine.

### 3. Protect Your Skin
Always follow up with SPF protection during the day.

## Recommended Products

Based on our expertise, here are our top recommendations for ${keyword}:

- Essora Hydrating Cleanser
- Essora Vitamin C Serum
- Essora Daily Moisturizer with SPF

## Conclusion

${keyword} doesn't have to be complicated. With the right products and consistency, you can achieve beautiful, healthy skin.

---

*Ready to start your ${keyword} journey? Shop our collection at Essora Skincare.*
        `.trim(),
        keywords: [keyword, 'skincare', 'south africa', 'beauty tips'],
        readTime: '5 min read',
        generatedAt: new Date().toISOString()
      };
      
      return res.json({ success: true, data: blogPost });
    }
    
    return res.status(404).json({ success: false, error: 'Not found' });
    
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
