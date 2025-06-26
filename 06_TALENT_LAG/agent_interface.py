from typing import Dict, List, Optional, Union
from pathlib import Path
import json
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr, HttpUrl, conint
from loguru import logger

class CollaboratorType(str, Enum):
    """Types of collaborators."""
    TALENT = "talent"
    BRAND = "brand"
    YOUNG_PROMISE = "young_promise"

class CollaboratorStatus(str, Enum):
    """Status of collaborators."""
    ACTIVE = "active"
    PENDING = "pending"
    COMPLETED = "completed"
    REJECTED = "rejected"
    TOXIC = "toxic"

class SocialMedia(BaseModel):
    """Social media links for collaborators."""
    instagram: Optional[HttpUrl] = None
    youtube: Optional[HttpUrl] = None
    twitter: Optional[HttpUrl] = None
    tiktok: Optional[HttpUrl] = None
    website: Optional[HttpUrl] = None

class CollaboratorScore(BaseModel):
    """Scoring model for collaborators."""
    views: conint(ge=0, le=10) = 0          # 0-10 points
    creativity: conint(ge=0, le=10) = 0     # 0-10 points
    altruism: conint(ge=0, le=10) = 0       # 0-10 points
    message: conint(ge=0, le=10) = 0        # 0-10 points
    
    @property
    def total(self) -> int:
        """Calculate total score."""
        return self.views + self.creativity + self.altruism + self.message
    
    @property
    def is_acceptable(self) -> bool:
        """Check if score meets minimum requirements."""
        return self.total >= 20  # Minimum 20/40 required

class Collaborator(BaseModel):
    """Model for collaborators in the CRM."""
    id: str
    name: str
    type: CollaboratorType
    email: EmailStr
    status: CollaboratorStatus = CollaboratorStatus.PENDING
    social_media: SocialMedia
    score: Optional[CollaboratorScore] = None
    contact_info: Optional[str] = None
    photo_path: Optional[str] = None
    comments: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_contact: Optional[datetime] = None

class BoostPlan(BaseModel):
    """Model for boost/advertising plans."""
    id: str
    collaborator_id: str
    amount: float
    instagram_budget: float
    youtube_budget: float
    status: str  # 'pending', 'active', 'completed'
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    results: Optional[Dict] = None

class TalentLAGInterface:
    """Interface for the TALENT_LAG agent."""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize the TALENT_LAG interface."""
        self.config_path = config_path
        self.load_config()
        
        # Setup logging
        logger.add(
            "../Agent_Logs/06_TALENT_LAG.log",
            rotation="1 day",
            retention="1 week",
            level="INFO"
        )
        
        # Initialize paths
        self.data_dir = Path("data")
        self.data_dir.mkdir(exist_ok=True)
        
        for path in ["boost_plans.txt", "followup_log.txt"]:
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
                    "path": "data/collaborators.db"
                },
                "email": {
                    "templates_dir": "data/email_templates",
                    "from_address": "talent@lagrieta.es"
                },
                "social": {
                    "instagram": {
                        "enabled": True,
                        "min_boost": 5.0
                    },
                    "youtube": {
                        "enabled": True,
                        "min_boost": 5.0
                    }
                },
                "scoring": {
                    "min_total": 20,
                    "weights": {
                        "views": 1.0,
                        "creativity": 1.0,
                        "altruism": 1.0,
                        "message": 1.0
                    }
                }
            }
            self.save_config()

    def save_config(self) -> None:
        """Save current configuration to JSON file."""
        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=4)

    async def add_collaborator(self, collaborator: Collaborator) -> bool:
        """Add a new collaborator to the CRM.
        
        Args:
            collaborator: Collaborator model with details
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Adding new collaborator: {collaborator.name}")
        # To be implemented in main agent
        return True

    async def update_collaborator(self, collaborator_id: str, updates: Dict) -> bool:
        """Update an existing collaborator.
        
        Args:
            collaborator_id: ID of the collaborator to update
            updates: Dictionary of updates to apply
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Updating collaborator {collaborator_id}")
        # To be implemented in main agent
        return True

    async def get_collaborator(self, collaborator_id: str) -> Optional[Collaborator]:
        """Get collaborator by ID.
        
        Args:
            collaborator_id: ID of the collaborator
            
        Returns:
            Collaborator if found, None otherwise
        """
        logger.info(f"Fetching collaborator {collaborator_id}")
        # To be implemented in main agent
        return None

    async def search_collaborators(
        self,
        type: Optional[CollaboratorType] = None,
        status: Optional[CollaboratorStatus] = None,
        min_score: Optional[int] = None
    ) -> List[Collaborator]:
        """Search collaborators with filters.
        
        Args:
            type: Filter by collaborator type
            status: Filter by status
            min_score: Filter by minimum score
            
        Returns:
            List of matching collaborators
        """
        logger.info(f"Searching collaborators with type={type}, status={status}")
        # To be implemented in main agent
        return []

    async def add_boost_plan(self, plan: BoostPlan) -> bool:
        """Add a new boost/advertising plan.
        
        Args:
            plan: Boost plan details
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Adding boost plan for collaborator {plan.collaborator_id}")
        # To be implemented in main agent
        return True

    async def send_initial_email(self, collaborator_id: str) -> bool:
        """Send initial confirmation email to collaborator.
        
        Args:
            collaborator_id: ID of the collaborator
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Sending initial email to collaborator {collaborator_id}")
        # To be implemented in main agent
        return True

    async def send_followup_email(
        self,
        collaborator_id: str,
        stats: Dict[str, Any]
    ) -> bool:
        """Send follow-up email with performance stats.
        
        Args:
            collaborator_id: ID of the collaborator
            stats: Dictionary with performance statistics
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Sending followup email to collaborator {collaborator_id}")
        # To be implemented in main agent
        return True

    def get_status(self) -> Dict:
        """Get current status of the agent.
        
        Returns:
            Dictionary with status information
        """
        return {
            "status": "operational",
            "config": self.config,
            "database": Path(self.config["database"]["path"]).exists(),
            "email_templates": Path(self.config["email"]["templates_dir"]).exists()
        }

    def update_config(self, new_config: Dict) -> None:
        """Update agent configuration.
        
        Args:
            new_config: Dictionary with new configuration values
        """
        self.config.update(new_config)
        self.save_config()
        logger.info("Configuration updated") 