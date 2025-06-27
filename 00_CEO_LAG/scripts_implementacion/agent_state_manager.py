#!/usr/bin/env python3
"""
🗄️ AGENT STATE MANAGER - VHQ_LAG ULTRA-OPTIMIZADO
Gestiona persistencia de estado, checkpoints y recuperación de agentes
Fecha: 27 de Junio 2025
"""

import json
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TaskCheckpoint:
    """Checkpoint de una tarea específica"""
    task_id: str
    agent_name: str
    task_type: str
    start_time: str
    last_update: str
    progress_percentage: float
    current_step: str
    completed_steps: List[str]
    pending_steps: List[str]
    data_processed: int
    total_data: int
    error_count: int
    last_error: Optional[str]
    estimated_completion: Optional[str]
    custom_data: Dict[str, Any]

@dataclass
class AgentState:
    """Estado completo de un agente"""
    agent_name: str
    status: str  # active, paused, hibernated, critical_active, error
    current_task_id: Optional[str]
    task_queue: List[str]
    priority_queue: List[str]
    last_activity: str
    session_start: Optional[str]
    total_uptime_minutes: int
    tasks_completed: int
    tasks_failed: int
    average_task_duration: float
    resource_usage: Dict[str, float]
    configuration: Dict[str, Any]

class AgentStateManager:
    def __init__(self):
        self.base_path = Path("shared_resources/state")
        self.checkpoints_path = self.base_path / "checkpoints"
        self.agents_path = self.base_path / "agents"
        self.tasks_path = self.base_path / "tasks"
        
        # Crear directorios necesarios
        for path in [self.base_path, self.checkpoints_path, self.agents_path, self.tasks_path]:
            path.mkdir(parents=True, exist_ok=True)
            
        self.agents_state: Dict[str, AgentState] = {}
        self.task_checkpoints: Dict[str, TaskCheckpoint] = {}
        
        self.load_all_states()
        
    def load_all_states(self):
        """Carga todos los estados guardados"""
        # Cargar estados de agentes
        for agent_file in self.agents_path.glob("*.json"):
            try:
                with open(agent_file, 'r') as f:
                    data = json.load(f)
                    agent_state = AgentState(**data)
                    self.agents_state[agent_state.agent_name] = agent_state
                    logger.info(f"Estado cargado para agente {agent_state.agent_name}")
            except Exception as e:
                logger.error(f"Error cargando estado de {agent_file}: {e}")
                
        # Cargar checkpoints de tareas
        for checkpoint_file in self.checkpoints_path.glob("*.json"):
            try:
                with open(checkpoint_file, 'r') as f:
                    data = json.load(f)
                    checkpoint = TaskCheckpoint(**data)
                    self.task_checkpoints[checkpoint.task_id] = checkpoint
                    logger.info(f"Checkpoint cargado para tarea {checkpoint.task_id}")
            except Exception as e:
                logger.error(f"Error cargando checkpoint de {checkpoint_file}: {e}")
                
    def save_agent_state(self, agent_name: str):
        """Guarda el estado de un agente específico"""
        if agent_name not in self.agents_state:
            logger.error(f"Agente {agent_name} no encontrado")
            return False
            
        try:
            agent_state = self.agents_state[agent_name]
            file_path = self.agents_path / f"{agent_name}.json"
            
            with open(file_path, 'w') as f:
                json.dump(asdict(agent_state), f, indent=2)
                
            logger.debug(f"Estado guardado para {agent_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error guardando estado de {agent_name}: {e}")
            return False
            
    def save_task_checkpoint(self, task_id: str):
        """Guarda un checkpoint de tarea"""
        if task_id not in self.task_checkpoints:
            logger.error(f"Checkpoint {task_id} no encontrado")
            return False
            
        try:
            checkpoint = self.task_checkpoints[task_id]
            file_path = self.checkpoints_path / f"{task_id}.json"
            
            with open(file_path, 'w') as f:
                json.dump(asdict(checkpoint), f, indent=2)
                
            logger.debug(f"Checkpoint guardado para tarea {task_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error guardando checkpoint {task_id}: {e}")
            return False
            
    def create_agent_state(self, agent_name: str, config: Dict[str, Any] = None) -> AgentState:
        """Crea un nuevo estado de agente"""
        if config is None:
            config = {}
            
        agent_state = AgentState(
            agent_name=agent_name,
            status="hibernated",
            current_task_id=None,
            task_queue=[],
            priority_queue=[],
            last_activity=datetime.now().isoformat(),
            session_start=None,
            total_uptime_minutes=0,
            tasks_completed=0,
            tasks_failed=0,
            average_task_duration=0.0,
            resource_usage={"cpu": 0.0, "ram": 0.0, "gpu": 0.0},
            configuration=config
        )
        
        self.agents_state[agent_name] = agent_state
        self.save_agent_state(agent_name)
        
        logger.info(f"Nuevo estado creado para agente {agent_name}")
        return agent_state
        
    def start_agent_session(self, agent_name: str) -> bool:
        """Inicia una sesión de agente"""
        if agent_name not in self.agents_state:
            self.create_agent_state(agent_name)
            
        agent_state = self.agents_state[agent_name]
        agent_state.status = "active"
        agent_state.session_start = datetime.now().isoformat()
        agent_state.last_activity = datetime.now().isoformat()
        
        self.save_agent_state(agent_name)
        logger.info(f"Sesión iniciada para agente {agent_name}")
        
        return True
        
    def pause_agent(self, agent_name: str, reason: str = "system_request") -> bool:
        """Pausa un agente guardando su estado actual"""
        if agent_name not in self.agents_state:
            logger.error(f"Agente {agent_name} no encontrado")
            return False
            
        agent_state = self.agents_state[agent_name]
        
        # Calcular tiempo de sesión
        if agent_state.session_start:
            session_start = datetime.fromisoformat(agent_state.session_start)
            session_duration = (datetime.now() - session_start).total_seconds() / 60
            agent_state.total_uptime_minutes += session_duration
            
        # Guardar estado de la tarea actual si existe
        if agent_state.current_task_id:
            self.update_task_checkpoint(
                agent_state.current_task_id,
                current_step=f"Pausado: {reason}",
                last_update=datetime.now().isoformat()
            )
            
        agent_state.status = "paused"
        agent_state.last_activity = datetime.now().isoformat()
        agent_state.session_start = None
        
        self.save_agent_state(agent_name)
        logger.info(f"Agente {agent_name} pausado: {reason}")
        
        return True
        
    def hibernate_agent(self, agent_name: str) -> bool:
        """Hiberna un agente completamente"""
        if agent_name not in self.agents_state:
            logger.error(f"Agente {agent_name} no encontrado")
            return False
            
        # Primero pausar si está activo
        if self.agents_state[agent_name].status == "active":
            self.pause_agent(agent_name, "hibernation")
            
        agent_state = self.agents_state[agent_name]
        agent_state.status = "hibernated"
        agent_state.current_task_id = None
        
        self.save_agent_state(agent_name)
        logger.info(f"Agente {agent_name} hibernado")
        
        return True
        
    def resume_agent(self, agent_name: str) -> bool:
        """Reanuda un agente desde su estado guardado"""
        if agent_name not in self.agents_state:
            logger.error(f"Agente {agent_name} no encontrado")
            return False
            
        agent_state = self.agents_state[agent_name]
        
        if agent_state.status not in ["paused", "hibernated"]:
            logger.warning(f"Agente {agent_name} no está pausado/hibernado")
            return False
            
        agent_state.status = "active"
        agent_state.session_start = datetime.now().isoformat()
        agent_state.last_activity = datetime.now().isoformat()
        
        self.save_agent_state(agent_name)
        logger.info(f"Agente {agent_name} reanudado")
        
        # Si tenía una tarea en curso, actualizar checkpoint
        if agent_state.current_task_id:
            self.update_task_checkpoint(
                agent_state.current_task_id,
                current_step="Reanudado desde pausa",
                last_update=datetime.now().isoformat()
            )
            
        return True
        
    def create_task_checkpoint(self, task_id: str, agent_name: str, task_type: str, 
                             total_data: int = 0, custom_data: Dict[str, Any] = None) -> TaskCheckpoint:
        """Crea un nuevo checkpoint de tarea"""
        if custom_data is None:
            custom_data = {}
            
        checkpoint = TaskCheckpoint(
            task_id=task_id,
            agent_name=agent_name,
            task_type=task_type,
            start_time=datetime.now().isoformat(),
            last_update=datetime.now().isoformat(),
            progress_percentage=0.0,
            current_step="Iniciando tarea",
            completed_steps=[],
            pending_steps=[],
            data_processed=0,
            total_data=total_data,
            error_count=0,
            last_error=None,
            estimated_completion=None,
            custom_data=custom_data
        )
        
        self.task_checkpoints[task_id] = checkpoint
        
        # Asignar tarea al agente
        if agent_name in self.agents_state:
            self.agents_state[agent_name].current_task_id = task_id
            self.save_agent_state(agent_name)
            
        self.save_task_checkpoint(task_id)
        logger.info(f"Checkpoint creado para tarea {task_id} del agente {agent_name}")
        
        return checkpoint
        
    def update_task_checkpoint(self, task_id: str, **kwargs):
        """Actualiza un checkpoint de tarea"""
        if task_id not in self.task_checkpoints:
            logger.error(f"Checkpoint {task_id} no encontrado")
            return False
            
        checkpoint = self.task_checkpoints[task_id]
        
        # Actualizar campos proporcionados
        for key, value in kwargs.items():
            if hasattr(checkpoint, key):
                setattr(checkpoint, key, value)
                
        checkpoint.last_update = datetime.now().isoformat()
        
        # Calcular progreso si se actualizó data_processed
        if "data_processed" in kwargs and checkpoint.total_data > 0:
            checkpoint.progress_percentage = (checkpoint.data_processed / checkpoint.total_data) * 100
            
        # Calcular tiempo estimado de finalización
        if checkpoint.progress_percentage > 5:  # Solo después de 5% para tener datos
            start_time = datetime.fromisoformat(checkpoint.start_time)
            elapsed = (datetime.now() - start_time).total_seconds()
            
            if checkpoint.progress_percentage > 0:
                total_estimated = elapsed / (checkpoint.progress_percentage / 100)
                remaining = total_estimated - elapsed
                completion_time = datetime.now() + timedelta(seconds=remaining)
                checkpoint.estimated_completion = completion_time.isoformat()
                
        self.save_task_checkpoint(task_id)
        
        # Actualizar actividad del agente
        if checkpoint.agent_name in self.agents_state:
            self.agents_state[checkpoint.agent_name].last_activity = datetime.now().isoformat()
            self.save_agent_state(checkpoint.agent_name)
            
        return True
        
    def complete_task(self, task_id: str, success: bool = True) -> bool:
        """Marca una tarea como completada"""
        if task_id not in self.task_checkpoints:
            logger.error(f"Checkpoint {task_id} no encontrado")
            return False
            
        checkpoint = self.task_checkpoints[task_id]
        agent_name = checkpoint.agent_name
        
        if success:
            checkpoint.progress_percentage = 100.0
            checkpoint.current_step = "Tarea completada exitosamente"
            logger.info(f"Tarea {task_id} completada exitosamente")
        else:
            checkpoint.current_step = "Tarea fallida"
            logger.error(f"Tarea {task_id} fallida")
            
        checkpoint.last_update = datetime.now().isoformat()
        self.save_task_checkpoint(task_id)
        
        # Actualizar estadísticas del agente
        if agent_name in self.agents_state:
            agent_state = self.agents_state[agent_name]
            agent_state.current_task_id = None
            
            if success:
                agent_state.tasks_completed += 1
            else:
                agent_state.tasks_failed += 1
                
            # Calcular duración promedio
            start_time = datetime.fromisoformat(checkpoint.start_time)
            duration = (datetime.now() - start_time).total_seconds() / 60  # minutos
            
            total_tasks = agent_state.tasks_completed + agent_state.tasks_failed
            if total_tasks > 1:
                agent_state.average_task_duration = (
                    (agent_state.average_task_duration * (total_tasks - 1) + duration) / total_tasks
                )
            else:
                agent_state.average_task_duration = duration
                
            self.save_agent_state(agent_name)
            
        return True
        
    def add_task_to_queue(self, agent_name: str, task_id: str, priority: bool = False) -> bool:
        """Añade una tarea a la cola del agente"""
        if agent_name not in self.agents_state:
            self.create_agent_state(agent_name)
            
        agent_state = self.agents_state[agent_name]
        
        if priority:
            agent_state.priority_queue.append(task_id)
            logger.info(f"Tarea {task_id} añadida a cola prioritaria de {agent_name}")
        else:
            agent_state.task_queue.append(task_id)
            logger.info(f"Tarea {task_id} añadida a cola normal de {agent_name}")
            
        self.save_agent_state(agent_name)
        return True
        
    def get_next_task(self, agent_name: str) -> Optional[str]:
        """Obtiene la siguiente tarea de la cola del agente"""
        if agent_name not in self.agents_state:
            return None
            
        agent_state = self.agents_state[agent_name]
        
        # Prioridad: cola prioritaria primero
        if agent_state.priority_queue:
            task_id = agent_state.priority_queue.pop(0)
            self.save_agent_state(agent_name)
            return task_id
            
        # Luego cola normal
        if agent_state.task_queue:
            task_id = agent_state.task_queue.pop(0)
            self.save_agent_state(agent_name)
            return task_id
            
        return None
        
    def get_agent_status(self, agent_name: str) -> Dict[str, Any]:
        """Obtiene el estado completo de un agente"""
        if agent_name not in self.agents_state:
            return {"error": "Agente no encontrado"}
            
        agent_state = self.agents_state[agent_name]
        status = asdict(agent_state)
        
        # Añadir información de tarea actual
        if agent_state.current_task_id and agent_state.current_task_id in self.task_checkpoints:
            checkpoint = self.task_checkpoints[agent_state.current_task_id]
            status["current_task_info"] = asdict(checkpoint)
            
        # Añadir información de colas
        status["pending_tasks"] = len(agent_state.task_queue) + len(agent_state.priority_queue)
        
        return status
        
    def get_system_overview(self) -> Dict[str, Any]:
        """Obtiene un resumen del estado de todo el sistema"""
        overview = {
            "timestamp": datetime.now().isoformat(),
            "total_agents": len(self.agents_state),
            "active_agents": [],
            "paused_agents": [],
            "hibernated_agents": [],
            "total_tasks": len(self.task_checkpoints),
            "active_tasks": [],
            "completed_tasks": 0,
            "failed_tasks": 0,
            "system_stats": {
                "total_uptime_hours": 0,
                "total_tasks_completed": 0,
                "total_tasks_failed": 0,
                "average_task_duration": 0
            }
        }
        
        total_uptime = 0
        total_completed = 0
        total_failed = 0
        total_durations = []
        
        for agent_name, agent_state in self.agents_state.items():
            if agent_state.status == "active":
                overview["active_agents"].append(agent_name)
            elif agent_state.status == "paused":
                overview["paused_agents"].append(agent_name)
            elif agent_state.status == "hibernated":
                overview["hibernated_agents"].append(agent_name)
                
            total_uptime += agent_state.total_uptime_minutes
            total_completed += agent_state.tasks_completed
            total_failed += agent_state.tasks_failed
            
            if agent_state.average_task_duration > 0:
                total_durations.append(agent_state.average_task_duration)
                
        for task_id, checkpoint in self.task_checkpoints.items():
            if checkpoint.progress_percentage >= 100:
                overview["completed_tasks"] += 1
            elif checkpoint.error_count > 0 and checkpoint.current_step == "Tarea fallida":
                overview["failed_tasks"] += 1
            else:
                overview["active_tasks"].append(task_id)
                
        overview["system_stats"]["total_uptime_hours"] = total_uptime / 60
        overview["system_stats"]["total_tasks_completed"] = total_completed
        overview["system_stats"]["total_tasks_failed"] = total_failed
        
        if total_durations:
            overview["system_stats"]["average_task_duration"] = sum(total_durations) / len(total_durations)
            
        return overview
        
    def cleanup_old_checkpoints(self, days: int = 30):
        """Limpia checkpoints antiguos para ahorrar espacio"""
        cutoff_date = datetime.now() - timedelta(days=days)
        cleaned_count = 0
        
        for task_id, checkpoint in list(self.task_checkpoints.items()):
            last_update = datetime.fromisoformat(checkpoint.last_update)
            
            if (last_update < cutoff_date and 
                (checkpoint.progress_percentage >= 100 or checkpoint.current_step == "Tarea fallida")):
                
                # Eliminar archivo
                checkpoint_file = self.checkpoints_path / f"{task_id}.json"
                if checkpoint_file.exists():
                    checkpoint_file.unlink()
                    
                # Eliminar de memoria
                del self.task_checkpoints[task_id]
                cleaned_count += 1
                
        logger.info(f"Limpieza completada: {cleaned_count} checkpoints antiguos eliminados")
        return cleaned_count

