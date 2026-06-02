#!/usr/bin/env python3
"""
MAPA SaaS - Script de inicialização local
Instala todas as dependências e sobe o servidor automaticamente.

Uso:
    python run.py           # modo produção (build do React incluso)
    python run.py --dev     # modo desenvolvimento (frontend separado)
    python run.py --no-build  # pula o build do frontend
"""

import argparse
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
VENV_DIR = ROOT / ".venv"
FRONTEND_DIR = ROOT / "frontend"
ENV_FILE = ROOT / ".env"
ENV_EXAMPLE = ROOT / ".env.example"
REQUIREMENTS = ROOT / "requirements.txt"

IS_WINDOWS = platform.system() == "Windows"
PYTHON = sys.executable


# ─── helpers ──────────────────────────────────────────────────────────────────

def run(cmd: list, cwd=None, check=True, env=None):
    print(f"  $ {' '.join(str(c) for c in cmd)}")
    return subprocess.run(cmd, cwd=cwd or ROOT, check=check, env=env)


def venv_python():
    if IS_WINDOWS:
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def venv_pip():
    if IS_WINDOWS:
        return VENV_DIR / "Scripts" / "pip.exe"
    return VENV_DIR / "bin" / "pip"


def step(msg: str):
    print(f"\n\033[1;36m{'─' * 60}\033[0m")
    print(f"\033[1;36m  {msg}\033[0m")
    print(f"\033[1;36m{'─' * 60}\033[0m")


def ok(msg: str):
    print(f"  \033[32m✓ {msg}\033[0m")


def warn(msg: str):
    print(f"  \033[33m⚠ {msg}\033[0m")


def error(msg: str):
    print(f"  \033[31m✗ {msg}\033[0m")


# ─── verificações ─────────────────────────────────────────────────────────────

def check_python():
    step("Verificando Python")
    major, minor = sys.version_info[:2]
    if major < 3 or (major == 3 and minor < 9):
        error(f"Python 3.9+ é necessário. Versão atual: {major}.{minor}")
        sys.exit(1)
    ok(f"Python {major}.{minor} detectado")


def check_node():
    if not shutil.which("node"):
        return False
    result = subprocess.run(["node", "--version"], capture_output=True, text=True)
    ok(f"Node.js {result.stdout.strip()} detectado")
    return True


def check_npm():
    if not shutil.which("npm"):
        return False
    result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
    ok(f"npm {result.stdout.strip()} detectado")
    return True


# ─── virtual environment ──────────────────────────────────────────────────────

def create_venv():
    step("Configurando ambiente virtual Python")
    if not VENV_DIR.exists():
        print("  Criando .venv ...")
        run([PYTHON, "-m", "venv", str(VENV_DIR)])
        ok(".venv criado")
    else:
        ok(".venv já existe")


def install_python_deps():
    step("Instalando dependências Python")
    run([str(venv_pip()), "install", "--upgrade", "pip", "-q"])
    run([str(venv_pip()), "install", "-r", str(REQUIREMENTS), "-q"])
    ok("Dependências Python instaladas")


# ─── .env ─────────────────────────────────────────────────────────────────────

SQLITE_URL = "sqlite:///./mapa_local.db"


def _postgres_reachable(url: str) -> bool:
    """Testa se o PostgreSQL está acessível."""
    try:
        import re
        m = re.match(r"postgresql.*://[^:]+:[^@]*@([^:/]+):?(\d+)?/", url)
        if not m:
            return False
        host = m.group(1)
        port = int(m.group(2) or 5432)
        import socket
        s = socket.create_connection((host, port), timeout=2)
        s.close()
        return True
    except Exception:
        return False


def _env_get(key: str) -> str:
    """Lê um valor do .env sem carregar o módulo app."""
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if line.startswith(f"{key}="):
            return line.split("=", 1)[1].strip()
    return ""


def _env_set(key: str, value: str):
    """Substitui ou acrescenta KEY=value no .env."""
    content = ENV_FILE.read_text()
    lines = content.splitlines()
    new_lines = []
    found = False
    for line in lines:
        if line.strip().startswith(f"{key}="):
            new_lines.append(f"{key}={value}")
            found = True
        else:
            new_lines.append(line)
    if not found:
        new_lines.append(f"{key}={value}")
    ENV_FILE.write_text("\n".join(new_lines) + "\n")


