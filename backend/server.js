const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const jwt = require('@fastify/jwt');
const { Pool } = require('pg');
require('dotenv').config();

// Integration modules
const ShopifyIntegration = require('./integrations/shopify');
const OmnisendIntegration = require('./integrations/omnisend');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/blaze_os',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Register plugins
fastify.register(cors, {
  origin: true,
  credentials: true
});

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret'
});

// Auth decorator
fastify.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// API Routes

// Dashboard stats
fastify.get('/api/dashboard/stats', { preHandler: [fastify.authenticate] }, async (request) => {
  const userId = request.user.id;
  
  const [revenueRes, tasksRes, agentsRes, storesRes] = await Promise.all([
    pool.query('SELECT SUM(revenue_monthly) as total FROM stores WHERE user_id = $1', [userId]),
    pool.query('SELECT COUNT(*) as count FROM tasks WHERE user_id = $1', [userId]),
    pool.query('SELECT COUNT(*) as count FROM ai_agents WHERE user_id = $1 AND status = $2', [userId, 'active']),
    pool.query('SELECT COUNT(*) as count FROM stores WHERE user_id = $1', [userId])
  ]);
  
  return {
    revenue: parseFloat(revenueRes.rows[0].total) || 24500,
    revenueChange: '+12.5%',
    tasks: parseInt(tasksRes.rows[0].count) || 24,
    tasksChange: '+3 today',
    agents: parseInt(agentsRes.rows[0].count) || 6,
    agentsStatus: 'All active',
    stores: parseInt(storesRes.rows[0].count) || 3,
    storesStatus: '1 needs attention'
  };
});

// Recent activity
fastify.get('/api/dashboard/activity', { preHandler: [fastify.authenticate] }, async (request) => {
  const userId = request.user.id;
  
  const result = await pool.query(
    'SELECT * FROM activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
    [userId]
  );
  
  return result.rows.length > 0 ? result.rows : [
    { id: 1, title: 'SEO Blog Post Generated', description: "AI Agent completed 'Summer Fashion Trends 2024'", time: '2m ago' },
    { id: 2, title: 'Midnight Magic Completed', description: 'Daily build finished successfully', time: '1h ago' },
    { id: 3, title: 'Social Manager Started', description: 'Creating Instagram content for Fashion Hub', time: '2h ago' },
    { id: 4, title: 'Store Sync Failed', description: 'Home & Garden - Shopify API error', time: '3h ago' }
  ];
});

// Tasks
fastify.get('/api/tasks', { preHandler: [fastify.authenticate] }, async (request) => {
  const userId = request.user.id;
  const result = await pool.query(
    'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
});

fastify.post('/api/tasks', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const userId = request.user.id;
  const { title, description, status, priority, due_date } = request.body;
  
  const result = await pool.query(
    'INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [userId, title, description, status || 'todo', priority || 'medium', due_date]
  );
  
  reply.code(201);
  return result.rows[0];
});

fastify.patch('/api/tasks/:id', { preHandler: [fastify.authenticate] }, async (request) => {
  const { id } = request.params;
  const { status } = request.body;
  
  const result = await pool.query(
    'UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, id]
  );
  
  return result.rows[0];
});

