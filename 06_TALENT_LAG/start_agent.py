import os
import sys
import asyncio
from loguru import logger
from talent_agent import TalentLAGAgent

def setup_logging():
    """Setup logging configuration."""
    log_path = os.path.join("..", "Agent_Logs", "06_TALENT_LAG.log")
    
    # Remove default logger
    logger.remove()
    
    # Add file logger
    logger.add(
        log_path,
        rotation="1 day",
        retention="1 week",
        level="INFO",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
    )
    
    # Add stdout logger
    logger.add(
        sys.stdout,
        level="INFO",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
    )

async def main():
    """Main function to start the TALENT_LAG agent."""
    try:
        setup_logging()
        logger.info("Starting TALENT_LAG agent...")
        
        agent = TalentLAGAgent()
        await agent.run()
        
    except KeyboardInterrupt:
        logger.info("TALENT_LAG agent stopped by user")
    except Exception as e:
        logger.error(f"Error running TALENT_LAG agent: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 