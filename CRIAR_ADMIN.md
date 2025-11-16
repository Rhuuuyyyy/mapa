# 🔐 Como Criar o Primeiro Usuário Admin

O banco de dados PostgreSQL está vazio. Você precisa criar o primeiro usuário administrador para começar a usar o sistema.

---

## Opção 1: Script Python (Mais Fácil) ⭐⭐⭐⭐⭐

### 1. Crie o arquivo `scripts/create_first_admin.py`:

```python
#!/usr/bin/env python3
"""
Script para criar o primeiro usuário admin no MAPA SaaS.
Execute este script UMA VEZ para criar o administrador inicial.
"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

def create_admin():
    """Cria o primeiro usuário admin."""

    # Dados do admin
    email = input("Email do admin: ").strip()
    password = input("Senha (mínimo 12 caracteres): ").strip()
    full_name = input("Nome completo: ").strip()
    company_name = input("Nome da empresa: ").strip()

    # Validar senha
    if len(password) < 12:
        print("❌ Senha deve ter no mínimo 12 caracteres!")
        return

    # Conectar ao banco
    db = SessionLocal()

    try:
        # Verificar se já existe admin
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"❌ Usuário com email {email} já existe!")
            return

        # Criar admin
        admin = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            company_name=company_name,
            is_active=True,
            is_admin=True
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("\n✅ Admin criado com sucesso!")
        print(f"   ID: {admin.id}")
        print(f"   Email: {admin.email}")
        print(f"   Nome: {admin.full_name}")
        print(f"   Empresa: {admin.company_name}")
        print(f"   Admin: {admin.is_admin}")
        print(f"\n🔑 Use estas credenciais para fazer login!")

    except Exception as e:
        print(f"❌ Erro ao criar admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("  CRIAR PRIMEIRO USUÁRIO ADMIN - MAPA SaaS v2.0.0")
    print("=" * 60)
    print()
    create_admin()
```

### 2. Configure as variáveis de ambiente:

```bash
export DATABASE_URL="postgresql://seu_user:sua_senha@mapa-db-clean-8270.postgres.database.azure.com:5432/mapa_saas?sslmode=require"
export SECRET_KEY="sua-secret-key-aqui"
```

### 3. Execute o script:

```bash
cd /home/user/mapa
source antenv/bin/activate
python scripts/create_first_admin.py
```

### 4. Siga as instruções interativas:

```
Email do admin: admin@empresa.com
Senha (mínimo 12 caracteres): SenhaForte123!@#
Nome completo: João Silva
Nome da empresa: Minha Empresa LTDA
```

---

## Opção 2: SQL Direto no Azure Portal ⭐⭐⭐

### 1. Gere o hash da senha primeiro

Execute localmente:
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
senha = "SenhaForte123!@#"
hash_senha = pwd_context.hash(senha)
print(hash_senha)
```

### 2. No Azure Portal:

1. Vá para **Azure Portal** → **PostgreSQL Flexible Server** → `mapa-db-clean-8270`
2. Clique em **Query Editor** (menu lateral)
3. Faça login com as credenciais do banco
4. Execute:

```sql
INSERT INTO users (
    email,
    hashed_password,
    full_name,
    company_name,
    is_active,
    is_admin,
    created_at
)
VALUES (
    'admin@empresa.com',
    '$2b$12$hash_gerado_acima_aqui',  -- Cole o hash gerado
    'João Silva',
    'Minha Empresa LTDA',
    TRUE,
    TRUE,
    NOW()
);
```

### 3. Verifique:

```sql
SELECT id, email, full_name, is_admin, created_at
FROM users
WHERE email = 'admin@empresa.com';
```

---

## Opção 3: Via API REST (Primeiro Admin Bypass) ⭐⭐

Se você modificar temporariamente o código para permitir criação sem autenticação:

### 1. Adicione endpoint temporário em `app/routers/admin.py`:

```python
@router.post("/auth/register-first-admin", response_model=schemas.UserResponse)
async def register_first_admin(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    TEMPORÁRIO: Cria o primeiro admin.
    REMOVA ESTE ENDPOINT APÓS CRIAR O PRIMEIRO ADMIN!
    """
    # Verificar se já existe algum admin
    existing_admin = db.query(models.User).filter(
        models.User.is_admin == True
    ).first()

    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin já existe. Use o login normal."
        )

    # Validar senha
    is_valid, message = auth.validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )

    # Criar admin
    hashed_password = auth.get_password_hash(user_data.password)
    new_admin = models.User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        company_name=user_data.company_name,
        is_admin=True  # Forçar admin
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return new_admin
```

### 2. Faça request via curl:

```bash
curl -X POST https://mapa-app-clean-8270.azurewebsites.net/admin/auth/register-first-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "SenhaForte123!@#",
    "full_name": "João Silva",
    "company_name": "Minha Empresa LTDA",
    "is_admin": true
  }'
```

### 3. IMPORTANTE: REMOVA este endpoint depois!

---

## Validação de Senha

O sistema exige:
- ✅ Mínimo 12 caracteres
- ✅ Pelo menos 1 letra maiúscula
- ✅ Pelo menos 1 letra minúscula
- ✅ Pelo menos 1 número
- ✅ Pelo menos 1 caractere especial

Exemplos válidos:
- `Admin@Mapa2025!`
- `SenhaForte123!@#`
- `Segura#2025Admin`

---

## Testar o Login

Depois de criar o admin:

```bash
curl -X POST https://mapa-app-clean-8270.azurewebsites.net/admin/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@empresa.com&password=SenhaForte123!@#"
```

**Resposta esperada**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## Usar o Token

Com o token, você pode acessar endpoints protegidos:

```bash
TOKEN="seu_token_aqui"

curl -X GET https://mapa-app-clean-8270.azurewebsites.net/admin/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Recomendação Final

**Use a Opção 1** (Script Python) se você tiver acesso ao servidor ou puder executar localmente com a string de conexão do Azure.

**Use a Opção 2** (SQL direto) se preferir trabalhar direto no Azure Portal.

**Evite a Opção 3** em produção - é menos segura.

---

**Criado**: 2025-11-16
**Para**: MAPA SaaS v2.0.0
