from typing import Dict, List, Optional, Union
from pathlib import Path
import json
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr, HttpUrl, FilePath
from loguru import logger

class DocumentType(str, Enum):
    """Types of legal documents."""
    AUTHORIZATION = "authorization"
    CONTRACT = "contract"
    TERMS = "terms"
    LEGAL_NOTICE = "legal_notice"

class DocumentStatus(str, Enum):
    """Status of legal documents."""
    DRAFT = "draft"
    PENDING_SIGNATURE = "pending_signature"
    SIGNED = "signed"
    EXPIRED = "expired"
    REJECTED = "rejected"

class Country(str, Enum):
    """Supported countries for legal database."""
    SPAIN = "spain"
    ITALY = "italy"
    GREECE = "greece"
    TURKEY = "turkey"

class BiometricData(BaseModel):
    """Model for biometric data."""
    fingerprint_hash: Optional[str] = None
    device_id: Optional[str] = None
    timestamp: datetime
    metadata: Optional[Dict] = None

class LegalDocument(BaseModel):
    """Model for legal documents."""
    id: str
    type: DocumentType
    title: str
    content: str
    status: DocumentStatus
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime] = None
    country: Country
    language: str
    signatures: List[BiometricData] = []
    pdf_path: Optional[FilePath] = None
    metadata: Optional[Dict] = None

class LegalClause(BaseModel):
    """Model for legal clauses in the database."""
    id: str
    country: Country
    category: str  # e.g., 'public_recording', 'image_rights'
    description: str
    legal_reference: str
    applicable_scenarios: List[str]
    last_updated: datetime

class ContractTemplate(BaseModel):
    """Model for contract templates."""
    id: str
    name: str
    type: str  # e.g., 'talent', 'brand', 'collaborator'
    content: str
    variables: List[str]  # Template variables to fill
    country: Country
    language: str
    created_at: datetime
    updated_at: datetime

class LawLAGInterface:
    """Interface for the LAW_LAG agent."""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize the LAW_LAG interface."""
        self.config_path = config_path
        self.load_config()
        
        # Setup logging
        logger.add(
            "../Agent_Logs/08_LAW_LAG.log",
            rotation="1 day",
            retention="1 week",
            level="INFO"
        )
        
        # Initialize paths
        self.data_dir = Path("data")
        self.data_dir.mkdir(exist_ok=True)
        
        self.pdf_dir = self.data_dir / "pdf_exports"
        self.pdf_dir.mkdir(exist_ok=True)
        
        for path in ["contract_logs.txt", "legal_database.txt"]:
            (self.data_dir / path).touch(exist_ok=True)

    def load_config(self) -> None:
        """Load configuration from JSON file."""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file {self.config_path} not found. Using defaults.")
            self.config = {
                "database": {
                    "path": "data/authorizations.db"
                },
                "ocr": {
                    "enabled": True,
                    "lang": ["spa", "eng", "ita"],
                    "confidence_threshold": 0.8
                },
                "fingerprint": {
                    "enabled": True,
                    "min_quality": 0.6,
                    "timeout": 30
                },
                "pdf": {
                    "export_dir": "data/pdf_exports",
                    "template_dir": "data/templates"
                },
                "legal": {
                    "update_interval": 2592000,  # 30 days
                    "countries": ["spain", "italy", "greece", "turkey"],
                    "default_language": "spa"
                }
            }
            self.save_config()

    def save_config(self) -> None:
        """Save current configuration to JSON file."""
        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=4)

    async def create_authorization(
        self,
        person_data: Dict,
        doc_type: DocumentType,
        country: Country
    ) -> Optional[LegalDocument]:
        """Create a new authorization document.
        
        Args:
            person_data: Person's identification data
            doc_type: Type of authorization document
            country: Country of jurisdiction
            
        Returns:
            Created document or None if failed
        """
        logger.info(f"Creating {doc_type} authorization for {person_data.get('name')}")
        # To be implemented in main agent
        return None

    async def scan_document(
        self,
        image_path: str,
        doc_type: DocumentType
    ) -> Dict:
        """Scan and analyze a document using OCR.
        
        Args:
            image_path: Path to document image
            doc_type: Type of document to scan
            
        Returns:
            Dictionary with extracted information
        """
        logger.info(f"Scanning document: {image_path}")
        # To be implemented in main agent
        return {}

    async def get_legal_references(
        self,
        country: Country,
        scenario: str
    ) -> List[LegalClause]:
        """Get relevant legal references for a scenario.
        
        Args:
            country: Country of jurisdiction
            scenario: Legal scenario (e.g., 'public_recording')
            
        Returns:
            List of relevant legal clauses
        """
        logger.info(f"Getting legal references for {scenario} in {country}")
        # To be implemented in main agent
        return []

    async def create_contract(
        self,
        template_id: str,
        variables: Dict,
        signatures: List[BiometricData]
    ) -> Optional[LegalDocument]:
        """Create a contract from template.
        
        Args:
            template_id: ID of contract template
            variables: Dictionary of template variables
            signatures: List of biometric signatures
            
        Returns:
            Created contract or None if failed
        """
        logger.info(f"Creating contract from template {template_id}")
        # To be implemented in main agent
        return None

    async def verify_signature(
        self,
        signature: BiometricData,
        document_id: str
    ) -> bool:
        """Verify a biometric signature.
        
        Args:
            signature: Biometric signature data
            document_id: ID of document to verify
            
        Returns:
            True if signature is valid, False otherwise
        """
        logger.info(f"Verifying signature for document {document_id}")
        # To be implemented in main agent
        return False

    async def export_pdf(
        self,
        document: LegalDocument,
        output_path: Optional[str] = None
    ) -> Optional[str]:
        """Export a legal document to PDF.
        
        Args:
            document: Document to export
            output_path: Optional custom output path
            
        Returns:
            Path to generated PDF or None if failed
        """
        logger.info(f"Exporting document {document.id} to PDF")
        # To be implemented in main agent
        return None

    def get_status(self) -> Dict:
        """Get current status of the agent."""
        return {
            "status": "operational",
            "config": self.config,
            "database": Path(self.config["database"]["path"]).exists(),
            "pdf_exports": self.pdf_dir.exists()
        }

    def update_config(self, new_config: Dict) -> None:
        """Update agent configuration."""
        self.config.update(new_config)
        self.save_config()
        logger.info("Configuration updated") 