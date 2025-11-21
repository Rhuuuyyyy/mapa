# SoloCloud v2.0.0

**Da Terra à Nuvem** - Sistema de Automação de Relatórios para o Agronegócio

## Sobre o Projeto

SoloCloud é uma plataforma SaaS desenvolvida para automatizar a geração de relatórios trimestrais MAPA (Ministério da Agricultura, Pecuária e Abastecimento). O sistema permite que empresas do setor agrícola:

- Façam upload de XMLs de NF-e (Notas Fiscais Eletrônicas)
- Cadastrem empresas e produtos em um catálogo hierárquico
- Gerem automaticamente relatórios Excel no formato oficial MAPA
- Validem dados e identifiquem itens faltantes antes da geração

## Status do Deploy

| Item | Status |
|------|--------|
| **Aplicação** | Em Produção |
| **URL** | https://mapa-app-clean-8270.azurewebsites.net |
| **API Docs** | https://mapa-app-clean-8270.azurewebsites.net/docs |
| **Health** | https://mapa-app-clean-8270.azurewebsites.net/health |
| **Deploy** | Automático via GitHub Actions (branch `main`) |
| **Infraestrutura** | Azure App Service + PostgreSQL Flexible Server |

## Stack Tecnológica

### Backend
- **Framework**: FastAPI (Python 3.11)
- **ORM**: SQLAlchemy 2.0
- **Banco de Dados**: PostgreSQL 14+
- **Autenticação**: JWT (python-jose) + bcrypt
- **Rate Limiting**: slowapi
- **Processamento**: lxml, pdfplumber, pandas, openpyxl

### Frontend
- **Framework**: React 18 + Vite
- **Estilização**: Tailwind CSS
- **Roteamento**: React Router v6
- **HTTP Client**: Axios
- **Ícones**: Lucide React

### Infraestrutura
- **Cloud**: Microsoft Azure
- **App Service**: Linux B1
- **Database**: PostgreSQL Flexible Server
- **CI/CD**: GitHub Actions

## Arquitetura do Projeto

```
solocloud/
├── app/                          # Backend FastAPI
│   ├── main.py                   # Aplicação principal + serve React
│   ├── config.py                 # Configurações (Pydantic Settings)
│   ├── database.py               # SQLAlchemy engine e sessão
│   ├── models.py                 # Modelos ORM (User, Company, Product, etc)
│   ├── schemas.py                # Schemas Pydantic (validação)
│   ├── auth.py                   # Autenticação JWT + password hashing
│   ├── routers/
│   │   ├── admin.py              # Endpoints administrativos
│   │   └── user.py               # Endpoints do usuário
│   └── utils/
│       ├── validators.py         # Validação de arquivos
│       ├── nfe_processor.py      # Processamento de NF-e
│       ├── mapa_processor.py     # Matching com catálogo
│       └── report_generator.py   # Geração de relatórios Excel
│
├── frontend/                     # Frontend React
│   ├── src/
│   │   ├── components/           # Componentes reutilizáveis
│   │   │   └── Layout.jsx        # Layout principal com sidebar
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # Contexto de autenticação
│   │   ├── pages/                # Páginas da aplicação
│   │   │   ├── Login.jsx         # Página de login
│   │   │   ├── Dashboard.jsx     # Dashboard com estatísticas
│   │   │   ├── Profile.jsx       # Meu Perfil
│   │   │   ├── Settings.jsx      # Configurações
│   │   │   ├── Companies.jsx     # Gerenciar empresas
│   │   │   ├── Products.jsx      # Gerenciar produtos
│   │   │   ├── UploadXML.jsx     # Upload de XMLs
│   │   │   ├── Reports.jsx       # Relatórios
│   │   │   ├── Catalog.jsx       # Catálogo completo
│   │   │   └── Users.jsx         # Gerenciar usuários (admin)
│   │   ├── services/
│   │   │   └── api.js            # Cliente API (Axios)
│   │   ├── App.jsx               # Rotas da aplicação
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Estilos globais + Tailwind
│   ├── public/
│   │   └── solocloud.svg         # Favicon
│   ├── index.html                # HTML template
│   ├── tailwind.config.js        # Configuração Tailwind
│   ├── vite.config.js            # Configuração Vite
│   └── package.json              # Dependências Node
│
├── .github/workflows/
│   └── main_mapa-app-clean-8270.yml  # CI/CD GitHub Actions
│
├── startup.sh                    # Script de inicialização Azure
├── requirements.txt              # Dependências Python
└── CLAUDE.md                     # Contexto para IAs
```

## Funcionalidades

