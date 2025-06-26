import os
from typing import Dict, List, Optional, Any
from pathlib import Path
import json
import asyncio
import aiosqlite
from datetime import datetime, timedelta
from loguru import logger
import cv2
import pytesseract
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from agent_interface import (
    LawLAGInterface,
    DocumentType,
    DocumentStatus,
    Country,
    BiometricData,
    LegalDocument,
    LegalClause,
    ContractTemplate
)

class DocumentManager:
    """Handles document scanning and processing."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.ocr_config = config["ocr"]
        
    async def scan_id(self, image_path: str) -> Dict[str, Any]:
        """Scan an ID document using OpenCV and OCR.
        
        Args:
            image_path: Path to ID image
            
        Returns:
            Dictionary with extracted information
        """
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Could not read image")
                
            # Preprocess image
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Extract text
            text = pytesseract.image_to_string(
                denoised,
                lang="+".join(self.ocr_config["lang"]),
                config='--psm 3'
            )
            
            # Parse extracted text
            lines = text.split('\n')
            data = {}
            
            for line in lines:
                if "DNI" in line or "NIE" in line:
                    data["id_number"] = line.split()[-1]
                elif any(word in line.lower() for word in ["nombre", "name"]):
                    data["name"] = line.split(":")[-1].strip()
                    
            return data
            
        except Exception as e:
            logger.error(f"Error scanning ID: {e}")
            return {}

class DatabaseManager:
    """Manages SQLite database operations."""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        
    async def initialize(self):
        """Initialize database tables."""
        async with aiosqlite.connect(self.db_path) as db:
            # Legal documents table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS legal_documents (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    status TEXT NOT NULL,
                    country TEXT NOT NULL,
                    language TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    updated_at TIMESTAMP NOT NULL,
                    expires_at TIMESTAMP,
                    pdf_path TEXT,
                    metadata JSON
                )
            """)
            
            # Signatures table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS signatures (
                    id TEXT PRIMARY KEY,
                    document_id TEXT NOT NULL,
                    fingerprint_hash TEXT,
                    device_id TEXT,
                    timestamp TIMESTAMP NOT NULL,
                    metadata JSON,
                    FOREIGN KEY(document_id) REFERENCES legal_documents(id)
                )
            """)
            
            # Legal clauses table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS legal_clauses (
                    id TEXT PRIMARY KEY,
                    country TEXT NOT NULL,
                    category TEXT NOT NULL,
                    description TEXT NOT NULL,
                    legal_reference TEXT NOT NULL,
                    applicable_scenarios JSON NOT NULL,
                    last_updated TIMESTAMP NOT NULL
                )
            """)
            
            # Contract templates table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS contract_templates (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    variables JSON NOT NULL,
                    country TEXT NOT NULL,
                    language TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    updated_at TIMESTAMP NOT NULL
                )
            """)
            
            await db.commit()
            
    async def add_document(self, document: LegalDocument) -> bool:
        """Add a new legal document to the database."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    """
                    INSERT INTO legal_documents (
                        id, type, title, content, status, country, language,
                        created_at, updated_at, expires_at, pdf_path, metadata
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        document.id,
                        document.type.value,
                        document.title,
                        document.content,
                        document.status.value,
                        document.country.value,
                        document.language,
                        document.created_at.isoformat(),
                        document.updated_at.isoformat(),
                        document.expires_at.isoformat() if document.expires_at else None,
                        str(document.pdf_path) if document.pdf_path else None,
                        json.dumps(document.metadata) if document.metadata else None
                    )
                )
                
                # Add signatures if any
                for signature in document.signatures:
                    await db.execute(
                        """
                        INSERT INTO signatures (
                            id, document_id, fingerprint_hash, device_id,
                            timestamp, metadata
                        ) VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (
                            signature.id,
                            document.id,
                            signature.fingerprint_hash,
                            signature.device_id,
                            signature.timestamp.isoformat(),
                            json.dumps(signature.metadata) if signature.metadata else None
                        )
                    )
                    
                await db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Error adding document: {e}")
            return False
            
    async def get_document(self, document_id: str) -> Optional[LegalDocument]:
        """Get a document by ID."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                # Get document
                async with db.execute(
                    "SELECT * FROM legal_documents WHERE id = ?",
                    (document_id,)
                ) as cursor:
                    doc_row = await cursor.fetchone()
                    if not doc_row:
                        return None
                        
                    # Get signatures
                    async with db.execute(
                        "SELECT * FROM signatures WHERE document_id = ?",
                        (document_id,)
                    ) as sig_cursor:
                        signatures = []
                        async for sig_row in sig_cursor:
                            signatures.append(BiometricData(
                                fingerprint_hash=sig_row['fingerprint_hash'],
                                device_id=sig_row['device_id'],
                                timestamp=datetime.fromisoformat(sig_row['timestamp']),
                                metadata=json.loads(sig_row['metadata']) if sig_row['metadata'] else None
                            ))
                            
                    return LegalDocument(
                        id=doc_row['id'],
                        type=DocumentType(doc_row['type']),
                        title=doc_row['title'],
                        content=doc_row['content'],
                        status=DocumentStatus(doc_row['status']),
                        country=Country(doc_row['country']),
                        language=doc_row['language'],
                        created_at=datetime.fromisoformat(doc_row['created_at']),
                        updated_at=datetime.fromisoformat(doc_row['updated_at']),
                        expires_at=datetime.fromisoformat(doc_row['expires_at']) if doc_row['expires_at'] else None,
                        pdf_path=Path(doc_row['pdf_path']) if doc_row['pdf_path'] else None,
                        metadata=json.loads(doc_row['metadata']) if doc_row['metadata'] else None,
                        signatures=signatures
                    )
                    
        except Exception as e:
            logger.error(f"Error getting document: {e}")
            return None

class LawLAGAgent:
    """Main LAW_LAG agent for legal document management."""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize the LAW_LAG agent."""
        self.interface = LawLAGInterface(config_path)
        self.config = self.interface.config
        
        # Initialize managers
        self.db = DatabaseManager(self.config["database"]["path"])
        self.doc_manager = DocumentManager(self.config)
        
        # Initialize paths
        self.data_dir = Path("data")
        self.data_dir.mkdir(exist_ok=True)
        
        self.pdf_dir = self.data_dir / "pdf_exports"
        self.pdf_dir.mkdir(exist_ok=True)
        
        self.templates_dir = self.data_dir / "templates"
        self.templates_dir.mkdir(exist_ok=True)
        
    async def initialize(self):
        """Initialize the agent."""
        await self.db.initialize()
        logger.info("LAW_LAG agent initialized")
        
    async def process_authorization(
        self,
        person_data: Dict[str, Any],
        doc_type: DocumentType,
        country: Country
    ) -> Optional[LegalDocument]:
        """Process a new authorization request."""
        try:
            # Create document
            doc = LegalDocument(
                id=f"auth_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                type=doc_type,
                title=f"Authorization for {person_data.get('name', 'Unknown')}",
                content="", # To be filled with template
                status=DocumentStatus.DRAFT,
                country=country,
                language=self.config["legal"]["default_language"],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            # Add to database
            if await self.db.add_document(doc):
                logger.info(f"Created authorization document {doc.id}")
                return doc
            return None
            
        except Exception as e:
            logger.error(f"Error processing authorization: {e}")
            return None
            
    async def _log_contract(self, document_id: str, message: str):
        """Log contract-related activity."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO contract_logs (timestamp, document_id, message) VALUES (?, ?, ?)",
                (timestamp, document_id, message)
            )
            await db.commit()
            
    async def run(self):
        """Run the agent's main loop."""
        try:
            await self.initialize()
            
            while True:
                # Process any pending documents
                # Update legal database
                # Monitor document expirations
                await asyncio.sleep(60)  # Check every minute
                
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
            raise 