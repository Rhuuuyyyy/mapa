#!/bin/bash
# Script simples para ver logs do Azure

RESOURCE_GROUP="mapa-saas-clean"
APP_NAME="mapa-app-clean-8270"

echo "Buscando logs do Docker container..."
echo "════════════════════════════════════════════════════════════════"

az webapp log download \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --log-file azure-logs.zip 2>/dev/null

if [ -f azure-logs.zip ]; then
    echo "✓ Logs baixados para azure-logs.zip"

    # Extrair e mostrar os logs mais recentes
    unzip -o azure-logs.zip -d azure-logs/ 2>/dev/null

    echo ""
    echo "Logs do Docker (últimas 100 linhas):"
    echo "────────────────────────────────────────────────────────────────"

    # Encontrar arquivo de log do Docker mais recente
    DOCKER_LOG=$(find azure-logs -name "*docker.log" -o -name "*default_docker.log" 2>/dev/null | head -n 1)

    if [ -n "$DOCKER_LOG" ]; then
        tail -n 100 "$DOCKER_LOG"
    else
        echo "⚠️ Log do Docker não encontrado"
        echo "Arquivos disponíveis:"
        find azure-logs -type f -name "*.log" 2>/dev/null
    fi

    echo ""
    echo "────────────────────────────────────────────────────────────────"
else
    echo "❌ Não foi possível baixar logs"
    echo ""
    echo "Tentando método alternativo (logs em tempo real)..."
    echo "════════════════════════════════════════════════════════════════"

    timeout 10 az webapp log tail \
        --resource-group "$RESOURCE_GROUP" \
        --name "$APP_NAME" 2>&1 || echo "Timeout ou sem logs disponíveis"
fi
