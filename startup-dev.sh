#!/bin/bash

# ==========================================
# MAPA SaaS - Development Startup Script
# ==========================================

echo "🚀 Starting MAPA SaaS (Development Mode)..."

# Exit on error
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    log_warn "Virtual environment not activated!"
    echo "Activating virtual environment..."
    
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    elif [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
    else
        echo "❌ Virtual environment not found. Please create it first:"
        echo "   python -m venv venv"
        exit 1
    fi
fi

# Load .env file
if [ -f .env ]; then
    log_info "Loading .env file"
    export $(grep -v '^#' .env | xargs)
else
    log_warn ".env file not found"
    echo "Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️  Please edit .env file with your settings and run again"
        exit 1
    else
        echo "❌ .env.example not found"
        exit 1
    fi
fi

# Create directories
log_info "Creating directories..."
mkdir -p uploads reports logs

# Check if database is accessible
log_info "Checking database connection..."
python << END
from app.database import engine
try:
    conn = engine.connect()
    conn.close()
    print("Database OK")
except Exception as e:
    print(f"Database error: {e}")
    print("\n⚠️  Make sure PostgreSQL is running:")
    print("   Windows: Check Services")
    print("   Linux: sudo systemctl start postgresql")
    print("   Mac: brew services start postgresql")
    import sys
    sys.exit(1)
END

if [ $? -ne 0 ]; then
    exit 1
fi

# Create tables
log_info "Creating database tables..."
python << END
from app.database import Base, engine
from app.models import User, XMLUpload, Report
Base.metadata.create_all(bind=engine)
print("Tables created")
END

# Check if admin exists
log_info "Checking admin user..."
python << END
from app.database import SessionLocal
from app.models import User

db = SessionLocal()
admin = db.query(User).filter(User.is_admin == True).first()

if not admin:
    print("\n⚠️  No admin user found!")
    print("Run: python create_admin.py")
else:
    print(f"Admin user: {admin.email}")

db.close()
END

# Start server
echo ""
log_info "Starting development server..."
echo "=========================================="
echo "📍 Local:   http://localhost:8000"
echo "📍 Network: http://0.0.0.0:8000"
echo "📚 Docs:    http://localhost:8000/docs"
echo "=========================================="
echo ""

exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000