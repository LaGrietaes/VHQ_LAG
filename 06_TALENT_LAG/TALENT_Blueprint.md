# Blueprint del Agente 06_TALENT_LAG para LaGrieta.es

## Descripción General
- **Propósito**: Identificar y gestionar talentos, marcas y Jovenes Promesas para generar contenido, ofreciendo entrevistas gratuitas con opción de boost pagado.
- **Rol**: Scout y CRM, facilitando producción/edicción gratis, sugiriendo boost (€10 mínimo) post-video para ads, colaborando con 00_CEO_LAG, 02_CM_LAG y 07_CASH_LAG.
- **Referencia a Reglas**: Todas las acciones se rigen por `Reglas_Agente_06_TALENT_LAG.md`.

## Arquitectura
### Estructura de Carpetas y Archivos
- **Carpeta Principal**: `X:\VHQ_LAG\Talent\`
- **Script Principal**: `talent_agent.py` (a generar por Cursor)
- **Archivos de Soporte**:
  - `collaborators.db` (CRM con perfiles, rangos, comentarios)
  - `boost_plans.txt` (planes de publicidad)
  - `followup_log.txt` (seguimiento Jovenes Promesas)

## Funcionalidades Principales
- **Búsqueda y Negociación**:
  - Inicia con conocidos, negocia entrevistas gratuitas, sugiriendo boost (€10: 5€ Instagram, 5€ YouTube) post-avant-première, escalando a 50€+ para marcas.
  - Contacta marcas/servicios alineados, informando al talento como ventaja.
- **Sorteos y Contenido**:
  - Gestiona sorteos opcionales con bienes/servicios ajenos, o 1:1 via Zoom con shoutout/clip corto.
  - Produce notas/blog y videos/YouTube, editados por 04_CLIP_LAG, publicando sin ads si no pagan.
- **Promoción y Emails**:
  - Reinvierte boosts en ads (Instagram, YouTube), limitando promoción externa al 20%.
  - Envía email inicial confirmando producción, y post-publicación con informe de vistas/reach.
- **CRM Avanzado**:
  - Categorías: Talentos, Marcas, Jovenes Promesas.
  - Puntuación (visitas, creatividad, altruismo, mensaje; mínimo 20/40), descartando tóxicos.
  - Incluye redes, foto/logo, contactos, rango, box de comentarios, y linkeos.
- **Seguimiento y Comisiones**:
  - Follow-up anual para Jovenes Promesas en `followup_log.txt`.
  - Monitorea eventos/lanzamientos, proponiendo comisiones (branch 07_CASH_LAG).
- **Formulario**: Integra inscripción en “Quiénes Somos”.

## Requerimientos Técnicos
- Integración con APIs de Instagram/YouTube para boosts.
- Uso de SQLite para `collaborators.db`.
- Generación de emails automáticos.
- Conexión con 04_CLIP_LAG para edición.

## Estado Actual
- **Estado**: En desarrollo
- **Métricas Iniciales**: Sin colaboradores registrados aún