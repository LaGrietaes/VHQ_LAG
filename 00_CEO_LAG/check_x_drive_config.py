#!/usr/bin/env python3
"""
🔍 VERIFICADOR CONFIGURACIÓN X:\ DRIVE - VHQ_LAG
Verifica que Ollama esté configurado correctamente para usar X:\ drive
Fecha: 27 de Junio 2025
"""

import os
import subprocess
from pathlib import Path

def print_header(title):
    print(f"\n{'='*60}")
    print(f"🔍 {title}")
    print(f"{'='*60}")

def check_directories():
    """Verifica que existan los directorios necesarios"""
    print_header("VERIFICANDO DIRECTORIOS")
    
    required_dirs = [
        "X:/VHQ_LAG/ollama_models",
        "X:/VHQ_LAG/ollama_data",
        "X:/VHQ_LAG/checkpoints",
        "X:/VHQ_LAG/system_logs",
        "X:/VHQ_LAG/sessions_output"
    ]
    
    all_good = True
    for dir_path in required_dirs:
        path = Path(dir_path)
        if path.exists():
            print(f"✅ {dir_path}")
        else:
            print(f"❌ {dir_path} - FALTA")
            all_good = False
    
    return all_good

def check_environment_variables():
    """Verifica las variables de entorno"""
    print_header("VERIFICANDO VARIABLES DE ENTORNO")
    
    required_vars = {
        'OLLAMA_MODELS': 'X:\\VHQ_LAG\\ollama_models',
        'OLLAMA_HOST': '127.0.0.1:11434',
        'OLLAMA_MAX_LOADED_MODELS': '1'
    }
    
    all_good = True
    for var, expected in required_vars.items():
        current = os.environ.get(var, 'NO CONFIGURADA')
        if current == expected:
            print(f"✅ {var} = {current}")
        elif current == 'NO CONFIGURADA':
            print(f"⚠️  {var} = {current} (ejecutar setup_env.ps1)")
            all_good = False
        else:
            print(f"🔄 {var} = {current} (esperado: {expected})")
    
    return all_good

def check_ollama_status():
    """Verifica el estado de Ollama"""
    print_header("VERIFICANDO OLLAMA")
    
    try:
        # Verificar si Ollama está disponible
        result = subprocess.run(['ollama', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print(f"✅ Ollama versión: {result.stdout.strip()}")
        else:
            print("❌ Ollama no responde correctamente")
            return False
        
        # Verificar modelos instalados
        result = subprocess.run(['ollama', 'list'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            if result.stdout.strip():
                print("📋 Modelos instalados:")
                for line in result.stdout.strip().split('\n')[1:]:  # Skip header
                    if line.strip():
                        print(f"   📦 {line.strip()}")
            else:
                print("ℹ️  No hay modelos instalados aún")
            return True
        else:
            print("⚠️  No se pueden listar modelos")
            return False
            
    except FileNotFoundError:
        print("❌ Ollama no encontrado en PATH")
        return False
    except subprocess.TimeoutExpired:
        print("⏰ Timeout verificando Ollama")
        return False
    except Exception as e:
        print(f"❌ Error verificando Ollama: {e}")
        return False

def check_space_usage():
    """Verifica el uso de espacio en X:\ drive"""
    print_header("VERIFICANDO ESPACIO EN DISCO")
    
    try:
        models_dir = Path("X:/VHQ_LAG/ollama_models")
        if models_dir.exists():
            total_size = 0
            model_count = 0
            
            for file_path in models_dir.rglob('*'):
                if file_path.is_file():
                    size = file_path.stat().st_size
                    total_size += size
                    if size > 100 * 1024 * 1024:  # Archivos > 100MB (probablemente modelos)
                        model_count += 1
                        size_gb = size / (1024**3)
                        print(f"   📦 {file_path.name}: {size_gb:.1f} GB")
            
            total_gb = total_size / (1024**3)
            print(f"📊 Total modelos: {model_count}")
            print(f"💾 Espacio usado: {total_gb:.1f} GB")
            
            if total_gb > 50:
                print("⚠️  Uso alto de espacio (>50GB)")
            elif total_gb > 20:
                print("ℹ️  Uso moderado de espacio")
            else:
                print("✅ Uso de espacio normal")
        else:
            print("ℹ️  Directorio de modelos vacío")
            
    except Exception as e:
        print(f"⚠️  No se pudo verificar espacio: {e}")

def check_x_drive_access():
    """Verifica acceso de lectura/escritura en X:\ drive"""
    print_header("VERIFICANDO ACCESO X:\ DRIVE")
    
    try:
        test_file = Path("X:/VHQ_LAG/test_write.tmp")
        
        # Prueba de escritura
        test_file.write_text("test")
        print("✅ Escritura en X:\\ drive OK")
        
        # Prueba de lectura
        content = test_file.read_text()
        if content == "test":
            print("✅ Lectura en X:\\ drive OK")
        
        # Limpiar
        test_file.unlink()
        print("✅ Eliminación en X:\\ drive OK")
        
        return True
        
    except Exception as e:
        print(f"❌ Error acceso X:\\ drive: {e}")
        return False

def main():
    print_header("VERIFICADOR CONFIGURACIÓN X:\\ DRIVE")
    print("🎯 Verificando configuración VHQ_LAG en X:\\ drive")
    print("📂 Ubicación: X:\\VHQ_LAG\\")
    
    checks = [
        ("Directorios", check_directories),
        ("Variables de entorno", check_environment_variables),
        ("Estado Ollama", check_ollama_status),
        ("Acceso X:\\ drive", check_x_drive_access),
        ("Uso de espacio", lambda: (check_space_usage(), True)[1])  # Always return True
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ Error en verificación {name}: {e}")
            results.append((name, False))
    
    # Resumen final
    print_header("RESUMEN DE VERIFICACIÓN")
    
    passed = 0
    for name, result in results:
        if result:
            print(f"✅ {name}: OK")
            passed += 1
        else:
            print(f"❌ {name}: FALLO")
    
    print(f"\n📊 Resultado: {passed}/{len(results)} verificaciones pasaron")
    
    if passed == len(results):
        print("🎉 ¡Configuración X:\\ drive completamente funcional!")
        print("🚀 Puedes ejecutar: python implementar_sistema_hibrido.py")
    elif passed >= len(results) - 1:
        print("⚠️  Configuración casi completa, revisar fallos menores")
        print("💡 Ejecutar setup_env.ps1 si faltan variables")
    else:
        print("❌ Configuración incompleta, revisar errores arriba")
        print("🔧 Ejecutar setup_env.ps1 y restart_ollama.bat")
    
    print("\n📋 COMANDOS ÚTILES:")
    print("   ⚡ .\\setup_env.ps1 - Configurar variables")
    print("   🚀 .\\restart_ollama.bat - Reiniciar Ollama")
    print("   🧪 ollama list - Ver modelos")
    print("   📦 ollama pull llama3.1:7b - Descargar modelo")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️  Verificación cancelada por usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}") 