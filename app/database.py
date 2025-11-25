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
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,  # Verifica conexão antes de usar
        pool_size=10,  # PERFORMANCE: Aumentado de 5 para 10 (mais conexões simultâneas)
        max_overflow=20,  # PERFORMANCE: Aumentado de 10 para 20 (total: 30 conexões)
        pool_recycle=300,  # PERFORMANCE: Reduzido de 3600 para 300s (5min - menos tempo com conexões stale)
        pool_timeout=30,  # Timeout de 30s para pegar conexão do pool
        echo=False  # PERFORMANCE: NUNCA logar queries (mesmo em debug, usar logging.debug se necessário)
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
