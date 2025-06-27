import os
import json
import logging
import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import sqlite3
from pathlib import Path
import schedule
import pytz
from dataclasses import dataclass
import re
import hashlib

# Text processing imports
import nltk
import spacy
from textblob import TextBlob
from transformers import pipeline
import openai
from language_tool_python import LanguageTool
from py_readability_metrics import flesch_kincaid

# File processing imports
import markdown
from docx import Document
import pypdf2
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import ebooklib
from ebooklib import epub

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('GHOST_LAG')

@dataclass
class WritingProject:
    """Data class for writing projects"""
    id: str
    title: str
    project_type: str  # libro, script, blog_post, ebook
    status: str  # planning, writing, reviewing, completed
    target_words: int
    current_words: int
    chapters: List[Dict]
    deadline: Optional[datetime]
    created_at: datetime
    last_modified: datetime
    style_guide: Dict
    collaborators: List[str]

class WritingEngine:
    """Writing_Engine_v1.0 module for text generation and editing"""
    def __init__(self, config: Dict):
        self.config = config
        self.model = config["writing_engine"]["model"]
        self.max_tokens = config["writing_engine"]["max_tokens"]
        self.temperature = config["writing_engine"]["temperature"]
        self.style_guide_path = config["writing_engine"]["style_guide"]
        
        # Initialize AI models
        if "openai" in self.model.lower():
            openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Load style guide
        self.style_guide = self._load_style_guide()
        
    async def generate_content(self, prompt: str, content_type: str, length: int = 1000) -> Dict:
        """Generate content based on prompt and specifications"""
        try:
            # Prepare context with style guide
            context = self._prepare_context(content_type)
            full_prompt = f"{context}\n\nTarea: {prompt}\n\nLongitud objetivo: {length} palabras"
            
            # Generate content based on model type
            if "gpt" in self.model.lower():
                content = await self._generate_openai_content(full_prompt, length)
            else:
                content = await self._generate_local_content(full_prompt, length)
            
            # Post-process content
            processed = await self._post_process_content(content, content_type)
            
            return {
                "content": processed["text"],
                "word_count": processed["word_count"],
                "quality_score": processed["quality_score"],
                "suggestions": processed["suggestions"],
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "model_used": self.model,
                    "content_type": content_type
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating content: {e}")
            return None

    def _load_style_guide(self) -> Dict:
        """Load style guide from file"""
        try:
            if os.path.exists(self.style_guide_path):
                with open(self.style_guide_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Parse markdown style guide into structured data
                    return self._parse_style_guide(content)
            return {}
        except Exception as e:
            logger.error(f"Error loading style guide: {e}")
            return {}

    def _prepare_context(self, content_type: str) -> str:
        """Prepare context for content generation"""
        base_context = """
        Eres GHOST, un escritor fantasma profesional especializado en crear contenido de alta calidad.
        Tu estilo es claro, estructurado y con enfoque en storytelling efectivo.
        Siempre buscas enganchar desde el inicio y mantener el interés del lector.
        """
        
        type_contexts = {
            "libro": "Estás escribiendo un capítulo de libro. Mantén coherencia narrativa y desarrolla bien los conceptos.",
            "blog_post": "Estás escribiendo un post de blog. Incluye hooks, estructura clara y call-to-action.",
            "script": "Estás escribiendo un guión. Usa formato apropiado y diálogos naturales.",
            "ebook": "Estás escribiendo contenido para eBook. Mantén formato digital-friendly."
        }
        
        return base_context + type_contexts.get(content_type, "")

    async def _generate_openai_content(self, prompt: str, length: int) -> str:
        """Generate content using OpenAI API"""
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Eres GHOST_LAG, un escritor profesional."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=min(self.max_tokens, length * 2),  # Estimate tokens
                temperature=self.temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI generation error: {e}")
            return ""

    async def _post_process_content(self, content: str, content_type: str) -> Dict:
        """Post-process generated content"""
        word_count = len(content.split())
        
        # Basic quality metrics
        sentences = content.split('.')
        avg_sentence_length = word_count / len(sentences) if sentences else 0
        
        # Simple quality score based on various factors
        quality_score = min(1.0, max(0.0, 
            0.8 - abs(avg_sentence_length - 15) / 50  # Penalize very long/short sentences
        ))
        
        suggestions = []
        if avg_sentence_length > 25:
            suggestions.append("Consider breaking down long sentences")
        if word_count < 100:
            suggestions.append("Content might be too short")
            
        return {
            "text": content,
            "word_count": word_count,
            "quality_score": quality_score,
            "suggestions": suggestions
        }

class ProjectManager:
    """Project_Manager_v1.0 module for managing writing projects"""
    def __init__(self, config: Dict):
        self.config = config
        self.workspace_path = Path(config["project_management"]["workspace_path"])
        self.backup_frequency = config["project_management"]["backup_frequency"]
        self.auto_save = config["project_management"]["auto_save"]
        self.version_control = config["project_management"]["version_control"]
        
        # Ensure workspace exists
        self.workspace_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self.db_path = self.workspace_path / "projects.db"
        self._initialize_database()

    def _initialize_database(self):
        """Initialize SQLite database for project management"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS projects (
                        id TEXT PRIMARY KEY,
                        title TEXT NOT NULL,
                        project_type TEXT NOT NULL,
                        status TEXT NOT NULL,
                        target_words INTEGER,
                        current_words INTEGER,
                        chapters TEXT,  -- JSON string
                        deadline TEXT,
                        created_at TEXT,
                        last_modified TEXT,
                        style_guide TEXT,  -- JSON string
                        collaborators TEXT  -- JSON string
                    )
                ''')
                conn.commit()
        except Exception as e:
            logger.error(f"Database initialization error: {e}")

    async def create_project(self, project_data: Dict) -> str:
        """Create a new writing project"""
        try:
            project_id = self._generate_project_id(project_data["title"])
            
            # Create project directory structure
            project_dir = self.workspace_path / project_data["type"] / project_id
            project_dir.mkdir(parents=True, exist_ok=True)
            
            # Create subdirectories
            (project_dir / "drafts").mkdir(exist_ok=True)
            (project_dir / "research").mkdir(exist_ok=True)
            (project_dir / "exports").mkdir(exist_ok=True)
            (project_dir / "backups").mkdir(exist_ok=True)
            
            # Create project object
            project = WritingProject(
                id=project_id,
                title=project_data["title"],
                project_type=project_data["type"],
                status="planning",
                target_words=project_data.get("target_words", 10000),
                current_words=0,
                chapters=[],
                deadline=project_data.get("deadline"),
                created_at=datetime.now(),
                last_modified=datetime.now(),
                style_guide=project_data.get("style_guide", {}),
                collaborators=project_data.get("collaborators", [])
            )
            
            # Save to database
            await self._save_project(project)
            
            # Create initial files
            await self._create_project_files(project)
            
            logger.info(f"Created new project: {project_id}")
            return project_id
            
        except Exception as e:
            logger.error(f"Error creating project: {e}")
            return None

    def _generate_project_id(self, title: str) -> str:
        """Generate unique project ID from title"""
        # Clean title and create hash
        clean_title = re.sub(r'[^a-zA-Z0-9\s]', '', title)
        title_hash = hashlib.md5(clean_title.encode()).hexdigest()[:8]
        timestamp = datetime.now().strftime("%Y%m%d")
        return f"{timestamp}_{title_hash}"

    async def _save_project(self, project: WritingProject):
        """Save project to database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    project.id,
                    project.title,
                    project.project_type,
                    project.status,
                    project.target_words,
                    project.current_words,
                    json.dumps(project.chapters),
                    project.deadline.isoformat() if project.deadline else None,
                    project.created_at.isoformat(),
                    project.last_modified.isoformat(),
                    json.dumps(project.style_guide),
                    json.dumps(project.collaborators)
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"Error saving project: {e}")

    async def _create_project_files(self, project: WritingProject):
        """Create initial project files"""
        try:
            project_dir = self.workspace_path / project.project_type / project.id
            
            # Create README
            readme_content = f"""# {project.title}

**Tipo:** {project.project_type}
**Estado:** {project.status}
**Meta de palabras:** {project.target_words}
**Creado:** {project.created_at.strftime('%Y-%m-%d %H:%M')}

## Estructura del proyecto

- `drafts/` - Borradores de capítulos
- `research/` - Material de investigación
- `exports/` - Versiones exportadas
- `backups/` - Respaldos automáticos

## Progreso

- [ ] Estructura inicial
- [ ] Primer borrador
- [ ] Revisión
- [ ] Edición final
"""
            
            with open(project_dir / "README.md", 'w', encoding='utf-8') as f:
                f.write(readme_content)
                
        except Exception as e:
            logger.error(f"Error creating project files: {e}")

class GhostAgent:
    """Main GHOST_LAG agent implementation"""
    def __init__(self, config_path: str = "config.json"):
        self.logger = logger
        self.config = self._load_config(config_path)
        self.session = None
        
        # Initialize modules
        self.writing_engine = WritingEngine(self.config)
        self.project_manager = ProjectManager(self.config)
        
        # Initialize workspace
        self.workspace_path = Path(self.config["project_management"]["workspace_path"])
        self.workspace_path.mkdir(parents=True, exist_ok=True)
        
    async def initialize(self):
        """Initialize all necessary components"""
        await self._initialize_session()
        logger.info("GHOST_LAG Agent initialized successfully")

    async def create_writing_project(self, project_request: Dict) -> Dict:
        """Create a new writing project"""
        try:
            # Validate request
            if not self._validate_project_request(project_request):
                return {"success": False, "error": "Invalid project request"}
            
            # Create project
            project_id = await self.project_manager.create_project(project_request)
            if not project_id:
                return {"success": False, "error": "Failed to create project"}
            
            return {
                "success": True,
                "project_id": project_id,
                "workspace_path": str(self.workspace_path / project_request["type"] / project_id)
            }
            
        except Exception as e:
            logger.error(f"Error creating writing project: {e}")
            return {"success": False, "error": str(e)}

    def _validate_project_request(self, request: Dict) -> bool:
        """Validate project creation request"""
        required_fields = ["title", "type"]
        return all(field in request for field in required_fields)

    async def _initialize_session(self):
        """Initialize HTTP session for inter-agent communication"""
        self.session = aiohttp.ClientSession()

    def _load_config(self, config_path: str) -> Dict:
        """Load agent configuration"""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            return {}

if __name__ == "__main__":
    # Quick test
    agent = GhostAgent()
    print("GHOST_LAG Agent initialized successfully") 