def main():
    """Función de prueba y utilidad"""
    import sys
    
    state_manager = AgentStateManager()
    
    if len(sys.argv) < 2:
        print("Comandos disponibles:")
        print("  overview              - Resumen del sistema")
        print("  status [agente]       - Estado de agente específico")
        print("  cleanup [días]        - Limpiar checkpoints antiguos")
        print("  pause [agente]        - Pausar agente")
        print("  resume [agente]       - Reanudar agente")
        return
        
    command = sys.argv[1].lower()
    
    if command == "overview":
        overview = state_manager.get_system_overview()
        print(json.dumps(overview, indent=2))
        
    elif command == "status":
        if len(sys.argv) < 3:
            print("Especifica el nombre del agente")
            return
        agent_name = sys.argv[2]
        status = state_manager.get_agent_status(agent_name)
        print(json.dumps(status, indent=2))
        
    elif command == "cleanup":
        days = int(sys.argv[2]) if len(sys.argv) > 2 else 30
        count = state_manager.cleanup_old_checkpoints(days)
        print(f"Limpiados {count} checkpoints")
        
    elif command == "pause":
        if len(sys.argv) < 3:
            print("Especifica el nombre del agente")
            return
        agent_name = sys.argv[2]
        state_manager.pause_agent(agent_name, "manual_command")
        print(f"Agente {agent_name} pausado")
        
    elif command == "resume":
        if len(sys.argv) < 3:
            print("Especifica el nombre del agente")
            return
        agent_name = sys.argv[2]
        state_manager.resume_agent(agent_name)
        print(f"Agente {agent_name} reanudado")
        
    else:
        print(f"Comando '{command}' no reconocido")

if __name__ == "__main__":
    main() 