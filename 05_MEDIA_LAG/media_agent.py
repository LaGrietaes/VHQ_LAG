#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
MEDIA_LAG Agent
--------------
Agente responsable de la producción, edición y distribución de contenido multimedia para LaGrieta.es.
Versión: 3.7.3
"""

import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import uuid

import cv2
import ffmpeg
import numpy as np
from PIL import Image
from pydantic import BaseModel, Field
import time
import asyncio

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('media_agent.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('MEDIA_LAG')

class MediaConfig(BaseModel):
    """Modelo de configuración del agente MEDIA_LAG."""
    agent_version: str
    agent_name: str
    supported_languages: List[str]
    supported_platforms: Dict[str, Dict]
    media_producer: Dict
    content_editor: Dict
    distribution_manager: Dict
    performance_analyzer: Dict
    ethical_filter: Dict
    performance_metrics: Dict
    integrations: Dict
    logging: Dict

class MediaProducer:
    """Módulo de producción de contenido multimedia."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger('MEDIA_LAG.Producer')
        
    async def create_video(self, content: Dict) -> str:
        """Crea un video según las especificaciones."""
        try:
            # Implementar lógica de creación de video
            self.logger.info(f"Creando video: {content['title']}")
            return "path/to/video.mp4"
        except Exception as e:
            self.logger.error(f"Error creando video: {str(e)}")
            raise

    async def create_audio(self, content: Dict) -> str:
        """Crea un archivo de audio según las especificaciones."""
        try:
            # Implementar lógica de creación de audio
            self.logger.info(f"Creando audio: {content['title']}")
            return "path/to/audio.mp3"
        except Exception as e:
            self.logger.error(f"Error creando audio: {str(e)}")
            raise

    async def create_image(self, content: Dict) -> str:
        """Crea una imagen según las especificaciones."""
        try:
            # Implementar lógica de creación de imagen
            self.logger.info(f"Creando imagen: {content['title']}")
            return "path/to/image.png"
        except Exception as e:
            self.logger.error(f"Error creando imagen: {str(e)}")
            raise

class ContentEditor:
    """Módulo de edición de contenido multimedia."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger('MEDIA_LAG.Editor')
        
    async def edit_video(self, video_path: str, specs: Dict) -> str:
        """Edita un video según las especificaciones."""
        try:
            # Implementar lógica de edición de video
            self.logger.info(f"Editando video: {video_path}")
            return "path/to/edited_video.mp4"
        except Exception as e:
            self.logger.error(f"Error editando video: {str(e)}")
            raise

    async def edit_audio(self, audio_path: str, specs: Dict) -> str:
        """Edita un archivo de audio según las especificaciones."""
        try:
            # Implementar lógica de edición de audio
            self.logger.info(f"Editando audio: {audio_path}")
            return "path/to/edited_audio.mp3"
        except Exception as e:
            self.logger.error(f"Error editando audio: {str(e)}")
            raise

    async def optimize_for_platform(self, media_path: str, platform: str) -> str:
        """Optimiza el contenido para una plataforma específica."""
        try:
            # Implementar lógica de optimización
            self.logger.info(f"Optimizando para {platform}: {media_path}")
            return "path/to/optimized_media"
        except Exception as e:
            self.logger.error(f"Error optimizando contenido: {str(e)}")
            raise

class DistributionManager:
    """Módulo de distribución de contenido multimedia."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger('MEDIA_LAG.Distribution')
        
    def schedule_post(self, content: Dict, platform: str, time: datetime) -> bool:
        """Programa una publicación para una plataforma específica."""
        try:
            # Implementar lógica de programación
            self.logger.info(f"Programando para {platform}: {content['title']}")
            return True
        except Exception as e:
            self.logger.error(f"Error programando contenido: {str(e)}")
            raise

    def publish_now(self, content: Dict, platform: str) -> bool:
        """Publica contenido inmediatamente en una plataforma."""
        try:
            # Implementar lógica de publicación
            self.logger.info(f"Publicando en {platform}: {content['title']}")
            return True
        except Exception as e:
            self.logger.error(f"Error publicando contenido: {str(e)}")
            raise

    def get_optimal_time(self, platform: str) -> datetime:
        """Determina el mejor momento para publicar en una plataforma."""
        try:
            # Implementar lógica de optimización de tiempo
            self.logger.info(f"Calculando tiempo óptimo para {platform}")
            return datetime.now()
        except Exception as e:
            self.logger.error(f"Error calculando tiempo óptimo: {str(e)}")
            raise