### Autenticação e Segurança
- Login JWT com tokens seguros (expiração configurável)
- Dois níveis de acesso: **Admin** e **User**
- Validação de senha forte (12+ caracteres, maiúscula, minúscula, número, especial)
- Rate limiting (5 tentativas/minuto no login)
- Hash bcrypt (custo 12)
- Proteção CORS configurável

### Dashboard
- Estatísticas em tempo real (empresas, produtos, uploads, relatórios)
- Atividades recentes com timestamps relativos
- Ações rápidas para navegação
- Tutorial "Como Funciona"

### Perfil do Usuário
- Visualização de estatísticas pessoais
- Últimos uploads e relatórios
- Edição de dados pessoais
- Alteração de senha com validação

### Catálogo Hierárquico
- **Empresas**: Cadastro com registro MAPA parcial (ex: "PR-12345")
- **Produtos**: Vinculados a empresas, com registro MAPA parcial (ex: "6.000001")
- **Registro Completo**: Concatenação automática (ex: "PR-12345-6.000001")

### Upload e Processamento
- Upload de XMLs de NF-e
- Validação multi-camada (extensão, MIME, magic numbers)
- Preview antes de confirmar
- Extração automática de dados
- Cadastro de itens faltantes na tela de preview

### Geração de Relatórios
- Processamento de XMLs por período
- Matching automático com catálogo
- Agregação por registro MAPA
- Separação Import vs Domestic
- Conversão automática para Toneladas
- Download em Excel (formato oficial MAPA)

## API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/admin/auth/login` | Login (retorna JWT) |
| GET | `/api/admin/me` | Info do usuário logado |

### Administração (Admin only)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/users` | Listar usuários |
| POST | `/api/admin/users` | Criar usuário |
| PATCH | `/api/admin/users/{id}` | Atualizar usuário |
| DELETE | `/api/admin/users/{id}` | Deletar usuário |
| GET | `/api/admin/dashboard-stats` | Estatísticas do sistema |

### Perfil do Usuário
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/user/profile` | Dados do perfil |
| PATCH | `/api/user/profile` | Atualizar perfil |
| POST | `/api/user/change-password` | Alterar senha |
| GET | `/api/user/stats` | Estatísticas pessoais |

### Catálogo
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/user/companies` | Listar empresas |
| POST | `/api/user/companies` | Criar empresa |
| PATCH | `/api/user/companies/{id}` | Atualizar empresa |
| DELETE | `/api/user/companies/{id}` | Deletar empresa |
| GET | `/api/user/products` | Listar produtos |
| POST | `/api/user/products` | Criar produto |
| GET | `/api/user/catalog` | Catálogo completo |

### Upload e Relatórios
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/user/upload-preview` | Preview do XML |
| POST | `/api/user/upload-confirm` | Confirmar upload |
| GET | `/api/user/uploads` | Histórico de uploads |
| POST | `/api/user/generate-report` | Gerar relatório |
| GET | `/api/user/reports` | Listar relatórios |

## Instalação Local

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
# Clone o repositório
git clone <repo-url>
cd solocloud

# Crie virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instale dependências
pip install -r requirements.txt

# Configure variáveis de ambiente
export DATABASE_URL="postgresql://user:pass@localhost:5432/solocloud"
export SECRET_KEY="sua-chave-secreta-aqui"

# Inicie o backend
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Instale dependências
npm install

# Inicie em modo desenvolvimento
npm run dev
```

### Acesse
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Deploy

O deploy é automático via GitHub Actions. Ao fazer push para `main`:

1. GitHub Actions é acionado
2. Build do frontend React (`npm run build`)
3. Empacotamento do backend + frontend/dist
4. Deploy para Azure App Service
5. FastAPI serve React em produção

### Variáveis de Ambiente (Azure)

```
DATABASE_URL=postgresql://...
SECRET_KEY=...
CORS_ORIGINS=https://mapa-app-clean-8270.azurewebsites.net
```

## Identidade Visual

### Cores do Tema SoloCloud
- **Emerald** (#10b981): Representa SOLO (terra/agricultura)
- **Sky** (#0ea5e9): Representa CLOUD (nuvem/tecnologia)
- **Violet** (#a855f7): Representa TECH (inovação)

### Gradientes
- `from-emerald-600 via-sky-600 to-violet-700`: Gradiente principal
- Transição visual "Da Terra à Nuvem"

### Logo
- Ícone duplo: Sprout (broto) + Cloud (nuvem)
- Representa a união do agro com a tecnologia cloud

## Contato

- **Administrador**: rhyan.hdr@gmail.com
- **Suporte**: Via links de contato na página de login

## Licença

Proprietário - Todos os direitos reservados

---

**Versão**: 2.0.0
**Nome**: SoloCloud
**Tagline**: Da Terra à Nuvem
**Última Atualização**: 2025-11-21
