#!/usr/bin/env python3
"""
🚀 SISTEMA DE INICIO VHQ_LAG - CONFIGURACIÓN OPTIMIZADA
Gestiona el inicio secuencial de celdas de agentes con recursos limitados
"""

import os
import sys
import time
import json
import psutil
import logging
import subprocess
from datetime import datetime, time as dt_time
from pathlib import Path

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('system_startup.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class VHQSystemManager:
    def __init__(self):
        self.config_file = Path("system_config.json")
        self.task_queue_file = Path("task_queue.json")
        self.active_agents = {}
        self.resource_limits = {
            "max_ram_gb": 28,  # Dejar 4GB para el sistema
            "max_gpu_vram_gb": 10,  # Dejar 2GB buffer
            "max_cpu_percent": 85
        }
        self.load_config()
        
    def load_config(self):
        """Carga configuración del sistema"""
        default_config = {
            "cells": {
                "A": {
                    "agents": ["00_CEO_LAG", "01_SEO_LAG"],
                    "priority": 1,
                    "ram_allocation": 12,
                    "always_active": True,
                    "schedule": {
                        "00_CEO_LAG": "24/7",
                        "01_SEO_LAG": "08:00-20:00"
                    }
                },
                "B": {
                    "agents": ["04_CLIP_LAG", "05_MEDIA_LAG", "15_GHOST_LAG"],
                    "priority": 2,
                    "ram_allocation": 16,
                    "sequential_only": True,
                    "max_active_time": 4  # horas
                },
                "C": {
                    "agents": ["02_CM_LAG", "07_CASH_LAG", "14_DONNA_LAG"],
                    "priority": 3,
                    "ram_allocation": 8,
                    "schedule": {
                        "02_CM_LAG": "10:00-12:00,18:00-20:00",
                        "07_CASH_LAG": "09:00-10:00",
                        "14_DONNA_LAG": "08:00-09:00,17:00-18:00"
                    }
                },
                "D": {
                    "agents": ["09_IT_LAG", "12_DEV_LAG", "11_WPM_LAG"],
                    "priority": 4,
                    "ram_allocation": 12,
                    "manual_activation": True
                }
            },
            "ollama_models": {
                "llama3.1:8b": {"ram_gb": 6, "agents": ["CEO", "SEO", "CM", "CASH", "DONNA"]},
                "codellama:13b": {"ram_gb": 10, "agents": ["GHOST", "IT", "DEV", "WPM"]}
            }
        }
        
        if not self.config_file.exists():
            with open(self.config_file, 'w') as f:
                json.dump(default_config, f, indent=2)
            logger.info("Archivo de configuración creado")
            
        with open(self.config_file, 'r') as f:
            self.config = json.load(f)
            
    def check_system_resources(self):
        """Verifica recursos del sistema disponibles"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        ram_gb = memory.total / (1024**3)
        ram_used_gb = memory.used / (1024**3)
        ram_available_gb = ram_gb - ram_used_gb
        
        logger.info(f"Recursos del sistema:")
        logger.info(f"  CPU: {cpu_percent}%")
        logger.info(f"  RAM: {ram_used_gb:.1f}GB / {ram_gb:.1f}GB ({ram_available_gb:.1f}GB disponible)")
        
        return {
            "cpu_percent": cpu_percent,
            "ram_total_gb": ram_gb,
            "ram_used_gb": ram_used_gb,
            "ram_available_gb": ram_available_gb
        }
        
    def check_ollama_status(self):
        """Verifica si Ollama está ejecutándose"""
        try:
            result = subprocess.run(['ollama', 'list'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                logger.info("Ollama está ejecutándose")
                return True
            else:
                logger.error("Ollama no responde")
                return False
        except (subprocess.TimeoutExpired, FileNotFoundError):
            logger.error("Ollama no está instalado o no responde")
            return False
            
    def start_ollama_model(self, model_name):
        """Inicia un modelo específico en Ollama"""
        try:
            logger.info(f"Iniciando modelo Ollama: {model_name}")
            subprocess.run(['ollama', 'run', model_name, '--keep-alive', '10m'], 
                         timeout=60, check=True)
            logger.info(f"Modelo {model_name} iniciado correctamente")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Error iniciando modelo {model_name}: {e}")
            return False
            
    def is_in_schedule(self, agent_name, schedule_str):
        """Verifica si un agente debe estar activo según su horario"""
        if schedule_str == "24/7":
            return True
            
        current_time = datetime.now().time()
        schedules = schedule_str.split(',')
        
        for schedule in schedules:
            if '-' in schedule:
                start_str, end_str = schedule.split('-')
                start_time = dt_time.fromisoformat(start_str)
                end_time = dt_time.fromisoformat(end_str)
                
                if start_time <= current_time <= end_time:
                    return True
                    
        return False
        
    def start_agent(self, agent_name, cell_name):
        """Inicia un agente específico"""
        if agent_name in self.active_agents:
            logger.warning(f"Agente {agent_name} ya está activo")
            return False
            
        # Verificar recursos antes de iniciar
        resources = self.check_system_resources()
        cell_config = self.config["cells"][cell_name]
        
        if resources["ram_available_gb"] < cell_config["ram_allocation"]:
            logger.error(f"RAM insuficiente para iniciar {agent_name}")
            return False
            
        try:
            # Simular inicio del agente (aquí iría la lógica real)
            logger.info(f"Iniciando agente {agent_name} en celda {cell_name}")
            
            # Registrar agente activo
            self.active_agents[agent_name] = {
                "cell": cell_name,
                "start_time": datetime.now(),
                "ram_allocated": cell_config["ram_allocation"]
            }
            
            logger.info(f"Agente {agent_name} iniciado correctamente")
            return True
            
        except Exception as e:
            logger.error(f"Error iniciando agente {agent_name}: {e}")
            return False
            
    def stop_agent(self, agent_name):
        """Detiene un agente específico"""
        if agent_name not in self.active_agents:
            logger.warning(f"Agente {agent_name} no está activo")
            return False
            
        try:
            logger.info(f"Deteniendo agente {agent_name}")
            # Aquí iría la lógica real de detención
            
            del self.active_agents[agent_name]
            logger.info(f"Agente {agent_name} detenido correctamente")
            return True
            
        except Exception as e:
            logger.error(f"Error deteniendo agente {agent_name}: {e}")
            return False
            
    def start_cell_a(self):
        """Inicia Celda A - Coordinación y Análisis"""
        logger.info("🔵 Iniciando Celda A - Coordinación y Análisis")
        
        # Iniciar modelo Ollama necesario
        if not self.start_ollama_model("llama3.1:8b"):
            return False
            
        cell_config = self.config["cells"]["A"]
        
        for agent in cell_config["agents"]:
            if agent in cell_config.get("schedule", {}):
                schedule = cell_config["schedule"][agent]
                if self.is_in_schedule(agent, schedule):
                    self.start_agent(agent, "A")
                else:
                    logger.info(f"Agente {agent} fuera de horario: {schedule}")
            else:
                self.start_agent(agent, "A")
                
        return True
        
    def start_cell_b(self):
        """Inicia Celda B - Contenido y Media (secuencial)"""
        logger.info("🟡 Celda B - Contenido y Media en modo standby")
        # Celda B se activa por demanda, no al inicio
        return True
        
    def start_cell_c(self):
        """Inicia Celda C - Comunidad y Finanzas"""
        logger.info("🟢 Iniciando Celda C - Comunidad y Finanzas")
        
        cell_config = self.config["cells"]["C"]
        
        for agent in cell_config["agents"]:
            if agent in cell_config.get("schedule", {}):
                schedule = cell_config["schedule"][agent]
                if self.is_in_schedule(agent, schedule):
                    self.start_agent(agent, "C")
                else:
                    logger.info(f"Agente {agent} fuera de horario: {schedule}")
                    
        return True
        
    def start_system(self):
        """Inicia el sistema completo de celdas"""
        logger.info("🚀 INICIANDO SISTEMA VHQ_LAG OPTIMIZADO")
        
        # Verificar prerrequisitos
        if not self.check_ollama_status():
            logger.error("No se puede iniciar sin Ollama")
            return False
            
        resources = self.check_system_resources()
        if resources["ram_available_gb"] < 12:
            logger.error("RAM insuficiente para operación básica")
            return False
            
        # Iniciar celdas por prioridad
        success = True
        success &= self.start_cell_a()  # Siempre activa
        success &= self.start_cell_b()  # Standby
        success &= self.start_cell_c()  # Por horarios
        
        if success:
            logger.info("✅ Sistema VHQ_LAG iniciado correctamente")
            self.print_status()
        else:
            logger.error("❌ Error en el inicio del sistema")
            
        return success
        
    def print_status(self):
        """Muestra el estado actual del sistema"""
        print("\n" + "="*50)
        print("📊 ESTADO ACTUAL DEL SISTEMA VHQ_LAG")
        print("="*50)
        
        resources = self.check_system_resources()
        print(f"🖥️  Recursos: CPU {resources['cpu_percent']}% | RAM {resources['ram_used_gb']:.1f}GB/{resources['ram_total_gb']:.1f}GB")
        
        print(f"🤖 Agentes Activos: {len(self.active_agents)}")
        for agent, info in self.active_agents.items():
            uptime = datetime.now() - info["start_time"]
            print(f"   • {agent} (Celda {info['cell']}) - {uptime}")
            
        print("="*50 + "\n")
        
    def monitor_loop(self):
        """Loop principal de monitoreo"""
        logger.info("🔄 Iniciando loop de monitoreo")
        
        try:
            while True:
                # Verificar horarios y activar/desactivar agentes
                self.check_schedules()
                
                # Monitorear recursos
                resources = self.check_system_resources()
                if resources["ram_used_gb"] > self.resource_limits["max_ram_gb"]:
                    logger.warning("⚠️  Uso de RAM excede límites")
                    
                # Esperar 60 segundos antes del próximo check
                time.sleep(60)
                
        except KeyboardInterrupt:
            logger.info("🛑 Deteniendo sistema por interrupción del usuario")
            self.shutdown_system()
            
    def check_schedules(self):
        """Verifica horarios y ajusta agentes activos"""
        current_hour = datetime.now().hour
        
        # Log cada hora
        if datetime.now().minute == 0:
            logger.info(f"⏰ Verificando horarios - {current_hour}:00")
            
        # Aquí iría la lógica de verificación de horarios
        # Por simplicidad, solo registramos
        
    def shutdown_system(self):
        """Detiene todos los agentes y cierra el sistema"""
        logger.info("🔴 Iniciando apagado del sistema")
        
        for agent_name in list(self.active_agents.keys()):
            self.stop_agent(agent_name)
            
        logger.info("✅ Sistema VHQ_LAG detenido correctamente")

def main():
    """Función principal"""
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        manager = VHQSystemManager()
        
        if command == "start":
            if manager.start_system():
                manager.monitor_loop()
        elif command == "status":
            manager.print_status()
        elif command == "stop":
            manager.shutdown_system()
        else:
            print("Comandos disponibles: start, status, stop")
    else:
        print("Uso: python start_system.py [start|status|stop]")

if __name__ == "__main__":
    main() 