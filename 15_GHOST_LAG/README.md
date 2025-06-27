# 👻 GHOST_LAG - Agente Escritor Fantasma

Agente especializado en la generación y edición asistida de textos largos (libros, guiones, eBooks, blog posts) para el ecosistema LaGrieta.es.

## 🎯 Funcionalidades Principales

- **Generación de contenido**: Textos largos estructurados y coherentes
- **Gestión de proyectos**: Seguimiento completo de proyectos de escritura
- **Coordinación inter-agente**: Integración con PSICO_LAG y SEO_LAG
- **Control de calidad**: Revisión automática de gramática y legibilidad
- **Exportación múltiple**: PDF, ePub, DOCX, Markdown
- **Sincronización**: Integración con Obsidian para edición colaborativa

## 📁 Estructura de Archivos

```
15_GHOST_LAG/
├── ghost_agent.py          # Agente principal
├── start_agent.py          # Script de inicio
├── config.json             # Configuración del agente
├── requirements.txt        # Dependencias Python
├── GHOST_Blueprint.md      # Blueprint técnico
├── GHOST_Reglas.md         # Reglas y personalidad
└── README.md              # Este archivo
```

## 🗂️ Workspace de Proyectos

```
GHOST_Proyectos/
├── libros/                 # Proyectos de libros
├── scripts/                # Guiones y scripts
├── blog_posts/             # Posts de blog
└── ebooks/                 # eBooks y publicaciones digitales
```

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias
```bash
cd 15_GHOST_LAG
pip install -r requirements.txt
```

### 2. Configurar variables de entorno
```bash
# Crear archivo .env en la raíz del proyecto
OPENAI_API_KEY=tu_clave_aqui
```

### 3. Descargar modelos de NLP (opcional)
```bash
python -m spacy download es_core_news_md
```

### 4. Inicializar el agente
```bash
python start_agent.py
```

## 🚀 Uso Básico

### Crear un nuevo proyecto
```python
from ghost_agent import GhostAgent

agent = GhostAgent()
await agent.initialize()

# Crear proyecto de libro
project = await agent.create_writing_project({
    "title": "Mi Nuevo Libro",
    "type": "libro",
    "target_words": 50000,
    "deadline": "2024-12-31"
})
```

### Generar contenido
```python
# Generar un capítulo
content = await agent.writing_engine.generate_content(
    prompt="Escribe sobre la importancia de la creatividad",
    content_type="libro",
    length=3000
)
```

## 🔗 Integraciones

### Con PSICO_LAG
- Análisis de impacto emocional en fases clave
- Optimización de hooks y storytelling
- Evaluación de engagement del contenido

### Con SEO_LAG  
- Optimización de títulos y subtítulos
- Mejora de meta descripciones
- Análisis de palabras clave

### Con CEO_LAG
- Reportes de progreso
- Aprobaciones de proyectos
- Coordinación de deadlines

### Con DONNA_LAG
- Revisión de calidad final
- Control de cronogramas
- Auditorías de contenido

## 📊 Métricas y KPIs

- **Palabras por día**: Meta de 2,000 palabras
- **Proyectos por trimestre**: Meta de 1 libro completo
- **Calidad promedio**: Meta de 0.8/1.0
- **Tiempo de respuesta**: < 30 segundos por generación
- **Precisión gramatical**: > 95%

## 🎨 Tipos de Contenido Soportados

### 📚 Libros
- Ficción y no ficción
- Estructura por capítulos
- Control de coherencia narrativa
- Exportación profesional

### 🎬 Scripts y Guiones
- Formato estándar de guión
- Diálogos naturales
- Estructura de tres actos
- Notas de dirección

### 📝 Blog Posts
- Optimización SEO
- Estructura de engagement
- Call-to-actions efectivos
- Adaptación a audiencia

### 📱 eBooks
- Formato digital-friendly
- Navegación optimizada
- Compatibilidad multi-dispositivo
- Metadatos completos

## 🔧 Configuración Avanzada

### Personalización de estilo
Edita `GHOST_Reglas.md` para modificar:
- Tono y personalidad
- Reglas de escritura específicas
- Preferencias narrativas
- Restricciones de contenido

### Plantillas personalizadas
Modifica las plantillas en `VHQ_Resources/templates/`:
- `chapter_template.md` - Estructura de capítulos
- `blog_template.md` - Posts de blog
- `book_outline_template.md` - Estructura de libros

## 🐛 Troubleshooting

### Problemas comunes

**Error de API OpenAI**
```bash
# Verificar clave API
echo $OPENAI_API_KEY
```

**Modelo de spaCy no encontrado**
```bash
python -m spacy download es_core_news_md
```

**Permisos de escritura**
```bash
# En Windows
icacls GHOST_Proyectos /grant Users:F /T
```

### Logs y debugging
Los logs se guardan en `Agents_Logs/15_GHOST_LAG.log`

## 📈 Roadmap y Mejoras Futuras

- [ ] Integración con Grammarly API
- [ ] Soporte para múltiples idiomas
- [ ] Generación de imágenes para contenido
- [ ] Integración con plataformas de publicación
- [ ] Sistema de colaboración en tiempo real
- [ ] IA de revisión y edición avanzada

## 🤝 Contribución

Para contribuir al desarrollo del agente:

1. Seguir las reglas del proyecto en `00_CEO_LAG/CEO_Reglas.md`
2. Mantener coherencia con otros agentes del sistema
3. Documentar cambios en este README
4. Probar todas las funcionalidades antes de commit

## 📄 Licencia

Parte del sistema VHQ_LAG para LaGrieta.es

---

**Estado:** ✅ OPERACIONAL  
**Versión:** 1.0.0  
**Última actualización:** Diciembre 2024  
**Mantenedor:** Equipo VHQ_LAG 