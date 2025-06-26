import os
import sys
import psutil
import cpuinfo
import GPUtil
import asyncio
import aiosqlite
from datetime import datetime, timedelta
from pathlib import Path
import json
import shutil
import subprocess
from typing import Dict, List, Optional, Any
from loguru import logger
import docker
import nmap
import boto3
from crontab import CronTab
import pyzipper
import black
import pylint.lint
import pytest
import requests
from agent_interface import (
    ITLAGInterface,
    SystemStatus,
    BackupType,
    BackupStatus,
    AgentStatus,
    SystemMetrics,
    BackupConfig,
    BackupJob,
    DevelopmentTask,
    Subscription,
    SubscriptionStatus,
    SubscriptionType,
    SubscriptionProvider
)
import imaplib
import email
from email.header import decode_header
import paramiko

class SystemMonitor:
    """Handles system monitoring and metrics collection."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.thresholds = config["monitoring"]["alert_thresholds"]
        
        # Initialize Docker client if available
        try:
            self.docker_client = docker.from_env()
        except:
            self.docker_client = None
            logger.warning("Docker not available")
            
    async def get_metrics(self) -> SystemMetrics:
        """Collect current system metrics."""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory metrics
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # Disk metrics
            disk_usage = {}
            for partition in psutil.disk_partitions():
                try:
                    usage = psutil.disk_usage(partition.mountpoint)
                    disk_usage[partition.mountpoint] = usage.percent
                except:
                    continue
                    
            # Network I/O
            net_io = psutil.net_io_counters()
            network_metrics = {
                "bytes_sent": net_io.bytes_sent,
                "bytes_recv": net_io.bytes_recv
            }
            
            # GPU metrics if available
            gpu_percent = None
            try:
                gpus = GPUtil.getGPUs()
                if gpus:
                    gpu_percent = gpus[0].load * 100
            except:
                pass
                
            # Process count
            process_count = len(psutil.pids())
            
            return SystemMetrics(
                cpu_usage=cpu_percent,
                memory_usage=memory_percent,
                disk_usage=disk_usage,
                network_io=network_metrics,
                gpu_usage=gpu_percent,
                process_count=process_count,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error collecting metrics: {e}")
            return None
            
    def check_thresholds(self, metrics: SystemMetrics) -> List[str]:
        """Check if any metrics exceed thresholds."""
        warnings = []
        
        if metrics.cpu_usage > self.thresholds["cpu_usage"]:
            warnings.append(f"CPU usage high: {metrics.cpu_usage}%")
            
        if metrics.memory_usage > self.thresholds["memory_usage"]:
            warnings.append(f"Memory usage high: {metrics.memory_usage}%")
            
        for mount, usage in metrics.disk_usage.items():
            if usage > self.thresholds["disk_usage"]:
                warnings.append(f"Disk usage high on {mount}: {usage}%")
                
        return warnings

class BackupManager:
    """Handles backup operations."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.backup_dir = Path(config["backup"]["local_backup_path"])
        self.backup_dir.mkdir(exist_ok=True)
        
        # Initialize S3 client if configured
        if config["backup"]["cloud_provider"] == "s3":
            self.s3 = boto3.client('s3')
        else:
            self.s3 = None
            
    async def create_backup(self, config: BackupConfig) -> BackupJob:
        """Create a new backup."""
        try:
            backup_id = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            job = BackupJob(
                id=backup_id,
                config=config,
                status=BackupStatus.IN_PROGRESS,
                started_at=datetime.now()
            )
            
            # Create backup archive
            backup_path = self.backup_dir / f"{backup_id}.zip"
            
            if config.encryption:
                # Create encrypted zip
                with pyzipper.AESZipFile(
                    backup_path,
                    'w',
                    compression=pyzipper.ZIP_LZMA,
                    encryption=pyzipper.WZ_AES
                ) as zf:
                    zf.pwd = self.config["backup"]["encryption_key"].encode()
                    
                    if config.type == BackupType.FULL:
                        # Add all files
                        for file in config.source_path.rglob('*'):
                            if file.is_file():
                                zf.write(file, file.relative_to(config.source_path))
                    else:
                        # Add only changed files for incremental/differential
                        # To be implemented
                        pass
            else:
                # Create regular zip
                shutil.make_archive(
                    str(backup_path.with_suffix('')),
                    'zip',
                    config.source_path
                )
                
            # Upload to cloud if configured
            if isinstance(config.destination_path, str) and self.s3:
                with open(backup_path, 'rb') as f:
                    self.s3.upload_fileobj(f, self.config["backup"]["bucket"], backup_id)
                    
            job.status = BackupStatus.COMPLETED
            job.completed_at = datetime.now()
            job.size_bytes = backup_path.stat().st_size
            
            return job
            
        except Exception as e:
            logger.error(f"Backup failed: {e}")
            if job:
                job.status = BackupStatus.FAILED
                job.error_message = str(e)
            return job

