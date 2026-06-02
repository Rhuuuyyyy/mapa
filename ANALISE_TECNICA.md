# Análise Técnica Completa - SoloCloud v2.0.0

## 🏗️ Arquitetura Geral

### Stack Tecnológica

**Backend:**
- **Framework**: FastAPI 0.104+ (Python 3.11)
- **ORM**: SQLAlchemy 2.0+
- **Database**: PostgreSQL 14+ (Azure Flexible Server)
- **Auth**: JWT (python-jose) + bcrypt (passlib)
- **API Docs**: Swagger UI (OpenAPI 3.0)

**Frontend:**
- **Framework**: React 18.2
- **Build**: Vite 5.0
- **Routing**: React Router DOM 6.20
- **HTTP Client**: Axios 1.6
- **Styling**: Tailwind CSS 3.3
- **Icons**: Lucide React

**DevOps:**
- **Deploy**: Azure App Service (Linux B1)
- **CI/CD**: GitHub Actions
- **Monitoring**: Azure Application Insights (opcional)

---

## 🎯 Conceitos e Padrões de Design

### 1. **Padrões Arquiteturais**

#### MVC Adaptado (Model-View-Controller)
```
Models (models.py)
  ↓ ORM
Database (PostgreSQL)
  ↑ Queries
Routers (admin.py, user.py)  ← Controllers
  ↓ JSON
Schemas (schemas.py)  ← Views/DTOs
  ↓ HTTP
Frontend (React)
```

#### Repository Pattern
- SQLAlchemy ORM abstrai acesso ao banco
- Queries centralizadas nos routers
- Isolation entre lógica de negócio e persistência

#### Dependency Injection
```python
# FastAPI Depends
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    ...
```

### 2. **Padrões de Segurança**

#### Authentication & Authorization
- **JWT Bearer Tokens**: Stateless authentication
- **Bcrypt Hashing**: Passwords com cost factor 12
- **Role-Based Access Control (RBAC)**: Admin vs User
- **Password Policy**: 12+ chars, maiúscula, minúscula, número, especial

#### Input Validation
- **Pydantic Schemas**: Validação automática de requests
- **File Validation**: Multi-layer (extension, MIME, magic bytes)
- **SQL Injection Protection**: SQLAlchemy ORM
- **Path Traversal Protection**: Sanitização de file paths

#### Rate Limiting
```python
@limiter.limit("5/minute")
async def login(...)
```

### 3. **Padrões de Dados**

#### Domain Model (Hierárquico)
```
User
 ├── XMLUpload (1:N)
 ├── Report (1:N)
 └── Company (1:N)
      └── Product (1:N)
```

#### DTO Pattern (Data Transfer Objects)
```python
# Request DTOs
UserCreate, CompanyCreate, ProductCreate

# Response DTOs
UserResponse, CompanyResponse, ProductResponse
```

#### Soft Delete (Cascade)
- `ondelete="CASCADE"` em Foreign Keys
- Mantém integridade referencial

---

## 🔄 Lógica de Negócio

### Fluxo Principal

#### 1. **Upload de XML**
```
User uploads XML/PDF
  ↓
Validação (extension, MIME, size)
  ↓
Extração de dados (lxml)
  ↓
Parsing NF-e (emitente, destinatário, produtos)
  ↓
Armazenamento (filesystem + database record)
  ↓
Status: processed/error
```

#### 2. **Catálogo Hierárquico**
```
Company (empresa)
  - MAPA Registration: "PR-12345"
  ↓
Product (produto)
  - MAPA Registration: "6.000001"
  ↓
Full Registration: "PR-12345-6.000001"
```

**Propósito**: Concatenação de registros MAPA para matching com XMLs

#### 3. **Geração de Relatórios**
```
XMLs do período (Q1-2025)
  ↓
Agregação por produto
  ↓
Matching com catálogo (Company + Product)
  ↓
Separação Import vs Domestic
  ↓
Conversão de unidades → Toneladas
  ↓
Geração Excel (formato oficial MAPA)
```

### Regras de Negócio

