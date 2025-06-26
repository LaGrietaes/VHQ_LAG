import asyncio
from loguru import logger
from law_agent import LawLAGAgent

async def main():
    """Main entry point for the LAW_LAG agent."""
    try:
        # Initialize and run the agent
        agent = LawLAGAgent()
        await agent.run()
    except Exception as e:
        logger.error(f"Error running LAW_LAG agent: {e}")
        raise

if __name__ == "__main__":
    # Configure logging
    logger.add(
        "../Agent_Logs/08_LAW_LAG.log",
        rotation="1 day",
        retention="1 week",
        level="INFO"
    )
    
    # Run the agent
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("LAW_LAG agent stopped by user")
    except Exception as e:
        logger.error(f"LAW_LAG agent crashed: {e}")
        raise 