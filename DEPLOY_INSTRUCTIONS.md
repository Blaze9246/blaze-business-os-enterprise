# 🚀 DEPLOY INSTRUCTIONS - BLAZE BUSINESS OS

## OPTION 1: Manual Render Deploy (FASTEST - 5 minutes)

### Step 1: Create Blueprint
1. Go to https://dashboard.render.com/blueprints
2. Click **"New Blueprint Instance"**
3. Connect GitHub repo: `Blaze9246/blaze-business-os-enterprise`
4. Click **"Apply"**

### Step 2: Wait 2-3 minutes
Render will auto-create:
- PostgreSQL database
- Redis cache
- Backend API (Node.js)
- Frontend static site

### Step 3: Get your URLs
After deploy, you'll have:
- **Frontend:** `https://blaze-business-os-app.onrender.com`
- **API:** `https://blaze-business-os-api.onrender.com`

### Step 4: Add Environment Variables
In Render dashboard, add to your services:
```
CLERK_PUBLISHABLE_KEY=pk_test_YWJvdmUtd2hpcHBldC0zNi5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_k61iDDorYAqa5TSxzaw1xcHQz3PH4blo1XSSp6ztqJ
SYSTEME_API_KEY=gutxuny6z7abcijjhr16yqazqltx43z5gqcl8jpo12mibokr31js1hfc0ed8i8k2
```

---

## OPTION 2: GitHub Pages + Render (FREE - 10 minutes)

### Backend on Render:
1. Go to https://dashboard.render.com/new/web-service
2. Connect your GitHub repo
3. Set:
   - **Name:** blaze-business-os-api
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node backend/server.js`
4. Add environment variables (see above)
5. Click **"Create Web Service"**

### Frontend on GitHub Pages:
1. Go to repo Settings > Pages
2. Source: Deploy from branch
3. Branch: `gh-pages` / `root`
4. Click **Save**

---

## ✅ ONCE DEPLOYED

Your app will have:
- Login/Signup (Clerk)
- Dashboard with stats
- Task Kanban board
- AI Agents panel
- Store management
- Lead tracking
- Reports (Shopify + Omnisend)
- Automation Control Center

---

## 🔑 API KEYS TO ADD LATER

After deploy, add these in Render dashboard:
- `SHOPIFY_API_KEY` - From Shopify Partners
- `SHOPIFY_API_SECRET` - From Shopify Partners  
- `OMNISEND_API_KEY` - From Omnisend
- `HUNTER_API_KEY` - From Hunter.io
- `OPENAI_API_KEY` - From OpenAI

---

**Questions? Send voice note!**
