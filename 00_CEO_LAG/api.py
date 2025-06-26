from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from datetime import datetime

from ceo_agent import CEOAgent

app = FastAPI(
    title="VHQ_LAG CEO Agent API",
    description="API REST para el CEO Agent",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instancia global del CEO Agent
ceo_agent = CEOAgent()

@app.get("/")
async def root():
    return {"message": "VHQ_LAG CEO Agent API"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/system/status")
async def get_system_status():
    return ceo_agent.get_system_status()

@app.get("/agents")
async def get_agents():
    return [
        {
            "id": "07_MEDIA_LAG",
            "name": "Media Librarian",
            "status": "active",
            "health": "good",
            "last_activity": datetime.now().isoformat(),
            "uptime": "2h 30m",
            "tasks_completed": 100,
            "success_rate": 0.95
        },
        {
            "id": "00_CEO_LAG",
            "name": "CEO Agent",
            "status": "active",
            "health": "good",
            "last_activity": datetime.now().isoformat(),
            "uptime": "2h 30m",
            "tasks_completed": 50,
            "success_rate": 0.90
        }
    ]

@app.get("/tasks")
async def get_tasks():
    return {
        "pending": [t.__dict__ for t in ceo_agent.task_queue if t.status == "pending"],
        "completed": [t.__dict__ for t in ceo_agent.task_queue if t.status == "completed"]
    }

@app.get("/metrics")
async def get_metrics():
    return {
        "system_load": [
            {"timestamp": datetime.now().isoformat(), "value": 0.45},
            {"timestamp": datetime.now().isoformat(), "value": 0.48},
            {"timestamp": datetime.now().isoformat(), "value": 0.52}
        ],
        "memory_usage": [
            {"timestamp": datetime.now().isoformat(), "value": 0.65},
            {"timestamp": datetime.now().isoformat(), "value": 0.67},
            {"timestamp": datetime.now().isoformat(), "value": 0.70}
        ],
        "task_throughput": [
            {"timestamp": datetime.now().isoformat(), "value": 10},
            {"timestamp": datetime.now().isoformat(), "value": 12},
            {"timestamp": datetime.now().isoformat(), "value": 15}
        ]
    } 