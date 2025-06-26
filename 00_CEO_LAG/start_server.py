import asyncio
import uvicorn
from api import app
from ceo_agent import CEOAgent

async def start_ceo_agent():
    """Inicia el CEO Agent en segundo plano"""
    ceo = CEOAgent()
    await ceo.run_main_loop()

async def start_api_server():
    """Inicia el servidor FastAPI"""
    config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="info")
    server = uvicorn.Server(config)
    await server.serve()

async def main():
    """Función principal que inicia ambos servicios"""
    # Crear las tareas
    ceo_task = asyncio.create_task(start_ceo_agent())
    api_task = asyncio.create_task(start_api_server())
    
    # Esperar a que ambas tareas terminen (no deberían terminar en operación normal)
    try:
        await asyncio.gather(ceo_task, api_task)
    except KeyboardInterrupt:
        print("\nDeteniendo servicios...")
    except Exception as e:
        print(f"\nError: {e}")
    finally:
        print("Servicios detenidos.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServicio detenido por el usuario.") 