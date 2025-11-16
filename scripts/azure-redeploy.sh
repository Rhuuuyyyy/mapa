#!/bin/bash
# ============================================================================
# MAPA SaaS - Azure Redeploy with Config Fix
# ============================================================================

set -e

# Configuration
RESOURCE_GROUP="mapa-saas-clean"
APP_SERVICE="mapa-app-clean-8270"

echo "============================================"
echo "🔧 Fixing ALLOWED_ORIGINS Configuration"
echo "============================================"

# Disable Bash history expansion to avoid issues with special characters
set +H

# Set ALLOWED_ORIGINS as simple string (asterisk allows all origins)
echo "Setting ALLOWED_ORIGINS=*..."
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_SERVICE" \
    --settings ALLOWED_ORIGINS="*" \
    --output table

# Re-enable history expansion
set -H

echo ""
echo "============================================"
echo "📦 Deploying Updated Code"
echo "============================================"

# Run the deploy script
./scripts/azure-deploy.sh

echo ""
echo "============================================"
echo "🔄 Restarting App"
echo "============================================"

az webapp restart \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_SERVICE"

echo ""
echo "⏳ Waiting 10 seconds for startup..."
sleep 10

echo ""
echo "============================================"
echo "📊 Checking Health"
echo "============================================"

APP_URL="https://${APP_SERVICE}.azurewebsites.net"
echo "Testing: ${APP_URL}/health"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/health" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ App is healthy!"
    echo ""
    echo "🎉 Success! App is running at:"
    echo "   ${APP_URL}"
    echo ""
    echo "Available endpoints:"
    echo "   - Health: ${APP_URL}/health"
    echo "   - API Docs: ${APP_URL}/api/docs"
    echo "   - Login: ${APP_URL}/login.html"
else
    echo "⚠️ App returned HTTP $HTTP_CODE"
    echo "Checking logs..."
    echo ""
    ./scripts/azure-logs.sh
fi
