.PHONY: help install dev prod docker clean test lint

help:
	@echo "📚 MAPA SaaS - Available Commands:"
	@echo ""
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Run development server"
	@echo "  make prod       - Run production server"
	@echo "  make docker     - Run with Docker Compose"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run linters"
	@echo "  make clean      - Clean temporary files"
	@echo "  make admin      - Create admin user"
	@echo ""

install:
	@echo "📦 Installing dependencies..."
	python -m venv venv
	. venv/bin/activate && pip install --upgrade pip
	. venv/bin/activate && pip install -r requirements.txt
	@echo "✅ Dependencies installed"

dev:
	@echo "🚀 Starting development server..."
	bash startup-dev.sh

prod:
	@echo "🚀 Starting production server..."
	bash startup.sh

docker:
	@echo "🐳 Starting with Docker..."
	docker-compose up --build

docker-down:
	@echo "🛑 Stopping Docker containers..."
	docker-compose down

admin:
	@echo "👤 Creating admin user..."
	python create_admin.py

test:
	@echo "🧪 Running tests..."
	pytest tests/ -v --cov=app

lint:
	@echo "🔍 Running linters..."
	black --check app/
	flake8 app/
	isort --check-only app/

format:
	@echo "✨ Formatting code..."
	black app/
	isort app/

clean:
	@echo "🧹 Cleaning temporary files..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache .coverage htmlcov/
	@echo "✅ Cleaned"

db-reset:
	@echo "⚠️  Resetting database..."
	@read -p "Are you sure? This will delete all data! (y/N) " confirm && [ "$$confirm" = "y" ]
	python << END
	from app.database import Base, engine
	Base.metadata.drop_all(bind=engine)
	Base.metadata.create_all(bind=engine)
	print("✅ Database reset")
	END

backup:
	@echo "💾 Creating backup..."
	@mkdir -p backups
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	pg_dump $$DATABASE_URL > backups/backup_$$timestamp.sql
	@echo "✅ Backup created"