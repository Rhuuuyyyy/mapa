# Guia de Deploy - MAPA SaaS no Azure

Este guia contém instruções completas para fazer deploy do MAPA SaaS no Azure App Service.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Setup Inicial (Uma Vez)](#setup-inicial-uma-vez)
3. [Deploy da Aplicação](#deploy-da-aplicação)
4. [Pós-Deploy](#pós-deploy)
5. [Atualizações](#atualizações)
6. [Monitoramento](#monitoramento)
7. [Troubleshooting](#troubleshooting)
8. [Custos Estimados](#custos-estimados)

---

## Pré-requisitos

### 1. Conta Azure
- Conta Azure ativa
- Créditos disponíveis ou cartão de crédito vinculado

### 2. Azure CLI
Instale Azure CLI no seu sistema:

**Linux/Mac:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**Windows:**
Baixe e instale: https://aka.ms/installazurecliwindows

### 3. Autenticação
```bash
az login
```

### 4. Verificar Instalação
```bash
az --version
```

---

## Setup Inicial (Uma Vez)

### Passo 1: Configurar Parâmetros

Edite o arquivo `scripts/azure-setup.sh` e ajuste os parâmetros:

```bash
RESOURCE_GROUP="mapa-saas-clean"        # Nome do grupo de recursos
LOCATION="brazilsouth"                  # Região Azure
DB_SERVER="mapa-db-clean-$RANDOM"       # Nome do servidor PostgreSQL
DB_NAME="mapa_db"                       # Nome do banco de dados
DB_ADMIN_USER="mapaadmin"              # Usuário admin do DB
DB_ADMIN_PASSWORD="MapaSaaS2025!Secure" # Senha do DB (MUDE!)
APP_SERVICE_PLAN="mapa-plan-clean"      # Nome do plano
APP_SERVICE="mapa-app-clean-$RANDOM"    # Nome do app service
SKU="B1"                                # Tamanho (B1, F1, S1, etc.)
```

**Importante:** Mude `DB_ADMIN_PASSWORD` para uma senha forte!

### Passo 2: Executar Setup

```bash
cd /path/to/mapa-saas
./scripts/azure-setup.sh
```

O script irá:

1. ✅ Criar Resource Group
2. ✅ Criar PostgreSQL Flexible Server (2-3 minutos)
3. ✅ Criar Database
4. ✅ Configurar Firewall
5. ✅ Criar App Service Plan
6. ✅ Criar Web App
7. ✅ Configurar variáveis de ambiente
8. ✅ Configurar startup command

**Saída Esperada:**

```
============================================
✅ Setup Complete!
============================================

Resource Group: mapa-saas-clean
Database Server: mapa-db-clean-12345.postgres.database.azure.com
Database Name: mapa_db
App Service: mapa-app-clean-67890
App URL: https://mapa-app-clean-67890.azurewebsites.net

DATABASE_URL: postgresql://...
SECRET_KEY: ...

⚠️  IMPORTANT: Save these credentials securely!
```

**CRÍTICO:** Salve `DATABASE_URL` e `SECRET_KEY` em local seguro!

---

## Deploy da Aplicação

### Passo 1: Configurar Variáveis de Ambiente

Se necessário, atualize variáveis de ambiente no Azure:

```bash
az webapp config appsettings set \
    --resource-group mapa-saas-clean \
    --name mapa-app-clean-67890 \
    --settings \
        DEBUG="False" \
        ALLOWED_ORIGINS="https://mapa-app-clean-67890.azurewebsites.net"
```

### Passo 2: Executar Deploy

```bash
./scripts/azure-deploy.sh
```

O script irá:

1. ✅ Criar package ZIP limpo (exclui venv, __pycache__, etc.)
2. ✅ Fazer upload para Azure
3. ✅ Mostrar URL do app

**Saída Esperada:**

```
============================================
✅ Deploy Complete!
============================================

App URL: https://mapa-app-clean-67890.azurewebsites.net
Health Check: https://mapa-app-clean-67890.azurewebsites.net/health
API Docs: https://mapa-app-clean-67890.azurewebsites.net/api/docs

Note: First startup may take 2-3 minutes while dependencies are installed.
```

### Passo 3: Aguardar Primeira Inicialização

A primeira inicialização leva **2-3 minutos** porque o Azure:

1. Extrai o ZIP
2. Cria virtual environment
3. Instala dependências (requirements.txt)
4. Executa startup.sh
5. Aguarda conexão com DB (até 30s)
6. Inicia Gunicorn + Uvicorn

**Monitore os logs:**

```bash
./scripts/azure-logs.sh
```

**Logs esperados:**

```
============================================
🚀 MAPA SaaS v2.0.0 - Starting...
============================================
📦 Activating virtual environment...
✓ Virtual environment activated
🔍 Checking environment variables...
✓ Required environment variables present
🗄️  Waiting for database connection...
✓ Database connection successful
🌐 Server will listen on port: 8000
🎯 Starting application server...
============================================
[INFO] Starting gunicorn 21.2.0
[INFO] Listening at: http://0.0.0.0:8000
[INFO] Using worker: uvicorn.workers.UvicornWorker
[INFO] Booting worker with pid: 123
INFO:     Started server process [123]
INFO:     Waiting for application startup.
INFO:     🚀 Starting MAPA SaaS v2.0.0
INFO:     Initializing database...
INFO:     ✓ Database tables ready
INFO:     Application startup complete.
```

---

## Pós-Deploy

### 1. Verificar Health Check

```bash
curl https://mapa-app-clean-67890.azurewebsites.net/health
```

**Resposta esperada:**

```json
{
  "status": "healthy",
  "app": "MAPA SaaS",
  "version": "2.0.0"
}
```

### 2. Acessar API Docs

Abra no navegador:

```
https://mapa-app-clean-67890.azurewebsites.net/api/docs
```

### 3. Criar Primeiro Admin

**Opção A: Via API (Swagger)**

1. Acesse `/api/docs`
2. Abra endpoint `POST /api/admin/users`
3. Clique em "Try it out"
4. Cole o JSON:

```json
{
  "email": "admin@example.com",
  "full_name": "Administrador",
  "company_name": null,
  "password": "SenhaSegura123!@#",
  "is_admin": true
}
```

5. Execute

**Opção B: Via Azure Console**

1. Acesse Azure Portal
2. Vá para App Service
3. Console (SSH)
4. Execute:

```bash
python3
>>> from app.database import SessionLocal
>>> from app.models import User
>>> from app.auth import get_password_hash
>>> db = SessionLocal()
>>> admin = User(
...     email="admin@example.com",
...     hashed_password=get_password_hash("SenhaSegura123!@#"),
...     full_name="Administrador",
...     is_admin=True
... )
>>> db.add(admin)
>>> db.commit()
>>> exit()
```

### 4. Fazer Login

1. Acesse: `https://mapa-app-clean-67890.azurewebsites.net/login.html`
2. Entre com credenciais do admin
3. Você será redirecionado para `/admin_dashboard.html`

---

## Atualizações

### Deploy de Nova Versão

```bash
# 1. Commit suas mudanças
git add .
git commit -m "feat: nova funcionalidade"

# 2. Deploy para Azure
./scripts/azure-deploy.sh
```

### Atualizar Variáveis de Ambiente

```bash
az webapp config appsettings set \
    --resource-group mapa-saas-clean \
    --name mapa-app-clean-67890 \
    --settings \
        NOME_VARIAVEL="novo_valor"
```

### Reiniciar App

```bash
az webapp restart \
    --resource-group mapa-saas-clean \
    --name mapa-app-clean-67890
```

---

## Monitoramento

### Ver Logs em Tempo Real

```bash
./scripts/azure-logs.sh
```

Ou diretamente:

```bash
az webapp log tail \
    --resource-group mapa-saas-clean \
    --name mapa-app-clean-67890
```

### Ver Métricas

Azure Portal → App Service → Monitoring → Metrics

**Métricas importantes:**

- CPU Percentage
- Memory Percentage
- Response Time
- Http Server Errors
- Http 4xx / 5xx

### Configurar Alertas

Azure Portal → App Service → Alerts

**Alertas recomendados:**

- CPU > 80% por 5 minutos
- Memory > 80% por 5 minutos
- HTTP 5xx > 10 em 5 minutos
- Response Time > 5s

---

## Troubleshooting

### ❌ App não inicia (502 Bad Gateway)

**Possíveis causas:**

1. **Startup script falhando**
   - Ver logs: `./scripts/azure-logs.sh`
   - Verificar se `startup.sh` tem permissão de execução
   - Verificar se variáveis de ambiente estão setadas

2. **Database não conecta**
   - Verificar DATABASE_URL
   - Verificar firewall do PostgreSQL
   - Testar conexão manual

3. **Dependências falhando**
   - Verificar `requirements.txt`
   - Ver logs de build do Oryx

**Solução:**

```bash
# Ver logs detalhados
az webapp log tail --resource-group mapa-saas-clean --name mapa-app-clean-67890

# Verificar variáveis
az webapp config appsettings list --resource-group mapa-saas-clean --name mapa-app-clean-67890

# Reiniciar
az webapp restart --resource-group mapa-saas-clean --name mapa-app-clean-67890
```

### ❌ Timeout após 230 segundos

**Causa:** Startup levando muito tempo (instalação de deps)

**Solução:**

1. Habilitar Oryx build (já está em `.deployment`):
```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT = true
```

2. Reduzir tamanho de `requirements.txt` (remover deps desnecessárias)

3. Usar Deployment Slots para deploys sem downtime

### ❌ Erro 500 ao fazer upload

**Causa:** Pasta `uploads/` não existe

**Solução:**

```bash
# Via Azure Console (SSH)
mkdir -p /home/site/wwwroot/uploads
chmod 777 /home/site/wwwroot/uploads
```

### ❌ Database connection timeout

**Causa:** Firewall bloqueando conexão

**Solução:**

```bash
# Permitir todos os IPs do Azure
az postgres flexible-server firewall-rule create \
    --resource-group mapa-saas-clean \
    --name mapa-db-clean-12345 \
    --rule-name AllowAllAzure \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0
```

### ❌ CORS error no frontend

**Causa:** `ALLOWED_ORIGINS` não configurado

**Solução:**

```bash
az webapp config appsettings set \
    --resource-group mapa-saas-clean \
    --name mapa-app-clean-67890 \
    --settings \
        ALLOWED_ORIGINS="https://mapa-app-clean-67890.azurewebsites.net"
```

---

## Custos Estimados

### Configuração Atual (B1 + Standard_B1ms)

| Recurso | SKU | Custo/Mês (USD) |
|---------|-----|-----------------|
| App Service Plan | B1 (1 core, 1.75GB RAM) | ~$13 |
| PostgreSQL | Standard_B1ms (1 vCore, 2GB RAM, 32GB) | ~$12 |
| **Total** | | **~$25/mês** |

### Opções de Economia

**Desenvolvimento/Teste:**

```bash
SKU="F1"  # Free tier (limitações: 60min CPU/dia, 1GB storage)
```

Custo: **$0/mês** (App Service) + **$0/mês** (PostgreSQL Burstable com free tier)

**Produção Otimizada:**

```bash
SKU="B1"  # Mantém B1
# Usar Reserved Instance no PostgreSQL (economia de 30-40%)
```

Custo: **~$20/mês**

**Produção Escalável:**

```bash
SKU="S1"  # Standard (1 core, 1.75GB, auto-scale, custom domains)
```

Custo: **~$70/mês**

---

## Comandos Úteis

### Ver todos os recursos

```bash
az resource list \
    --resource-group mapa-saas-clean \
    --output table
```

### Ver configurações do app

```bash
az webapp config show \
    --resource-group mapa-saas-clean \
    --name mapa-app-clean-67890
```

### Conectar ao DB remotamente

```bash
psql "postgresql://mapaadmin:PASSWORD@mapa-db-clean-12345.postgres.database.azure.com:5432/mapa_db?sslmode=require"
```

### Escalar App Service

```bash
# Mudar para S1
az appservice plan update \
    --name mapa-plan-clean \
    --resource-group mapa-saas-clean \
    --sku S1
```

### Deletar tudo (cuidado!)

```bash
az group delete \
    --name mapa-saas-clean \
    --yes --no-wait
```

---

## Próximos Passos

1. ✅ Configure domínio customizado
2. ✅ Configure SSL/HTTPS (Let's Encrypt ou Azure)
3. ✅ Configure CI/CD (GitHub Actions ou Azure DevOps)
4. ✅ Configure backup automático do PostgreSQL
5. ✅ Configure Application Insights para monitoramento
6. ✅ Configure Azure Key Vault para secrets

---

**Versão**: 2.0.0
**Última Atualização**: 2025-01-15
