"""
Validadores de segurança para uploads de arquivos.
Valida extensão, MIME type, magic numbers e tamanho.
"""

import logging
import os
import re
from pathlib import Path

logger = logging.getLogger(__name__)

# Import lazy de magic para evitar falha se libmagic não estiver instalado
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
    logger.warning("⚠️ python-magic não disponível - validação MIME será limitada")


ALLOWED_EXTENSIONS = {"xml", "pdf"}

ALLOWED_MIME_TYPES = {
    "application/xml",
    "text/xml",
    "application/pdf"
}

# Magic numbers (primeiros bytes dos arquivos)
MAGIC_NUMBERS = {
    "xml": [b"<?xml", b"<"],
    "pdf": [b"%PDF"]
}


def sanitize_filename(filename: str) -> str:
    """
    Sanitiza nome do arquivo para prevenir path traversal.
    Remove caracteres perigosos e mantém apenas alfanuméricos, '.', '_', '-'.
    """
    # Remover path (caso filename contenha caminho)
    filename = Path(filename).name

    # Permitir apenas caracteres seguros
    safe_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)

    return safe_filename


def validate_file_extension(filename: str) -> str:
    """
    Valida extensão do arquivo.
    Retorna extensão em lowercase.
    """
    extension = Path(filename).suffix.lower().lstrip('.')

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Extensão '{extension}' não permitida. "
            f"Extensões permitidas: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    return extension


def validate_mime_type(content: bytes) -> str:
    """
    Valida MIME type usando python-magic.
    SEGURANÇA: Em produção, esta validação é obrigatória.
    """
    if not MAGIC_AVAILABLE:
        # SEGURANÇA: Em produção, não permitir bypass da validação MIME
        debug_mode = os.getenv("DEBUG", "false").lower() == "true"
        if not debug_mode:
            logger.error(
                "SEGURANÇA: python-magic não está disponível. "
                "Instale libmagic: apt-get install libmagic1"
            )
            raise ValueError(
                "Validação de tipo de arquivo não disponível. "
                "Contate o administrador do sistema."
            )
        # Em desenvolvimento, permite bypass com aviso
        logger.warning("SEGURANÇA: Validação MIME ignorada em modo DEBUG")
        return "application/octet-stream"

    try:
        mime = magic.from_buffer(content, mime=True)

        if mime not in ALLOWED_MIME_TYPES:
            raise ValueError(
                f"Tipo de arquivo '{mime}' não permitido. "
                f"Tipos permitidos: {', '.join(ALLOWED_MIME_TYPES)}"
            )

        return mime

    except ValueError:
        raise  # Re-raise validation errors
    except Exception as e:
        logger.exception("Erro ao detectar tipo do arquivo")
        raise ValueError("Erro ao validar tipo do arquivo")


def validate_magic_numbers(content: bytes, extension: str) -> bool:
    """
    Valida magic numbers (assinatura binária) do arquivo.
    """
    if extension not in MAGIC_NUMBERS:
        return True  # Sem validação para esta extensão

    expected_magics = MAGIC_NUMBERS[extension]

    for magic_bytes in expected_magics:
        if content.startswith(magic_bytes):
            return True

    raise ValueError(
        f"Arquivo não corresponde ao formato esperado para .{extension}"
    )


def validate_file_size(content: bytes, max_size: int) -> bool:
    """
    Valida tamanho do arquivo.
    """
    file_size = len(content)

    if file_size > max_size:
        max_size_mb = max_size / (1024 * 1024)
        file_size_mb = file_size / (1024 * 1024)

        raise ValueError(
            f"Arquivo muito grande: {file_size_mb:.2f}MB. "
            f"Tamanho máximo: {max_size_mb:.2f}MB"
        )

    if file_size == 0:
        raise ValueError("Arquivo vazio")

    return True


def validate_xml_structure(content: bytes) -> bool:
    """
    Valida estrutura básica do XML.
    """
    try:
        content_str = content.decode('utf-8', errors='ignore')

        # Verificar se contém tags XML
        if not re.search(r'<\w+.*?>', content_str):
            raise ValueError("Arquivo não contém estrutura XML válida")

        # Verificar se parece NF-e (tem namespace NFe)
        if 'nfe' not in content_str.lower() and 'nota' not in content_str.lower():
            raise ValueError(
                "Arquivo XML não parece ser uma NF-e (Nota Fiscal Eletrônica)"
            )

        return True

    except UnicodeDecodeError:
        raise ValueError("Arquivo XML com encoding inválido")


def validate_file_security(filename: str, content: bytes, max_size: int) -> dict:
    """
    Validação completa de segurança do arquivo.

    Args:
        filename: Nome do arquivo
        content: Conteúdo do arquivo em bytes
        max_size: Tamanho máximo permitido em bytes

    Returns:
        dict com informações do arquivo validado

    Raises:
        ValueError: Se arquivo não passar em alguma validação
    """
    # 1. Sanitizar filename
    safe_filename = sanitize_filename(filename)

    # 2. Validar extensão
    extension = validate_file_extension(safe_filename)

    # 3. Validar tamanho
    validate_file_size(content, max_size)

    # 4. Validar MIME type (se python-magic disponível)
    mime_type = validate_mime_type(content)

    # 5. Validar magic numbers
    validate_magic_numbers(content, extension)

    # 6. Validação específica para XML
    if extension == "xml":
        validate_xml_structure(content)

    return {
        "filename": safe_filename,
        "extension": extension,
        "mime_type": mime_type,
        "size": len(content)
    }
