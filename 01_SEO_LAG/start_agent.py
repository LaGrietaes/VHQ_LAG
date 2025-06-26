import os
import sys
import logging
import schedule
import time
from seo_agent import SEOAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("seo_agent.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger('SEO_LAG_Startup')

def schedule_tasks(agent):
    """Schedule recurring tasks"""
    schedule.every().day.at("02:00").do(agent.analyze_competition, "")
    schedule.every().day.at("03:00").do(agent.generate_content_suggestions, {})

def main():
    try:
        # Initialize the agent
        agent = SEOAgent()
        logger.info("SEO_LAG Agent started successfully")
        
        # Schedule recurring tasks
        schedule_tasks(agent)
        
        # Keep the agent running
        while True:
            schedule.run_pending()
            time.sleep(60)
            
    except KeyboardInterrupt:
        logger.info("Shutting down SEO_LAG Agent...")
    except Exception as e:
        logger.error(f"Error in SEO_LAG Agent: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 