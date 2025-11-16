#!/bin/sh
# =============================================================================
# MAPA SaaS - Startup Script (Compatível com sh/dash)
# Produção Azure
# =============================================================================

set -e  # Exit on error

echo "============================================"
echo "🚀 MAPA SaaS v2.0.0 - Starting..."
echo "============================================"

# 1. Ativar venv (Azure cria automaticamente em antenv/)
echo "📦 Activating virtual environment..."
if [ -d "antenv" ]; then
    . antenv/bin/activate
    echo "✓ Virtual environment activated"
else
    echo "⚠️  No virtual environment found (antenv/), using system Python"
fi

# 2. Verificar variáveis de ambiente críticas
echo ""
echo "🔍 Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not set!"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "❌ ERROR: SECRET_KEY not set!"
    exit 1
fi

echo "✓ Required environment variables present"

# 3. Aguardar Database (não-bloqueante, timeout 30s)
echo ""
echo "🗄️  Waiting for database connection..."
python3 << 'END'
import time
import sys
import os

try:
    from sqlalchemy import create_engine

    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("⚠️  DATABASE_URL not found, skipping DB check")
        sys.exit(0)

    engine = create_engine(database_url)

    for i in range(30):
        try:
            conn = engine.connect()
            conn.close()
            print("✓ Database connection successful")
            sys.exit(0)
        except Exception as e:
            if i < 29:
                print(f"⏳ Waiting for database... ({i+1}/30)")
                time.sleep(1)
            else:
                print("⚠️  Database not ready after 30s, app will retry on first request")
                sys.exit(0)  # Não falha - permite app iniciar

except Exception as e:
    print(f"⚠️  DB check failed: {e}")
    print("App will continue and retry on first request")
    sys.exit(0)  # Não falha!
END

# 4. Configurar porta
export PORT="${WEBSITES_PORT:-8000}"
echo ""
echo "🌐 Server will listen on port: $PORT"

# 5. Iniciar Gunicorn + Uvicorn Workers
echo ""
echo "🎯 Starting application server..."
echo "============================================"

exec gunicorn app.main:app \
    --workers 2 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind "0.0.0.0:${PORT}" \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
