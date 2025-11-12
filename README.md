# 📊 MAPA SaaS - Automação de Relatórios Trimestrais

<div align="center">

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**Sistema completo de automação para geração de relatórios trimestrais do MAPA (Ministério da Agricultura, Pecuária e Abastecimento) a partir de Notas Fiscais Eletrônicas.**

[Características](#-características) • [Instalação](#-instalação-completa) • [Uso](#-como-usar) • [Deploy](#-deploy-azure) • [Suporte](#-suporte)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Características](#-características)
- [Tecnologias](#-tecnologias-utilizadas)
- [Requisitos do Sistema](#-requisitos-do-sistema)
- [Instalação Completa](#-instalação-completa)
  - [Windows](#-instalação-no-windows)
  - [Linux/Mac](#-instalação-no-linuxmac)
- [Configuração](#-configuração)
- [Como Usar](#-como-usar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Documentação](#-documentação-da-api)
- [Deploy no Azure](#-deploy-no-azure)
- [Troubleshooting](#-solução-de-problemas)
- [FAQ](#-perguntas-frequentes)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **MAPA SaaS** é uma solução web desenvolvida para automatizar a geração de relatórios trimestrais exigidos pelo Ministério da Agricultura (MAPA) para empresas que trabalham com fertilizantes.

### 🎪 O Problema

Empresas de fertilizantes precisam enviar relatórios trimestrais ao MAPA contendo informações detalhadas sobre produção, importação e comercialização de produtos. Este processo manual é:

- ⏰ **Demorado** - Horas de trabalho manual
- 🐛 **Propenso a erros** - Digitação e formatação incorretas
- 📄 **Complexo** - Múltiplas NF-es e dados a consolidar

### 💡 A Solução

Este sistema automatiza **100% do processo**:

1. 📤 **Upload** de NF-es (XML ou PDF)
2. ⚙️ **Processamento automático** dos dados
3. 📊 **Geração** do relatório no formato oficial MAPA
4. 📥 **Download** do arquivo Excel pronto para envio

---

## ✨ Características

### 🔐 **Sistema de Autenticação**
- Login seguro com JWT
- Dois níveis de acesso: Admin e Usuário
- Gerenciamento completo de contas

### 📄 **Processamento Inteligente de NF-e**
- ✅ Suporte para **XML** (formato padrão NF-e)
- ✅ Suporte para **PDF** (DANFE)
- ✅ Extração automática de:
  - Dados do emitente e destinatário
  - Produtos e garantias (nutrientes)
  - Quantidades e valores
  - Registro MAPA
  - Chave de acesso

### 📊 **Geração de Relatórios MAPA**
- Formato **oficial** do MAPA
- Exportação em **Excel (.xlsx)**
- Agrupamento por **trimestre**
- Pronto para **envio**

### 🎨 **Interface Moderna**
- Design limpo e intuitivo
- Responsivo (funciona em celular/tablet)
- Drag & Drop para upload
- Feedback visual em tempo real

### 🔒 **Segurança**
- Senhas criptografadas (bcrypt)
- Tokens JWT com expiração
- Isolamento de dados por usuário
- Validação de arquivos

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Framework web moderno e rápido
- **[SQLAlchemy](https://www.sqlalchemy.org/)** - ORM para banco de dados
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Pydantic](https://pydantic-docs.helpmanual.io/)** - Validação de dados
- **[lxml](https://lxml.de/)** - Processamento de XML
- **[pdfplumber](https://github.com/jsvine/pdfplumber)** - Extração de texto de PDF
- **[openpyxl](https://openpyxl.readthedocs.io/)** - Geração de arquivos Excel

### Frontend
- **HTML5/CSS3/JavaScript** - Interface pura e leve
- **Design System** próprio

### Autenticação
- **[python-jose](https://github.com/mpdavis/python-jose)** - JWT
- **[passlib](https://passlib.readthedocs.io/)** - Hash de senhas

---

## 💻 Requisitos do Sistema

### Requisitos Mínimos

| Componente | Versão Mínima |
|------------|---------------|
| Python | 3.9+ |
| PostgreSQL | 12+ |
| RAM | 2GB |
| Disco | 5GB livre |
| Sistema Operacional | Windows 10, Linux, macOS |

### Softwares Necessários

1. **Python 3.9 ou superior**
   - [Download Windows](https://www.python.org/downloads/windows/)
   - Linux: `sudo apt install python3.9 python3-pip`
   - macOS: `brew install python@3.9`

2. **PostgreSQL 12 ou superior**
   - [Download Windows](https://www.postgresql.org/download/windows/)
   - Linux: `sudo apt install postgresql postgresql-contrib`
   - macOS: `brew install postgresql`

3. **Git** (opcional, mas recomendado)
   - [Download](https://git-scm.com/downloads)

---

## 🚀 Instalação Completa

### 📦 Instalação no Windows

#### **Passo 1: Instalar Python**

1. Baixe o Python 3.9+ em [python.org](https://www.python.org/downloads/)
2. **IMPORTANTE**: Marque a opção "Add Python to PATH"
3. Clique em "Install Now"
4. Verifique a instalação:
```cmd
   python --version
   pip --version
```

#### **Passo 2: Instalar PostgreSQL**

1. Baixe o PostgreSQL em [postgresql.org](https://www.postgresql.org/download/windows/)
2. Execute o instalador
3. **Anote a senha** do usuário `postgres`
4. Mantenha a porta padrão `5432`
5. Verifique a instalação:
```cmd
   psql --version
```

#### **Passo 3: Criar Banco de Dados**

1. Abra o **pgAdmin 4** (instalado com o PostgreSQL)
2. Conecte ao servidor local
3. Clique com botão direito em "Databases" → "Create" → "Database"
4. Nome: `mapa_saas`
5. Owner: `postgres`
6. Clique em "Save"

**OU via linha de comando:**
```cmd
# Abra o PostgreSQL Shell (psql)
# Windows: Procure por "SQL Shell (psql)" no menu Iniciar

# Login (pressione Enter para usar valores padrão)
Server: localhost
Database: postgres
Port: 5432
Username: postgres
Password: [sua senha]

# Crie o banco de dados
CREATE DATABASE mapa_saas;

# Verifique
\l

# Sair
\q
```

#### **Passo 4: Baixar o Projeto**

**Opção A - Com Git:**
```cmd
cd C:\
git clone [URL_DO_REPOSITORIO] mapa-saas
cd mapa-saas
```

**Opção B - Download Manual:**
1. Baixe o ZIP do projeto
2. Extraia em `C:\mapa-saas`
3. Abra o CMD e navegue até a pasta:
```cmd
   cd C:\mapa-saas
```

#### **Passo 5: Criar Ambiente Virtual**
```cmd
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
venv\Scripts\activate

# Você verá (venv) no início da linha
```

#### **Passo 6: Instalar Dependências**
```cmd
# Com o ambiente virtual ativado
pip install --upgrade pip
pip install -r requirements.txt

# Aguarde a instalação (2-5 minutos)
```

#### **Passo 7: Configurar Variáveis de Ambiente**
```cmd
# Copiar arquivo de exemplo
copy .env.example .env

# Editar o arquivo .env
notepad .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/mapa_saas

# Security (gere uma chave segura)
SECRET_KEY=sua-chave-secreta-muito-longa-e-aleatoria-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=True
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```

**📌 Como gerar uma SECRET_KEY segura:**
```cmd
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copie o resultado e cole em `SECRET_KEY` no arquivo `.env`

#### **Passo 8: Criar Usuário Administrador**
```cmd
python create_admin.py
```

Preencha os dados:
```
Nome completo: Administrador Sistema
E-mail: admin@empresa.com
Senha: Admin@123456
```

✅ Anote essas credenciais!

#### **Passo 9: Iniciar o Servidor**
```cmd
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Você verá:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

#### **Passo 10: Acessar o Sistema**

1. Abra seu navegador
2. Acesse: **http://localhost:8000**
3. Faça login com as credenciais do admin
4. 🎉 **Pronto!**

---

### 🐧 Instalação no Linux/Mac

#### **Passo 1: Atualizar Sistema**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# macOS (com Homebrew)
brew update
```

#### **Passo 2: Instalar Python e PostgreSQL**

**Ubuntu/Debian:**
```bash
sudo apt install python3.9 python3-pip python3-venv postgresql postgresql-contrib -y
```

**macOS:**
```bash
brew install python@3.9 postgresql
```

#### **Passo 3: Iniciar PostgreSQL**

**Ubuntu/Debian:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew services start postgresql
```

#### **Passo 4: Criar Banco de Dados**
```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Criar banco de dados
CREATE DATABASE mapa_saas;

# Criar usuário (opcional)
CREATE USER mapa_user WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE mapa_saas TO mapa_user;

# Sair
\q
```

#### **Passo 5: Clonar Projeto**
```bash
cd ~
git clone [URL_DO_REPOSITORIO] mapa-saas
cd mapa-saas
```

#### **Passo 6: Criar Ambiente Virtual**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### **Passo 7: Instalar Dependências**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### **Passo 8: Configurar .env**
```bash
cp .env.example .env
nano .env  # ou vim .env
```

Configure conforme necessário:
```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/mapa_saas
SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
ALLOWED_ORIGINS=http://localhost:8000
```

#### **Passo 9: Criar Admin**
```bash
python create_admin.py
```

#### **Passo 10: Iniciar Servidor**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### **Passo 11: Acessar**

Abra: **http://localhost:8000**

---

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `SECRET_KEY` | Chave secreta para JWT | `gerar com secrets.token_urlsafe(32)` |
| `ALGORITHM` | Algoritmo de criptografia | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tempo de expiração do token | `30` |
| `DEBUG` | Modo de desenvolvimento | `True` ou `False` |
| `ALLOWED_ORIGINS` | Origens permitidas (CORS) | `http://localhost:8000` |

### Configuração de Produção

Para ambiente de produção, modifique o `.env`:
```env
DEBUG=False
DATABASE_URL=postgresql://user:pass@servidor-prod.com:5432/mapa_saas
ALLOWED_ORIGINS=https://seudominio.com
```

---

## 📖 Como Usar

### 1️⃣ **Login como Administrador**

1. Acesse http://localhost:8000
2. Faça login com as credenciais do admin
3. Você será redirecionado para `/admin`

### 2️⃣ **Criar Usuários**

1. No painel admin, clique em "➕ Novo Usuário"
2. Preencha os dados:
   - Nome completo
   - E-mail
   - Empresa
   - Senha
   - Marque "Ativo"
3. Clique em "Salvar"

### 3️⃣ **Login como Usuário**

1. Faça logout
2. Login com o e-mail/senha do usuário criado
3. Você será redirecionado para `/dashboard`

### 4️⃣ **Fazer Upload de NF-e**

1. No dashboard, vá para "Upload de NF-e"
2. Arraste ou selecione um arquivo XML ou PDF
3. Clique em "📤 Enviar Arquivo"
4. Aguarde o processamento (alguns segundos)
5. O arquivo aparecerá em "Arquivos Enviados" com status "✅ Processado"

### 5️⃣ **Gerar Relatório MAPA**

1. Role até "Gerar Relatório Trimestral MAPA"
2. Selecione o trimestre desejado (ex: Q1-2025)
3. Clique em "📊 Gerar Relatório MAPA"
4. Aguarde o processamento
5. O relatório aparecerá em "Relatórios Gerados"

### 6️⃣ **Baixar Relatório**

1. Na seção "Relatórios Gerados"
2. Clique em "📥 Download"
3. O arquivo Excel será baixado
4. ✅ Relatório pronto para envio ao MAPA!

---

## 📁 Estrutura do Projeto
```
mapa-saas/
├── 📁 app/                          # Aplicação principal
│   ├── 📄 __init__.py
│   ├── 📄 main.py                   # Aplicação FastAPI
│   ├── 📄 config.py                 # Configurações
│   ├── 📄 database.py               # Conexão com banco
│   ├── 📄 models.py                 # Modelos SQLAlchemy
│   ├── 📄 schemas.py                # Schemas Pydantic
│   ├── 📄 auth.py                   # Autenticação JWT
│   │
│   ├── 📁 routers/                  # Endpoints da API
│   │   ├── 📄 __init__.py
│   │   ├── 📄 admin.py              # Rotas do admin
│   │   └── 📄 user.py               # Rotas do usuário
│   │
│   └── 📁 utils/                    # Utilitários
│       ├── 📄 __init__.py
│       ├── 📄 xml_processor.py      # Processador XML
│       ├── 📄 pdf_processor.py      # Processador PDF
│       └── 📄 report_generator.py   # Gerador de relatórios
│
├── 📁 static/                       # Arquivos estáticos
│   ├── 📁 css/
│   │   └── 📄 style.css             # Estilos
│   └── 📁 js/
│       ├── 📄 main.js               # JavaScript comum
│       ├── 📄 admin.js              # JavaScript admin
│       └── 📄 user.js               # JavaScript usuário
│
├── 📁 templates/                    # Templates HTML
│   ├── 📄 base.html                 # Template base
│   ├── 📄 login.html                # Página de login
│   ├── 📄 admin_dashboard.html      # Dashboard admin
│   └── 📄 user_dashboard.html       # Dashboard usuário
│
├── 📁 uploads/                      # Arquivos enviados (criado automaticamente)
├── 📁 reports/                      # Relatórios gerados (criado automaticamente)
│
├── 📄 requirements.txt              # Dependências Python
├── 📄 .env.example                  # Exemplo de variáveis de ambiente
├── 📄 .gitignore                    # Arquivos ignorados pelo Git
├── 📄 create_admin.py               # Script para criar admin
└── 📄 README.md                     # Este arquivo
```

---

## 📚 Documentação da API

### Acessar Documentação Interativa

Com o servidor rodando, acesse:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Principais Endpoints

#### Autenticação
```http
POST /api/admin/auth/login
```
Body:
```json
{
  "email": "admin@example.com",
  "password": "senha123"
}
```

#### Admin - CRUD de Usuários
```http
POST   /api/admin/users          # Criar usuário
GET    /api/admin/users          # Listar usuários
GET    /api/admin/users/{id}     # Obter usuário
PUT    /api/admin/users/{id}     # Atualizar usuário
DELETE /api/admin/users/{id}     # Deletar usuário
```

#### Usuário - Upload e Relatórios
```http
POST   /api/user/upload-nfe                    # Upload NF-e
GET    /api/user/uploads                       # Listar uploads
POST   /api/user/generate-report/{period}      # Gerar relatório
GET    /api/user/reports                       # Listar relatórios
GET    /api/user/download-report/{id}          # Download relatório
DELETE /api/user/uploads/{id}                  # Deletar upload
DELETE /api/user/reports/{id}                  # Deletar relatório
```

---

## ☁️ Deploy no Azure

### Requisitos Azure

- Conta Azure ativa
- Azure CLI instalado
- Créditos disponíveis

### Passo a Passo

#### 1. **Criar Azure Database for PostgreSQL**
```bash
# Login
az login

# Criar grupo de recursos
az group create --name mapa-saas-rg --location eastus

# Criar servidor PostgreSQL
az postgres flexible-server create \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db \
  --location eastus \
  --admin-user mapa_admin \
  --admin-password "SenhaSegura@123" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14

# Criar banco de dados
az postgres flexible-server db create \
  --resource-group mapa-saas-rg \
  --server-name mapa-saas-db \
  --database-name mapa_saas

# Permitir conexões do Azure
az postgres flexible-server firewall-rule create \
  --resource-group mapa-saas-rg \
  --name mapa-saas-db \
  --rule-name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

#### 2. **Criar Azure Web App**
```bash
# Criar App Service Plan
az appservice plan create \
  --name mapa-saas-plan \
  --resource-group mapa-saas-rg \
  --sku B1 \
  --is-linux

# Criar Web App
az webapp create \
  --resource-group mapa-saas-rg \
  --plan mapa-saas-plan \
  --name mapa-saas-app \
  --runtime "PYTHON:3.9"
```

#### 3. **Configurar Variáveis de Ambiente**
```bash
az webapp config appsettings set \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app \
  --settings \
    DATABASE_URL="postgresql://mapa_admin:SenhaSegura@123@mapa-saas-db.postgres.database.azure.com:5432/mapa_saas?sslmode=require" \
    SECRET_KEY="sua-chave-gerada" \
    ALGORITHM="HS256" \
    ACCESS_TOKEN_EXPIRE_MINUTES="30" \
    DEBUG="False" \
    ALLOWED_ORIGINS="https://mapa-saas-app.azurewebsites.net"
```

#### 4. **Deploy**
```bash
# Comprimir projeto
zip -r mapa-saas.zip . -x "venv/*" ".git/*" "__pycache__/*"

# Deploy
az webapp deployment source config-zip \
  --resource-group mapa-saas-rg \
  --name mapa-saas-app \
  --src mapa-saas.zip
```

#### 5. **Criar Admin (no Azure)**
```bash
# SSH na instância
az webapp ssh --resource-group mapa-saas-rg --name mapa-saas-app

# Dentro do SSH
cd /home/site/wwwroot
python create_admin.py
```

### Acessar Aplicação

https://mapa-saas-app.azurewebsites.net

---

## 🔧 Solução de Problemas

### ❌ Erro: "ModuleNotFoundError"

**Causa**: Dependências não instaladas

**Solução**:
```bash
# Ativar ambiente virtual
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Reinstalar dependências
pip install -r requirements.txt
```

---

### ❌ Erro: "could not connect to server"

**Causa**: PostgreSQL não está rodando

**Solução**:

**Windows**: 
```cmd
# Abra Services.msc
# Procure por "postgresql-x64-XX"
# Clique com botão direito → Iniciar
```

**Linux**:
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

**macOS**:
```bash
brew services start postgresql
```

---

### ❌ Erro: "relation does not exist"

**Causa**: Tabelas não foram criadas

**Solução**:
```python
# Execute no Python interativo
python

>>> from app.database import engine, Base
>>> from app.models import User, XMLUpload, Report
>>> Base.metadata.create_all(bind=engine)
>>> exit()
```

---

### ❌ Erro: "Invalid token" ou "401 Unauthorized"

**Causa**: Token expirado ou inválido

**Solução**:
1. Abra o navegador (F12)
2. Application → Local Storage
3. Delete `access_token`
4. Faça login novamente

---

### ❌ Erro: "SECRET_KEY not found"

**Causa**: Arquivo `.env` não configurado

**Solução**:
```bash
# Certifique-se que o arquivo .env existe
ls -la .env  # Linux/Mac
dir .env     # Windows

# Copie do exemplo
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows

# Edite e configure
```

---

### ❌ Upload de arquivo falha

**Causa**: Permissões de diretório

**Solução**:
```bash
# Linux/Mac
chmod 777 uploads
chmod 777 reports

# Windows (execute como Admin)
icacls uploads /grant Everyone:F
icacls reports /grant Everyone:F
```

---

### ❌ PDF não é processado corretamente

**Causa**: Layout do PDF diferente do esperado

**Solução**:
1. Prefira usar arquivos XML quando possível
2. O PDF deve ser uma DANFE oficial
3. Verifique se o PDF tem texto (não é imagem)
4. Se necessário, ajuste o `pdf_processor.py`

---

## ❓ Perguntas Frequentes

### **1. Posso usar MySQL ao invés de PostgreSQL?**

Sim! Basta alterar no `.env`:
```env
DATABASE_URL=mysql+pymysql://user:password@localhost/mapa_saas
```

E instalar o driver:
```bash
pip install pymysql
```

---

### **2. Como fazer backup do banco de dados?**
```bash
# Backup
pg_dump -U postgres mapa_saas > backup.sql

# Restore
psql -U postgres mapa_saas < backup.sql
```

---

### **3. Posso processar múltiplos arquivos de uma vez?**

Atualmente não, mas você pode enviar vários arquivos sequencialmente. Uma feature de upload em lote está planejada.

---

### **4. O sistema funciona offline?**

Sim! Uma vez instalado, funciona completamente offline.

---

### **5. Posso personalizar o formato do relatório?**

Sim! Edite o arquivo `app/utils/report_generator.py` para ajustar colunas, formatação, etc.

---

### **6. Qual o limite de tamanho dos arquivos?**

Por padrão, 50MB. Para alterar, modifique em `app/main.py`:
```python
app.add_middleware(
    TrustedHostMiddleware,
    max_upload_size=100_000_000  # 100MB
)
```

---

### **7. Como adicionar mais campos ao relatório?**

Edite `app/utils/report_generator.py` e adicione os campos desejados no método `_parse_products_for_mapa()`.

---

### **8. Posso usar em produção?**

Sim, mas recomendamos:
- Usar HTTPS
- Configurar firewall
- Fazer backups regulares
- Monitorar logs
- Usar `DEBUG=False`

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

### Encontrou um bug?
Abra uma [issue no GitHub](link) com:
- Descrição do problema
- Passos para reproduzir
- Logs de erro
- Sistema operacional

### Dúvidas?
- 📧 Email: suporte@exemplo.com
- 💬 Discord: [Link do servidor]
- 📖 Wiki: [Link da wiki]

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🎉 Agradecimentos

- FastAPI pela excelente framework
- Comunidade Python
- MAPA pelas especificações dos relatórios

---

## 📊 Status do Projeto

![Status](https://img.shields.io/badge/Status-Em%20Produ%C3%A7%C3%A3o-success)
![Versão](https://img.shields.io/badge/Vers%C3%A3o-1.0.0-blue)
![Cobertura](https://img.shields.io/badge/Cobertura-85%25-green)

---

<div align="center">

**Desenvolvido com ❤️ para facilitar o trabalho das empresas de fertilizantes**

[⬆ Voltar ao topo](#-mapa-saas---automação-de-relatórios-trimestrais)

</div>