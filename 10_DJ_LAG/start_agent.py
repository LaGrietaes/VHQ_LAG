import os
import sys
import logging
from dj_agent import DJAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("dj_agent.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger('DJ_LAG_Startup')

def main():
    try:
        # Initialize the agent
        agent = DJAgent()
        logger.info("DJ_LAG Agent started successfully")
        
        # TODO: Add API/service endpoints for other agents to interact
        
        # Keep the agent running
        while True:
            # Process any pending requests
            pass
            
    except KeyboardInterrupt:
        logger.info("Shutting down DJ_LAG Agent...")
    except Exception as e:
        logger.error(f"Error in DJ_LAG Agent: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 