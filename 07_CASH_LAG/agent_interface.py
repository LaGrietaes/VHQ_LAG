from typing import Dict, List, Optional, Union
from pathlib import Path
import json
from loguru import logger
from datetime import datetime
from pydantic import BaseModel
import qrcode
from qrcode.image.pil import PilImage

class TransactionModel(BaseModel):
    """Model for financial transactions."""
    id: str
    timestamp: datetime
    amount: float
    currency: str
    source: str  # 'n26', 'patreon', 'paypal', 'stripe'
    status: str
    description: Optional[str] = None
    metadata: Optional[Dict] = None

class GoalModel(BaseModel):
    """Model for financial goals."""
    id: str
    name: str
    target_amount: float
    current_amount: float
    currency: str
    deadline: Optional[datetime] = None
    status: str  # 'active', 'completed', 'failed'
    description: Optional[str] = None

class CryptoAddressModel(BaseModel):
    """Model for crypto donation addresses."""
    network: str  # 'solana', 'ethereum', 'bitcoin', 'polygon'
    address: str
    qr_code_path: Optional[str] = None

class CashLAGInterface:
    """Interface for the CASH_LAG agent that handles financial operations."""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize the CASH_LAG interface.
        
        Args:
            config_path: Path to the configuration file
        """
        self.config_path = config_path
        self.load_config()
        
        # Setup logging
        logger.add(
            "Agent_Logs/cash_lag_log.txt",
            rotation="1 day",
            retention="1 week",
            level="INFO"
        )
        
        # Initialize paths
        self.qr_codes_dir = Path("crypto_qr_codes")
        self.qr_codes_dir.mkdir(exist_ok=True)
        
        for path in ["financial_report.txt", "signals.txt"]:
            Path(path).touch(exist_ok=True)

    def load_config(self) -> None:
        """Load configuration from JSON file."""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file {self.config_path} not found. Using defaults.")
            self.config = {
                "n26": {
                    "enabled": True,
                    "api_url": "https://api.n26.com",
                    "refresh_interval": 300  # 5 minutes
                },
                "patreon": {
                    "enabled": True,
                    "campaign_id": "",
                    "refresh_interval": 3600  # 1 hour
                },
                "crypto_addresses": {
                    "solana": "",
                    "ethereum": "",
                    "bitcoin": "",
                    "polygon": ""
                },
                "goals": {
                    "monthly_target": 1000,
                    "patron_target": 50
                },
                "reinvestment": {
                    "percentage": 20,
                    "threshold": 500
                }
            }
            self.save_config()

    def save_config(self) -> None:
        """Save current configuration to JSON file."""
        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=4)

    def get_transactions(
        self,
        source: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[TransactionModel]:
        """Get transactions from specified source.
        
        Args:
            source: Source of transactions ('n26', 'patreon', 'paypal', 'stripe')
            start_date: Start date for transaction query
            end_date: End date for transaction query
            
        Returns:
            List of transactions
        """
        logger.info(f"Fetching transactions from {source if source else 'all sources'}")
        # To be implemented in main agent
        return []

    def get_goals(self, status: Optional[str] = None) -> List[GoalModel]:
        """Get financial goals.
        
        Args:
            status: Filter goals by status ('active', 'completed', 'failed')
            
        Returns:
            List of goals
        """
        logger.info(f"Fetching goals with status {status if status else 'all'}")
        # To be implemented in main agent
        return []

    def create_goal(self, goal: GoalModel) -> bool:
        """Create a new financial goal.
        
        Args:
            goal: Goal model with details
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Creating new goal: {goal.name}")
        # To be implemented in main agent
        return True

    def update_goal(self, goal_id: str, updates: Dict) -> bool:
        """Update an existing goal.
        
        Args:
            goal_id: ID of the goal to update
            updates: Dictionary of updates to apply
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Updating goal {goal_id}")
        # To be implemented in main agent
        return True

    def generate_crypto_qr(self, network: str) -> Optional[str]:
        """Generate QR code for crypto address.
        
        Args:
            network: Cryptocurrency network ('solana', 'ethereum', 'bitcoin', 'polygon')
            
        Returns:
            Path to generated QR code image or None if address not configured
        """
        address = self.config["crypto_addresses"].get(network.lower())
        if not address:
            logger.warning(f"No address configured for {network}")
            return None
            
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(address)
        qr.make(fit=True)

        qr_path = self.qr_codes_dir / f"{network}_donation.png"
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(qr_path)
        
        logger.info(f"Generated QR code for {network} at {qr_path}")
        return str(qr_path)

    def get_crypto_addresses(self) -> List[CryptoAddressModel]:
        """Get list of crypto addresses with QR codes."""
        addresses = []
        for network, address in self.config["crypto_addresses"].items():
            if address:
                qr_path = self.generate_crypto_qr(network)
                addresses.append(CryptoAddressModel(
                    network=network,
                    address=address,
                    qr_code_path=qr_path
                ))
        return addresses

    def generate_financial_report(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> str:
        """Generate financial report for specified period.
        
        Args:
            start_date: Start date for report
            end_date: End date for report
            
        Returns:
            Path to generated report
        """
        logger.info(f"Generating financial report from {start_date} to {end_date}")
        # To be implemented in main agent
        return "financial_report.txt"

    def get_status(self) -> Dict:
        """Get current status of the agent.
        
        Returns:
            Dictionary with status information
        """
        return {
            "status": "operational",
            "config": self.config,
            "active_goals": len(self.get_goals(status="active")),
            "last_report": Path("financial_report.txt").stat().st_mtime if Path("financial_report.txt").exists() else None
        }

    def update_config(self, new_config: Dict) -> None:
        """Update agent configuration.
        
        Args:
            new_config: Dictionary with new configuration values
        """
        self.config.update(new_config)
        self.save_config()
        logger.info("Configuration updated") 