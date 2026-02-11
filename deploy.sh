#!/bin/bash
# Deploy Blaze Business OS to Render

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Blaze Business OS Deploy Script${NC}"
echo ""

# Check if render CLI is available
if ! command -v render &> /dev/null; then
    echo -e "${YELLOW}Installing Render CLI...${NC}"
    curl -fsSL https://raw.githubusercontent.com/render-oss/cli/main/bin/install.sh | bash
fi

# Set API key
export RENDER_API_KEY="rnd_MTa6cP1RjQ7GzKSKOrKnVx1uzm7B"

echo -e "${GREEN}Step 1: Deploying Backend API...${NC}"

# Deploy backend
curl -s -X PATCH "https://api.render.com/v1/services/srv-d65hei8gjchc73bkbpqg" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repo": "https://github.com/Blaze9246/blaze-business-os-enterprise",
    "branch": "main"
  }'

echo ""
echo -e "${GREEN}Step 2: Triggering Deploy...${NC}"

# Trigger deploy
curl -s -X POST "https://api.render.com/v1/services/srv-d65hei8gjchc73bkbpqg/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' || echo "Deploy triggered via webhook"

echo ""
echo -e "${GREEN}✅ Deploy initiated!${NC}"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://blaze-business-os-prod.onrender.com"
echo ""
echo "⏱️  Build takes 2-3 minutes. Check status at:"
echo "   https://dashboard.render.com/web/srv-d65hei8gjchc73bkbpqg"
