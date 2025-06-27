#!/usr/bin/env python3
"""
📊 MONITOR DE RECURSOS VHQ_LAG - CONFIGURACIÓN OPTIMIZADA
Monitorea recursos del sistema y gestiona activación/desactivación de agentes
"""

import psutil
import time
import json
import logging
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('resource_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ResourceMonitor:
    def __init__(self):
        self.metrics_file = Path("metrics_history.json")
        self.alerts_file = Path("resource_alerts.json")
        self.history = []
        self.alerts = []
        self.thresholds = {
            "cpu_critical": 90,
            "cpu_warning": 75,
            "ram_critical": 90,
            "ram_warning": 80,
            "gpu_critical": 95,
            "gpu_warning": 85,
            "temp_critical": 85,
            "temp_warning": 75
        }
        self.load_history()
        
    def load_history(self):
        """Carga el historial de métricas"""
        if self.metrics_file.exists():
            try:
                with open(self.metrics_file, 'r') as f:
                    self.history = json.load(f)
                logger.info(f"Historial cargado: {len(self.history)} registros")
            except Exception as e:
                logger.error(f"Error cargando historial: {e}")
                self.history = []
        else:
            self.history = []
            
    def save_history(self):
        """Guarda el historial de métricas"""
        # Mantener solo los últimos 1000 registros
        if len(self.history) > 1000:
            self.history = self.history[-1000:]
            
        try:
            with open(self.metrics_file, 'w') as f:
                json.dump(self.history, f, indent=2)
        except Exception as e:
            logger.error(f"Error guardando historial: {e}")
            
    def get_cpu_metrics(self):
        """Obtiene métricas de CPU"""
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_freq = psutil.cpu_freq()
        cpu_count = psutil.cpu_count()
        
        # Temperatura CPU (si está disponible)
        temps = {}
        try:
            temperatures = psutil.sensors_temperatures()
            if 'coretemp' in temperatures:
                temps = {
                    'cpu_temp': max([t.current for t in temperatures['coretemp']])
                }
        except:
            temps = {'cpu_temp': 0}
            
        return {
            'cpu_percent': cpu_percent,
            'cpu_freq_current': cpu_freq.current if cpu_freq else 0,
            'cpu_freq_max': cpu_freq.max if cpu_freq else 0,
            'cpu_count': cpu_count,
            **temps
        }
        
    def get_memory_metrics(self):
        """Obtiene métricas de memoria"""
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        return {
            'ram_total_gb': memory.total / (1024**3),
            'ram_used_gb': memory.used / (1024**3),
            'ram_available_gb': memory.available / (1024**3),
            'ram_percent': memory.percent,
            'swap_total_gb': swap.total / (1024**3),
            'swap_used_gb': swap.used / (1024**3),
            'swap_percent': swap.percent
        }
        
    def get_gpu_metrics(self):
        """Obtiene métricas de GPU usando nvidia-smi"""
        try:
            result = subprocess.run([
                'nvidia-smi', '--query-gpu=temperature.gpu,utilization.gpu,memory.used,memory.total,power.draw',
                '--format=csv,noheader,nounits'
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                gpu_data = []
                
                for i, line in enumerate(lines):
                    values = line.split(', ')
                    if len(values) >= 5:
                        gpu_data.append({
                            'gpu_id': i,
                            'gpu_temp': float(values[0]),
                            'gpu_utilization': float(values[1]),
                            'gpu_memory_used_mb': float(values[2]),
                            'gpu_memory_total_mb': float(values[3]),
                            'gpu_power_draw': float(values[4])
                        })
                
                return gpu_data
            else:
                return []
        except:
            return []
            
    def get_disk_metrics(self):
        """Obtiene métricas de disco"""
        disk = psutil.disk_usage('/')
        disk_io = psutil.disk_io_counters()
        
        return {
            'disk_total_gb': disk.total / (1024**3),
            'disk_used_gb': disk.used / (1024**3),
            'disk_free_gb': disk.free / (1024**3),
            'disk_percent': (disk.used / disk.total) * 100,
            'disk_read_mb': disk_io.read_bytes / (1024**2) if disk_io else 0,
            'disk_write_mb': disk_io.write_bytes / (1024**2) if disk_io else 0
        }
        
    def get_network_metrics(self):
        """Obtiene métricas de red"""
        network = psutil.net_io_counters()
        
        return {
            'network_sent_mb': network.bytes_sent / (1024**2),
            'network_recv_mb': network.bytes_recv / (1024**2),
            'network_packets_sent': network.packets_sent,
            'network_packets_recv': network.packets_recv
        }
        
    def get_process_metrics(self):
        """Obtiene métricas de procesos relacionados con VHQ_LAG"""
        vhq_processes = []
        
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
            try:
                if any(keyword in proc.info['name'].lower() for keyword in ['ollama', 'python', 'node']):
                    vhq_processes.append({
                        'pid': proc.info['pid'],
                        'name': proc.info['name'],
                        'cpu_percent': proc.info['cpu_percent'],
                        'memory_mb': proc.info['memory_info'].rss / (1024**2)
                    })
            except:
                pass
                
        return vhq_processes
        
    def collect_metrics(self):
        """Recolecta todas las métricas del sistema"""
        timestamp = datetime.now().isoformat()
        
        metrics = {
            'timestamp': timestamp,
            'cpu': self.get_cpu_metrics(),
            'memory': self.get_memory_metrics(),
            'gpu': self.get_gpu_metrics(),
            'disk': self.get_disk_metrics(),
            'network': self.get_network_metrics(),
            'processes': self.get_process_metrics()
        }
        
        self.history.append(metrics)
        return metrics
        
    def check_alerts(self, metrics):
        """Verifica si hay alertas basadas en las métricas"""
        alerts = []
        
        # Alertas de CPU
        if metrics['cpu']['cpu_percent'] > self.thresholds['cpu_critical']:
            alerts.append({
                'level': 'CRITICAL',
                'type': 'CPU',
                'message': f"CPU al {metrics['cpu']['cpu_percent']}%",
                'timestamp': metrics['timestamp']
            })
        elif metrics['cpu']['cpu_percent'] > self.thresholds['cpu_warning']:
            alerts.append({
                'level': 'WARNING',
                'type': 'CPU',
                'message': f"CPU al {metrics['cpu']['cpu_percent']}%",
                'timestamp': metrics['timestamp']
            })
            
        # Alertas de RAM
        if metrics['memory']['ram_percent'] > self.thresholds['ram_critical']:
            alerts.append({
                'level': 'CRITICAL',
                'type': 'RAM',
                'message': f"RAM al {metrics['memory']['ram_percent']:.1f}%",
                'timestamp': metrics['timestamp']
            })
        elif metrics['memory']['ram_percent'] > self.thresholds['ram_warning']:
            alerts.append({
                'level': 'WARNING',
                'type': 'RAM',
                'message': f"RAM al {metrics['memory']['ram_percent']:.1f}%",
                'timestamp': metrics['timestamp']
            })
            
        # Alertas de GPU
        for gpu in metrics['gpu']:
            if gpu['gpu_utilization'] > self.thresholds['gpu_critical']:
                alerts.append({
                    'level': 'CRITICAL',
                    'type': 'GPU',
                    'message': f"GPU {gpu['gpu_id']} al {gpu['gpu_utilization']}%",
                    'timestamp': metrics['timestamp']
                })
            elif gpu['gpu_utilization'] > self.thresholds['gpu_warning']:
                alerts.append({
                    'level': 'WARNING',
                    'type': 'GPU',
                    'message': f"GPU {gpu['gpu_id']} al {gpu['gpu_utilization']}%",
                    'timestamp': metrics['timestamp']
                })
                
            # Alertas de temperatura
            if gpu['gpu_temp'] > self.thresholds['temp_critical']:
                alerts.append({
                    'level': 'CRITICAL',
                    'type': 'TEMPERATURE',
                    'message': f"GPU {gpu['gpu_id']} a {gpu['gpu_temp']}°C",
                    'timestamp': metrics['timestamp']
                })
            elif gpu['gpu_temp'] > self.thresholds['temp_warning']:
                alerts.append({
                    'level': 'WARNING',
                    'type': 'TEMPERATURE',
                    'message': f"GPU {gpu['gpu_id']} a {gpu['gpu_temp']}°C",
                    'timestamp': metrics['timestamp']
                })
                
        return alerts
        
    def process_alerts(self, alerts):
        """Procesa las alertas y toma acciones"""
        for alert in alerts:
            if alert['level'] == 'CRITICAL':
                logger.error(f"🚨 ALERTA CRÍTICA: {alert['message']}")
                # Aquí se podrían tomar acciones automáticas
                # como pausar agentes de baja prioridad
                
            elif alert['level'] == 'WARNING':
                logger.warning(f"⚠️  ADVERTENCIA: {alert['message']}")
                
            self.alerts.append(alert)
            
        # Mantener solo las últimas 100 alertas
        if len(self.alerts) > 100:
            self.alerts = self.alerts[-100:]
            
    def get_resource_recommendations(self, metrics):
        """Genera recomendaciones basadas en métricas"""
        recommendations = []
        
        # Recomendaciones de CPU
        if metrics['cpu']['cpu_percent'] > 80:
            recommendations.append("Considerar pausar agentes de baja prioridad")
        elif metrics['cpu']['cpu_percent'] < 30:
            recommendations.append("CPU disponible - se pueden activar más agentes")
            
        # Recomendaciones de RAM
        if metrics['memory']['ram_percent'] > 85:
            recommendations.append("RAM crítica - hibernar agentes no esenciales")
        elif metrics['memory']['ram_available_gb'] > 10:
            recommendations.append("RAM disponible - se pueden activar agentes adicionales")
            
        # Recomendaciones de GPU
        for gpu in metrics['gpu']:
            if gpu['gpu_utilization'] > 90:
                recommendations.append(f"GPU {gpu['gpu_id']} saturada - pausar procesamiento de video")
            elif gpu['gpu_utilization'] < 20:
                recommendations.append(f"GPU {gpu['gpu_id']} disponible - activar procesamiento de video")
                
        return recommendations
        
    def print_status(self, metrics):
        """Imprime el estado actual del sistema"""
        print("\n" + "="*60)
        print("📊 MONITOR DE RECURSOS VHQ_LAG")
        print("="*60)
        print(f"🕒 Timestamp: {metrics['timestamp']}")
        print()
        
        # CPU
        cpu = metrics['cpu']
        print(f"🖥️  CPU: {cpu['cpu_percent']:.1f}% | {cpu['cpu_count']} cores")
        if cpu['cpu_temp'] > 0:
            print(f"    🌡️  Temperatura: {cpu['cpu_temp']:.1f}°C")
        
        # Memoria
        mem = metrics['memory']
        print(f"💾 RAM: {mem['ram_used_gb']:.1f}GB / {mem['ram_total_gb']:.1f}GB ({mem['ram_percent']:.1f}%)")
        if mem['swap_percent'] > 0:
            print(f"    🔄 Swap: {mem['swap_used_gb']:.1f}GB / {mem['swap_total_gb']:.1f}GB ({mem['swap_percent']:.1f}%)")
        
        # GPU
        if metrics['gpu']:
            print("🎮 GPU:")
            for gpu in metrics['gpu']:
                vram_used_gb = gpu['gpu_memory_used_mb'] / 1024
                vram_total_gb = gpu['gpu_memory_total_mb'] / 1024
                vram_percent = (gpu['gpu_memory_used_mb'] / gpu['gpu_memory_total_mb']) * 100
                print(f"    GPU {gpu['gpu_id']}: {gpu['gpu_utilization']:.1f}% | {vram_used_gb:.1f}GB/{vram_total_gb:.1f}GB VRAM ({vram_percent:.1f}%)")
                print(f"             🌡️  {gpu['gpu_temp']:.1f}°C | ⚡ {gpu['gpu_power_draw']:.1f}W")
        
        # Disco
        disk = metrics['disk']
        print(f"💿 Disco: {disk['disk_used_gb']:.1f}GB / {disk['disk_total_gb']:.1f}GB ({disk['disk_percent']:.1f}%)")
        
        # Procesos VHQ
        if metrics['processes']:
            print(f"🤖 Procesos VHQ: {len(metrics['processes'])}")
            for proc in metrics['processes'][:5]:  # Mostrar solo los primeros 5
                print(f"    {proc['name']} (PID {proc['pid']}): CPU {proc['cpu_percent']:.1f}% | RAM {proc['memory_mb']:.1f}MB")
        
        print("="*60)
        
        # Recomendaciones
        recommendations = self.get_resource_recommendations(metrics)
        if recommendations:
            print("\n💡 RECOMENDACIONES:")
            for rec in recommendations:
                print(f"   • {rec}")
        
        print()
        
    def generate_report(self):
        """Genera un reporte de las últimas 24 horas"""
        if len(self.history) < 10:
            logger.warning("Historial insuficiente para generar reporte")
            return
            
        # Filtrar últimas 24 horas
        now = datetime.now()
        yesterday = now - timedelta(days=1)
        
        recent_metrics = [
            m for m in self.history 
            if datetime.fromisoformat(m['timestamp']) > yesterday
        ]
        
        if not recent_metrics:
            logger.warning("No hay métricas de las últimas 24 horas")
            return
            
        # Calcular estadísticas
        cpu_values = [m['cpu']['cpu_percent'] for m in recent_metrics]
        ram_values = [m['memory']['ram_percent'] for m in recent_metrics]
        
        report = {
            'period': '24 horas',
            'total_samples': len(recent_metrics),
            'cpu_stats': {
                'average': np.mean(cpu_values),
                'max': np.max(cpu_values),
                'min': np.min(cpu_values)
            },
            'ram_stats': {
                'average': np.mean(ram_values),
                'max': np.max(ram_values),
                'min': np.min(ram_values)
            },
            'alerts_count': len([a for a in self.alerts if datetime.fromisoformat(a['timestamp']) > yesterday])
        }
        
        # Guardar reporte
        report_file = Path(f"resource_report_{now.strftime('%Y%m%d_%H%M%S')}.json")
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
            
        logger.info(f"Reporte generado: {report_file}")
        
        # Imprimir resumen
        print("\n📈 REPORTE DE RECURSOS (24 HORAS)")
        print("="*50)
        print(f"Muestras analizadas: {report['total_samples']}")
        print(f"CPU promedio: {report['cpu_stats']['average']:.1f}% (max: {report['cpu_stats']['max']:.1f}%)")
        print(f"RAM promedio: {report['ram_stats']['average']:.1f}% (max: {report['ram_stats']['max']:.1f}%)")
        print(f"Alertas generadas: {report['alerts_count']}")
        print("="*50)
        
    def monitor_loop(self, interval=30):
        """Loop principal de monitoreo"""
        logger.info(f"🔄 Iniciando monitoreo cada {interval} segundos")
        
        try:
            while True:
                # Recolectar métricas
                metrics = self.collect_metrics()
                
                # Verificar alertas
                alerts = self.check_alerts(metrics)
                if alerts:
                    self.process_alerts(alerts)
                    
                # Mostrar estado cada 10 iteraciones (5 minutos si interval=30)
                if len(self.history) % 10 == 0:
                    self.print_status(metrics)
                    
                # Guardar historial cada 100 iteraciones
                if len(self.history) % 100 == 0:
                    self.save_history()
                    
                # Generar reporte diario
                current_time = datetime.now()
                if current_time.hour == 0 and current_time.minute == 0:
                    self.generate_report()
                    
                time.sleep(interval)
                
        except KeyboardInterrupt:
            logger.info("🛑 Monitoreo detenido por el usuario")
            self.save_history()
            
        except Exception as e:
            logger.error(f"Error en el monitoreo: {e}")
            self.save_history()

def main():
    """Función principal"""
    import sys
    
    monitor = ResourceMonitor()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "start":
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 30
            monitor.monitor_loop(interval)
        elif command == "status":
            metrics = monitor.collect_metrics()
            monitor.print_status(metrics)
        elif command == "report":
            monitor.generate_report()
        else:
            print("Comandos: start [intervalo], status, report")
    else:
        print("Uso: python resource_monitor.py [start|status|report]")

if __name__ == "__main__":
    main() 