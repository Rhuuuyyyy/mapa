@echo off
echo ============================================
echo   MAPA SaaS - Windows Setup
echo ============================================
echo.

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo Please install Python 3.11+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo [OK] Python found
python --version
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version
echo.

echo ============================================
echo   Backend Setup
echo ============================================
echo.

REM Criar ambiente virtual
if not exist "venv\" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
) else (
    echo [1/3] Virtual environment already exists
)

REM Ativar venv e instalar dependências
echo [2/3] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/3] Installing Python dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo [OK] Backend setup complete!
echo.

echo ============================================
echo   Frontend Setup
echo ============================================
echo.

cd frontend

REM Instalar dependências do Node
if not exist "node_modules\" (
    echo [1/1] Installing Node.js dependencies...
    call npm install

    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install Node.js dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo [1/1] Node modules already installed
)

cd ..

echo.
echo [OK] Frontend setup complete!
echo.

REM Verificar se .env existe
if not exist ".env" (
    echo ============================================
    echo   Configuration
    echo ============================================
    echo.
    echo [WARNING] .env file not found!
    echo.
    echo Creating .env with default settings...
    echo.

    (
        echo DATABASE_URL=sqlite:///./mapa.db
        echo SECRET_KEY=change-this-secret-key-in-production
        echo FRONTEND_URL=http://localhost:3000
    ) > .env

    echo Created .env with SQLite database
    echo.
    echo [IMPORTANT] Edit .env if you want to use PostgreSQL
    echo.
)

REM Verificar se frontend/.env existe
if not exist "frontend\.env" (
    cd frontend
    (
        echo VITE_API_URL=http://localhost:8000/api
    ) > .env
    cd ..
    echo Created frontend/.env with API URL
    echo.
)

echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo Next steps:
echo   1. Run start-backend.bat (in one terminal)
echo   2. Run start-frontend.bat (in another terminal)
echo   3. Open http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
