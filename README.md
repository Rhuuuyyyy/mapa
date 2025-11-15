# 🚀 Relatório de Implantação e Manual de Manutenção - MAPA SaaS

**Sistema de Automação de Relatórios Trimestrais do MAPA**

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Azure](https://img.shields.io/badge/Azure-App%20Service-blue.svg)](https://azure.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue.svg)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)

**Versão:** 1.0.0  
**Última Atualização:** 12 de Janeiro de 2025  
**Responsável:** Rhyan Rocha (rhyan.hdr@gmail.com)

---

## 📋 Índice

- [I. Informações Críticas da Infraestrutura](#i-informações-críticas-da-infraestrutura)
- [II. Gerenciamento e Monitoramento de Custos](#ii-gerenciamento-e-monitoramento-de-custos)
- [III. Manutenção e Atualização da Aplicação](#iii-manutenção-e-atualização-da-aplicação)
- [IV. Gerenciamento do Banco de Dados](#iv-gerenciamento-do-banco-de-dados)
- [V. Logs e Diagnóstico de Falhas](#v-logs-e-diagnóstico-de-falhas)
- [VI. Configuração em Novos Computadores](#vi-configuração-em-novos-computadores)
- [VII. Backup e Recuperação](#vii-backup-e-recuperação)
- [VIII. Segurança e Boas Práticas](#viii-segurança-e-boas-práticas)
- [IX. Monitoramento e Performance](#ix-monitoramento-e-performance)
- [X. Procedimentos de Emergência](#x-procedimentos-de-emergência)

---

## I. Informações Críticas da Infraestrutura

### 🔐 Credenciais e Endpoints

**⚠️ ATENÇÃO: As informações abaixo são CONFIDENCIAIS. Trate com segurança máxima!**

#### **Recursos Azure - Geral**

| Categoria | Recurso | Valor |
|-----------|---------|-------|
| **Grupo de Recursos** | Nome | `mapa-saas-rg` |
| | Localização | `brazilsouth` (Sul do Brasil) |
| | Subscription ID | Execute: `az account show --query id -o tsv` |

#### **Web App (App Service)**

| Item | Valor |
|------|-------|
| **Nome do Web App** | `mapa-saas-app-1762971490` |
| **URL de Produção** | https://mapa-saas-app-1762971490.azurewebsites.net |
| **URL Kudu** | https://mapa-saas-app-1762971490.scm.azurewebsites.net |
| **Runtime** | `PYTHON:3.11` |
| **App Service Plan** | `mapa-saas-plan` |
| **SKU** | `B1` (Basic) - ~$13 USD/mês |

#### **Banco de Dados PostgreSQL**

| Item | Valor |
|------|-------|
| **Servidor** | `mapa-saas-db-1762971848` |
| **Host Completo** | `mapa-saas-db-1762971848.postgres.database.azure.com` |
| **Banco de Dados** | `mapa_saas` |
| **Usuário Admin** | `mapaadmin` |
| **Senha Admin** | `NovaSenha12345!` ⚠️ |
| **Porta** | `5432` |
| **SSL Mode** | `require` (Obrigatório) |
| **Versão** | PostgreSQL 14 |
| **SKU** | `Standard_B1ms` - ~$12 USD/mês |

#### **String de Conexão Completa**
```bash
DATABASE_URL="postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require"
```

#### **Variáveis de Ambiente (App Settings)**

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DATABASE_URL` | Ver acima | String de conexão PostgreSQL |
| `SECRET_KEY` | Gerado automaticamente | Chave JWT (32+ caracteres) |
| `ALGORITHM` | `HS256` | Algoritmo de criptografia JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Tempo de expiração do token |
| `DEBUG` | `False` | ⚠️ Sempre False em produção |
| `ALLOWED_ORIGINS` | `https://mapa-saas-app-1762971490.azurewebsites.net` | CORS |
| `WEBSITES_PORT` | `8000` | Porta interna do container |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` | Build automático no deploy |

#### **Usuário Admin da Aplicação**

| Item | Valor |
|------|-------|
| **E-mail** | `rhyan.hdr@gmail.com` |
| **Senha** | Definida via `create_admin.py` |
| **Tipo** | Administrador (is_admin=true) |

### 🔗 Links Rápidos de Acesso

| Serviço | URL | Uso |
|---------|-----|-----|
| **Portal Azure** | https://portal.azure.com | Gerenciamento visual |
| **Aplicação (Produção)** | https://mapa-saas-app-1762971490.azurewebsites.net | Sistema público |
| **API Docs (Swagger)** | https://mapa-saas-app-1762971490.azurewebsites.net/docs | API interativa |
| **API Docs (ReDoc)** | https://mapa-saas-app-1762971490.azurewebsites.net/redoc | Documentação alternativa |
| **Health Check** | https://mapa-saas-app-1762971490.azurewebsites.net/health | Verificar status |
| **Kudu Console** | https://mapa-saas-app-1762971490.scm.azurewebsites.net | Console web avançado |
| **WebSSH** | https://mapa-saas-app-1762971490.scm.azurewebsites.net/webssh/host | Terminal web |
| **Log Stream** | https://mapa-saas-app-1762971490.scm.azurewebsites.net/api/logstream | Logs em tempo real |

### 📚 Documentação Oficial

- [Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Azure PostgreSQL Flexible](https://docs.microsoft.com/azure/postgresql/flexible-server/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

---

## II. Gerenciamento e Monitoramento de Custos

### 💰 Estimativa de Custos Mensais

| Recurso | SKU | Custo (USD/mês) | Custo (BRL/mês) |
|---------|-----|-----------------|-----------------|
| **App Service Plan** | B1 (Basic) | ~$13.00 | ~R$ 65,00 |
| **PostgreSQL Flexible** | B1ms (Burstable) | ~$12.00 | ~R$ 60,00 |
| **Storage** | Pay-as-you-go | ~$0.50 | ~R$ 2,50 |
| **Bandwidth** | Primeiro 100GB grátis | ~$0.00 | ~R$ 0,00 |
| **TOTAL ESTIMADO** | | **~$25.50** | **~R$ 127,50** |

*Conversão aproximada: $1 USD = R$ 5,00*

### 📊 1. Visualizar Custos no Portal Azure

#### **Passo a passo:**

1. Acesse: https://portal.azure.com
2. No menu lateral, busque **"Cost Management + Billing"**
3. Selecione **"Cost Analysis"** (Análise de Custo)
4. Aplique filtro:
   - **Resource Group**: `mapa-saas-rg`
   - **Time Range**: Last 30 days
5. Visualize:
   - Gráfico de custos por serviço
   - Tendências de gastos
   - Previsão mensal

#### **Via Azure CLI:**
```bash
# Ver custos do mês atual
az consumption usage list \
  --start-date $(date -d "1 month ago" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --output table

# Ver recursos do grupo
az resource list \
  --resource-group mapa-saas-rg \
  --query "[].{Name:name, Type:type, Location:location}" \
  --output table
```

### 🚨 2. Configurar Alertas de Orçamento

**Criar alerta para $30/mês:**
```bash
# Via Portal Azure:
# 1. Cost Management > Budgets > Add
# 2. Nome: "mapa-saas-monthly-budget"
# 3. Valor: $30
# 4. Período: Monthly
# 5. Alertas: 80%, 100%
# 6. E-mail: rhyan.hdr@gmail.com

# Via CLI (requer extensão cost-management):
az extension add --name costmanagement

az consumption budget create \
  --budget-name "mapa-saas-budget" \
  --amount 30 \
  --time-grain Monthly \
  --start-date 2025-01-01 \
  --end-date 2025-12-31 \
  --resource-group mapa-saas-rg
```

### 🔧 3. Controle de Custos - Tabela de Ações

| Ação | Comando | Impacto no Custo | Quando Usar |
|------|---------|------------------|-------------|
| **Parar Web App** | `az webapp stop --resource-group mapa-saas-rg --name mapa-saas-app-1762971490` | ⚠️ **Custo continua** | Manutenção rápida |
| **Iniciar Web App** | `az webapp start --resource-group mapa-saas-rg --name mapa-saas-app-1762971490` | Sem impacto | Reativar após stop |
| **Reiniciar Web App** | `az webapp restart --resource-group mapa-saas-rg --name mapa-saas-app-1762971490` | Sem impacto | Após mudanças |
| **Parar PostgreSQL** | `az postgres flexible-server stop --resource-group mapa-saas-rg --name mapa-saas-db-1762971848` | ✅ **Economiza ~$12/mês** | Desenvolvimento |
| **Iniciar PostgreSQL** | `az postgres flexible-server start --resource-group mapa-saas-rg --name mapa-saas-db-1762971848` | Retoma cobrança | Voltar ao uso |
| **Scale Down (F1 Free)** | `az appservice plan update --resource-group mapa-saas-rg --name mapa-saas-plan --sku F1` | ✅ **Economiza ~$13/mês** | ⚠️ Limitações severas |
| **Scale Up (S1 Standard)** | `az appservice plan update --resource-group mapa-saas-rg --name mapa-saas-plan --sku S1` | ❌ **~$70/mês** | Alta demanda |
| **Deletar TUDO** | `az group delete --name mapa-saas-rg --yes --no-wait` | ✅ **Custo ZERO** | ⚠️ **IRREVERSÍVEL** |

### 💡 4. Estratégias de Economia

#### **Estratégia 1: Uso Intermitente (Desenvolvimento)**
```bash
# Parar PostgreSQL quando não estiver usando
az postgres flexible-server stop \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848

# Economia: ~$12/mês
# Limitação: App ficará offline

# Iniciar quando necessário
az postgres flexible-server start \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848
```

#### **Estratégia 2: Migrar para Free Tier (Testes)**
```bash
# ATENÇÃO: Limitações do F1 Free:
# - 60 minutos CPU/dia
# - 1GB storage
# - App "dorme" após inatividade
# - Sem SSL customizado

az appservice plan update \
  --resource-group mapa-saas-rg \
  --name mapa-saas-plan \
  --sku F1

# Economia: ~$13/mês
```

#### **Estratégia 3: Agendar Ligado/Desligado (Azure Automation)**

**Agendar via Portal:**
1. Criar Azure Automation Account
2. Criar Runbook PowerShell:
```powershell
# Start: Segunda-Sexta 8h
Start-AzWebApp -ResourceGroupName "mapa-saas-rg" -Name "mapa-saas-app-1762971490"

# Stop: Segunda-Sexta 18h
Stop-AzWebApp -ResourceGroupName "mapa-saas-rg" -Name "mapa-saas-app-1762971490"
```
3. Agendar via Schedules

**Economia estimada:** ~40-50% (~$10-12/mês)

### 📈 5. Monitorar Custos Continuamente
```bash
# Script para verificar custos diariamente
cat > check_costs.sh << 'EOF'
#!/bin/bash
echo "💰 Custos MAPA SaaS - $(date)"
echo "================================"

# Ver estado dos recursos
echo "📊 Estado dos Recursos:"
az webapp show --resource-group mapa-saas-rg --name mapa-saas-app-1762971490 --query state -o tsv
az postgres flexible-server show --resource-group mapa-saas-rg --name mapa-saas-db-1762971848 --query state -o tsv

# Ver plano atual
echo "📋 App Service Plan:"
az appservice plan show --resource-group mapa-saas-rg --name mapa-saas-plan --query sku -o table

echo "✅ Verificação concluída"
EOF

chmod +x check_costs.sh
```

---

## III. Manutenção e Atualização da Aplicação

### 🔄 A. Deploy de Novo Código

#### **Método 1: Deploy via ZIP (Recomendado)**

**Passo a passo completo:**
```bash
# 1. Navegar até o diretório do projeto
cd ~/Documentos/mapa-saas

# 2. Garantir que está na versão mais recente
git status
git pull origin main  # Se usar Git

# 3. Ativar ambiente virtual (se testar localmente)
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 4. Testar localmente (opcional mas recomendado)
python -m pytest  # Se tiver testes
uvicorn app.main:app --reload  # Testar manualmente

# 5. Criar ZIP otimizado
zip -r mapa-saas-$(date +%Y%m%d-%H%M%S).zip . \
  -x "venv/*" \
  -x ".git/*" \
  -x ".github/*" \
  -x "__pycache__/*" \
  -x "*.pyc" \
  -x "*.pyo" \
  -x ".env" \
  -x ".env.*" \
  -x "uploads/*" \
  -x "reports/*" \
  -x "logs/*" \
  -x ".vscode/*" \
  -x ".idea/*" \
  -x "*.db" \
  -x "*.sqlite*" \
  -x "node_modules/*" \
  -x ".DS_Store" \
  -x "*.log"

# 6. Fazer deploy
echo "🚀 Iniciando deploy..."
az webapp deployment source config-zip \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --src mapa-saas-$(date +%Y%m%d)*.zip

# 7. Monitorar deploy em tempo real
echo "📊 Monitorando logs..."
az webapp log tail \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490

# 8. Aguardar alguns segundos e reiniciar (se necessário)
sleep 30
az webapp restart \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490

# 9. Verificar se está funcionando
echo "🔍 Testando aplicação..."
curl -f https://mapa-saas-app-1762971490.azurewebsites.net/health && echo "✅ App OK" || echo "❌ App com problemas"

# 10. Testar login
curl -X POST https://mapa-saas-app-1762971490.azurewebsites.net/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rhyan.hdr@gmail.com","password":"SUA_SENHA"}' \
  && echo "✅ Login OK" || echo "❌ Login falhou"
```

#### **Método 2: Deploy via Git**
```bash
# Configurar remote do Azure (apenas primeira vez)
git remote add azure https://mapa-saas-app-1762971490.scm.azurewebsites.net/mapa-saas-app-1762971490.git

# Obter credenciais de deployment
az webapp deployment list-publishing-credentials \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query "{Username:publishingUserName, Password:publishingPassword}"

# Deploy
git add .
git commit -m "feat: descrição das mudanças"
git push azure main  # ou master

# Monitorar
az webapp log tail --resource-group mapa-saas-rg --name mapa-saas-app-1762971490
```

#### **Método 3: Deploy via VS Code (Azure Extension)**

1. Instalar extensão: **Azure App Service**
2. Login no Azure via extensão
3. Clicar com botão direito no Web App
4. Selecionar **"Deploy to Web App..."**
5. Selecionar pasta do projeto
6. Confirmar deploy

### ⚙️ B. Gerenciar Variáveis de Ambiente

#### **Ver Todas as Variáveis**
```bash
# Listar todas
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --output table

# Ver apenas nomes
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query "[].name" -o tsv

# Ver valor de uma variável específica
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query "[?name=='DEBUG'].value" -o tsv
```

#### **Atualizar Variáveis**
```bash
# Atualizar uma única variável
az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --settings ACCESS_TOKEN_EXPIRE_MINUTES="60"

# Atualizar múltiplas variáveis
az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --settings \
    DEBUG="False" \
    ACCESS_TOKEN_EXPIRE_MINUTES="60" \
    ALLOWED_ORIGINS="https://mapa-saas-app-1762971490.azurewebsites.net,https://www.seudominio.com"

# Gerar e atualizar SECRET_KEY
NEW_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --settings SECRET_KEY="$NEW_SECRET"

# SEMPRE reiniciar após alterar variáveis
az webapp restart --resource-group mapa-saas-rg --name mapa-saas-app-1762971490
```

#### **Deletar Variáveis**
```bash
# Deletar uma variável
az webapp config appsettings delete \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --setting-names "VARIAVEL_ANTIGA"

# Deletar múltiplas
az webapp config appsettings delete \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --setting-names "VAR1" "VAR2" "VAR3"
```

### 🔄 C. Atualizar Dependências Python
```bash
# Após modificar requirements.txt

# 1. Testar localmente SEMPRE
pip install -r requirements.txt

# 2. Verificar se não há conflitos
pip check

# 3. Fazer deploy (Azure instalará automaticamente)
zip -r mapa-saas.zip . -x "venv/*" ".git/*" "__pycache__/*" "*.pyc" ".env" "uploads/*" "reports/*"

az webapp deployment source config-zip \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --src mapa-saas.zip

# 4. Monitorar instalação nos logs
az webapp log tail --resource-group mapa-saas-rg --name mapa-saas-app-1762971490 | grep -i "install\|requirement"
```

### 🎯 D. Atualizar Startup Command
```bash
# Ver comando atual
az webapp config show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query appCommandLine -o tsv

# Atualizar comando
az webapp config set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --startup-file "gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind=0.0.0.0:8000 --timeout 600 --access-logfile - --error-logfile -"

# Reiniciar
az webapp restart --resource-group mapa-saas-rg --name mapa-saas-app-1762971490
```

### 📝 E. Rollback para Versão Anterior
```bash
# Ver histórico de deployments
az webapp deployment list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --output table

# Fazer rollback para deployment anterior
PREVIOUS_ID=$(az webapp deployment list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query "[1].id" -o tsv)

az webapp deployment source show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --deployment-id $PREVIOUS_ID
```

---

## IV. Gerenciamento do Banco de Dados

### 🔌 A. Conexão Remota com Clientes SQL

#### **1. Liberar Acesso via Firewall**
```bash
# Obter seu IP público
MEU_IP=$(curl -s ifconfig.me)
echo "Seu IP público: $MEU_IP"

# Adicionar regra de firewall
az postgres flexible-server firewall-rule create \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --rule-name "MeuPC-$(date +%Y%m%d)" \
  --start-ip-address $MEU_IP \
  --end-ip-address $MEU_IP

# Listar regras existentes
az postgres flexible-server firewall-rule list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --output table

# Deletar regra antiga
az postgres flexible-server firewall-rule delete \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --rule-name "MeuPC-20250101" \
  --yes
```

#### **2. Conectar com pgAdmin 4**

**Download:** https://www.pgadmin.org/download/

**Configuração:**
1. Abra pgAdmin 4
2. Clique com botão direito em **Servers** → **Register** → **Server**
3. Aba **General:**
   - Name: `MAPA SaaS - Azure`
4. Aba **Connection:**
   - Host name: `mapa-saas-db-1762971848.postgres.database.azure.com`
   - Port: `5432`
   - Maintenance database: `mapa_saas`
   - Username: `mapaadmin`
   - Password: `NovaSenha12345!`
   - Save password: ✅
5. Aba **SSL:**
   - SSL mode: `Require`
6. **Save** e conectar

#### **3. Conectar com DBeaver**

**Download:** https://dbeaver.io/download/

**Configuração:**
1. **Database** → **New Database Connection**
2. Selecione **PostgreSQL**
3. **Main:**
   - Server Host: `mapa-saas-db-1762971848.postgres.database.azure.com`
   - Port: `5432`
   - Database: `mapa_saas`
   - Username: `mapaadmin`
   - Password: `NovaSenha12345!`
   - ✅ Save password
4. **SSL:**
   - ✅ Use SSL
   - SSL Mode: `require`
5. **Test Connection** → **Finish**

#### **4. Conectar via psql (Terminal)**
```bash
# Instalar psql (se não tiver)
# Ubuntu/Debian:
sudo apt install postgresql-client

# macOS:
brew install postgresql@14

# Windows: Baixar PostgreSQL
# https://www.postgresql.org/download/windows/

# Conectar
psql "postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require"

# OU com parâmetros separados
psql -h mapa-saas-db-1762971848.postgres.database.azure.com \
     -U mapaadmin \
     -d mapa_saas \
     -p 5432

# Comandos úteis no psql:
\l                    # Listar databases
\dt                   # Listar tabelas
\d users              # Descrever tabela users
\d+ users             # Descrição detalhada
SELECT * FROM users;  # Query
\x                    # Toggle expanded display
\q                    # Sair
```

### 🔐 B. Resetar Senha do PostgreSQL
```bash
# 1. Definir nova senha forte (evite @, #, $ ou use aspas)
NOVA_SENHA="MinhaSenhaSegura2025!"

# 2. Atualizar senha no servidor (pode demorar 2-5 minutos)
echo "🔄 Atualizando senha do PostgreSQL..."
az postgres flexible-server update \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --admin-password "$NOVA_SENHA"

# 3. Aguardar conclusão
echo "⏳ Aguardando conclusão..."
sleep 60

# 4. Atualizar DATABASE_URL no Web App (CRÍTICO!)
DB_HOST="mapa-saas-db-1762971848.postgres.database.azure.com"
DATABASE_URL_NOVA="postgresql://mapaadmin:${NOVA_SENHA}@${DB_HOST}:5432/mapa_saas?sslmode=require"

echo "🔄 Atualizando DATABASE_URL no Web App..."
az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --settings DATABASE_URL="$DATABASE_URL_NOVA"

# 5. Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
az webapp restart --resource-group mapa-saas-rg --name mapa-saas-app-1762971490

# 6. Aguardar e testar
sleep 30
echo "🔍 Testando conexão..."
curl -f https://mapa-saas-app-1762971490.azurewebsites.net/health && echo "✅ Sucesso!" || echo "❌ Falhou! Verificar logs."

echo "✅ Senha atualizada com sucesso!"
echo "📝 Nova senha: $NOVA_SENHA"
echo "⚠️  Anote em local seguro!"
```

### 📊 C. Operações no Banco de Dados

#### **Ver Estatísticas e Configurações**
```bash
# Ver detalhes do servidor
az postgres flexible-server show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848

# Ver uso de storage
az postgres flexible-server show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --query storage -o table

# Ver lista