"""
Script de inicio para el Agente Escritor Fantasma (GHOST_LAG) de LaGrieta.es
Gestión y generación asistida de textos largos con coordinación inter-agente
"""

import argparse
import json
import logging
import os
import sys
import asyncio
from pathlib import Path
from typing import Dict, Optional

def setup_logging(log_path: str, level: str = "INFO") -> None:
    """
    Configura el sistema de logging.
    
    Args:
        log_path (str): Ruta al archivo de log
        level (str): Nivel de logging
    """
    # Ensure log directory exists
    log_dir = Path(log_path).parent
    log_dir.mkdir(parents=True, exist_ok=True)
    
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_path, encoding='utf-8'),
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

def setup_environment() -> None:
    """
    Configura el entorno necesario para el agente.
    """
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check required environment variables
    required_vars = ['OPENAI_API_KEY']  # Add more as needed
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logging.warning(f"Missing environment variables: {', '.join(missing_vars)}")

def create_directories(config: Dict) -> None:
    """
    Crea las carpetas necesarias si no existen.
    
    Args:
        config (Dict): Configuración del agente
    """
    directories = [
        config['project_management']['workspace_path'],
        'Agents_Logs',
        'VHQ_Resources/obsidian_vault',
        'VHQ_Resources/templates',
        config['project_management']['workspace_path'] + '/libros',
        config['project_management']['workspace_path'] + '/scripts', 
        config['project_management']['workspace_path'] + '/blog_posts',
        config['project_management']['workspace_path'] + '/ebooks'
    ]
    
    for directory in directories:
        dir_path = Path(directory)
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)
            logging.info(f"Created directory: {directory}")

def initialize_agent(config_path: str) -> Optional['GhostAgent']:
    """
    Inicializa el agente GHOST_LAG.
    
    Args:
        config_path (str): Ruta al archivo de configuración
        
    Returns:
        Optional[GhostAgent]: Instancia del agente o None si hay error
    """
    try:
        # Cargar configuración
        config = load_config(config_path)
        
        # Crear directorios necesarios
        create_directories(config)
        
        # Configurar logging
        log_path = os.path.join('Agents_Logs', '15_GHOST_LAG.log')
        setup_logging(log_path, config.get('log_level', 'INFO'))
        
        # Setup environment
        setup_environment()
        
        # Importar y inicializar agente
        from ghost_agent import GhostAgent
        agent = GhostAgent(config_path)
        
        logging.info("Agente GHOST_LAG inicializado correctamente")
        return agent
        
    except Exception as e:
        logging.error(f"Error al inicializar el agente: {e}")
        return None

async def run_agent_async(agent: 'GhostAgent') -> None:
    """
    Ejecuta el agente de forma asíncrona.
    
    Args:
        agent: Instancia del agente GHOST_LAG
    """
    try:
        await agent.initialize()
        
        # Keep the agent running
        logging.info("GHOST_LAG Agent está corriendo. Presiona Ctrl+C para detener.")
        
        while True:
            # Process any pending tasks
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        logging.info("Deteniendo GHOST_LAG Agent...")
    except Exception as e:
        logging.error(f"Error ejecutando el agente: {e}")
        raise

def main():
    """
    Punto de entrada principal para el agente GHOST_LAG.
    """
    parser = argparse.ArgumentParser(description='GHOST_LAG - Agente Escritor Fantasma')
    parser.add_argument('--config', default='config.json', 
                       help='Ruta al archivo de configuración')
    parser.add_argument('--log-level', choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'], 
                       default='INFO', help='Nivel de logging')
    parser.add_argument('--test', action='store_true', 
                       help='Ejecutar en modo de prueba')
    
    args = parser.parse_args()
    
    try:
        # Inicializar agente
        agent = initialize_agent(args.config)
        if not agent:
            sys.exit(1)
        
        if args.test:
            logging.info("Ejecutando en modo de prueba...")
            # Aquí podrías agregar tests específicos
            logging.info("Pruebas completadas exitosamente")
            return
        
        # Ejecutar agente
        asyncio.run(run_agent_async(agent))
        
    except KeyboardInterrupt:
        logging.info("GHOST_LAG agent shutting down...")
    except Exception as e:
        logging.error(f"Error crítico: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 