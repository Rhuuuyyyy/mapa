#!/bin/bash

# ==========================================
# MAPA SaaS - Azure App Service Startup
# ==========================================

echo "🚀 Starting MAPA SaaS on Azure..."

set -e

# Azure sets these automatically
export PORT="${PORT:-8000}"

# Install dependencies if not present
if [ ! -d "antenv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv antenv
fi

echo "📦 Activating virtual environment..."
source antenv/bin/activate

if [ ! -f "antenv/.installed" ]; then
    echo "📦 Installing dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    touch antenv/.installed
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
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