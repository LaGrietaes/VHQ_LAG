import os
import sys
import logging
import schedule
import time
from ads_agent import AdsAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("ads_agent.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger('ADS_LAG_Startup')

def schedule_tasks(agent):
    """Schedule recurring tasks"""
    schedule.every().day.at("01:00").do(agent.analyze_traffic)
    schedule.every().monday.do(agent.generate_content_strategy)

def main():
    try:
        # Initialize the agent
        agent = AdsAgent()
        logger.info("ADS_LAG Agent started successfully")
        
        # Schedule recurring tasks
        schedule_tasks(agent)
        
        # Keep the agent running
        while True:
            schedule.run_pending()
            time.sleep(60)
            
    except KeyboardInterrupt:
        logger.info("Shutting down ADS_LAG Agent...")
    except Exception as e:
        logger.error(f"Error in ADS_LAG Agent: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 