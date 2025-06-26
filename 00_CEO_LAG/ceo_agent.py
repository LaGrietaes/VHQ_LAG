import sys
import os
import psutil
import GPUtil
import numpy as np
import torch
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from queue import PriorityQueue
import threading
import time
import json
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

@dataclass
class SystemResources:
    """Current system resource state"""
    available_ram_gb: float
    available_cpu_threads: int
    available_gpu_vram_gb: float
    cpu_usage_percent: float
    gpu_usage_percent: float
    gpu_temp: float
    cpu_temp: Optional[float] = None
    gpu_power_usage: Optional[float] = None
    memory_pressure: Optional[float] = None

@dataclass
class Task:
    """Task structure for VHQ_LAG system"""
    task_id: str
    timestamp: str
    priority: int
    source_agent: str
    target_agent: str
    task_type: str
    parameters: Dict[str, Any]
    status: str
    resource_requirements: Dict[str, float]
    estimated_duration: Optional[str] = None
    deadline: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    dependencies: Optional[List[str]] = None

class ResourceOptimizer:
    def __init__(self, config: Dict):
        self.config = config
        self.gpu_available = torch.cuda.is_available()
        self.current_power_profile = "balanced"
        self._setup_gpu()
        
    def _setup_gpu(self):
        """Initialize GPU settings and CUDA capabilities"""
        if self.gpu_available:
            try:
                torch.cuda.set_device(0)  # Use primary GPU
                # Enable TensorFloat-32 for better performance on RTX cards
                torch.backends.cuda.matmul.allow_tf32 = True
                torch.backends.cudnn.allow_tf32 = True
                # Optimize CUDNN
                torch.backends.cudnn.benchmark = True
            except Exception as e:
                print(f"Error setting up GPU: {e}")

    def can_offload_to_gpu(self, task_type: str, current_resources: SystemResources) -> bool:
        """Determine if a task can be offloaded to GPU"""
        if not self.gpu_available:
            return False
            
        offload_rules = self.config['resource_optimization']['gpu_acceleration']['offload_rules']
        
        return (
            task_type in self.config['hardware_resources']['gpu']['offloadable_tasks'] and
            current_resources.cpu_usage_percent >= offload_rules['cpu_threshold'] and
            current_resources.gpu_usage_percent <= offload_rules['gpu_idle_threshold']
        )

    def optimize_batch_processing(self, tasks: List[Task]) -> List[List[Task]]:
        """Organize tasks into optimal batches"""
        batch_config = self.config['resource_optimization']['task_optimization']['batch_processing']
        if not batch_config['enabled']:
            return [[task] for task in tasks]

        batches = []
        current_batch = []
        
        for task in sorted(tasks, key=lambda x: x.priority, reverse=True):
            if task.task_type in batch_config['compatible_tasks']:
                if len(current_batch) < batch_config['max_batch_size']:
                    current_batch.append(task)
                else:
                    batches.append(current_batch)
                    current_batch = [task]
            else:
                if current_batch:
                    batches.append(current_batch)
                    current_batch = []
                batches.append([task])
                
        if current_batch:
            batches.append(current_batch)
            
        return batches

    def adjust_power_profile(self, resources: SystemResources):
        """Dynamically adjust power profile based on system state"""
        power_config = self.config['resource_optimization']['power_management']
        
        if not power_config['enabled']:
            return

        # Check thermal thresholds
        if (resources.gpu_temp > power_config['thermal_management']['gpu_temp_threshold'] or
            resources.cpu_temp > power_config['thermal_management']['cpu_temp_threshold']):
            self._set_power_profile("power_save")
        # Check high utilization
        elif (resources.cpu_usage_percent > 90 or resources.gpu_usage_percent > 90):
            self._set_power_profile("high_performance")
        # Normal operation
        else:
            self._set_power_profile("balanced")

    def _set_power_profile(self, profile: str):
        """Apply power profile settings"""
        if self.current_power_profile == profile:
            return
            
        try:
            profile_config = self.config['resource_optimization']['power_management']['profiles'][profile]
            
            if self.gpu_available:
                # Set GPU power limit
                os.system(f"nvidia-smi -pl {profile_config['gpu_power_limit']}")
                
            # Set CPU governor
            os.system(f"echo {profile_config['cpu_governor']} | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor")
            
            self.current_power_profile = profile
            
        except Exception as e:
            print(f"Error setting power profile: {e}")

