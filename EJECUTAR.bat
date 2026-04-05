@echo off
REM Script para ejecutar VitalLife - Backend y Frontend
REM Windows PowerShell

cls
echo.
echo ========================================
echo   VITAL LIFE - DASHBOARD ADMINISTRADOR
echo ========================================
echo.

REM Verificar que Node.js este instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no esta instalado
    echo.
    echo Por favor, descarga e instala Node.js desde:
    echo https://nodejs.org/
    echo.
    echo Despues, ejecuta este script nuevamente.
    pause
    exit /b 1
)

echo ✓ Node.js detectado
node --version
echo.

REM Verificar conexion a internet
echo Verificando dependencias...
echo.

REM Ir al backend
cd backend

REM Instalar dependencias si no estan
if not exist node_modules (
    echo Instalando dependencias del backend...
    call npm install
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias
        pause
        exit /b 1
    )
    echo ✓ Dependencias instaladas
) else (
    echo ✓ Dependencias ya instaladas
)

echo.
echo ========================================
echo   INICIANDO SERVIDORES...
echo ========================================
echo.

REM Abrir ventana para el backend
echo Levantando Backend en http://localhost:3001
start "VitalLife Backend" cmd /k "npm start"

timeout /t 2 /nobreak

REM Navegar al frontend
cd ..
cd frontend

REM Intentar abrir el dashboard directamente
echo.
echo Abriendo Dashboard en 5 segundos...
timeout /t 5 /nobreak

REM Verificar disponibilidad del servidor backend
powershell -Command "Start-Sleep -Seconds 2; try { $web = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 3 -ErrorAction Stop; Write-Host 'Backend conectado!' } catch { Write-Host 'Esperando backend...' }"

REM Abrir el dashboard
start "" "http://localhost:5500/views/admin/index.html"

echo.
echo ========================================
echo   INSTRUCCIONES
echo ========================================
echo.
echo Backend:  http://localhost:3001/api
echo Dashboard: http://localhost:5500/views/admin/index.html
echo.
echo Usuario: admin
echo Contrasena: vitallife2026
echo.
echo Presiona CTRL+C en las ventanas del terminal para detener los servidores
echo.

REM Mantener la ventana abierta
pause
