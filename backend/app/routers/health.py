"""
Health check endpoint.

Provides system status information.
"""

from fastapi import APIRouter, Depends
from app.models.schemas import HealthResponse
from app.core.config import settings
from app.core.dependencies import get_recommender

router = APIRouter(tags=["Health"])


@router.get("/", response_model=HealthResponse)
@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Kiểm tra trạng thái hệ thống.
    
    Returns:
        HealthResponse với thông tin trạng thái
    """
    try:
        recommender = get_recommender()
        model_loaded = recommender is not None
        total_items = recommender.total_items if model_loaded else 0
    except Exception:
        model_loaded = False
        total_items = 0
    
    return HealthResponse(
        status="healthy" if model_loaded else "degraded",
        version=settings.APP_VERSION,
        model_loaded=model_loaded,
        total_items=total_items
    )
