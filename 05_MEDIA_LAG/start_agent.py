#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Start Script para MEDIA_LAG Agent
-------------------------------
Script de inicio para el agente MEDIA_LAG de LaGrieta.es
"""

import os
import sys
import logging
import signal
import time
from pathlib import Path

# Asegurar que estamos en el directorio correcto
os.chdir(Path(__file__).parent)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('media_agent.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('MEDIA_LAG.Startup')

def signal_handler(signum, frame):
    """Manejador de señales para detención graciosa."""
    logger.info(f"Recibida señal {signum}. Deteniendo el agente...")
    sys.exit(0)

def check_dependencies():
    """Verifica que todas las dependencias estén instaladas."""
    try:
        import cv2
        import ffmpeg
        import numpy
        from PIL import Image
        from pydantic import BaseModel
        logger.info("Todas las dependencias están instaladas correctamente")
        return True
    except ImportError as e:
        logger.error(f"Error de dependencia: {str(e)}")
        return False

def check_files():
    """Verifica que todos los archivos necesarios existan."""
    required_files = [
        'config.json',
        'media_agent.py',
        'brand_style_guide.txt',
        'ethical_checklist.txt'
    ]
    
    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        logger.error(f"Archivos faltantes: {', '.join(missing_files)}")
        return False
    
    logger.info("Todos los archivos necesarios están presentes")
    return True

def main():
    """Función principal de inicio."""
    try:
        logger.info("Iniciando proceso de arranque de MEDIA_LAG Agent")
        
        # Registrar manejador de señales
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Verificar ambiente
        if not check_dependencies():
            logger.error("Fallo en verificación de dependencias")
            sys.exit(1)
            
        if not check_files():
            logger.error("Fallo en verificación de archivos")
            sys.exit(1)
        
        # Importar e iniciar el agente
        from media_agent import MediaAgent
        
        logger.info("Iniciando MEDIA_LAG Agent")
        agent = MediaAgent()
        agent.run()
        
    except Exception as e:
        logger.error(f"Error durante el arranque: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 