class ResourceManager:
    def __init__(self, config: Dict):
        self.config = config
        self.resource_locks = {
            'gpu': threading.Lock(),
            'cpu': threading.Lock(),
            'ram': threading.Lock()
        }
        self.active_tasks = {}
        self.resource_state = self._get_current_resources()
        self.optimizer = ResourceOptimizer(config)
        self.thread_pool = ThreadPoolExecutor(max_workers=self.config['hardware_resources']['cpu']['max_concurrent_cpu_tasks'])
        self.process_pool = ProcessPoolExecutor(max_workers=self.config['hardware_resources']['cpu']['cores'])
        
    def _get_current_resources(self) -> SystemResources:
        """Get detailed current system resource state"""
        try:
            # Get CPU and RAM info
            cpu_percent = psutil.cpu_percent(interval=1)
            ram = psutil.virtual_memory()
            available_ram_gb = ram.available / (1024 ** 3)
            memory_pressure = (ram.total - ram.available) / ram.total * 100
            
            # Get CPU temperature if available
            cpu_temp = None
            try:
                temps = psutil.sensors_temperatures()
                if 'coretemp' in temps:
                    cpu_temp = max(temp.current for temp in temps['coretemp'])
            except:
                pass
            
            # Get GPU info
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu = gpus[0]  # Using first GPU
                gpu_vram = gpu.memoryFree / 1024  # Convert to GB
                gpu_temp = gpu.temperature
                gpu_usage = gpu.load * 100
                gpu_power = gpu.powerUsage if hasattr(gpu, 'powerUsage') else None
            else:
                gpu_vram = 0
                gpu_temp = 0
                gpu_usage = 0
                gpu_power = None

            return SystemResources(
                available_ram_gb=available_ram_gb,
                available_cpu_threads=psutil.cpu_count() - psutil.cpu_count(logical=False),
                available_gpu_vram_gb=gpu_vram,
                cpu_usage_percent=cpu_percent,
                gpu_usage_percent=gpu_usage,
                gpu_temp=gpu_temp,
                cpu_temp=cpu_temp,
                gpu_power_usage=gpu_power,
                memory_pressure=memory_pressure
            )
        except Exception as e:
            print(f"Error getting resource state: {e}")
            return None

    def execute_task_batch(self, tasks: List[Task]) -> List[Dict]:
        """Execute a batch of tasks with optimal resource usage"""
        results = []
        
        # Check if tasks can be GPU-accelerated
        resources = self._get_current_resources()
        use_gpu = any(self.optimizer.can_offload_to_gpu(task.task_type, resources) for task in tasks)
        
        try:
            if use_gpu:
                # Use GPU processing
                with torch.cuda.device(0):
                    for task in tasks:
                        result = self._execute_gpu_task(task)
                        results.append(result)
            else:
                # Use CPU processing with thread or process pool
                if tasks[0].task_type in ['io_bound', 'network_bound']:
                    # Use thread pool for I/O bound tasks
                    futures = [self.thread_pool.submit(self._execute_cpu_task, task) for task in tasks]
                else:
                    # Use process pool for CPU bound tasks
                    futures = [self.process_pool.submit(self._execute_cpu_task, task) for task in tasks]
                
                results = [future.result() for future in futures]
            
        except Exception as e:
            print(f"Error in batch execution: {e}")
            results = [{"error": str(e)} for _ in tasks]
        
        return results

    def _execute_gpu_task(self, task: Task) -> Dict:
        """Execute a task using GPU acceleration"""
        try:
            # Implement specific GPU processing logic based on task type
            if task.task_type == "image_processing":
                return self._gpu_image_processing(task)
            elif task.task_type == "text_embedding":
                return self._gpu_text_embedding(task)
            elif task.task_type == "video_encoding":
                return self._gpu_video_encoding(task)
            else:
                raise ValueError(f"Unsupported GPU task type: {task.task_type}")
        except Exception as e:
            return {"error": f"GPU execution failed: {e}"}

    def _execute_cpu_task(self, task: Task) -> Dict:
        """Execute a task using CPU"""
        try:
            # Implement specific CPU processing logic based on task type
            if task.task_type == "text_analysis":
                return self._cpu_text_analysis(task)
            elif task.task_type == "data_processing":
                return self._cpu_data_processing(task)
            else:
                return self._generic_cpu_processing(task)
        except Exception as e:
            return {"error": f"CPU execution failed: {e}"}

    def can_allocate_resources(self, task: Task) -> bool:
        """Check if required resources are available"""
        resources = self._get_current_resources()
        if not resources:
            return False

        requirements = task.resource_requirements
        return (
            resources.available_ram_gb >= requirements.get('ram_gb', 0) and
            resources.available_cpu_threads >= requirements.get('cpu_threads', 0) and
            resources.available_gpu_vram_gb >= requirements.get('gpu_vram_gb', 0)
        )

    def allocate_resources(self, task: Task) -> bool:
        """Attempt to allocate resources for a task"""
        if not self.can_allocate_resources(task):
            return False

        # Acquire all needed locks
        acquired_locks = []
        try:
            for resource in ['ram', 'cpu', 'gpu']:
                if task.resource_requirements.get(f'{resource}_gb', 0) > 0:
                    self.resource_locks[resource].acquire()
                    acquired_locks.append(resource)
            
            # If we got here, we have all needed locks
            self.active_tasks[task.task_id] = task
            return True

        except Exception as e:
            print(f"Error allocating resources: {e}")
            # Release any acquired locks
            for resource in acquired_locks:
                self.resource_locks[resource].release()
            return False

    def release_resources(self, task_id: str):
        """Release resources held by a task"""
        if task_id in self.active_tasks:
            task = self.active_tasks[task_id]
            for resource in ['ram', 'cpu', 'gpu']:
                if task.resource_requirements.get(f'{resource}_gb', 0) > 0:
                    self.resource_locks[resource].release()
            del self.active_tasks[task_id]

