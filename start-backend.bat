@echo off
echo ============================================
echo   MAPA SaaS - Starting Backend
echo ============================================
echo.

REM Verificar se venv existe
if not exist "venv\" (
    echo [ERROR] Virtual environment not found!
    echo.
    echo Please run setup-windows.bat first
    echo.
    pause
    exit /b 1
)

echo [1/2] Activating virtual environment...
call venv\Scripts\activate.bat

echo [2/2] Starting FastAPI server...
echo.
echo Backend will be available at: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press CTRL+C to stop the server
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
