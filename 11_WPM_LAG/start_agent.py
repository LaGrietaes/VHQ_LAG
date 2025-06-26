import os
import sys
import logging
import schedule
import time
from wpm_agent import WPMAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("wpm_agent.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger('WPM_LAG_Startup')

def schedule_tasks(agent):
    """Schedule recurring tasks"""
    schedule.every().day.at("00:00").do(agent.check_site_health)
    schedule.every().week.do(agent.backup_site)
    schedule.every().day.at("04:00").do(agent.update_plugins)

def main():
    try:
        # Initialize the agent
        agent = WPMAgent()
        logger.info("WPM_LAG Agent started successfully")
        
        # Schedule recurring tasks
        schedule_tasks(agent)
        
        # Keep the agent running
        while True:
            schedule.run_pending()
            time.sleep(60)
            
    except KeyboardInterrupt:
        logger.info("Shutting down WPM_LAG Agent...")
    except Exception as e:
        logger.error(f"Error in WPM_LAG Agent: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 