@echo off
echo ============================================
echo   MAPA SaaS - Starting Frontend
echo ============================================
echo.

REM Verificar se node_modules existe
if not exist "frontend\node_modules\" (
    echo [ERROR] Node modules not found!
    echo.
    echo Please run: cd frontend && npm install
    echo.
    pause
    exit /b 1
)

echo Starting React development server...
echo.
echo Frontend will be available at: http://localhost:3000
echo.
echo Press CTRL+C to stop the server
echo.

cd frontend
npm run dev
