"""
Gym Progress Tracker API - FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import routers
from routers import auth, workouts, exercises

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Gym Progress Tracker API",
    description="API for tracking gym workouts and progress",
    version="1.0.0",
)

# Include routers
app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(exercises.router)

# Configure CORS - read from environment for production flexibility
cors_origins = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> JSONResponse:
    """
    Health check endpoint to verify API is running.

    Returns:
        JSONResponse with status "healthy"
    """
    return JSONResponse({"status": "healthy"}, status_code=200)


@app.on_event("startup")
async def startup_event() -> None:
    """
    Startup event - initialize resources.
    """
    logger.info("Starting Gym Progress Tracker API")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """
    Shutdown event - cleanup resources.
    """
    logger.info("Shutting down Gym Progress Tracker API")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
