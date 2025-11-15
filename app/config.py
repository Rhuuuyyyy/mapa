"""
Configurações da aplicação usando Pydantic Settings.
Todas as variáveis de ambiente são carregadas automaticamente.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Configurações centralizadas da aplicação"""

    # Aplicação
    app_name: str = "MAPA SaaS"
    app_version: str = "2.0.0"
    debug: bool = False

    # Banco de Dados
    database_url: str

    # Segurança
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS
    allowed_origins: List[str] = ["*"]

    # Upload
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    upload_dir: str = "uploads"
    allowed_extensions: List[str] = ["xml", "pdf"]

    # Azure
    websites_port: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow"
    )


# Instância global de configurações
settings = Settings()
