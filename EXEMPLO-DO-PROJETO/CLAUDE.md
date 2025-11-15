# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MAPA SaaS is a FastAPI web application that automates quarterly reporting for Brazil's Ministry of Agriculture (MAPA). It processes electronic invoice files (NF-e) in XML or PDF format and generates Excel reports in the official MAPA format for fertilizer companies.

## Common Commands

### Development
```bash
# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# OR
make dev

# Run production server
make prod
```

### Docker
```bash
# Start with Docker Compose
docker-compose up --build
# OR
make docker

# Stop Docker
docker-compose down
# OR
make docker-down
```

### Database
```bash
# Create admin user
python create_admin.py
# OR
make admin

# Reset database (WARNING: deletes all data)
make db-reset

# Create backup
make backup
```

### Maintenance
```bash
# Clean temporary files
make clean

# Format code (if black/isort installed)
make format

# Run linters (if installed)
make lint
```

## Architecture

### Application Structure

**Multi-tenant SaaS with role-based access:**
- Two user roles: Admin (manages users) and User (uploads files, generates reports)
- JWT-based authentication with bcrypt password hashing
- PostgreSQL database with SQLAlchemy ORM

**Three-layer architecture:**
1. **Routers** (`app/routers/`): API endpoints separated by role
   - `admin.py`: User CRUD, admin authentication
   - `user.py`: File upload, report generation, file management
2. **Models/Database** (`app/models.py`, `app/database.py`): SQLAlchemy models
3. **Processing Utilities** (`app/utils/`): Business logic
   - `xml_processor.py`: NFeXMLProcessor class extracts data from NF-e XML using lxml
   - `pdf_processor.py`: Extracts text from PDF DANFE invoices using pdfplumber
   - `report_generator.py`: MAPAReportGenerator creates formatted Excel reports with openpyxl

### Data Flow

1. User uploads XML/PDF file → stored in `uploads/` directory
2. File metadata saved to `xml_uploads` table with status "pending"
3. Processor extracts invoice data (emitter, recipient, products, nutrients)
4. When user generates report for a period (e.g., "Q1-2025"):
   - System aggregates all processed uploads for that quarter
   - Extracts product guarantees (nutrient percentages) from product descriptions via regex
   - Generates Excel with official MAPA format (headers, company info, nutrient columns)
5. Report saved to `reports/` directory, metadata in `reports` table

### Key Models

- **User**: Authentication, company info, is_admin flag
- **XMLUpload**: Tracks uploaded files, processing status, links to user
- **Report**: Generated reports, links to user and xml_upload, stores period

Relationships: User → [XMLUploads, Reports] with cascade delete

### Authentication Flow

- Login endpoint (`/api/admin/auth/login` or `/api/user/auth/login`) returns JWT token
- Token stored in browser localStorage
- Protected endpoints verify JWT via `get_current_user` dependency
- Admin endpoints additionally check `is_admin` flag

### Frontend

Simple HTML/CSS/JavaScript (no framework) with:
- `templates/`: Jinja2 templates for login, admin dashboard, user dashboard
- `static/`: CSS and JavaScript files
- JavaScript handles API calls, file uploads (FormData), token management

## Configuration

Configuration uses Pydantic Settings (`app/config.py`) loading from `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key (generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (default: 30)
- `DEBUG`: Enable debug mode
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)

## Important Implementation Details

### NF-e Processing
- XML processing uses namespace-aware XPath (`NAMESPACES` dict in `NFeXMLProcessor`)
- The processor extracts: chave_acesso, emitter/recipient info, products with quantities and descriptions
- Nutrient guarantees (N, P2O5, K2O, Ca, Mg, etc.) are extracted from product descriptions using regex patterns
- MAPA registration numbers extracted via pattern: `REG[\.:]?\s*MAPA[:\s]+([A-Z]{2}\s*\d+-\d+\.\d+-\d+)`

### Report Generation
- MAPAReportGenerator creates Excel files matching official MAPA format
- Headers include 33 columns covering product type, nutrients, quantities, import/export data
- Company info and period displayed in report header
- Files named: `Relatorio_MAPA_{period}_{timestamp}.xlsx`
- Stored in `reports/user_{user_id}_{filename}` pattern

### File Storage
- Uploaded files: `uploads/` directory
- Generated reports: `reports/` directory
- Both directories created automatically if they don't exist
- Files are user-specific and access-controlled

### Database Initialization
- Tables auto-created on startup via `Base.metadata.create_all(bind=engine)` in `app/main.py`
- First admin must be created with `create_admin.py` script

## Development Notes

- Python 3.9+ required (specified in `runtime.txt`)
- PostgreSQL 12+ recommended
- FastAPI auto-generates API docs at `/docs` (Swagger) and `/redoc`
- Health check endpoint: `/health`
- CORS configured via settings for frontend access
- File uploads use `python-multipart` for FormData handling
- Static files mounted at `/static`, templates at root paths (`/`, `/admin`, `/dashboard`)

## Contexto de Arquivos de Exemplo
Todos os arquivos de exemplo para input (XML) e output (CSV/Excel) estão localizados na pasta `examples/`. 
- O INPUT XML de referência é `examples/Exemplo_xml_nfe.xml`.
- Os modelos de OUTPUT são os arquivos `Modelo.xls - *.csv`.
- Os exemplos de preenchimento são os arquivos `Exemplo_tabela.xlsx - *.csv`.