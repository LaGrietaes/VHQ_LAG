import os
import sys
import logging
import schedule
import time
from donna_agent import DonnaAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("donna_agent.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger('DONNA_LAG_Startup')

def schedule_tasks(agent):
    """Schedule recurring tasks"""
    schedule.every(1).hours.do(agent.monitor_agent_health)
    schedule.every().day.at("09:00").do(agent.manage_deadlines)

def main():
    try:
        # Initialize the agent
        agent = DonnaAgent()
        logger.info("DONNA_LAG Agent started successfully")
        
        # Schedule recurring tasks
        schedule_tasks(agent)
        
        # Keep the agent running
        while True:
            schedule.run_pending()
            time.sleep(60)
            
    except KeyboardInterrupt:
        logger.info("Shutting down DONNA_LAG Agent...")
    except Exception as e:
        logger.error(f"Error in DONNA_LAG Agent: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 