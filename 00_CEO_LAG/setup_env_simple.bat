@echo off
REM Configuracion entorno VHQ_LAG Hibrido - X:\ DRIVE

echo.
echo =============================================
echo Configurando entorno VHQ_LAG en X:\ drive...
echo =============================================
echo.

echo Configurando variables de entorno para Ollama...

REM Configurar para usuario actual (permanente)
setx OLLAMA_MODELS "X:\VHQ_LAG\ollama_models"
if %ERRORLEVEL% NEQ 0 (
    echo Error configurando OLLAMA_MODELS
    pause
    exit /b 1
)

setx OLLAMA_HOST "127.0.0.1:11434"
setx OLLAMA_KEEP_ALIVE "5m"
setx OLLAMA_MAX_LOADED_MODELS "1"
setx OLLAMA_NUM_PARALLEL "1"
setx OLLAMA_FLASH_ATTENTION "1"
setx OLLAMA_MAX_QUEUE "512"

REM Configurar para sesión actual
set "OLLAMA_MODELS=X:\VHQ_LAG\ollama_models"
set "OLLAMA_HOST=127.0.0.1:11434"
set "OLLAMA_KEEP_ALIVE=5m"
set "OLLAMA_MAX_LOADED_MODELS=1"
set "OLLAMA_NUM_PARALLEL=1"
set "OLLAMA_FLASH_ATTENTION=1"
set "OLLAMA_MAX_QUEUE=512"

echo.
echo Verificando configuracion...
echo.

echo OLLAMA_MODELS = %OLLAMA_MODELS%
echo OLLAMA_HOST = %OLLAMA_HOST%
echo OLLAMA_MAX_LOADED_MODELS = %OLLAMA_MAX_LOADED_MODELS%

echo.
echo Variables de entorno configuradas correctamente
echo Modelos se guardaran en: X:\VHQ_LAG\ollama_models\
echo.
echo IMPORTANTE: 
echo 1. CIERRA esta ventana de PowerShell
echo 2. ABRE una NUEVA ventana de PowerShell
echo 3. Ejecuta: cd X:\VHQ_LAG\00_CEO_LAG
echo 4. Ejecuta: .\restart_ollama.bat
echo.

pause 