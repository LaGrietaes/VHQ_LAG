#!/usr/bin/env python3
"""
🔧 ULTRA SYSTEM MANAGER VHQ_LAG - HARDWARE LIMITADO
Gestiona priorización crítica, buffer de estado y hibernación inteligente
Fecha: 27 de Junio 2025
"""

import os
import sys
import time
import json
import psutil
import logging
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from threading import Lock
from enum import Enum

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ultra_system.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SystemMode(Enum):
    NORMAL = "normal"
    CRITICAL = "critical"
    EMERGENCY = "emergency"
    MAINTENANCE = "maintenance"

class AgentStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    HIBERNATED = "hibernated"
    CRITICAL_ACTIVE = "critical_active"
    ERROR = "error"

class UltraSystemManager:
    def __init__(self):
        self.state_file = Path("shared_resources/state/agent_state_buffer.json")
        self.state_lock = Lock()
        self.system_mode = SystemMode.NORMAL
        self.active_agent = None
        self.agents_state = {}
        self.resource_limits = {
            "max_ram_percent": 75,  # Ultra conservador
            "critical_ram_percent": 90,
            "max_cpu_percent": 60,
            "critical_cpu_percent": 85,
            "max_temp": 80,
            "min_disk_gb": 10
        }
        
        # Configuración de agentes y prioridades
        self.agent_priorities = {
            # PRIORIDAD 1 - CRÍTICA (Pausa todo)
            "05_MEDIA_LAG": {
                "priority": 1,
                "max_time_hours": None,  # Sin límite
                "ram_gb": 14,
                "model": "llama3.1:8b",
                "critical_tasks": ["full_library_organization", "massive_backup", "video_conversion"]
            },
            
            # PRIORIDAD 2 - COORDINACIÓN (Siempre mínimo)
            "00_CEO_LAG": {
                "priority": 2,
                "max_time_hours": None,
                "ram_gb": 6,
                "model": "llama3.1:7b-instruct-q4_0",
                "always_active": True,
                "minimal_mode": True
            },
            
            # PRIORIDAD 3 - OPERACIÓN NORMAL
            "01_SEO_LAG": {
                "priority": 3,
                "max_time_hours": 2,
                "ram_gb": 8,
                "model": "llama3.1:7b-instruct-q4_0",
                "schedule": "08:00-12:00"
            },
            "15_GHOST_LAG": {
                "priority": 3,
                "max_time_hours": 2,
                "ram_gb": 8,
                "model": "codellama:7b-instruct-q4_0",
                "schedule": "14:00-16:00"
            },
            "02_CM_LAG": {
                "priority": 3,
                "max_time_hours": 2,
                "ram_gb": 8,
                "model": "llama3.1:7b-instruct-q4_0",
                "schedule": "12:00-14:00,18:00-20:00"
            },
            "07_CASH_LAG": {
                "priority": 3,
                "max_time_hours": 1,
                "ram_gb": 6,
                "model": "llama3.1:7b-instruct-q4_0",
                "schedule": "06:00-08:00"
            },
            "14_DONNA_LAG": {
                "priority": 3,
                "max_time_hours": 2,
                "ram_gb": 8,
                "model": "llama3.1:7b-instruct-q4_0",
                "schedule": "16:00-18:00"
            },
            
            # PRIORIDAD 4 - DESARROLLO (Manual)
            "09_IT_LAG": {
                "priority": 4,
                "max_time_hours": 6,
                "ram_gb": 10,
                "model": "codellama:7b-instruct-q4_0",
                "manual_only": True
            },
            "12_DEV_LAG": {
                "priority": 4,
                "max_time_hours": 6,
                "ram_gb": 10,
                "model": "codellama:7b-instruct-q4_0",
                "manual_only": True
            },
            "11_WPM_LAG": {
                "priority": 4,
                "max_time_hours": 4,
                "ram_gb": 8,
                "model": "llama3.1:7b-instruct-q4_0",
                "manual_only": True
            }
        }
        
        self.ensure_state_directory()
        self.load_state()
        
    def ensure_state_directory(self):
        """Asegura que existe el directorio de estado"""
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        
    def load_state(self):
        """Carga el estado del sistema desde archivo"""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r') as f:
                    data = json.load(f)
                    self.system_mode = SystemMode(data.get('system_mode', 'normal'))
                    self.active_agent = data.get('active_agent')
                    self.agents_state = data.get('agents_state', {})
                    
                logger.info(f"Estado cargado: modo {self.system_mode.value}, agente activo: {self.active_agent}")
            except Exception as e:
                logger.error(f"Error cargando estado: {e}")
                self.initialize_default_state()
        else:
            self.initialize_default_state()
            
    def initialize_default_state(self):
        """Inicializa estado por defecto"""
        self.system_mode = SystemMode.NORMAL
        self.active_agent = "00_CEO_LAG"  # CEO siempre activo por defecto
        self.agents_state = {}
        
        for agent_name in self.agent_priorities.keys():
            self.agents_state[agent_name] = {
                "status": AgentStatus.HIBERNATED.value,
                "current_task": None,
                "progress": "0%",
                "estimated_completion": None,
                "last_checkpoint": None,
                "next_action": None,
                "priority_queue": [],
                "start_time": None,
                "last_activity": None
            }
            
        # CEO siempre activo en modo minimal
        self.agents_state["00_CEO_LAG"]["status"] = AgentStatus.ACTIVE.value
        self.agents_state["00_CEO_LAG"]["start_time"] = datetime.now().isoformat()
        
        self.save_state()
        
    def save_state(self):
        """Guarda el estado actual del sistema"""
        with self.state_lock:
            try:
                state_data = {
                    "timestamp": datetime.now().isoformat(),
                    "system_mode": self.system_mode.value,
                    "active_agent": self.active_agent,
                    "agents_state": self.agents_state
                }
                
                with open(self.state_file, 'w') as f:
                    json.dump(state_data, f, indent=2)
                    
            except Exception as e:
                logger.error(f"Error guardando estado: {e}")
                
    def get_system_resources(self):
        """Obtiene recursos actuales del sistema"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Temperatura (si está disponible)
        temp = 0
        try:
            temperatures = psutil.sensors_temperatures()
            if temperatures:
                temp = max([t.current for sensors in temperatures.values() for t in sensors])
        except:
            pass
            
        return {
            "cpu_percent": cpu_percent,
            "ram_percent": memory.percent,
            "ram_available_gb": memory.available / (1024**3),
            "disk_free_gb": disk.free / (1024**3),
            "temperature": temp
        }
        
    def check_emergency_conditions(self):
        """Verifica condiciones de emergencia"""
        resources = self.get_system_resources()
        emergency_reasons = []
        
        if resources["ram_percent"] > self.resource_limits["critical_ram_percent"]:
            emergency_reasons.append(f"RAM crítica: {resources['ram_percent']:.1f}%")
            
        if resources["cpu_percent"] > self.resource_limits["critical_cpu_percent"]:
            emergency_reasons.append(f"CPU crítica: {resources['cpu_percent']:.1f}%")
            
        if resources["temperature"] > self.resource_limits["max_temp"]:
            emergency_reasons.append(f"Temperatura crítica: {resources['temperature']:.1f}°C")
            
        if resources["disk_free_gb"] < self.resource_limits["min_disk_gb"]:
            emergency_reasons.append(f"Disco crítico: {resources['disk_free_gb']:.1f}GB libres")
            
        return emergency_reasons
        
    def enter_emergency_mode(self, reasons):
        """Entra en modo de emergencia"""
        logger.error(f"🚨 ACTIVANDO MODO EMERGENCIA: {', '.join(reasons)}")
        
        self.system_mode = SystemMode.EMERGENCY
        
        # Pausar todos los agentes excepto CEO en modo safe
        for agent_name in self.agents_state.keys():
            if agent_name != "00_CEO_LAG":
                self.pause_agent(agent_name, emergency=True)
                
        # CEO en modo ultra-minimal
        self.agents_state["00_CEO_LAG"]["status"] = AgentStatus.ACTIVE.value
        self.active_agent = "00_CEO_LAG"
        
        self.save_state()
        logger.error("Sistema en modo EMERGENCIA - solo CEO activo")
        
    def exit_emergency_mode(self):
        """Sale del modo de emergencia"""
        logger.info("🔄 Saliendo del modo emergencia")
        self.system_mode = SystemMode.NORMAL
        self.save_state()
        
    def enter_critical_mode(self, agent_name, task_name):
        """Entra en modo crítico para una tarea pesada"""
        logger.warning(f"⚠️  MODO CRÍTICO: {agent_name} ejecutando {task_name}")
        
        # Guardar estado de todos los agentes activos
        for name, state in self.agents_state.items():
            if state["status"] == AgentStatus.ACTIVE.value and name != agent_name:
                self.pause_agent(name, critical_mode=True)
                
        # Activar solo el agente crítico
        self.system_mode = SystemMode.CRITICAL
        self.active_agent = agent_name
        self.agents_state[agent_name]["status"] = AgentStatus.CRITICAL_ACTIVE.value
        self.agents_state[agent_name]["current_task"] = task_name
        self.agents_state[agent_name]["start_time"] = datetime.now().isoformat()
        
        self.save_state()
        logger.warning(f"Sistema en MODO CRÍTICO - solo {agent_name} activo")
        
    def exit_critical_mode(self):
        """Sale del modo crítico"""
        logger.info("🔄 Saliendo del modo crítico")
        
        if self.active_agent:
            self.agents_state[self.active_agent]["status"] = AgentStatus.HIBERNATED.value
            
        self.system_mode = SystemMode.NORMAL
        self.active_agent = "00_CEO_LAG"  # Volver al CEO
        self.agents_state["00_CEO_LAG"]["status"] = AgentStatus.ACTIVE.value
        
        # Reactivar agentes según horario
        self.check_and_activate_scheduled_agents()
        self.save_state()
        
    def pause_agent(self, agent_name, emergency=False, critical_mode=False):
        """Pausa un agente guardando su estado"""
        if agent_name not in self.agents_state:
            return False
            
        agent_state = self.agents_state[agent_name]
        
        if agent_state["status"] != AgentStatus.ACTIVE.value:
            return True  # Ya pausado
            
        logger.info(f"⏸️  Pausando agente {agent_name}")
        
        # Crear checkpoint del estado actual
        checkpoint = {
            "agent_name": agent_name,
            "pause_time": datetime.now().isoformat(),
            "current_task": agent_state.get("current_task"),
            "progress": agent_state.get("progress", "0%"),
            "next_action": agent_state.get("next_action"),
            "priority_queue": agent_state.get("priority_queue", []),
            "pause_reason": "emergency" if emergency else "critical_mode" if critical_mode else "scheduled"
        }
        
        # Guardar checkpoint
        checkpoint_file = Path(f"shared_resources/state/checkpoint_{agent_name}.json")
        try:
            with open(checkpoint_file, 'w') as f:
                json.dump(checkpoint, f, indent=2)
        except Exception as e:
            logger.error(f"Error guardando checkpoint para {agent_name}: {e}")
            
        # Actualizar estado
        agent_state["status"] = AgentStatus.PAUSED.value
        agent_state["last_checkpoint"] = checkpoint_file.name
        agent_state["last_activity"] = datetime.now().isoformat()
        
        # Simular liberación de recursos (aquí iría la lógica real)
        logger.info(f"✅ Agente {agent_name} pausado y recursos liberados")
        
        return True
        
    def resume_agent(self, agent_name):
        """Reanuda un agente desde su checkpoint"""
        if agent_name not in self.agents_state:
            return False
            
        agent_state = self.agents_state[agent_name]
        
        if agent_state["status"] not in [AgentStatus.PAUSED.value, AgentStatus.HIBERNATED.value]:
            logger.warning(f"Agente {agent_name} no está pausado/hibernado")
            return False
            
        # Verificar recursos disponibles
        resources = self.get_system_resources()
        agent_config = self.agent_priorities[agent_name]
        
        if resources["ram_available_gb"] < agent_config["ram_gb"]:
            logger.error(f"RAM insuficiente para reanudar {agent_name}")
            return False
            
        logger.info(f"▶️  Reanudando agente {agent_name}")
        
        # Cargar checkpoint si existe
        checkpoint_file = Path(f"shared_resources/state/checkpoint_{agent_name}.json")
        if checkpoint_file.exists():
            try:
                with open(checkpoint_file, 'r') as f:
                    checkpoint = json.load(f)
                    
                agent_state["current_task"] = checkpoint.get("current_task")
                agent_state["progress"] = checkpoint.get("progress", "0%")
                agent_state["next_action"] = checkpoint.get("next_action")
                agent_state["priority_queue"] = checkpoint.get("priority_queue", [])
                
                logger.info(f"Checkpoint cargado para {agent_name}: {agent_state['progress']} completado")
                
            except Exception as e:
                logger.error(f"Error cargando checkpoint para {agent_name}: {e}")
                
        # Activar agente
        agent_state["status"] = AgentStatus.ACTIVE.value
        agent_state["start_time"] = datetime.now().isoformat()
        
        # Simular inicio del agente (aquí iría la lógica real)
        logger.info(f"✅ Agente {agent_name} reanudado correctamente")
        
        return True
        
    def is_agent_in_schedule(self, agent_name):
        """Verifica si un agente debe estar activo según su horario"""
        agent_config = self.agent_priorities.get(agent_name, {})
        
        if agent_config.get("always_active"):
            return True
            
        if agent_config.get("manual_only"):
            return False
            
        schedule = agent_config.get("schedule")
        if not schedule:
            return False
            
        current_time = datetime.now().time()
        schedules = schedule.split(',')
        
        for sched in schedules:
            if '-' in sched:
                start_str, end_str = sched.split('-')
                start_time = datetime.strptime(start_str, "%H:%M").time()
                end_time = datetime.strptime(end_str, "%H:%M").time()
                
                if start_time <= current_time <= end_time:
                    return True
                    
        return False
        
    def check_and_activate_scheduled_agents(self):
        """Verifica y activa agentes según su horario"""
        if self.system_mode in [SystemMode.CRITICAL, SystemMode.EMERGENCY]:
            return  # No activar nada en modo crítico/emergencia
            
        current_active = [name for name, state in self.agents_state.items() 
                         if state["status"] == AgentStatus.ACTIVE.value]
        
        # Solo CEO + 1 agente máximo en modo normal
        if len(current_active) >= 2:
            return
            
        for agent_name, agent_config in self.agent_priorities.items():
            if agent_config["priority"] == 3:  # Solo agentes de operación normal
                if (self.is_agent_in_schedule(agent_name) and 
                    self.agents_state[agent_name]["status"] != AgentStatus.ACTIVE.value):
                    
                    # Pausar otros agentes de prioridad 3 primero
                    for other_name in self.agents_state.keys():
                        if (other_name != agent_name and other_name != "00_CEO_LAG" and
                            self.agents_state[other_name]["status"] == AgentStatus.ACTIVE.value):
                            self.pause_agent(other_name)
                            
                    # Activar el agente programado
                    if self.resume_agent(agent_name):
                        break  # Solo uno por vez
                        
    def request_critical_task(self, agent_name, task_name):
        """Solicita ejecución de una tarea crítica"""
        if agent_name not in self.agent_priorities:
            logger.error(f"Agente {agent_name} no válido")
            return False
            
        agent_config = self.agent_priorities[agent_name]
        if agent_config["priority"] != 1:
            logger.error(f"Agente {agent_name} no tiene prioridad crítica")
            return False
            
        if task_name not in agent_config.get("critical_tasks", []):
            logger.error(f"Tarea {task_name} no es crítica para {agent_name}")
            return False
            
        logger.info(f"🚨 Solicitando tarea crítica: {agent_name} -> {task_name}")
        
        # Entrar en modo crítico
        self.enter_critical_mode(agent_name, task_name)
        
        return True
        
    def manual_activate_agent(self, agent_name):
        """Activación manual de agente (para desarrollo)"""
        if agent_name not in self.agent_priorities:
            logger.error(f"Agente {agent_name} no válido")
            return False
            
        agent_config = self.agent_priorities[agent_name]
        if not agent_config.get("manual_only"):
            logger.error(f"Agente {agent_name} no es de activación manual")
            return False
            
        logger.info(f"🔧 Activación manual: {agent_name}")
        
        # Pausar todos los agentes excepto CEO
        for name in self.agents_state.keys():
            if name != "00_CEO_LAG" and name != agent_name:
                self.pause_agent(name)
                
        # Activar agente solicitado
        return self.resume_agent(agent_name)
        
    def print_system_status(self):
        """Muestra estado completo del sistema"""
        resources = self.get_system_resources()
        
        print("\n" + "="*70)
        print("🔧 ESTADO SISTEMA VHQ_LAG ULTRA-OPTIMIZADO")
        print("="*70)
        print(f"📅 Fecha: {datetime.now().strftime('%d de %B de %Y, %H:%M:%S')}")
        print(f"🔄 Modo Sistema: {self.system_mode.value.upper()}")
        print(f"🤖 Agente Activo Principal: {self.active_agent or 'Ninguno'}")
        print()
        
        # Recursos
        print("🖥️  RECURSOS DEL SISTEMA:")
        print(f"   CPU: {resources['cpu_percent']:.1f}% {'🔴' if resources['cpu_percent'] > 75 else '🟡' if resources['cpu_percent'] > 60 else '🟢'}")
        print(f"   RAM: {resources['ram_percent']:.1f}% {'🔴' if resources['ram_percent'] > 85 else '🟡' if resources['ram_percent'] > 70 else '🟢'}")
        print(f"   Disco libre: {resources['disk_free_gb']:.1f} GB {'🔴' if resources['disk_free_gb'] < 20 else '🟡' if resources['disk_free_gb'] < 50 else '🟢'}")
        if resources["temperature"] > 0:
            print(f"   Temperatura: {resources['temperature']:.1f}°C {'🔴' if resources['temperature'] > 75 else '🟡' if resources['temperature'] > 65 else '🟢'}")
        print()
        
        # Estado de agentes
        print("🤖 ESTADO DE AGENTES:")
        for agent_name, state in self.agents_state.items():
            status = state["status"]
            status_icon = {
                "active": "🟢",
                "critical_active": "🔴",
                "paused": "🟡",
                "hibernated": "⚪",
                "error": "❌"
            }.get(status, "❓")
            
            print(f"   {status_icon} {agent_name}: {status.upper()}")
            
            if state.get("current_task"):
                print(f"      📋 Tarea: {state['current_task']}")
                print(f"      📊 Progreso: {state.get('progress', '0%')}")
                
            if state.get("start_time"):
                start_time = datetime.fromisoformat(state["start_time"])
                uptime = datetime.now() - start_time
                print(f"      ⏱️  Tiempo activo: {uptime}")
                
        print("="*70)
        
        # Alertas
        emergency_reasons = self.check_emergency_conditions()
        if emergency_reasons:
            print("\n🚨 ALERTAS CRÍTICAS:")
            for reason in emergency_reasons:
                print(f"   ❗ {reason}")
            print()
            
    def monitor_loop(self, interval=60):
        """Loop principal de monitoreo ultra-conservador"""
        logger.info(f"🔄 Iniciando monitoreo ultra-conservador cada {interval} segundos")
        
        try:
            while True:
                # Verificar condiciones de emergencia
                emergency_reasons = self.check_emergency_conditions()
                
                if emergency_reasons and self.system_mode != SystemMode.EMERGENCY:
                    self.enter_emergency_mode(emergency_reasons)
                elif not emergency_reasons and self.system_mode == SystemMode.EMERGENCY:
                    self.exit_emergency_mode()
                    
                # Si no estamos en emergencia, gestionar agentes normalmente
                if self.system_mode not in [SystemMode.EMERGENCY, SystemMode.CRITICAL]:
                    self.check_and_activate_scheduled_agents()
                    
                # Guardar estado cada ciclo
                self.save_state()
                
                # Mostrar estado cada 10 ciclos (10 minutos si interval=60)
                if hasattr(self, '_cycle_count'):
                    self._cycle_count += 1
                else:
                    self._cycle_count = 1
                    
                if self._cycle_count % 10 == 0:
                    self.print_system_status()
                    
                time.sleep(interval)
                
        except KeyboardInterrupt:
            logger.info("🛑 Monitoreo detenido por el usuario")
            self.shutdown_system()
            
        except Exception as e:
            logger.error(f"Error en monitoreo: {e}")
            self.save_state()
            
    def shutdown_system(self):
        """Apaga el sistema guardando todo el estado"""
        logger.info("🔴 Iniciando apagado del sistema")
        
        # Pausar todos los agentes
        for agent_name in self.agents_state.keys():
            if self.agents_state[agent_name]["status"] == AgentStatus.ACTIVE.value:
                self.pause_agent(agent_name)
                
        self.save_state()
        logger.info("✅ Sistema apagado correctamente - estado guardado")

def main():
    """Función principal"""
    if len(sys.argv) < 2:
        print("Uso: python ultra_system_manager.py [comando] [parámetros]")
        print("Comandos:")
        print("  start                    - Iniciar monitoreo")
        print("  status                   - Mostrar estado")
        print("  critical [agente] [tarea] - Ejecutar tarea crítica")
        print("  manual [agente]          - Activar agente manual")
        print("  emergency                - Modo emergencia manual")
        print("  exit_critical            - Salir de modo crítico")
        print("  shutdown                 - Apagar sistema")
        return
        
    manager = UltraSystemManager()
    command = sys.argv[1].lower()
    
    if command == "start":
        interval = int(sys.argv[2]) if len(sys.argv) > 2 else 60
        manager.monitor_loop(interval)
        
    elif command == "status":
        manager.print_system_status()
        
    elif command == "critical":
        if len(sys.argv) < 4:
            print("Uso: critical [agente] [tarea]")
            return
        agent_name = sys.argv[2]
        task_name = sys.argv[3]
        manager.request_critical_task(agent_name, task_name)
        
    elif command == "manual":
        if len(sys.argv) < 3:
            print("Uso: manual [agente]")
            return
        agent_name = sys.argv[2]
        manager.manual_activate_agent(agent_name)
        
    elif command == "emergency":
        manager.enter_emergency_mode(["Activación manual"])
        
    elif command == "exit_critical":
        manager.exit_critical_mode()
        
    elif command == "shutdown":
        manager.shutdown_system()
        
    else:
        print(f"Comando '{command}' no reconocido")

if __name__ == "__main__":
    main() 