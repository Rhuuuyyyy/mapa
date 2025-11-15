#!/bin/bash

# ==========================================
# MAPA SaaS - Azure App Service Startup
# ==========================================

echo "🚀 Starting MAPA SaaS on Azure..."
echo "Working directory: $(pwd)"
echo "Python version: $(python --version)"

set -e

# Azure sets these automatically
export PORT="${PORT:-8000}"
export PYTHONUNBUFFERED=1

# Navigate to app directory
cd /home/site/wwwroot

# Install dependencies if not present
if [ ! -d "antenv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv antenv
    echo "✅ Virtual environment created"
fi

echo "📦 Activating virtual environment..."
source antenv/bin/activate
echo "✅ Virtual environment activated"

# Check if we need to install dependencies
REQUIREMENTS_HASH=$(md5sum requirements.txt | cut -d' ' -f1)
INSTALLED_HASH=""
if [ -f "antenv/.requirements_hash" ]; then
    INSTALLED_HASH=$(cat antenv/.requirements_hash)
fi

if [ "$REQUIREMENTS_HASH" != "$INSTALLED_HASH" ]; then
    echo "📦 Installing dependencies (requirements changed)..."
    pip install --no-cache-dir --upgrade pip
    pip install --no-cache-dir -r requirements.txt
    echo "$REQUIREMENTS_HASH" > antenv/.requirements_hash
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed (using cache)"
fi

# Create directories
mkdir -p uploads reports logs

# Wait for database
echo "⏳ Waiting for database..."
python << END
import sys
import time
from sqlalchemy import create_engine
from app.config import settings

for i in range(30):
    try:
        engine = create_engine(settings.database_url)
        conn = engine.connect()
        conn.close()
        print("✓ Database ready")
        sys.exit(0)
    except Exception as e:
        if i < 29:
            time.sleep(2)
        else:
            print(f"✗ Database connection failed: {e}")
            sys.exit(1)
END

# Create tables
echo "📊 Setting up database..."
python << END
from app.database import Base, engine
from app.models import User, XMLUpload, Report
Base.metadata.create_all(bind=engine)
END

# Start with gunicorn
echo "✅ Starting application on port $PORT..."

exec gunicorn app.main:app \
    --workers 2 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --timeout 600 \
    --access-logfile '-' \
    --error-logfile '-' \
    --log-level info