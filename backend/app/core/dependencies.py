"""
Dependency injection for FastAPI application.

Manages singleton instances of services.
"""

from typing import Optional
from functools import lru_cache

# Will be initialized at startup
_recommender_instance = None
_location_service_instance = None


def init_recommender():
    """Initialize the recommender system at application startup."""
    global _recommender_instance
    
    from app.services.recommender import VietnamTourismRecommender
    from app.core.config import settings
    
    _recommender_instance = VietnamTourismRecommender(
        checkpoint_dir=str(settings.CHECKPOINT_DIR),
        prefix=settings.MODEL_PREFIX
    )
    return _recommender_instance


def get_recommender():
    """Get the recommender instance (dependency injection)."""
    global _recommender_instance
    if _recommender_instance is None:
        raise RuntimeError("Recommender not initialized. Call init_recommender() first.")
    return _recommender_instance


def init_location_service():
    """Initialize the location service at application startup."""
    global _location_service_instance
    
    from app.services.geocoding import LocationService
    from app.core.config import settings
    
    _location_service_instance = LocationService(
        json_path=settings.PUBLIC_DIR / "map_locations.json"
    )
    return _location_service_instance


def get_location_service():
    """Get the location service instance (dependency injection)."""
    global _location_service_instance
    if _location_service_instance is None:
        raise RuntimeError("LocationService not initialized. Call init_location_service() first.")
    return _location_service_instance


@lru_cache()
def get_settings():
    """Get cached settings instance."""
    from core.config import settings
    return settings
