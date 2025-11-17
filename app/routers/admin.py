"""
Router de Admin - Autenticação e CRUD de Usuários.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from slowapi import Limiter
from slowapi.util import get_remote_address

from app import models, schemas, auth
from app.database import get_db

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


# ============================================================================
# AUTHENTICATION
# ============================================================================

@router.post("/auth/login", response_model=schemas.TokenResponse)
@limiter.limit("5/minute")  # Rate limit: 5 tentativas por minuto
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login para admin ou usuário regular.
    Retorna token JWT.
    """
    # Autenticar usuário
    user = auth.authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Criar token
    access_token = auth.create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/auth/setup-first-admin", response_model=schemas.UserResponse)
async def setup_first_admin(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    ENDPOINT TEMPORÁRIO: Cria o primeiro usuário admin.

    ⚠️ IMPORTANTE: Este endpoint só funciona se não existir nenhum admin.
    Após criar o primeiro admin, este endpoint retorna erro 403.

    REMOVA ESTE ENDPOINT EM PRODUÇÃO após criar o admin inicial!
    """
    # Verificar se já existe algum admin
    existing_admin = db.query(models.User).filter(
        models.User.is_admin == True
    ).first()

    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Já existe um administrador no sistema. Use o login normal."
        )

    # Verificar se email já existe
    existing_user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )

    # Validar força da senha
    is_valid, message = auth.validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )

    # Criar primeiro admin
    hashed_password = auth.get_password_hash(user_data.password)
    new_admin = models.User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        company_name=user_data.company_name,
        is_admin=True,  # Forçar como admin
        is_active=True
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return new_admin


@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_info(
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Retorna informações do usuário logado.
    """
    return current_user


# ============================================================================
# USER MANAGEMENT (ADMIN ONLY)
# ============================================================================

@router.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """
    Cria novo usuário (apenas admin).
    Valida força da senha antes de criar.
    """
    # Verificar se email já existe
    existing_user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )

    # Validar força da senha
    is_valid, message = auth.validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )

    # Criar usuário
    hashed_password = auth.get_password_hash(user_data.password)

    new_user = models.User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        company_name=user_data.company_name,
        is_admin=user_data.is_admin
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.get("/users", response_model=List[schemas.UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """
    Lista todos os usuários (apenas admin).
    """
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=schemas.UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """
    Obtém usuário por ID (apenas admin).
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    return user


@router.patch("/users/{user_id}", response_model=schemas.UserResponse)
async def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """
    Atualiza usuário (apenas admin).
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    # Atualizar campos fornecidos
    update_data = user_update.dict(exclude_unset=True)

    # Se senha fornecida, validar e hashear
    if "password" in update_data:
        is_valid, message = auth.validate_password_strength(update_data["password"])
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        update_data["hashed_password"] = auth.get_password_hash(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    """
    Deleta usuário (apenas admin).
    Cascade delete remove todos os dados relacionados.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    # Não permitir deletar a si mesmo
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar o próprio usuário"
        )

    db.delete(user)
    db.commit()

    return None


# ============================================================================
# TEMPORARY MIGRATION ENDPOINT
# ============================================================================

@router.post("/migrate/add-period-column")
async def run_migration_add_period(
    db: Session = Depends(get_db)
):
    """
    ENDPOINT TEMPORÁRIO: Adiciona coluna 'period' na tabela xml_uploads.

    ⚠️ IMPORTANTE: Este endpoint deve ser REMOVIDO após executar a migração!

    Este endpoint executa a migração diretamente no banco de dados para adicionar
    a coluna 'period' que está faltando e causando erros 500.
    """
    from sqlalchemy import text

    try:
        # Verificar se a coluna já existe
        result = db.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'xml_uploads'
            AND column_name = 'period'
        """))

        existing_column = result.fetchone()

        if existing_column:
            return {
                "status": "already_exists",
                "message": "✅ Coluna 'period' já existe na tabela xml_uploads",
                "detail": "Nenhuma ação necessária. A migração já foi executada anteriormente."
            }

        # Adicionar coluna
        db.execute(text("""
            ALTER TABLE xml_uploads
            ADD COLUMN period VARCHAR(20)
        """))
        db.commit()

        return {
            "status": "success",
            "message": "✅ Coluna 'period' adicionada com sucesso à tabela xml_uploads!",
            "detail": "A migração foi executada. Os erros 500 devem ter sido corrigidos.",
            "next_steps": [
                "Teste fazer upload de um XML",
                "Tente gerar um relatório",
                "Verifique se os erros 500 sumiram",
                "IMPORTANTE: Remova este endpoint em produção!"
            ]
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao executar migração: {str(e)}"
        )