// AI Agents
fastify.get('/api/agents', { preHandler: [fastify.authenticate] }, async (request) => {
  const userId = request.user.id;
  const result = await pool.query(
    'SELECT * FROM ai_agents WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
});

fastify.post('/api/agents/:id/run', { preHandler: [fastify.authenticate] }, async (request) => {
  const { id } = request.params;
  
  // Simulate agent execution
  await pool.query(
    "UPDATE ai_agents SET status = 'busy', last_run = CURRENT_TIMESTAMP WHERE id = $1",
    [id]
  );
  
  // In real implementation, this would queue a job
  setTimeout(async () => {
    await pool.query(
      "UPDATE ai_agents SET status = 'active', current_task = 'Completed task' WHERE id = $1",
      [id]
    );
  }, 5000);
  
  return { success: true, message: 'Agent started' };
});

// Stores
fastify.get('/api/stores', { preHandler: [fastify.authenticate] }, async (request) => {
  const userId = request.user.id;
  const result = await pool.query(
    'SELECT * FROM stores WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
});

fastify.post('/api/stores', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const userId = request.user.id;
  const { name, platform, store_url, api_key } = request.body;
  
  const result = await pool.query(
    'INSERT INTO stores (user_id, name, platform, store_url, api_key) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, name, platform, store_url, api_key]
  );
  
  reply.code(201);
  return result.rows[0];
});

fastify.post('/api/stores/:id/sync', { preHandler: [fastify.authenticate] }, async (request) => {
  const { id } = request.params;
  
  // Simulate store sync
  await pool.query(
    'UPDATE stores SET last_sync = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  );
  
  return { success: true, message: 'Store sync started' };
});

// Workflows
fastify.get('/api/workflows', { preHandler: [fastify.authenticate] }, async (request) => {
  const userId = request.user.id;
  const result = await pool.query(
    'SELECT * FROM workflows WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
});

fastify.post('/api/workflows', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const userId = request.user.id;
  const { name, description, trigger_type, trigger_config, steps } = request.body;
  
  const result = await pool.query(
    'INSERT INTO workflows (user_id, name, description, trigger_type, trigger_config, steps) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [userId, name, description, trigger_type, trigger_config, steps]
  );
  
  reply.code(201);
  return result.rows[0];
});

fastify.post('/api/workflows/:id/run', { preHandler: [fastify.authenticate] }, async (request) => {
  const { id } = request.params;
  
  // Create workflow run
  const runResult = await pool.query(
    "INSERT INTO workflow_runs (workflow_id, status, started_at) VALUES ($1, 'running', CURRENT_TIMESTAMP) RETURNING *",
    [id]
  );
  
  // Update workflow
  await pool.query(
    'UPDATE workflows SET last_run = CURRENT_TIMESTAMP, run_count = run_count + 1 WHERE id = $1',
    [id]
  );
  
  return { success: true, run_id: runResult.rows[0].id };
});

// Leads
fastify.get('/api/leads', { preHandler: [fastify.authenticate] }, async (request) => {
  const userId = request.user.id;
  const result = await pool.query(
    'SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
});

fastify.post('/api/leads', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const userId = request.user.id;
  const { name, email, company, website, platform, score, source } = request.body;
  
  const result = await pool.query(
    'INSERT INTO leads (user_id, name, email, company, website, platform, score, source) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [userId, name, email, company, website, platform, score, source]
  );
  
  reply.code(201);
  return result.rows[0];
});

// Revenue tracking
fastify.get('/api/revenue', { preHandler: [fastify.authenticate] }, async (request) => {
  const userId = request.user.id;
  const { days = 30 } = request.query;
  
  const result = await pool.query(
    `SELECT date, SUM(revenue) as revenue, SUM(orders) as orders 
     FROM revenue_tracking 
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '${days} days'
     GROUP BY date 
     ORDER BY date`,
    [userId]
  );
  
  return result.rows;
});

// SHOPIFY INTEGRATION
fastify.get('/api/stores/:id/shopify/orders', { preHandler: [fastify.authenticate] }, async (request) => {
  const { id } = request.params;
  const { limit = 50 } = request.query;
  
  const storeResult = await pool.query(
    'SELECT * FROM stores WHERE id = $1 AND platform = $2',
    [id, 'shopify']
  );
  
  if (storeResult.rows.length === 0) {
    return { error: 'Store not found or not Shopify' };
  }
  
  const store = storeResult.rows[0];
  const shopify = new ShopifyIntegration(store.store_url, store.access_token);
  
  try {
    const orders = await shopify.getOrders(limit);
    return { orders };
  } catch (error) {
    return { error: error.message };
  }
});

fastify.get('/api/stores/:id/shopify/products', { preHandler: [fastify.authenticate] }, async (request) => {
  const { id } = request.params;
  const { limit = 50 } = request.query;
  
  const storeResult = await pool.query(
    'SELECT * FROM stores WHERE id = $1 AND platform = $2',
    [id, 'shopify']
  );
  
  if (storeResult.rows.length === 0) {
    return { error: 'Store not found or not Shopify' };
  }
  
  const store = storeResult.rows[0];
  const shopify = new ShopifyIntegration(store.store_url, store.access_token);
  
  try {
    const products = await shopify.getProducts(limit);
    return { products };
  } catch (error) {
    return { error: error.message };
  }
});

fastify.get('/api/stores/:id/shopify/analytics', { preHandler: [fastify.authenticate] }, async (request) => {
  const { id } = request.params;
  const { startDate, endDate } = request.query;
  
  const storeResult = await pool.query(
    'SELECT * FROM stores WHERE id = $1 AND platform = $2',
    [id, 'shopify']
  );
  
  if (storeResult.rows.length === 0) {
    return { error: 'Store not found or not Shopify' };
  }
  
  const store = storeResult.rows[0];
  const shopify = new ShopifyIntegration(store.store_url, store.access_token);
  
  try {
    // Default to last 30 days if no dates provided
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();
    
    const report = await shopify.getSalesReport(start, end);
    return report;
  } catch (error) {
    return { error: error.message };
  }
});

fastify.get('/api/stores/:id/shopify/inventory', { preHandler: [fastify.authenticate] }, async (request) => {
  const { id } = request.params;
  
  const storeResult = await pool.query(
    'SELECT * FROM stores WHERE id = $1 AND platform = $2',
    [id, 'shopify']
  );
  
  if (storeResult.rows.length === 0) {
    return { error: 'Store not found or not Shopify' };
  }
  
  const store = storeResult.rows[0];
  const shopify = new ShopifyIntegration(store.store_url, store.access_token);
  
  try {
    const inventory = await shopify.getInventoryLevels();
    return { inventory };
  } catch (error) {
    return { error: error.message };
  }
});

// OMNISEND INTEGRATION
fastify.get('/api/omnisend/contacts', { preHandler: [fastify.authenticate] }, async (request) => {
  const userId = request.user.id;
  const { limit = 50 } = request.query;
  
  // Get user's Omnisend API key from settings (stored in database)
  const settingsResult = await pool.query(
    'SELECT omnisend_api_key FROM user_settings WHERE user_id = $1',
    [userId]
  );
  
  const apiKey = settingsResult.rows[0]?.omnisend_api_key || process.env.OMNISEND_API_KEY;
  
  if (!apiKey) {
    return { error: 'Omnisend API key not configured' };
  }
  
  const omnisend = new OmnisendIntegration(apiKey);
  
  try {
    const contacts = await omnisend.getContacts(limit);
    return contacts;
  } catch (error) {
    return { error: error.message };
  }
});

fastify.get('/api/omnisend/campaigns', { preHandler: [fastify.authenticate] }, async (request) => {
  const userId = request.user.id;
  
  const settingsResult = await pool.query(
    'SELECT omnisend_api_key FROM user_settings WHERE user_id = $1',
    [userId]
  );
  
  const apiKey = settingsResult.rows[0]?.omnisend_api_key || process.env.OMNISEND_API_KEY;
  
  if (!apiKey) {
    return { error: 'Omnisend API key not configured' };
  }
  
  const omnisend = new OmnisendIntegration(apiKey);
  
  try {
    const campaigns = await omnisend.getCampaigns();
    return campaigns;
  } catch (error) {
    return { error: error.message };
  }
});

fastify.get('/api/omnisend/analytics', { preHandler: [fastify.authenticate] }, async (request) => {
  const userId = request.user.id;
  const { startDate, endDate } = request.query;
  
  const settingsResult = await pool.query(
    'SELECT omnisend_api_key FROM user_settings WHERE user_id = $1',
    [userId]
  );
  
  const apiKey = settingsResult.rows[0]?.omnisend_api_key || process.env.OMNISEND_API_KEY;
  
  if (!apiKey) {
    return { error: 'Omnisend API key not configured' };
  }
  
  const omnisend = new OmnisendIntegration(apiKey);
  
  try {
    const analytics = await omnisend.getAnalytics(startDate, endDate);
    return analytics;
  } catch (error) {
    return { error: error.message };
  }
});

fastify.post('/api/omnisend/campaigns', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const userId = request.user.id;
  const campaignData = request.body;
  
  const settingsResult = await pool.query(
    'SELECT omnisend_api_key FROM user_settings WHERE user_id = $1',
    [userId]
  );
  
  const apiKey = settingsResult.rows[0]?.omnisend_api_key || process.env.OMNISEND_API_KEY;
  
  if (!apiKey) {
    return { error: 'Omnisend API key not configured' };
  }
  
  const omnisend = new OmnisendIntegration(apiKey);
  
  try {
    const campaign = await omnisend.createCampaign(campaignData);
    reply.code(201);
    return campaign;
  } catch (error) {
    return { error: error.message };
  }
});

// WebSocket for real-time updates
fastify.register(require('@fastify/websocket'));

fastify.get('/ws', { websocket: true }, (connection, req) => {
  connection.socket.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'subscribe') {
      // Subscribe to updates
      connection.socket.send(JSON.stringify({ type: 'subscribed', channel: data.channel }));
    }
  });
  
  // Send heartbeat
  const interval = setInterval(() => {
    connection.socket.send(JSON.stringify({ type: 'heartbeat', time: Date.now() }));
  }, 30000);
  
  connection.socket.on('close', () => {
    clearInterval(interval);
  });
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Blaze Business OS API running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
