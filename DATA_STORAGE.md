# Blaze Business OS - Data Storage

## Storage Method: File-Based JSON

Data is stored in `/data/database.json` with automatic backups.

### Backup System
- Backups created automatically before every save
- Stored in `/data/backups/`
- Last 10 backups kept
- Named: `backup-YYYY-MM-DDTHH-MM-SS.json`

### Data Structure
```json
{
  "leads": [...],
  "agents": [...],
  "tasks": [...],
  "stores": [...],
  "version": 1,
  "lastUpdated": "2026-02-13T19:30:00.000Z"
}
```

### IMPORTANT - Vercel Deployment
**On Vercel serverless functions:**
- File system is read-only
- Data resets on each deployment
- Use "🌱 Seed Database" button to restore sample data

### For Persistent Storage
Deploy to Railway or Render for persistent file storage:
1. Railway: `railway.app` (free tier with persistent disk)
2. Render: `render.com` (free tier with persistent disk)

### API Endpoints
All standard endpoints work with file storage:
- GET /api/stats
- GET/POST /api/leads
- DELETE /api/leads/:id
- GET /api/agents
- PUT /api/agents/:id
- GET/POST /api/tasks
- PUT/DELETE /api/tasks/:id
- GET /api/seed
- GET /api/systeme/contacts
- POST /api/systeme/sync
