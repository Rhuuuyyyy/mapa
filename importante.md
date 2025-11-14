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

