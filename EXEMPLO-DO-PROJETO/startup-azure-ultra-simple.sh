#!/bin/bash
echo "🚀 MAPA SaaS - Ultra Simple Startup"
cd /home/site/wwwroot
export PORT="${PORT:-8000}"
export PYTHONUNBUFFERED=1

# Create venv if needed
if [ ! -d "antenv" ]; then
    echo "📦 Creating venv..."
    python -m venv antenv
fi

# Activate
source antenv/bin/activate

# Install deps (always, to be safe)
echo "📦 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "✅ Deps installed"

# Create dirs
mkdir -p uploads reports logs

# Start NOW
echo "✅ Starting on port $PORT"
exec gunicorn app.main:app \
    --workers 1 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --timeout 120 \
    --log-level info
