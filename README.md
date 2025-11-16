# MAPA SaaS v2.0.0

Sistema de Automação de Relatórios MAPA (Ministério da Agricultura, Pecuária e Abastecimento)

## 🚀 Status do Deploy

✅ **APLICAÇÃO EM PRODUÇÃO** - Azure App Service
🌐 **URL**: https://mapa-app-clean-8270.azurewebsites.net
📚 **API Docs**: https://mapa-app-clean-8270.azurewebsites.net/docs
🔍 **Health**: https://mapa-app-clean-8270.azurewebsites.net/health

**Deploy**: Automático via GitHub Actions → Branch `main`
**Infraestrutura**: Azure App Service + PostgreSQL Flexible Server
**Última atualização**: 2025-11-16

📖 **Guias rápidos**:
- [DEPLOY_SUCESSO.md](DEPLOY_SUCESSO.md) - Detalhes do deploy concluído
- [CRIAR_ADMIN.md](CRIAR_ADMIN.md) - Como criar o primeiro usuário admin

## Sobre o Projeto

MAPA SaaS é uma aplicação web desenvolvida para automatizar o processo de geração de relatórios trimestrais MAPA. O sistema permite que empresas:

- Façam upload de XMLs de NF-e (Notas Fiscais Eletrônicas)
- Cadastrem empresas e produtos em um catálogo hierárquico
- Gerem automaticamente relatórios Excel no formato oficial MAPA
- Validem dados e identifiquem itens faltantes antes da geração

## Funcionalidades Principais

### Autenticação
- Login JWT com tokens seguros
- Dois níveis de acesso: Admin e User
- Validação de senha forte (12+ caracteres)
- Rate limiting (5 tentativas/minuto)

### Upload e Processamento
- Upload de XMLs e PDFs de NF-e
- Validação multi-camada de segurança
- Extração automática de dados (emitente, destinatário, produtos)
- Processamento de nutrientes e registros MAPA

### Catálogo Hierárquico
- **Empresas**: Cadastro com registro MAPA parcial (ex: "PR-12345")
- **Produtos**: Vinculados a empresas, com registro MAPA parcial (ex: "6.000001")
- **Registro Completo**: Concatenação automática (ex: "PR-12345-6.000001")

### Geração de Relatórios
- Processamento de todos os XMLs do usuário
- Matching automático com catálogo
- Agregação por registro MAPA
- Separação Import vs Domestic
- Conversão automática de unidades para Toneladas
- Geração de Excel no formato oficial MAPA

### Dashboard
- Listagem de uploads processados
- Visualização do catálogo completo
- Status de itens faltantes
- Interface intuitiva e responsiva

## Arquitetura Técnica

### Stack
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Processamento**: lxml, pdfplumber, pandas, openpyxl
- **Autenticação**: JWT (python-jose) + bcrypt
- **Deploy**: Azure App Service + PostgreSQL Flexible Server

### Estrutura do Projeto

```
mapa-saas/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configurações Pydantic
│   ├── database.py          # SQLAlchemy setup
│   ├── models.py            # Modelos ORM
│   ├── schemas.py           # Schemas Pydantic
│   ├── auth.py              # Autenticação JWT
│   ├── routers/
│   │   ├── admin.py         # Endpoints admin
│   │   └── user.py          # Endpoints user
│   └── utils/
│       ├── validators.py    # Validação de arquivos
│       ├── nfe_processor.py # Processamento NF-e
│       ├── mapa_processor.py # Matching catálogo
│       └── report_generator.py # Geração Excel
├── static/                  # CSS e JavaScript
├── templates/               # Templates HTML
├── scripts/
│   ├── azure-setup.sh       # Criar recursos Azure
│   ├── azure-deploy.sh      # Deploy
│   └── azure-logs.sh        # Logs
├── startup.sh               # Script de startup (ÚNICO!)
├── requirements.txt         # Dependências Python
└── DEPLOY.md               # Guia de deploy completo
```

## Instalação Local

### Pré-requisitos
- Python 3.11+
- PostgreSQL 14+
- pip

### Setup

1. Clone o repositório:
```bash
git clone <repo-url>
cd mapa-saas
```

2. Crie virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. Instale dependências:
```bash
pip install -r requirements.txt
```

