#!/bin/bash
# =============================================================================
# Run Database Migration via Azure Kudu API
# Adds the 'period' column to xml_uploads table
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "============================================"
echo "🔄 MAPA SaaS - Database Migration Runner"
echo "============================================"
echo ""

APP_NAME="mapa-app-clean-8270"

echo -e "${YELLOW}Este script vai executar a migração que adiciona o campo 'period' na tabela xml_uploads.${NC}"
echo ""
echo "Você tem 3 opções:"
echo ""
echo -e "${GREEN}Opção 1: Via Azure Portal (MAIS FÁCIL)${NC}"
echo "  1. Acesse: https://portal.azure.com"
echo "  2. Vá em: App Services > mapa-app-clean-8270"
echo "  3. No menu esquerdo: Development Tools > SSH > Go"
echo "  4. Execute no terminal:"
echo "     cd /home/site/wwwroot"
echo "     python migrations/add_period_to_xml_uploads.py"
echo ""
echo -e "${GREEN}Opção 2: Via Azure CLI${NC}"
echo "  az webapp ssh --name $APP_NAME --resource-group mapa-saas-clean"
echo "  cd /home/site/wwwroot"
echo "  python migrations/add_period_to_xml_uploads.py"
echo ""
echo -e "${GREEN}Opção 3: Via Kudu API (este script)${NC}"
echo ""

read -p "Deseja executar via Kudu API? (s/N): " EXECUTE_KUDU

if [[ ! "$EXECUTE_KUDU" =~ ^[SsYy]$ ]]; then
    echo ""
    echo -e "${YELLOW}👍 Por favor, execute a migração manualmente usando uma das opções acima.${NC}"
    echo ""
    echo "O comando que deve ser executado é:"
    echo -e "${GREEN}  python migrations/add_period_to_xml_uploads.py${NC}"
    echo ""
    exit 0
fi

# Solicitar credenciais para Kudu API
echo ""
echo -e "${YELLOW}Para usar a Kudu API, você precisa das credenciais de deploy.${NC}"
echo ""
echo "Para obter as credenciais:"
echo "  1. Vá em: Azure Portal > App Services > mapa-app-clean-8270"
echo "  2. No menu: Deployment > Deployment Center"
echo "  3. Clique em 'Manage publish profile' > Download"
echo "  4. Abra o arquivo .publishsettings e procure por:"
echo "     - userName (ex: \$mapa-app-clean-8270)"
echo "     - userPWD"
echo ""

read -p "Digite o USERNAME: " USERNAME
read -sp "Digite o PASSWORD: " PASSWORD
echo ""
echo ""

if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
    echo -e "${RED}❌ Credenciais não fornecidas!${NC}"
    exit 1
fi

# Executar migração via Kudu command endpoint
echo -e "${GREEN}[1/2]${NC} Conectando ao Kudu API..."

KUDU_URL="https://$APP_NAME.scm.azurewebsites.net/api/command"

# Comando para executar
COMMAND="cd /home/site/wwwroot && python migrations/add_period_to_xml_uploads.py"

echo -e "${GREEN}[2/2]${NC} Executando migração..."
echo "Comando: $COMMAND"
echo ""

# Executar via Kudu API
HTTP_RESPONSE=$(curl -X POST \
    -u "$USERNAME:$PASSWORD" \
    -H "Content-Type: application/json" \
    -d "{\"command\": \"$COMMAND\", \"dir\": \"/home/site/wwwroot\"}" \
    -w "\n%{http_code}" \
    -s \
    "$KUDU_URL")

# Separar resposta e código HTTP
HTTP_CODE=$(echo "$HTTP_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HTTP_RESPONSE" | head -n-1)

echo "Response:"
echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Migração executada com sucesso!${NC}"
    echo ""
    echo "Verificando se funcionou..."
    echo ""

    # Testar se a aplicação está funcionando
    HEALTH_URL="https://$APP_NAME.azurewebsites.net/health"
    curl -s "$HEALTH_URL" | python3 -m json.tool 2>/dev/null
    echo ""
    echo ""
    echo -e "${GREEN}✅ Tudo pronto! Agora o sistema deve estar funcionando sem erros 500.${NC}"
else
    echo -e "${RED}❌ Erro ao executar migração (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo -e "${YELLOW}Por favor, tente usar a Opção 1 (Azure Portal SSH)${NC}"
    exit 1
fi

echo ""
echo "============================================"
echo -e "${GREEN}✅ Migration Complete!${NC}"
echo "============================================"
echo ""
echo "Próximos passos:"
echo "  1. Acesse: https://$APP_NAME.azurewebsites.net"
echo "  2. Teste o upload de XML"
echo "  3. Gere um relatório"
echo ""
