import os
import sys
import logging
from dev_agent import DevAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("dev_agent.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger('DEV_LAG_Startup')

def main():
    try:
        # Initialize the agent
        agent = DevAgent()
        logger.info("DEV_LAG Agent started successfully")
        
        # TODO: Add API/service endpoints for other agents to interact
        
        # Keep the agent running
        while True:
            # Process any pending requests
            pass
            
    except KeyboardInterrupt:
        logger.info("Shutting down DEV_LAG Agent...")
    except Exception as e:
        logger.error(f"Error in DEV_LAG Agent: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 