class CEOAgent:
    def __init__(self):
        self.config = self._load_config()
        self.resource_manager = ResourceManager(self.config)
        self.task_queues = {
            'critical': PriorityQueue(),
            'high': PriorityQueue(),
            'medium': PriorityQueue(),
            'low': PriorityQueue()
        }
        self.batch_queues = {
            'image_processing': [],
            'text_analysis': [],
            'data_processing': []
        }
        self.active_agents = {
            "00_CEO_LAG": {"status": "active", "last_check": None},
            "01_SEO_LAG": {"status": "inactive", "last_check": None},
            "02_CM_LAG": {"status": "inactive", "last_check": None},
            "03_PSICO_LAG": {"status": "inactive", "last_check": None},
            "04_CLIP_LAG": {"status": "inactive", "last_check": None},
            "05_MEDIA_LAG": {"status": "inactive", "last_check": None},
            "06_TALENT_LAG": {"status": "inactive", "last_check": None},
            "07_CASH_LAG": {"status": "inactive", "last_check": None},
            "08_LAW_LAG": {"status": "inactive", "last_check": None},
            "09_IT_LAG": {"status": "inactive", "last_check": None},
            "10_DJ_LAG": {"status": "inactive", "last_check": None},
            "11_WPM_LAG": {"status": "inactive", "last_check": None},
            "12_DEV_LAG": {"status": "inactive", "last_check": None},
            "13_ADS_LAG": {"status": "inactive", "last_check": None},
            "14_DONNA_LAG": {"status": "active", "last_check": None}
        }
        self.activation_groups = self.config['agent_activation_rules']['activation_groups']
        
        # Start monitoring threads
        self._start_monitoring_threads()

    def _start_monitoring_threads(self):
        """Start all monitoring and optimization threads"""
        threads = [
            threading.Thread(target=self._monitor_resources, daemon=True),
            threading.Thread(target=self._process_batch_queues, daemon=True),
            threading.Thread(target=self._optimize_power_profile, daemon=True)
        ]
        
        for thread in threads:
            thread.start()

    def _optimize_power_profile(self):
        """Continuously optimize power profile"""
        while True:
            try:
                resources = self.resource_manager._get_current_resources()
                if resources:
                    self.resource_manager.optimizer.adjust_power_profile(resources)
                time.sleep(5)
            except Exception as e:
                print(f"Error in power optimization: {e}")
                time.sleep(5)

    def _process_batch_queues(self):
        """Process tasks in batch queues"""
        while True:
            try:
                for queue_type, queue in self.batch_queues.items():
                    if len(queue) >= self.config['resource_optimization']['task_optimization']['batch_processing']['max_batch_size']:
                        batch = queue[:self.config['resource_optimization']['task_optimization']['batch_processing']['max_batch_size']]
                        self.batch_queues[queue_type] = queue[self.config['resource_optimization']['task_optimization']['batch_processing']['max_batch_size']:]
                        self.resource_manager.execute_task_batch(batch)
                time.sleep(0.1)
            except Exception as e:
                print(f"Error processing batch queues: {e}")
                time.sleep(1)

    def add_task(self, task: Task):
        """Add task to appropriate queue"""
        if task.task_type in self.batch_queues:
            self.batch_queues[task.task_type].append(task)
        else:
            priority_queue = self._get_priority_queue(task)
            priority_queue.put((task.priority, task))
            self._process_queues()

    def _get_priority_queue(self, task: Task) -> PriorityQueue:
        """Determine which queue to use based on task properties"""
        if task.deadline:
            deadline_delta = datetime.fromisoformat(task.deadline) - datetime.now()
            if deadline_delta.total_seconds() < 300:
                return self.task_queues['critical']
            elif deadline_delta.total_seconds() < 900:
                return self.task_queues['high']
        
        # Default based on task priority
        if task.priority >= 8:
            return self.task_queues['critical']
        elif task.priority >= 6:
            return self.task_queues['high']
        elif task.priority >= 4:
            return self.task_queues['medium']
        else:
            return self.task_queues['low']

    def _process_queues(self):
        """Process tasks from queues based on resource availability"""
        for queue_name in ['critical', 'high', 'medium', 'low']:
            queue = self.task_queues[queue_name]
            while not queue.empty():
                _, task = queue.get()
                
                # Check if target agent is active
                if self.active_agents[task.target_agent]['status'] != 'active':
                    if not self._can_activate_agent(task.target_agent):
                        queue.put((task.priority, task))
                        continue
                    self.activate_agent(task.target_agent)
                
                # Try to allocate resources
                if self.resource_manager.can_allocate_resources(task):
                    if self.resource_manager.allocate_resources(task):
                        self.execute_task(task)
                    else:
                        queue.put((task.priority, task))
                else:
                    queue.put((task.priority, task))
                    break

    def _can_activate_agent(self, agent_id: str) -> bool:
        """Check if an agent can be activated based on resource constraints"""
        # Find which group the agent belongs to
        for group_name, group_info in self.activation_groups.items():
            if agent_id in group_info['agents']:
                # Count how many agents from this group are already active
                active_count = sum(
                    1 for a in group_info['agents']
                    if self.active_agents[a]['status'] == 'active'
                )
                return active_count < group_info['max_concurrent']
        return True

    def activate_agent(self, agent_id: str):
        """Activate an agent"""
        if agent_id in self.active_agents:
            self.active_agents[agent_id]['status'] = 'active'
            self.active_agents[agent_id]['last_check'] = datetime.now().isoformat()

    def deactivate_agent(self, agent_id: str):
        """Deactivate an agent"""
        if agent_id in self.active_agents:
            self.active_agents[agent_id]['status'] = 'inactive'
            self.active_agents[agent_id]['last_check'] = datetime.now().isoformat()

    def execute_task(self, task: Task):
        """Execute a task"""
        try:
            # Actual task execution logic here
            task.status = "completed"
            task.result = {"completion_time": datetime.now().isoformat()}
        except Exception as e:
            task.status = "error"
            task.error_message = str(e)
        finally:
            self.resource_manager.release_resources(task.task_id)

    def _load_config(self) -> Dict:
        """Load configuration from file"""
        try:
            with open('ceo_config.json', 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading config: {e}")
            return {}

    def _monitor_resources(self):
        """Continuously monitor system resources"""
        while True:
            try:
                resources = self.resource_manager._get_current_resources()
                if resources:
                    # Check against thresholds
                    if (resources.available_ram_gb < self.config['resource_monitoring']['thresholds']['ram_critical'] or
                        resources.gpu_temp > self.config['resource_monitoring']['thresholds']['gpu_temp_critical']):
                        self._handle_resource_critical()
                
                time.sleep(self.config['resource_monitoring']['check_interval_seconds'])
            except Exception as e:
                print(f"Error in resource monitoring: {e}")

    def _handle_resource_critical(self):
        """Handle critical resource situation"""
        # Pause non-essential agents
        for agent_id, info in self.active_agents.items():
            if agent_id not in ['00_CEO_LAG', '14_DONNA_LAG'] and info['status'] == 'active':
                self.deactivate_agent(agent_id)

if __name__ == "__main__":
    agent = CEOAgent()
    print("CEO Agent initialized with resource management") 