import os
import sys
import logging
import asyncio
import schedule
import time
from cm_agent import CommunityManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("cm_agent.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger('CM_LAG_Startup')

async def schedule_tasks(agent):
    """Schedule recurring tasks"""
    # Monitor YouTube comments every 5 minutes
    schedule.every(5).minutes.do(
        lambda: asyncio.create_task(
            agent.handle_youtube_comments("")
        )
    )
    
    # Check social media engagement every 15 minutes
    schedule.every(15).minutes.do(
        lambda: asyncio.create_task(
            agent.manage_social_media("all", "check_engagement", {})
        )
    )
    
    # Generate engagement reports every 6 hours
    schedule.every(6).hours.do(
        lambda: asyncio.create_task(
            agent.analyze_engagement("all", "6h")
        )
    )

async def run_scheduler():
    """Run scheduled tasks"""
    while True:
        schedule.run_pending()
        await asyncio.sleep(1)

async def main():
    try:
        # Initialize the agent
        agent = CommunityManager()
        logger.info("CM_LAG Agent started successfully")
        
        # Initialize session
        await agent.initialize_session()
        
        # Schedule recurring tasks
        await schedule_tasks(agent)
        
        # Run the scheduler
        await run_scheduler()
            
    except KeyboardInterrupt:
        logger.info("Shutting down CM_LAG Agent...")
        await agent.close_session()
    except Exception as e:
        logger.error(f"Error in CM_LAG Agent: {e}")
        await agent.close_session()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 