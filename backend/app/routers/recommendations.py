"""
Recommendation API endpoints.

Main endpoint for travel recommendations.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid
import re

from models.schemas import (
    RecommendationRequest, 
    RecommendationResponse,
    PlaceItem,
)
from core.dependencies import get_recommender, get_location_service

router = APIRouter(prefix="/api", tags=["Recommendations"])


def _extract_district(address: str) -> str:
    """Extract district from address string."""
    if not isinstance(address, str):
        return None
    
    parts = address.split(',')
    for part in parts:
        part = part.strip()
        if any(keyword in part for keyword in ["Quận", "Huyện", "Thị xã", "Thành phố"]):
            return part.strip()
    return None


def _convert_place_to_response(
    place_dict: dict, 
    location_service
) -> PlaceItem:
    """Convert raw place dict to PlaceItem with coordinates."""
    name = place_dict.get('Name', '')
    address = place_dict.get('Address', '')
    
    # Get coordinates from location service
    coords = location_service.get_coordinates(name) if location_service else None
    lat = coords['lat'] if coords else None
    lng = coords['lng'] if coords else None
    
    # Extract district from address
    district = _extract_district(address)
    
    return PlaceItem(
        id=str(uuid.uuid4()),
        name=name,
        category=place_dict.get('Category'),
        address=address,
        district=district,
        price_min=place_dict.get('Price_min'),
        price_max=place_dict.get('Price_max'),
        score=place_dict.get('Score'),
        start_time=place_dict.get('Start'),
        end_time=place_dict.get('End'),
        url=place_dict.get('Url'),
        relevance_score=place_dict.get('Relevance_Score'),
        reason=place_dict.get('Reason'),
        lat=lat,
        lng=lng
    )


def _calculate_budget(hotels: List[PlaceItem], restaurants: List[PlaceItem]) -> Optional[float]:
    """Calculate estimated budget from hotel and dining prices."""
    total = 0.0
    
    for hotel in hotels:
        if hotel.price_min:
            total += hotel.price_min
    
    for restaurant in restaurants:
        if restaurant.price_min:
            total += restaurant.price_min
    
    return total if total > 0 else None


@router.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Nhận gợi ý địa điểm du lịch.
    
    Hệ thống sử dụng AI để gợi ý:
    - 1 Khách sạn phù hợp nhất
    - 2 Quán ăn địa phương
    - 3 Điểm tham quan
    
    Args:
        request: RecommendationRequest với query, districts, max_price
        
    Returns:
        RecommendationResponse với danh sách địa điểm và tọa độ
    """
    try:
        recommender = get_recommender()
        location_service = get_location_service()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    
    # Get recommendations from ML model
    result = recommender.recommend(
        user_query=request.query,
        districts=request.districts,
        max_price=request.max_price,
        verbose=True
    )
    
    # Convert to response format with coordinates
    hotels = [_convert_place_to_response(p, location_service) for p in result.get('hotels', [])]
    # Note: Backend returns 'dining' but frontend expects 'restaurants'
    restaurants = [_convert_place_to_response(p, location_service) for p in result.get('dining', [])]
    attractions = [_convert_place_to_response(p, location_service) for p in result.get('attractions', [])]
    
    total_places = len(hotels) + len(restaurants) + len(attractions)
    estimated_budget = _calculate_budget(hotels, restaurants)
    
    return RecommendationResponse(
        hotels=hotels,
        restaurants=restaurants,
        attractions=attractions,
        warning=result.get('warning'),
        total_places=total_places,
        estimated_budget=estimated_budget
    )


@router.get("/recommend", response_model=RecommendationResponse)
async def get_recommendations_get(
    query: str,
    districts: Optional[str] = None,
    max_price: Optional[float] = None
):
    """
    GET version of recommend endpoint.
    
    Districts should be comma-separated if multiple.
    Example: /api/recommend?query=khách sạn đẹp&districts=Quận 1,Quận 3&max_price=2000000
    """
    district_list = None
    if districts:
        district_list = [d.strip() for d in districts.split(',')]
    
    request = RecommendationRequest(
        query=query,
        districts=district_list,
        max_price=max_price
    )
    
    return await get_recommendations(request)

