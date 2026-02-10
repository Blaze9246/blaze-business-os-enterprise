# Blaze Business OS - Enterprise

Full-stack enterprise business operating system with AI workforce, task management, store integration, and workflow automation.

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Clerk Auth
- **Backend**: Node.js + Fastify + WebSockets
- **Database**: PostgreSQL (Neon)
- **Cache**: Redis (Upstash)
- **Queue**: BullMQ
- **Deployment**: Render.com

## 📁 Structure

```
blaze-business-os-enterprise/
├── backend/
│   └── server.js           # Fastify API server
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand state management
│   │   └── lib/            # API client & utilities
│   └── index.html
├── database/
│   └── schema.sql          # PostgreSQL schema
└── render.yaml             # Render deployment config
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis (optional for local dev)

### Setup

1. Clone the repo:
```bash
git clone https://github.com/Blaze9246/blaze-business-os-enterprise.git
cd blaze-business-os-enterprise
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

5. Set up the database:
```bash
psql -d your_database -f database/schema.sql
```

6. Start the backend:
```bash
npm run dev
```

7. Start the frontend (in another terminal):
```bash
cd frontend
npm run dev
```

## 🌐 Deployment

### Render.com (Recommended)

1. Connect your GitHub repo to Render
2. Create a new Blueprint from `render.yaml`
3. Render will automatically create:
   - PostgreSQL database
   - Redis cache
   - Web service for backend
   - Static site for frontend

4. Add environment variables in Render dashboard:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
   - `CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Manual Deployment

**Backend:**
```bash
git push origin main
# Deploy backend to Render/Railway/Heroku
```

**Frontend:**
```bash
cd frontend
npm run build
# Deploy `dist` folder to Vercel/Netlify/GitHub Pages
```

## 🔑 Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key

# Clerk Auth
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Redis
REDIS_URL=redis://...

# Integrations
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
SYSTEME_API_KEY=...
HUNTER_API_KEY=...

# App
NODE_ENV=production
PORT=3001
```

## 📱 Features

- ✅ **Dashboard** - Real-time stats and activity
- ✅ **Tasks** - Kanban board with drag-and-drop
- ✅ **AI Agents** - 6 specialized AI workers
- ✅ **Stores** - Multi-store management (Shopify, WooCommerce)
- ✅ **Leads** - Lead tracking and scoring
- ✅ **Workflows** - Visual automation builder
- ✅ **Settings** - Profile, company, security

## 🔥 Next Steps

1. **AI Agent Execution** - Connect to real AI models
2. **Shopify Integration** - Deep store sync
3. **Lead Generation** - Hunter.io + email campaigns
4. **Campaign Generator** - Multi-channel campaigns
5. **Real-time Updates** - WebSocket live data

## 📄 License

MIT

Built with 🔥 by Blaze Ignite