class DevelopmentTools:
    """Handles development-related tasks."""
    
    def __init__(self, config: Dict):
        self.config = config
        
    async def format_code(self, file_path: Path) -> bool:
        """Format code using black."""
        try:
            if self.config["development"]["code_style"] == "black":
                black.format_file_in_place(
                    file_path,
                    fast=False,
                    mode=black.FileMode()
                )
            return True
        except Exception as e:
            logger.error(f"Error formatting {file_path}: {e}")
            return False
            
    async def run_tests(self, test_path: Optional[Path] = None) -> Dict:
        """Run pytest on specified path."""
        try:
            args = ["-v"]
            if test_path:
                args.append(str(test_path))
                
            result = pytest.main(args)
            
            return {
                "success": result == 0,
                "exit_code": result
            }
        except Exception as e:
            logger.error(f"Error running tests: {e}")
            return {"success": False, "error": str(e)}

class NASManager:
    """Handles NAS connectivity and NoIP updates."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.nas_config = config["nas"]
        self.ssh_client = None
        
    async def connect(self) -> bool:
        """Establish SSH connection to NAS."""
        try:
            self.ssh_client = paramiko.SSHClient()
            self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            self.ssh_client.connect(
                self.nas_config["host"],
                port=self.nas_config["port"],
                username=self.nas_config["username"],
                password=self.nas_config["password"]
            )
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to NAS: {e}")
            return False
            
    def disconnect(self):
        """Close SSH connection."""
        if self.ssh_client:
            self.ssh_client.close()
            
    async def check_noip_status(self) -> Dict:
        """Check NoIP client status on NAS."""
        if not await self.connect():
            return {"status": "error", "message": "Cannot connect to NAS"}
            
        try:
            # Check if NoIP client is running
            cmd = "ps aux | grep noip"
            stdin, stdout, stderr = self.ssh_client.exec_command(cmd)
            output = stdout.read().decode()
            
            # Check NoIP logs
            cmd = "tail -n 50 /var/log/noip.log"  # Adjust path as needed
            stdin, stdout, stderr = self.ssh_client.exec_command(cmd)
            logs = stdout.read().decode()
            
            return {
                "status": "active" if "noip2" in output else "inactive",
                "logs": logs
            }
            
        except Exception as e:
            logger.error(f"Error checking NoIP status: {e}")
            return {"status": "error", "message": str(e)}
            
        finally:
            self.disconnect()
            
    async def update_noip_config(self) -> bool:
        """Update NoIP configuration on NAS."""
        if not await self.connect():
            return False
            
        try:
            # Stop NoIP client
            cmd = "sudo service noip2 stop"
            stdin, stdout, stderr = self.ssh_client.exec_command(cmd)
            
            # Reconfigure NoIP
            cmd = f"sudo noip2 -C -c /tmp/no-ip2.conf -U {self.config['subscriptions']['providers']['noip']['update_interval']} -u {self.config['subscriptions']['providers']['noip']['username']} -p {self.config['subscriptions']['providers']['noip']['password']}"
            stdin, stdout, stderr = self.ssh_client.exec_command(cmd)
            
            # Start NoIP client
            cmd = "sudo service noip2 start"
            stdin, stdout, stderr = self.ssh_client.exec_command(cmd)
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating NoIP config: {e}")
            return False
            
        finally:
            self.disconnect()

class EmailMonitor:
    """Monitors email for NoIP notifications."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.email_config = config["email"]
        
    async def check_noip_emails(self) -> List[Dict]:
        """Check for NoIP confirmation emails."""
        try:
            # Connect to email server
            mail = imaplib.IMAP4_SSL(self.email_config["imap_server"])
            mail.login(self.email_config["username"], self.email_config["password"])
            mail.select("INBOX")
            
            # Search for NoIP emails (adjust search criteria as needed)
            search_criteria = '(FROM "no-reply@noip.com" UNSEEN)'
            _, message_numbers = mail.search(None, search_criteria)
            
            notifications = []
            for num in message_numbers[0].split():
                _, msg_data = mail.fetch(num, "(RFC822)")
                email_body = msg_data[0][1]
                email_message = email.message_from_bytes(email_body)
                
                subject = decode_header(email_message["subject"])[0][0]
                if isinstance(subject, bytes):
                    subject = subject.decode()
                
                # Extract confirmation link if present
                confirmation_link = None
                if email_message.is_multipart():
                    for part in email_message.walk():
                        if part.get_content_type() == "text/html":
                            body = part.get_payload(decode=True).decode()
                            # Extract confirmation link (adjust based on email format)
                            if "confirm your hostname" in body.lower():
                                # Extract link using regex or parsing
                                pass
                
                notifications.append({
                    "subject": subject,
                    "date": email_message["date"],
                    "confirmation_link": confirmation_link
                })
                
                # Mark as read
                mail.store(num, '+FLAGS', '\\Seen')
            
            mail.logout()
            return notifications
            
        except Exception as e:
            logger.error(f"Error checking NoIP emails: {e}")
            return []

