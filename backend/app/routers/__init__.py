"""Routers module - API endpoints."""

from routers.health import router as health_router
from routers.recommendations import router as recommendations_router
from routers.utilities import router as utilities_router

__all__ = [
    "health_router",
    "recommendations_router",
    "utilities_router",
]
