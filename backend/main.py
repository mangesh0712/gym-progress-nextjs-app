"""
Gym Progress Tracker API - FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

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

# Configure CORS
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://yourdomain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
