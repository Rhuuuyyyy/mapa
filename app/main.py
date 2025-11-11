from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routers import admin, user

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MAPA SaaS - Automação de Relatórios",
    description="Sistema de automação de relatórios trimestrais MAPA a partir de XML de NF-e",
    version="1.0.0",
    debug=settings.debug
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Include routers
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(user.router, prefix="/api/user", tags=["User"])


@app.get("/")
async def root(request: Request):
    """Página inicial - Login"""
    return templates.TemplateResponse("login.html", {"request": request})


@app.get("/admin")
async def admin_page(request: Request):
    """Dashboard do Administrador"""
    return templates.TemplateResponse("admin_dashboard.html", {"request": request})


@app.get("/dashboard")
async def user_dashboard(request: Request):
    """Dashboard do Usuário"""
    return templates.TemplateResponse("user_dashboard.html", {"request": request})


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "MAPA SaaS is running"}