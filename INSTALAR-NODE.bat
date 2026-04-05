@echo off
REM Script para ejecutar el instalador de Node.js desde PowerShell

cls
echo.
echo ========================================
echo   VITAL LIFE - INSTALADOR NODE.JS
echo ========================================
echo.
echo Iniciando PowerShell...
echo.

REM Ejecutar el script de PowerShell
powershell -ExecutionPolicy Bypass -File "%~dp0INSTALAR-NODE.ps1"

pause
