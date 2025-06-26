import os
from typing import Dict, List, Optional, Any
from pathlib import Path
import json
import asyncio
import aiosqlite
from datetime import datetime, timedelta
from loguru import logger
import emails
from emails.template import JinjaTemplate
import pandas as pd
from agent_interface import (
    TalentLAGInterface,
    Collaborator,
    CollaboratorType,
    CollaboratorStatus,
    CollaboratorScore,
    BoostPlan
)

class EmailManager:
    """Handles email communications with collaborators."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.templates_dir = Path(config["templates_dir"])
        self.from_address = config["from_address"]
        
        # Ensure templates directory exists
        self.templates_dir.mkdir(exist_ok=True)
        
    async def send_email(
        self,
        to_address: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any]
    ) -> bool:
        """Send an email using a template.
        
        Args:
            to_address: Recipient email
            subject: Email subject
            template_name: Name of the template file
            context: Template context variables
            
        Returns:
            True if successful, False otherwise
        """
        try:
            template_path = self.templates_dir / f"{template_name}.html"
            if not template_path.exists():
                logger.error(f"Email template {template_name} not found")
                return False
                
            with open(template_path, 'r', encoding='utf-8') as f:
                template = JinjaTemplate(f.read())
                
            message = emails.html(
                html=template,
                subject=subject,
                mail_from=self.from_address
            )
            
            response = message.send(to=to_address)
            if response.status_code not in [250, 200]:
                logger.error(f"Failed to send email: {response.error}")
                return False
                
            return True
            
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False

class DatabaseManager:
    """Manages SQLite database operations."""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        
    async def initialize(self):
        """Initialize database tables."""
        async with aiosqlite.connect(self.db_path) as db:
            # Collaborators table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS collaborators (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    email TEXT NOT NULL,
                    status TEXT NOT NULL,
                    social_media JSON,
                    score JSON,
                    contact_info TEXT,
                    photo_path TEXT,
                    comments TEXT,
                    created_at TIMESTAMP NOT NULL,
                    updated_at TIMESTAMP NOT NULL,
                    last_contact TIMESTAMP
                )
            """)
            
            # Boost plans table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS boost_plans (
                    id TEXT PRIMARY KEY,
                    collaborator_id TEXT NOT NULL,
                    amount REAL NOT NULL,
                    instagram_budget REAL NOT NULL,
                    youtube_budget REAL NOT NULL,
                    status TEXT NOT NULL,
                    start_date TIMESTAMP,
                    end_date TIMESTAMP,
                    results JSON,
                    FOREIGN KEY(collaborator_id) REFERENCES collaborators(id)
                )
            """)
            
            await db.commit()
            
    async def add_collaborator(self, collaborator: Collaborator) -> bool:
        """Add a new collaborator to the database."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    """
                    INSERT INTO collaborators (
                        id, name, type, email, status, social_media, score,
                        contact_info, photo_path, comments, created_at,
                        updated_at, last_contact
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        collaborator.id,
                        collaborator.name,
                        collaborator.type.value,
                        collaborator.email,
                        collaborator.status.value,
                        json.dumps(collaborator.social_media.dict()),
                        json.dumps(collaborator.score.dict() if collaborator.score else None),
                        collaborator.contact_info,
                        collaborator.photo_path,
                        collaborator.comments,
                        collaborator.created_at.isoformat(),
                        collaborator.updated_at.isoformat(),
                        collaborator.last_contact.isoformat() if collaborator.last_contact else None
                    )
                )
                await db.commit()
                return True
        except Exception as e:
            logger.error(f"Error adding collaborator: {e}")
            return False
            
    async def get_collaborator(self, collaborator_id: str) -> Optional[Collaborator]:
        """Get a collaborator by ID."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                async with db.execute(
                    "SELECT * FROM collaborators WHERE id = ?",
                    (collaborator_id,)
                ) as cursor:
                    row = await cursor.fetchone()
                    if not row:
                        return None
                        
                    return Collaborator(
                        id=row['id'],
                        name=row['name'],
                        type=CollaboratorType(row['type']),
                        email=row['email'],
                        status=CollaboratorStatus(row['status']),
                        social_media=json.loads(row['social_media']),
                        score=CollaboratorScore(**json.loads(row['score'])) if row['score'] else None,
                        contact_info=row['contact_info'],
                        photo_path=row['photo_path'],
                        comments=row['comments'],
                        created_at=datetime.fromisoformat(row['created_at']),
                        updated_at=datetime.fromisoformat(row['updated_at']),
                        last_contact=datetime.fromisoformat(row['last_contact']) if row['last_contact'] else None
                    )
        except Exception as e:
            logger.error(f"Error getting collaborator: {e}")
            return None

class TalentLAGAgent:
    """Main TALENT_LAG agent for managing collaborators."""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize the TALENT_LAG agent."""
        self.interface = TalentLAGInterface(config_path)
        self.config = self.interface.config
        
        # Initialize managers
        self.db = DatabaseManager(self.config["database"]["path"])
        self.email = EmailManager(self.config["email"])
        
        # Initialize paths
        self.boost_plans_file = Path("data/boost_plans.txt")
        self.followup_log_file = Path("data/followup_log.txt")
        
        logger.info("TALENT_LAG Agent initialized")
        
    async def initialize(self):
        """Initialize the agent's components."""
        await self.db.initialize()
        
    async def process_new_collaborator(self, collaborator: Collaborator) -> bool:
        """Process a new collaborator registration.
        
        Args:
            collaborator: New collaborator details
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Add to database
            if not await self.db.add_collaborator(collaborator):
                return False
                
            # Send welcome email
            if not await self.email.send_email(
                collaborator.email,
                "¡Bienvenido a LaGrieta!",
                "welcome_email",
                {"name": collaborator.name}
            ):
                logger.warning(f"Failed to send welcome email to {collaborator.email}")
                
            # Log the new registration
            await self._log_followup(
                collaborator.id,
                f"New {collaborator.type.value} registered: {collaborator.name}"
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing new collaborator: {e}")
            return False
            
    async def create_boost_plan(
        self,
        collaborator_id: str,
        amount: float
    ) -> Optional[BoostPlan]:
        """Create a new boost plan for a collaborator.
        
        Args:
            collaborator_id: Collaborator ID
            amount: Total boost amount
            
        Returns:
            Created boost plan or None if failed
        """
        try:
            collaborator = await self.db.get_collaborator(collaborator_id)
            if not collaborator:
                logger.error(f"Collaborator {collaborator_id} not found")
                return None
                
            # Split amount between platforms
            instagram_budget = amount / 2
            youtube_budget = amount / 2
            
            plan = BoostPlan(
                id=f"boost_{collaborator_id}_{datetime.now().strftime('%Y%m%d')}",
                collaborator_id=collaborator_id,
                amount=amount,
                instagram_budget=instagram_budget,
                youtube_budget=youtube_budget,
                status="pending"
            )
            
            # Log the plan
            with open(self.boost_plans_file, 'a', encoding='utf-8') as f:
                f.write(
                    f"[{datetime.now().isoformat()}] New boost plan for "
                    f"{collaborator.name}: €{amount}\n"
                )
                
            return plan
            
        except Exception as e:
            logger.error(f"Error creating boost plan: {e}")
            return None
            
    async def _log_followup(self, collaborator_id: str, message: str):
        """Log a follow-up entry."""
        try:
            timestamp = datetime.now().isoformat()
            with open(self.followup_log_file, 'a', encoding='utf-8') as f:
                f.write(f"[{timestamp}] {collaborator_id}: {message}\n")
        except Exception as e:
            logger.error(f"Error logging followup: {e}")
            
    async def run(self):
        """Main agent loop."""
        logger.info("TALENT_LAG Agent starting main loop")
        
        await self.initialize()
        
        while True:
            try:
                # Process pending tasks
                # TODO: Implement task processing
                
                # Wait for next iteration
                await asyncio.sleep(300)  # 5 minutes
                
            except asyncio.CancelledError:
                logger.info("TALENT_LAG Agent shutting down")
                break
            except Exception as e:
                logger.error(f"Error in main loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error

if __name__ == "__main__":
    agent = TalentLAGAgent()
    asyncio.run(agent.run()) 