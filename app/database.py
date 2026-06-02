"""
Configuração do banco de dados SQLAlchemy.
Setup simples e direto com session factory.
"""

import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

# Engine SQLAlchemy com tratamento de erro
try:
    _url = settings.database_url
    if _url.startswith("sqlite"):
        engine = create_engine(
            _url,
            connect_args={"check_same_thread": False},
        )
    else:
        engine = create_engine(
            _url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            pool_recycle=300,
            pool_timeout=30,
            echo=False,
        )
    logger.info("✓ Database engine created successfully")
except Exception as e:
    logger.error(f"❌ Failed to create database engine: {e}")
    raise

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para models
Base = declarative_base()


def get_db():
    """
    Dependency para obter sessão do banco.
    Uso: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Inicializa o banco de dados (cria tabelas).
    Chamado no startup do app de forma não-bloqueante.
    """
    try:
        Base.metadata.create_all(bind=engine)
        return True
    except Exception as e:
        print(f"⚠️ Database initialization deferred: {e}")
        return False
