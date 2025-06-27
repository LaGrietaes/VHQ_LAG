#!/usr/bin/env python3
"""
🔧 CONFIGURADOR DE ENTORNO X:\ - VHQ_LAG HÍBRIDO
Configura Ollama para usar disco X:\ en lugar de C:\ del sistema
Fecha: 27 de Junio 2025
"""

import os
import sys
import subprocess
from pathlib import Path

def print_header(title):
    print(f"\n{'='*70}")
    print(f"🔧 {title}")
    print(f"{'='*70}")

def check_ollama_status():
    """Verifica el estado actual de Ollama"""
    try:
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ Ollama funcionando correctamente")
            if result.stdout.strip():
                print("📋 Modelos ya instalados:")
                print(result.stdout)
            else:
                print("📋 No hay modelos instalados aún")
            return True
        else:
            print("⚠️  Ollama instalado pero no hay modelos")
            return True
    except FileNotFoundError:
        print("❌ Ollama no encontrado en PATH")
        return False
    except Exception as e:
        print(f"⚠️  Error verificando Ollama: {e}")
        return True  # Asumir que está disponible

def create_directory_structure():
    """Crea estructura de directorios en X:\ drive"""
    print_header("CREANDO ESTRUCTURA DE DIRECTORIOS")
    
    base_path = Path("X:/VHQ_LAG")
    directories = [
        "ollama_models",      # Modelos de Ollama
        "ollama_data",        # Datos temporales de Ollama
        "system_logs",        # Logs del sistema
        "checkpoints",        # Checkpoints de agentes
        "sessions_output",    # Output de sesiones colaborativas
        "model_cache"         # Cache de modelos
    ]
    
    for dir_name in directories:
        dir_path = base_path / dir_name
        try:
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ {dir_path}")
        except Exception as e:
            print(f"❌ Error creando {dir_path}: {e}")
            return False
    
    print("🎯 Estructura de directorios creada correctamente")
    return True

def configure_environment_variables():
    """Configura variables de entorno para Ollama"""
    print_header("CONFIGURANDO VARIABLES DE ENTORNO")
    
    # Variables de entorno para Ollama
    env_vars = {
        'OLLAMA_MODELS': 'X:\\VHQ_LAG\\ollama_models',
        'OLLAMA_HOST': '127.0.0.1:11434',  # Puerto por defecto
        'OLLAMA_KEEP_ALIVE': '5m',         # Mantener modelos 5 minutos
        'OLLAMA_MAX_LOADED_MODELS': '1',   # Solo un modelo cargado por vez
        'OLLAMA_NUM_PARALLEL': '1',        # Una inferencia por vez
        'OLLAMA_FLASH_ATTENTION': '1',     # Optimización de memoria
        'OLLAMA_MAX_QUEUE': '512'          # Queue limitado
    }
    
    print("📋 Variables de entorno a configurar:")
    for var, value in env_vars.items():
        print(f"   {var} = {value}")
    
    # Configurar variables para la sesión actual
    for var, value in env_vars.items():
        os.environ[var] = value
        print(f"✅ {var} configurado para sesión actual")
    
    # Crear script de configuración permanente
    create_env_setup_script(env_vars)
    
    return True

def create_env_setup_script(env_vars):
    """Crea script para configurar entorno permanentemente"""
    
    # Script de PowerShell
    ps_script = """# 🔧 CONFIGURACIÓN ENTORNO VHQ_LAG HÍBRIDO
# Ejecutar: .\setup_env.ps1

Write-Host "🔧 Configurando entorno VHQ_LAG en X:\ drive..."

"""
    
    for var, value in env_vars.items():
        ps_script += f'[Environment]::SetEnvironmentVariable("{var}", "{value}", "User")\n'
        ps_script += f'$env:{var} = "{value}"\n'
        ps_script += f'Write-Host "✅ {var} configurado"\n\n'
    
    ps_script += """
Write-Host "🎯 Variables de entorno configuradas correctamente"
Write-Host "⚠️  REINICIA PowerShell para que los cambios tomen efecto"
Write-Host "🚀 Después ejecuta: python implementar_sistema_hibrido.py"
"""
    
    with open('setup_env.ps1', 'w', encoding='utf-8') as f:
        f.write(ps_script)
    
    # Script de Batch
    bat_script = """@echo off
REM 🔧 CONFIGURACIÓN ENTORNO VHQ_LAG HÍBRIDO
REM Ejecutar como administrador para configuración del sistema

echo 🔧 Configurando entorno VHQ_LAG en X:\ drive...

"""
    
    for var, value in env_vars.items():
        bat_script += f'setx {var} "{value}"\n'
        bat_script += f'set {var}={value}\n'
        bat_script += f'echo ✅ {var} configurado\n\n'
    
    bat_script += """
echo 🎯 Variables de entorno configuradas correctamente
echo ⚠️  REINICIA CMD/PowerShell para que los cambios tomen efecto
echo 🚀 Después ejecuta: python implementar_sistema_hibrido.py
pause
"""
    
    with open('setup_env.bat', 'w', encoding='utf-8') as f:
        f.write(bat_script)
    
    print("📝 Scripts de configuración creados:")
    print("   ⚡ setup_env.ps1 - Para PowerShell")
    print("   ⚡ setup_env.bat - Para CMD")

