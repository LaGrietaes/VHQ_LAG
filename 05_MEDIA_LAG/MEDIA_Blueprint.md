# 05_MEDIA_LAG_Blueprint.md

# Blueprint del Agente 05_MEDIA_LAG para LaGrieta.es

## Descripción General
- **Propósito**: Gestionar la producción, edición y distribución de contenido multimedia (audio, video, gráficos) para maximizar el impacto visual y auditivo de La Grieta.
- **Rol**: Productor multimedia y gestor de biblioteca de medios centralizada.
- **Versión**: v3.7.3 (última actualización: 06/06/2025).
- **Estado**: OPERACIONAL ✅

## Arquitectura
### Estructura de Carpetas y Archivos
- **Carpeta Principal**: `05_MEDIA_LAG/`
- **Script Principal**: `media_agent.py`
- **Archivos de Soporte**:
  - `config.json` (configuración del agente)
  - `media_library.db` (base de datos de activos multimedia)
  - `production_schedule.json` (calendario de producción)
  - `brand_style_guide.txt` (guía de estilo visual y auditivo de La Grieta)
  - `performance_metrics.csv` (métricas de rendimiento de contenido multimedia)
  - `ethical_checklist.txt` (criterios éticos para contenido multimedia)
- **Dependencias**:
  - Python 3.11.4, OpenCV 4.8.0, FFmpeg 6.0, Pillow 10.0.0, xAI API v2.3
  - Integración con plataformas de distribución (YouTube, TikTok, Instagram, X)
  - Conexión con `Core_Vision_LAG.db` (base de datos de la visión de La Grieta)

### Integraciones con Otros Agentes
1. **04_CLIP_LAG**:
   - Proporciona material RAW para edición
   - Recibe media organizada y optimizada
   - Comparte métricas de calidad técnica

2. **02_CM_LAG**:
   - Recibe contenido optimizado para redes sociales
   - Proporciona métricas de engagement por plataforma
   - Coordina programación de publicaciones

3. **09_IT_LAG**:
   - Gestión de backups multimedia
   - Monitoreo de rendimiento técnico
   - Soporte en infraestructura

4. **00_CEO_LAG**:
   - Reportes ejecutivos de gestión de media
   - Aprobaciones de contenido de alto impacto
   - Coordinación de flujos de trabajo

5. **14_DONNA_LAG**:
   - Auditoría de calidad de contenido
   - Control de deadlines de producción
   - Verificación de cumplimiento ético

6. **10_DJ_LAG**:
   - Integración de música y efectos sonoros
   - Gestión de biblioteca de audio
   - Sincronización de contenido audiovisual

7. **03_PSICO_LAG**:
   - Insights para optimización de contenido
   - Análisis de engagement audiovisual
   - Recomendaciones de formato por plataforma

### Módulos Principales
- **Media_Producer_v3.5**:
  - Función: Crea contenido multimedia (videos, podcasts, gráficos) basado en las directrices de la marca.
  - Parámetros:
    - `output_format: [mp4, mp3, png]` (formatos soportados)
    - `production_frequency: 2-4/day` (frecuencia de producción por plataforma)
  - Entradas: `brand_style_guide.txt`, briefings de contenido
  - Salidas: Activos multimedia, borradores para revisión

- **Content_Editor_v2.9**:
  - Función: Edita contenido multimedia para optimizar calidad, duración y engagement.
  - Parámetros:
    - `max_duration: 60s` (límite para videos cortos)
    - `quality_threshold: 1080p` (resolución mínima para videos)
  - Entradas: Activos multimedia crudos, `brand_style_guide.txt`
  - Salidas: Contenido editado, listo para publicación

- **Distribution_Manager_v3.1**:
  - Función: Programa y distribuye contenido en plataformas sociales, optimizando horarios y formatos.
  - Parámetros:
    - `post_schedule: dynamic` (basado en picos de audiencia)
    - `platform_optimization: enabled` (ajustes por plataforma)
  - Entradas: `production_schedule.json`, datos de audiencia
  - Salidas: Publicaciones programadas, reportes de distribución

- **Performance_Analyzer_v2.8**:
  - Función: Evalúa el rendimiento de contenido multimedia (vistas, shares, engagement).
  - Parámetros:
    - `engagement_target: 4%` (tasa mínima de interacción)
    - `analysis_frequency: 24h` (frecuencia de análisis)
  - Entradas: `performance_metrics.csv`, datos de plataformas
  - Salidas: Reportes de rendimiento, sugerencias de mejora

- **Ethical_Media_Filter_v3.0**:
  - Función: Asegura que el contenido multimedia cumpla con los principios éticos de La Grieta.
  - Parámetros:
    - `ethical_compliance_score_min: 0.97` (umbral de cumplimiento ético)
    - `review_frequency: per_asset` (revisión por activo)
  - Entradas: Contenido multimedia, `ethical_checklist.txt`
  - Salidas: Aprobaciones o rechazos de contenido

## Workflows Principales
1. **Ingesta de Contenido**:
   ```mermaid
   graph TD
   A[Recepción RAW] --> B[Organización]
   B --> C[Control Calidad]
   C --> D[Optimización]
   D --> E[Biblioteca Media]
   ```

2. **Producción de Video**:
   ```mermaid
   graph TD
   A[Media RAW] --> B[04_CLIP_LAG]
   B --> C[Edición]
   C --> D[10_DJ_LAG Audio]
   D --> E[03_PSICO_LAG Review]
   E --> F[14_DONNA_LAG Audit]
   F --> G[02_CM_LAG Distribution]
   ```

3. **Gestión de Biblioteca**:
   ```mermaid
   graph TD
   A[Ingesta] --> B[Catalogación]
   B --> C[Versionado]
   C --> D[Backup con 09_IT_LAG]
   D --> E[Distribución]
   ```

## Métricas y KPIs
- **Gestión de Media**:
  - Archivos gestionados: 9,257 (439.75 GB)
  - Tiempo medio de procesamiento: ≤30min
  - Tasa de duplicados: <1%
  - Calidad técnica: ≥95%

- **Distribución**:
  - Tiempo de entrega: ≤15min
  - Disponibilidad: 99.9%
  - Optimización por plataforma: 100%

- **Performance**:
  - Engagement rate: ≥4%
  - Calidad técnica: ≥1080p
  - Cumplimiento ético: ≥97%

## Actualizaciones
- Versión: 3.7.3
- Última actualización: 06/06/2025
- Revisión: Mensual
- Registro de cambios en version_history.txt

