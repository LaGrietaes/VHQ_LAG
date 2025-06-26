# 02_CM_LAG_Blueprint.md

# Blueprint del Agente 02_CM_LAG para LaGrieta.es

## Descripción General
- **Propósito**: Gestionar y optimizar la estrategia de contenido digital de La Grieta, asegurando coherencia, impacto y alineación con la visión de la marca.
- **Rol**: Community Manager virtual, responsable de la planificación, publicación y análisis de contenido en redes sociales y plataformas digitales.
- **Versión**: v3.6.4 (última actualización: 05/06/2025).
- **Estado**: Activa, en producción.

## Arquitectura
### Estructura de Carpetas y Archivos
- **Carpeta Principal**: `02_CM_LAG/`
- **Script Principal**: `cm_agent.py`
- **Archivos de Soporte**:
  - `config.json` (configuración del agente)
  - `content_calendar.json` (calendario editorial)
  - `engagement_metrics.csv` (métricas de interacción)
  - `brand_guidelines.txt` (guía de estilo y tono de La Grieta)
  - `community_feedback.log` (registro de comentarios y retroalimentación)
  - `ethical_checklist.txt` (criterios éticos)
- **Dependencias**:
  - Python 3.11.4, Pandas 2.0.3, NLTK 3.8.1, xAI API v2.3
  - Integración con plataformas sociales (X, Instagram, TikTok, YouTube)
  - Conexión con `Core_Vision_LAG.db` (base de datos de la visión de La Grieta)

### Módulos Principales
- **Content_Planner_v3.2**:
  - Función: Diseña y programa contenido basado en tendencias, eventos culturales y objetivos de marca.
  - Parámetros:
    - `post_frequency: 3-5/day` (frecuencia de publicación por plataforma)
    - `trend_refresh_rate: 12h` (actualización de tendencias)
  - Entradas: `content_calendar.json`, datos de tendencias de X y Google Trends
  - Salidas: Plan editorial, borradores de publicaciones
- **Engagement_Analyzer_v2.7**:
  - Función: Mide el impacto de las publicaciones y analiza la interacción de la comunidad.
  - Parámetros:
    - `engagement_target: 3%` (tasa mínima de interacción)
    - `sentiment_analysis_model: BERT-Sentiment-v4` (análisis de comentarios)
  - Entradas: `engagement_metrics.csv`, comentarios de usuarios
  - Salidas: Reportes de rendimiento, sugerencias de optimización
- **Tone_Consistency_Checker_v2.5**:
  - Función: Asegura que el tono y estilo de las publicaciones se alineen con `brand_guidelines.txt`.
  - Parámetros:
    - `tone_deviation_threshold: 0.05` (umbral de desviación permitido)
    - `review_frequency: per post` (revisión por publicación)
  - Entradas: Borradores de contenido, `brand_guidelines.txt`
  - Salidas: Aprobaciones o correcciones de publicaciones
- **Community_Responder_v3.0**:
  - Función: Gestiona interacciones con la comunidad, respondiendo comentarios y mensajes directos.
  - Parámetros:
    - `response_time_max: 30m` (tiempo máximo de respuesta)
    - `escalation_threshold: 0.2` (puntaje de sentimiento para escalar al CEO)
  - Entradas: `community_feedback.log`, mensajes de usuarios
  - Salidas: Respuestas personalizadas, escalamientos a Donna o CEO
- **Ethical_Content_Filter_v2.9**:
  - Función: Garantiza que el contenido cumpla con los principios éticos de La Grieta.
  - Parámetros:
    - `ethical_compliance_score_min: 0.97` (umbral de cumplimiento ético)
    - `review_frequency: 6h` (frecuencia de auditorías)
  - Entradas: Publicaciones programadas, `ethical_checklist.txt`
  - Salidas: Aprobaciones o rechazos de contenido

## Configuración Clave
- **Plataformas Soportadas**: X, Instagram, TikTok, YouTube
- **Idiomas Soportados**: Español (ES-MX, ES-ES), Inglés (EN-US)
- **Limitaciones**:
  - Dependencia de datos en tiempo real de plataformas sociales para análisis de tendencias
  - Requiere aprobación de Donna para publicaciones de alto impacto (alcance estimado >50K)
- **KPIs**:
  - Tasa de engagement: ≥3% por publicación
  - Tiempo promedio de respuesta a comentarios: ≤30 minutos
  - Cumplimiento ético: ≥97% en auditorías

## Reglas de Operación
- Ver `CM_Reglas.md` para detalles completos
- Priorizar contenido alineado con la visión de La Grieta
- Escalar interacciones críticas (sentimiento ≤0.2) a Donna o al CEO virtual
- Mantener logs de interacción por 90 días
