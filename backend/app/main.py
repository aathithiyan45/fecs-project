from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
from app.api.routes import router
from app.api.websocket import websocket_manager
from app.mqtt_handler import mqtt_handler
from app.database import engine, Base

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FECS Backend API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

# Startup event
@app.on_event("startup")
async def startup_event():
    mqtt_handler.set_websocket_manager(websocket_manager)
    asyncio.create_task(mqtt_handler.start())
    logging.info("FECS Backend started")

@app.get("/")
async def root():
    return {"message": "FECS Backend API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