def setup_env():
    step("Configurando arquivo .env")

    if not ENV_FILE.exists():
        if not ENV_EXAMPLE.exists():
            warn(".env.example não encontrado, pulando")
            return

        import secrets
        env_content = ENV_EXAMPLE.read_text()

        secret_key = secrets.token_urlsafe(64)
        env_content = env_content.replace(
            "GERE_UMA_CHAVE_SEGURA_COM_O_COMANDO_ACIMA",
            secret_key
        )
        env_content = env_content.replace("DEBUG=False", "DEBUG=True")
        env_content = env_content.replace(
            "ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com",
            "ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8000"
        )
        env_content = env_content.replace(
            "DATABASE_URL=postgresql://user:SENHA_FORTE_AQUI@localhost:5432/mapa_db",
            f"DATABASE_URL={SQLITE_URL}"
        )
        env_content += "\n# Aceita qualquer credencial em modo local (nunca use em produção!)\nDEV_BYPASS_AUTH=true\n"

        ENV_FILE.write_text(env_content)
        ok(f".env criado com SQLite local ({SQLITE_URL})")
        return

    ok(".env já existe")

    # Garante DEV_BYPASS_AUTH=true
    if "DEV_BYPASS_AUTH" not in ENV_FILE.read_text():
        _env_set("DEV_BYPASS_AUTH", "true")
        ok("DEV_BYPASS_AUTH=true adicionado ao .env")

    # Se DATABASE_URL aponta para Postgres e ele não responde, troca para SQLite
    db_url = _env_get("DATABASE_URL")
    if db_url.startswith("postgresql") or db_url.startswith("postgres"):
        print("  Testando conexão com PostgreSQL...")
        if _postgres_reachable(db_url):
            ok("PostgreSQL acessível")
        else:
            warn("PostgreSQL não encontrado — usando SQLite local")
            _env_set("DATABASE_URL", SQLITE_URL)
            ok(f"DATABASE_URL trocado para {SQLITE_URL}")


# ─── frontend ─────────────────────────────────────────────────────────────────

def install_frontend_deps():
    if not FRONTEND_DIR.exists():
        warn("Pasta frontend/ não encontrada, pulando")
        return

    step("Instalando dependências do frontend (npm)")
    run(["npm", "install"], cwd=FRONTEND_DIR)
    ok("node_modules instalado")


def build_frontend():
    if not FRONTEND_DIR.exists():
        return

    step("Fazendo build do frontend React")
    run(["npm", "run", "build"], cwd=FRONTEND_DIR)
    ok("Build concluído em frontend/dist/")


def start_frontend_dev():
    if not FRONTEND_DIR.exists():
        return None

    step("Iniciando frontend em modo dev (porta 5173)")
    print("  (processo rodando em background)")
    proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=FRONTEND_DIR,
    )
    return proc


# ─── banco de dados ───────────────────────────────────────────────────────────

def run_migrations():
    step("Inicializando banco de dados")
    # Tenta importar via venv para verificar se o DB está configurado
    result = subprocess.run(
        [str(venv_python()), "-c",
         "from app.database import init_db; ok = init_db(); print('ok' if ok else 'warn')"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if "ok" in result.stdout:
        ok("Tabelas do banco de dados criadas/verificadas")
    elif result.returncode != 0:
        warn("Não foi possível inicializar o banco agora.")
        warn("Verifique DATABASE_URL no .env e certifique-se que o PostgreSQL está rodando.")
        warn("O servidor tentará conectar novamente ao iniciar.")
    else:
        warn("Banco inicializado com aviso — verifique o .env")


# ─── servidor ─────────────────────────────────────────────────────────────────

def start_server(dev_mode: bool):
    step("Iniciando servidor FastAPI")

    reload_flag = ["--reload"] if dev_mode else []

    print(f"""
  \033[1mServidor MAPA SaaS\033[0m
  URL:     \033[32mhttp://localhost:8000\033[0m
  API:     \033[32mhttp://localhost:8000/api/docs\033[0m
  Modo:    {'desenvolvimento (--reload)' if dev_mode else 'produção'}

  Pressione Ctrl+C para parar.
""")

    cmd = [
        str(venv_python()), "-m", "uvicorn",
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
    ] + reload_flag

    os.execv(str(venv_python()), cmd)


# ─── main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="MAPA SaaS - inicialização local")
    parser.add_argument("--dev", action="store_true",
                        help="Modo dev: habilita --reload e sobe o Vite separado")
    parser.add_argument("--no-build", action="store_true",
                        help="Pula o build do frontend")
    parser.add_argument("--no-frontend", action="store_true",
                        help="Ignora frontend completamente")
    args = parser.parse_args()

    print("""
\033[1;35m
  ███╗   ███╗ █████╗ ██████╗  █████╗
  ████╗ ████║██╔══██╗██╔══██╗██╔══██╗
  ██╔████╔██║███████║██████╔╝███████║
  ██║╚██╔╝██║██╔══██║██╔═══╝ ██╔══██║
  ██║ ╚═╝ ██║██║  ██║██║     ██║  ██║
  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝
  SaaS v2.0 — inicializador local
\033[0m""")

    check_python()

    has_node = check_node()
    has_npm = check_npm()

    create_venv()
    install_python_deps()
    setup_env()
    run_migrations()

    frontend_proc = None

    if not args.no_frontend:
        if has_npm:
            install_frontend_deps()
            if args.dev:
                frontend_proc = start_frontend_dev()
            elif not args.no_build:
                build_frontend()
        else:
            warn("Node.js/npm não encontrado — frontend ignorado.")
            warn("Instale Node.js em https://nodejs.org para habilitar o frontend React.")

    try:
        start_server(dev_mode=args.dev)
    finally:
        if frontend_proc:
            frontend_proc.terminate()


if __name__ == "__main__":
    main()
