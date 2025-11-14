# 🚀 Manual Completo de Implantação e Manutenção - MAPA SaaS

**Sistema de Automação de Relatórios Trimestrais do MAPA**

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Azure](https://img.shields.io/badge/Azure-App%20Service-0078D4.svg)](https://azure.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791.svg)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Informações do Documento

| Item | Detalhe |
|------|---------|
| **Versão** | 1.0.0 |
| **Data de Criação** | 12 de Janeiro de 2025 |
| **Última Atualização** | 13 de Janeiro de 2025 |
| **Responsável Técnico** | Rhyan Rocha |
| **E-mail de Contato** | rhyan.hdr@gmail.com |
| **Status do Projeto** | Em Produção |

---

## 🎯 Sobre o Sistema

O **MAPA SaaS** é uma aplicação web que automatiza a geração de relatórios trimestrais exigidos pelo Ministério da Agricultura, Pecuária e Abastecimento (MAPA) a partir do processamento de arquivos XML de Notas Fiscais Eletrônicas (NF-e).

### **Funcionalidades Principais**

- ✅ Upload e validação de arquivos XML (NF-e)
- ✅ Extração automática de dados de fertilizantes
- ✅ Processamento de arquivos PDF (DANFE)
- ✅ Geração de relatórios trimestrais no formato Excel (MAPA)
- ✅ Dashboard do usuário com histórico de uploads
- ✅ Sistema de autenticação JWT
- ✅ Gestão de usuários (admin/user)
- ✅ Download de relatórios processados

### **Tecnologias Utilizadas**

| Categoria | Tecnologia | Versão | Finalidade |
|-----------|-----------|--------|------------|
| **Backend** | FastAPI | 0.104.1 | Framework web assíncrono |
| **Linguagem** | Python | 3.11 | Linguagem de programação |
| **Banco de Dados** | PostgreSQL | 14 | Armazenamento de dados |
| **ORM** | SQLAlchemy | 2.0+ | Mapeamento objeto-relacional |
| **Autenticação** | JWT | - | Tokens de autenticação |
| **Cloud** | Azure App Service | - | Hospedagem da aplicação |
| **Cloud DB** | Azure PostgreSQL Flexible | - | Banco de dados gerenciado |
| **Server** | Uvicorn | 0.24+ | Servidor ASGI |
| **Processamento XML** | lxml, xmltodict | - | Parser de XML |
| **Processamento PDF** | pdfplumber, PyPDF2 | - | Extração de dados de PDF |
| **Geração Excel** | openpyxl | 3.1+ | Geração de planilhas |
| **Validação** | Pydantic | 2.0+ | Validação de dados |

---

## 📑 Índice Completo

- [I. Configuração Essencial da Infraestrutura](#i-configuração-essencial-da-infraestrutura)
- [II. Arquitetura do Sistema](#ii-arquitetura-do-sistema)
- [III. Comandos Rápidos de Gerenciamento](#iii-comandos-rápidos-de-gerenciamento)
- [IV. Deploy e Atualização](#iv-deploy-e-atualização)
- [V. Gerenciamento do Banco de Dados](#v-gerenciamento-do-banco-de-dados)
- [VI. Monitoramento e Logs](#vi-monitoramento-e-logs)
- [VII. Configuração em Novos Ambientes](#vii-configuração-em-novos-ambientes)
- [VIII. Backup e Recuperação](#viii-backup-e-recuperação)
- [IX. Segurança e Boas Práticas](#ix-segurança-e-boas-práticas)
- [X. Troubleshooting e Diagnóstico](#x-troubleshooting-e-diagnóstico)
- [XI. Custos e Otimização](#xi-custos-e-otimização)
- [XII. Procedimentos de Emergência](#xii-procedimentos-de-emergência)
- [XIII. Apêndices](#xiii-apêndices)

---

## I. Configuração Essencial da Infraestrutura

### 🔐 1.1 Endpoints e Credenciais de Acesso

**⚠️ CONFIDENCIAL - Mantenha estas informações seguras**

| Recurso | Detalhe | Valor |
|---------|---------|-------|
| **URL da API (Produção)** | Host principal | https://mapa-saas-app-1762971490.azurewebsites.net |
| **Ferramenta de Diagnóstico** | Kudu (WebSSH) | https://mapa-saas-app-1762971490.scm.azurewebsites.net |
| **Login do Sistema** | E-mail do Admin | rhyan.hdr@gmail.com |
| **Localização** | Região do Azure | brazilsouth (Sul do Brasil) |
| **Grupo de Recursos** | Resource Group | mapa-saas-rg |

#### **Links Rápidos**

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Portal Azure** | https://portal.azure.com | Console de gerenciamento |
| **Aplicação Web** | https://mapa-saas-app-1762971490.azurewebsites.net | Aplicação em produção |
| **API Docs (Swagger)** | https://mapa-saas-app-1762971490.azurewebsites.net/docs | Documentação interativa |
| **API Docs (ReDoc)** | https://mapa-saas-app-1762971490.azurewebsites.net/redoc | Documentação alternativa |
| **Health Check** | https://mapa-saas-app-1762971490.azurewebsites.net/health | Status da aplicação |
| **Kudu Console** | https://mapa-saas-app-1762971490.scm.azurewebsites.net | Console avançado |
| **WebSSH** | https://mapa-saas-app-1762971490.scm.azurewebsites.net/webssh/host | Terminal no navegador |
| **Log Stream** | https://mapa-saas-app-1762971490.scm.azurewebsites.net/api/logstream | Logs em tempo real |

### 🗄️ 1.2 Configuração do Banco de Dados (PostgreSQL)

**Servidor PostgreSQL Flexible Server configurado com acesso público controlado por firewall.**

| Detalhe | Valor | Observação |
|---------|-------|------------|
| **Nome do Servidor** | mapa-saas-db-1762971848 | Host para conexão |
| **Host Completo** | mapa-saas-db-1762971848.postgres.database.azure.com | FQDN do servidor |
| **Nome do DB** | mapa_saas | Nome do banco de dados |
| **Usuário Admin** | mapaadmin | Usuário para operações |
| **Senha ATUAL** | NovaSenha12345! | ⚠️ Senha resetada (sem @) |
| **Porta** | 5432 | Porta padrão PostgreSQL |
| **Versão** | 14 | Versão do PostgreSQL |
| **SSL Mode** | require | SSL obrigatório |
| **SKU** | Standard_B1ms | Plano Burstable |
| **Storage** | 32 GB | Armazenamento |

#### **String de Conexão Completa**

```bash
# Variável DATABASE_URL (App Settings)
postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require
```

#### **Estrutura do Banco de Dados**

```sql
-- Tabela: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: xml_uploads
CREATE TABLE xml_uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    upload_date TIMESTAMP DEFAULT NOW(),
    processed_date TIMESTAMP,
    error_message TEXT,
    nfe_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: reports
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    report_period VARCHAR(20) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    generated_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'completed',
    xml_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_xml_uploads_user_id ON xml_uploads(user_id);
CREATE INDEX idx_xml_uploads_status ON xml_uploads(status);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_period ON reports(report_period);
```

### 🌐 1.3 Configuração do App Service (Web App)

| Detalhe | Valor | Observação |
|---------|-------|------------|
| **Nome do Web App** | mapa-saas-app-1762971490 | Nome do contêiner |
| **Runtime** | PYTHON:3.11 | Versão Python |
| **Comando de Startup** | `uvicorn app.main:app --host 0.0.0.0 --port 8000` | Processo inicial |
| **Plano de Serviço** | mapa-saas-plan | Nome do App Service Plan |
| **SKU** | B1 (Basic) | Plano pago 24/7 |
| **Sistema Operacional** | Linux | Container Linux |
| **Deployment Method** | ZIP Deploy | Método de deploy |

#### **Variáveis de Ambiente (App Settings)**

| Variável | Valor Exemplo | Descrição |
|----------|---------------|-----------|
| `DATABASE_URL` | `postgresql://mapaadmin:...` | String de conexão PostgreSQL |
| `SECRET_KEY` | `[gerado automaticamente]` | Chave para assinatura JWT (32+ chars) |
| `ALGORITHM` | `HS256` | Algoritmo de criptografia JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Tempo de expiração do token |
| `DEBUG` | `False` | ⚠️ Sempre False em produção |
| `ALLOWED_ORIGINS` | `https://mapa-saas-app-1762971490.azurewebsites.net` | CORS origins permitidos |
| `WEBSITES_PORT` | `8000` | Porta interna do container |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` | Build automático no deploy |

#### **Estrutura de Diretórios da Aplicação**

```
/home/site/wwwroot/
├── app/
│   ├── __init__.py
│   ├── main.py              # Entrada da aplicação FastAPI
│   ├── auth.py              # Lógica de autenticação JWT
│   ├── database.py          # Configuração SQLAlchemy
│   ├── models.py            # Modelos ORM (User, XMLUpload, Report)
│   ├── schemas.py           # Schemas Pydantic (validação)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── admin.py         # Rotas do admin (/api/admin/*)
│   │   └── user.py          # Rotas do usuário (/api/user/*)
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── xml_processor.py # Processamento de XML NF-e
│   │   ├── pdf_processor.py # Extração de dados do PDF
│   │   └── report_generator.py # Geração de relatórios Excel
│   └── templates/
│       ├── index.html       # Página de login
│       ├── admin_dashboard.html
│       └── user_dashboard.html
├── uploads/                 # Diretório para arquivos enviados
├── reports/                 # Relatórios gerados
├── logs/                    # Logs da aplicação
├── requirements.txt         # Dependências Python
├── create_admin.py          # Script para criar admin
└── .gitignore
```

---

## II. Arquitetura do Sistema

### 🏗️ 2.1 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIO                             │
│                    (Navegador Web)                          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Azure App Service (Linux)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Uvicorn (ASGI Server)                       │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │      FastAPI Application                      │  │   │
│  │  │  ┌──────────────┐  ┌──────────────────────┐  │  │   │
│  │  │  │   Routers    │  │    Middlewares       │  │  │   │
│  │  │  │ - Admin      │  │ - CORS               │  │  │   │
│  │  │  │ - User       │  │ - Authentication     │  │  │   │
│  │  │  └──────────────┘  └──────────────────────┘  │  │   │
│  │  │  ┌──────────────┐  ┌──────────────────────┐  │  │   │
│  │  │  │ Utils        │  │   Static/Templates   │  │  │   │
│  │  │  │ - XML Proc   │  │ - HTML Pages         │  │  │   │
│  │  │  │ - PDF Proc   │  │ - CSS/JS             │  │  │   │
│  │  │  │ - Report Gen │  │                      │  │  │   │
│  │  │  └──────────────┘  └──────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ PostgreSQL Protocol (SSL)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│       Azure PostgreSQL Flexible Server                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            PostgreSQL 14 Database                   │   │
│  │  ┌──────────┐  ┌───────────────┐  ┌────────────┐  │   │
│  │  │  users   │  │ xml_uploads   │  │  reports   │  │   │
│  │  └──────────┘  └───────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 2.2 Fluxo de Processamento de NF-e

```
1. UPLOAD
   Usuario → FastAPI → Salvar arquivo XML em /uploads
                    → Criar registro em xml_uploads (status='pending')

2. VALIDAÇÃO
   FastAPI → Validar estrutura XML
          → Verificar assinatura digital
          → Validar chave de acesso (44 dígitos)

3. PROCESSAMENTO
   XML Processor → Extrair dados da NF-e
                → Extrair produtos e quantidades
                → Identificar emitente/destinatário
   
   PDF Processor (se houver) → Extrair dados do DANFE
                             → Capturar registro MAPA
                             → Validar CNPJs

4. ARMAZENAMENTO
   FastAPI → Atualizar xml_uploads com nfe_data (JSONB)
          → Marcar status='processed'

5. GERAÇÃO DE RELATÓRIO
   Report Generator → Agrupar XMLs por trimestre
                   → Extrair garantias dos produtos
                   → Gerar Excel no formato MAPA
                   → Salvar em /reports
                   → Criar registro em reports

6. DOWNLOAD
   Usuario → Solicitar relatório
          → FastAPI retorna arquivo Excel
```

### 🔐 2.3 Fluxo de Autenticação

```
1. LOGIN
   Usuario → POST /api/admin/auth/login (ou /api/user/auth/login)
          → { email, password }

2. VERIFICAÇÃO
   FastAPI → Buscar usuário no DB por email
          → Verificar senha com bcrypt
          → Validar se usuário está ativo

3. GERAÇÃO DE TOKEN
   FastAPI → Gerar JWT com payload: { sub: user_id, email, is_admin }
          → Assinar com SECRET_KEY usando HS256
          → Retornar { access_token, token_type: "bearer" }

4. REQUISIÇÕES AUTENTICADAS
   Usuario → Enviar token no header: Authorization: Bearer <token>
   FastAPI → Validar token JWT
          → Decodificar e verificar assinatura
          → Extrair user_id do payload
          → Buscar usuário no DB
          → Autorizar acesso

5. EXPIRAÇÃO
   Token expira em 30 minutos (ACCESS_TOKEN_EXPIRE_MINUTES)
   Usuario precisa fazer login novamente
```

---

## III. Comandos Rápidos de Gerenciamento

### ⚙️ 3.1 Variáveis de Ambiente do Terminal

**Configure estas variáveis para facilitar os comandos:**

```bash
# Definir variáveis (adicione ao ~/.bashrc ou ~/.zshrc para persistir)
export RESOURCE_GROUP="mapa-saas-rg"
export WEB_APP="mapa-saas-app-1762971490"
export DB_SERVER="mapa-saas-db-1762971848"
export DB_NAME="mapa_saas"
export LOCATION="brazilsouth"
export PLAN_NAME="mapa-saas-plan"

# Aplicar (se adicionou ao bashrc)
source ~/.bashrc
```

### 🚀 3.2 Tabela de Comandos Essenciais

| Tarefa | Comando Azure CLI | Explicação |
|--------|-------------------|------------|
| **Deploy de Código** | `az webapp deployment source config-zip -g $RESOURCE_GROUP -n $WEB_APP --src mapa-saas.zip` | Envia ZIP com código atualizado e inicia build automático |
| **Reiniciar App** | `az webapp restart -g $RESOURCE_GROUP -n $WEB_APP` | Força reload da aplicação (após mudanças de config) |
| **Ver Logs** | `az webapp log tail -g $RESOURCE_GROUP -n $WEB_APP` | Visualização em tempo real dos logs do Uvicorn |
| **Baixar Logs** | `az webapp log download -g $RESOURCE_GROUP -n $WEB_APP --log-file logs.zip` | Download de todos os logs para análise |
| **Ver Status** | `az webapp show -g $RESOURCE_GROUP -n $WEB_APP --query state -o tsv` | Verifica se app está Running/Stopped |
| **Parar App** | `az webapp stop -g $RESOURCE_GROUP -n $WEB_APP` | Para a aplicação (⚠️ custo continua) |
| **Iniciar App** | `az webapp start -g $RESOURCE_GROUP -n $WEB_APP` | Inicia aplicação parada |
| **Resetar Senha DB** | `az postgres flexible-server update -g $RESOURCE_GROUP -n $DB_SERVER --admin-password "NovaSenha!"` | Atualiza senha do PostgreSQL (ver seção V.3) |
| **Ver App Settings** | `az webapp config appsettings list -g $RESOURCE_GROUP -n $WEB_APP -o table` | Lista todas variáveis de ambiente |
| **Atualizar Setting** | `az webapp config appsettings set -g $RESOURCE_GROUP -n $WEB_APP --settings DEBUG="False"` | Atualiza variável específica |
| **SSH no App** | `az webapp ssh -g $RESOURCE_GROUP -n $WEB_APP` | Acessa terminal do container |
| **Testar Health** | `curl https://$WEB_APP.azurewebsites.net/health` | Verifica se aplicação responde |
| **Parar Cobrança** | `az group delete -n $RESOURCE_GROUP --yes --no-wait` | ⚠️ **EXCLUIR TUDO (Irreversível)** |

### 📝 3.3 Scripts de Automação

#### **Script: deploy.sh**

```bash
#!/bin/bash
# Script para deploy automatizado

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do MAPA SaaS..."

# Variáveis
RESOURCE_GROUP="mapa-saas-rg"
WEB_APP="mapa-saas-app-1762971490"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ZIP_FILE="mapa-saas-${TIMESTAMP}.zip"

# 1. Criar ZIP excluindo arquivos desnecessários
echo "📦 Criando arquivo ZIP..."
zip -r "$ZIP_FILE" . \
  -x "venv/*" \
  -x ".git/*" \
  -x "__pycache__/*" \
  -x "*.pyc" \
  -x ".env*" \
  -x "uploads/*" \
  -x "reports/*" \
  -x "logs/*" \
  -x ".vscode/*" \
  -x ".idea/*"

# 2. Fazer deploy
echo "🚢 Enviando para Azure..."
az webapp deployment source config-zip \
  -g "$RESOURCE_GROUP" \
  -n "$WEB_APP" \
  --src "$ZIP_FILE"

# 3. Aguardar alguns segundos
echo "⏳ Aguardando deploy..."
sleep 20

# 4. Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
az webapp restart -g "$RESOURCE_GROUP" -n "$WEB_APP"

# 5. Aguardar inicialização
sleep 15

# 6. Testar health check
echo "🔍 Testando aplicação..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${WEB_APP}.azurewebsites.net/health)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 URL: https://${WEB_APP}.azurewebsites.net"
else
    echo "❌ Erro no deploy! HTTP Code: $HTTP_CODE"
    echo "📋 Verificando logs..."
    az webapp log tail -g "$RESOURCE_GROUP" -n "$WEB_APP" --limit 50
    exit 1
fi

# 7. Limpar ZIP local
rm "$ZIP_FILE"
echo "🧹 Arquivo ZIP removido"

echo "🎉 Deploy finalizado!"
```

**Usar o script:**

```bash
chmod +x deploy.sh
./deploy.sh
```

#### **Script: check-health.sh**

```bash
#!/bin/bash
# Script para verificar saúde da aplicação

WEB_APP="mapa-saas-app-1762971490"
RESOURCE_GROUP="mapa-saas-rg"
DB_SERVER="mapa-saas-db-1762971848"

echo "🏥 Verificando saúde do MAPA SaaS - $(date)"
echo "================================================"

# 1. Status do Web App
echo "📊 Status do Web App:"
STATE=$(az webapp show -g "$RESOURCE_GROUP" -n "$WEB_APP" --query state -o tsv)
echo "  Estado: $STATE"

# 2. Health Check HTTP
echo -e "\n🌐 Health Check HTTP:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${WEB_APP}.azurewebsites.net/health)
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ Aplicação respondendo (HTTP $HTTP_CODE)"
else
    echo "  ❌ Aplicação com problemas (HTTP $HTTP_CODE)"
fi

# 3. Status do PostgreSQL
echo -e "\n🗄️  Status do PostgreSQL:"
DB_STATE=$(az postgres flexible-server show -g "$RESOURCE_GROUP" -n "$DB_SERVER" --query state -o tsv)
echo "  Estado: $DB_STATE"

# 4. Testar conexão ao banco
echo -e "\n🔌 Testando conexão ao banco:"
RESPONSE=$(curl -s https://${WEB_APP}.azurewebsites.net/health)
if echo "$RESPONSE" | grep -q "database.*ok"; then
    echo "  ✅ Conexão com banco OK"
else
    echo "  ❌ Problema na conexão com banco"
fi

# 5. Últimas 10 linhas de log
echo -e "\n📋 Últimas linhas de log:"
az webapp log tail -g "$RESOURCE_GROUP" -n "$WEB_APP" --limit 10

echo -e "\n✅ Verificação concluída!"
```

**Usar o script:**

```bash
chmod +x check-health.sh
./check-health.sh
```

---

## IV. Deploy e Atualização

### 🔄 4.1 Processo Completo de Deploy

#### **Método 1: Deploy via ZIP (Recomendado)**

**Passo a passo detalhado:**

```bash
# 1. Navegar até o diretório do projeto
cd ~/Documentos/mapa-saas

# 2. Ativar ambiente virtual (para testes locais opcionais)
source venv/bin/activate

# 3. Atualizar dependências se necessário
pip install -r requirements.txt

# 4. Testar localmente (opcional mas recomendado)
# Criar .env local com configurações de teste
echo "DATABASE_URL=postgresql://postgres:senha@localhost:5432/mapa_test" > .env.test
echo "DEBUG=True" >> .env.test

# Iniciar servidor local
uvicorn app.main:app --reload --port 8000

# Em outro terminal, testar
curl http://localhost:8000/health

# Parar servidor (Ctrl+C)

# 5. Criar ZIP excluindo arquivos desnecessários
zip -r mapa-saas-$(date +%Y%m%d-%H%M%S).zip . \
  -x "venv/*" \
  -x ".git/*" \
  -x ".github/*" \
  -x "__pycache__/*" \
  -x "*.pyc" \
  -x "*.pyo" \
  -x ".env*" \
  -x "uploads/*" \
  -x "reports/*" \
  -x "logs/*" \
  -x ".vscode/*" \
  -x ".idea/*" \
  -x "*.db" \
  -x "*.sqlite*" \
  -x ".DS_Store" \
  -x "*.log" \
  -x "node_modules/*"

# 6. Verificar conteúdo do ZIP (opcional)
unzip -l mapa-saas-*.zip | head -20

# 7. Fazer deploy para Azure
az webapp deployment source config-zip \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --src mapa-saas-$(date +%Y%m%d)*.zip

# 8. Monitorar logs durante o deploy
az webapp log tail \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490

# Aguardar mensagens:
# - "Detecting platforms..."
# - "Platform 'python' detected"
# - "Running pip install..."
# - "App started successfully"

# Parar com Ctrl+C quando ver "App started"

# 9. Aguardar e reiniciar se necessário
sleep 30
az webapp restart \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490

# 10. Testar aplicação
curl -f https://mapa-saas-app-1762971490.azurewebsites.net/health
# Resposta esperada: {"status":"ok","timestamp":"..."}

# 11. Testar login
curl -X POST https://mapa-saas-app-1762971490.azurewebsites.net/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rhyan.hdr@gmail.com","password":"SUA_SENHA"}'

# Resposta esperada: {"access_token":"eyJ...","token_type":"bearer"}

# 12. Limpar ZIP local
rm mapa-saas-*.zip
```

#### **Método 2: Deploy via Git**

```bash
# 1. Configurar remote do Azure (apenas primeira vez)
git remote add azure https://mapa-saas-app-1762971490.scm.azurewebsites.net/mapa-saas-app-1762971490.git

# 2. Obter credenciais
CREDS=$(az webapp deployment list-publishing-credentials \
  --resource-group mapa-saas-rg \

--name mapa-saas-app-1762971490 \
  --query "{user:publishingUserName, pass:publishingPassword}" -o json)

echo "Credenciais de deployment:"
echo "$CREDS" | jq .

# 3. Commit das mudanças
git add .
git commit -m "deploy: atualização $(date +%Y-%m-%d)"

# 4. Push para Azure
git push azure main  # ou master, dependendo da sua branch

# 5. Monitorar deploy
az webapp log tail \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490
```

#### **Método 3: Deploy via VS Code (Azure Extension)**

```bash
# 1. Instalar extensão
code --install-extension ms-azuretools.vscode-azureappservice

# 2. No VS Code:
#    - Abrir pasta do projeto
#    - Clicar no ícone do Azure na sidebar
#    - Login na conta Azure
#    - Expandir "App Services"
#    - Clicar com botão direito no "mapa-saas-app-1762971490"
#    - Selecionar "Deploy to Web App..."
#    - Confirmar

# 3. Aguardar notificação de conclusão
```

### ⚙️ 4.2 Gerenciar Variáveis de Ambiente

#### **Listar Todas as Variáveis**

```bash
# Ver todas as variáveis
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --output table

# Ver apenas nomes
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query "[].name" -o tsv

# Ver valor específico
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query "[?name=='DEBUG'].value" -o tsv

# Exportar para JSON
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 > app-settings.json
```

#### **Atualizar Variáveis**

```bash
# Atualizar uma variável
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

# Gerar e atualizar nova SECRET_KEY
NEW_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
echo "Nova SECRET_KEY: $NEW_SECRET"

az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --settings SECRET_KEY="$NEW_SECRET"

# ⚠️ IMPORTANTE: Sempre reiniciar após alterar variáveis
az webapp restart \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490
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

### 🔄 4.3 Atualizar Dependências Python

```bash
# 1. Atualizar requirements.txt localmente
pip install nova-biblioteca==1.0.0
pip freeze > requirements.txt

# 2. OU editar manualmente requirements.txt
nano requirements.txt

# Exemplo de requirements.txt atualizado:
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic==2.5.0
pydantic-settings==2.1.0
jinja2==3.1.2
lxml==4.9.3
xmltodict==0.13.0
pdfplumber==0.10.3
PyPDF2==3.0.1
openpyxl==3.1.2
python-dotenv==1.0.0

# 3. Testar localmente
pip install -r requirements.txt
python -m pytest  # Se tiver testes

# 4. Fazer deploy (Azure instalará automaticamente)
zip -r mapa-saas.zip . -x "venv/*" ".git/*" "__pycache__/*" "*.pyc" ".env" "uploads/*" "reports/*"

az webapp deployment source config-zip \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --src mapa-saas.zip

# 5. Monitorar instalação
az webapp log tail \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 | grep -i "install\|requirement"
```

### 🎯 4.4 Atualizar Comando de Startup

```bash
# Ver comando atual
az webapp config show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query appCommandLine -o tsv

# Atualizar comando (exemplo com mais workers)
az webapp config set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --startup-file "gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind=0.0.0.0:8000 --timeout 600 --access-logfile - --error-logfile -"

# OU manter comando simples com uvicorn
az webapp config set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --startup-file "uvicorn app.main:app --host 0.0.0.0 --port 8000"

# Reiniciar para aplicar
az webapp restart \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490
```

### 📝 4.5 Rollback para Versão Anterior

```bash
# 1. Ver histórico de deployments
az webapp deployment list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --output table

# 2. Ver detalhes de um deployment específico
DEPLOYMENT_ID="abc123-456def-789ghi"
az webapp deployment show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --deployment-id $DEPLOYMENT_ID

# 3. Fazer rollback (redeploy de versão anterior)
# Método 1: Se tiver backup do ZIP anterior
az webapp deployment source config-zip \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --src backup/mapa-saas-20250110.zip

# Método 2: Usar Git (se usar Git deploy)
git log --oneline  # Ver commits
git checkout abc123  # Voltar para commit anterior
git push azure HEAD:main --force

# 4. Verificar rollback
curl https://mapa-saas-app-1762971490.azurewebsites.net/health
```

### 🏷️ 4.6 Versionamento com Git Tags

```bash
# 1. Criar tag antes do deploy
git tag -a v1.0.1 -m "Deploy versão 1.0.1 - Correção bugs relatórios"
git push origin v1.0.1

# 2. Listar tags
git tag -l

# 3. Ver detalhes de uma tag
git show v1.0.1

# 4. Deploy de uma tag específica
git checkout v1.0.1
./deploy.sh

# 5. Voltar para main
git checkout main
```

---

## V. Gerenciamento do Banco de Dados

### 🔌 5.1 Conexão Remota com Clientes SQL

#### **1. Liberar Acesso via Firewall**

```bash
# Obter seu IP público
MEU_IP=$(curl -s ifconfig.me)
echo "Seu IP público: $MEU_IP"

# Adicionar regra de firewall
az postgres flexible-server firewall-rule create \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --rule-name "DevPC-$(hostname)-$(date +%Y%m%d)" \
  --start-ip-address $MEU_IP \
  --end-ip-address $MEU_IP

# Listar regras existentes
az postgres flexible-server firewall-rule list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --output table

# Deletar regra antiga/desnecessária
az postgres flexible-server firewall-rule delete \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --rule-name "DevPC-oldpc-20250101" \
  --yes
```

#### **2. Conectar com pgAdmin 4**

**Download:** https://www.pgadmin.org/download/

**Configuração passo a passo:**

1. Abra **pgAdmin 4**
2. Clique com botão direito em **Servers** → **Register** → **Server**
3. **Aba General:**
   - Name: `MAPA SaaS - Azure Production`
   - Server group: `Azure`
   - Comments: `Banco de produção do MAPA SaaS`
4. **Aba Connection:**
   - Host name/address: `mapa-saas-db-1762971848.postgres.database.azure.com`
   - Port: `5432`
   - Maintenance database: `mapa_saas`
   - Username: `mapaadmin`
   - Password: `NovaSenha12345!`
   - ✅ Save password
5. **Aba SSL:**
   - SSL mode: `Require`
6. **Aba Advanced:**
   - DB restriction: `mapa_saas` (opcional)
7. Clicar **Save**

**Queries úteis no pgAdmin:**

```sql
-- Ver todas as tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver estrutura de uma tabela
\d users

-- Contar registros
SELECT 
    'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'xml_uploads', COUNT(*) FROM xml_uploads
UNION ALL
SELECT 'reports', COUNT(*) FROM reports;

-- Ver últimos uploads
SELECT id, user_id, filename, status, upload_date 
FROM xml_uploads 
ORDER BY upload_date DESC 
LIMIT 10;

-- Ver estatísticas de usuários
SELECT 
    u.email,
    u.company_name,
    COUNT(DISTINCT x.id) AS total_uploads,
    COUNT(DISTINCT r.id) AS total_reports
FROM users u
LEFT JOIN xml_uploads x ON u.id = x.user_id
LEFT JOIN reports r ON u.id = r.user_id
GROUP BY u.id, u.email, u.company_name;
```

#### **3. Conectar com DBeaver**

**Download:** https://dbeaver.io/download/

**Configuração:**

1. **Database** → **New Database Connection**
2. Selecione **PostgreSQL** → **Next**
3. **Aba Main:**
   - Server Host: `mapa-saas-db-1762971848.postgres.database.azure.com`
   - Port: `5432`
   - Database: `mapa_saas`
   - Authentication: Database Native
   - Username: `mapaadmin`
   - Password: `NovaSenha12345!`
   - ✅ Save password locally
4. **Aba PostgreSQL:**
   - Show all databases: ❌ (para melhor performance)
5. **Aba Driver properties:**
   - Adicionar: `ssl = true`
   - Adicionar: `sslfactory = org.postgresql.ssl.NonValidatingFactory`
6. **Test Connection** → **Finish**

#### **4. Conectar via psql (Terminal)**

```bash
# Instalar psql (se não tiver)
# Ubuntu/Debian:
sudo apt install postgresql-client

# macOS:
brew install postgresql@14

# Windows: Baixar PostgreSQL
# https://www.postgresql.org/download/windows/

# Conectar ao banco
psql "postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require"

# OU com parâmetros separados
psql \
  -h mapa-saas-db-1762971848.postgres.database.azure.com \
  -U mapaadmin \
  -d mapa_saas \
  -p 5432

# Será solicitada a senha: NovaSenha12345!
```

**Comandos úteis no psql:**

```sql
-- Comandos de navegação
\l                    -- Listar databases
\c mapa_saas          -- Conectar a database
\dt                   -- Listar tabelas
\d users              -- Descrever tabela users
\d+ users             -- Descrição detalhada
\di                   -- Listar índices
\df                   -- Listar funções

-- Comandos de formatação
\x                    -- Toggle expanded display (melhor para ver resultados)
\x auto               -- Auto expanded (expande se necessário)

-- Queries
SELECT * FROM users;
SELECT * FROM xml_uploads WHERE status = 'processed' LIMIT 5;

-- Informações do sistema
SELECT version();
SELECT current_database();
SELECT current_user;

-- Ver tamanho das tabelas
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Ver conexões ativas
SELECT pid, usename, application_name, client_addr, state, query
FROM pg_stat_activity
WHERE datname = 'mapa_saas';

-- Sair
\q
```

### 🔐 5.2 Operações de Segurança do Banco

#### **1. Ver Estatísticas e Configurações**

```bash
# Ver detalhes completos do servidor
az postgres flexible-server show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --output json | jq .

# Ver uso de storage
az postgres flexible-server show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --query storage -o table

# Ver lista de databases
az postgres flexible-server db list \
  --resource-group mapa-saas-rg \
  --server-name mapa-saas-db-1762971848 \
  --output table

# Ver configuração de parâmetros
az postgres flexible-server parameter list \
  --resource-group mapa-saas-rg \
  --server-name mapa-saas-db-1762971848 \
  --output table

# Ver estado do servidor
az postgres flexible-server show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --query state -o tsv
```

#### **2. Configurar Parâmetros do PostgreSQL**

```bash
# Ver parâmetro específico
az postgres flexible-server parameter show \
  --resource-group mapa-saas-rg \
  --server-name mapa-saas-db-1762971848 \
  --name max_connections

# Atualizar parâmetro
az postgres flexible-server parameter set \
  --resource-group mapa-saas-rg \
  --server-name mapa-saas-db-1762971848 \
  --name max_connections \
  --value 100

# Parâmetros úteis para ajustar:
# - max_connections (padrão: 20 no B1ms)
# - shared_buffers
# - work_mem
# - maintenance_work_mem
# - effective_cache_size
```

### 🔄 5.3 Resetar Senha do PostgreSQL

**⚠️ PROCEDIMENTO CRÍTICO - Siga todos os passos**

```bash
# 1. Definir nova senha forte
# Evite caracteres especiais problemáticos: @, #, $, %, &
# Prefira: letras, números, e ! apenas
NOVA_SENHA="MinhaNovaSegura2025!"

echo "Nova senha definida: $NOVA_SENHA"
echo "⚠️  Anote esta senha em local seguro!"

# 2. Atualizar senha no servidor PostgreSQL
# ⏳ Este processo pode demorar 2-5 minutos
echo "🔄 Atualizando senha no PostgreSQL..."
az postgres flexible-server update \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --admin-password "$NOVA_SENHA"

# 3. Aguardar conclusão
echo "⏳ Aguardando conclusão da atualização..."
sleep 90

# 4. Verificar se servidor está pronto
STATE=$(az postgres flexible-server show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --query state -o tsv)

echo "Estado do servidor: $STATE"

if [ "$STATE" != "Ready" ]; then
    echo "⚠️  Servidor não está pronto. Aguardando mais 60 segundos..."
    sleep 60
fi

# 5. Construir nova DATABASE_URL
DB_HOST="mapa-saas-db-1762971848.postgres.database.azure.com"
DATABASE_URL_NOVA="postgresql://mapaadmin:${NOVA_SENHA}@${DB_HOST}:5432/mapa_saas?sslmode=require"

echo "Nova DATABASE_URL:"
echo "$DATABASE_URL_NOVA"

# 6. Atualizar DATABASE_URL no Web App
echo "🔄 Atualizando DATABASE_URL no Web App..."
az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --settings DATABASE_URL="$DATABASE_URL_NOVA"

# 7. Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
az webapp restart \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490

# 8. Aguardar inicialização
echo "⏳ Aguardando aplicação inicializar..."
sleep 30

# 9. Testar conexão
echo "🔍 Testando aplicação..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://mapa-saas-app-1762971490.azurewebsites.net/health)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Senha atualizada com sucesso!"
    echo "✅ Aplicação funcionando corretamente!"
else
    echo "❌ Erro! HTTP Code: $HTTP_CODE"
    echo "📋 Verificando logs..."
    az webapp log tail \
      --resource-group mapa-saas-rg \
      --name mapa-saas-app-1762971490 \
      --limit 20
    exit 1
fi

# 10. Testar conexão direta ao banco (opcional)
echo "🔍 Testando conexão direta ao banco..."
psql "$DATABASE_URL_NOVA" -c "SELECT 1;" && echo "✅ Conexão direta OK" || echo "❌ Erro na conexão direta"

# 11. Salvar informações
echo "📝 Salvando informações de senha..."
cat > .senha-db-$(date +%Y%m%d).txt << EOF
Data de atualização: $(date)
Nova senha: $NOVA_SENHA
DATABASE_URL: $DATABASE_URL_NOVA

⚠️  MANTENHA ESTE ARQUIVO SEGURO!
⚠️  NÃO COMMITAR NO GIT!
EOF

echo "✅ Processo concluído!"
echo "📁 Informações salvas em: .senha-db-$(date +%Y%m%d).txt"
```

### 📊 5.4 Manutenção e Otimização do Banco

```bash
# Via psql - executar queries de manutenção

# 1. Vacuum e Analyze (limpeza e atualização de estatísticas)
psql "$DATABASE_URL" << EOF
VACUUM ANALYZE;
\echo "✅ Vacuum e Analyze concluído"
\q
EOF

# 2. Reindex (reconstruir índices)
psql "$DATABASE_URL" << EOF
REINDEX DATABASE mapa_saas;
\echo "✅ Reindex concluído"
\q
EOF

# 3. Ver tamanho das tabelas
psql "$DATABASE_URL" << EOF
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;
\q
EOF

# 4. Ver queries lentas (se pg_stat_statements estiver habilitado)
psql "$DATABASE_URL" << EOF
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
\q
EOF

# 5. Ver índices não utilizados
psql "$DATABASE_URL" << EOF
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public';
\q
EOF
```

### 🔍 5.5 Queries Úteis para Análise

```sql
-- Ver todos os usuários e suas estatísticas
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.company_name,
    u.is_admin,
    u.is_active,
    COUNT(DISTINCT x.id) AS total_uploads,
    COUNT(DISTINCT CASE WHEN x.status = 'processed' THEN x.id END) AS uploads_processados,
    COUNT(DISTINCT r.id) AS total_relatorios,
    u.created_at
FROM users u
LEFT JOIN xml_uploads x ON u.id = x.user_id
LEFT JOIN reports r ON u.id = r.user_id
GROUP BY u.id
ORDER BY total_uploads DESC;

-- Ver uploads recentes com detalhes
SELECT 
    x.id,
    u.email AS usuario,
    x.filename,
    x.status,
    x.upload_date,
    x.processed_date,
    EXTRACT(EPOCH FROM (x.processed_date - x.upload_date)) / 60 AS tempo_processamento_minutos
FROM xml_uploads x
JOIN users u ON x.user_id = u.id
ORDER BY x.upload_date DESC
LIMIT 20;

-- Ver relatórios por período
SELECT 
    report_period AS trimestre,
    COUNT(*) AS total_relatorios,
    COUNT(DISTINCT user_id) AS usuarios_unicos,
    SUM(xml_count) AS total_xmls
FROM reports
GROUP BY report_period
ORDER BY report_period DESC;

-- Ver uploads com erro
SELECT 
    x.id,
    u.email,
    x.filename,
    x.error_message,
    x.upload_date
FROM xml_uploads x
JOIN users u ON x.user_id = u.id
WHERE x.status = 'error'
ORDER BY x.upload_date DESC;

-- Ver uso de espaço por usuário (via JSONB)
SELECT 
    u.email,
    COUNT(x.id) AS total_uploads,
    pg_size_pretty(SUM(octet_length(x.nfe_data::text))) AS tamanho_dados_json
FROM users u
JOIN xml_uploads x ON u.id = x.user_id
WHERE x.nfe_data IS NOT NULL
GROUP BY u.id, u.email
ORDER BY SUM(octet_length(x.nfe_data::text)) DESC;
```

---

# 📚 Continuação - Seções VI a IX

---

## VI. Monitoramento e Logs

### 📋 6.1 Ver Logs em Tempo Real

```bash
# Log stream ao vivo (padrão)
az webapp log tail \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490

# Com filtro de nível (apenas erros)
az webapp log tail \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --filter Error

# Com filtro múltiplo (warnings e erros)
az webapp log tail \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --filter "Error Warning"

# Limitar número de linhas
az webapp log tail \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --limit 50

# Parar com Ctrl+C
```

### 📥 6.2 Baixar Logs para Análise

```bash
# Baixar todos os logs
az webapp log download \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --log-file "azure-logs-$(date +%Y%m%d-%H%M%S).zip"

# Extrair
unzip "azure-logs-$(date +%Y%m%d)*.zip" -d logs-azure

# Navegar e analisar
cd logs-azure

# Ver logs de aplicação
cat LogFiles/Application/*.log

# Buscar erros
grep -i "error\|exception\|traceback" LogFiles/Application/*.log

# Ver últimas 50 linhas
tail -50 LogFiles/Application/*.log

# Buscar padrão específico
grep -n "database connection" LogFiles/Application/*.log

# Contar ocorrências de erro
grep -c "error" LogFiles/Application/*.log

# Ver logs do Docker
cat LogFiles/docker/*.log
```

### 🔍 6.3 Habilitar Logging Detalhado

```bash
# Habilitar todos os níveis de log
az webapp log config \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --application-logging filesystem \
  --detailed-error-messages true \
  --failed-request-tracing true \
  --level verbose \
  --docker-container-logging filesystem

# Verificar configuração
az webapp log config show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490

# Reiniciar para aplicar
az webapp restart \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490
```

### 📊 6.4 Monitorar Métricas do App Service

```bash
# CPU Usage (últimas 24 horas)
az monitor metrics list \
  --resource /subscriptions/$(az account show --query id -o tsv)/resourceGroups/mapa-saas-rg/providers/Microsoft.Web/sites/mapa-saas-app-1762971490 \
  --metric CpuTime \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --interval PT1H \
  --aggregation Average

# Memory Usage
az monitor metrics list \
  --resource /subscriptions/$(az account show --query id -o tsv)/resourceGroups/mapa-saas-rg/providers/Microsoft.Web/sites/mapa-saas-app-1762971490 \
  --metric MemoryWorkingSet \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --interval PT1H \
  --aggregation Average

# Response Time
az monitor metrics list \
  --resource /subscriptions/$(az account show --query id -o tsv)/resourceGroups/mapa-saas-rg/providers/Microsoft.Web/sites/mapa-saas-app-1762971490 \
  --metric ResponseTime \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --interval PT5M \
  --aggregation Average

# HTTP Requests
az monitor metrics list \
  --resource /subscriptions/$(az account show --query id -o tsv)/resourceGroups/mapa-saas-rg/providers/Microsoft.Web/sites/mapa-saas-app-1762971490 \
  --metric Requests \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --interval PT5M \
  --aggregation Total

# HTTP Errors (5xx)
az monitor metrics list \
  --resource /subscriptions/$(az account show --query id -o tsv)/resourceGroups/mapa-saas-rg/providers/Microsoft.Web/sites/mapa-saas-app-1762971490 \
  --metric Http5xx \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --interval PT5M \
  --aggregation Total
```

### 🔔 6.5 Configurar Alertas

```bash
# Criar Action Group (grupo de notificação)
az monitor action-group create \
  --name "mapa-saas-alerts" \
  --resource-group mapa-saas-rg \
  --short-name "mapasaas" \
  --email-receiver \
    name="admin" \
    email-address="rhyan.hdr@gmail.com"

# Alerta de CPU alta (>80%)
az monitor metrics alert create \
  --name "mapa-saas-high-cpu" \
  --resource-group mapa-saas-rg \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/mapa-saas-rg/providers/Microsoft.Web/sites/mapa-saas-app-1762971490 \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action-groups /subscriptions/$(az account show --query id -o tsv)/resourceGroups/mapa-saas-rg/providers/microsoft.insights/actionGroups/mapa-saas-alerts \
  --description "Alerta quando CPU passa de 80%"

# Alerta de memória alta (>85%)
az monitor metrics alert create \
  --name "mapa-saas-high-memory" \
  --resource-group mapa-saas-rg \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/mapa-saas-rg/providers/Microsoft.Web/sites/mapa-saas-app-1762971490 \
  --condition "avg MemoryPercentage > 85" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action-groups /subscriptions/$(az account show --query id -o tsv)/resourceGroups/mapa-saas-rg/providers/microsoft.insights/actionGroups/mapa-saas-alerts \
  --description "Alerta quando memória passa de 85%"

# Alerta de app down (muitos erros 5xx)
az monitor metrics alert create \
  --name "mapa-saas-app-down" \
  --resource-group mapa-saas-rg \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/mapa-saas-rg/providers/Microsoft.Web/sites/mapa-saas-app-1762971490 \
  --condition "count Http5xx > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action-groups /subscriptions/$(az account show --query id -o tsv)/resourceGroups/mapa-saas-rg/providers/microsoft.insights/actionGroups/mapa-saas-alerts \
  --description "Alerta quando há mais de 10 erros 5xx em 5 minutos"

# Listar alertas configurados
az monitor metrics alert list \
  --resource-group mapa-saas-rg \
  --output table
```

### 🖥️ 6.6 Acessar Console Kudu

**Kudu é o console avançado do Azure App Service**

```bash
# Obter URL do Kudu
KUDU_URL="https://mapa-saas-app-1762971490.scm.azurewebsites.net"
echo "Kudu Console: $KUDU_URL"

# Abrir no navegador
# Linux:
xdg-open "$KUDU_URL"

# macOS:
open "$KUDU_URL"

# Windows:
start "$KUDU_URL"
```

#### **Ferramentas Úteis no Kudu:**

| Ferramenta | Caminho | Uso |
|------------|---------|-----|
| **Environment** | `/Env` | Ver todas variáveis de ambiente |
| **Process Explorer** | `/ProcessExplorer` | Monitorar CPU/memória em tempo real |
| **Debug Console (SSH)** | `/DebugConsole` | Terminal bash no navegador |
| **File Manager** | `/newui` | Navegar e editar arquivos |
| **Log Stream** | `/api/logstream` | Logs em tempo real (API) |
| **Site Extensions** | `/SiteExtensions` | Instalar extensões |
| **REST API** | `/api` | API do Kudu |

#### **Comandos Úteis no WebSSH (Kudu):**

```bash
# Navegar até aplicação
cd /home/site/wwwroot

# Listar arquivos
ls -lah

# Ver variáveis de ambiente
env | grep -i database

# Ver processos
ps aux

# Ver uso de disco
df -h

# Ver uso de memória
free -h

# Testar conexão com banco
python3 << END
import psycopg2
import os
try:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    print("✅ Conexão OK")
    conn.close()
except Exception as e:
    print(f"❌ Erro: {e}")
END

# Ver logs recentes
tail -50 /home/LogFiles/Application/*.log

# Criar usuário admin
cd /home/site/wwwroot
python3 create_admin.py
```

### 📈 6.7 Script de Monitoramento Automatizado

```bash
# Criar script de monitoramento
cat > monitor.sh << 'EOF'
#!/bin/bash

RESOURCE_GROUP="mapa-saas-rg"
WEB_APP="mapa-saas-app-1762971490"
DB_SERVER="mapa-saas-db-1762971848"
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"  # Opcional

echo "🔍 MONITORAMENTO MAPA SAAS - $(date)"
echo "================================================"

# 1. Status do Web App
echo "📊 Status do Web App:"
STATE=$(az webapp show -g "$RESOURCE_GROUP" -n "$WEB_APP" --query state -o tsv)
echo "  Estado: $STATE"

if [ "$STATE" != "Running" ]; then
    echo "  ⚠️  ALERTA: App não está rodando!"
    # Enviar notificação (exemplo com curl)
    # curl -X POST $WEBHOOK_URL -d '{"text":"App MAPA SaaS está offline!"}'
fi

# 2. Health Check HTTP
echo -e "\n🌐 Health Check HTTP:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://${WEB_APP}.azurewebsites.net/health")
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "https://${WEB_APP}.azurewebsites.net/health")

if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ Aplicação OK (HTTP $HTTP_CODE, ${RESPONSE_TIME}s)"
else
    echo "  ❌ ALERTA: Aplicação com problemas (HTTP $HTTP_CODE)"
fi

# 3. Status do PostgreSQL
echo -e "\n🗄️  Status do PostgreSQL:"
DB_STATE=$(az postgres flexible-server show -g "$RESOURCE_GROUP" -n "$DB_SERVER" --query state -o tsv)
echo "  Estado: $DB_STATE"

if [ "$DB_STATE" != "Ready" ]; then
    echo "  ⚠️  ALERTA: Banco não está pronto!"
fi

# 4. Métricas recentes (última hora)
echo -e "\n📈 Métricas da última hora:"

# CPU
CPU_AVG=$(az monitor metrics list \
  --resource /subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$WEB_APP \
  --metric "Percentage CPU" \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --interval PT1H \
  --aggregation Average \
  --query "value[0].timeseries[0].data[0].average" -o tsv 2>/dev/null || echo "N/A")

echo "  CPU Média: ${CPU_AVG}%"

# Memory
MEM_AVG=$(az monitor metrics list \
  --resource /subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$WEB_APP \
  --metric "MemoryPercentage" \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --interval PT1H \
  --aggregation Average \
  --query "value[0].timeseries[0].data[0].average" -o tsv 2>/dev/null || echo "N/A")

echo "  Memória Média: ${MEM_AVG}%"

# 5. Verificar erros recentes nos logs
echo -e "\n📋 Erros recentes (últimas 20 linhas):"
az webapp log download -g "$RESOURCE_GROUP" -n "$WEB_APP" --log-file temp-logs.zip > /dev/null 2>&1
unzip -q temp-logs.zip
ERROR_COUNT=$(grep -i "error\|exception" LogFiles/Application/*.log 2>/dev/null | tail -20 | wc -l)
echo "  Erros encontrados: $ERROR_COUNT"

if [ "$ERROR_COUNT" -gt 10 ]; then
    echo "  ⚠️  ALERTA: Muitos erros detectados!"
    grep -i "error\|exception" LogFiles/Application/*.log 2>/dev/null | tail -5
fi

rm -rf LogFiles temp-logs.zip

# 6. Resumo
echo -e "\n✅ Monitoramento concluído!"
echo "================================================"

# Salvar log
echo "$(date): App=$STATE, DB=$DB_STATE, HTTP=$HTTP_CODE" >> monitoring.log
EOF

chmod +x monitor.sh

# Executar
./monitor.sh

# Agendar com cron (a cada 15 minutos)
(crontab -l 2>/dev/null; echo "*/15 * * * * cd $(pwd) && ./monitor.sh >> monitor-output.log 2>&1") | crontab -
```

---

## VII. Configuração em Novos Ambientes

### 💻 7.1 Setup Inicial - Novo Computador/Servidor

#### **Passo 1: Instalar Ferramentas Necessárias**

**Ubuntu/Debian:**

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Python 3.11
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-dev python3-pip -y

# Instalar Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Instalar Git
sudo apt install git -y

# Instalar PostgreSQL client
sudo apt install postgresql-client -y

# Instalar ferramentas úteis
sudo apt install curl wget unzip zip jq tree -y

# Verificar instalações
python3.11 --version
az --version
git --version
psql --version
```

**macOS:**

```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar ferramentas
brew install python@3.11
brew install azure-cli
brew install git
brew install postgresql@14
brew install jq tree

# Verificar
python3.11 --version
az --version
git --version
psql --version
```

**Windows:**

```powershell
# Abrir PowerShell como Administrador

# Instalar Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar ferramentas
choco install python311 -y
choco install azure-cli -y
choco install git -y
choco install postgresql14 -y

# OU via winget (Windows 11)
winget install Python.Python.3.11
winget install Microsoft.AzureCLI
winget install Git.Git
winget install PostgreSQL.PostgreSQL.14

# Verificar (abrir novo terminal)
python --version
az --version
git --version
psql --version
```

#### **Passo 2: Clonar Repositório**

```bash
# Criar diretório de trabalho
mkdir -p ~/Documentos
cd ~/Documentos

# Opção A: Clonar do Git (se tiver repositório)
git clone https://github.com/seu-usuario/mapa-saas.git
cd mapa-saas

# Opção B: Baixar ZIP do repositório
# wget https://github.com/seu-usuario/mapa-saas/archive/main.zip
# unzip main.zip
# cd mapa-saas-main

# Opção C: Baixar do Azure DevOps
# git clone https://dev.azure.com/seu-org/mapa-saas/_git/mapa-saas
# cd mapa-saas
```

#### **Passo 3: Configurar Ambiente Virtual Python**

```bash
# Criar virtual environment
python3.11 -m venv venv

# Ativar
# Linux/macOS:
source venv/bin/activate

# Windows (CMD):
venv\Scripts\activate.bat

# Windows (PowerShell):
venv\Scripts\Activate.ps1

# Verificar que está ativo (deve aparecer (venv) no prompt)
which python  # Linux/Mac
where python  # Windows

# Atualizar pip
pip install --upgrade pip setuptools wheel

# Instalar dependências do projeto
pip install -r requirements.txt

# Verificar instalação
pip list
pip check  # Verificar conflitos
```

#### **Passo 4: Configurar Azure CLI**

```bash
# Login no Azure (abrirá navegador)
az login

# Se tiver múltiplas contas/subscriptions
az account list --output table

# Definir subscription padrão
az account set --subscription "nome-ou-id-da-subscription"

# Verificar subscription ativa
az account show

# Configurar defaults (opcional, mas recomendado)
az configure --defaults \
  group=mapa-saas-rg \
  location=brazilsouth

# Verificar configuração
az configure --list-defaults
```

#### **Passo 5: Configurar Git**

```bash
# Configurar identidade global
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Configurar editor padrão
git config --global core.editor "nano"  # ou vim, code, etc

# Ver configuração
git config --list

# Configurar branch padrão
git config --global init.defaultBranch main

# Configurar credenciais (opcional)
git config --global credential.helper store  # ou cache
```

### 🔧 7.2 Configurar Ambiente Local de Desenvolvimento

#### **Criar arquivo .env para desenvolvimento:**

```bash
cat > .env << 'EOF'
# Database Local (PostgreSQL local ou Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mapa_saas_dev

# Security (⚠️ NÃO usar mesma chave de produção!)
SECRET_KEY=chave-local-desenvolvimento-NAO-usar-em-producao-123456
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=True
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000

# Logging
LOG_LEVEL=DEBUG
EOF

# Adicionar ao .gitignore
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
```

#### **Opção A: PostgreSQL Local**

```bash
# Ubuntu/Debian:
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS:
brew install postgresql@14
brew services start postgresql@14

# Windows: Instalar via instalador
# https://www.postgresql.org/download/windows/

# Criar banco local
sudo -u postgres createdb mapa_saas_dev

# Criar usuário (opcional)
sudo -u postgres psql << EOF
CREATE USER mapa_user WITH PASSWORD 'senha123';
GRANT ALL PRIVILEGES ON DATABASE mapa_saas_dev TO mapa_user;
\q
EOF

# Atualizar .env se usar usuário customizado
# DATABASE_URL=postgresql://mapa_user:senha123@localhost:5432/mapa_saas_dev
```

#### **Opção B: PostgreSQL via Docker**

```bash
# Instalar Docker
# Linux: https://docs.docker.com/engine/install/ubuntu/
# Mac: brew install --cask docker
# Windows: winget install Docker.DockerDesktop

# Rodar PostgreSQL container
docker run -d \
  --name mapa-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mapa_saas_dev \
  -p 5432:5432 \
  -v mapa-pg-data:/var/lib/postgresql/data \
  postgres:14

# Verificar
docker ps

# Parar
docker stop mapa-postgres

# Iniciar
docker start mapa-postgres

# Ver logs
docker logs mapa-postgres

# Conectar
docker exec -it mapa-postgres psql -U postgres -d mapa_saas_dev
```

#### **Criar Tabelas Localmente:**

```bash
# Ativar ambiente virtual
source venv/bin/activate

# Criar tabelas
python << END
from app.database import Base, engine
from app.models import User, XMLUpload, Report

print("Criando tabelas...")
Base.metadata.create_all(bind=engine)
print("✅ Tabelas criadas com sucesso!")
END

# Verificar no banco
psql postgresql://postgres:postgres@localhost:5432/mapa_saas_dev -c "\dt"
```

#### **Criar Usuário Admin Local:**

```bash
python create_admin.py

# Ou criar via script
python << END
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

db = SessionLocal()

admin = User(
    email="admin@local.dev",
    full_name="Admin Local",
    hashed_password=get_password_hash("admin123"),
    is_admin=True,
    is_active=True,
    company_name="Desenvolvimento"
)

db.add(admin)
db.commit()
print(f"✅ Admin criado: {admin.email}")
db.close()
END
```

### 🚀 7.3 Testar Aplicação Localmente

```bash
# Ativar ambiente virtual
source venv/bin/activate

# Iniciar servidor de desenvolvimento
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Em outro terminal, testar
# Health check
curl http://localhost:8000/health

# Testar login
curl -X POST http://localhost:8000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local.dev","password":"admin123"}'

# Abrir no navegador
# http://localhost:8000
# http://localhost:8000/docs (Swagger)

# Parar servidor: Ctrl+C
```

### 🔄 7.4 Sincronizar com Azure (Pull de Produção)

#### **Baixar Configurações do Azure:**

```bash
# Ver variáveis de ambiente de produção
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --output json > azure-settings.json

# Visualizar
cat azure-settings.json | jq '.[] | {name: .name, value: .value}'

# Extrair DATABASE_URL (cuidado ao expor)
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query "[?name=='DATABASE_URL'].value" -o tsv
```

#### **Conectar no Banco de Produção (⚠️ Cuidado!):**

```bash
# Adicionar seu IP no firewall
MEU_IP=$(curl -s ifconfig.me)
az postgres flexible-server firewall-rule create \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --rule-name "DevPC-$(hostname)-$(date +%Y%m%d)" \
  --start-ip-address $MEU_IP \
  --end-ip-address $MEU_IP

# Conectar (⚠️ SOMENTE LEITURA!)
psql "postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require"

# Executar apenas SELECTs
# SELECT * FROM users LIMIT 5;
# \q para sair
```

#### **Fazer Dump do Banco de Produção:**

```bash
# Backup/dump completo
pg_dump "postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require" \
  > backup-prod-$(date +%Y%m%d).sql

# Backup comprimido
pg_dump "postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require" \
  | gzip > backup-prod-$(date +%Y%m%d).sql.gz

# Restaurar no banco local (para testes)
psql -U postgres -d mapa_saas_dev < backup-prod-$(date +%Y%m%d).sql

# OU via Docker
gunzip -c backup-prod-$(date +%Y%m%d).sql.gz | \
  docker exec -i mapa-postgres psql -U postgres -d mapa_saas_dev
```

### 📝 7.5 Documentar Ambiente Local

**Criar arquivo `SETUP_LOCAL.md`:**

```bash
cat > SETUP_LOCAL.md << 'EOF'
# Setup Local - MAPA SaaS

## Informações do Ambiente

- **Data de Setup:** $(date)
- **Usuário:** $(whoami)
- **Sistema:** $(uname -a)
- **Python:** $(python3.11 --version)
- **Azure CLI:** $(az --version | head -1)

## Configurações

### Banco de Dados Local
- **Tipo:** PostgreSQL via Docker
- **Host:** localhost:5432
- **Database:** mapa_saas_dev
- **User:** postgres
- **Password:** postgres

### Credenciais de Teste
- **Admin Local:** admin@local.dev / admin123

## Comandos Úteis

### Iniciar Ambiente
\`\`\`bash
cd ~/Documentos/mapa-saas
source venv/bin/activate
docker start mapa-postgres
uvicorn app.main:app --reload
\`\`\`

### Parar Ambiente
\`\`\`bash
# Parar servidor: Ctrl+C
docker stop mapa-postgres
deactivate
\`\`\`

### Deploy para Azure
\`\`\`bash
./deploy.sh
\`\`\`

### Atualizar Dependências
\`\`\`bash
pip install --upgrade -r requirements.txt
\`\`\`

## Problemas Conhecidos

- [ ] Nenhum no momento

## Notas

- Sempre usar .env para configurações locais
- Nunca commitar .env no Git
- Fazer backup antes de restaurar dump de produção
EOF
```

---

## VIII. Backup e Recuperação

### 💾 8.1 Backup do Banco de Dados

#### **1. Backup Manual via pg_dump**

```bash
# Definir variáveis
DB_URL="postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require"
BACKUP_DIR="$HOME/backups/mapa-saas"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Criar diretório
mkdir -p "$BACKUP_DIR"

# Backup completo
pg_dump "$DB_URL" > "$BACKUP_DIR/backup-$TIMESTAMP.sql"

# Backup comprimido (recomendado)
pg_dump "$DB_URL" | gzip > "$BACKUP_DIR/backup-$TIMESTAMP.sql.gz"

#

Backup apenas dados (sem schema)
pg_dump --data-only "$DB_URL" | gzip > "$BACKUP_DIR/backup-data-$TIMESTAMP.sql.gz"

# Backup apenas schema (estrutura)
pg_dump --schema-only "$DB_URL" > "$BACKUP_DIR/backup-schema-$TIMESTAMP.sql"

# Backup de tabela específica
pg_dump "$DB_URL" -t users | gzip > "$BACKUP_DIR/backup-users-$TIMESTAMP.sql.gz"

# Verificar tamanho do backup
ls -lh "$BACKUP_DIR/backup-$TIMESTAMP.sql.gz"

echo "✅ Backup criado: $BACKUP_DIR/backup-$TIMESTAMP.sql.gz"
```

#### **2. Script de Backup Automatizado**

```bash
# Criar script de backup
cat > backup-db.sh << 'EOF'
#!/bin/bash

# Configurações
BACKUP_DIR="$HOME/backups/mapa-saas"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DB_URL="postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require"
KEEP_DAYS=7  # Manter backups dos últimos 7 dias

# Criar diretório se não existir
mkdir -p "$BACKUP_DIR"

# Fazer backup
echo "🔄 Iniciando backup em $(date)..."
pg_dump "$DB_URL" | gzip > "$BACKUP_DIR/backup-$TIMESTAMP.sql.gz"

# Verificar se backup foi criado
if [ -f "$BACKUP_DIR/backup-$TIMESTAMP.sql.gz" ]; then
    SIZE=$(du -h "$BACKUP_DIR/backup-$TIMESTAMP.sql.gz" | cut -f1)
    echo "✅ Backup concluído: backup-$TIMESTAMP.sql.gz ($SIZE)"
else
    echo "❌ Erro ao criar backup!"
    exit 1
fi

# Manter apenas últimos N backups
echo "🗑️  Removendo backups antigos (mantendo últimos $KEEP_DAYS dias)..."
find "$BACKUP_DIR" -name "backup-*.sql.gz" -type f -mtime +$KEEP_DAYS -delete

# Listar backups disponíveis
echo "📊 Backups disponíveis:"
ls -lh "$BACKUP_DIR"/backup-*.sql.gz | tail -10

# Salvar log
echo "$(date): Backup criado - backup-$TIMESTAMP.sql.gz ($SIZE)" >> "$BACKUP_DIR/backup.log"

echo "✅ Processo concluído!"
EOF

chmod +x backup-db.sh

# Executar manualmente
./backup-db.sh

# Agendar com cron (diariamente às 2AM)
(crontab -l 2>/dev/null; echo "0 2 * * * $PWD/backup-db.sh >> $PWD/backup-db.log 2>&1") | crontab -

# Ver cron agendado
crontab -l
```

#### **3. Backup via Azure (Point-in-Time Restore)**

O Azure PostgreSQL Flexible Server possui backup automático.

```bash
# Ver configuração de backup
az postgres flexible-server show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --query "{BackupRetention:backup.backupRetentionDays, GeoRedundant:backup.geoRedundantBackup}" \
  -o table

# Listar backups disponíveis
az postgres flexible-server backup list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --output table

# Aumentar retenção de backup (se necessário)
az postgres flexible-server update \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --backup-retention 14  # 14 dias

# Habilitar backup geo-redundante (cópia em outra região)
az postgres flexible-server update \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --geo-redundant-backup Enabled
```

### 🔄 8.2 Restaurar Backup

#### **1. Restaurar de Backup Local**

```bash
# Restaurar backup completo (⚠️ sobrescreve dados atuais!)
gunzip -c backup-prod-20250112.sql.gz | \
  psql "postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require"

# Restaurar em banco local para testes
gunzip -c backup-prod-20250112.sql.gz | \
  psql -U postgres -d mapa_saas_dev

# Restaurar tabela específica
pg_restore --data-only --table=users backup-prod-20250112.sql.gz | \
  psql "postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require"
```

#### **2. Restaurar Point-in-Time (Azure)**

```bash
# Restaurar para um momento específico (últimos 7-35 dias)
# Isso cria um NOVO servidor com os dados do momento especificado

# Formato da data: YYYY-MM-DDTHH:MM:SSZ (UTC)
RESTORE_TIME="2025-01-12T10:00:00Z"

az postgres flexible-server restore \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-restored-$(date +%Y%m%d) \
  --source-server mapa-saas-db-1762971848 \
  --restore-time "$RESTORE_TIME"

# Aguardar conclusão (pode demorar vários minutos)
echo "⏳ Aguardando restauração..."

# Verificar novo servidor
az postgres flexible-server show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-restored-$(date +%Y%m%d)

# Após verificar os dados, você pode:
# 1. Apontar o app para o novo servidor (atualizar DATABASE_URL)
# 2. Ou migrar dados do servidor restaurado para o original
```

#### **3. Script de Restauração com Segurança**

```bash
cat > restore-db.sh << 'EOF'
#!/bin/bash

# Script seguro de restauração
set -e  # Parar em caso de erro

BACKUP_FILE="$1"
TARGET_DB="$2"

if [ -z "$BACKUP_FILE" ] || [ -z "$TARGET_DB" ]; then
    echo "Uso: ./restore-db.sh <arquivo-backup> <local|producao>"
    echo "Exemplo: ./restore-db.sh backup-20250112.sql.gz local"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Arquivo não encontrado: $BACKUP_FILE"
    exit 1
fi

# Definir URL do banco
case $TARGET_DB in
    local)
        DB_URL="postgresql://postgres:postgres@localhost:5432/mapa_saas_dev"
        ;;
    producao)
        DB_URL="postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require"
        echo "⚠️  ATENÇÃO: Você está prestes a restaurar em PRODUÇÃO!"
        read -p "Digite 'CONFIRMO' para continuar: " CONFIRM
        if [ "$CONFIRM" != "CONFIRMO" ]; then
            echo "❌ Operação cancelada"
            exit 1
        fi
        ;;
    *)
        echo "❌ Target inválido. Use 'local' ou 'producao'"
        exit 1
        ;;
esac

echo "🔄 Iniciando restauração..."
echo "  Backup: $BACKUP_FILE"
echo "  Target: $TARGET_DB"

# Fazer backup atual antes de restaurar (se produção)
if [ "$TARGET_DB" = "producao" ]; then
    echo "📦 Criando backup de segurança antes de restaurar..."
    SAFETY_BACKUP="safety-backup-$(date +%Y%m%d-%H%M%S).sql.gz"
    pg_dump "$DB_URL" | gzip > "$SAFETY_BACKUP"
    echo "✅ Backup de segurança criado: $SAFETY_BACKUP"
fi

# Restaurar
echo "🔄 Restaurando dados..."
gunzip -c "$BACKUP_FILE" | psql "$DB_URL"

echo "✅ Restauração concluída!"

# Testar conexão
echo "🔍 Testando conexão..."
psql "$DB_URL" -c "SELECT COUNT(*) FROM users;" && echo "✅ Teste OK"

echo "🎉 Processo concluído com sucesso!"
EOF

chmod +x restore-db.sh

# Usar
./restore-db.sh backup-20250112.sql.gz local
```

### 📁 8.3 Backup de Arquivos (uploads/reports)

```bash
# Baixar todos os arquivos do Web App via Kudu API

# Obter credenciais de deployment
CREDS=$(az webapp deployment list-publishing-credentials \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query "{user:publishingUserName, pass:publishingPassword}" -o json)

USER=$(echo $CREDS | jq -r .user)
PASS=$(echo $CREDS | jq -r .pass)

# Baixar uploads
curl -u "$USER:$PASS" \
  "https://mapa-saas-app-1762971490.scm.azurewebsites.net/api/zip/site/wwwroot/uploads/" \
  -o backups/uploads-$(date +%Y%m%d).zip

# Baixar reports
curl -u "$USER:$PASS" \
  "https://mapa-saas-app-1762971490.scm.azurewebsites.net/api/zip/site/wwwroot/reports/" \
  -o backups/reports-$(date +%Y%m%d).zip

echo "✅ Backup de arquivos concluído!"
ls -lh backups/
```

#### **Script de Backup de Arquivos:**

```bash
cat > backup-files.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="$HOME/backups/mapa-saas-files"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

# Obter credenciais
CREDS=$(az webapp deployment list-publishing-credentials \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query "{user:publishingUserName, pass:publishingPassword}" -o json)

USER=$(echo $CREDS | jq -r .user)
PASS=$(echo $CREDS | jq -r .pass)

echo "📥 Baixando arquivos..."

# Baixar uploads
curl -s -u "$USER:$PASS" \
  "https://mapa-saas-app-1762971490.scm.azurewebsites.net/api/zip/site/wwwroot/uploads/" \
  -o "$BACKUP_DIR/uploads-$TIMESTAMP.zip"

# Baixar reports
curl -s -u "$USER:$PASS" \
  "https://mapa-saas-app-1762971490.scm.azurewebsites.net/api/zip/site/wwwroot/reports/" \
  -o "$BACKUP_DIR/reports-$TIMESTAMP.zip"

echo "✅ Backup de arquivos concluído!"
ls -lh "$BACKUP_DIR"/*-$TIMESTAMP.zip

# Manter apenas últimos 7 dias
find "$BACKUP_DIR" -name "*.zip" -type f -mtime +7 -delete
EOF

chmod +x backup-files.sh
./backup-files.sh
```

### 🔄 8.4 Restaurar Arquivos

```bash
# Extrair backup de uploads
unzip backups/uploads-20250112.zip -d temp-uploads

# Enviar via Kudu (método 1: via API)
cd temp-uploads
for file in *; do
    curl -u "$USER:$PASS" \
      -T "$file" \
      "https://mapa-saas-app-1762971490.scm.azurewebsites.net/api/vfs/site/wwwroot/uploads/$file"
done

# OU via SFTP/SCP (método 2: se habilitado)
# scp -r temp-uploads/* user@mapa-saas-app-1762971490.scm.azurewebsites.net:/site/wwwroot/uploads/
```

### 📋 8.5 Estratégia de Backup Completa

**Recomendação de frequência:**

| Tipo | Frequência | Retenção | Método |
|------|-----------|----------|--------|
| **Banco de Dados** | Diário (2AM) | 7 dias local, 35 dias Azure | pg_dump + Azure automatic |
| **Arquivos (uploads)** | Semanal (Domingo) | 30 dias | Kudu API download |
| **Arquivos (reports)** | Semanal (Domingo) | 30 dias | Kudu API download |
| **Configurações (App Settings)** | Após mudanças | Versionado no Git | Export JSON |
| **Código-fonte** | Contínuo | Ilimitado | Git + GitHub/Azure DevOps |

**Script master de backup:**

```bash
cat > backup-all.sh << 'EOF'
#!/bin/bash

echo "🔄 BACKUP COMPLETO MAPA SAAS - $(date)"
echo "================================================"

BACKUP_ROOT="$HOME/backups/mapa-saas"
DATE=$(date +%Y%m%d)

mkdir -p "$BACKUP_ROOT/$DATE"

# 1. Backup do banco de dados
echo "1️⃣  Backup do banco de dados..."
./backup-db.sh

# 2. Backup de arquivos
echo "2️⃣  Backup de arquivos..."
./backup-files.sh

# 3. Exportar App Settings
echo "3️⃣  Exportar configurações..."
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  > "$BACKUP_ROOT/$DATE/app-settings.json"

# 4. Exportar configuração do banco
echo "4️⃣  Exportar configuração do banco..."
az postgres flexible-server show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  > "$BACKUP_ROOT/$DATE/db-config.json"

# 5. Criar arquivo de inventário
echo "5️⃣  Criar inventário..."
cat > "$BACKUP_ROOT/$DATE/inventory.txt" << INVENTORY
BACKUP COMPLETO - $(date)
================================================

Banco de Dados:
- Backup: $(ls -lh $HOME/backups/mapa-saas/backup-*.sql.gz | tail -1)

Arquivos:
- Uploads: $(ls -lh $HOME/backups/mapa-saas-files/uploads-*.zip | tail -1)
- Reports: $(ls -lh $HOME/backups/mapa-saas-files/reports-*.zip | tail -1)

Configurações:
- App Settings: $BACKUP_ROOT/$DATE/app-settings.json
- DB Config: $BACKUP_ROOT/$DATE/db-config.json

Estado dos Recursos:
- Web App: $(az webapp show -g mapa-saas-rg -n mapa-saas-app-1762971490 --query state -o tsv)
- Database: $(az postgres flexible-server show -g mapa-saas-rg -n mapa-saas-db-1762971848 --query state -o tsv)
INVENTORY

echo "✅ Backup completo concluído!"
echo "📁 Localização: $BACKUP_ROOT/$DATE/"
ls -lh "$BACKUP_ROOT/$DATE/"
EOF

chmod +x backup-all.sh
```

---

## IX. Segurança e Boas Práticas

### 🔒 9.1 Segurança do Banco de Dados

#### **1. Rotação de Senhas**

```bash
# Rotacionar senha a cada 90 dias (recomendado)

# Gerar senha forte
NOVA_SENHA=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
echo "Nova senha gerada: $NOVA_SENHA"

# Ou usar Python
NOVA_SENHA=$(python3 -c 'import secrets; print(secrets.token_urlsafe(16))')

# Atualizar no Azure
az postgres flexible-server update \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --admin-password "$NOVA_SENHA"

# Atualizar no Web App
DB_HOST="mapa-saas-db-1762971848.postgres.database.azure.com"
DATABASE_URL="postgresql://mapaadmin:${NOVA_SENHA}@${DB_HOST}:5432/mapa_saas?sslmode=require"

az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --settings DATABASE_URL="$DATABASE_URL"

az webapp restart --resource-group mapa-saas-rg --name mapa-saas-app-1762971490

# Salvar em gerenciador de senhas
echo "$NOVA_SENHA" > .db-password-$(date +%Y%m%d).txt
echo "⚠️  Salve esta senha em local seguro e delete o arquivo!"
```

#### **2. Configurar Auditoria (Audit Logs)**

```bash
# Habilitar extensão pgaudit
az postgres flexible-server parameter set \
  --resource-group mapa-saas-rg \
  --server-name mapa-saas-db-1762971848 \
  --name pgaudit.log \
  --value "READ,WRITE,DDL"

# Configurar log de conexões
az postgres flexible-server parameter set \
  --resource-group mapa-saas-rg \
  --server-name mapa-saas-db-1762971848 \
  --name log_connections \
  --value "on"

# Configurar log de desconexões
az postgres flexible-server parameter set \
  --resource-group mapa-saas-rg \
  --server-name mapa-saas-db-1762971848 \
  --name log_disconnections \
  --value "on"

# Ver logs de auditoria
az monitor log-analytics query \
  --workspace [WORKSPACE_ID] \
  --analytics-query "AzureDiagnostics | where ResourceProvider == 'MICROSOFT.DBFORPOSTGRESQL' | limit 100"
```

#### **3. Restringir Acesso por IP (Firewall)**

```bash
# Listar regras atuais
az postgres flexible-server firewall-rule list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --output table

# Remover regra muito permissiva
az postgres flexible-server firewall-rule delete \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --rule-name "AllowAll" \
  --yes

# Adicionar apenas IPs específicos
# IP do escritório
az postgres flexible-server firewall-rule create \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --rule-name "Office-IP" \
  --start-ip-address 203.0.113.10 \
  --end-ip-address 203.0.113.10

# Permitir acesso apenas do Azure (App Service)
az postgres flexible-server firewall-rule create \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --rule-name "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

#### **4. Criptografia em Trânsito (SSL)**

```bash
# Verificar SSL obrigatório
az postgres flexible-server show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --query sslEnforcement

# Forçar SSL (se não estiver)
az postgres flexible-server update \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --ssl-enforcement Enabled

# Verificar DATABASE_URL tem ?sslmode=require
echo $DATABASE_URL | grep "sslmode=require" && echo "✅ SSL OK" || echo "❌ SSL não configurado!"
```

### 🛡️ 9.2 Segurança da Aplicação

#### **1. Rotacionar SECRET_KEY**

```bash
# Gerar nova SECRET_KEY
NOVA_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
echo "Nova SECRET_KEY: $NOVA_SECRET"

# Atualizar no Azure
az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --settings SECRET_KEY="$NOVA_SECRET"

# ⚠️ ATENÇÃO: Isso invalida todos os tokens JWT ativos
# Todos os usuários precisarão fazer login novamente

az webapp restart --resource-group mapa-saas-rg --name mapa-saas-app-1762971490

echo "✅ SECRET_KEY rotacionada"
echo "⚠️  Usuários precisarão fazer login novamente"
```

#### **2. Forçar HTTPS**

```bash
# Forçar HTTPS (redirecionar HTTP → HTTPS)
az webapp update \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --https-only true

# Verificar
az webapp show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query httpsOnly

# Deve retornar: true
```

#### **3. Configurar Headers de Segurança**

Adicionar no código (`app/main.py`):

```python
from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Middleware de host confiável
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "mapa-saas-app-1762971490.azurewebsites.net",
        "localhost",
        "127.0.0.1"
    ]
)

# Headers de segurança
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    
    # Prevenir MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # Prevenir clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    
    # XSS Protection
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # HSTS (HTTP Strict Transport Security)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    # Content Security Policy
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    
    # Referrer Policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Permissions Policy
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    return response
```

#### **4. Implementar Rate Limiting**

Instalar dependência:

```bash
pip install slowapi
```

Configurar em `app/main.py`:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Criar limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Aplicar em rotas sensíveis
@app.post("/api/admin/auth/login")
@limiter.limit("5/minute")  # Máximo 5 tentativas por minuto
async def login(request: Request, credentials: LoginRequest):
    ...

@app.post("/api/user/upload-xml")
@limiter.limit("10/hour")  # Máximo 10 uploads por hora
async def upload_xml(request: Request, file: UploadFile):
    ...
```

#### **5. Validação de Entrada Robusta**

Garantir validação com Pydantic:

```python
from pydantic import BaseModel, EmailStr, constr, validator
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr  # Validação automática de email
    full_name: constr(min_length=2, max_length=100)  # String com limites
    password: constr(min_length=8, max_length=100)
    company_name: Optional[constr(max_length=255)]
    
    @validator('password')
    def validate_password_strength(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError('Senha deve conter pelo menos um número')
        if not any(char.isupper() for char in v):
            raise ValueError('Senha deve conter pelo menos uma letra maiúscula')
        if not any(char.islower() for char in v):
            raise ValueError('Senha deve conter pelo menos uma letra minúscula')
        return v

class XMLUploadResponse(BaseModel):
    id: int
    filename: constr(max_length=255)
    status: str
    upload_date: datetime
    
    class Config:
        from_attributes = True  # ORM mode
```

#### **6. Sanitizar Upload de Arquivos**

```python
import os
from fastapi import UploadFile, HTTPException

ALLOWED_EXTENSIONS = {'.xml', '.pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def validate_upload(file: UploadFile):
    # Verificar extensão
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo não permitido. Permitidos: {ALLOWED_EXTENSIONS}"
        )
    
    # Verificar tamanho
    content = await file.read()
    await file.seek(0)  # Reset para ler novamente
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Arquivo muito grande. Máximo: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Sanitizar nome do arquivo
    import re
    safe_filename = re.sub(r'[^a-zA-Z0-9._-]', '', file.filename)
    
    return safe_filename
```

### 🔑 9.3 Gerenciamento de Secrets com Azure Key Vault

```bash
# 1. Criar Key Vault
az keyvault create \
  --name mapa-saas-keyvault \
  --resource-group mapa-saas-rg \
  --location brazilsouth

# 2. Adicionar secrets
az keyvault secret set \
  --vault-name mapa-saas-keyvault \
  --name "db-password" \
  --value "NovaSenha12345!"

az keyvault secret set \
  --vault-name mapa-saas-keyvault \
  --name "secret-key" \
  --value "$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"

# 3. Habilitar Managed Identity no Web App
az webapp identity assign \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490

# 4. Obter Principal ID
IDENTITY=$(az webapp identity show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query principalId -o tsv)

# 5. Dar permissão ao Web App para acessar Key Vault
az keyvault set-policy \
  --name mapa-saas-keyvault \
  --object-id $IDENTITY \
  --secret-permissions get list

# 6. Referenciar secrets no App Settings
az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --settings \
    DB_PASSWORD="@Microsoft.KeyVault(SecretUri=https://mapa-saas-keyvault.vault.azure.net/secrets/db-password/)" \
    SECRET_KEY="@Microsoft.KeyVault(SecretUri=https://mapa-saas-keyvault.vault.azure.net/secrets/secret-key/)"

# 7. Verificar
az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query "[?name=='DB_PASSWORD' || name=='SECRET_KEY']"
```

### 📋 9.4 Checklist de Segurança

```bash
# Script de verificação de segurança
cat > security-check.sh << 'EOF'
#!/bin/bash

echo "🔒 CHECKLIST DE SEGURANÇA - MAPA SAAS"
echo "================================================"

RESOURCE_GROUP="mapa-saas-rg"
WEB_APP="mapa-saas-app-1762971490"
DB_SERVER="mapa

-saas-db-1762971848"

# 1. Verificar DEBUG=False
echo "1️⃣  Verificando DEBUG..."
DEBUG=$(az webapp config appsettings list \
  -g $RESOURCE_GROUP \
  -n $WEB_APP \
  --query "[?name=='DEBUG'].value" -o tsv)

if [ "$DEBUG" = "False" ]; then
    echo "   ✅ DEBUG está False"
else
    echo "   ❌ DEBUG está True - PERIGO EM PRODUÇÃO!"
fi

# 2. Verificar HTTPS forçado
echo "2️⃣  Verificando HTTPS..."
HTTPS=$(az webapp show \
  -g $RESOURCE_GROUP \
  -n $WEB_APP \
  --query httpsOnly -o tsv)

if [ "$HTTPS" = "true" ]; then
    echo "   ✅ HTTPS forçado"
else
    echo "   ⚠️  HTTPS não forçado"
fi

# 3. Verificar SECRET_KEY tem tamanho adequado
echo "3️⃣  Verificando SECRET_KEY..."
SECRET=$(az webapp config appsettings list \
  -g $RESOURCE_GROUP \
  -n $WEB_APP \
  --query "[?name=='SECRET_KEY'].value" -o tsv)

if [[ ${#SECRET} -ge 32 ]]; then
    echo "   ✅ SECRET_KEY tem tamanho adequado (${#SECRET} caracteres)"
else
    echo "   ❌ SECRET_KEY muito curta! (${#SECRET} caracteres)"
fi

# 4. Verificar SSL no PostgreSQL
echo "4️⃣  Verificando SSL do PostgreSQL..."
DB_URL=$(az webapp config appsettings list \
  -g $RESOURCE_GROUP \
  -n $WEB_APP \
  --query "[?name=='DATABASE_URL'].value" -o tsv)

if [[ $DB_URL == *"sslmode=require"* ]]; then
    echo "   ✅ SSL obrigatório no PostgreSQL"
else
    echo "   ❌ SSL não configurado no PostgreSQL!"
fi

# 5. Verificar firewall do PostgreSQL
echo "5️⃣  Verificando firewall do PostgreSQL..."
RULES_COUNT=$(az postgres flexible-server firewall-rule list \
  -g $RESOURCE_GROUP \
  -n $DB_SERVER \
  --query "length(@)")

echo "   📋 Regras de firewall: $RULES_COUNT"

# Verificar se tem regra 0.0.0.0-255.255.255.255 (muito permissiva)
OPEN_RULES=$(az postgres flexible-server firewall-rule list \
  -g $RESOURCE_GROUP \
  -n $DB_SERVER \
  --query "[?startIpAddress=='0.0.0.0' && endIpAddress=='255.255.255.255'].name" -o tsv)

if [ -n "$OPEN_RULES" ]; then
    echo "   ⚠️  Regras muito permissivas encontradas: $OPEN_RULES"
else
    echo "   ✅ Sem regras excessivamente permissivas"
fi

# 6. Verificar backup do banco
echo "6️⃣  Verificando configuração de backup..."
BACKUP_RETENTION=$(az postgres flexible-server show \
  -g $RESOURCE_GROUP \
  -n $DB_SERVER \
  --query backup.backupRetentionDays -o tsv)

echo "   📅 Retenção de backup: $BACKUP_RETENTION dias"

if [ "$BACKUP_RETENTION" -ge 7 ]; then
    echo "   ✅ Retenção adequada"
else
    echo "   ⚠️  Considere aumentar retenção para 7+ dias"
fi

# 7. Verificar versão do Python
echo "7️⃣  Verificando versão do Python..."
PYTHON_VERSION=$(az webapp config show \
  -g $RESOURCE_GROUP \
  -n $WEB_APP \
  --query linuxFxVersion -o tsv)

echo "   🐍 Runtime: $PYTHON_VERSION"

# 8. Verificar alertas configurados
echo "8️⃣  Verificando alertas..."
ALERTS_COUNT=$(az monitor metrics alert list \
  -g $RESOURCE_GROUP \
  --query "length(@)")

echo "   🔔 Alertas configurados: $ALERTS_COUNT"

if [ "$ALERTS_COUNT" -ge 3 ]; then
    echo "   ✅ Alertas configurados"
else
    echo "   ⚠️  Poucos alertas configurados. Considere adicionar mais."
fi

# 9. Verificar logs habilitados
echo "9️⃣  Verificando logs..."
LOGGING=$(az webapp log config show \
  -g $RESOURCE_GROUP \
  -n $WEB_APP \
  --query applicationLogs.fileSystem.level -o tsv)

echo "   📋 Nível de log: $LOGGING"

if [ "$LOGGING" != "Off" ]; then
    echo "   ✅ Logging habilitado"
else
    echo "   ⚠️  Logging desabilitado"
fi

# 10. Verificar idade da última senha do DB (se tiver histórico)
echo "🔟 Verificando rotação de senha..."
if [ -f ".db-password-history.txt" ]; then
    LAST_ROTATION=$(tail -1 .db-password-history.txt | cut -d: -f1)
    DAYS_AGO=$(( ($(date +%s) - $(date -d "$LAST_ROTATION" +%s)) / 86400 ))
    
    echo "   📅 Última rotação: $DAYS_AGO dias atrás"
    
    if [ $DAYS_AGO -le 90 ]; then
        echo "   ✅ Senha rotacionada recentemente"
    else
        echo "   ⚠️  Senha não rotacionada há mais de 90 dias!"
    fi
else
    echo "   ℹ️  Histórico de rotação não encontrado"
fi

# Resumo
echo ""
echo "================================================"
echo "✅ Checklist de segurança concluído!"
echo "================================================"
EOF

chmod +x security-check.sh
./security-check.sh
```

### 🔐 9.5 Boas Práticas de Código

#### **1. Tratamento de Erros Robusto**

```python
# app/main.py
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Exceções customizadas
class MapaSaaSException(Exception):
    """Exceção base da aplicação"""
    pass

class DatabaseError(MapaSaaSException):
    """Erro de banco de dados"""
    pass

class ValidationError(MapaSaaSException):
    """Erro de validação"""
    pass

class ProcessingError(MapaSaaSException):
    """Erro no processamento de arquivo"""
    pass

# Exception handlers globais
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Erro no banco de dados. Tente novamente mais tarde.",
            "error_type": "database_error"
        }
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": str(exc),
            "error_type": "validation_error"
        }
    )

@app.exception_handler(ProcessingError)
async def processing_exception_handler(request: Request, exc: ProcessingError):
    logger.error(f"Processing error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Erro ao processar arquivo. Verifique o formato.",
            "error_type": "processing_error"
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.critical(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Erro interno do servidor. Contate o suporte.",
            "error_type": "internal_error"
        }
    )
```

#### **2. Logging Estruturado**

```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

# Configurar em app/main.py
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())

logger = logging.getLogger("mapa_saas")
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Usar
logger.info("Usuário fez login", extra={"user_id": user.id, "email": user.email})
logger.error("Erro ao processar XML", extra={"filename": filename, "error": str(e)})
```

#### **3. Validação de Dependências**

```bash
# Verificar vulnerabilidades de segurança
pip install safety
safety check -r requirements.txt

# Verificar dependências desatualizadas
pip list --outdated

# Atualizar com segurança (teste antes!)
pip install --upgrade fastapi uvicorn sqlalchemy

# Fixar versões exatas (produção)
pip freeze > requirements.txt
```

### 📝 9.6 Compliance e Auditoria

#### **1. Registrar Ações de Usuários**

```python
# app/models.py
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(50))  # login, upload, download, etc
    resource_type = Column(String(50))  # xml, report, user
    resource_id = Column(Integer)
    details = Column(JSONB)  # Informações adicionais
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")

# app/utils/audit.py
from app.models import AuditLog
from app.database import SessionLocal
from fastapi import Request

def log_audit(
    user_id: int,
    action: str,
    resource_type: str,
    resource_id: int = None,
    details: dict = None,
    request: Request = None
):
    db = SessionLocal()
    try:
        audit = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=request.client.host if request else None,
            user_agent=request.headers.get("user-agent") if request else None
        )
        db.add(audit)
        db.commit()
    except Exception as e:
        logger.error(f"Erro ao registrar auditoria: {e}")
    finally:
        db.close()

# Usar nas rotas
@app.post("/api/user/upload-xml")
async def upload_xml(
    request: Request,
    file: UploadFile,
    current_user: User = Depends(get_current_user)
):
    # ... processar upload
    
    log_audit(
        user_id=current_user.id,
        action="upload_xml",
        resource_type="xml_upload",
        resource_id=upload.id,
        details={"filename": file.filename, "size": file.size},
        request=request
    )
    
    return {"status": "success"}
```

#### **2. LGPD - Proteção de Dados Pessoais**

```python
# app/routers/user.py
from datetime import datetime, timedelta

@router.post("/request-data-export")
async def request_data_export(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database)
):
    """Exportar todos os dados do usuário (LGPD Art. 18, IX)"""
    
    # Dados do usuário
    user_data = {
        "user": {
            "email": current_user.email,
            "full_name": current_user.full_name,
            "company_name": current_user.company_name,
            "created_at": current_user.created_at.isoformat()
        }
    }
    
    # XMLs enviados
    uploads = db.query(XMLUpload).filter(
        XMLUpload.user_id == current_user.id
    ).all()
    
    user_data["uploads"] = [
        {
            "filename": u.filename,
            "upload_date": u.upload_date.isoformat(),
            "status": u.status
        }
        for u in uploads
    ]
    
    # Relatórios gerados
    reports = db.query(Report).filter(
        Report.user_id == current_user.id
    ).all()
    
    user_data["reports"] = [
        {
            "period": r.report_period,
            "generated_date": r.generated_date.isoformat()
        }
        for r in reports
    ]
    
    return JSONResponse(content=user_data)

@router.delete("/delete-account")
async def delete_account(
    password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database)
):
    """Deletar conta e todos os dados (LGPD Art. 18, VI)"""
    
    # Verificar senha
    if not verify_password(password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Senha incorreta")
    
    # Deletar uploads físicos
    uploads = db.query(XMLUpload).filter(XMLUpload.user_id == current_user.id).all()
    for upload in uploads:
        if os.path.exists(upload.file_path):
            os.remove(upload.file_path)
    
    # Deletar relatórios físicos
    reports = db.query(Report).filter(Report.user_id == current_user.id).all()
    for report in reports:
        if os.path.exists(report.file_path):
            os.remove(report.file_path)
    
    # Deletar do banco (cascade deletará uploads e reports)
    db.delete(current_user)
    db.commit()
    
    log_audit(
        user_id=current_user.id,
        action="account_deleted",
        resource_type="user",
        resource_id=current_user.id,
        details={"email": current_user.email}
    )
    
    return {"message": "Conta e todos os dados deletados com sucesso"}
```

### 🔒 9.7 Política de Senha Segura

```python
# app/auth.py
import re
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Valida força da senha.
    Retorna (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Senha deve ter no mínimo 8 caracteres"
    
    if len(password) > 100:
        return False, "Senha muito longa (máximo 100 caracteres)"
    
    if not re.search(r"[a-z]", password):
        return False, "Senha deve conter pelo menos uma letra minúscula"
    
    if not re.search(r"[A-Z]", password):
        return False, "Senha deve conter pelo menos uma letra maiúscula"
    
    if not re.search(r"\d", password):
        return False, "Senha deve conter pelo menos um número"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Senha deve conter pelo menos um caractere especial"
    
    # Verificar senhas comuns
    common_passwords = [
        "password", "123456", "12345678", "qwerty",
        "abc123", "password123", "admin", "letmein"
    ]
    
    if password.lower() in common_passwords:
        return False, "Senha muito comum. Escolha outra."
    
    return True, ""

def get_password_hash(password: str) -> str:
    is_valid, error = validate_password_strength(password)
    if not is_valid:
        raise ValueError(error)
    
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

 
from fastapi.responses import StreamingResponse
import io

@router.get("/api/user/download-report/{report_id}")
async def download_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_database)
):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")
    
    # Streaming ao invés de carregar tudo na memória
    def file_iterator():
        with open(report.file_path, 'rb') as f:
            while chunk := f.read(8192):  # 8KB por vez
                yield chunk
    
    return StreamingResponse(
        file_iterator(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={os.path.basename(report.file_path)}"
        }
    )

# 4. Índices no banco para queries mais rápidas (reduz CPU)
# Já mostrado na seção V.1, mas reforçando:
# CREATE INDEX idx_xml_uploads_user_status ON xml_uploads(user_id, status);
# CREATE INDEX idx_reports_user_period ON reports(user_id, report_period);

# 5. Lazy loading de relacionamentos
from sqlalchemy.orm import lazyload

# Ao invés de carregar tudo:
user = db.query(User).filter(User.id == user_id).first()
uploads = user.xml_uploads  # Carrega todos os uploads

# Use lazy loading quando não precisar dos dados:
user = db.query(User).options(lazyload(User.xml_uploads)).filter(User.id == user_id).first()
```

---

## XII. Procedimentos de Emergência

### 🚨 12.1 App Está Completamente Offline

**Checklist de Recuperação:**

```bash
# PASSO 1: Verificar estado dos recursos
echo "🔍 Verificando estado..."

APP_STATE=$(az webapp show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query state -o tsv)

DB_STATE=$(az postgres flexible-server show \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db-1762971848 \
  --query state -o tsv)

echo "App: $APP_STATE"
echo "DB: $DB_STATE"

# PASSO 2: Iniciar recursos se necessário
if [ "$APP_STATE" != "Running" ]; then
    echo "⚠️  App não está rodando. Iniciando..."
    az webapp start --resource-group mapa-saas-rg --name mapa-saas-app-1762971490
fi

if [ "$DB_STATE" != "Ready" ]; then
    echo "⚠️  Banco não está pronto. Iniciando..."
    az postgres flexible-server start \
      --resource-group mapa-saas-rg \
      --name mapa-saas-db-1762971848
    
    echo "⏳ Aguardando banco inicializar (60s)..."
    sleep 60
fi

# PASSO 3: Verificar logs para erro crítico
echo "📋 Verificando últimos logs..."
az webapp log tail \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --limit 50

# PASSO 4: Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
az webapp restart --resource-group mapa-saas-rg --name mapa-saas-app-1762971490

# PASSO 5: Aguardar e testar
echo "⏳ Aguardando 30s..."
sleep 30

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://mapa-saas-app-1762971490.azurewebsites.net/health)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ App recuperado com sucesso!"
else
    echo "❌ App ainda com problemas. HTTP Code: $HTTP_CODE"
    echo "🚨 AÇÃO NECESSÁRIA:"
    echo "1. Acesse Kudu: https://mapa-saas-app-1762971490.scm.azurewebsites.net"
    echo "2. Verifique Process Explorer"
    echo "3. Verifique variáveis de ambiente"
    echo "4. Considere rollback para versão anterior"
fi
```

### 💥 12.2 Banco de Dados Corrompido ou Inacessível

```bash
# PROCEDIMENTO DE EMERGÊNCIA - BANCO DE DADOS

# PASSO 1: Parar aplicação para evitar mais danos
echo "🛑 Parando aplicação..."
az webapp stop --resource-group mapa-saas-rg --name mapa-saas-app-1762971490

# PASSO 2: Fazer backup emergencial (se possível)
echo "📦 Tentando backup emergencial..."
DB_URL=$(az webapp config appsettings list \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app-1762971490 \
  --query "[?name=='DATABASE_URL'].value" -o tsv)

pg_dump "$DB_URL" 2>/dev/null | gzip > "emergency-backup-$(date +%Y%m%d-%H%M%S).sql.gz"

if [ $? -eq 0 ]; then
    echo "✅ Backup emergencial criado"
else
    echo "❌ Não foi possível fazer backup (banco pode estar corrompido)"
fi

# PASSO 3: Verificar integridade do banco
echo "🔍 Verificando integridade..."
psql "$DB_URL" -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) FROM pg_database;" 2>&1

# PASSO 4: Decidir ação
echo ""
echo "OPÇÕES DE RECUPERAÇÃO:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "A) Restaurar do backup automático do Azure (Point-in-Time)"
echo "B) Restaurar do último backup manual"
echo "C) Tentar reparar banco atual"
echo "D) Criar novo banco e migrar dados"
echo ""
read -p "Escolha uma opção (A/B/C/D): " OPTION

case $OPTION in
    A)
        echo "Restaurando via Point-in-Time..."
        read -p "Digite o timestamp (YYYY-MM-DDTHH:MM:SSZ): " RESTORE_TIME
        
        az postgres flexible-server restore \
          --resource-group mapa-saas-rg \
          --name mapa-saas-db-emergency-$(date +%Y%m%d) \
          --source-server mapa-saas-db-1762971848 \
          --restore-time "$RESTORE_TIME"
        
        echo "⏳ Aguardando restauração (isso pode levar vários minutos)..."
        ;;
    
    B)
        echo "Restaurando do backup manual..."
        read -p "Digite o caminho do backup: " BACKUP_FILE
        
        if [ -f "$BACKUP_FILE" ]; then
            gunzip -c "$BACKUP_FILE" | psql "$DB_URL"
            echo "✅ Restauração concluída"
        else
            echo "❌ Arquivo não encontrado"
        fi
        ;;
    
    C)
        echo "Tentando reparar banco..."
        psql "$DB_URL" << 'EOF'
VACUUM FULL;
REINDEX DATABASE mapa_saas;
ANALYZE;
EOF
        echo "✅ Comandos de reparo executados"
        ;;
    
    D)
        echo "⚠️  Esta operação requer intervenção manual avançada"
        echo "Contate o suporte ou DBA"
        ;;
esac

# PASSO 5: Testar banco restaurado
echo "🔍 Testando banco..."
psql "$DB_URL" -c "SELECT COUNT(*) FROM users;"

if [ $? -eq 0 ]; then
    echo "✅ Banco operacional"
    
    # Reiniciar app
    echo "🔄 Reiniciando aplicação..."
    az webapp start --resource-group mapa-saas-rg --name mapa-saas-app-1762971490
    az webapp restart --resource-group mapa-saas-rg --name mapa-saas-app-1762971490
else
    echo "❌ Banco ainda com problemas"
fi
```

### 🔓 12.3 Perda de Acesso Admin

```bash
# RECUPERAR ACESSO ADMIN

# MÉTODO 1: Via WebSSH (Kudu)
echo "🔑 Recuperação de Acesso Admin via WebSSH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Acesse: https://mapa-saas-app-1762971490.scm.azurewebsites.net/webssh/host"
echo "2. Execute os comandos abaixo no terminal:"
echo ""

cat << 'EOF'
cd /home/site/wwwroot

python3 << END
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

db = SessionLocal()

# Resetar senha do admin existente
admin_email = "rhyan.hdr@gmail.com"
nova_senha = "NovaSenhaEmergencial2025!"

admin = db.query(User).filter(User.email == admin_email).first()

if admin:
    admin.hashed_password = get_password_hash(nova_senha)
    admin.is_active = True
    db.commit()
    print(f"✅ Senha resetada para: {admin_email}")
    print(f"Nova senha: {nova_senha}")
else:
    print(f"❌ Admin não encontrado: {admin_email}")
    
    # Criar novo admin se não existir
    print("Criando novo admin...")
    new_admin = User(
        email=admin_email,
        full_name="Admin Emergencial",
        hashed_password=get_password_hash(nova_senha),
        is_admin=True,
        is_active=True,
        company_name="Sistema"
    )
    db.add(new_admin)
    db.commit()
    print(f"✅ Novo admin criado")
    print(f"Email: {admin_email}")
    print(f"Senha: {nova_senha}")

db.close()
END
EOF

echo ""
echo "3. Copie a nova senha e faça login"

# MÉTODO 2: Via conexão direta ao banco (se tiver acesso)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "MÉTODO 2: Via PostgreSQL direto"
echo ""

cat << 'EOF'
# Gerar hash bcrypt da nova senha
python3 -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); print(pwd_context.hash('NovaSenhaEmergencial2025!'))"

# Copie o hash gerado e execute no psql:
psql "postgresql://mapaadmin:NovaSenha12345!@mapa-saas-db-1762971848.postgres.database.azure.com:5432/mapa_saas?sslmode=require"

# No psql:
UPDATE users 
SET hashed_password = '[COLE_O_HASH_AQUI]', 
    is_active = true 
WHERE email = 'rhyan.hdr@gmail.com';

SELECT email, is_admin, is_active FROM users WHERE email = 'rhyan.hdr@gmail.com';
\q
EOF
```

### 📞 12.4 Contatos e Recursos de Emergência

| Situação | Recurso | Ação |
|----------|---------|------|
| **Problema no Azure** | Portal Azure | https://portal.azure.com → Support → New Support Request |
| **Status do Azure** | Azure Status | https://status.azure.com/en-us/status |
| **Docs Técnicos** | Microsoft Docs | https://docs.microsoft.com/azure/ |
| **Comunidade** | Stack Overflow | https://stackoverflow.com/questions/tagged/azure |
| **Suporte FastAPI** | FastAPI Docs | https://fastapi.tiangolo.com/ |
| **Suporte PostgreSQL** | PostgreSQL Docs | https://www.postgresql.org/docs/ |
| **Incidente Crítico** | Telefone Azure | Disponível no portal (Support Plans) |

### 🔴 12.5 Plano de Contingência - Disaster Recovery

```bash
# PLANO DE DISASTER RECOVERY COMPLETO

cat > disaster-recovery-plan.md << 'EOF'
# 🚨 Plano de Disaster Recovery - MAPA SaaS

## Nível 1: Aplicação Offline (RTO: 30 min)

**Sintomas:**
- App não responde (500, 502, 503)
- Timeout em todas as requisições

**Ações:**
1. Verificar status: `./diagnose-full.sh`
2. Reiniciar app: `az webapp restart -g mapa-saas-rg -n mapa-saas-app-1762971490`
3. Se não resolver: `./emergency-recover.sh`
4. Escalar para Nível 2 se não resolver em 15 min

**Responsável:** DevOps / Admin do Sistema

---

## Nível 2: Banco de Dados Inacessível (RTO: 1 hora)

**Sintomas:**
- Erros de conexão com banco
- "database connection failed"

**Ações:**
1. Verificar estado do DB
2. Iniciar DB se parado
3. Verificar firewall
4. Restaurar de Point-in-Time se necessário
5. Escalar para Nível 3 se dados corrompidos

**Responsável:** DBA / DevOps

---

## Nível 3: Perda de Dados (RTO: 4 horas)

**Sintomas:**
- Banco corrompido
- Dados inconsistentes
- Falha em queries

**Ações:**
1. Parar aplicação imediatamente
2. Fazer backup emergencial
3. Restaurar último backup válido
4. Validar integridade dos dados
5. Notificar stakeholders

**Responsável:** DBA + Tech Lead

---

## Nível 4: Desastre Completo (RTO: 8 horas)

**Sintomas:**
- Grupo de recursos deletado
- Múltiplos recursos offline
- Perda catastrófica

**Ações:**
1. Ativar plano de continuidade
2. Recriar infraestrutura do zero
3. Restaurar backups externos
4. Validar sistema completo
5. Comunicar usuários

**Responsável:** Tech Lead + Management

---

## Backups Necessários

- **Diário:** Banco de dados (automático Azure + manual)
- **Semanal:** Arquivos (uploads/reports)
- **Mensal:** Configurações completas
- **Após mudanças:** Código-fonte (Git)

## Testes de DR

- **Mensal:** Teste de restore de backup
- **Trimestral:** Simulação de desastre completo
- **Anual:** Auditoria de plano de DR

EOF

cat disaster-recovery-plan.md
```

---

## XIII. Apêndices

### 📚 13.1 Glossário de Termos

| Termo | Significado | Contexto |
|-------|-------------|----------|
| **MAPA** | Ministério da Agricultura, Pecuária e Abastecimento | Órgão regulador |
| **NF-e** | Nota Fiscal Eletrônica | Documento fiscal XML |
| **DANFE** | Documento Auxiliar da NF-e | Versão impressa da NF-e (PDF) |
| **RG** | Resource Group | Grupo de recursos Azure |
| **SKU** | Stock Keeping Unit | Plano/Tier de serviço |
| **Kudu** | - | Console avançado do Azure App Service |
| **JWT** | JSON Web Token | Token de autenticação |
| **ORM** | Object-Relational Mapping | SQLAlchemy |
| **ASGI** | Asynchronous Server Gateway Interface | Protocolo de servidor assíncrono |
| **SSL/TLS** | Secure Sockets Layer / Transport Layer Security | Criptografia de conexão |
| **CORS** | Cross-Origin Resource Sharing | Política de compartilhamento entre origens |
| **CDN** | Content Delivery Network | Rede de distribuição de conteúdo |
| **LGPD** | Lei Geral de Proteção de Dados | Lei brasileira de privacidade |
| **RTO** | Recovery Time Objective | Tempo máximo de recuperação |
| **RPO** | Recovery Point Objective | Ponto de recuperação de dados |
| **SLA** | Service Level Agreement | Acordo de nível de serviço |
| **IOPS** | Input/Output Operations Per Second | Operações de I/O por segundo |

### 🔧 13.2 Comandos Rápidos (Cheat Sheet)

```bash
# ═══════════════════════════════════════════════════════
# COMANDOS ESSENCIAIS - MAPA SAAS
# ═══════════════════════════════════════════════════════

# --- VARIÁVEIS (configure primeiro) ---
export RESOURCE_GROUP="mapa-saas-rg"
export WEB_APP="mapa-saas-app-1762971490"
export DB_SERVER="mapa-saas-db-1762971848"

# --- STATUS ---
# Ver estado do app
az webapp show -g $RESOURCE_GROUP -n $WEB_APP --query state -o tsv

# Ver estado do banco
az postgres flexible-server show -g $RESOURCE_GROUP -n $DB_SERVER --query state -o tsv

# Testar health check
curl https://$WEB_APP.azurewebsites.net/health

# --- CONTROLE ---
# Reiniciar app
az webapp restart -g $RESOURCE_GROUP -n $WEB_APP

# Parar app
az webapp stop -g $RESOURCE_GROUP -n $WEB_APP

# Iniciar app
az webapp start -g $RESOURCE_GROUP -n $WEB_APP

# Parar banco (economiza custo)
az postgres flexible-server stop -g $RESOURCE_GROUP -n $DB_SERVER

# Iniciar banco
az postgres flexible-server start -g $RESOURCE_GROUP -n $DB_SERVER

# --- DEPLOY ---
# Criar ZIP e fazer deploy
zip -r deploy.zip . -x "venv/*" ".git/*" "__pycache__/*" "*.pyc" ".env" "uploads/*" "reports/*"
az webapp deployment source config-zip -g $RESOURCE_GROUP -n $WEB_APP --src deploy.zip

# --- LOGS ---
# Ver logs em tempo real
az webapp log tail -g $RESOURCE_GROUP -n $WEB_APP

# Baixar logs
az webapp log download -g $RESOURCE_GROUP -n $WEB_APP --log-file logs.zip

# --- VARIÁVEIS DE AMBIENTE ---
# Listar
az webapp config appsettings list -g $RESOURCE_GROUP -n $WEB_APP -o table

# Atualizar
az webapp config appsettings set -g $RESOURCE_GROUP -n $WEB_APP --settings DEBUG="False"

# --- BANCO DE DADOS ---
# Conectar
psql "postgresql://mapaadmin:NovaSenha12345!@$DB_SERVER.postgres.database.azure.com:5432/mapa_saas?sslmode=require"

# Backup
pg_dump "postgresql://mapaadmin:NovaSenha12345!@$DB_SERVER.postgres.database.azure.com:5432/mapa_saas?sslmode=require" | gzip > backup-$(date +%Y%m%d).sql.gz

# Adicionar IP ao firewall
MEU_IP=$(curl -s ifconfig.me)
az postgres flexible-server firewall-rule create -g $RESOURCE_GROUP -n $DB_SERVER --rule-name "MyIP-$(date +%Y%m%d)" --start-ip $MEU_IP --end-ip $MEU_IP

# --- EMERGÊNCIA ---
# Recuperação rápida
az webapp restart -g $RESOURCE_GROUP -n $WEB_APP && sleep 30 && curl https://$WEB_APP.azurewebsites.net/health

# Deletar TUDO (⚠️ IRREVERSÍVEL!)
az group delete -n $RESOURCE_GROUP --yes --no-wait
```

### 📖 13.3 Links Úteis

#### **Documentação Oficial:**

| Recurso | URL |
|---------|-----|
| **Portal Azure** | https://portal.azure.com |
| **Azure CLI Docs** | https://docs.microsoft.com/cli/azure/ |
| **App Service** | https://docs.microsoft.com/azure/app-service/ |
| **PostgreSQL Flexible** | https://docs.microsoft.com/azure/postgresql/flexible-server/ |
| **FastAPI** | https://fastapi.tiangolo.com/ |
| **SQLAlchemy** | https://docs.sqlalchemy.org/ |
| **Pydantic** | https://docs.pydantic.dev/ |
| **Uvicorn** | https://www.uvicorn.org/ |

#### **Ferramentas:**

| Ferramenta | URL | Uso |
|------------|-----|-----|
| **pgAdmin 4** | https://www.pgadmin.org/ | Cliente PostgreSQL |
| **DBeaver** | https://dbeaver.io/ | Cliente universal SQL |
| **Postman** | https://www.postman.com/ | Testar APIs |
| **VS Code** | https://code.visualstudio.com/ | Editor de código |
| **Azure Extension** | https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice | Extension VS Code |

#### **Comunidade e Suporte:**

| Recurso | URL |
|---------|-----|
| **Stack Overflow (Azure)** | https://stackoverflow.com/questions/tagged/azure |
| **Stack Overflow (FastAPI)** | https://stackoverflow.com/questions/tagged/fastapi |
| **GitHub - FastAPI** | https://github.com/tiangolo/fastapi |
| **Azure Status** | https://status.azure.com/ |
| **Suporte Azure** | https://azure.microsoft.com/support/ |

### 📊 13.4 Estrutura de Arquivos do Projeto

```
mapa-saas/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Aplicação FastAPI principal
│   ├── auth.py                 # Autenticação JWT
│   ├── database.py             # Configuração SQLAlchemy
│   ├── models.py               # Modelos ORM (User, XMLUpload, Report)
│   ├── schemas.py              # Schemas Pydantic
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── admin.py            # Rotas admin (/api/admin/*)
│   │   └── user.py             # Rotas usuário (/api/user/*)
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── xml_processor.py    # Processamento XML NF-e
│   │   ├── pdf_processor.py    # Extração de dados PDF
│   │   └── report_generator.py # Geração de relatórios Excel
│   └── templates/
│       ├── index.html          # Página de login
│       ├── admin_dashboard.html
│       └── user_dashboard.html
├── uploads/                    # Arquivos XML/PDF enviados
├── reports/                    # Relatórios Excel gerados
├── logs/                       # Logs da aplicação
├── backups/                    # Backups locais
├── scripts/                    # Scripts utilitários
│   ├── deploy.sh
│   ├── backup-db.sh
│   ├── diagnose-full.sh
│   └── emergency-recover.sh
├── requirements.txt            # Dependências Python
├── create_admin.py             # Script criar admin
├── .env.example                # Exemplo de configuração
├── .gitignore
├── README.md                   # Este arquivo
├── SETUP_LOCAL.md              # Guia de setup local
└── LICENSE
```

### 📝 13.5 Histórico de Versões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| **1.0.0** | 2025-01-13 | Rhyan Rocha | Versão inicial completa do sistema |
| | | | - Implementação FastAPI com SQLAlchemy |
| | | | - Processamento de XML NF-e |
| | | | - Geração de relatórios MAPA |
| | | | - Deploy no Azure |
| | | | - Documentação completa |

### ✅ 13.6 Checklist de Manutenção

#### **Diária:**
- [ ] Verificar logs de erro
- [ ] Monitorar uso de CPU/memória
- [ ] Verificar health check

#### **Semanal:**
- [ ] Revisar alertas disparados
- [ ] Verificar backups automáticos
- [ ] Analisar métricas de performance
- [ ] Limpar logs antigos

#### **Mensal:**
- [ ] Atualizar dependências Python (se necessário)
- [ ] Revisar custos do Azure
- [ ] Rotacionar senhas
- [ ] Testar restore de backup
- [ ] Revisar logs de auditoria
- [ ] Verificar espaço em disco

#### **Trimestral:**
- [ ] Atualizar runtime do Python
- [ ] Revisar e otimizar queries lentas
- [ ] Análise completa de segurança
- [ ] Teste de disaster recovery
- [ ] Atualizar documentação

#### **Anual:**
- [ ] Auditoria de segurança completa
- [ ] Revisar arquitetura
- [ ] Avaliar necessidade de scale up/down
- [ ] Renovar certificados (se aplicável)
- [ ] Revisar SLAs e garantias

---

## 🎉 Conclusão

Este manual fornece todas as informações necessárias para:

✅ **Operar** o sistema MAPA SaaS em produção  
✅ **Monitorar** saúde e performance da aplicação  
✅ **Fazer deploy** de atualizações com segurança  
✅ **Gerenciar** banco de dados e backups  
✅ **Resolver** problemas comuns rapidamente  
✅ **Configurar** novos ambientes de desenvolvimento  
✅ **Manter** segurança e compliance  
✅ **Otimizar** custos do Azure  
✅ **Recuperar** de situações de emergência  

---

## 📞 Suporte

Para questões técnicas ou problemas:

- **Documentação:** Este arquivo (README.md)
- **Logs:** `az webapp log tail -g mapa-saas-rg -n mapa-saas-app-1762971490`
- **Status Azure:** https://status.azure.com/
- **Email:** rhyan.hdr@gmail.com

---

## 🔒 Segurança

**⚠️ LEMBRETE IMPORTANTE:**

- Este documento contém informações sensíveis (senhas, strings de conexão)
- **NUNCA** commitar este arquivo com credenciais reais no Git
- Manter cópias em locais seguros (gerenciador de senhas, cofre)
- Rotacionar senhas regularmente (mínimo a cada 90 dias)
- Revisar acessos e permissões periodicamente

---

**📅 Última atualização:** 13 de Janeiro de 2025  
**👤 Responsável:** Rhyan Rocha  
**📧 Contato:** rhyan.hdr@gmail.com  

**🔒 CONFIDENCIAL - USO INTERNO APENAS**

---

**FIM DO DOCUMENTO**

---

