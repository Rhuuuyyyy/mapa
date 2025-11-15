#!/bin/bash

# ==========================================
# MAPA SaaS - Production Startup Script
# ==========================================

echo "🚀 Starting MAPA SaaS..."

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_warn "Running as root is not recommended for security reasons"
fi

# Load environment variables from .env if exists
if [ -f .env ]; then
    log_info "Loading environment variables from .env"
    export $(grep -v '^#' .env | xargs)
else
    log_warn ".env file not found, using environment variables"
fi

# Check required environment variables
log_info "Checking environment variables..."

if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL not set"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    log_error "SECRET_KEY not set"
    exit 1
fi

log_info "Environment variables OK"

# Create necessary directories
log_info "Creating directories..."
mkdir -p uploads reports logs static/css static/js templates

# Set permissions
chmod 755 uploads reports logs

# Install gunicorn if in production
if [ "$DEBUG" != "True" ]; then
    log_info "Checking gunicorn installation..."
    if ! command -v gunicorn &> /dev/null; then
        log_info "Installing gunicorn..."
        pip install gunicorn
    fi
fi

# Wait for database to be ready (useful in Docker)
log_info "Waiting for database..."
python << END
import sys
import time
from sqlalchemy import create_engine
from app.config import settings

max_retries = 30
retry_interval = 2

for i in range(max_retries):
    try:
        engine = create_engine(settings.database_url)
        conn = engine.connect()
        conn.close()
        print("Database is ready!")
        sys.exit(0)
    except Exception as e:
        if i < max_retries - 1:
            print(f"Database not ready yet, retrying in {retry_interval}s... ({i+1}/{max_retries})")
            time.sleep(retry_interval)
        else:
            print(f"Failed to connect to database after {max_retries} attempts")
            sys.exit(1)
END

if [ $? -ne 0 ]; then
    log_error "Failed to connect to database"
    exit 1
fi

log_info "Database connection OK"

# Create database tables
log_info "Creating database tables..."
python << END
from app.database import Base, engine
from app.models import User, XMLUpload, Report

try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully")
except Exception as e:
    print(f"Error creating tables: {e}")
    import sys
    sys.exit(1)
END

if [ $? -ne 0 ]; then
    log_error "Failed to create database tables"
    exit 1
fi

# Start the application
log_info "Starting application..."
echo "=========================================="

if [ "$DEBUG" = "True" ]; then
    log_warn "Running in DEBUG mode (not recommended for production)"
    echo "Access: http://0.0.0.0:8000"
    echo "=========================================="
    exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --reload
else
    log_info "Running in PRODUCTION mode"
    
    # Number of workers (2 x CPU cores + 1)
    WORKERS=${WORKERS:-4}
    
    echo "Workers: $WORKERS"
    echo "Port: ${PORT:-8000}"
    echo "=========================================="
    
    exec gunicorn app.main:app \
        --workers $WORKERS \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind 0.0.0.0:${PORT:-8000} \
        --access-logfile logs/access.log \
        --error-logfile logs/error.log \
        --log-level info \
        --timeout 120 \
        --keep-alive 5 \
        --max-requests 1000 \
        --max-requests-jitter 50
fi