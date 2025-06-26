# Blueprint del Agente 08_LAW_LAG para LaGrieta.es

## Descripción General
- **Propósito**: Proteger legalmente a LaGrieta.es como primer auxilio, generando autorizaciones, escaneando contratos y apps, y defendiendo con leyes y loopholes, exportando en PDF.
- **Rol**: Agente legal básico y astuto, como un "Better Call Saul" IA, que usa OpenCV, firma digital y base legal para minimizar riesgos.
- **Referencia a Reglas**: Todas las acciones se rigen por `Reglas_Agente_08_LAW_LAG.md`.

## Arquitectura
### Estructura de Carpetas y Archivos
- **Carpeta Principal**: `X:\VHQ_LAG\Law\`
- **Script Principal**: `law_agent.py` (a generar por Cursor)
- **Archivos de Soporte**:
  - `authorizations.db` (documentos legales)
  - `contract_logs.txt` (términos escaneados)
  - `legal_database.txt` (leyes por país)
  - `pdf_exports/` (carpeta para PDFs exportados)

## Funcionalidades Principales
- **Autorizaciones Rápidas**:
  - Usa OpenCV para capturar DNI de personas inesperadas, con backup de formulario manual (nombre, DNI/pasaporte) en tablet/móvil.
  - Usa lector de huellas del dispositivo para firma digital, generando documentos válidos para ceder derechos de imagen, exportados en PDF para talento/entrevistados.
- **Escaneo de Contratos y Apps**:
  - Escanea términos de servicios (rentacar) y apps con OCR, detectando cláusulas abusivas.
  - Sugiere no usar apps con términos peligrosos o buscar alternativas legales.
- **Defensa Legal**:
  - Cita leyes locales (ej. grabación en público) y busca loopholes para defendernos ante acusaciones.
- **Contratos Básicos**:
  - Crea contratos simples para marcas, artistas y colaboradores con firma digital via huellas, exportados en PDF.
- **Base Legal**:
  - Mantiene base por país (España, Italia, etc.) con leyes clave, actualizada via web scraping.
- **Próxima Actualización**: Agregar set de escenarios legales (aeropuertos, filmaciones en terreno, cruces fronterizos, abusos policiales) para reforzar preparación.

## Requerimientos Técnicos
- OpenCV para reconocimiento de DNI.
- OCR para escaneo de documentos.
- Integración con lector de huellas de tablet/móvil.
- Exportación a PDF usando bibliotecas como ReportLab o pdfkit.
- Base de datos SQLite para legal_database.txt.

## Estado Actual
- **Estado**: En desarrollo
- **Métricas Iniciales**: Sin documentos generados aún