1. **Usuário Regular**:
   - Acessa apenas seus próprios dados
   - Não pode ver/modificar dados de outros usuários
   - Isolation total por `user_id`

2. **Administrador**:
   - CRUD completo de usuários
   - Acessa todos os dados (futuro)
   - Gerencia sistema

3. **XMLs**:
   - Tamanho máximo: 10MB
   - Formatos: .xml, .pdf
   - Validação de estrutura NF-e

4. **Catálogo**:
   - Registro MAPA parcial em Company
   - Registro MAPA parcial em Product
   - Concatenação automática para matching

5. **Relatórios**:
   - Período trimestral (Q1, Q2, Q3, Q4)
   - Formato Excel (.xlsx)
   - Colunas: Registro MAPA, Produto, Quantidade, Unidade, etc.

---

## 🗄️ Modelo de Dados

### Entidades Principais

#### **User**
```python
- id (PK)
- email (unique, indexed)
- hashed_password
- full_name
- company_name (nullable)
- is_active (default: True)
- is_admin (default: False)
- created_at, updated_at
```

**Relacionamentos**: 1:N com XMLUpload, Report, Company

#### **Company**
```python
- id (PK)
- user_id (FK → User)
- company_name (indexed)
- mapa_registration  # Ex: "PR-12345"
- created_at, updated_at
```

**Índice Composto**: (user_id, company_name) para busca rápida

#### **Product**
```python
- id (PK)
- company_id (FK → Company)
- product_name (indexed)
- mapa_registration  # Ex: "6.000001"
- product_reference (nullable)
- created_at, updated_at
```

**Índice Composto**: (company_id, product_name)

#### **XMLUpload**
```python
- id (PK)
- user_id (FK → User)
- filename
- file_path
- upload_date
- period  # Ex: "Q1-2025"
- status  # pending, processed, error
- error_message (nullable)
```

#### **Report**
```python
- id (PK)
- user_id (FK → User)
- xml_upload_id (FK → XMLUpload, nullable)
- report_period  # Ex: "Q1-2025"
- generated_at
- file_path
```

---

## 🔒 Segurança

### Implementações

1. **Authentication**:
   - JWT com expiração configurável (default: 30 min)
   - Token refresh via re-login
   - Logout client-side (remove token do localStorage)

2. **Authorization**:
   - Middleware `get_current_user`: Valida token
   - Middleware `get_current_admin`: Valida admin
   - Row-Level Security: Queries filtradas por `user_id`

3. **Password Security**:
   - Bcrypt com cost factor 12
   - Validação de força (12+ chars, complexidade)
   - Hash armazenado, nunca plaintext

4. **File Upload Security**:
   - Validação de extensão
   - Validação de MIME type
   - Validação de magic bytes
   - Tamanho máximo (10MB)
   - Path traversal protection

5. **CORS**:
   - Configurável via variável de ambiente
   - Default: localhost:3000 + Azure domain
   - Credentials permitidos

6. **Rate Limiting**:
   - Login: 5 tentativas/minuto
   - Slowapi integration

---

## 📊 Performance

### Otimizações Implementadas

1. **Database Indexes**:
   - Primary Keys (auto-indexed)
   - Foreign Keys (auto-indexed)
   - email (User) - unique index
   - company_name, product_name - indexes
   - Composite indexes: (user_id, company_name), (company_id, product_name)

2. **Query Optimization**:
   - Eager loading com `joinedload()` para relacionamentos
   - Filtering por `user_id` para isolation
   - Limit/Offset para paginação (futuro)

3. **Caching**:
   - Static files servidos com cache headers
   - React build otimizado (code splitting, tree shaking)

4. **Frontend Performance**:
   - Vite build: minification, compression
   - Lazy loading de rotas (futuro)
   - Memoization de componentes (futuro)

---

## 🧪 Extensibilidade

### Pontos de Extensão

1. **Novos Endpoints**: Adicionar em `routers/`
2. **Novos Modelos**: Adicionar em `models.py` + migração
3. **Novos Schemas**: Adicionar em `schemas.py`
4. **Novos Processadores**: Adicionar em `utils/`
5. **Novos Middlewares**: Adicionar em `main.py`

