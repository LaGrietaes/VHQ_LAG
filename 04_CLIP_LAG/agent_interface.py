from typing import Dict, List, Optional, Tuple
from pathlib import Path
import json
from loguru import logger

class ClipLAGInterface:
    """Interface for the CLIP_LAG agent that handles video clip generation."""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize the CLIP_LAG interface.
        
        Args:
            config_path: Path to the configuration file
        """
        self.config_path = config_path
        self.load_config()
        
        # Setup logging
        logger.add(
            "Agent_Logs/clip_lag_log.txt",
            rotation="1 day",
            retention="1 week",
            level="INFO"
        )

    def load_config(self) -> None:
        """Load configuration from JSON file."""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file {self.config_path} not found. Using defaults.")
            self.config = {
                "output_dirs": {
                    "short": "output/short",
                    "music": "output/music",
                    "effects": "output/effects",
                    "previews": "output/previews"
                },
                "video_settings": {
                    "target_resolution": (1080, 1920),  # 9:16 ratio
                    "fps": 30,
                    "min_duration": 15,  # seconds
                    "max_duration": 60   # seconds
                }
            }
            self.save_config()

    def save_config(self) -> None:
        """Save current configuration to JSON file."""
        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=4)

    def request_clip_generation(
        self,
        video_path: str,
        num_clips: int = 3,
        reframe_options: Optional[Dict] = None
    ) -> List[str]:
        """Request generation of clips from a video.
        
        Args:
            video_path: Path to the source video
            num_clips: Number of clips to generate
            reframe_options: Dictionary with reframe options (center/pan/zoom)
            
        Returns:
            List of paths to generated preview clips
        """
        logger.info(f"Clip generation requested for {video_path}")
        # This will be implemented in the main agent
        return []

    def approve_previews(self, preview_paths: List[str]) -> List[str]:
        """Approve preview clips for final processing.
        
        Args:
            preview_paths: List of paths to preview clips to approve
            
        Returns:
            List of paths to final processed clips
        """
        logger.info(f"Approving previews: {preview_paths}")
        # This will be implemented in the main agent
        return []

    def request_music_sync(
        self,
        clip_paths: List[str],
        music_style: Optional[str] = None
    ) -> List[Tuple[str, str]]:
        """Request music synchronization for clips.
        
        Args:
            clip_paths: List of paths to clips
            music_style: Optional preferred music style
            
        Returns:
            List of tuples (clip_path, music_path)
        """
        logger.info(f"Music sync requested for clips: {clip_paths}")
        # This will be implemented in the main agent
        return []

    def get_status(self) -> Dict:
        """Get current status of the agent.
        
        Returns:
            Dictionary with status information
        """
        return {
            "status": "operational",
            "config": self.config,
            "output_dirs": {
                dir_name: str(Path(dir_path).absolute())
                for dir_name, dir_path in self.config["output_dirs"].items()
            }
        }

    def update_config(self, new_config: Dict) -> None:
        """Update agent configuration.
        
        Args:
            new_config: Dictionary with new configuration values
        """
        self.config.update(new_config)
        self.save_config()
        logger.info("Configuration updated") 