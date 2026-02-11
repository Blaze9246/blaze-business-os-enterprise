const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/dashboard/stats', async (req, res) => {
  res.json({
    revenue: 24500,
    revenueChange: '+12.5%',
    tasks: 24,
    tasksChange: '+3 today',
    agents: 6,
    agentsStatus: 'All active',
    stores: 3,
    storesStatus: '1 needs attention'
  });
});

app.get('/api/tasks', async (req, res) => {
  res.json([
    { id: '1', title: 'Review Q4 Marketing Plan', status: 'todo', priority: 'high' },
    { id: '2', title: 'Update Shopify Product Feed', status: 'inprogress', priority: 'medium' },
    { id: '3', title: 'Hunter Agent Configuration', status: 'review', priority: 'high' }
  ]);
});

app.get('/api/agents', async (req, res) => {
  res.json([
    { id: 'hunter', name: 'Hunter Agent', status: 'running', stats: { found: 10, qualified: 8 } },
    { id: 'outreach', name: 'Outreach Agent', status: 'idle', stats: { sent: 45, opened: 12 } },
    { id: 'creator', name: 'Creator Agent', status: 'running', stats: { posts: 3, stories: 5 } }
  ]);
});

app.get('/api/leads', async (req, res) => {
  res.json([
    { id: '1', name: 'John Smith', company: 'Acme Corp', email: 'john@acme.com', score: 92, tier: 'HOT' },
    { id: '2', name: 'Sarah Johnson', company: 'TechStart Inc', email: 'sarah@tech.co', score: 78, tier: 'WARM' }
  ]);
});

app.get('/api/stores', async (req, res) => {
  res.json([
    { id: '1', name: 'Main Shopify Store', platform: 'shopify', orders: 1234, revenue: '$45.2k' },
    { id: '2', name: 'WooCommerce Site', platform: 'woocommerce', orders: 567, revenue: '$23.1k' }
  ]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});