class SubscriptionManager:
    """Handles software subscription management."""
    
    def __init__(self, config: Dict):
        self.config = config
        self.providers = {
            "noip": self._check_noip,
            "godaddy": self._check_godaddy,
            "cloudflare": self._check_cloudflare
        }
        self.nas_manager = NASManager(config)
        self.email_monitor = EmailMonitor(config)
        
    async def _check_noip(self, subscription: Subscription) -> SubscriptionStatus:
        """Check NoIP subscription status."""
        try:
            # Check NAS connectivity and NoIP client status
            nas_status = await self.nas_manager.check_noip_status()
            if nas_status["status"] == "error":
                logger.error(f"NAS connectivity issue: {nas_status['message']}")
                return SubscriptionStatus.DEGRADED
                
            if nas_status["status"] == "inactive":
                logger.warning("NoIP client inactive on NAS")
                # Attempt to reconfigure
                if await self.nas_manager.update_noip_config():
                    logger.info("Successfully reconfigured NoIP client")
                else:
                    logger.error("Failed to reconfigure NoIP client")
                    return SubscriptionStatus.DEGRADED
            
            # Check for confirmation emails
            notifications = await self.email_monitor.check_noip_emails()
            for notification in notifications:
                if "confirm your hostname" in notification["subject"].lower():
                    logger.warning(f"NoIP hostname requires confirmation: {notification['subject']}")
                    return SubscriptionStatus.EXPIRING_SOON
            
            # Original API check
            url = "https://api.noip.com/v1/account"
            headers = {
                "Authorization": f"Bearer {subscription.credentials['api_key']}"
            }
            
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                
                subscription.end_date = datetime.fromisoformat(data["subscription_end"])
                subscription.next_renewal = subscription.end_date
                
                days_until_expiry = (subscription.end_date - datetime.now()).days
                if days_until_expiry <= subscription.notification_days:
                    return SubscriptionStatus.EXPIRING_SOON
                return SubscriptionStatus.ACTIVE
            elif response.status_code == 401:
                return SubscriptionStatus.EXPIRED
            else:
                logger.error(f"NoIP API error: {response.status_code}")
                return SubscriptionStatus.DEGRADED
                
        except Exception as e:
            logger.error(f"Error checking NoIP subscription: {e}")
            return SubscriptionStatus.DEGRADED
            
    async def _check_godaddy(self, subscription: Subscription) -> SubscriptionStatus:
        """Check GoDaddy subscription status."""
        # Similar implementation for GoDaddy
        pass
        
    async def _check_cloudflare(self, subscription: Subscription) -> SubscriptionStatus:
        """Check Cloudflare subscription status."""
        # Similar implementation for Cloudflare
        pass
        
    async def check_status(self, subscription: Subscription) -> SubscriptionStatus:
        """Check subscription status with provider."""
        if subscription.provider.value in self.providers:
            return await self.providers[subscription.provider.value](subscription)
        return None
        
    async def attempt_renewal(self, subscription: Subscription) -> bool:
        """Attempt to renew a subscription."""
        try:
            if not subscription.auto_renew:
                logger.warning(f"Auto-renewal disabled for {subscription.name}")
                return False
                
            if subscription.provider.value == "noip":
                # NoIP renewal API endpoint
                url = "https://api.noip.com/v1/renew"
                headers = {
                    "Authorization": f"Bearer {subscription.credentials['api_key']}"
                }
                data = {
                    "subscription_id": subscription.id,
                    "period_days": subscription.renewal_period_days
                }
                
                response = requests.post(url, headers=headers, json=data)
                if response.status_code == 200:
                    logger.info(f"Successfully renewed {subscription.name}")
                    return True
                else:
                    logger.error(f"Failed to renew {subscription.name}: {response.status_code}")
                    return False
                    
            # Add renewal logic for other providers
            return False
            
        except Exception as e:
            logger.error(f"Error renewing subscription: {e}")
            return False

