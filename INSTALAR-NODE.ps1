#!/usr/bin/env powershell
# Script para descargar e instalar Node.js + dependencias
# Ejecución: powershell -ExecutionPolicy Bypass -File .\INSTALAR-NODE.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  VITAL LIFE - INSTALADOR NODE.JS" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Función para descargar archivo
function Download-File {
    param(
        [string]$Url,
        [string]$OutFile
    )
    
    Write-Host "📥 Descargando desde: $Url" -ForegroundColor Cyan
    Write-Host "   Guardando en: $OutFile`n" -ForegroundColor Cyan
    
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
        
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing
        
        if (Test-Path $OutFile) {
            $size = ((Get-Item $OutFile).Length / 1MB).ToString('F2')
            Write-Host "✓ Descarga completada ($size MB)`n" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ Error en descarga: $_" -ForegroundColor Red
        return $false
    }
}

# Paso 1: Verificar si Node.js ya está instalado
Write-Host "[1/4] Verificando Node.js..." -ForegroundColor Yellow
$nodeExists = $null -ne (Get-Command node -ErrorAction SilentlyContinue)

if ($nodeExists) {
    $version = node --version
    Write-Host "✓ Node.js ya está instalado: $version`n" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js no detectado" -ForegroundColor Yellow
    Write-Host "`nNECSITA INSTALACIÓN MANUAL:" -ForegroundColor Red
    Write-Host "1. Abre: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Descarga la versión LTS (recomendada)" -ForegroundColor White
    Write-Host "3. Ejecuta el instalador descargado (.msi)" -ForegroundColor White
    Write-Host "4. Reinicia PowerShell/CMD" -ForegroundColor White
    Write-Host "5. Corre este script nuevamente`n" -ForegroundColor White
    
    Read-Host "Presiona ENTER después de instalar Node.js"
    exit 1
}

# Paso 2: Navegar al directorio backend
Write-Host "[2/4] Preparando directorio..." -ForegroundColor Yellow

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"

if (!(Test-Path $backendPath)) {
    Write-Host "❌ Error: No se encontró carpeta 'backend'" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar este script en: $scriptPath" -ForegroundColor White
    exit 1
}

Set-Location $backendPath
Write-Host "✓ Directorio: $backendPath`n" -ForegroundColor Green

# Paso 3: Instalar dependencias
Write-Host "[3/4] Instalando dependencias (esto puede tomar 2-3 minutos)..." -ForegroundColor Yellow
Write-Host "   Ejecutando: npm install`n" -ForegroundColor Cyan

npm install

if ($?) {
    Write-Host "`n✓ Dependencias instaladas correctamente`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error al instalar dependencias" -ForegroundColor Red
    Write-Host "   Intenta ejecutar manualmente: npm install`n" -ForegroundColor White
    exit 1
}

# Paso 4: Resumen
Write-Host "[4/4] Verificación final..." -ForegroundColor Yellow
Write-Host "Node.js: $(node --version)" -ForegroundColor Cyan
Write-Host "npm: $(npm --version)" -ForegroundColor Cyan
Write-Host "Ruta: $backendPath`n" -ForegroundColor Cyan

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Abre Terminal 1 (Backend):" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   npm start`n" -ForegroundColor Cyan

Write-Host "2. Abre Terminal 2 (Frontend):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Cyan
Write-Host "   python -m http.server 5500`n" -ForegroundColor Cyan

Write-Host "3. Accede al Dashboard:" -ForegroundColor White
Write-Host "   http://localhost:5500/views/admin/index.html`n" -ForegroundColor Cyan

Write-Host "Credenciales:" -ForegroundColor Yellow
Write-Host "Usuario: admin" -ForegroundColor Cyan
Write-Host "Contraseña: vitallife2026`n" -ForegroundColor Cyan

Read-Host "Presiona ENTER para cerrar"
