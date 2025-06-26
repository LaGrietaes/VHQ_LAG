import asyncio
from loguru import logger
from it_agent import ITLAGAgent

async def main():
    """Main entry point for the IT_LAG agent."""
    try:
        # Initialize and run the agent
        agent = ITLAGAgent()
        await agent.run()
    except Exception as e:
        logger.error(f"Error running IT_LAG agent: {e}")
        raise

if __name__ == "__main__":
    # Configure logging
    logger.add(
        "../Agent_Logs/09_IT_LAG.log",
        rotation="1 day",
        retention="1 week",
        level="INFO"
    )
    
    # Run the agent
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("IT_LAG agent stopped by user")
    except Exception as e:
        logger.error(f"IT_LAG agent crashed: {e}")
        raise 