#!/bin/bash
# =============================================================================
# MAPA SaaS - Azure Setup Script
# Cria todos os recursos Azure necessários (executar UMA vez)
# =============================================================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================"
echo "🔧 MAPA SaaS - Azure Resource Setup"
echo "============================================"

# Parâmetros (personalizáveis)
RESOURCE_GROUP="${RESOURCE_GROUP:-mapa-saas-clean}"
LOCATION="${LOCATION:-brazilsouth}"
DB_SERVER="${DB_SERVER:-mapa-db-clean-$RANDOM}"
DB_NAME="${DB_NAME:-mapa_db}"
DB_ADMIN_USER="${DB_ADMIN_USER:-mapaadmin}"
DB_ADMIN_PASSWORD="${DB_ADMIN_PASSWORD:-MapaSaaS2025!Secure}"
APP_SERVICE_PLAN="${APP_SERVICE_PLAN:-mapa-plan-clean}"
APP_SERVICE="${APP_SERVICE:-mapa-app-clean-$RANDOM}"
SKU="${SKU:-B1}"  # B1 = Basic, F1 = Free (limitado)

echo ""
echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  DB Server: $DB_SERVER"
echo "  DB Name: $DB_NAME"
echo "  App Service: $APP_SERVICE"
echo "  SKU: $SKU"
echo ""

read -p "Proceed with these settings? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# 1. Create Resource Group
echo ""
echo -e "${GREEN}[1/6]${NC} Creating Resource Group..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output table

# 2. Create PostgreSQL Flexible Server
echo ""
echo -e "${GREEN}[2/6]${NC} Creating PostgreSQL Flexible Server (this may take a few minutes)..."
az postgres flexible-server create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DB_SERVER" \
    --location "$LOCATION" \
    --admin-user "$DB_ADMIN_USER" \
    --admin-password "$DB_ADMIN_PASSWORD" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --version 14 \
    --storage-size 32 \
    --public-access 0.0.0.0 \
    --output table

# 3. Create Database
echo ""
echo -e "${GREEN}[3/6]${NC} Creating Database..."
az postgres flexible-server db create \
    --resource-group "$RESOURCE_GROUP" \
    --server-name "$DB_SERVER" \
    --database-name "$DB_NAME" \
    --output table

# 4. Configure Firewall (permitir Azure services)
echo ""
echo -e "${GREEN}[4/6]${NC} Configuring Firewall..."
az postgres flexible-server firewall-rule create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DB_SERVER" \
    --rule-name AllowAzureServices \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0 \
    --output table

# 5. Create App Service Plan
echo ""
echo -e "${GREEN}[5/6]${NC} Creating App Service Plan..."
az appservice plan create \
    --name "$APP_SERVICE_PLAN" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku "$SKU" \
    --is-linux \
    --output table

# 6. Create Web App
echo ""
echo -e "${GREEN}[6/6]${NC} Creating Web App..."
az webapp create \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$APP_SERVICE_PLAN" \
    --name "$APP_SERVICE" \
    --runtime "PYTHON:3.11" \
    --output table

# 7. Configure App Settings
echo ""
echo -e "${GREEN}[7/7]${NC} Configuring App Settings..."

# Gerar SECRET_KEY
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')

# Construir DATABASE_URL
DATABASE_URL="postgresql://${DB_ADMIN_USER}:${DB_ADMIN_PASSWORD}@${DB_SERVER}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require"

az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_SERVICE" \
    --settings \
        DATABASE_URL="$DATABASE_URL" \
        SECRET_KEY="$SECRET_KEY" \
        ALGORITHM="HS256" \
        ACCESS_TOKEN_EXPIRE_MINUTES="30" \
        DEBUG="False" \
        ALLOWED_ORIGINS="https://${APP_SERVICE}.azurewebsites.net" \
        WEBSITES_PORT="8000" \
        SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
    --output table

# 8. Configure Startup Command
echo ""
echo "Setting startup command..."
az webapp config set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_SERVICE" \
    --startup-file "startup.sh" \
    --output table

# Resumo
echo ""
echo "============================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "============================================"
echo ""
echo "Resource Group: $RESOURCE_GROUP"
echo "Database Server: $DB_SERVER.postgres.database.azure.com"
echo "Database Name: $DB_NAME"
echo "App Service: $APP_SERVICE"
echo "App URL: https://${APP_SERVICE}.azurewebsites.net"
echo ""
echo "DATABASE_URL: $DATABASE_URL"
echo "SECRET_KEY: $SECRET_KEY"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Save these credentials securely!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run: ./scripts/azure-deploy.sh"
echo "  2. Create first admin user"
echo "  3. Access: https://${APP_SERVICE}.azurewebsites.net"
echo ""
