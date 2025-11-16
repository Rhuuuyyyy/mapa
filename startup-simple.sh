#!/bin/bash
# =============================================================================
# MAPA SaaS - Startup Simplificado (SEM verificação de DB)
# =============================================================================

set -e

echo "============================================"
echo "🚀 MAPA SaaS v2.0.0 - Starting (Simple Mode)"
echo "============================================"

# Ativar venv
if [ -d "antenv" ]; then
    source antenv/bin/activate
    echo "✓ Virtual environment activated"
fi

# Verificar variáveis obrigatórias
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not set!"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "❌ ERROR: SECRET_KEY not set!"
    exit 1
fi

echo "✓ Environment variables OK"

# Configurar porta
export PORT="${WEBSITES_PORT:-8000}"
echo "✓ Port: $PORT"

# Iniciar servidor DIRETAMENTE (sem esperar DB)
echo ""
echo "🎯 Starting Gunicorn..."
echo "============================================"

exec gunicorn app.main:app \
    --workers 1 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind "0.0.0.0:${PORT}" \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level debug \
    --preload
