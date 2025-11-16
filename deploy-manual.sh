#!/bin/bash
# =============================================================================
# Deploy Manual Simplificado (sem Azure CLI)
# Usa apenas curl para fazer deploy via Kudu API
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "============================================"
echo "🚀 MAPA SaaS - Deploy Manual via Kudu API"
echo "============================================"

# Configurações
APP_NAME="mapa-app-clean-8270"
RESOURCE_GROUP="mapa-saas-clean"

echo ""
echo -e "${YELLOW}⚠️  ATENÇÃO:${NC} Este script precisa das credenciais do Azure."
echo ""
echo "Para obter as credenciais, execute este comando localmente (onde tem Azure CLI):"
echo ""
echo -e "${GREEN}  az webapp deployment list-publishing-profiles \\"
echo "    --resource-group $RESOURCE_GROUP \\"
echo "    --name $APP_NAME \\"
echo "    --query \"[?publishMethod=='MSDeploy']|[0].[userName,userPWD]\" \\"
echo -e "    --output tsv${NC}"
echo ""

# Solicitar credenciais
read -p "Digite o USERNAME (ex: \$mapa-app-clean-8270): " USERNAME
read -sp "Digite o PASSWORD: " PASSWORD
echo ""
echo ""

if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
    echo -e "${RED}❌ Credenciais não fornecidas!${NC}"
    exit 1
fi

# Criar package
echo -e "${GREEN}[1/3]${NC} Creating deployment package..."
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
echo "✓ Package created: $ZIP_SIZE"

# Deploy via Kudu API
echo ""
echo -e "${GREEN}[2/3]${NC} Deploying to Azure via Kudu API..."
echo "⏳ This may take 2-5 minutes..."

KUDU_URL="https://$APP_NAME.scm.azurewebsites.net/api/zipdeploy"

HTTP_CODE=$(curl -X POST \
    -u "$USERNAME:$PASSWORD" \
    --data-binary @deploy.zip \
    -H "Content-Type: application/zip" \
    -w "%{http_code}" \
    -o /tmp/deploy_response.txt \
    -s \
    "$KUDU_URL")

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "202" ]; then
    echo -e "${GREEN}✓ Deploy successful (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Deploy failed (HTTP $HTTP_CODE)${NC}"
    cat /tmp/deploy_response.txt
    rm -f deploy.zip /tmp/deploy_response.txt
    exit 1
fi

# Limpar
rm -f deploy.zip /tmp/deploy_response.txt

# Resultado
echo ""
echo -e "${GREEN}[3/3]${NC} Testing deployment..."
sleep 5

# Testar endpoint
HEALTH_URL="https://$APP_NAME.azurewebsites.net/health"
echo "Testing: $HEALTH_URL"

HTTP_CODE=$(curl -s -o /tmp/health_response.txt -w "%{http_code}" "$HEALTH_URL")

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ App is healthy!${NC}"
    cat /tmp/health_response.txt
    echo ""
else
    echo -e "${YELLOW}⚠️  App returned HTTP $HTTP_CODE${NC}"
    echo "Response:"
    cat /tmp/health_response.txt
    echo ""
    echo -e "${YELLOW}Note: First startup may take 5 minutes. Please wait and try again.${NC}"
fi

rm -f /tmp/health_response.txt

echo ""
echo "============================================"
echo -e "${GREEN}✅ Deploy Complete!${NC}"
echo "============================================"
echo ""
echo "App URL: https://$APP_NAME.azurewebsites.net"
echo "Health: https://$APP_NAME.azurewebsites.net/health"
echo "API Docs: https://$APP_NAME.azurewebsites.net/api/docs"
echo ""
echo -e "${YELLOW}⏳ If you see 'Application Error', wait 5 minutes for Oryx to install dependencies.${NC}"
echo ""
