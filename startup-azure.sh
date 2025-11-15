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

# Wait for database (with timeout)
echo "⏳ Waiting for database (max 30s)..."
timeout 30 python << 'END' || echo "⚠️ Database check timed out, continuing anyway..."
import sys
import time
from sqlalchemy import create_engine
from app.config import settings

max_attempts = 15
for i in range(max_attempts):
    try:
        print(f"Attempt {i+1}/{max_attempts}...")
        engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
        conn = engine.connect()
        conn.close()
        print("✓ Database ready")
        sys.exit(0)
    except Exception as e:
        if i < max_attempts - 1:
            print(f"  Connection failed: {str(e)[:100]}")
            time.sleep(2)
        else:
            print(f"✗ Database connection failed after {max_attempts} attempts: {e}")
            sys.exit(1)
END

# Create tables (with timeout)
echo "📊 Setting up database tables (max 30s)..."
timeout 30 python << 'END' || echo "⚠️ Table creation timed out"
import sys
try:
    from app.database import Base, engine
    from app.models import User, XMLUpload, Report, Company, Product, RawMaterialCatalog
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables ready")
    sys.exit(0)
except Exception as e:
    print(f"✗ Error creating tables: {e}")
    # Don't exit with error - tables might already exist
    sys.exit(0)
END

# Start with gunicorn
echo "✅ Starting application on port $PORT..."
echo "Workers: 1, Timeout: 120s, Log level: info"

exec gunicorn app.main:app \
    --workers 1 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --timeout 120 \
    --graceful-timeout 30 \
    --keep-alive 5 \
    --access-logfile '-' \
    --error-logfile '-' \
    --log-level info \
    --preload