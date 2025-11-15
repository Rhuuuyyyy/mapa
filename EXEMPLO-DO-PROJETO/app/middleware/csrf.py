"""
CSRF Protection Middleware for FastAPI.
Uses itsdangerous for token generation and validation.
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from typing import Optional
import secrets


class CSRFProtection:
    """CSRF Protection using tokens"""

    def __init__(self, secret_key: str, token_expiry: int = 3600):
        """
        Initialize CSRF protection.

        Args:
            secret_key: Secret key for token generation
            token_expiry: Token expiration time in seconds (default: 1 hour)
        """
        self.serializer = URLSafeTimedSerializer(secret_key, salt="csrf-token")
        self.token_expiry = token_expiry

    def generate_token(self) -> str:
        """Generate a new CSRF token"""
        random_value = secrets.token_urlsafe(32)
        return self.serializer.dumps(random_value)

    def validate_token(self, token: str) -> bool:
        """
        Validate CSRF token.

        Args:
            token: CSRF token to validate

        Returns:
            True if valid, False otherwise
        """
        try:
            self.serializer.loads(token, max_age=self.token_expiry)
            return True
        except (BadSignature, SignatureExpired):
            return False


class CSRFMiddleware(BaseHTTPMiddleware):
    """CSRF Protection Middleware"""

    def __init__(self, app, secret_key: str, exempt_paths: Optional[list] = None):
        """
        Initialize CSRF middleware.

        Args:
            app: FastAPI app instance
            secret_key: Secret key for CSRF tokens
            exempt_paths: List of paths exempt from CSRF protection
        """
        super().__init__(app)
        self.csrf = CSRFProtection(secret_key)
        self.exempt_paths = exempt_paths or [
            "/docs",
            "/redoc",
            "/openapi.json",
            "/health",
            "/",  # Login page
            "/static",  # Static files
        ]

        # Methods that require CSRF protection
        self.protected_methods = ["POST", "PUT", "PATCH", "DELETE"]

    async def dispatch(self, request: Request, call_next):
        """Process request and validate CSRF token"""

        # Check if path is exempt
        if self._is_exempt(request.url.path):
            return await call_next(request)

        # Check if method requires CSRF protection
        if request.method not in self.protected_methods:
            return await call_next(request)

        # For state-changing requests, validate CSRF token
        csrf_token = self._get_csrf_token(request)

        if not csrf_token:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "CSRF token missing"}
            )

        if not self.csrf.validate_token(csrf_token):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Invalid or expired CSRF token"}
            )

        # Token is valid, proceed
        response = await call_next(request)
        return response

    def _is_exempt(self, path: str) -> bool:
        """Check if path is exempt from CSRF protection"""
        for exempt_path in self.exempt_paths:
            if path.startswith(exempt_path):
                return True
        return False

    def _get_csrf_token(self, request: Request) -> Optional[str]:
        """Extract CSRF token from request"""
        # Try to get from header first
        csrf_token = request.headers.get("X-CSRF-Token")

        if not csrf_token:
            # Try to get from form data or JSON body
            # Note: This requires reading the body, which can only be done once
            # For simplicity, we're using header-based CSRF
            pass

        return csrf_token


# Helper function to generate CSRF token for responses
def generate_csrf_token(secret_key: str) -> str:
    """Generate a CSRF token"""
    csrf = CSRFProtection(secret_key)
    return csrf.generate_token()