class ITLAGAgent:
    """Main IT_LAG agent for system management."""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize the IT_LAG agent."""
        self.interface = ITLAGInterface(config_path)
        self.config = self.interface.config
        
        # Initialize components
        self.monitor = SystemMonitor(self.config)
        self.backup = BackupManager(self.config)
        self.dev_tools = DevelopmentTools(self.config)
        
        # Initialize database
        self.db_path = "data/it_lag.db"
        
        # Add subscription manager
        self.subscription_mgr = SubscriptionManager(self.config)
        
    async def initialize(self):
        """Initialize the agent."""
        async with aiosqlite.connect(self.db_path) as db:
            # Metrics table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS metrics (
                    timestamp TIMESTAMP PRIMARY KEY,
                    metrics JSON NOT NULL
                )
            """)
            
            # Backup jobs table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS backup_jobs (
                    id TEXT PRIMARY KEY,
                    config JSON NOT NULL,
                    status TEXT NOT NULL,
                    started_at TIMESTAMP NOT NULL,
                    completed_at TIMESTAMP,
                    size_bytes INTEGER,
                    error_message TEXT
                )
            """)
            
            # Development tasks table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS dev_tasks (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    priority INTEGER NOT NULL,
                    assigned_to TEXT,
                    status TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    updated_at TIMESTAMP NOT NULL,
                    due_date TIMESTAMP,
                    related_files JSON
                )
            """)
            
            # Subscriptions table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS subscriptions (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    status TEXT NOT NULL,
                    credentials JSON,
                    start_date TIMESTAMP NOT NULL,
                    end_date TIMESTAMP NOT NULL,
                    auto_renew BOOLEAN NOT NULL,
                    renewal_price REAL,
                    renewal_period_days INTEGER NOT NULL,
                    last_renewal TIMESTAMP,
                    next_renewal TIMESTAMP,
                    notification_days INTEGER NOT NULL,
                    metadata JSON
                )
            """)
            
            await db.commit()
            
        logger.info("IT_LAG agent initialized")
        
    async def store_metrics(self, metrics: SystemMetrics):
        """Store metrics in database."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO metrics (timestamp, metrics) VALUES (?, ?)",
                (metrics.timestamp.isoformat(), json.dumps(metrics.dict()))
            )
            await db.commit()
            
    async def cleanup_old_metrics(self):
        """Remove metrics older than retention period."""
        retention = datetime.now() - timedelta(
            seconds=self.config["monitoring"]["metrics_retention"]
        )
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "DELETE FROM metrics WHERE timestamp < ?",
                (retention.isoformat(),)
            )
            await db.commit()
            
    async def add_subscription(self, subscription: Subscription) -> bool:
        """Add a new subscription to track."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    """
                    INSERT INTO subscriptions (
                        id, name, type, provider, status, credentials,
                        start_date, end_date, auto_renew, renewal_price,
                        renewal_period_days, last_renewal, next_renewal,
                        notification_days, metadata
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        subscription.id,
                        subscription.name,
                        subscription.type.value,
                        subscription.provider.value,
                        subscription.status.value,
                        json.dumps(subscription.credentials) if subscription.credentials else None,
                        subscription.start_date.isoformat(),
                        subscription.end_date.isoformat(),
                        subscription.auto_renew,
                        subscription.renewal_price,
                        subscription.renewal_period_days,
                        subscription.last_renewal.isoformat() if subscription.last_renewal else None,
                        subscription.next_renewal.isoformat() if subscription.next_renewal else None,
                        subscription.notification_days,
                        json.dumps(subscription.metadata) if subscription.metadata else None
                    )
                )
                await db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Error adding subscription: {e}")
            return False
            
    async def check_subscriptions(self):
        """Check all subscription statuses and handle renewals."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                async with db.execute("SELECT * FROM subscriptions") as cursor:
                    async for row in cursor:
                        subscription = Subscription(
                            id=row['id'],
                            name=row['name'],
                            type=SubscriptionType(row['type']),
                            provider=SubscriptionProvider(row['provider']),
                            status=SubscriptionStatus(row['status']),
                            credentials=json.loads(row['credentials']) if row['credentials'] else None,
                            start_date=datetime.fromisoformat(row['start_date']),
                            end_date=datetime.fromisoformat(row['end_date']),
                            auto_renew=row['auto_renew'],
                            renewal_price=row['renewal_price'],
                            renewal_period_days=row['renewal_period_days'],
                            last_renewal=datetime.fromisoformat(row['last_renewal']) if row['last_renewal'] else None,
                            next_renewal=datetime.fromisoformat(row['next_renewal']) if row['next_renewal'] else None,
                            notification_days=row['notification_days'],
                            metadata=json.loads(row['metadata']) if row['metadata'] else None
                        )
                        
                        # Check status
                        new_status = await self.subscription_mgr.check_status(subscription)
                        if new_status:
                            # Update status in database
                            await db.execute(
                                "UPDATE subscriptions SET status = ? WHERE id = ?",
                                (new_status.value, subscription.id)
                            )
                            
                            # Handle expiring subscriptions
                            if new_status == SubscriptionStatus.EXPIRING_SOON:
                                if subscription.auto_renew:
                                    # Attempt renewal
                                    if await self.subscription_mgr.attempt_renewal(subscription):
                                        await db.execute(
                                            """
                                            UPDATE subscriptions 
                                            SET status = ?, last_renewal = ?, next_renewal = ?
                                            WHERE id = ?
                                            """,
                                            (
                                                SubscriptionStatus.ACTIVE.value,
                                                datetime.now().isoformat(),
                                                (datetime.now() + timedelta(days=subscription.renewal_period_days)).isoformat(),
                                                subscription.id
                                            )
                                        )
                                else:
                                    logger.warning(f"Subscription {subscription.name} expiring soon, auto-renew disabled")
                                    
                await db.commit()
                
        except Exception as e:
            logger.error(f"Error checking subscriptions: {e}")
            
    async def run(self):
        """Run the agent's main loop."""
        try:
            await self.initialize()
            
            while True:
                # Collect and store metrics
                metrics = await self.monitor.get_metrics()
                if metrics:
                    await self.store_metrics(metrics)
                    
                    # Check thresholds and log warnings
                    warnings = self.monitor.check_thresholds(metrics)
                    for warning in warnings:
                        logger.warning(warning)
                        
                # Cleanup old metrics
                await self.cleanup_old_metrics()
                
                # Check subscriptions daily
                if datetime.now().hour == 0:  # Run at midnight
                    await self.check_subscriptions()
                
                await asyncio.sleep(self.config["monitoring"]["interval"])
                
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
            raise 