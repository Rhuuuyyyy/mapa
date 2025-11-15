"""
Configuração do banco de dados SQLAlchemy.
Setup simples e direto com session factory.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Engine SQLAlchemy
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Verifica conexão antes de usar
    pool_size=5,
    max_overflow=10,
    echo=settings.debug  # Log SQL queries em debug mode
)

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
