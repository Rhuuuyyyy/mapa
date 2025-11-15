#!/bin/bash

# ==========================================
# MAPA SaaS - Azure Deployment Script
# ==========================================

set -e

echo "🚀 MAPA SaaS - Azure Deployment"
echo "================================"
echo ""

# Variables
RESOURCE_GROUP="${RESOURCE_GROUP:-mapa-saas-rg}"
WEB_APP="${WEB_APP:-mapa-saas-app-1762971490}"
ZIP_FILE="deploy.zip"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1/5:${NC} Cleaning temporary files..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.pyo" -delete 2>/dev/null || true
rm -f deploy.zip 2>/dev/null || true

echo -e "${YELLOW}Step 2/5:${NC} Creating deployment package (using explicit file list)..."

# Use the create-deployment-zip script for better control
bash create-deployment-zip.sh > /tmp/zip-creation.log 2>&1

if [ ! -f "$ZIP_FILE" ]; then
    echo -e "${RED}✗${NC} Failed to create ZIP"
    cat /tmp/zip-creation.log
    exit 1
fi

echo -e "${GREEN}✓${NC} Package created: $(du -h $ZIP_FILE | cut -f1)"
echo ""
echo "📋 Verifying critical files in ZIP:"
unzip -l $ZIP_FILE | grep -E "(requirements.txt|startup-azure|app/main.py)" | sed 's/^/  /'

echo -e "${YELLOW}Step 3/5:${NC} Configuring Azure App Service..."

# Set Python version
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $WEB_APP \
  --linux-fx-version "PYTHON|3.11" \
  > /dev/null

# Set startup command to use our custom script (minimal = direct uvicorn)
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $WEB_APP \
  --startup-file "startup-minimal.sh" \
  > /dev/null

# Disable Oryx build (we'll install dependencies at runtime)
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $WEB_APP \
  --settings \
    SCM_DO_BUILD_DURING_DEPLOYMENT=false \
    ENABLE_ORYX_BUILD=false \
    DISABLE_COLLECTSTATIC=1 \
  > /dev/null

echo -e "${GREEN}✓${NC} Azure configuration updated"

echo -e "${YELLOW}Step 4/5:${NC} Deploying application..."

# Deploy using ZIP
az webapp deploy \
  --resource-group $RESOURCE_GROUP \
  --name $WEB_APP \
  --src-path $ZIP_FILE \
  --type zip \
  --async true

echo -e "${GREEN}✓${NC} Deployment initiated"

echo -e "${YELLOW}Step 5/5:${NC} Restarting application..."
az webapp restart \
  --resource-group $RESOURCE_GROUP \
  --name $WEB_APP \
  > /dev/null

echo -e "${GREEN}✓${NC} Application restarted"

echo ""
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Wait 2-3 minutes for the app to start"
echo "   2. Check logs: az webapp log tail --resource-group $RESOURCE_GROUP --name $WEB_APP"
echo "   3. Visit: https://$WEB_APP.azurewebsites.net"
echo ""
echo "🔧 Troubleshooting:"
echo "   - View build logs: https://$WEB_APP.scm.azurewebsites.net/api/deployments"
echo "   - SSH to container: az webapp ssh --resource-group $RESOURCE_GROUP --name $WEB_APP"
echo ""

# Cleanup
rm -f $ZIP_FILE

echo "🎉 Done!"
