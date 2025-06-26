#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from loguru import logger
import json

def setup_environment():
    """Setup the environment for the agent."""
    # Ensure we're in the correct directory
    os.chdir(Path(__file__).parent)
    
    # Setup logging
    log_path = Path("../Agent_Logs")
    log_path.mkdir(parents=True, exist_ok=True)
    
    # Configure logging
    logger.add(
        log_path / "clip_lag_log.txt",
        rotation="1 day",
        retention="1 week",
        level="INFO"
    )
    
    # Check for required directories
    required_dirs = [
        "output/short",
        "output/music",
        "output/effects",
        "output/previews"
    ]
    
    for dir_path in required_dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
    
    # Check for config file
    if not Path("config.json").exists():
        logger.warning("Config file not found, will use defaults")
    
    # Check for required dependencies
    try:
        import cv2
        import numpy
        import moviepy
        import whisper
    except ImportError as e:
        logger.error(f"Missing required dependency: {e}")
        logger.info("Please install required packages: pip install -r requirements.txt")
        sys.exit(1)

def main():
    """Main entry point for the CLIP_LAG agent."""
    try:
        setup_environment()
        logger.info("Starting CLIP_LAG agent...")
        
        from clip_agent import ClipLAGAgent
        agent = ClipLAGAgent()
        agent.run()
        
    except KeyboardInterrupt:
        logger.info("CLIP_LAG agent shutting down...")
    except Exception as e:
        logger.error(f"Error starting agent: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 