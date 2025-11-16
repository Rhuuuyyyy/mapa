"""
Configurações da aplicação usando Pydantic Settings.
Todas as variáveis de ambiente são carregadas automaticamente.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union


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

    # CORS - Aceita string com vírgulas ou lista
    allowed_origins: Union[str, List[str]] = "*"

    # Upload
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    upload_dir: str = "uploads"
    allowed_extensions: List[str] = ["xml", "pdf"]

    # Azure
    websites_port: int = 8000

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        """
        Converte ALLOWED_ORIGINS de string para lista.
        Aceita:
        - "*" -> ["*"]
        - "url1,url2" -> ["url1", "url2"]
        - ["url1", "url2"] -> ["url1", "url2"]
        """
        if isinstance(v, str):
            # Se for asterisco, retorna lista com asterisco
            if v.strip() == "*":
                return ["*"]
            # Se contém vírgulas, divide
            if "," in v:
                return [origin.strip() for origin in v.split(",") if origin.strip()]
            # Se é uma URL única, retorna lista com essa URL
            return [v.strip()]
        # Se já é lista, retorna como está
        if isinstance(v, list):
            return v
        # Fallback
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow"
    )


# Instância global de configurações
settings = Settings()