def stop_ollama_service():
    """Para el servicio de Ollama si está corriendo"""
    print_header("CONFIGURANDO SERVICIO OLLAMA")
    
    try:
        # Intentar parar Ollama elegantemente
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq ollama.exe'], 
                              capture_output=True, text=True)
        if 'ollama.exe' in result.stdout:
            print("🛑 Ollama detectado en ejecución, parando...")
            subprocess.run(['taskkill', '/F', '/IM', 'ollama.exe'], 
                         capture_output=True)
            print("✅ Ollama parado")
        else:
            print("ℹ️  Ollama no estaba ejecutándose")
            
    except Exception as e:
        print(f"⚠️  No se pudo parar Ollama: {e}")
        print("💡 Puedes pararlo manualmente desde Task Manager")

def verify_configuration():
    """Verifica que la configuración sea correcta"""
    print_header("VERIFICANDO CONFIGURACIÓN")
    
    # Verificar directorios
    required_dirs = [
        "X:/VHQ_LAG/ollama_models",
        "X:/VHQ_LAG/ollama_data", 
        "X:/VHQ_LAG/checkpoints"
    ]
    
    for dir_path in required_dirs:
        if Path(dir_path).exists():
            print(f"✅ {dir_path}")
        else:
            print(f"❌ {dir_path} - FALTA")
            return False
    
    # Verificar variables de entorno actuales
    print("\n📋 Variables de entorno configuradas:")
    required_vars = ['OLLAMA_MODELS', 'OLLAMA_HOST', 'OLLAMA_MAX_LOADED_MODELS']
    for var in required_vars:
        value = os.environ.get(var, 'NO CONFIGURADA')
        print(f"   {var} = {value}")
    
    print("\n🎯 Configuración completada correctamente")
    return True

def create_ollama_restart_script():
    """Crea script para reiniciar Ollama con nueva configuración"""
    
    restart_script = """@echo off
REM 🚀 REINICIAR OLLAMA CON CONFIGURACIÓN X:\

echo 🛑 Parando Ollama si está ejecutándose...
taskkill /F /IM ollama.exe 2>nul

echo ⏳ Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo 🚀 Iniciando Ollama con configuración X:\...
start "" ollama serve

echo ✅ Ollama reiniciado con configuración X:\
echo 🎯 Los modelos se almacenarán en X:\VHQ_LAG\ollama_models\
echo ⚡ Para verificar: ollama list

pause
"""
    
    with open('restart_ollama.bat', 'w', encoding='utf-8') as f:
        f.write(restart_script)
    
    print("📝 Script de reinicio creado: restart_ollama.bat")

def main():
    print_header("CONFIGURADOR ENTORNO X:\ DRIVE - VHQ_LAG HÍBRIDO")
    print("🎯 Objetivo: Mover todo Ollama y modelos a disco X:\\")
    print("💡 Beneficio: No saturar disco C:\\ del sistema")
    print(f"📂 Ubicación base: X:\\VHQ_LAG\\")
    
    # Verificar Ollama
    if not check_ollama_status():
        print("❌ Ollama no disponible. Instalar desde: https://ollama.ai")
        return False
    
    # Crear estructura
    if not create_directory_structure():
        print("❌ Error creando directorios")
        return False
    
    # Configurar variables
    if not configure_environment_variables():
        print("❌ Error configurando variables")
        return False
    
    # Parar Ollama
    stop_ollama_service()
    
    # Crear scripts auxiliares
    create_ollama_restart_script()
    
    # Verificar
    if not verify_configuration():
        print("❌ Error en verificación")
        return False
    
    # Instrucciones finales
    print_header("✅ CONFIGURACIÓN COMPLETADA")
    print("🎯 Ollama configurado para usar X:\\ drive")
    print("📂 Modelos se guardarán en: X:\\VHQ_LAG\\ollama_models\\")
    print("💾 Datos temporales en: X:\\VHQ_LAG\\ollama_data\\")
    print("📋 Checkpoints en: X:\\VHQ_LAG\\checkpoints\\")
    
    print("\n📋 PRÓXIMOS PASOS:")
    print("1. 🔄 Ejecutar: .\\setup_env.ps1 (PowerShell)")
    print("   O ejecutar: .\\setup_env.bat (CMD como admin)")
    print("2. 🚀 Ejecutar: .\\restart_ollama.bat")
    print("3. 🧪 Verificar: ollama list")
    print("4. ⚡ Ejecutar: python implementar_sistema_hibrido.py")
    
    print("\n💡 VENTAJAS LOGRADAS:")
    print("✅ Disco C:\\ del sistema protegido")
    print("✅ Todo VHQ_LAG en un solo lugar (X:\\)")
    print("✅ Fácil backup y migración")
    print("✅ Control total sobre ubicaciones")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if not success:
            print("\n❌ Configuración falló. Revisar errores arriba.")
        else:
            print("\n🎉 ¡Configuración X:\\ drive completada!")
    except KeyboardInterrupt:
        print("\n⚠️  Configuración cancelada por usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}") 