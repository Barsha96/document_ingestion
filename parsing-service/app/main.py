from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import parse
from app.models.schemas import HealthResponse

app = FastAPI(
    title="Docling Parsing Service",
    description="Microservice for layout-aware document parsing using Docling",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(parse.router, prefix="", tags=["parsing"])


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "docling-parsing-service",
    }


@app.get("/")
async def root():
    return {
        "message": "Docling Parsing Service",
        "docs": "/docs",
        "health": "/health",
    }
