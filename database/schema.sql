-- Blaze Business OS Enterprise - Database Schema
-- PostgreSQL

-- Users table (Clerk integration)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores table (Shopify, WooCommerce, etc.)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- shopify, woocommerce, etc.
    store_url VARCHAR(500),
    api_key VARCHAR(500),
    api_secret VARCHAR(500),
    access_token VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    revenue_monthly DECIMAL(12,2) DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Agents table
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- content, social, email, lead, video, analytics
    status VARCHAR(50) DEFAULT 'active',
    current_task TEXT,
    task_progress INTEGER DEFAULT 0,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo', -- todo, inprogress, review, done
    priority VARCHAR(50) DEFAULT 'medium', -- urgent, high, medium, low
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflows table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(100), -- schedule, webhook, manual
    trigger_config JSONB DEFAULT '{}',
    steps JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active',
    last_run TIMESTAMP,
    run_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow runs table
CREATE TABLE workflow_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    status VARCHAR(50), -- running, completed, failed
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    logs JSONB DEFAULT '[]',
    error_message TEXT
);

-- Activity log table
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    company VARCHAR(255),
    website VARCHAR(500),
    platform VARCHAR(50), -- shopify, woocommerce
    score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, converted
    source VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue tracking table
CREATE TABLE revenue_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    revenue DECIMAL(12,2) DEFAULT 0,
    orders INTEGER DEFAULT 0,
    aov DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_stores_user_id ON stores(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_agents_user_id ON ai_agents(user_id);
CREATE INDEX idx_activity_user_id ON activity_log(user_id);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_revenue_user_date ON revenue_tracking(user_id, date);

-- Insert sample data for Zain
INSERT INTO users (id, email, first_name, last_name, company_name, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'zain@blazeignite.com', 'Zain', 'Moolla', 'Blaze Ignite', 'admin');

INSERT INTO stores (id, user_id, name, platform, store_url, status, revenue_monthly, orders_count) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Essora Skincare', 'shopify', 'https://essoraskincare.com', 'active', 12500, 45),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Blaze Ignite', 'shopify', 'https://blazeignite.com', 'active', 8000, 23),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Fashion Hub', 'shopify', 'https://fashionhub.com', 'warning', 4000, 12);

INSERT INTO ai_agents (id, user_id, name, type, status, current_task) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Content Manager', 'content', 'active', 'Writing blog post'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Social Manager', 'social', 'busy', 'Creating Instagram content'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Email Manager', 'email', 'active', 'Monitoring campaigns'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Lead Manager', 'lead', 'offline', 'Scheduled for 2PM'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Video Manager', 'video', 'active', 'Editing product video'),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Analytics Manager', 'analytics', 'active', 'Generating reports');

INSERT INTO tasks (id, user_id, title, status, priority) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Campaign Generator V2', 'todo', 'urgent'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'AI Hunter Agent', 'todo', 'high'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Systeme.io Integration', 'todo', 'high'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Shopify Store Connection', 'inprogress', 'medium'),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Hunter.io API Setup', 'inprogress', 'medium'),
('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'MVP Dashboard UI', 'done', 'urgent');