### Arquitetura Plugável

```python
# Exemplo: Novo processador
class MyProcessor:
    def process(self, data):
        # Custom logic
        return processed_data
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App
 ├── AuthContext (global state)
 ├── Router
 │   ├── /login → Login
 │   ├── /dashboard → Dashboard
 │   │   └── Layout
 │   │       ├── Sidebar
 │   │       ├── Navbar
 │   │       └── Content
 │   ├── /upload → UploadXML
 │   ├── /companies → Companies
 │   ├── /products → Products
 │   ├── /reports → Reports
 │   ├── /catalog → Catalog
 │   └── /users → Users (admin only)
```

### State Management

1. **AuthContext**:
   - user, token, isAdmin
   - login(), logout()
   - Persisted in localStorage

2. **Local Component State**:
   - Form data
   - Loading states
   - Error messages

3. **Server State** (via API):
   - React Query não implementado (futuro)
   - Refetch manual via useEffect

### API Communication

```javascript
// Axios instance
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptors
- Request: Add JWT token
- Response: Handle 401 (auto logout)
```

---

## 🚀 Deploy Architecture

### Azure Resources

```
Resource Group: mapa-saas-clean
 ├── App Service: mapa-app-clean-8270
 │   └── App Service Plan: mapa-plan-clean (B1)
 └── PostgreSQL Flexible Server
     └── Database: mapa_db
```

### CI/CD Pipeline

```
GitHub Push (main)
  ↓
GitHub Actions
  ├── Build Python (venv + pip install)
  ├── Build React (npm ci + npm run build)
  └── Deploy Artifact → Azure App Service
```

### Application Structure (Azure)

```
/home/site/wwwroot/
 ├── app/ (Python backend)
 ├── frontend/dist/ (React build)
 ├── static/ (legacy templates)
 ├── templates/ (legacy HTML)
 ├── uploads/ (user files)
 └── startup.sh (entry point)
```

---

## 📝 Motivos das Decisões Técnicas

### Por que FastAPI?
- Performance alta (async/await)
- Validação automática (Pydantic)
- Documentação automática (Swagger)
- Type hints nativos (Python 3.11+)

### Por que SQLAlchemy?
- ORM maduro e confiável
- Proteção contra SQL injection
- Migrations com Alembic
- Relationship management

### Por que JWT?
- Stateless (escalável)
- Self-contained (payload com user info)
- Standard industry (OAuth 2.0)

### Por que React?
- Component-based (reusabilidade)
- Large ecosystem
- Vite (fast build)
- TypeScript ready (futuro)

### Por que Tailwind?
- Utility-first (desenvolvimento rápido)
- Customizável (tema SoloCloud)
- Tree-shaking (CSS mínimo)
- Design system integrado

### Por que PostgreSQL?
- Relational data (hierarquia clara)
- ACID compliant
- JSON support (futuro: metadata)
- Azure integration

---

## 🔮 Roadmap Técnico

### Melhorias Futuras

1. **Backend**:
   - [ ] Implementar Redis para cache
   - [ ] WebSockets para notificações real-time
   - [ ] Celery para processamento async de XMLs
   - [ ] Rate limiting por usuário
   - [ ] API versioning (/api/v1/, /api/v2/)

2. **Frontend**:
   - [ ] React Query para server state
   - [ ] TypeScript migration
   - [ ] Component library (Radix UI)
   - [ ] E2E tests (Playwright)
   - [ ] PWA support

3. **DevOps**:
   - [ ] Docker containers
   - [ ] Kubernetes orchestration
   - [ ] Blue-green deployment
   - [ ] Monitoring (Grafana + Prometheus)
   - [ ] Log aggregation (ELK Stack)

4. **Features**:
   - [ ] Multi-tenancy
   - [ ] Audit log
   - [ ] Export para múltiplos formatos
   - [ ] Dashboard com gráficos
   - [ ] Notificações por email

---

**Versão**: 2.0.0
**Data**: 2025-01-20
**Autoria**: Análise técnica completa do sistema SoloCloud
