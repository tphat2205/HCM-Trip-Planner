"""Routers module - API endpoints."""

from app.routers.health import router as health_router
from app.routers.recommendations import router as recommendations_router
from app.routers.utilities import router as utilities_router

__all__ = [
    "health_router",
    "recommendations_router",
    "utilities_router",
]
