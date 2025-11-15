#!/bin/bash

# ==========================================
# MAPA SaaS - Azure Simple Startup (Fast)
# ==========================================

echo "🚀 Starting MAPA SaaS on Azure (Simple Mode)..."
echo "Working directory: $(pwd)"
echo "Python version: $(python --version)"

# Don't exit on errors - let the app handle them
set +e

# Azure sets these automatically
export PORT="${PORT:-8000}"
export PYTHONUNBUFFERED=1

# Navigate to app directory
cd /home/site/wwwroot || exit 1

# Install dependencies if not present
if [ ! -d "antenv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv antenv
fi

echo "📦 Activating virtual environment..."
source antenv/bin/activate

# Check if we need to install dependencies
REQUIREMENTS_HASH=$(md5sum requirements.txt 2>/dev/null | cut -d' ' -f1)
INSTALLED_HASH=""
if [ -f "antenv/.requirements_hash" ]; then
    INSTALLED_HASH=$(cat antenv/.requirements_hash)
fi

if [ "$REQUIREMENTS_HASH" != "$INSTALLED_HASH" ] || [ ! -f "antenv/.requirements_hash" ]; then
    echo "📦 Installing dependencies..."
    pip install --no-cache-dir --upgrade pip setuptools wheel
    pip install --no-cache-dir -r requirements.txt
    echo "$REQUIREMENTS_HASH" > antenv/.requirements_hash
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed (cache hit)"
fi

# Create directories
mkdir -p uploads reports logs

# Start application immediately (let FastAPI handle DB connection)
echo "✅ Starting application on port $PORT..."
echo "⚡ Quick start mode - skipping DB checks"
echo "📝 Database migrations will run on first request"

exec gunicorn app.main:app \
    --workers 1 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --timeout 120 \
    --graceful-timeout 30 \
    --keep-alive 5 \
    --access-logfile '-' \
    --error-logfile '-' \
    --log-level info
