#!/bin/bash
# =============================================================================
# MAPA SaaS - Azure Logs Script
# Monitora logs em tempo real
# =============================================================================

APP_NAME="${APP_NAME:-mapa-app-clean}"
RESOURCE_GROUP="${RESOURCE_GROUP:-mapa-saas-clean}"

echo "============================================"
echo "📋 MAPA SaaS - Logs (Ctrl+C to exit)"
echo "============================================"
echo "App: $APP_NAME"
echo "Resource Group: $RESOURCE_GROUP"
echo ""

# Habilitar logging (se ainda não estiver)
az webapp log config \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --application-logging filesystem \
    --web-server-logging filesystem \
    --level information \
    --output none 2>/dev/null

# Stream logs
az webapp log tail \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME"
