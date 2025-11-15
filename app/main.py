"""
MAPA SaaS - Aplicação FastAPI Principal
Startup não-bloqueante, CORS configurado, routers organizados.
"""

import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import init_db
from app.routers import admin, user

# Configurar logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Criar aplicação FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Sistema de Automação de Relatórios MAPA",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    debug=settings.debug
)

# Adicionar rate limiter ao app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar arquivos estáticos e templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Incluir routers
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(user.router, prefix="/api/user", tags=["User"])


# ============================================================================
# EVENT HANDLERS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """
    Inicialização do app (NÃO-BLOQUEANTE).
    Tenta criar tabelas, mas permite app iniciar mesmo se falhar.
    """
    logger.info(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Debug mode: {settings.debug}")

    # Tentar inicializar DB (não-bloqueante)
    try:
        logger.info("Initializing database...")
        success = init_db()

        if success:
            logger.info("✓ Database tables ready")
        else:
            logger.warning("⚠️ Database initialization deferred")

    except Exception as e:
        logger.warning(f"⚠️ Could not initialize database: {e}")
        logger.warning("App will continue, database will be initialized on first access")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup ao desligar app"""
    logger.info("Shutting down application...")


# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """
    Endpoint de health check para Azure/monitoring.
    Verifica se app está rodando (não verifica DB para evitar timeout).
    """
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version
    }