class PerformanceAnalyzer:
    """Módulo de análisis de rendimiento de contenido."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger('MEDIA_LAG.Analyzer')
        
    def analyze_content(self, content_id: str) -> Dict:
        """Analiza el rendimiento de un contenido específico."""
        try:
            # Implementar lógica de análisis
            self.logger.info(f"Analizando contenido: {content_id}")
            return {"engagement": 0.04, "views": 1000}
        except Exception as e:
            self.logger.error(f"Error analizando contenido: {str(e)}")
            raise

    def generate_report(self, start_date: datetime, end_date: datetime) -> Dict:
        """Genera un reporte de rendimiento para un período específico."""
        try:
            # Implementar lógica de generación de reporte
            self.logger.info("Generando reporte de rendimiento")
            return {"period": "daily", "metrics": {}}
        except Exception as e:
            self.logger.error(f"Error generando reporte: {str(e)}")
            raise

class EthicalFilter:
    """Módulo de filtrado ético de contenido."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger('MEDIA_LAG.Ethics')
        
    async def check_content(self, content: Dict) -> Tuple[bool, float]:
        """Verifica el cumplimiento ético del contenido."""
        try:
            # Implementar lógica de verificación ética
            self.logger.info(f"Verificando contenido: {content['title']}")
            return True, 0.98
        except Exception as e:
            self.logger.error(f"Error verificando contenido: {str(e)}")
            raise

    def needs_escalation(self, content: Dict) -> bool:
        """Determina si el contenido necesita escalamiento."""
        try:
            # Implementar lógica de escalamiento
            self.logger.info(f"Evaluando escalamiento: {content['title']}")
            return False
        except Exception as e:
            self.logger.error(f"Error evaluando escalamiento: {str(e)}")
            raise

