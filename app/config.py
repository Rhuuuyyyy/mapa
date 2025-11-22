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
    # Inclui localhost para desenvolvimento
    allowed_origins: Union[str, List[str]] = "http://localhost:3000,https://mapa-app-clean-8270.azurewebsites.net"

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
        Sempre inclui localhost:3000 para desenvolvimento.
        Aceita:
        - "*" -> ["*"] (APENAS em modo DEBUG)
        - "url1,url2" -> ["url1", "url2"]
        - ["url1", "url2"] -> ["url1", "url2"]

        SEGURANÇA: Wildcard "*" só é permitido em modo debug.
        """
        import os

        # Lista base com localhost para desenvolvimento
        allowed = ["http://localhost:3000"]

        if isinstance(v, str):
            # SEGURANÇA: Wildcard só é permitido em modo debug
            if v.strip() == "*":
                debug_mode = os.getenv("DEBUG", "false").lower() == "true"
                if not debug_mode:
                    import logging
                    logging.warning(
                        "SEGURANÇA: ALLOWED_ORIGINS='*' ignorado em produção. "
                        "Configure origens específicas ou habilite DEBUG=true."
                    )
                    # Em produção, usar apenas localhost (desenvolvimento será feito localmente)
                    return ["http://localhost:3000"]
                return ["*"]
            # Se contém vírgulas, divide e adiciona
            if "," in v:
                origins = [origin.strip() for origin in v.split(",") if origin.strip()]
                allowed.extend(origins)
            # Se é uma URL única, adiciona
            elif v.strip():
                allowed.append(v.strip())
        # Se já é lista, adiciona todas
        elif isinstance(v, list):
            allowed.extend(v)

        # Remove duplicatas mantendo ordem
        seen = set()
        unique_origins = []
        for origin in allowed:
            if origin not in seen:
                seen.add(origin)
                unique_origins.append(origin)

        return unique_origins if unique_origins else ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow"
    )


# Instância global de configurações
settings = Settings()
