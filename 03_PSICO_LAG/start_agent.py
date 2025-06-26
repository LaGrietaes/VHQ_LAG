"""
Script de inicio para el Agente Psicólogo de LaGrieta.es
"""

import argparse
import json
import logging
import os
import sys
from typing import Dict, Optional

from psicologo_agent import PsicologoAgent

def setup_logging(log_path: str, level: str = "INFO") -> None:
    """
    Configura el sistema de logging.
    
    Args:
        log_path (str): Ruta al archivo de log
        level (str): Nivel de logging
    """
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_path),
            logging.StreamHandler(sys.stdout)
        ]
    )

def load_config(config_path: str = "config.json") -> Dict:
    """
    Carga la configuración del agente.
    
    Args:
        config_path (str): Ruta al archivo de configuración
        
    Returns:
        Dict: Configuración cargada
    """
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        raise RuntimeError(f"Error al cargar la configuración: {e}")

def create_directories(config: Dict) -> None:
    """
    Crea las carpetas necesarias si no existen.
    
    Args:
        config (Dict): Configuración del agente
    """
    directories = [
        config['paths']['data_dir'],
        config['paths']['logs_dir'],
        config['paths']['shared_dir']
    ]
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)

def initialize_agent(config_path: str) -> Optional[PsicologoAgent]:
    """
    Inicializa el agente psicólogo.
    
    Args:
        config_path (str): Ruta al archivo de configuración
        
    Returns:
        Optional[PsicologoAgent]: Instancia del agente o None si hay error
    """
    try:
        # Cargar configuración
        config = load_config(config_path)
        
        # Crear directorios necesarios
        create_directories(config)
        
        # Configurar logging
        log_path = os.path.join(config['paths']['logs_dir'], '03_PSICO_LAG.log')
        setup_logging(log_path, config.get('log_level', 'INFO'))
        
        # Inicializar agente
        agent = PsicologoAgent(config_path)
        logging.info("Agente Psicólogo inicializado correctamente")
        
        return agent
        
    except Exception as e:
        logging.error(f"Error al inicializar el agente: {e}")
        return None

def main():
    """Main entry point for the PSICO_LAG agent."""
    try:
        setup_environment()
        logger.info("Starting PSICO_LAG agent...")
        
        from psico_agent import PsicoLAGAgent
        agent = PsicoLAGAgent()
        agent.run()
        
    except KeyboardInterrupt:
        logger.info("PSICO_LAG agent shutting down...")
    except Exception as e:
        logger.error(f"Error starting agent: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 