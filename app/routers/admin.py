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
# DASHBOARD STATISTICS
# ============================================================================

@router.get("/dashboard-stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Retorna estatísticas do dashboard.
    - Admin: vê estatísticas globais do sistema
    - Usuário: vê apenas suas próprias estatísticas
    """
    from datetime import datetime, timedelta
    from sqlalchemy import func

    # Define o filtro base
    if current_user.is_admin:
        # Admin vê tudo
        user_filter = True
        company_user_filter = True
    else:
        # Usuário vê apenas seus dados
        user_filter = models.XMLUpload.user_id == current_user.id
        company_user_filter = models.Company.user_id == current_user.id

    # Totais
    if current_user.is_admin:
        total_companies = db.query(models.Company).count()
        total_products = db.query(models.Product).count()
        total_uploads = db.query(models.XMLUpload).count()
        total_reports = db.query(models.Report).count()
        total_users = db.query(models.User).count()
    else:
        total_companies = db.query(models.Company).filter(
            models.Company.user_id == current_user.id
        ).count()
        total_products = db.query(models.Product).join(models.Company).filter(
            models.Company.user_id == current_user.id
        ).count()
        total_uploads = db.query(models.XMLUpload).filter(
            models.XMLUpload.user_id == current_user.id
        ).count()
        total_reports = db.query(models.Report).filter(
            models.Report.user_id == current_user.id
        ).count()
        total_users = 1

    # Calcular período do mês atual e anterior
    now = datetime.utcnow()
    first_day_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    first_day_last_month = (first_day_this_month - timedelta(days=1)).replace(day=1)

    # Estatísticas deste mês
    if current_user.is_admin:
        companies_this_month = db.query(models.Company).filter(
            models.Company.created_at >= first_day_this_month
        ).count()
        products_this_month = db.query(models.Product).filter(
            models.Product.created_at >= first_day_this_month
        ).count()
        uploads_this_month = db.query(models.XMLUpload).filter(
            models.XMLUpload.upload_date >= first_day_this_month
        ).count()
        reports_this_month = db.query(models.Report).filter(
            models.Report.generated_at >= first_day_this_month
        ).count()
    else:
        companies_this_month = db.query(models.Company).filter(
            models.Company.user_id == current_user.id,
            models.Company.created_at >= first_day_this_month
        ).count()
        products_this_month = db.query(models.Product).join(models.Company).filter(
            models.Company.user_id == current_user.id,
            models.Product.created_at >= first_day_this_month
        ).count()
        uploads_this_month = db.query(models.XMLUpload).filter(
            models.XMLUpload.user_id == current_user.id,
            models.XMLUpload.upload_date >= first_day_this_month
        ).count()
        reports_this_month = db.query(models.Report).filter(
            models.Report.user_id == current_user.id,
            models.Report.generated_at >= first_day_this_month
        ).count()

    # Atividades recentes (últimas 10)
    recent_activities = []

    # Buscar uploads recentes
    if current_user.is_admin:
        recent_uploads = db.query(models.XMLUpload).order_by(
            models.XMLUpload.upload_date.desc()
        ).limit(5).all()
    else:
        recent_uploads = db.query(models.XMLUpload).filter(
            models.XMLUpload.user_id == current_user.id
        ).order_by(models.XMLUpload.upload_date.desc()).limit(5).all()

    for upload in recent_uploads:
        recent_activities.append({
            "type": "upload",
            "action": f"XML processado: {upload.filename[:30]}..." if len(upload.filename) > 30 else f"XML processado: {upload.filename}",
            "timestamp": upload.upload_date.isoformat() if upload.upload_date else None,
            "status": "success"
        })

    # Buscar relatórios recentes
    if current_user.is_admin:
        recent_reports = db.query(models.Report).order_by(
            models.Report.generated_at.desc()
        ).limit(5).all()
    else:
        recent_reports = db.query(models.Report).filter(
            models.Report.user_id == current_user.id
        ).order_by(models.Report.generated_at.desc()).limit(5).all()

    for report in recent_reports:
        recent_activities.append({
            "type": "report",
            "action": f"Relatório {report.report_period} gerado",
            "timestamp": report.generated_at.isoformat() if report.generated_at else None,
            "status": "success"
        })

    # Buscar empresas recentes
    if current_user.is_admin:
        recent_companies = db.query(models.Company).order_by(
            models.Company.created_at.desc()
        ).limit(3).all()
    else:
        recent_companies = db.query(models.Company).filter(
            models.Company.user_id == current_user.id
        ).order_by(models.Company.created_at.desc()).limit(3).all()

    for company in recent_companies:
        recent_activities.append({
            "type": "company",
            "action": f"Empresa cadastrada: {company.company_name[:25]}..." if len(company.company_name) > 25 else f"Empresa cadastrada: {company.company_name}",
            "timestamp": company.created_at.isoformat() if company.created_at else None,
            "status": "info"
        })

    # Buscar produtos recentes
    if current_user.is_admin:
        recent_products = db.query(models.Product).order_by(
            models.Product.created_at.desc()
        ).limit(3).all()
    else:
        recent_products = db.query(models.Product).join(models.Company).filter(
            models.Company.user_id == current_user.id
        ).order_by(models.Product.created_at.desc()).limit(3).all()

    for product in recent_products:
        recent_activities.append({
            "type": "product",
            "action": f"Produto cadastrado: {product.product_name[:25]}..." if len(product.product_name) > 25 else f"Produto cadastrado: {product.product_name}",
            "timestamp": product.created_at.isoformat() if product.created_at else None,
            "status": "info"
        })

    # Ordenar atividades por timestamp (mais recentes primeiro)
    recent_activities.sort(
        key=lambda x: x["timestamp"] if x["timestamp"] else "",
        reverse=True
    )

    # Limitar a 10 atividades
    recent_activities = recent_activities[:10]

    return {
        "totals": {
            "companies": total_companies,
            "products": total_products,
            "uploads": total_uploads,
            "reports": total_reports,
            "users": total_users if current_user.is_admin else None
        },
        "this_month": {
            "companies": companies_this_month,
            "products": products_this_month,
            "uploads": uploads_this_month,
            "reports": reports_this_month
        },
        "recent_activities": recent_activities,
        "is_admin": current_user.is_admin
    }
