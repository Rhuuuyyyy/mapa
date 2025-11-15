#!/bin/bash
# =============================================================================
# MAPA SaaS - Azure Deploy Script
# Deploy limpo e rápido para Azure App Service
# =============================================================================

set -e  # Exit on error

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================"
echo "🚀 MAPA SaaS - Azure Deploy"
echo "============================================"

# Parâmetros
APP_NAME="${APP_NAME:-mapa-app-clean}"
RESOURCE_GROUP="${RESOURCE_GROUP:-mapa-saas-clean}"

echo ""
echo "App Name: $APP_NAME"
echo "Resource Group: $RESOURCE_GROUP"
echo ""

# 1. Criar deployment package
echo -e "${GREEN}[1/3]${NC} Creating deployment package..."

# Criar ZIP limpo (excluir desnecessários)
zip -r deploy.zip . \
    -x "*.git*" \
    -x "*__pycache__*" \
    -x "*.pyc" \
    -x "*venv/*" \
    -x "*antenv/*" \
    -x "*.env" \
    -x "*uploads/*" \
    -x "*EXEMPLO-DO-PROJETO/*" \
    -x "deploy.zip" \
    -x "*.md" \
    -q

echo "✓ Package created: deploy.zip ($(du -h deploy.zip | cut -f1))"

# 2. Deploy para Azure
echo ""
echo -e "${GREEN}[2/3]${NC} Deploying to Azure..."

az webapp deploy \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --src-path deploy.zip \
    --type zip \
    --async false

echo "✓ Deployment initiated"

# 3. Aguardar alguns segundos e mostrar logs
echo ""
echo -e "${GREEN}[3/3]${NC} Checking deployment status..."
sleep 5

# 4. Mostrar URL do app
APP_URL=$(az webapp show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --query "defaultHostName" \
    --output tsv)

# Limpar arquivo temporário
rm -f deploy.zip

echo ""
echo "============================================"
echo -e "${GREEN}✅ Deploy Complete!${NC}"
echo "============================================"
echo ""
echo "App URL: https://$APP_URL"
echo "Health Check: https://$APP_URL/health"
echo "API Docs: https://$APP_URL/api/docs"
echo ""
echo "To view logs:"
echo "  ./scripts/azure-logs.sh"
echo ""
echo -e "${YELLOW}Note:${NC} First startup may take 2-3 minutes while dependencies are installed."
echo ""
