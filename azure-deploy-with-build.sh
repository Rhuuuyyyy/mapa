#!/bin/bash
# =============================================================================
# MAPA SaaS - Azure Deploy with Oryx Build
# Este script faz deploy via SCM/Kudu API que ACIONA o Oryx build
# =============================================================================

set -e  # Exit on error

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "============================================"
echo "🚀 MAPA SaaS - Azure Deploy (with Build)"
echo "============================================"

# Parâmetros
APP_NAME="${APP_NAME:-mapa-app-clean-8270}"
RESOURCE_GROUP="${RESOURCE_GROUP:-mapa-saas-clean}"

echo ""
echo "App Name: $APP_NAME"
echo "Resource Group: $RESOURCE_GROUP"
echo ""

# Verificar se az CLI está instalado e logado
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not found. Please install: https://aka.ms/azure-cli${NC}"
    exit 1
fi

if ! az account show &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Azure. Run: az login${NC}"
    exit 1
fi

# 1. Criar deployment package
echo -e "${GREEN}[1/5]${NC} Creating deployment package..."

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

ZIP_SIZE=$(du -h deploy.zip | cut -f1)
echo "✓ Package created: deploy.zip ($ZIP_SIZE)"

# 2. Obter credenciais de deploy
echo ""
echo -e "${GREEN}[2/5]${NC} Getting deployment credentials..."

PUBLISH_PROFILE=$(az webapp deployment list-publishing-profiles \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --xml)

# Extrair username e password do XML
USERNAME=$(echo "$PUBLISH_PROFILE" | grep -oPm1 "(?<=<publishData><publishProfile publishMethod=\"MSDeploy\" publishUrl=\")[^\"]*" | sed 's/.*\///' || echo "$APP_NAME")
PASSWORD=$(echo "$PUBLISH_PROFILE" | grep -oPm1 "(?<=userPWD=\")[^\"]*" | head -1)

if [ -z "$PASSWORD" ]; then
    echo -e "${RED}❌ Could not get deployment credentials${NC}"
    exit 1
fi

echo "✓ Credentials obtained"

# 3. Fazer deploy via ZipDeploy API (aciona Oryx build)
echo ""
echo -e "${GREEN}[3/5]${NC} Deploying via Kudu API (this triggers Oryx build)..."
echo "⏳ This may take 2-5 minutes on first deploy..."

KUDU_URL="https://$APP_NAME.scm.azurewebsites.net/api/zipdeploy"

# Fazer deploy via curl
HTTP_CODE=$(curl -X POST \
    -u "$USERNAME:$PASSWORD" \
    --data-binary @deploy.zip \
    -H "Content-Type: application/zip" \
    -w "%{http_code}" \
    -o /tmp/deploy_response.txt \
    "$KUDU_URL" \
    2>/dev/null)

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "202" ]; then
    echo "✓ Deploy successful (HTTP $HTTP_CODE)"
else
    echo -e "${RED}❌ Deploy failed (HTTP $HTTP_CODE)${NC}"
    cat /tmp/deploy_response.txt
    rm -f deploy.zip /tmp/deploy_response.txt
    exit 1
fi

# 4. Configurar startup command
echo ""
echo -e "${GREEN}[4/5]${NC} Configuring startup command..."

az webapp config set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --startup-file "startup.sh" \
    --output none

echo "✓ Startup command configured"

# 5. Reiniciar app
echo ""
echo -e "${GREEN}[5/5]${NC} Restarting app..."

az webapp restart \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --output none

echo "✓ App restarted"

# Limpar arquivos temporários
rm -f deploy.zip /tmp/deploy_response.txt

# Obter URL do app
APP_URL=$(az webapp show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --query "defaultHostName" \
    --output tsv)

echo ""
echo "============================================"
echo -e "${GREEN}✅ Deploy Complete!${NC}"
echo "============================================"
echo ""
echo "App URL: https://$APP_URL"
echo "Health Check: https://$APP_URL/health"
echo "API Docs: https://$APP_URL/api/docs"
echo ""
echo -e "${YELLOW}⏳ First startup may take 3-5 minutes${NC}"
echo "   (Oryx is installing dependencies...)"
echo ""
echo "To view logs:"
echo "  az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo ""
echo "Or use the script:"
echo "  ./scripts/azure-logs.sh"
echo ""
