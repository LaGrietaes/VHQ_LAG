@echo off
REM 🚀 REINICIAR OLLAMA CON CONFIGURACIÓN X:\

echo.
echo ===============================================
echo 🚀 REINICIAR OLLAMA - CONFIGURACIÓN X:\ DRIVE
echo ===============================================
echo.

echo 🛑 Parando Ollama si está ejecutándose...
taskkill /F /IM ollama.exe 2>nul
if %errorlevel% == 0 (
    echo ✅ Ollama parado correctamente
) else (
    echo ℹ️  Ollama no estaba ejecutándose
)

echo.
echo ⏳ Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 Iniciando Ollama con configuración X:\...
echo 📂 Modelos: X:\VHQ_LAG\ollama_models\
echo.

REM Configurar variables para esta sesión
set OLLAMA_MODELS=X:\VHQ_LAG\ollama_models
set OLLAMA_HOST=127.0.0.1:11434
set OLLAMA_KEEP_ALIVE=5m
set OLLAMA_MAX_LOADED_MODELS=1
set OLLAMA_NUM_PARALLEL=1
set OLLAMA_FLASH_ATTENTION=1
set OLLAMA_MAX_QUEUE=512

echo ⚡ Variables configuradas para esta sesión
echo.

start "Ollama Server" ollama serve

echo.
echo ✅ Ollama reiniciado con configuración X:\
echo 🎯 Los modelos se almacenarán en X:\VHQ_LAG\ollama_models\
echo ⚡ Para verificar: ollama list
echo 🔍 Para probar: ollama run llama3.1:7b
echo.
echo 📋 NOTA: Si no funciona, ejecuta primero setup_env.ps1
echo.

pause 