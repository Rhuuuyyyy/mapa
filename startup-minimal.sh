#!/bin/bash
echo "🚀 MAPA - Minimal Startup (Direct Uvicorn)"
cd /home/site/wwwroot
export PORT="${PORT:-8000}"
export PYTHONUNBUFFERED=1

# Create and activate venv
python -m venv antenv 2>/dev/null || true
source antenv/bin/activate

# Install deps (quiet mode)
echo "📦 Installing..."
pip install -q --upgrade pip 2>&1 | grep -v "Requirement already"
pip install -q -r requirements.txt 2>&1 | grep -v "Requirement already" | head -10
echo "✅ Ready"

# Create dirs
mkdir -p uploads reports logs

# Start with uvicorn directly (simpler than gunicorn)
echo "✅ Starting uvicorn on $PORT"
exec python -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port $PORT \
    --log-level info