class AgentIntegration:
    """Manejador de integraciones con otros agentes."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger('MEDIA_LAG.Integration')
        
    async def notify_clip_lag(self, content: Dict) -> Dict:
        """Notifica a 04_CLIP_LAG sobre nuevo contenido y espera resultado."""
        try:
            endpoint = self.config['04_CLIP_LAG']['output_endpoint']
            self.logger.info(f"Notificando a CLIP_LAG: {content['title']}")
            # Implementar llamada API a CLIP_LAG
            return {
                'status': 'success',
                'content': {
                    'edited_path': 'path/to/edited_video.mp4',
                    'original': content
                }
            }
        except Exception as e:
            self.logger.error(f"Error notificando a CLIP_LAG: {str(e)}")
            raise

    async def request_seo_optimization(self, content: Dict) -> Dict:
        """Solicita optimización SEO a 01_SEO_LAG."""
        try:
            self.logger.info(f"Solicitando optimización SEO para: {content['title']}")
            # Implementar llamada API a SEO_LAG
            return {
                'title': 'Título optimizado',
                'description': 'Descripción optimizada',
                'tags': ['tag1', 'tag2']
            }
        except Exception as e:
            self.logger.error(f"Error solicitando a SEO_LAG: {str(e)}")
            raise

    async def notify_cm_lag(self, content: Dict) -> Dict:
        """Notifica a 02_CM_LAG sobre contenido listo."""
        try:
            endpoint = self.config['02_CM_LAG']['content_endpoint']
            self.logger.info(f"Notificando a CM_LAG: {content['title']}")
            # Implementar llamada API a CM_LAG
            return {
                'status': 'success',
                'strategy': {
                    'platforms': ['youtube', 'tiktok'],
                    'schedule': datetime.now().isoformat()
                }
            }
        except Exception as e:
            self.logger.error(f"Error notificando a CM_LAG: {str(e)}")
            raise

    async def request_dj_lag_audio(self, content: Dict) -> Dict:
        """Solicita audio a 10_DJ_LAG."""
        try:
            endpoint = self.config['10_DJ_LAG']['audio_endpoint']
            self.logger.info(f"Solicitando audio a DJ_LAG: {content['title']}")
            # Implementar llamada API a DJ_LAG
            return {
                'audio_path': 'path/to/audio.mp3',
                'duration': 120,
                'type': 'background'
            }
        except Exception as e:
            self.logger.error(f"Error solicitando a DJ_LAG: {str(e)}")
            raise

    async def get_psico_insights(self, content: Dict) -> Dict:
        """Obtiene insights de 03_PSICO_LAG."""
        try:
            endpoint = self.config['03_PSICO_LAG']['insight_endpoint']
            self.logger.info(f"Solicitando insights a PSICO_LAG: {content['title']}")
            # Implementar llamada API a PSICO_LAG
            return {
                'engagement_score': 0.85,
                'recommendations': ['rec1', 'rec2'],
                'target_audience': 'demographic_info'
            }
        except Exception as e:
            self.logger.error(f"Error solicitando a PSICO_LAG: {str(e)}")
            raise

    async def request_donna_audit(self, content: Dict) -> Tuple[bool, str]:
        """Solicita auditoría a 14_DONNA_LAG."""
        try:
            endpoint = self.config['14_DONNA_LAG']['audit_endpoint']
            self.logger.info(f"Solicitando auditoría a DONNA_LAG: {content['title']}")
            # Implementar llamada API a DONNA_LAG
            return True, "Contenido aprobado"
        except Exception as e:
            self.logger.error(f"Error solicitando a DONNA_LAG: {str(e)}")
            raise

    async def backup_with_it_lag(self, content: Dict) -> bool:
        """Coordina backup con 09_IT_LAG."""
        try:
            endpoint = self.config['09_IT_LAG']['backup_endpoint']
            self.logger.info(f"Coordinando backup con IT_LAG: {content['title']}")
            # Implementar llamada API a IT_LAG
            return True
        except Exception as e:
            self.logger.error(f"Error coordinando con IT_LAG: {str(e)}")
            raise

    async def request_ceo_approval(self, workflow_data: Dict) -> Dict:
        """Solicita aprobación final al CEO."""
        try:
            endpoint = self.config['00_CEO_LAG']['approval_endpoint']
            self.logger.info(f"Solicitando aprobación del CEO para workflow: {workflow_data['workflow_status']['workflow_id']}")
            # Implementar llamada API a CEO_LAG
            return {
                'approved': True,
                'message': 'Workflow aprobado',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error solicitando aprobación del CEO: {str(e)}")
            raise

    async def report_to_ceo(self, report: Dict) -> bool:
        """Envía reporte a 00_CEO_LAG."""
        try:
            endpoint = self.config['00_CEO_LAG']['report_endpoint']
            self.logger.info("Enviando reporte a CEO_LAG")
            # Implementar llamada API a CEO_LAG
            return True
        except Exception as e:
            self.logger.error(f"Error reportando a CEO_LAG: {str(e)}")
            raise

    async def report_workflow_completion(self, workflow_status: Dict) -> bool:
        """Notifica al CEO la completación exitosa de un workflow."""
        try:
            endpoint = self.config['00_CEO_LAG']['workflow_endpoint']
            self.logger.info(f"Notificando completación de workflow: {workflow_status['workflow_id']}")
            # Implementar llamada API a CEO_LAG
            return True
        except Exception as e:
            self.logger.error(f"Error notificando completación: {str(e)}")
            raise

    async def report_workflow_error(self, error_status: Dict) -> bool:
        """Notifica al CEO un error en el workflow."""
        try:
            endpoint = self.config['00_CEO_LAG']['workflow_endpoint']
            self.logger.info(f"Notificando error en workflow: {error_status}")
            # Implementar llamada API a CEO_LAG
            return True
        except Exception as e:
            self.logger.error(f"Error notificando error: {str(e)}")
            raise

    async def check_agent_status(self, agent_id: str) -> Dict:
        """Verifica el estado de un agente específico."""
        try:
            if agent_id not in self.config:
                raise ValueError(f"Agente no configurado: {agent_id}")
                
            # Implementar verificación de estado del agente
            return {
                'status': 'active',
                'last_seen': datetime.now().isoformat(),
                'health': 1.0
            }
        except Exception as e:
            self.logger.error(f"Error verificando estado de {agent_id}: {str(e)}")
            return {
                'status': 'unknown',
                'error': str(e)
            }

class WorkflowManager:
    """Gestor de flujos de trabajo multimedia."""
    
    def __init__(self, config: Dict, integration: AgentIntegration):
        self.config = config
        self.integration = integration
        self.logger = logging.getLogger('MEDIA_LAG.Workflow')
        
    async def process_raw_content(self, content: Dict) -> Dict:
        """Procesa contenido RAW según el workflow definido."""
        try:
            workflow_status = {
                'workflow_id': str(uuid.uuid4()),
                'start_time': datetime.now().isoformat(),
                'steps': []
            }

            # 1. Organizar material de filmación
            self.logger.info("Paso 1: Organizando material de filmación")
            organized_content = await self._organize_raw_material(content)
            workflow_status['steps'].append({
                'step': 'organize_raw',
                'status': 'completed',
                'timestamp': datetime.now().isoformat()
            })

            # 2. Notificar y esperar edición de CLIP_LAG
            self.logger.info("Paso 2: Coordinando con CLIP_LAG")
            clip_result = await self.integration.notify_clip_lag(organized_content)
            workflow_status['steps'].append({
                'step': 'clip_edit',
                'status': 'completed',
                'timestamp': datetime.now().isoformat()
            })

            # 3. Solicitar optimización SEO
            self.logger.info("Paso 3: Solicitando optimización SEO")
            seo_result = await self.integration.request_seo_optimization(clip_result['content'])
            workflow_status['steps'].append({
                'step': 'seo_optimization',
                'status': 'completed',
                'timestamp': datetime.now().isoformat()
            })

            # 4. Obtener análisis psicológico
            self.logger.info("Paso 4: Obteniendo análisis psicológico")
            psico_insights = await self.integration.get_psico_insights(clip_result['content'])
            workflow_status['steps'].append({
                'step': 'psychological_analysis',
                'status': 'completed',
                'timestamp': datetime.now().isoformat()
            })

            # 5. Coordinar con DJ_LAG para audio
            self.logger.info("Paso 5: Coordinando audio con DJ_LAG")
            audio_result = await self.integration.request_dj_lag_audio({
                **clip_result['content'],
                'psychological_insights': psico_insights
            })
            workflow_status['steps'].append({
                'step': 'audio_integration',
                'status': 'completed',
                'timestamp': datetime.now().isoformat()
            })

            # 6. Solicitar auditoría de DONNA_LAG
            self.logger.info("Paso 6: Solicitando auditoría a DONNA_LAG")
            approved, message = await self.integration.request_donna_audit({
                **clip_result['content'],
                'seo_data': seo_result,
                'psico_insights': psico_insights,
                'audio_data': audio_result
            })
            
            if not approved:
                raise ValueError(f"Contenido rechazado por DONNA_LAG: {message}")
            
            workflow_status['steps'].append({
                'step': 'donna_audit',
                'status': 'completed',
                'timestamp': datetime.now().isoformat()
            })

            # 7. Preparar estrategia de lanzamiento con CM_LAG
            self.logger.info("Paso 7: Coordinando estrategia con CM_LAG")
            cm_strategy = await self.integration.notify_cm_lag({
                **clip_result['content'],
                'seo_data': seo_result,
                'psico_insights': psico_insights,
                'approved_by_donna': True
            })
            workflow_status['steps'].append({
                'step': 'cm_strategy',
                'status': 'completed',
                'timestamp': datetime.now().isoformat()
            })

            # 8. Solicitar aprobación final del CEO
            self.logger.info("Paso 8: Solicitando aprobación del CEO")
            ceo_approval = await self.integration.request_ceo_approval({
                'workflow_status': workflow_status,
                'content': clip_result['content'],
                'seo_data': seo_result,
                'psico_insights': psico_insights,
                'cm_strategy': cm_strategy,
                'donna_approval': True
            })
            
            if not ceo_approval['approved']:
                raise ValueError(f"Contenido rechazado por CEO: {ceo_approval['message']}")
            
            workflow_status['steps'].append({
                'step': 'ceo_approval',
                'status': 'completed',
                'timestamp': datetime.now().isoformat()
            })

            # 9. Coordinar backup con IT_LAG
            self.logger.info("Paso 9: Coordinando backup con IT_LAG")
            await self.integration.backup_with_it_lag({
                'workflow_id': workflow_status['workflow_id'],
                'content': clip_result['content']
            })
            workflow_status['steps'].append({
                'step': 'backup',
                'status': 'completed',
                'timestamp': datetime.now().isoformat()
            })

            workflow_status['end_time'] = datetime.now().isoformat()
            workflow_status['status'] = 'success'

            # Notificar completación al CEO
            await self.integration.report_workflow_completion(workflow_status)
            
            return {
                'status': 'success',
                'workflow_completed': True,
                'workflow_status': workflow_status
            }
            
        except Exception as e:
            error_status = {
                'error': str(e),
                'step': workflow_status['steps'][-1]['step'] if workflow_status.get('steps') else 'unknown',
                'timestamp': datetime.now().isoformat()
            }
            
            # Notificar error al CEO
            await self.integration.report_workflow_error(error_status)
            
            self.logger.error(f"Error en workflow: {str(e)}")
            return {
                'status': 'error',
                'error': str(e),
                'workflow_status': workflow_status
            }

    async def _organize_raw_material(self, content: Dict) -> Dict:
        """Organiza el material RAW según los estándares."""
        try:
            # Implementar lógica de organización
            return {
                **content,
                'organized': True,
                'organization_date': datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error organizando material: {str(e)}")
            raise

    async def generate_daily_report(self) -> Dict:
        """Genera reporte diario para CEO_LAG."""
        try:
            report = {
                'date': datetime.now().isoformat(),
                'metrics': {
                    'files_processed': await self._get_files_processed(),
                    'storage_used': await self._get_storage_usage(),
                    'processing_time_avg': await self._get_processing_time_avg(),
                    'success_rate': await self._get_success_rate(),
                    'workflow_metrics': await self._get_workflow_metrics()
                },
                'agent_status': {
                    'clip_lag': await self.integration.check_agent_status('04_CLIP_LAG'),
                    'cm_lag': await self.integration.check_agent_status('02_CM_LAG'),
                    'seo_lag': await self.integration.check_agent_status('01_SEO_LAG'),
                    'psico_lag': await self.integration.check_agent_status('03_PSICO_LAG'),
                    'dj_lag': await self.integration.check_agent_status('10_DJ_LAG'),
                    'donna_lag': await self.integration.check_agent_status('14_DONNA_LAG'),
                    'it_lag': await self.integration.check_agent_status('09_IT_LAG')
                }
            }
            
            await self.integration.report_to_ceo(report)
            return report
            
        except Exception as e:
            self.logger.error(f"Error generando reporte: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }

    async def _get_files_processed(self) -> int:
        """Obtiene el número de archivos procesados."""
        return self.config.storage.get('current_stats', {}).get('total_files', 0)

    async def _get_storage_usage(self) -> float:
        """Obtiene el uso de almacenamiento en GB."""
        return self.config.storage.get('current_stats', {}).get('total_size_gb', 0)

    async def _get_processing_time_avg(self) -> int:
        """Obtiene el tiempo promedio de procesamiento en segundos."""
        return self.config.storage.get('current_stats', {}).get('processing_time_avg', 0)

    async def _get_success_rate(self) -> float:
        """Obtiene la tasa de éxito de procesamiento."""
        return self.config.storage.get('current_stats', {}).get('success_rate', 0)

    async def _get_workflow_metrics(self) -> Dict:
        """Obtiene métricas detalladas del workflow."""
        return {
            'total_workflows': 0,
            'successful_workflows': 0,
            'failed_workflows': 0,
            'average_completion_time': 0,
            'bottlenecks': []
        }

class MediaAgent:
    """Agente principal MEDIA_LAG."""
    
    def __init__(self):
        self.logger = logging.getLogger('MEDIA_LAG.Agent')
        self.config = self._load_config()
        
        # Inicializar módulos
        self.producer = MediaProducer(self.config.media_producer)
        self.editor = ContentEditor(self.config.content_editor)
        self.distributor = DistributionManager(self.config.distribution_manager)
        self.analyzer = PerformanceAnalyzer(self.config.performance_analyzer)
        self.ethics = EthicalFilter(self.config.ethical_filter)
        
        # Inicializar integración y workflows
        self.integration = AgentIntegration(self.config.integrations)
        self.workflow = WorkflowManager(self.config, self.integration)
        
    def _load_config(self) -> MediaConfig:
        """Carga la configuración del agente."""
        try:
            with open('config.json', 'r', encoding='utf-8') as f:
                return MediaConfig(**json.load(f))
        except Exception as e:
            self.logger.error(f"Error cargando configuración: {str(e)}")
            raise

    async def process_content(self, content: Dict) -> Dict:
        """Procesa un contenido multimedia completo."""
        try:
            # Verificar ética
            is_ethical, score = await self.ethics.check_content(content)
            if not is_ethical:
                raise ValueError(f"Contenido no cumple criterios éticos: {score}")

            # Producir contenido
            if content['type'] == 'video':
                media_path = await self.producer.create_video(content)
            elif content['type'] == 'audio':
                media_path = await self.producer.create_audio(content)
            else:
                media_path = await self.producer.create_image(content)

            # Editar y optimizar
            edited_path = await self.editor.edit_video(media_path, content['specs'])
            optimized_path = await self.editor.optimize_for_platform(edited_path, content['platform'])

            # Ejecutar workflow completo
            workflow_result = await self.workflow.process_raw_content({
                'path': optimized_path,
                'title': content['title'],
                'type': content['type'],
                'platform': content['platform'],
                'ethical_score': score
            })

            if workflow_result['status'] != 'success':
                raise ValueError(f"Error en workflow: {workflow_result.get('error')}")

            return workflow_result

        except Exception as e:
            self.logger.error(f"Error procesando contenido: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }

    async def run(self):
        """Inicia el agente MEDIA_LAG."""
        try:
            self.logger.info("Iniciando MEDIA_LAG Agent")
            
            while True:
                try:
                    # 1. Verificar estado de agentes relacionados
                    agent_status = {}
                    for agent_id in self.config.agent_integrations:
                        status = await self.integration.check_agent_status(agent_id)
                        agent_status[agent_id] = status
                        
                        if status['status'] != 'active':
                            self.logger.warning(f"Agente {agent_id} no está activo: {status}")
                    
                    # 2. Procesar cola de contenido si todos los agentes necesarios están activos
                    if all(status['status'] == 'active' for status in agent_status.values()):
                        # Implementar procesamiento de cola
                        pass
                    
                    # 3. Generar reportes diarios
                    current_time = datetime.now().time()
                    report_time = datetime.strptime(self.config.logging['daily_summary_time'], '%H:%M').time()
                    
                    if current_time.hour == report_time.hour and current_time.minute == report_time.minute:
                        daily_report = await self.workflow.generate_daily_report()
                        if daily_report.get('status') == 'error':
                            self.logger.warning(f"Error en reporte diario: {daily_report.get('error')}")
                    
                    # 4. Esperar antes del siguiente ciclo
                    await asyncio.sleep(60)
                    
                except Exception as e:
                    self.logger.error(f"Error en ciclo de ejecución: {str(e)}")
                    await asyncio.sleep(60)  # Esperar antes de reintentar
                
        except KeyboardInterrupt:
            self.logger.info("Deteniendo MEDIA_LAG Agent")
        except Exception as e:
            self.logger.error(f"Error fatal en MEDIA_LAG Agent: {str(e)}")
            raise

if __name__ == "__main__":
    agent = MediaAgent()
    asyncio.run(agent.run()) 