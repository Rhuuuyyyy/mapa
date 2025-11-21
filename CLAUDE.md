# CLAUDE.md - Contexto do Projeto para IAs

> Este arquivo fornece contexto completo sobre o projeto SoloCloud para assistentes de IA.
> Leia este arquivo primeiro antes de fazer alterações no código.

## Visão Geral Rápida

**Nome**: SoloCloud
**Tagline**: "Da Terra à Nuvem"
**Propósito**: Automação de relatórios MAPA para o agronegócio brasileiro
**Stack**: FastAPI (Python) + React + PostgreSQL + Azure

## O Que Este Sistema Faz

1. **Upload de NF-e**: Usuários fazem upload de XMLs de notas fiscais eletrônicas
2. **Catálogo**: Cadastram empresas e produtos com registros MAPA
3. **Processamento**: Sistema extrai dados dos XMLs e faz matching com catálogo
4. **Relatórios**: Gera relatórios trimestrais no formato oficial do Ministério da Agricultura

## Estrutura de Arquivos Importante

```
/app                    → Backend FastAPI
/app/main.py            → Entry point, também serve o React em produção
/app/routers/admin.py   → Endpoints administrativos (/api/admin/*)
/app/routers/user.py    → Endpoints do usuário (/api/user/*)
/app/models.py          → Modelos SQLAlchemy (User, Company, Product, XMLUpload, Report)
/app/schemas.py         → Schemas Pydantic para validação
/app/auth.py            → Autenticação JWT e hashing de senhas

/frontend               → Frontend React + Vite
/frontend/src/pages     → Páginas da aplicação (Login, Dashboard, Profile, etc)
/frontend/src/components → Componentes reutilizáveis (Layout)
/frontend/src/contexts  → Contextos React (AuthContext)
/frontend/src/services  → Cliente API (api.js com Axios)
```

## Modelos de Dados

### User (Usuário)
```python
- id: Integer (PK)
- email: String (unique)
- hashed_password: String
- full_name: String
- company_name: String (nullable)
- is_active: Boolean (default True)
- is_admin: Boolean (default False)
- created_at: DateTime
- updated_at: DateTime
```

### Company (Empresa)
```python
- id: Integer (PK)
- user_id: Integer (FK → users)
- company_name: String
- mapa_registration: String  # Ex: "PR-12345"
- created_at: DateTime
```

### Product (Produto)
```python
- id: Integer (PK)
- company_id: Integer (FK → companies)  # NÃO tem user_id direto!
- product_name: String
- mapa_registration: String  # Ex: "6.000001"
- product_reference: String (nullable)
- created_at: DateTime
```

### XMLUpload
```python
- id: Integer (PK)
- user_id: Integer (FK → users)
- filename: String
- file_path: String
- upload_date: DateTime
- period: String  # Ex: "Q1-2025"
- status: String  # pending, processed, error
```

### Report
```python
- id: Integer (PK)
- user_id: Integer (FK → users)
- xml_upload_id: Integer (FK → xml_uploads, nullable)
- report_period: String  # Ex: "Q1-2025"
- generated_at: DateTime  # NÃO é created_at!
- file_path: String
```

## Padrões de Código

### Backend (FastAPI)

**Dependências comuns:**
```python
from app import models, schemas, auth
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

# Obter usuário logado
current_user: models.User = Depends(auth.get_current_user)

# Obter admin logado (requer is_admin=True)
current_admin: models.User = Depends(auth.get_current_admin)

# Obter sessão do banco
db: Session = Depends(get_db)
```

**Rotas de API:**
- `/api/admin/*` → Endpoints administrativos
- `/api/user/*` → Endpoints do usuário comum

### Frontend (React)

**Estrutura de página:**
```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const MinhaPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/user/endpoint');
        setData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (/* JSX */);
};
```

**Classes CSS personalizadas (Tailwind):**
- `btn-primary` → Botão gradiente emerald→sky
- `btn-secondary` → Botão outline
- `btn-cloud` → Botão azul (sky)
- `btn-solo` → Botão verde (emerald)
- `card` → Card branco com sombra
- `input-field` → Input estilizado
- `badge-solo` → Badge verde
- `badge-cloud` → Badge azul
- `text-gradient` → Texto com gradiente

## Identidade Visual

### Cores principais
| Nome | Hex | Uso |
|------|-----|-----|
| Emerald | #10b981 | SOLO (terra, agricultura) |
| Sky | #0ea5e9 | CLOUD (nuvem, tecnologia) |
| Violet | #a855f7 | TECH (inovação, premium) |

### Gradientes
- Principal: `from-emerald-600 via-sky-600 to-violet-700`
- Alt: `from-emerald-400 via-sky-500 to-violet-500`

### Logo
- Ícone: Sprout (broto) + Cloud (nuvem)
- Significado: União do agro com tecnologia cloud

## Cuidados Importantes

### Ao editar modelos (models.py):
1. Product NÃO tem `user_id` direto - pertence a Company que pertence a User
2. Report usa `report_period` e `generated_at` (não `period` e `created_at`)

### Ao criar endpoints:
1. Sempre use `Depends(get_db)` para sessão do banco
2. Use `Depends(auth.get_current_user)` para autenticação
3. Use `Depends(auth.get_current_admin)` para endpoints admin-only

### Ao editar frontend:
1. Sempre use classes Tailwind existentes quando possível
2. Mantenha a paleta de cores (emerald, sky, violet)
3. Use ícones do Lucide React

### Ao contar produtos do usuário:
```python
# ERRADO - Product não tem user_id
db.query(models.Product).filter(models.Product.user_id == user.id).count()

# CORRETO - Via join com Company
db.query(models.Product).join(models.Company).filter(
    models.Company.user_id == user.id
).count()
```

## URLs de Produção

- **App**: https://mapa-app-clean-8270.azurewebsites.net
- **API Docs**: https://mapa-app-clean-8270.azurewebsites.net/docs
- **Health**: https://mapa-app-clean-8270.azurewebsites.net/health

## Deploy

O deploy é automático via GitHub Actions ao fazer push para `main`:
1. Build do React (`npm run build`)
2. Empacota backend + frontend/dist
3. Deploy para Azure App Service
4. FastAPI serve React em produção via catch-all route

## Contato

- **Admin**: rhyan.hdr@gmail.com
- Usado nos links "Esqueceu a senha?" e "Entre em contato" do login

## Comandos Úteis

```bash
# Backend local
uvicorn app.main:app --reload

# Frontend local
cd frontend && npm run dev

# Build frontend
cd frontend && npm run build

# Ver logs Azure
az webapp log tail --name mapa-app-clean-8270 --resource-group rgMapaSaas
```

## Histórico de Mudanças Recentes

### 2025-11-21
- Rebrand de "MAPA SaaS" para "SoloCloud"
- Nova identidade visual (emerald + sky + violet)
- Implementação da página "Meu Perfil" com estatísticas
- Implementação da página "Configurações" com edição de perfil e senha
- Dashboard com dados reais (não mais mockados)
- Funcionalidade "Lembrar-me" no login
- Links de contato com administrador (mailto)
- Favicon SVG com logo SoloCloud
- Título da aba atualizado para "SoloCloud"

---

**Última atualização**: 2025-11-21
**Versão**: 2.0.0
