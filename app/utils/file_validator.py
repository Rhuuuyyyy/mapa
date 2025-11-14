"""
File validation utilities for secure file uploads.
Validates file types using MIME types and magic numbers.
"""
import mimetypes
from typing import Tuple, Optional
from fastapi import UploadFile


class FileValidator:
    """Validates uploaded files for security"""

    # Magic numbers for file type detection
    MAGIC_NUMBERS = {
        'xml': [
            b'<?xml',  # XML declaration
            b'<',      # XML without declaration
        ],
        'pdf': [
            b'%PDF-',  # PDF signature
        ],
    }

    # Allowed MIME types
    ALLOWED_MIME_TYPES = {
        'xml': [
            'application/xml',
            'text/xml',
            'application/x-xml',
        ],
        'pdf': [
            'application/pdf',
        ],
    }

    # Max file sizes (in bytes)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    @staticmethod
    async def validate_file(file: UploadFile, allowed_extensions: list) -> Tuple[bool, Optional[str]]:
        """
        Validate uploaded file comprehensively.

        Args:
            file: FastAPI UploadFile object
            allowed_extensions: List of allowed file extensions (e.g., ['xml', 'pdf'])

        Returns:
            Tuple of (is_valid, error_message)
        """
        # 1. Check filename
        if not file.filename:
            return False, "Nome de arquivo inválido"

        # 2. Validate file extension
        file_ext = file.filename.lower().split('.')[-1]
        if file_ext not in allowed_extensions:
            return False, f"Extensão de arquivo não permitida. Permitidos: {', '.join(allowed_extensions)}"

        # 3. Read file content for validation
        content = await file.read()
        await file.seek(0)  # Reset file pointer for later use

        # 4. Check file size
        file_size = len(content)
        if file_size == 0:
            return False, "Arquivo está vazio"

        if file_size > FileValidator.MAX_FILE_SIZE:
            max_mb = FileValidator.MAX_FILE_SIZE / (1024 * 1024)
            return False, f"Arquivo muito grande. Tamanho máximo: {max_mb}MB"

        # 5. Validate MIME type if provided
        if file.content_type:
            is_valid_mime = FileValidator._validate_mime_type(file.content_type, file_ext)
            if not is_valid_mime:
                return False, f"Tipo MIME inválido: {file.content_type}"

        # 6. Validate magic numbers (file signature)
        is_valid_magic = FileValidator._validate_magic_number(content, file_ext)
        if not is_valid_magic:
            return False, f"Arquivo não corresponde ao tipo {file_ext.upper()} esperado"

        # 7. Additional validation for XML
        if file_ext == 'xml':
            if not FileValidator._is_valid_xml_structure(content):
                return False, "Estrutura XML inválida"

        return True, None

    @staticmethod
    def _validate_mime_type(mime_type: str, file_ext: str) -> bool:
        """Validate MIME type matches file extension"""
        allowed_mimes = FileValidator.ALLOWED_MIME_TYPES.get(file_ext, [])
        return mime_type in allowed_mimes

    @staticmethod
    def _validate_magic_number(content: bytes, file_ext: str) -> bool:
        """Validate file signature (magic numbers)"""
        magic_numbers = FileValidator.MAGIC_NUMBERS.get(file_ext, [])

        for magic in magic_numbers:
            if content.startswith(magic):
                return True

        return False

    @staticmethod
    def _is_valid_xml_structure(content: bytes) -> bool:
        """Basic XML structure validation"""
        try:
            content_str = content.decode('utf-8', errors='ignore')

            # Check for basic XML structure
            if '<?xml' not in content_str and not content_str.strip().startswith('<'):
                return False

            # Check for balanced tags (simple check)
            if content_str.count('<') != content_str.count('>'):
                return False

            return True
        except Exception:
            return False

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """
        Sanitize filename to prevent path traversal attacks.

        Args:
            filename: Original filename

        Returns:
            Sanitized filename
        """
        import re
        import os

        # Get just the filename, remove path components
        filename = os.path.basename(filename)

        # Remove any non-alphanumeric characters except dots, hyphens, and underscores
        filename = re.sub(r'[^\w\s\-\.]', '', filename)

        # Replace spaces with underscores
        filename = filename.replace(' ', '_')

        # Limit filename length
        if len(filename) > 255:
            name, ext = os.path.splitext(filename)
            filename = name[:250] + ext

        return filename

    @staticmethod
    def get_safe_file_path(base_dir: str, user_id: int, filename: str, timestamp: str) -> str:
        """
        Generate safe file path preventing path traversal.

        Args:
            base_dir: Base directory for uploads
            user_id: User ID
            filename: Original filename
            timestamp: Timestamp string

        Returns:
            Safe file path
        """
        import os

        # Sanitize filename
        safe_filename = FileValidator.sanitize_filename(filename)

        # Create safe path
        user_dir = os.path.join(base_dir, str(user_id))
        os.makedirs(user_dir, exist_ok=True)

        # Add timestamp to prevent collisions
        name, ext = os.path.splitext(safe_filename)
        final_filename = f"{timestamp}_{name}{ext}"

        return os.path.join(user_dir, final_filename)
