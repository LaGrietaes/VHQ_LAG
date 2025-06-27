# 🔧 CONFIGURACIÓN ENTORNO VHQ_LAG HÍBRIDO - X:\ DRIVE
# Ejecutar: .\setup_env.ps1

Write-Host "🔧 Configurando entorno VHQ_LAG en X:\ drive..." -ForegroundColor Green

# Variables de entorno para Ollama
[Environment]::SetEnvironmentVariable("OLLAMA_MODELS", "X:\VHQ_LAG\ollama_models", "User")
$env:OLLAMA_MODELS = "X:\VHQ_LAG\ollama_models"
Write-Host "✅ OLLAMA_MODELS configurado" -ForegroundColor Green

[Environment]::SetEnvironmentVariable("OLLAMA_HOST", "127.0.0.1:11434", "User")
$env:OLLAMA_HOST = "127.0.0.1:11434"
Write-Host "✅ OLLAMA_HOST configurado" -ForegroundColor Green

[Environment]::SetEnvironmentVariable("OLLAMA_KEEP_ALIVE", "5m", "User")
$env:OLLAMA_KEEP_ALIVE = "5m"
Write-Host "✅ OLLAMA_KEEP_ALIVE configurado" -ForegroundColor Green

[Environment]::SetEnvironmentVariable("OLLAMA_MAX_LOADED_MODELS", "1", "User")
$env:OLLAMA_MAX_LOADED_MODELS = "1"
Write-Host "✅ OLLAMA_MAX_LOADED_MODELS configurado" -ForegroundColor Green

[Environment]::SetEnvironmentVariable("OLLAMA_NUM_PARALLEL", "1", "User")
$env:OLLAMA_NUM_PARALLEL = "1"
Write-Host "✅ OLLAMA_NUM_PARALLEL configurado" -ForegroundColor Green

[Environment]::SetEnvironmentVariable("OLLAMA_FLASH_ATTENTION", "1", "User")
$env:OLLAMA_FLASH_ATTENTION = "1"
Write-Host "✅ OLLAMA_FLASH_ATTENTION configurado" -ForegroundColor Green

[Environment]::SetEnvironmentVariable("OLLAMA_MAX_QUEUE", "512", "User")
$env:OLLAMA_MAX_QUEUE = "512"
Write-Host "✅ OLLAMA_MAX_QUEUE configurado" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 Variables de entorno configuradas correctamente" -ForegroundColor Cyan
Write-Host "📂 Modelos se guardarán en: X:\VHQ_LAG\ollama_models\" -ForegroundColor Yellow
Write-Host "⚠️  REINICIA PowerShell para que los cambios tomen efecto" -ForegroundColor Red
Write-Host "🚀 Después ejecuta: .\restart_ollama.bat" -ForegroundColor Green
Write-Host ""
Read-Host "Presiona Enter para continuar..." 