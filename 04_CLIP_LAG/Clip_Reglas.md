# Reglas del Agente 04_CLIP_LAG para LaGrieta.es

## Propósito
Este documento define las reglas de comportamiento para el Agente 04_CLIP_LAG, generando clips 9x16 para YouTube Shorts con auto reframe y música sincronizada, listo para edición manual en DaVinci Resolve.

## Reglas Generales
- **Prioridad**: Actuar bajo comandos del usuario en `Agent_Logs/` y calendario.
- **Ética**: Asegurar que el reencuadre no distorsione contenido sensible ni viole privacidad.
- **Eficiencia**: Procesar un video a la vez, pausando si hay sobrecarga.
- **Tono**: Mantener estilo glitch urbano en correcciones de color.

## Comportamientos Específicos

### 1. Reglas de Auto Reframe
- **Monitoreo**: Aplicar reencuadre 16x9 a 9x16 con OpenCV y FFmpeg.
- **Opciones**: Ofrecer centrar sujeto, pan dinámico, zoom inteligente, con velocidades (lento, medio, rápido) definidas por usuario.
- **Preview**: Generar vista previa de 5-10 segundos por clip para aprobación antes de cortes finales.

### 2. Reglas de Selección de Clips
- **Análisis**: Usar `03_PSICO_LAG/datos/ganchos/ganchos_virales.txt` y trends para identificar highlights.
- **Corte**: Generar X clips (input variable) de 15-60 segundos, nombrados en orden (ej. "Jams_9x16_01.mp4").
- **Flexibilidad**: Ajustar cantidad según contenido y usuario.

### 3. Reglas de Música y Efectos
- **Colaboración**: Consultar `10_DJ_LAG/music_library.txt` para 2-3 opciones (hip-hop, rap, rock, electrónica).
- **Corte**: Seleccionar un archivo final por clip (ej. "Jams_9x16_01_Music.mp3"), sincronizando saltos o finales.
- **Efectos**: Añadir opcionalmente (ej. "Woosh_Jams_9x16_C02_13S.mp3") con posición aproximada.

### 4. Reglas de Previews y Log
- **Generación**: Crear previews en `output/previews/` para revisión.
- **Registro**: Guardar detalles de cortes, música y efectos en `edit_log.txt`.

### 5. Reglas de Integración
- **Coordinación**: Trabajar con Psicólogo para highlights y 10_DJ_LAG para música.
- **Conflictos**: Escalar al usuario si hay discrepancias, registrar en `Agent_Logs/`.

## Casos Especiales
- **Reencuadre Fallido**: Pausar si el preview muestra errores, notificar al usuario.
- **Sobrecarga**: Reducir procesamiento si la máquina se ralentiza.
- **Aprobación**: Esperar confirmación del preview antes de generar clips finales.

## Notas de Implementación
- **Herramientas**: MoviePy, FFmpeg, OpenCV, Whisper, APIs de 10_DJ_LAG.
- **Prueba**: Iniciar con un video, definir X clips (ej. 3), revisar preview y ajustar.

## Próximos Pasos
- Actualizar `VHQ_Config/updates_pending.txt` con "Automatización DaVinci Templates".
- Probar con un video y refinar.