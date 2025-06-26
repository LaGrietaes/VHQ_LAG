from typing import Dict, List, Optional, Union
from pathlib import Path
import json
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, DirectoryPath, FilePath, HttpUrl
from loguru import logger

class SystemStatus(str, Enum):
    """System operational status."""
    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    DOWN = "down"
    MAINTENANCE = "maintenance"

class BackupType(str, Enum):
    """Types of backups."""
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"

class BackupStatus(str, Enum):
    """Status of backup operations."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    VERIFIED = "verified"

class AgentStatus(BaseModel):
    """Status information for an agent."""
    agent_id: str
    name: str
    status: SystemStatus
    last_check: datetime
    metrics: Dict
    errors: List[str] = []
    warnings: List[str] = []

class SystemMetrics(BaseModel):
    """System resource metrics."""
    cpu_usage: float
    memory_usage: float
    disk_usage: Dict[str, float]
    network_io: Dict[str, int]
    gpu_usage: Optional[float] = None
    process_count: int
    timestamp: datetime

class BackupConfig(BaseModel):
    """Backup configuration."""
    type: BackupType
    source_path: DirectoryPath
    destination_path: Union[DirectoryPath, HttpUrl]
    schedule: str  # Cron expression
    retention_days: int
    compression: bool = True
    encryption: bool = True

class BackupJob(BaseModel):
    """Backup job information."""
    id: str
    config: BackupConfig
    status: BackupStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    size_bytes: Optional[int] = None
    error_message: Optional[str] = None

class DevelopmentTask(BaseModel):
    """Development task information."""
    id: str
    title: str
    description: str
    priority: int
    assigned_to: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    due_date: Optional[datetime] = None
    related_files: List[FilePath] = []

class SubscriptionType(str, Enum):
    """Types of software subscriptions."""
    DOMAIN = "domain"
    DNS = "dns"
    HOSTING = "hosting"
    LICENSE = "license"
    CLOUD = "cloud"
    CDN = "cdn"
    SSL = "ssl"
    OTHER = "other"

class SubscriptionStatus(str, Enum):
    """Status of subscriptions."""
    ACTIVE = "active"
    EXPIRING_SOON = "expiring_soon"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    RENEWAL_FAILED = "renewal_failed"

class SubscriptionProvider(str, Enum):
    """Common subscription providers."""
    NOIP = "noip"
    GODADDY = "godaddy"
    CLOUDFLARE = "cloudflare"
    AWS = "aws"
    DIGITALOCEAN = "digitalocean"
    NAMECHEAP = "namecheap"
    OTHER = "other"

class Subscription(BaseModel):
    """Model for software subscriptions."""
    id: str
    name: str
    type: SubscriptionType
    provider: SubscriptionProvider
    status: SubscriptionStatus
    credentials: Optional[Dict] = None
    start_date: datetime
    end_date: datetime
    auto_renew: bool = True
    renewal_price: Optional[float] = None
    renewal_period_days: int
    last_renewal: Optional[datetime] = None
    next_renewal: Optional[datetime] = None
    notification_days: int = 30
    metadata: Optional[Dict] = None

class ITLAGInterface:
    """Interface for the IT_LAG agent."""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize the IT_LAG interface."""
        self.config_path = config_path
        self.load_config()
        
        # Setup logging
        logger.add(
            "../Agent_Logs/09_IT_LAG.log",
            rotation="1 day",
            retention="1 week",
            level="INFO"
        )
        
        # Initialize paths
        self.data_dir = Path("data")
        self.data_dir.mkdir(exist_ok=True)
        
        self.backup_dir = self.data_dir / "backups"
        self.backup_dir.mkdir(exist_ok=True)
        
        self.metrics_dir = self.data_dir / "metrics"
        self.metrics_dir.mkdir(exist_ok=True)

    def load_config(self) -> None:
        """Load configuration from JSON file."""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file {self.config_path} not found. Using defaults.")
            self.config = {
                "monitoring": {
                    "interval": 60,  # seconds
                    "metrics_retention": 604800,  # 7 days
                    "alert_thresholds": {
                        "cpu_usage": 80,
                        "memory_usage": 80,
                        "disk_usage": 90
                    }
                },
                "backup": {
                    "default_retention": 30,  # days
                    "compression_level": 9,
                    "encryption_algorithm": "AES-256",
                    "cloud_provider": "s3",
                    "local_backup_path": "data/backups"
                },
                "development": {
                    "code_style": "black",
                    "test_coverage_min": 80,
                    "lint_config": "default"
                },
                "security": {
                    "scan_interval": 86400,  # 24 hours
                    "allowed_ports": [80, 443, 22],
                    "ssl_check_interval": 604800  # 7 days
                }
            }
            self.save_config()

    def save_config(self) -> None:
        """Save current configuration to JSON file."""
        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=4)

    async def get_system_metrics(self) -> SystemMetrics:
        """Get current system metrics."""
        logger.info("Collecting system metrics")
        # To be implemented in main agent
        return None

    async def check_agent_status(self, agent_id: str) -> AgentStatus:
        """Check status of a specific agent."""
        logger.info(f"Checking status of agent {agent_id}")
        # To be implemented in main agent
        return None

    async def create_backup(
        self,
        config: BackupConfig
    ) -> Optional[BackupJob]:
        """Create a new backup job."""
        logger.info(f"Creating {config.type} backup")
        # To be implemented in main agent
        return None

    async def verify_backup(
        self,
        backup_id: str
    ) -> bool:
        """Verify integrity of a backup."""
        logger.info(f"Verifying backup {backup_id}")
        # To be implemented in main agent
        return False

    async def restore_backup(
        self,
        backup_id: str,
        destination: DirectoryPath
    ) -> bool:
        """Restore from a backup."""
        logger.info(f"Restoring backup {backup_id}")
        # To be implemented in main agent
        return False

    async def run_security_scan(self) -> Dict:
        """Run security scan of the system."""
        logger.info("Running security scan")
        # To be implemented in main agent
        return {}

    async def format_code(
        self,
        file_path: FilePath
    ) -> bool:
        """Format code using configured formatter."""
        logger.info(f"Formatting {file_path}")
        # To be implemented in main agent
        return False

    async def run_tests(
        self,
        test_path: Optional[DirectoryPath] = None
    ) -> Dict:
        """Run tests and return results."""
        logger.info(f"Running tests in {test_path or 'all'}")
        # To be implemented in main agent
        return {}

    async def add_subscription(
        self,
        subscription: Subscription
    ) -> bool:
        """Add a new subscription to track."""
        logger.info(f"Adding subscription {subscription.name}")
        # To be implemented in main agent
        return False

    async def update_subscription(
        self,
        subscription_id: str,
        updates: Dict
    ) -> Optional[Subscription]:
        """Update subscription details."""
        logger.info(f"Updating subscription {subscription_id}")
        # To be implemented in main agent
        return None

    async def check_subscription_status(
        self,
        subscription_id: str
    ) -> Optional[SubscriptionStatus]:
        """Check current status of a subscription."""
        logger.info(f"Checking status of subscription {subscription_id}")
        # To be implemented in main agent
        return None

    async def renew_subscription(
        self,
        subscription_id: str
    ) -> bool:
        """Attempt to renew a subscription."""
        logger.info(f"Attempting to renew subscription {subscription_id}")
        # To be implemented in main agent
        return False

    def get_status(self) -> Dict:
        """Get current status of the agent."""
        return {
            "status": "operational",
            "config": self.config,
            "backup_dir": self.backup_dir.exists(),
            "metrics_dir": self.metrics_dir.exists()
        }

    def update_config(self, new_config: Dict) -> None:
        """Update agent configuration."""
        self.config.update(new_config)
        self.save_config()
        logger.info("Configuration updated") 