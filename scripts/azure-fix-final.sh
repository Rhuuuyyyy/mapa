#!/bin/bash
# ============================================================================
# MAPA SaaS - Correção Definitiva Azure
# Este script resolve todos os problemas e garante que a app funcione
# ============================================================================

set -e

RESOURCE_GROUP="mapa-saas-clean"
APP_NAME="mapa-app-clean-8270"
APP_URL="https://${APP_NAME}.azurewebsites.net"

echo "════════════════════════════════════════════════════════════════"
echo "🔧 MAPA SaaS - Correção Definitiva"
echo "════════════════════════════════════════════════════════════════"
echo ""

# ============================================================================
# PASSO 1: Verificar ambiente variables
# ============================================================================
echo "📋 [1/6] Verificando variáveis de ambiente..."
echo ""

set +H  # Desabilita history expansion

# Verificar se ALLOWED_ORIGINS está setado
CURRENT_ORIGINS=$(az webapp config appsettings list \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --query "[?name=='ALLOWED_ORIGINS'].value" \
    --output tsv)

if [ -z "$CURRENT_ORIGINS" ] || [ "$CURRENT_ORIGINS" == "null" ]; then
    echo "⚠️  ALLOWED_ORIGINS não configurado. Configurando agora..."
    az webapp config appsettings set \
        --resource-group "$RESOURCE_GROUP" \
        --name "$APP_NAME" \
        --settings ALLOWED_ORIGINS="*" \
        --output none
    echo "✅ ALLOWED_ORIGINS configurado como '*'"
else
    echo "✅ ALLOWED_ORIGINS já configurado: $CURRENT_ORIGINS"
fi

set -H  # Re-abilita history expansion

echo ""

# ============================================================================
# PASSO 2: Verificar todas as variáveis necessárias
# ============================================================================
echo "📋 [2/6] Verificando todas as variáveis necessárias..."
echo ""

REQUIRED_VARS=("DATABASE_URL" "SECRET_KEY" "ALLOWED_ORIGINS")
MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
    VALUE=$(az webapp config appsettings list \
        --resource-group "$RESOURCE_GROUP" \
        --name "$APP_NAME" \
        --query "[?name=='$VAR'].value" \
        --output tsv)

    if [ -z "$VALUE" ] || [ "$VALUE" == "null" ]; then
        echo "❌ $VAR: NÃO CONFIGURADO"
        MISSING_VARS+=("$VAR")
    else
        # Mostrar apenas primeiros 20 caracteres por segurança
        PREVIEW="${VALUE:0:20}..."
        echo "✅ $VAR: $PREVIEW"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo "❌ ERRO: Variáveis faltando: ${MISSING_VARS[*]}"
    echo "Configure-as manualmente antes de continuar."
    exit 1
fi

echo ""

# ============================================================================
# PASSO 3: Fazer deploy do código atualizado
# ============================================================================
echo "📦 [3/6] Fazendo deploy do código atualizado..."
echo ""

# Criar ZIP limpo
# Obter diretório raiz do projeto (pai de scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

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

echo "✅ Pacote criado: $(du -h deploy.zip | cut -f1)"

# Deploy (pode dar timeout, mas completa no background)
echo "⏳ Enviando para Azure (pode demorar 2-3 minutos)..."

set +e  # Não parar se der timeout
az webapp deploy \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --src-path deploy.zip \
    --type zip \
    --async false \
    --timeout 300000
DEPLOY_EXIT=$?
set -e

rm -f deploy.zip

if [ $DEPLOY_EXIT -eq 0 ]; then
    echo "✅ Deploy completado"
else
    echo "⚠️  Deploy retornou código $DEPLOY_EXIT (pode ser timeout - continuando)"
fi

echo ""

# ============================================================================
# PASSO 4: Aguardar deploy completar e reiniciar
# ============================================================================
echo "⏳ [4/6] Aguardando 30 segundos para deploy processar..."
sleep 30

echo "🔄 Reiniciando aplicação..."
az webapp restart \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --output none

echo "✅ Aplicação reiniciada"
echo ""

# ============================================================================
# PASSO 5: Aguardar startup e verificar logs
# ============================================================================
echo "⏳ [5/6] Aguardando startup (30 segundos)..."
sleep 30

echo ""
echo "📄 Verificando logs recentes..."
echo "─────────────────────────────────────────────────────────────────"

az webapp log tail \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --output tsv 2>/dev/null | head -n 50 || echo "⚠️  Logs não disponíveis ainda"

echo "─────────────────────────────────────────────────────────────────"
echo ""

# ============================================================================
# PASSO 6: Testar health endpoint
# ============================================================================
echo "🏥 [6/6] Testando health endpoint..."
echo ""

for i in {1..5}; do
    echo "Tentativa $i/5: GET $APP_URL/health"

    HTTP_CODE=$(curl -s -o /tmp/health_response.txt -w "%{http_code}" "$APP_URL/health" || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ HTTP 200 - Aplicação funcionando!"
        echo ""
        echo "Resposta:"
        cat /tmp/health_response.txt
        echo ""
        rm -f /tmp/health_response.txt
        break
    else
        echo "⚠️  HTTP $HTTP_CODE"
        if [ "$HTTP_CODE" != "000" ]; then
            cat /tmp/health_response.txt 2>/dev/null || true
            echo ""
        fi

        if [ $i -lt 5 ]; then
            echo "Aguardando 10 segundos antes de tentar novamente..."
            sleep 10
        fi
    fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"

if [ "$HTTP_CODE" = "200" ]; then
    echo "🎉 SUCESSO! Aplicação está funcionando corretamente"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "URLs disponíveis:"
    echo "  🏠 App:        $APP_URL"
    echo "  🏥 Health:     $APP_URL/health"
    echo "  📚 API Docs:   $APP_URL/api/docs"
    echo "  🔐 Login:      $APP_URL/login.html"
    echo ""
    echo "Próximos passos:"
    echo "  1. Criar primeiro usuário admin:"
    echo "     curl -X POST $APP_URL/api/admin/users \\"
    echo "       -H 'Content-Type: application/json' \\"
    echo "       -d '{\"username\":\"admin\",\"email\":\"admin@mapa.com\",\"password\":\"SuaSenhaForte123!\",\"is_admin\":true}'"
    echo ""
    echo "  2. Fazer login e começar a usar o sistema"
    echo ""
else
    echo "❌ ERRO: Aplicação não está respondendo corretamente"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Diagnóstico detalhado:"
    echo ""
    echo "1. Verifique os logs completos:"
    echo "   az webapp log tail -g $RESOURCE_GROUP -n $APP_NAME"
    echo ""
    echo "2. Verifique configurações:"
    echo "   az webapp config appsettings list -g $RESOURCE_GROUP -n $APP_NAME"
    echo ""
    echo "3. Verifique status do container:"
    echo "   az webapp log show -g $RESOURCE_GROUP -n $APP_NAME"
    echo ""
    echo "4. Tente acessar diretamente: $APP_URL"
    echo ""
fi

echo "════════════════════════════════════════════════════════════════"
