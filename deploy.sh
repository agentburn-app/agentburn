#!/bin/bash
#
# AgentBurn Production Deploy Script
# Runs on the production server after files are synced
#
# Usage: ./deploy.sh (called automatically by sync-to-production.sh)
#

set -e

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration — UPDATE THESE
APP_PATH="/home/agentburn/agentburn.dev"
APP_NAME="agentburn"
NODE_ENV="production"
PORT=8004

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  AgentBurn Production Deploy${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# ============================================================================
# 0. VERIFY .ENV FILE
# ============================================================================
echo -e "${YELLOW}[0/7] Checking .env file...${NC}"
cd "$APP_PATH"
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        cp .env.production .env
        chmod 600 .env
        echo -e "  ${GREEN}✓ Created .env from .env.production${NC}"
    else
        echo -e "  ${RED}✗ No .env file found! Create one on the server.${NC}"
        exit 1
    fi
else
    chmod 600 .env
    echo -e "  ${GREEN}✓ .env exists and secured${NC}"
fi
echo ""

# ============================================================================
# 1. INSTALL DEPENDENCIES
# ============================================================================
echo -e "${YELLOW}[1/7] Installing dependencies...${NC}"
npm ci
echo -e "  ${GREEN}✓ Dependencies installed${NC}"
echo ""

# ============================================================================
# 2. GENERATE PRISMA CLIENT
# ============================================================================
echo -e "${YELLOW}[2/7] Generating Prisma client...${NC}"
npx prisma generate
echo -e "  ${GREEN}✓ Prisma client generated${NC}"
echo ""

# ============================================================================
# 3. RUN DATABASE MIGRATIONS
# ============================================================================
echo -e "${YELLOW}[3/7] Pushing database schema...${NC}"
npx prisma db push --skip-generate --accept-data-loss
echo -e "  ${GREEN}✓ Database schema in sync${NC}"
echo ""

# ============================================================================
# 4. BUILD NEXT.JS
# ============================================================================
echo -e "${YELLOW}[4/7] Building Next.js application...${NC}"
NODE_ENV="$NODE_ENV" npm run build
echo -e "  ${GREEN}✓ Next.js build complete${NC}"
echo ""

# ============================================================================
# 5. RESTART APPLICATION WITH PM2
# ============================================================================
echo -e "${YELLOW}[5/7] Restarting application with PM2...${NC}"

if pm2 list | grep -q "$APP_NAME"; then
    echo "  Restarting existing process..."
    pm2 restart "$APP_NAME"
else
    echo "  Starting new process..."
    PORT="$PORT" NODE_ENV="$NODE_ENV" pm2 start npm --name "$APP_NAME" -- start
fi
pm2 save

echo -e "  ${GREEN}✓ Application restarted${NC}"
echo ""

# ============================================================================
# 6. VERIFY APPLICATION HEALTH
# ============================================================================
echo -e "${YELLOW}[6/7] Verifying application health...${NC}"

MAX_RETRIES=10
RETRY_DELAY=3
HEALTHY=false

for i in $(seq 1 $MAX_RETRIES); do
    sleep "$RETRY_DELAY"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "302" ]; then
        echo -e "  ${GREEN}✓ Application is healthy (HTTP $HTTP_CODE, attempt $i)${NC}"
        HEALTHY=true
        break
    fi
    echo -e "  ${YELLOW}Attempt $i/$MAX_RETRIES — HTTP $HTTP_CODE, waiting ${RETRY_DELAY}s...${NC}"
done

if [ "$HEALTHY" = false ]; then
    echo -e "  ${RED}✗ Health check failed after $MAX_RETRIES attempts${NC}"
    echo ""
    echo "  Last 30 lines of logs:"
    pm2 logs "$APP_NAME" --lines 30 --nostream 2>/dev/null || true
    echo ""
    echo -e "  ${YELLOW}To rollback, restore the latest backup from ~/backups/${NC}"
    exit 1
fi
echo ""

# ============================================================================
# 7. DISPLAY STATUS
# ============================================================================
echo -e "${YELLOW}[7/7] Displaying application status...${NC}"
pm2 status
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application Status:"
pm2 info "$APP_NAME" | grep -E "status|uptime|cpu|memory" || true
echo ""
echo "Useful commands:"
echo "  View logs:      pm2 logs $APP_NAME"
echo "  Monitor:        pm2 monit"
echo "  Restart:        pm2 restart $APP_NAME"
echo "  Stop:           pm2 stop $APP_NAME"
echo ""