4. Configure variáveis de ambiente:
```bash
cp .env.example .env
# Edite .env com suas configurações
```

5. Crie banco de dados:
```bash
createdb mapa_db  # PostgreSQL
```

6. Inicie a aplicação:
```bash
uvicorn app.main:app --reload
```

7. Acesse:
- App: http://localhost:8000
- Docs: http://localhost:8000/api/docs

## Deploy Azure

Veja documentação completa em **[DEPLOY.md](./DEPLOY.md)**

### Quick Start

1. **Criar recursos Azure:**
```bash
./scripts/azure-setup.sh
```

2. **Fazer deploy:**
```bash
./scripts/azure-deploy.sh
```

3. **Visualizar logs:**
```bash
./scripts/azure-logs.sh
```

## Uso

### 1. Criar Admin (primeiro acesso)

Use a API diretamente ou crie via código:

```python
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

db = SessionLocal()

admin = User(
    email="admin@example.com",
    hashed_password=get_password_hash("SenhaSegura123!"),
    full_name="Administrador",
    is_admin=True
)

db.add(admin)
db.commit()
```

### 2. Login
- Acesse `/login.html`
- Entre com email e senha
- Admin: redireciona para painel admin
- User: redireciona para dashboard

### 3. Fluxo de Trabalho (User)

1. **Upload de XMLs**
   - Aba "Uploads"
   - Selecione arquivo XML ou PDF
   - Sistema processa automaticamente

2. **Cadastrar Catálogo**
   - Aba "Catálogo"
   - Adicione empresas com registro MAPA parcial
   - Adicione produtos vinculados às empresas

3. **Gerar Relatório**
   - Aba "Relatórios"
   - Digite período (ex: Q1-2025)
   - Clique em "Gerar Relatório"
   - Sistema valida e gera Excel

## API Endpoints

### Admin
- `POST /api/admin/auth/login` - Login
- `GET /api/admin/me` - Info do usuário logado
- `POST /api/admin/users` - Criar usuário
- `GET /api/admin/users` - Listar usuários
- `DELETE /api/admin/users/{id}` - Deletar usuário

### User
- `POST /api/user/upload` - Upload XML/PDF
- `GET /api/user/uploads` - Listar uploads
- `POST /api/user/companies` - Criar empresa
- `GET /api/user/companies` - Listar empresas
- `POST /api/user/products` - Criar produto
- `GET /api/user/products` - Listar produtos
- `GET /api/user/catalog` - Catálogo completo
- `POST /api/user/generate-report` - Gerar relatório

Documentação interativa: `/api/docs`

## Segurança

- Validação de arquivos multi-camada (extensão, MIME, magic numbers)
- Proteção contra path traversal
- Rate limiting em endpoints de autenticação
- Senhas com hash bcrypt (custo 12)
- Tokens JWT com expiração configurável
- CORS configurável
- SQL injection prevention (SQLAlchemy ORM)

## Extensibilidade

### Adicionar Novo Endpoint

```python
# app/routers/user.py
@router.get("/my-new-endpoint")
async def my_new_endpoint(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Sua lógica aqui
    return {"message": "Hello!"}
```

### Adicionar Novo Modelo

```python
# app/models.py
class MyNewModel(Base):
    __tablename__ = "my_table"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
```

### Adicionar Processador

```python
# app/utils/my_processor.py
class MyProcessor:
    def process(self, data):
        # Sua lógica
        return processed_data
```

## Troubleshooting

### App não inicia
- Verifique DATABASE_URL nas variáveis de ambiente
- Verifique se PostgreSQL está rodando
- Verifique logs: `./scripts/azure-logs.sh`

### Erro ao fazer upload
- Verifique tamanho do arquivo (max 10MB)
- Verifique extensão (.xml ou .pdf)
- Verifique estrutura do XML

### Erro ao gerar relatório
- Verifique se há XMLs processados
- Verifique se empresas/produtos estão cadastrados
- Veja mensagem de erro detalhada

## Contribuindo

1. Fork o repositório
2. Crie branch para feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add nova feature'`)
4. Push para branch (`git push origin feature/nova-feature`)
5. Abra Pull Request

## Licença

Proprietário - Todos os direitos reservados

## Suporte

Para suporte, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 2.0.0
**Última Atualização**: 2025-01-15
