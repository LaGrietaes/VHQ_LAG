# Blueprint del Agente 04_CLIP_LAG para LaGrieta.es

## Descripción General
- **Propósito**: Generar clips cortos 9x16 para YouTube Shorts a partir de videos RAW de 07_MEDIA_LAG, aplicando auto reframe, correcciones de color y colaborando con 10_DJ_LAG para música sincronizada.
- **Rol**: Seleccionar highlights con ayuda del Agente Psicólogo, entregar clips y música en orden para edición manual en DaVinci Resolve.
- **Referencia a Reglas**: Todas las acciones se rigen por `Clip_Reglas.md`.

## Arquitectura

### Estructura de Carpetas y Archivos
- **Carpeta Principal**: `04_CLIP_LAG/`
- **Script Principal**: `clip_lag_agent.py` (a generar por Cursor)
- **Archivos de Soporte**:
  - `output/short/` (clips como "Jams_9x16_01.mp4")
  - `output/music/` (música como "Jams_9x16_01_Music.mp3")
  - `output/effects/` (efectos como "Woosh_Jams_9x16_C02_13S.mp3")
  - `output/previews/` (previews como "Jams_9x16_01_Preview.mp4")
  - `edit_log.txt` (detalles de edición)
- **Directorio Compartido**: `Agent_Logs/` (interfaz con otros agentes)

### Dependencias Técnicas
- **Herramientas**: MoviePy, FFmpeg, OpenCV, Whisper, APIs de 10_DJ_LAG
- **Configuración**: Instalación de herramientas, acceso a `07_MEDIA_LAG/raw_videos/`

## Módulos Funcionales

### 1. Módulo de Auto Reframe
- **Descripción**: Convierte videos 16x9 a 9x16 (1080x1920) con opciones y velocidades ajustables.
- **Entrada**: Video RAW de `07_MEDIA_LAG/raw_videos/`.
- **Procesamiento**: Usa OpenCV para detectar rostros/movimiento y FFmpeg/MoviePy para reencuadre.
  - **Opciones**: Centrar sujeto, pan dinámico, zoom inteligente.
  - **Velocidades**: Ajustables (lento, medio, rápido), definidas por usuario.
- **Salida**: Preview en `output/previews/` (ej. "Jams_9x16_01_Preview.mp4") para revisión.

### 2. Módulo de Selección de Clips
- **Descripción**: Identifica y corta highlights basados en recomendaciones del Psicólogo.
- **Entrada**: Datos de `03_PSICO_LAG/datos/ganchos/ganchos_virales.txt`, video reencuadrado.
- **Procesamiento**: Analiza audio (Whisper) y video (OpenCV) para detectar emociones/puntos clave, genera X clips (input variable) de 15-60 segundos.
- **Salida**: Clips en `output/short/` (ej. "Jams_9x16_01.mp4" a "Jams_9x16_X.mp4").

### 3. Módulo de Música y Efectos
- **Descripción**: Colabora con 10_DJ_LAG para seleccionar y cortar música, incluyendo efectos opcionales.
- **Entrada**: Datos de `10_DJ_LAG/music_library.txt`, clips seleccionados.
- **Procesamiento**: Sugiere 2-3 opciones de música (hip-hop, rap, rock, electrónica) según tono, Psicólogo y trends. Corta un archivo final por clip, sincronizando saltos. Añade efectos (ej. woosh) si aplica.
- **Salida**: Música en `output/music/` (ej. "Jams_9x16_01_Music.mp3"), efectos en `output/effects/` (ej. "Woosh_Jams_9x16_C02_13S.mp3").

### 4. Módulo de Previews y Log
- **Descripción**: Genera previews para aprobación y registra detalles.
- **Entrada**: Clips y música procesados.
- **Procesamiento**: Crea previews de 5-10 segundos, guarda log con cortes y opciones musicales.
- **Salida**: Previews en `output/previews/`, log en `edit_log.txt`.

### 5. Módulo de Integración
- **Descripción**: Coordina con el Agente Psicólogo y 10_DJ_LAG.
- **Entrada**: Instrucciones de `Agent_Logs/`.
- **Salida**: Recomendaciones en `Agent_Logs/clip_lag_log.txt`.

## Pasos de Implementación
1. **Estructura Inicial**:
   - Crear estructura de directorios con subcarpetas y archivos listados.
2. **Carga de Datos**:
   - Asegurar acceso a `07_MEDIA_LAG/raw_videos/`.
3. **Configuración de Herramientas**:
   - Instalar MoviePy, FFmpeg, OpenCV, Whisper, conectar con 10_DJ_LAG.
4. **Generación de Código**:
   - Pasar este blueprint y `Clip_Reglas.md` a Cursor para crear `clip_lag_agent.py`.
5. **Prueba**:
   - Procesar un video con 3 clips, revisar preview y ajustar.

## Consideraciones
- **Ética**: Asegurar que el reencuadre no distorsione contenido sensible.
- **Rendimiento**: Procesar un video a la vez, generar previews para aprobación.
- **Siguiente Update**: Automatización con templates de DaVinci Resolve usando Scripting API. Esto incluye rellenar vacíos con tomas del Psicólogo, aplicar transiciones/efectos de templates (glitch urbano), y generar archivos XML/EDL para importación directa. No se considera en esta iteración inicial.

## Próximos Pasos
- Actualizar `VHQ_Config/updates_pending.txt` con la tarea de implementación.
- Probar con un video y ajustar según retroalimentación.