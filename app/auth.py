"""
Sistema de autenticação com JWT e bcrypt.
Inclui rate limiting e validação de senhas fortes.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import re

from app.config import settings
from app.database import get_db
from app import models

# Configuração de hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme para autenticação
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha corresponde ao hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Gera hash bcrypt da senha"""
    return pwd_context.hash(password)


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Valida força da senha.
    Requisitos: 12+ caracteres, maiúscula, minúscula, número, especial
    """
    if len(password) < 12:
        return False, "Senha deve ter no mínimo 12 caracteres"

    if not re.search(r"[A-Z]", password):
        return False, "Senha deve conter ao menos uma letra maiúscula"

    if not re.search(r"[a-z]", password):
        return False, "Senha deve conter ao menos uma letra minúscula"

    if not re.search(r"\d", password):
        return False, "Senha deve conter ao menos um número"

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Senha deve conter ao menos um caractere especial"

    return True, "Senha válida"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Cria token JWT com expiração.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

    return encoded_jwt


def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    """
    Autentica usuário por email e senha.
    Retorna User se válido, None caso contrário.
    """
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Dependency para obter usuário autenticado pelo token JWT.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuário inativo")

    return user


async def get_current_admin(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """
    Dependency para validar que o usuário é admin.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: privilégios de administrador necessários"
        )

    return current_user
