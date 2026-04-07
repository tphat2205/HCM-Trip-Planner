"""Core module - Configuration and dependencies."""

from core.config import settings
from core.dependencies import (
    init_recommender,
    get_recommender,
    init_location_service,
    get_location_service,
    get_settings,
)

__all__ = [
    "settings",
    "init_recommender",
    "get_recommender", 
    "init_location_service",
    "get_location_service",
    "get_settings",
]
