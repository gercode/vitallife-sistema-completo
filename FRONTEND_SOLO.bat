@echo off
REM Script rapido para servir solo el frontend sin backend

cls
echo.
echo ========================================
echo   VITAL LIFE - FRONTEND SOLO
echo ========================================
echo.

REM Verificar si Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo Python no encontrado. Intentando con Node.js...
    
    node --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ ERROR: Ni Python ni Node.js estan instalados
        echo.
        echo Opciones:
        echo 1. Instala Node.js: https://nodejs.org/
        echo 2. Instala Python: https://www.python.org/
        pause
        exit /b 1
    )
    
    REM Usar Node.js
    cd frontend
    echo Instalando http-server...
    npm install -g http-server
    echo.
    echo Iniciando servidor en http://localhost:5500
    http-server . -p 5500 -o /views/admin/index.html
) else (
    REM Usar Python
    cd frontend
    echo Iniciando servidor con Python en http://localhost:5500
    python -m http.server 5500 --directory .
)

echo.
echo Presiona CTRL+C para detener el servidor
pause
