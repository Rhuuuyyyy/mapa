# 🪟 Setup Local - Windows

Guia rápido para rodar o MAPA SaaS no Windows.

## 📋 Pré-requisitos

1. **Python 3.11+** - https://www.python.org/downloads/
   - ⚠️ Marque "Add Python to PATH" durante instalação
2. **Node.js 18+** - https://nodejs.org/
3. **Git** (já tem se clonou o repo)

## 🚀 Setup Backend (FastAPI)

### 1. Criar ambiente virtual

```powershell
# No diretório do projeto
python -m venv venv

# Ativar ambiente virtual
.\venv\Scripts\activate
```

### 2. Instalar dependências

```powershell
pip install -r requirements.txt
```

### 3. Configurar banco de dados

**Opção A: SQLite (mais fácil para dev)**

Crie arquivo `.env` na raiz:

```env
DATABASE_URL=sqlite:///./mapa.db
SECRET_KEY=sua-chave-secreta-aqui-mude-isso
FRONTEND_URL=http://localhost:3000
```

**Opção B: PostgreSQL**

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/mapa_db
SECRET_KEY=sua-chave-secreta-aqui-mude-isso
FRONTEND_URL=http://localhost:3000
```

### 4. Rodar backend

```powershell
# Ainda com venv ativado
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend rodando em: http://localhost:8000
API Docs: http://localhost:8000/docs

---

## 🎨 Setup Frontend (React)

### 1. Instalar dependências

```powershell
cd frontend
npm install
```

### 2. Configurar API URL

Crie arquivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Rodar frontend

```powershell
npm run dev
```

Frontend rodando em: http://localhost:3000

---

## 🔧 Comandos Úteis

### Backend

```powershell
# Ativar ambiente virtual
.\venv\Scripts\activate

# Rodar servidor
uvicorn app.main:app --reload

# Ver logs
# (logs aparecem no terminal)

# Desativar ambiente virtual
deactivate
```

### Frontend

```powershell
cd frontend

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

---

## 🗄️ Configurar PostgreSQL (opcional)

Se quiser usar PostgreSQL local:

1. **Baixar PostgreSQL**
   - https://www.postgresql.org/download/windows/
   - Instalar com pgAdmin

2. **Criar banco de dados**
   ```sql
   CREATE DATABASE mapa_db;
   CREATE USER mapa_user WITH PASSWORD 'sua_senha';
   GRANT ALL PRIVILEGES ON DATABASE mapa_db TO mapa_user;
   ```

3. **Atualizar .env**
   ```env
   DATABASE_URL=postgresql://mapa_user:sua_senha@localhost:5432/mapa_db
   ```

---

## ✅ Verificar se está funcionando

1. Backend rodando: http://localhost:8000/health
   - Deve retornar: `{"status":"healthy"}`

2. Frontend rodando: http://localhost:3000
   - Página de login deve aparecer

3. Criar primeiro admin:
   - Abra: http://localhost:8000/docs
   - Use endpoint `/api/admin/auth/setup-first-admin`

---

## 🐛 Problemas Comuns

### Python não encontrado
```powershell
# Tentar com python3
python3 --version

# Ou verificar PATH
where python
```

### pip não encontrado
```powershell
python -m pip install --upgrade pip
```

### Erro ao ativar venv
```powershell
# Se der erro de política de execução
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Porta já em uso
```powershell
# Backend (porta 8000)
uvicorn app.main:app --reload --port 8001

# Frontend (porta 3000)
npm run dev -- --port 3001
```

### Erro com psycopg2
Se der erro ao instalar psycopg2-binary no Windows:
```powershell
pip install psycopg2-binary --no-binary psycopg2-binary
```

Ou use SQLite para desenvolvimento local!

---

## 📦 Estrutura Mínima

```
mapa/
├── app/                 # Backend FastAPI
│   ├── main.py         # Ponto de entrada
│   ├── models.py       # Modelos do banco
│   └── routers/        # Endpoints da API
├── frontend/           # Frontend React
│   ├── src/
│   └── package.json
├── venv/               # Ambiente virtual Python
├── .env                # Configurações (criar)
└── requirements.txt    # Dependências Python
```

---

## 🎯 Próximos Passos

1. Rodar backend e frontend
2. Criar primeiro usuário admin
3. Fazer login
4. Testar upload de XML
5. Gerar relatório

---

**Dúvidas?** Verifique a documentação completa em `/docs` ou abra uma issue.
